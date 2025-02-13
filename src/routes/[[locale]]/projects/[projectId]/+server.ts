import { json } from "@sveltejs/kit";

export async function GET({ params }) {
  console.debug({ params });
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return json({
    obtained: 150547,
    optimum: 300000,
    donations: 2128,
    minimum: 100000,
    timeSeriesData: [
      { date: new Date("2024-01-01"), amount: 50000 },
      { date: new Date("2024-02-01"), amount: 75000 },
      { date: new Date("2024-03-01"), amount: 100000 },
      { date: new Date("2024-04-01"), amount: 150000 },
      { date: new Date("2024-05-01"), amount: 200000 },
    ],
  });
}
