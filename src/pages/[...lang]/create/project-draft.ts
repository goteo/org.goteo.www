import { derived, writable } from "svelte/store";

import { projectCreationSchema } from "./validation";

interface ProjectDraft {
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
 * Returns true only when all fields pass validation and there are no errors.
 */
export const isFormValid = derived([draft, validationErrors], ([$draft, $errors]) => {
    const result = projectCreationSchema.safeParse($draft);
    return result.success && Object.keys($errors).length === 0;
});

/**
 * Validates a single field and updates the validation errors store.
 * @param fieldName - The name of the field to validate
 * @param value - The current value of the field
 */
export function validateField(fieldName: keyof ProjectDraft, value: unknown) {
    // Check if this field has a validation schema (budget doesn't)
    const fieldSchema = (projectCreationSchema.shape as Record<string, unknown>)[fieldName];

    if (!fieldSchema || typeof fieldSchema !== "object" || !("safeParse" in fieldSchema)) {
        return;
    }

    const result = (
        fieldSchema as {
            safeParse: (val: unknown) => {
                success: boolean;
                error?: { issues: Array<{ message: string }> };
            };
        }
    ).safeParse(value);

    validationErrors.update((errors) => {
        if (!result.success && result.error) {
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
 * Returns true if the form is valid, false otherwise.
 */
export function validateForm(): boolean {
    let currentDraft: ProjectDraft | undefined;
    const unsubscribe = draft.subscribe((value) => (currentDraft = value));
    unsubscribe();

    if (!currentDraft) {
        return false;
    }

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
