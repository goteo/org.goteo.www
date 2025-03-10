import { z } from "zod";
import type { PageLoad } from "./$types";

const FundingItemSchema = z.object({
    amount: z.number().transform((num) => (!!num ? num / 100 : num)),
    label: z.string(),
    color: z.string(),
});

const FundingDataSchema = z.object({
    items: z.array(FundingItemSchema),
    current: z.number().transform((num) => (!!num ? num / 100 : num)),
});

const FundingGoalSchema = z.object({
    amount: z.number().transform((num) => (!!num ? num / 100 : num)),
    data: FundingDataSchema,
});

const MoneySchema = z.object({
    amount: z.number().transform((num) => (!!num ? num / 100 : num)),
    currency: z.string(),
});

const ProjectSchema = z.object({
    id: z.number(),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    territory: z.string(),
    owner: z.string(),
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
            id: z.number(),
            image: z.string(),
            header: z.string(),
            content: z.string(),
            donate: z.number().transform((num) => (!!num ? num / 100 : num)),
            donors: z.number(),
            units: z.number().optional(),
        }),
    ),
    budgets: z.array(
        z.object({
            type: z.string(),
            header: z.string(),
            content: z.string(),
            minimum: MoneySchema.optional(),
            optimum: MoneySchema.optional(),
        }),
    ),
});

export const load: PageLoad = async ({ fetch, params }) => {
    const res = await fetch(`/projects/${params.projectId}`);
    if (!res.ok) throw new Error("Failed to fetch project data");

    const json = await res.json();
    console.log(json);
    const parsed = ProjectSchema.safeParse(json);
    if (!parsed.success) {
        console.error(JSON.stringify(parsed.error));
        throw new Error("Failed to parse project data");
    }
    // console.debug(JSON.stringify(parsed.data, null, 2));
    const { campaign, locales, video, rewards, budgets, ...project } = parsed.data;
    return { campaign, locales, video, rewards, budgets, project };
};
