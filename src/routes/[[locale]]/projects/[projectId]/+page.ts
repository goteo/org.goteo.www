import { z } from "zod";
import type { PageLoad } from "./$types";

const ProjectSchema = z.object({
  obtained: z.number(),
  optimum: z.number(),
  donations: z.number(),
  minimum: z.number(),
  timeSeriesData: z.array(
    z.object({
      date: z.coerce.date(),
      amount: z.number(),
    })
  ),
});

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("Failed to fetch project data");

  const json = await res.json();
  const parsed = ProjectSchema.safeParse(json);
  if (!parsed.success) throw new Error("Failed to parse project data");

  const { data: project } = parsed;
  return { project };
};
