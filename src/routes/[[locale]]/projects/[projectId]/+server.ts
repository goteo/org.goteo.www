import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export async function GET({ fetch, params }) {
  const fetcher = service(fetch);

  const project = await fetcher.getProject(params.projectId);
  const accounting = await fetcher.getAccounting(project);
  const transactions = await fetcher.getTransactions(project);
  const balancePoints = await fetcher.getAccountingBalancePoints(accounting);
  const rewards = await fetcher.getRewards(project);

  const payload = map(project, accounting, transactions, balancePoints, rewards);
  return json(payload);
}

const map = (
  project: typeof ProjectSample,
  accounting: typeof AccountingSample,
  transactions: Array<typeof TransactionSample>,
  balancePoints: Array<typeof AccountingBalancePointSample>,
  rewards: Array<typeof RewardSample>,
) => {
  const minimum = Object.values(project.budget.minimum).reduce((acc, { amount }) => acc + amount, 0);
  const optimum = Object.values(project.budget.optimum).reduce((acc, { amount }) => acc + amount, 0);
  const obtained = accounting.balance.amount;
  const donations = transactions.reduce((acc, { money }) => acc + money.amount, 0);
  const timeSeriesData = balancePoints.map(({ start, balance }) => ({ date: start, amount: balance.amount }));
  const rewardsMap = rewards.map(({ id, title, description, money, hasUnits, unitsAvailable }) => ({
    id,
    image: "https://placehold.co/320x160",
    header: title,
    content: description,
    donate: money.amount,
    donors: 0,
    units: hasUnits ? unitsAvailable : null,
  }));

  const projectLocales: Array<{ code: string; label: string }> = project.locales.map((code) => ({
    code,
    ...locales[code],
  }));

  const video = {
    title: project.title,
    src: project.videoEmbed.src,
    poster: {
      src: project.videoEmbed.thumbnail,
      alt: project.description,
    },
  };

  return {
    campaign: {
      minimum,
      optimum,
      obtained,
      donations,
      timeSeriesData,
    },
    rewards: rewardsMap,
    locales: projectLocales,
    video,
  };
};

const locales: Record<string, { label: string }> = {
  en: { label: "English" },
  es: { label: "Español" },
  ca: { label: "Català" },
};

const service = (fetcher: typeof fetch) => {
  const mock = true;
  const headers = {
    "content-type": "application/json",
    "accept-language": "en",
  };

  const getProject = async (id: string): Promise<typeof ProjectSample> => {
    if (mock) return ProjectSample;

    const res = await fetcher(`${env.API_BASE_URL}/v4/projects/${id}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch project data");

    const json = await res.json();
    return json;
  };

  const getAccounting = async (project: typeof ProjectSample): Promise<typeof AccountingSample> => {
    if (mock) return AccountingSample;

    const res = await fetcher(`${env.API_BASE_URL}${project.accounting}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch accounting data");

    const json = await res.json();
    return json;
  };

  const getTransactions = async (project: typeof ProjectSample): Promise<Array<typeof TransactionSample>> => {
    if (mock) return TransactionsSample;

    const res = await fetcher(`${env.API_BASE_URL}/v4/accounting_transactions?target=${project.accounting}`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch transactions data");

    const json = await res.json();
    return json;
  };

  const getAccountingBalancePoints = async (accounting: typeof AccountingSample) => {
    if (mock) return AccountingBalancePointsSample;

    const res = await fetcher(
      `${env.API_BASE_URL}/v4/accounting_balance_points?accounting=/v4/accountings/${accounting.id}`,
      {
        headers,
      },
    );
    if (!res.ok) throw new Error("Failed to fetch accounting balance points data");

    const json = await res.json();
    return json;
  };

  const getRewards = async (project: typeof ProjectSample): Promise<Array<typeof RewardSample>> => {
    if (mock) return RewardsSample;

    const res = await fetcher(`${env.API_BASE_URL}/v4/project_rewards`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch transactions data");

    const json = await res.json();
    return json;
  };

  return {
    getProject,
    getAccounting,
    getTransactions,
    getAccountingBalancePoints,
    getRewards,
  };
};

const ProjectSample = {
  id: 1,
  title: "Plataforma de Educação Digital",
  subtitle: "Transformando a educação",
  description: "Um projeto inovador para educação digital",
  status: "active",
  locales: ["en", "es"],
  owner: "/v4/users/2",
  accounting: "/v4/accountings/1",
  territory: {
    country: "ES",
    region: "Cataluña",
  },
  budget: {
    minimum: {
      infra: {
        amount: 5000,
        currency: "EUR",
      },
      material: {
        amount: 3000,
        currency: "EUR",
      },
      money: {
        amount: 10000,
        currency: "EUR",
      },
      task: {
        amount: 2000,
        currency: "EUR",
      },
    },
    optimum: {
      infra: {
        amount: 8000,
        currency: "EUR",
      },
      material: {
        amount: 5000,
        currency: "EUR",
      },
      money: {
        amount: 15000,
        currency: "EUR",
      },
      task: {
        amount: 3000,
        currency: "EUR",
      },
    },
  },
  budgetItems: [
    {
      id: 1,
      description: "Câmeras para gravação",
      amount: 2000,
      currency: "EUR",
    },
    {
      id: 2,
      description: "Aluguel do espaço",
      amount: 1500,
      currency: "EUR",
    },
  ],
  rewards: [
    {
      id: 1,
      description: "Agradecimento público no site",
      amount: 20,
      currency: "EUR",
    },
    {
      id: 2,
      description: "Camiseta exclusiva do projeto",
      amount: 50,
      currency: "EUR",
    },
  ],
  videoEmbed: {
    src: "https://files.vidstack.io/sprite-fight/720p.mp4",
    thumbnail: "https://files.vidstack.io/sprite-fight/poster.webp",
  },
};

const AccountingSample = {
  id: 1,
  currency: "EUR",
  balance: {
    amount: 12500,
    currency: "EUR",
  },
  owner: "/v4/projects/1",
};

const TransactionsSample = [
  {
    id: 101,
    money: {
      amount: 500,
      currency: "EUR",
    },
    origin: "/v4/accountings/2",
    target: "/v4/accountings/1",
  },
  {
    id: 102,
    money: {
      amount: 1200,
      currency: "EUR",
    },
    origin: "/v4/accountings/3",
    target: "/v4/accountings/1",
  },
  {
    id: 103,
    money: {
      amount: 300,
      currency: "EUR",
    },
    origin: "/v4/accountings/4",
    target: "/v4/accountings/1",
  },
  {
    id: 104,
    money: {
      amount: 2500,
      currency: "EUR",
    },
    origin: "/v4/accountings/5",
    target: "/v4/accountings/1",
  },
  {
    id: 105,
    money: {
      amount: 1000,
      currency: "EUR",
    },
    origin: "/v4/accountings/6",
    target: "/v4/accountings/1",
  },
];

const TransactionSample = TransactionsSample[0];

const AccountingBalancePointsSample = [
  {
    id: 1,
    accounting: "/v4/accountings/1",
    start: "2024-02-01T00:00:00Z",
    end: "2024-02-02T00:00:00Z",
    interval: "24h",
    balance: {
      amount: 500,
      currency: "EUR",
    },
  },
  {
    id: 2,
    accounting: "/v4/accountings/1",
    start: "2024-02-02T00:00:00Z",
    end: "2024-02-03T00:00:00Z",
    interval: "24h",
    balance: {
      amount: 1700,
      currency: "EUR",
    },
  },
  {
    id: 3,
    accounting: "/v4/accountings/1",
    start: "2024-02-03T00:00:00Z",
    end: "2024-02-04T00:00:00Z",
    interval: "24h",
    balance: {
      amount: 2000,
      currency: "EUR",
    },
  },
  {
    id: 4,
    accounting: "/v4/accountings/1",
    start: "2024-02-04T00:00:00Z",
    end: "2024-02-05T00:00:00Z",
    interval: "24h",
    balance: {
      amount: 4500,
      currency: "EUR",
    },
  },
  {
    id: 5,
    accounting: "/v4/accountings/1",
    start: "2024-02-05T00:00:00Z",
    end: "2024-02-06T00:00:00Z",
    interval: "24h",
    balance: {
      amount: 5500,
      currency: "EUR",
    },
  },
];

const AccountingBalancePointSample = AccountingBalancePointsSample[0];

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
