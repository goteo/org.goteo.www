import { derived, writable, get } from "svelte/store";
import { z } from "zod";

import { projectCreationSchema } from "./validation";

export interface ProjectDraft {
    title: string;
    subtitle: string;
    categories: string[];
    budget: number;
    release: Date;
}

// Default release date: 28 days from now
const getDefaultReleaseDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 28);
    return date;
};

export const draft = writable<ProjectDraft>({
    title: "",
    subtitle: "",
    categories: [],
    budget: 0, // Budget is displayed but not validated
    release: getDefaultReleaseDate(),
});

/**
 * Validation errors store.
 * Maps field names to their error messages (translation keys).
 */
export const validationErrors = writable<Record<string, string>>({});

/**
 * Tracks which fields have been touched (blurred).
 * Only touched fields will show validation errors.
 */
export const touchedFields = writable<Set<string>>(new Set());

/**
 * Derived store that indicates if the form is valid.
 * Returns true only when:
 * 1. All required fields have values
 * 2. There are no validation errors
 */
export const isFormValid = derived([draft, validationErrors], ([$draft, $errors]) => {
    // Check if there are any validation errors
    if (Object.keys($errors).length > 0) {
        return false;
    }

    // Check that required fields have values
    const hasTitle = $draft.title.trim().length > 0;
    const hasSubtitle = $draft.subtitle.trim().length > 0;
    const hasCategories = $draft.categories.length > 0;

    return hasTitle && hasSubtitle && hasCategories;
});

/**
 * Validates a single field and updates the validation errors store.
 * Uses Zod's type system properly to avoid unsafe type assertions.
 * @param fieldName - The name of the field to validate
 * @param value - The current value of the field
 */
export function validateField(fieldName: keyof ProjectDraft, value: unknown) {
    // Get the field schema from the Zod schema
    // Type assertion needed because budget exists in ProjectDraft but not in schema
    const fieldSchema =
        projectCreationSchema.shape[fieldName as keyof typeof projectCreationSchema.shape];

    if (!fieldSchema) {
        // Budget field has no validation schema, silently skip
        return;
    }

    // Use Zod's ZodTypeAny for proper type handling
    const result = (fieldSchema as z.ZodTypeAny).safeParse(value);

    validationErrors.update((errors) => {
        if (!result.success) {
            // Extract the first error message
            const errorMessage = result.error.issues[0]?.message || "";
            return { ...errors, [fieldName]: errorMessage };
        } else {
            // Remove error if validation passes
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { [fieldName]: _, ...rest } = errors;
            return rest;
        }
    });
}

/**
 * Validates the entire form and updates the validation errors store.
 * Uses get() helper to avoid manual subscription management.
 * Returns true if the form is valid, false otherwise.
 */
export function validateForm(): boolean {
    const currentDraft = get(draft);
    const result = projectCreationSchema.safeParse(currentDraft);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as string;
            if (!errors[fieldName]) {
                errors[fieldName] = issue.message;
            }
        });
        validationErrors.set(errors);
        return false;
    } else {
        validationErrors.set({});
        return true;
    }
}

/**
 * Marks a field as touched.
 * @param fieldName - The name of the field that was touched
 */
export function markFieldAsTouched(fieldName: string) {
    touchedFields.update((fields) => {
        const newFields = new Set(fields);
        newFields.add(fieldName);
        return newFields;
    });
}

/**
 * Resets the form to its initial state.
 */
export function resetForm() {
    draft.set({
        title: "",
        subtitle: "",
        categories: [],
        budget: 0,
        release: getDefaultReleaseDate(),
    });
    validationErrors.set({});
    touchedFields.set(new Set());
}
