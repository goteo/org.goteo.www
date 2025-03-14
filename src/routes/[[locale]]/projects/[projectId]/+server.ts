import { omitBy, isNil, isEmpty } from "lodash-es";
import { json } from "@sveltejs/kit";
import { locales } from "$lib/i18n";

import {
    type Accounting,
    type AccountingBalancePoint,
    type Project,
    type ProjectBudgetItem,
    type ProjectReward,
    type ProjectUpdate,
    type User,
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
    const owner = await getOwner(project);
    const updates = await getUpdates(project);

    const payload = map(
        project,
        accounting,
        transactions,
        balancePoints,
        rewards,
        budgets,
        owner,
        updates,
    );
    return json(payload);
}

const transformBudgetToFundingGoal = (
    budget: Record<string, { amount: number; currency: string }>,
    current: { amount: number; currency: string },
): FundingGoal => {
    const typeMapping = {
        infra: { type: "infrastructure", label: "Infraestructura", color: "bg-primary-foreground" },
        material: { type: "material", label: "Material", color: "bg-destructive" },
        task: { type: "task", label: "Tarea", color: "bg-primary" },
    };

    const items = Object.entries(budget)
        .filter(([key]) => Object.keys(typeMapping).includes(key))
        .map(([key, { amount, currency }]) => {
            const mappedType = typeMapping[key as keyof typeof typeMapping] || {
                type: key,
                label: key,
                color: "bg-muted",
            };

            return {
                amount: { amount, currency },
                label: mappedType.label,
                color: mappedType.color,
            };
        });

    return {
        amount: {
            amount: items.reduce((sum, item) => sum + item.amount.amount, 0),
            currency: current.currency,
        },
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
    owner: User,
    updates: Array<ProjectUpdate>,
) => {
    const obtained = accounting.balance;
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
                donate: money,
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

    const { id, title, subtitle, description, territory, category, status, calendar } = project;
    const territoryLabel = territory.subLvl2 || territory.subLvl1 || territory.country || "";

    let deadline = null;
    if (calendar) {
        if (project.deadline === "optimum") {
            // When deadline is "optimum", always count down to the minimum deadline first.
            const minimumDeadline = calendar["minimum"];
            const optimumDeadline = calendar["optimum"];
            const now = new Date();
            if (minimumDeadline) {
                if (new Date(minimumDeadline) > now) {
                    deadline = minimumDeadline;
                } else {
                    // After the minimum deadline has been surpassed, start watching the optimum deadline
                    // (if available), but fall back to the minimum if not.
                    deadline = optimumDeadline || minimumDeadline;
                }
            }
        } else {
            deadline = calendar[project.deadline] || null;
        }
    }

    // const updatesMap = [
    //     {
    //         date: new Date(Date.now()),
    //         title: "Hemos recibido una donación de 1000€ a la campaña ¡Muchas gracias!",
    //         subtitle:
    //             "Queremos expresarle nuestro más sincero agradecimiento por su increíble donación",
    //         description:
    //             "Cada euro aporta esperanza y oportunidades, y su apoyo demuestra un compromiso excepcional con nuestra causa. Sabemos que confiar en una organización es una decisión importante, y no tomamos su gesto a la ligera. Estamos comprometidos a usar estos fondos de manera transparente y eficiente, y estaremos encantados de mantenerle informado/a sobre los avances y logros alcanzados gracias a usted. Una vez más, ¡muchísimas gracias por ser parte de este cambio! Su solidaridad nos motiva a seguir trabajando con más fuerza y dedicación.",
    //     },
    //     {
    //         image: "https://placehold.co/256",
    //         date: new Date(Date.now()),
    //         title: "Esto es todo un apoyo",
    //         subtitle: "Donación superior a 2.500 euros a la campaña. ¡Super-agradecimiento!",
    //         description:
    //             "Llevamos años demostrando que otro mundo es posible. En esta plataforma, sin ir más lejos, tenemos todo un catálogo de iniciativas que demuestran que hay esperanza.",
    //     },
    //     {
    //         image: "https://placehold.co/256",
    //         date: new Date(Date.now()),
    //         title: "Quedan 7 días",
    //         subtitle:
    //             "Hablar de billones de dólares como meta global de financiación climática. Necesitar 220.500€ para contarlo.",
    //         description:
    //             "En Climática hablamos de la gran crisis que afecta a nuestra generación y las futuras y tratamos de hacerlo. Necesitamos tu ayuda para seguir adelante.",
    //     },
    // ];

    const updatesMap = updates.map(({ title, subtitle, body, cover, date }) => ({
        title,
        subtitle,
        description: body,
        image: cover,
        date,
    }));

    const data = {
        id,
        title,
        subtitle,
        description,
        deadline,
        status,
        category,
        territory: territoryLabel,
        owner: owner.displayName,
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
        updates: updatesMap,
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

const getOwner = async (project: Project): Promise<User> => {
    if (typeof project.owner === "undefined") {
        throw new Error("Project does not have an owner");
    }

    const { data, error } = await client.get<User>({
        url: client.buildUrl({ url: project.owner }),
    });

    if (error || typeof data === "undefined") {
        throw new Error("Failed to fetch project owner");
    }

    return data;
};

const getUpdates = async (project: Project): Promise<ProjectUpdate[]> => {
    const items = project.updates ?? [];
    const updates = (
        await Promise.all(
            items.map(async (item) => {
                const url = client.buildUrl({ url: item });
                const { data, error } = await client.get<ProjectUpdate>({
                    url: client.buildUrl({ url }),
                });
                return data;
            }),
        )
    ).filter((item): item is ProjectUpdate => item !== undefined);
    return updates;
};
