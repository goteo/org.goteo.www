import { json } from "@sveltejs/kit";
import { locales } from "$lib/i18n";

import {
  type Accounting,
  type AccountingBalancePoint,
  type Project,
  apiAccountingBalancePointsGetCollection,
  apiProjectsIdGet,
} from "$client";
import { client } from "$client/client.gen";

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

const map = (
  project: Project,
  accounting: Accounting,
  transactions: TransactionsData,
  balancePoints: Array<AccountingBalancePoint>,
  rewards: Array<typeof RewardSample>,
  budgets: Array<typeof BudgetSample>
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
    minimum: minimum.amount,
    optimum: optimum.amount,
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

  const { title, subtitle, description, territory } = project;
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
      minimum,
      optimum,
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

const getBudgetItems = async (project: Project): Promise<Array<typeof BudgetSample>> => {
  return BudgetItemsSample;
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

const BudgetItemsSample = [
  {
    id: 1,
    project: "https://api.goteo.org/v4/projects/1",
    type: "infrastructure",
    locales: ["en"],
    title: "Infraestructura - Servidores",
    description: "Investimento em servidores e infraestrutura de rede.",
    minimum: {
      amount: 1000,
      currency: "EUR",
    },
    optimum: {
      amount: 1500,
      currency: "EUR",
    },
  },
  {
    id: 2,
    project: "https://api.goteo.org/v4/projects/1",
    type: "infrastructure",
    locales: ["en"],
    title: "Infraestructura - Equipamentos de TI",
    description: "Compra de equipamentos e dispositivos para manutenção da rede.",
    minimum: {
      amount: 2000,
      currency: "EUR",
    },
    optimum: {
      amount: 2500,
      currency: "EUR",
    },
  },
  {
    id: 3,
    project: "https://api.goteo.org/v4/projects/1",
    type: "infrastructure",
    locales: ["en"],
    title: "Infraestructura - Backup e Segurança",
    description: "Soluções para backup de dados e segurança da informação.",
    minimum: {
      amount: 800,
      currency: "EUR",
    },
    optimum: {
      amount: 1200,
      currency: "EUR",
    },
  },
  {
    id: 4,
    project: "https://api.goteo.org/v4/projects/1",
    type: "infrastructure",
    locales: ["en"],
    title: "Infraestructura - Rede e Conectividade",
    description: "Atualização da infraestrutura de rede para maior conectividade.",
    minimum: {
      amount: 500,
      currency: "EUR",
    },
    optimum: {
      amount: 700,
      currency: "EUR",
    },
  },
  {
    id: 5,
    project: "https://api.goteo.org/v4/projects/1",
    type: "infrastructure",
    locales: ["en"],
    title: "Infraestructura - Energia Renovável",
    description: "Investimento em soluções de energia renovável para o data center.",
    minimum: {
      amount: 1500,
      currency: "EUR",
    },
    optimum: {
      amount: 1800,
      currency: "EUR",
    },
  },
  {
    id: 6,
    project: "https://api.goteo.org/v4/projects/1",
    type: "material",
    locales: ["en"],
    title: "Material - Suprimentos de Escritório",
    description: "Compra de materiais e suprimentos essenciais para o projeto.",
    minimum: {
      amount: 300,
      currency: "EUR",
    },
    optimum: {
      amount: 500,
      currency: "EUR",
    },
  },
  {
    id: 7,
    project: "https://api.goteo.org/v4/projects/1",
    type: "task",
    locales: ["en"],
    title: "Tarea - Desenvolvimento Web",
    description: "Horas destinadas ao desenvolvimento e implementação da plataforma.",
    minimum: {
      amount: 1000,
      currency: "EUR",
    },
    optimum: {
      amount: 1300,
      currency: "EUR",
    },
  },
  {
    id: 8,
    project: "https://api.goteo.org/v4/projects/1",
    type: "task",
    locales: ["en"],
    title: "Tarea - Design UI/UX",
    description: "Projeto de design para interfaces e experiência do usuário.",
    minimum: {
      amount: 800,
      currency: "EUR",
    },
    optimum: {
      amount: 1000,
      currency: "EUR",
    },
  },
  {
    id: 9,
    project: "https://api.goteo.org/v4/projects/1",
    type: "task",
    locales: ["en"],
    title: "Tarea - Testes e QA",
    description: "Testes de usabilidade e garantia de qualidade da plataforma.",
    minimum: {
      amount: 600,
      currency: "EUR",
    },
    optimum: {
      amount: 900,
      currency: "EUR",
    },
  },
];

const BudgetSample = BudgetItemsSample[0];
