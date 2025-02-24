import { json } from "@sveltejs/kit";
import { locales } from "$lib/i18n";

import {
  type Accounting,
  type AccountingBalancePoint,
  type Project,
  type ProjectBudgetItem,
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
  current: number
): FundingGoal => {
  const typeMapping = {
    infra: { type: "infrastructure", label: "Infraestructura", color: "bg-primary-foreground" },
    material: { type: "material", label: "Material", color: "bg-destructive" },
    task: { type: "task", label: "Tarea", color: "bg-primary" },
  };

  const items = Object.entries(budget)
    .filter(([key]) => Object.keys(typeMapping).includes(key))
    .map(([key, { amount }]) => {
      const mappedType = typeMapping[key as keyof typeof typeMapping] || { type: key, label: key, color: "bg-muted" };

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
  rewards: Array<typeof RewardSample>,
  budgets: Array<ProjectBudgetItem>
) => {
  const minimum = Object.values(project.budget?.minimum ?? {}).reduce((acc, { amount }) => acc + amount, 0);
  const optimum = Object.values(project.budget?.optimum ?? {}).reduce((acc, { amount }) => acc + amount, 0);
  const obtained = accounting.balance?.amount ?? 0;
  const donations = transactions.totalItems;

  const timeSeriesData = balancePoints.map(({ start, balance }) => ({
    date: new Date(start ?? ""),
    amount: balance?.amount ?? 0,
  }));

  const rewardsMap = rewards.map(({ id, title, description, money, hasUnits, unitsAvailable }) => ({
    id,
    image: "https://placehold.co/320x160",
    header: title,
    content: description,
    donate: money.amount,
    donors: 0,
    units: hasUnits ? unitsAvailable : null,
  }));

  const budgetItems = budgets.map(({ id, type, title, description, minimum, optimum }) => ({
    id,
    type,
    header: title,
    content: description,
    minimum: minimum?.amount,
    optimum: optimum?.amount,
  }));

  const projectLocales: Array<{ code: string; label: string }> =
    project.locales?.map((code) => ({
      code,
      ...locales[code],
    })) || [];

  const video = {
    title: project.title,
    src: project.videoEmbed?.src,
    poster: {
      src: project.videoEmbed?.thumbnail,
      alt: project.description,
    },
  };

  const { title, subtitle, description, territory, budget } = project;
  const territoryLabel = territory.subLvl2 || territory.subLvl1 || territory.country || "";

  return {
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

const getRewards = async (project: Project): Promise<Array<typeof RewardSample>> => {
  return RewardsSample;
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
      })
    )
  ).filter((item): item is ProjectBudgetItem => item !== undefined);
  return budgetItems;
};

const RewardsSample = [
  {
    id: 1,
    project: "https://api.goteo.org/v4/projects/1",
    title: "¡Gracias por coperar!",
    description:
      "La cooperativa de información Climática existe gracias a todas las personas que la apoyan. Ahora tú eres una de ellas. ¡Gracias! Incluiremos tu nombre en la lista de mecenas de nuestra web.",
    money: {
      amount: 5,
      currency: "EUR",
    },
    hasUnits: false,
    unitsTotal: 0,
    unitsAvailable: 0,
  },
  {
    id: 2,
    project: "https://api.goteo.org/v4/projects/1",
    title: "Pásate a la cooperacción",
    description:
      "¡Te damos la bienvenida a nuestra comunidad! Como recompensa, te llevas una suscripción Cooperante con la que recibirás el Magazine nº4 en formato digital ; el Magazine nº5 digital, que se publicará a partir de febrero 2025; y el acceso a las actividades de la comunidad Climática-.¡Recuerda que cada aportación tiene una desgravación fiscal entre el 35 y 80%! Calcula aquí: https://www.goteo.org/calculadora-fiscal",
    money: {
      amount: 10,
      currency: "EUR",
    },
    hasUnits: true,
    unitsTotal: 100000,
    unitsAvailable: 999000,
  },
  {
    id: 3,
    project: "https://api.goteo.org/v4/projects/1",
    title: "Apoya a la redacción",
    description:
      "La redacción de Climática es más libre gracias a ti. Podremos publicar más periodismo climático independiente y, para agradecértelo, recibirás una suscripción Cooperante -que incluye el Magazine nº4 en formato digital ; el Magazine nº5 digital, que se publicará a partir de febrero 2025; y el acceso a las actividades de la comunidad Climática-. También te mandaremos el gorro Climático para que te protejas de las inclemencias del tiempo.¡Recuerda que cada aportación tiene una desgravación fiscal entre el 35 y 80%! Calcula aquí: https://www.goteo.org/calculadora-fiscal",
    money: {
      amount: 30,
      currency: "EUR",
    },
    hasUnits: false,
    unitsTotal: 0,
    unitsAvailable: 0,
  },
  {
    id: 4,
    project: "https://api.goteo.org/v4/projects/1",
    title: "Sessão exclusiva com a equipe",
    description: "Participe de uma sessão de perguntas e respostas exclusiva com a equipe do projeto. Vagas limitadas.",
    money: {
      amount: 100,
      currency: "EUR",
    },
    hasUnits: true,
    unitsTotal: 20,
    unitsAvailable: 20,
  },
  {
    id: 5,
    project: "https://api.goteo.org/v4/projects/1",
    title: "Kit de brindes",
    description: "Kit contendo diversos brindes exclusivos do projeto.",
    money: {
      amount: 75,
      currency: "EUR",
    },
    hasUnits: true,
    unitsTotal: 50,
    unitsAvailable: 35,
  },
];

const RewardSample = RewardsSample[0];
