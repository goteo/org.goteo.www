import { json } from "@sveltejs/kit";

const mapProjectFromSample = (
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

export async function GET({ fetch, params }) {
  console.debug({ params });
  const project: typeof ProjectSample = await fetch(`https://v4.goteo.org/v4/projects/${params.projectId}`, {
    headers: {
      "content-type": "application/json",
      "accept-language": "en",
    },
  }).then((res) => res.json());
  console.debug({ project });

  const accounting: typeof AccountingSample = await fetch(`https://v4.goteo.org${project.accounting}`, {
    headers: {
      "content-type": "application/json",
      "accept-language": "en",
    },
  }).then((res) => res.json());
  console.debug({ accounting });

  const transactions: (typeof TransactionSample)[] = await fetch(
    `https://v4.goteo.org/v4/accounting_transactions?target=${project.accounting}`,
    {
      headers: {
        "content-type": "application/json",
        "accept-language": "en",
      },
    }
  ).then((res) => res.json());
  console.debug({ transactions });

  const payload = mapProjectFromSample(project, accounting, transactions);
  return json(payload);
}

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
