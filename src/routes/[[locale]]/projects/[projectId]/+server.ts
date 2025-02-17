import { json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export async function GET({ fetch, params }) {
  const fetcher = service(fetch);

  const project = await fetcher.getProject(params.projectId);
  const accounting = await fetcher.getAccounting(project);
  const transactions = await fetcher.getTransactions(project);
  const balancePoints = await fetcher.getAccountingBalancePoints(accounting);

  const payload = map(project, accounting, transactions, balancePoints);
  return json(payload);
}

const map = (
  project: typeof ProjectSample,
  accounting: typeof AccountingSample,
  transactions: Array<typeof TransactionSample>,
  balancePoints: Array<typeof AccountingBalancePointSample>,
) => {
  const minimum = Object.values(project.budget.minimum).reduce((acc, { amount }) => acc + amount, 0);
  const optimum = Object.values(project.budget.optimum).reduce((acc, { amount }) => acc + amount, 0);
  const obtained = accounting.balance.amount;
  const donations = transactions.reduce((acc, { money }) => acc + money.amount, 0);
  const timeSeriesData = balancePoints.map(({ start, balance }) => ({ date: start, amount: balance.amount }));
  const projectLocales: Array<{ code: string; label: string }> = project.locales.map((code) => ({
    code,
    ...locales[code],
  }));

  return {
    minimum,
    optimum,
    obtained,
    donations,
    timeSeriesData,
    locales: projectLocales,
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

  return { getProject, getAccounting, getTransactions, getAccountingBalancePoints };
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
    src: "https://www.youtube.com/embed/example",
    thumbnail: "https://example.com/thumbnail.jpg",
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
