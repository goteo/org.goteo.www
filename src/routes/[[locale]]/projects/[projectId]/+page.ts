import { z } from "zod";
import type { PageLoad } from "./$types";

const MoneySchema = z
    .object({
        amount: z.number(),
        currency: z.string(),
    })
    .refine((data) => {
        const digits = currencyDigits[data.currency] || 100; // Default to 100 if currency not found
        data.amount = !!data.amount ? data.amount / digits : data.amount;
        return true;
    });

const FundingItemSchema = z.object({
    amount: MoneySchema,
    label: z.string(),
    color: z.string(),
});

const FundingDataSchema = z.object({
    items: z.array(FundingItemSchema),
    current: MoneySchema,
});

const FundingGoalSchema = z.object({
    amount: MoneySchema,
    data: FundingDataSchema,
});

const currencyDigits = {
    EUR: 100,
    USD: 100,
    // Add other currencies as needed
};

const ProjectSchema = z.object({
    id: z.number(),
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    category: z.string(),
    territory: z.string(),
    status: z.string(),
    owner: z.string(),
    campaign: z.object({
        minimum: FundingGoalSchema,
        optimum: FundingGoalSchema,
        obtained: MoneySchema,
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
            donate: MoneySchema,
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
