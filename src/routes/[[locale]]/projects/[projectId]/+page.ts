import { z } from "zod";
import type { PageLoad } from "./$types";

const FundingItemSchema = z.object({
  amount: z.number(),
  label: z.string(),
  color: z.string(),
});

const FundingDataSchema = z.object({
  items: z.array(FundingItemSchema),
  current: z.number(),
});

const FundingGoalSchema = z.object({
  amount: z.number(),
  data: FundingDataSchema,
});

const ProjectSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  territory: z.string(),
  campaign: z.object({
    minimum: FundingGoalSchema,
    optimum: FundingGoalSchema,
    obtained: z.number(),
    donations: z.number(),
    timeSeriesData: z.array(
      z.object({
        date: z.coerce.date(),
        amount: z.number(),
      }),
    ),
  }),
  locales: z.array(
    z.object({
      code: z.string(),
      label: z.string(),
    }),
  ),
  video: z.object({
    src: z.string(),
    title: z.string(),
    thumbnails: z.string().optional(),
    poster: z.object({
      src: z.string(),
      alt: z.string(),
    }),
  }),
  rewards: z.array(
    z.object({
      image: z.string(),
      header: z.string(),
      content: z.string(),
      donate: z.number(),
      donors: z.number(),
      units: z.number().nullable(),
    }),
  ),
  budgets: z.array(
    z.object({
      type: z.string(),
      header: z.string(),
      content: z.string(),
      minimum: z.number(),
      optimum: z.number(),
    }),
  ),
});

export const load: PageLoad = async ({ fetch, params }) => {
  const res = await fetch(`/projects/${params.projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project data");

  const json = await res.json();
  const parsed = ProjectSchema.safeParse(json);
  if (!parsed.success) {
    console.error(JSON.stringify(parsed.error));
    throw new Error("Failed to parse project data");
  }
  // console.debug(JSON.stringify(parsed.data, null, 2));
  const { campaign, locales, video, rewards, budgets, ...project } = parsed.data;
  return { campaign, locales, video, rewards, budgets, project };
};
