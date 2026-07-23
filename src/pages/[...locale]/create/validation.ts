import { z } from "zod";

const territorySchema = z
    .object({
        country: z.string().nullable().optional(),
        subLvl1: z.string().nullable().optional(),
        subLvl2: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
    })
    .refine(
        (t) => !!(t.country || t.subLvl1 || t.subLvl2),
        "validation.project.territory.required",
    );

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
        .min(1, "system.validation.project.title.required")
        .regex(/^(.*[a-zA-Z]{1,}.*)$/, "system.validation.project.title.pattern"),

    /**
     * Project subtitle - required field.
     */
    subtitle: z.string().min(1, "system.validation.project.subtitle.required"),

    /**
     * Project categories - array with minimum 1 and maximum 2 items.
     */
    categories: z
        .array(z.string())
        .min(1, "system.validation.project.categories.min")
        .max(2, "system.validation.project.categories.max"),

    /**
     * Release date - must be at least 14 days from now.
     * Defaults to 28 days from now.
     * Accepts both Date objects and date strings (from HTML date inputs).
     */
    release: z
        .union([z.date(), z.string()])
        .transform((val) => {
            if (typeof val === "string") {
                return new Date(val);
            }
            return val;
        })
        .refine(
            (date) => {
                const minDate = new Date();
                minDate.setDate(minDate.getDate() + 14);
                minDate.setHours(0, 0, 0, 0);

                const normalizedDate = new Date(date);
                normalizedDate.setHours(0, 0, 0, 0);

                return normalizedDate >= minDate;
            },
            { message: "system.validation.project.release.min" },
        )
        .default(() => {
            const defaultDate = new Date();
            defaultDate.setDate(defaultDate.getDate() + 28);
            return defaultDate;
        }),

    /**
     * Project budget - optional field for display purposes.
     * Not required for form submission but included for type consistency.
     */
    budget: z.number().nonnegative().optional().default(0),

    /**
     * Plain-text address for the project location.
     */
    address: z.string().min(1, "validation.project.address.required"),

    /**
     * ISO 3166 territory data derived from the selected address.
     */
    territory: territorySchema,
});

/**
 * TypeScript type inferred from the validation schema.
 * Use this type for type-safe form data handling.
 */
export type ProjectCreationFormData = z.infer<typeof projectCreationSchema>;
