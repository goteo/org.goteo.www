import { json } from "@sveltejs/kit";
import { env } from '$env/dynamic/private';

export async function GET({ fetch, params }) {
  const fetcher = service(fetch);

  const project = await fetcher.getProject(params.projectId);
  const accounting = await fetcher.getAccounting(project);
  const transactions = await fetcher.getTransactions(project);

  const payload = map(project, accounting, transactions);
  return json(payload);
}

const map = (
  project: typeof ProjectSample,
  accounting: typeof AccountingSample,
  transactions: Array<typeof TransactionSample>
) => {
  const minimum = Object.values(project.budget.minimum).reduce((acc, { amount }) => acc + amount, 0);
  const optimum = Object.values(project.budget.optimum).reduce((acc, { amount }) => acc + amount, 0);
  const obtained = accounting.balance.amount;
  const donations = transactions.reduce((acc, { money }) => acc + money.amount, 0);
  const timeSeriesData = [];

  return { minimum, optimum, obtained, donations, timeSeriesData };
};

const service = (fetcher: typeof fetch) => {
  const headers = {
    "content-type": "application/json",
    "accept-language": "en",
  };

  const getProject = async (id: string): Promise<typeof ProjectSample> => {
    const res = await fetcher(`${env.API_BASE_URL}/v4/projects/${id}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch project data");

    const json = await res.json();
    return json;
  };

  const getAccounting = async (project: typeof ProjectSample): Promise<typeof AccountingSample> => {
    const res = await fetcher(`${env.API_BASE_URL}${project.accounting}`, { headers });
    if (!res.ok) throw new Error("Failed to fetch accounting data");

    const json = await res.json();
    return json;
  };

  const getTransactions = async (project: typeof ProjectSample): Promise<Array<typeof TransactionSample>> => {
    const res = await fetcher(`${env.API_BASE_URL}/v4/accounting_transactions?target=${project.accounting}`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch transactions data");

    const json = await res.json();
    return json;
  };

  return { getProject, getAccounting, getTransactions };
};

const ProjectSample = {
  accounting: "/v4/accountings/4",
  budget: {
    minimum: {
      infra: {
        amount: 1,
        currency: "EUR",
      },
      material: {
        amount: 1,
        currency: "EUR",
      },
      money: {
        amount: 1,
        currency: "EUR",
      },
      task: {
        amount: 1,
        currency: "EUR",
      },
    },
    optimum: {
      infra: {
        amount: 1,
        currency: "EUR",
      },
      material: {
        amount: 1,
        currency: "EUR",
      },
      money: {
        amount: 1,
        currency: "EUR",
      },
      task: {
        amount: 1,
        currency: "EUR",
      },
    },
  },
  budgetItems: [],
  description: "Test Project",
  id: 1,
  locales: ["en"],
  owner: "/v4/users/3",
  rewards: [],
  status: "in_editing",
  subtitle: "Test Project",
  territory: {
    country: "ES",
  },
  title: "Test Project",
  videoEmbed: {
    src: "",
    thumbnail: "",
  },
};

const AccountingSample = {
  id: 4,
  currency: "EUR",
  balance: { amount: 4585, currency: "EUR" },
  owner: "/v4/projects/1",
};

const TransactionSample = {
  id: 10,
  money: {
    amount: 729,
    currency: "EUR",
  },
  origin: "/v4/accountings/3",
  target: "/v4/accountings/4",
};
