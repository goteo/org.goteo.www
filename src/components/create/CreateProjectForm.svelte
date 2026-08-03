<script lang="ts">
    import { onDestroy } from "svelte";

    import { t } from "../../i18n/store";
    import {
        apiProjectsPost,
        apiProjectsIdPatch,
        type Category,
        type ProjectProjectCreationDto,
    } from "../../openapi/client";
    import { client } from "../../openapi/client/client.gen";
    import { apiCategoriesIdGetUrl } from "../../openapi/client/paths.gen";
    import {
        validateCreateForm,
        validateField,
        type ValidationErrors,
    } from "../../stores/drafts/draftValidation";
    import {
        createDraft,
        currentDraft,
        markFieldAsTouched,
        touchedFields,
        updateProject,
        isCreateFormValid,
        project,
        validationErrors,
        type CreateProjectForm,
    } from "../../stores/drafts/projectDraft";
    import { maxEndDate } from "../../utils/campaign";
    import { getDefaultCurrency } from "../../utils/consts";
    import { formatCurrency } from "../../utils/currencies";
    import Button from "../library/buttons/Button.svelte";
    import BaseCard from "../library/cards/BaseCard.svelte";
    import AddressAutocomplete from "../library/inputs/AddressAutocomplete.svelte";
    import CategorySelect from "../library/inputs/CategorySelect.svelte";
    import DateInput from "../library/inputs/DateInput.svelte";
    import TextInput from "../library/inputs/TextInput.svelte";

    let releaseDate = $state($project.release ? new Date($project.release) : new Date());

    let { categories }: { categories: Category[] } = $props();

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

    function handleFieldBlur(fieldName: keyof CreateProjectForm) {
        if (!$currentDraft) return;

        markFieldAsTouched(fieldName);
        const error = validateField(fieldName, $currentDraft.createProject[fieldName]);

        validationErrors.update((errors: ValidationErrors) => {
            if (error) {
                return {
                    ...errors,
                    [fieldName]: error,
                };
            }

            const { [fieldName]: _, ...rest } = errors;

            return rest;
        });
    }

    /**
     * Handles field value changes with type-safe updates.
     * Uses generic typing to ensure type safety without bypassing TypeScript checks.
     */
    function handleFieldChange<K extends keyof CreateProjectForm>(
        fieldName: K,
        value: CreateProjectForm[K],
    ) {
        // Update the draft value with proper typing
        updateProject({ [fieldName]: value });

        // Only validate on change if field has been touched
        if ($touchedFields.has(fieldName) || submitted) {
            // Debounce validation
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const error = validateField(fieldName, value);

                validationErrors.update((errors: ValidationErrors) => {
                    if (error) {
                        return {
                            ...errors,
                            [fieldName]: error,
                        };
                    }

                    const { [fieldName]: _, ...rest } = errors;

                    return rest;
                });
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

    function handleCategoryChange(selected: Category[]) {
        const categoryIris = selected.map((s) => {
            return client.buildUrl({ url: apiCategoriesIdGetUrl, path: { id: s.id } });
        });

        handleFieldChange("categories", categoryIris);
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
            const { data, error } = await apiProjectsPost({
                baseUrl: "/api/relay",
                body: {
                    title: $currentDraft.createProject.title,
                    subtitle: $currentDraft.createProject.subtitle,
                    categories: $currentDraft.createProject.categories,
                    release: $currentDraft.createProject.release,
                },
            });

            if (error) {
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
                const address = $currentDraft.createProject.address;
                const territory = $currentDraft.createProject.territory;

                if (address && territory) {
                    await apiProjectsIdPatch({
                        baseUrl: "/api/relay",
                        path: { id: String(data.id) },
                        body: {
                            territory: {
                                ...territory,
                                address,
                            },
                        },
                    });
                }

                submitSuccess = true;
                updateProject({
                    title: $currentDraft.createProject.title,
                    subtitle: $currentDraft.createProject.subtitle,
                    categories: $currentDraft.createProject.categories,
                    release: $currentDraft.createProject.release,
                    address: $currentDraft.createProject.address,
                    territory: $currentDraft.createProject.territory,
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
    <div class="mb-20 flex max-w-167 flex-col gap-10">
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
                    {$t("system.validation.errors.summary.title")}
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
                    <p id="subtitle-error" class="mt-1 ml-4 text-xs text-red-600" role="alert">
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
                options={categories}
                onchange={handleCategoryChange}
                error={shouldShowError("categories") ? $t($validationErrors.categories) : undefined}
            />
        </div>
        <div class="flex flex-col gap-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.address.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.address.subtitle")}
            </p>
            <AddressAutocomplete
                name="address"
                placeholder={$t("pages.project.create.address.placeholder")}
                value={$project.address ?? ""}
                error={shouldShowError("address") ? $t($validationErrors.address) : undefined}
                onAddressChange={(address, territory) => {
                    handleFieldChange("address", address);
                    handleFieldChange("territory", territory);
                }}
                onBlur={() => handleFieldBlur("address")}
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
                max={maxEndDate}
                error={shouldShowError("release") ? $t($validationErrors.release) : undefined}
                onBlur={() => handleFieldBlur("release")}
                onInput={(date: any) => handleFieldChange("release", date)}
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
                    {$t("pages.project.create.submitSuccess")}
                </p>
            </div>
        {/if}
        <p>
            <Button size="md" disabled={!$isCreateFormValid || isSubmitting} onclick={handleSubmit}>
                {isSubmitting
                    ? $t("pages.project.create.submitting")
                    : $t("pages.project.create.submit")}
            </Button>
        </p>
    </div>
    <div class="ml-auto">
        <BaseCard
            class="border-grey flex h-full max-h-126.5 w-full max-w-109.25 flex-col bg-white"
            style="box-shadow: 0 35px 10px 0 rgba(0, 0, 0, 0.00), 0 22px 9px 0 rgba(0, 0, 0, 0.01), 0 13px 8px 0 rgba(0, 0, 0, 0.05), 0 6px 6px 0 rgba(0, 0, 0, 0.09), 0 1px 3px 0 rgba(0, 0, 0, 0.10);"
        >
            <h1
                class="text-secondary text-double mb-2 leading-10 font-bold {$currentDraft
                    ?.createProject.title || 'opacity-24'}"
            >
                {$currentDraft?.createProject.title ||
                    $t("pages.project.create.description.titlePlaceholder")}
            </h1>
            <p
                class="text-content overflow-hidden text-base font-normal text-ellipsis whitespace-nowrap"
            >
                {$currentDraft?.createProject.subtitle ||
                    $t("pages.project.create.description.subtitlePlaceholder")}
            </p>
            <div class="mt-auto">
                <p class="text-sm text-black">{$t("pages.project.create.budgetPreview")}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency(
                        $currentDraft?.wizardForm.budget?.minimum?.money?.amount || 0,
                        getDefaultCurrency(),
                    )}
                </p>
            </div>
        </BaseCard>
    </div>
</section>
