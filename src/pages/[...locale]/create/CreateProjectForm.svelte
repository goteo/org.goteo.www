<script lang="ts">
    import { onDestroy } from "svelte";

    import BaseCard from "../../../components/BaseCard.svelte";
    import Button from "../../../components/library/Button.svelte";
    import CategorySelect from "../../../components/library/CategorySelect.svelte";
    import DateInput from "../../../components/library/DateInput.svelte";
    import TextInput from "../../../components/library/TextInput.svelte";
    import { t } from "../../../i18n/store";
    import {
        apiProjectsPost,
        type Category,
        type ProjectProjectCreationDto,
    } from "../../../openapi/client";
    import {
        validateCreateForm,
        validateField,
        validationErrors,
    } from "../../../stores/drafts/draftValidation";
    import {
        createDraft,
        currentDraft,
        markFieldAsTouched,
        touchedFields,
        updateProject,
        isCreateFormValid,
        project,
    } from "../../../stores/drafts/projectDraft";
    import { categories } from "../../../utils/categories";
    import { formatCurrency } from "../../../utils/currencies";

    let releaseDate = $state($project.release ? new Date($project.release) : new Date());

    const categoriesOptions = categories.map((categories) => {
        return { id: categories.id, text: $t(categories.translationKey) };
    });

    // Track if form has been submitted once (for showing all errors)
    let submitted = $state(false);

    // Loading state for form submission
    let isSubmitting = $state(false);

    // API error message
    let apiError: string | null = $state(null);

    // Success state
    let submitSuccess = $state(false);

    // Debounce timer for real-time validation
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    function handleFieldBlur(fieldName: keyof ProjectProjectCreationDto) {
        if (!$currentDraft) return;

        markFieldAsTouched(fieldName);
        validateField(fieldName, $currentDraft.createProject[fieldName]);
    }

    /**
     * Handles field value changes with type-safe updates.
     * Uses generic typing to ensure type safety without bypassing TypeScript checks.
     */
    function handleFieldChange<K extends keyof ProjectProjectCreationDto>(
        fieldName: K,
        value: ProjectProjectCreationDto[K],
    ) {
        // Update the draft value with proper typing
        updateProject({ [fieldName]: value });

        // Only validate on change if field has been touched
        if ($touchedFields.has(fieldName) || submitted) {
            // Debounce validation
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                validateField(fieldName, value);
            }, 300);
        }
    }

    // Cleanup debounce timer on component unmount to prevent memory leaks
    onDestroy(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
            debounceTimer = null;
        }
    });

    function handleCategoryChange(selected: { id: number | string; text: string }[]) {
        const categoryIds = selected.map((s) => s.id.toString()) as Category[];
        handleFieldChange("categories", categoryIds);
    }

    async function handleSubmit() {
        submitted = true;
        apiError = null;

        const errors = validateCreateForm($project);

        // Validate entire form
        const isValid = Object.keys(errors).length === 0;

        if (!isValid) {
            // Scroll to error summary
            const errorSummary = document.querySelector('[role="alert"]');
            if (errorSummary) {
                errorSummary.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                // If no error summary, focus first invalid field
                const firstError = Object.keys($validationErrors)[0];
                if (firstError) {
                    const element = document.querySelector(`[name="${firstError}"]`);
                    if (element instanceof HTMLElement) {
                        element.focus();
                    }
                }
            }
            return;
        }

        if (!$currentDraft) {
            apiError = "Draft not initialized";
            return;
        }

        // Submit to API
        isSubmitting = true;

        try {
            // TODO: Map form fields to API ProjectCreationDto
            // The current form collects: title, subtitle, categories (array), release, budget
            // The API expects: title, subtitle, category (single), territory, description
            // Need to update the form to collect the correct fields or map them appropriately

            // TODO: Implement actual API submission when form fields match API requirements

            const { data, error } = await apiProjectsPost({
                body: {
                    title: $currentDraft.createProject.title,
                    subtitle: $currentDraft.createProject.subtitle,
                    categories: $currentDraft.createProject.categories as Category[], // Map all categories
                    release: $currentDraft.createProject.release, // Map release date
                },
            });

            if (error) {
                // Handle API validation errors
                if ("violations" in error && error.violations) {
                    error.violations.forEach((violation) => {
                        const field = violation.propertyPath as keyof ProjectProjectCreationDto;
                        if (field) {
                            $validationErrors[field] = violation.message || "Invalid value";
                        }
                    });
                    return;
                } else {
                    apiError = "An unexpected error occurred. Please try again.";
                    return;
                }
            } else if (data) {
                submitSuccess = true;
                updateProject({
                    title: $currentDraft.createProject.title,
                    subtitle: $currentDraft.createProject.subtitle,
                    categories: $currentDraft.createProject.categories as Category[],
                    release: $currentDraft.createProject.release,
                });
                currentDraft.update((d) => (d ? { ...d, status: "project-created" } : d));

                // Redirect to project page
                window.location.href = `/project/${data.id}/edit`;
            }
        } catch (err) {
            // Handle unexpected errors
            apiError = "An unexpected error occurred. Please try again.";
        } finally {
            isSubmitting = false;
        }
    }

    // Helper to check if field should show error
    function shouldShowError(fieldName: string): boolean {
        return (submitted || $touchedFields.has(fieldName)) && !!$validationErrors[fieldName];
    }

    // Calculate minimum date (14 days from now) for date input
    function getMinDate(): Date {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        return minDate;
    }

    $effect(() => {
        if (!$currentDraft) {
            createDraft({
                title: "",
                subtitle: "",
                categories: [],
                release: undefined,
            });
        }
    });
</script>

<section class="wrapper md:flex md:flex-row">
    <div class="flex max-w-167 flex-col gap-10">
        <div class="flex flex-col gap-4">
            <h1 class="text-3xl font-bold text-black lg:text-4xl">
                {$t("pages.project.create.title")}
            </h1>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.subtitle")}
            </p>
        </div>
        {#if submitted && Object.keys($validationErrors).length > 0}
            <div
                role="alert"
                aria-live="polite"
                class="rounded-md border-l-4 border-red-500 bg-red-50 p-4"
            >
                <h2 class="mb-2 text-lg font-semibold text-red-800">
                    {$t("validation.errors.summary.title")}
                </h2>
                <ul class="list-inside list-disc space-y-1">
                    {#each Object.entries($validationErrors) as [field, error]}
                        <li class="text-sm text-red-700">
                            <a
                                href={`#${field}`}
                                class="underline hover:text-red-900"
                                onclick={(e) => {
                                    e.preventDefault();
                                    const element = document.querySelector(`[name="${field}"]`);
                                    if (element instanceof HTMLElement) {
                                        element.focus();
                                        element.scrollIntoView({
                                            behavior: "smooth",
                                            block: "center",
                                        });
                                    }
                                }}
                            >
                                {$t(error)}
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.description.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.description.subtitle")}
            </p>
            <TextInput
                name="title"
                placeholder={$t("pages.project.create.description.titlePrompt")}
                bind:value={$project.title}
                error={shouldShowError("title") ? $t($validationErrors.title) : undefined}
                onBlur={() => handleFieldBlur("title")}
                onInput={(e) => handleFieldChange("title", (e.target as HTMLInputElement).value)}
            />
            <div class="relative">
                <textarea
                    id="subtitle"
                    name="subtitle"
                    placeholder={$t("pages.project.create.description.subtitlePrompt")}
                    class="h-60 w-full resize-none rounded-md border p-4 {shouldShowError(
                        'subtitle',
                    )
                        ? 'border-red-500'
                        : 'border-[#855a96]'}"
                    bind:value={$project.subtitle}
                    onblur={() => handleFieldBlur("subtitle")}
                    oninput={(e) =>
                        handleFieldChange("subtitle", (e.target as HTMLTextAreaElement).value)}
                    aria-invalid={shouldShowError("subtitle")}
                    aria-describedby={shouldShowError("subtitle") ? "subtitle-error" : undefined}
                ></textarea>
                {#if shouldShowError("subtitle")}
                    <p id="subtitle-error" class="mt-1 ml-4 text-[12px] text-red-600" role="alert">
                        {$t($validationErrors.subtitle)}
                    </p>
                {/if}
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.categories.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.categories.subtitle")}
            </p>
            <CategorySelect
                max={2}
                options={categoriesOptions}
                onchange={handleCategoryChange}
                error={shouldShowError("categories") ? $t($validationErrors.categories) : undefined}
            />
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.release.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.release.subtitle")}
            </p>
            <DateInput
                name="release"
                bind:value={releaseDate}
                min={getMinDate()}
                error={shouldShowError("release") ? $t($validationErrors.release) : undefined}
                onBlur={() => handleFieldBlur("release")}
                onInput={(date) => handleFieldChange("release", date)}
            />
        </div>
        {#if apiError}
            <div role="alert" class="rounded-md border-l-4 border-red-500 bg-red-50 p-4">
                <p class="text-sm text-red-800">{apiError}</p>
            </div>
        {/if}
        {#if submitSuccess}
            <div role="status" class="rounded-md border-l-4 border-green-500 bg-green-50 p-4">
                <p class="text-sm font-semibold text-green-800">
                    Project draft created successfully! (Dev mode simulation)
                </p>
            </div>
        {/if}
        <p>
            <Button size="md" disabled={!$isCreateFormValid || isSubmitting} onclick={handleSubmit}>
                {isSubmitting ? "Submitting..." : $t("pages.project.create.submit")}
            </Button>
        </p>
    </div>
    <div class="ml-auto">
        <BaseCard class="flex h-full max-h-126.5 w-full max-w-109.25 flex-col">
            <h1
                class="text-secondary text-2xl leading-8 font-bold {$currentDraft?.createProject
                    .title || 'opacity-50'}"
            >
                {$currentDraft?.createProject.title ||
                    $t("pages.project.create.description.titlePlaceholder")}
            </h1>
            <p class="text-sm text-black">
                {$currentDraft?.createProject.subtitle ||
                    $t("pages.project.create.description.subtitlePlaceholder")}
            </p>
            <div class="mt-auto">
                <p class="text-sm text-black">{$t("pages.project.create.budgetPreview")}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency(
                        $currentDraft?.wizardForm.budget?.minimum?.money?.amount || 0,
                        "EUR",
                    )}
                </p>
            </div>
        </BaseCard>
    </div>
</section>
