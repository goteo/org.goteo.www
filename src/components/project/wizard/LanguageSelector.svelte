<!--
    Language Selector Component

    Allows users to select one primary language and optionally add secondary languages.

    Features:
    - Primary language dropdown (required)
    - Add secondary languages with "Añadir otro" button
    - Remove secondary languages
    - Excludes already-selected languages from dropdowns
    - Validation on blur

    Design System:
    - Uses standard select styling
    - Error states with red border and message
-->
<script lang="ts">
    import ValidationError from "../../library/ValidationError.svelte";
    import {
        validationErrors,
        touchedFields,
        markFieldAsTouched,
    } from "../../../stores/wizard-state";

    interface LanguageOption {
        code: string;
        name: string;
    }

    interface LanguageSelectorProps {
        languages: string[];
        onChange: (languages: string[]) => void;
    }

    let { languages = [], onChange }: LanguageSelectorProps = $props();

    // Available languages
    const availableLanguages: LanguageOption[] = [
        { code: "es", name: "Español" },
        { code: "en", name: "English" },
        { code: "ca", name: "Català" },
        { code: "fr", name: "Français" },
        { code: "de", name: "Deutsch" },
        { code: "it", name: "Italiano" },
        { code: "pt", name: "Português" },
    ];

    // Local state for language selection
    let primaryLanguage = $state(languages[0] || "");
    let secondaryLanguages = $state<string[]>(languages.slice(1));

    // Reactive validation errors
    const errors = $derived($validationErrors);
    const touched = $derived($touchedFields);
    const showError = $derived(touched.has("languages") && errors.languages);

    /**
     * Handle primary language change
     */
    function handlePrimaryChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        primaryLanguage = target.value;
        updateLanguages();
    }

    /**
     * Handle secondary language change
     */
    function handleSecondaryChange(index: number, event: Event) {
        const target = event.target as HTMLSelectElement;
        secondaryLanguages[index] = target.value;
        updateLanguages();
    }

    /**
     * Add a new secondary language slot
     */
    function addSecondaryLanguage() {
        secondaryLanguages = [...secondaryLanguages, ""];
    }

    /**
     * Remove a secondary language
     */
    function removeSecondaryLanguage(index: number) {
        secondaryLanguages = secondaryLanguages.filter((_, i) => i !== index);
        updateLanguages();
    }

    /**
     * Update parent component with all languages
     */
    function updateLanguages() {
        const allLanguages = [
            primaryLanguage,
            ...secondaryLanguages.filter((lang) => lang !== ""),
        ].filter(Boolean);

        onChange(allLanguages);
    }

    /**
     * Handle blur event for validation
     */
    function handleBlur() {
        markFieldAsTouched("languages");
    }

    /**
     * Get available languages for a dropdown, excluding already-selected ones
     */
    function getAvailableForDropdown(currentValue: string): LanguageOption[] {
        const selectedLanguages = [primaryLanguage, ...secondaryLanguages];
        return availableLanguages.filter(
            (lang) => !selectedLanguages.includes(lang.code) || lang.code === currentValue,
        );
    }
</script>

<div class="space-y-4">
    <!-- Primary Language -->
    <div>
        <label for="primary-language" class="text-secondary mb-2 block text-sm font-medium">
            Idioma principal de la campaña *
        </label>
        <select
            id="primary-language"
            value={primaryLanguage}
            onchange={handlePrimaryChange}
            onblur={handleBlur}
            data-testid="language-primary-select"
            class="border-light-muted focus:border-primary w-full rounded-lg border px-4 py-2 {showError
                ? 'border-red-500'
                : ''}"
        >
            <option value="">Selecciona un idioma</option>
            {#each getAvailableForDropdown(primaryLanguage) as lang}
                <option value={lang.code}>{lang.name}</option>
            {/each}
        </select>
    </div>

    <!-- Secondary Languages -->
    {#each secondaryLanguages as secondary, index}
        <div class="flex gap-2">
            <div class="flex-1">
                <label
                    for="secondary-language-{index}"
                    class="text-secondary mb-2 block text-sm font-medium"
                >
                    Idioma secundario {index + 1}
                </label>
                <select
                    id="secondary-language-{index}"
                    value={secondary}
                    onchange={(e) => handleSecondaryChange(index, e)}
                    data-testid="language-secondary-select-{index}"
                    class="border-light-muted focus:border-primary w-full rounded-lg border px-4 py-2"
                >
                    <option value="">Selecciona un idioma</option>
                    {#each getAvailableForDropdown(secondary) as lang}
                        <option value={lang.code}>{lang.name}</option>
                    {/each}
                </select>
            </div>
            <div class="flex items-end pb-2">
                <button
                    type="button"
                    onclick={() => removeSecondaryLanguage(index)}
                    data-testid="language-remove-btn-{index}"
                    class="text-tertiary hover:text-secondary rounded-lg p-2 transition"
                    aria-label="Eliminar idioma"
                >
                    ✕
                </button>
            </div>
        </div>
    {/each}

    <!-- Add Secondary Language Button -->
    <button
        type="button"
        onclick={addSecondaryLanguage}
        data-testid="language-add-btn"
        class="text-primary hover:text-secondary text-sm font-medium transition"
    >
        + Añadir otro idioma
    </button>

    <!-- Validation Error -->
    {#if showError}
        <ValidationError message={errors.languages} />
    {/if}
</div>
