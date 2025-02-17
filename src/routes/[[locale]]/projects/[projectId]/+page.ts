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
    }),
  ),
  locales: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
    }),
  ),
});

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/projects/${params.projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project data");

  const json = await res.json();
  const parsed = ProjectSchema.safeParse(json);
  if (!parsed.success) throw new Error("Failed to parse project data");

  const { data: project } = parsed;
  return { project };
};
