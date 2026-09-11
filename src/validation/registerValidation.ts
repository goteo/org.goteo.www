import { z } from "zod";

import { zUserUserSignupDto } from "../openapi/client/zod.gen";

const zRequiredField = () =>
    z.string().refine((value) => value.trim().length > 0, {
        error: "pages.checkout.register.form.validation.required",
    });

const zOrganizationFields = z.object({
    legalName: zRequiredField(),
    taxId: zRequiredField(),
});

export const zRegisterForm = zUserUserSignupDto
    .omit({ email: true })
    .extend({
        identifier: z.email({
            error: "pages.checkout.register.form.validation.emailInvalid",
        }),
        firstname: zRequiredField(),
        lastname: zRequiredField(),
        taxId: z.string().optional(),
        legalName: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        if (data.type !== "organization") {
            return;
        }

        const result = zOrganizationFields.safeParse({
            legalName: data.legalName,
            taxId: data.taxId,
        });

        if (!result.success) {
            for (const issue of result.error.issues) {
                ctx.addIssue({
                    ...issue,
                    path: [issue.path[0]!],
                });
            }
        }
    });
