import { zProjectProjectCreationDto } from "../openapi/client/zod.gen";
import { CAMPAIGN_MAX_END_DATE, CAMPAIGN_MIN_START_DATE } from "../utils/dates";
import { z } from "zod";

export const zProjectCampaignRelease = z.date()
    .refine(
        (release) => release > CAMPAIGN_MIN_START_DATE,
        { error: "system.validation.project.release.min", params: { min: CAMPAIGN_MIN_START_DATE } }
    )
    .refine(
        (release) => !CAMPAIGN_MAX_END_DATE || release < CAMPAIGN_MAX_END_DATE,
        { error: "system.validation.project.release.max", params: { max: CAMPAIGN_MAX_END_DATE } }
    );

export const zCreateProjectForm = zProjectProjectCreationDto.superRefine((form, ctx) => {
    if (!form.calendar?.release) {
        return;
    }

    const result = zProjectCampaignRelease.safeParse(
        new Date(form.calendar.release)
    );

    if (!result.success) {
        for (const issue of result.error.issues) {
            ctx.addIssue({
                ...issue,
                path: ["calendar"],
            });
        }
    }
});