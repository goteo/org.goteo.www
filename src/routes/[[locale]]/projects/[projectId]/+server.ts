import { omitBy, isNil, isEmpty } from "lodash-es";
import { json } from "@sveltejs/kit";
import { locales } from "$lib/i18n";

import {
    type Accounting,
    type AccountingBalancePoint,
    type Project,
    type ProjectBudgetItem,
    type ProjectReward,
    apiAccountingBalancePointsGetCollection,
    apiProjectsIdGet,
} from "$client";
import { client } from "$client/client.gen";
import type { FundingGoal } from "$lib/components/FundingChart/types";

export async function GET({ params }) {
    const project = await getProject(params.projectId);
    const accounting = await getAccounting(project);
    const transactions = await getTransactions(project);
    const balancePoints = await getBalancePoints(project);
    const rewards = await getRewards(project);
    const budgets = await getBudgetItems(project);

    const payload = map(project, accounting, transactions, balancePoints, rewards, budgets);
    return json(payload);
}

const transformBudgetToFundingGoal = (
    budget: Record<string, { amount: number; currency: string }>,
    current: number,
): FundingGoal => {
    const typeMapping = {
        infra: { type: "infrastructure", label: "Infraestructura", color: "bg-primary-foreground" },
        material: { type: "material", label: "Material", color: "bg-destructive" },
        task: { type: "task", label: "Tarea", color: "bg-primary" },
    };

    const items = Object.entries(budget)
        .filter(([key]) => Object.keys(typeMapping).includes(key))
        .map(([key, { amount }]) => {
            const mappedType = typeMapping[key as keyof typeof typeMapping] || {
                type: key,
                label: key,
                color: "bg-muted",
            };

            return {
                amount,
                label: mappedType.label,
                color: mappedType.color,
            };
        });

    return {
        amount: items.reduce((sum, item) => sum + item.amount, 0),
        data: {
            items,
            current,
        },
    };
};

const map = (
    project: Project,
    accounting: Accounting,
    transactions: TransactionsData,
    balancePoints: Array<AccountingBalancePoint>,
    rewards: Array<ProjectReward>,
    budgets: Array<ProjectBudgetItem>,
) => {
    const obtained = accounting.balance?.amount ?? 0;
    const donations = transactions.totalItems;

    const timeSeriesData = balancePoints.map(({ start, balance }) => ({
        date: new Date(start ?? ""),
        amount: balance?.amount ?? 0,
    }));

    const rewardsMap = rewards.map(
        ({ id, title, description, money, hasUnits, unitsAvailable }) => {
            const data = {
                id,
                image: "https://placehold.co/320x160",
                header: title,
                content: description,
                donate: money.amount,
                donors: 0,
                units: hasUnits ? unitsAvailable : null,
            };
            return omitBy(data, isNil);
        },
    );

    const budgetItems = budgets.map(({ id, type, title, description, minimum, optimum }) => {
        const data = {
            id,
            type,
            header: title,
            content: description,
            minimum,
            optimum,
        };
        return omitBy(data, isEmpty);
    });

    const projectLocales: Array<{ code: string; label: string }> =
        project.locales?.map((code) => ({
            code,
            ...locales[code],
        })) || [];

    const video = {
        title: project.title,
        src: project.video?.src,
        poster: {
            src: project.video?.thumbnail,
            alt: project.description,
        },
    };

    const { id, title, subtitle, description, territory } = project;
    const territoryLabel = territory.subLvl2 || territory.subLvl1 || territory.country || "";

    const data = {
        id,
        title,
        subtitle,
        description,
        territory: territoryLabel,
        video,
        rewards: rewardsMap,
        budgets: budgetItems,
        locales: projectLocales,
        campaign: {
            minimum: transformBudgetToFundingGoal(project.budget?.minimum ?? {}, obtained),
            optimum: transformBudgetToFundingGoal(project.budget?.optimum ?? {}, obtained),
            obtained,
            donations,
            timeSeriesData,
        },
    };

    return data;
};

const getProject = async (projectId: string): Promise<Project> => {
    const { data, error } = await apiProjectsIdGet({ path: { id: projectId } });

    if (error || typeof data === "undefined") {
        throw new Error("Failed to fetch project data");
    }

    return data;
};

const getAccounting = async (project: Project): Promise<Accounting> => {
    if (typeof project.accounting === "undefined") {
        throw new Error("Project does not have an accounting");
    }

    const { data, error } = await client.get<Accounting>({
        url: client.buildUrl({ url: project.accounting }),
    });

    if (error || typeof data === "undefined") {
        throw new Error("Failed to fetch project accounting");
    }

    return data;
};

interface TransactionsData {
    totalItems: number;
}

const getTransactions = async (project: Project): Promise<TransactionsData> => {
    if (typeof project.accounting === "undefined") {
        throw new Error("Project does not have an accounting");
    }

    const url = client.buildUrl({
        url: "/v4/accounting_transactions",
        query: { target: project.accounting },
    });

    const { data, error } = await client.get<TransactionsData>({
        headers: { Accept: "application/ld+json" },
        url: url,
    });

    if (error || typeof data === "undefined") {
        throw new Error("Failed to fetch project transactions");
    }

    return data;
};

const getBalancePoints = async (project: Project): Promise<AccountingBalancePoint[]> => {
    if (typeof project.accounting === "undefined") {
        throw new Error("Project does not have an accounting");
    }

    // TO-DO: MODIFY TO PROJECT'S START DATE
    const start = new Date();
    start.setDate(start.getDate() - 1);

    const { data, error } = await apiAccountingBalancePointsGetCollection({
        query: {
            accounting: project.accounting,
            start: start.toISOString(),
        },
    });

    if (error || typeof data === "undefined") {
        throw new Error("Failed to fetch project accounting balance data");
    }

    return data;
};

const getRewards = async (project: Project): Promise<ProjectReward[]> => {
    const items = project.rewards ?? [];
    const rewards = (
        await Promise.all(
            items.map(async (item) => {
                const url = client.buildUrl({ url: item });
                const { data, error } = await client.get<ProjectReward>({
                    url: client.buildUrl({ url }),
                });
                return data;
            }),
        )
    ).filter((item): item is ProjectReward => item !== undefined);
    return rewards;
};

const getBudgetItems = async (project: Project): Promise<ProjectBudgetItem[]> => {
    const items = project.budgetItems ?? [];
    const budgetItems = (
        await Promise.all(
            items.map(async (item) => {
                const url = client.buildUrl({ url: item });
                const { data, error } = await client.get<ProjectBudgetItem>({
                    url: client.buildUrl({ url }),
                });
                return data;
            }),
        )
    ).filter((item): item is ProjectBudgetItem => item !== undefined);
    return budgetItems;
};
