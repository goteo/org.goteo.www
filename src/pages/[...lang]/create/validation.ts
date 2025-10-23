import { z } from "zod";

/**
 * Validation schema for project creation form.
 * Mirrors backend validation rules from Project.ProjectCreationDto.
 *
 * @see src/openapi/openapi.json - Project.ProjectCreationDto schema
 */
export const projectCreationSchema = z.object({
    /**
     * Project title - required field that must contain at least one letter.
     * Pattern: ^(.*[a-zA-Z]{1,}.*)$
     */
    title: z
        .string()
        .min(1, "validation.project.title.required")
        .regex(/^(.*[a-zA-Z]{1,}.*)$/, "validation.project.title.pattern"),

    /**
     * Project subtitle - required field.
     */
    subtitle: z.string().min(1, "validation.project.subtitle.required"),

    /**
     * Project categories - array with minimum 1 and maximum 2 items.
     */
    categories: z
        .array(z.string())
        .min(1, "validation.project.categories.min")
        .max(2, "validation.project.categories.max"),

    /**
     * Release date - must be at least 14 days from now.
     * Defaults to 28 days from now.
     * Accepts both Date objects and date strings (from HTML date inputs).
     */
    release: z
        .union([z.date(), z.string()])
        .transform((val) => {
            if (typeof val === "string") {
                // HTML date input returns YYYY-MM-DD string
                return new Date(val);
            }
            return val;
        })
        .refine(
            (date) => {
                // Create minimum date (14 days from now at start of day)
                const minDate = new Date();
                minDate.setDate(minDate.getDate() + 14);
                minDate.setHours(0, 0, 0, 0);

                // Create a copy of the input date to avoid mutation
                const normalizedDate = new Date(date);
                normalizedDate.setHours(0, 0, 0, 0);

                return normalizedDate >= minDate;
            },
            { message: "validation.project.release.min" },
        )
        .default(() => {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 28);
            return defaultDate;
        }),
});

/**
 * TypeScript type inferred from the validation schema.
 * Use this type for type-safe form data handling.
 */
export type ProjectCreationFormData = z.infer<typeof projectCreationSchema>;
