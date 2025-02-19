import type { PageLoad } from "./$types";
import { apiAccountingBalancePointsGetCollection, apiProjectsIdGet, type Accounting, type AccountingBalancePoint, type Project } from "../../../../client";
import { client } from "../../../../client/client.gen";
import { locales } from "$lib/i18n";

const getProject = async (projectId: string): Promise<Project> => {
  const { data, error } = await apiProjectsIdGet({ path: { id: projectId } });

  if (error || typeof data === "undefined") {
    throw new Error("Failed to fetch project data");
  }

  return data;
}

const getAccounting = async (project: Project): Promise<Accounting> => {
  if (typeof project.accounting === "undefined") {
    throw new Error("Project does not have an accounting");
  }

  const { data, error } = await client.get<Accounting>({
    url: client.buildUrl({ url: project.accounting })
  });

  if (error || typeof data === "undefined") {
    throw new Error("Failed to fetch project accounting");
  }

  return data;
}

interface TransactionsData {
  totalItems: number
}

const getTransactions = async (project: Project): Promise<TransactionsData> => {
  if (typeof project.accounting === "undefined") {
    throw new Error("Project does not have an accounting");
  }

  const url = client.buildUrl({
    url: '/v4/accounting_transactions',
    query: { target: project.accounting }
  });

  const { data, error } = await client.get<TransactionsData>({
    headers: { 'Accept': 'application/ld+json' },
    url: url
  });

  if (error || typeof data === "undefined") {
    throw new Error("Failed to fetch project transactions");
  }

  return data;
}

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
      start: start.toISOString()
    }
  });

  if (error || typeof data === "undefined") {
    throw new Error("Failed to fetch project accounting balance data");
  }
  
  return data;
}

const map = (
  project: Project,
  accounting: Accounting,
  transactions: TransactionsData,
  balancePoints: Array<AccountingBalancePoint>
) => {
  const minimum = Object.values(project.budget?.minimum ?? {}).reduce((acc, { amount }) => acc + amount, 0);
  const optimum = Object.values(project.budget?.optimum ?? {}).reduce((acc, { amount }) => acc + amount, 0);
  const obtained = accounting.balance?.amount ?? 0;
  const donations = transactions.totalItems;
  const timeSeriesData = balancePoints.map(({ start, balance }) => ({ date: new Date(start ?? ''), amount: balance?.amount ?? 0 }));
  const projectLocales: Array<{ code: string; label: string }> = project.locales?.map((code) => ({
    code,
    ...locales[code],
  })) ?? [];

  return {
    minimum,
    optimum,
    obtained,
    donations,
    timeSeriesData,
    locales: projectLocales,
  };
};

export const load: PageLoad = async ({ params }) => {
  const project = await getProject(params.projectId);
  const accounting = await getAccounting(project);
  const transactions = await getTransactions(project);
  const balancePoints = await getBalancePoints(project);

  const extra = map(project, accounting, transactions, balancePoints);

  return { project, extra };
};
