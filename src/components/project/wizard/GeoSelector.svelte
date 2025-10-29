<!--
    Geographic Scope Selector Component

    Allows users to select the geographic reach of their campaign.

    Features:
    - Dropdown for scope selection (Local, Estatal, Internacional)
    - Conditional localities input (only shown for Local scope)
    - Validation on blur

    Design System:
    - Standard select and input styling
    - Error states with red border and message
-->
<script lang="ts">
    import ValidationError from "../../library/ValidationError.svelte";
    import {
        validationErrors,
        touchedFields,
        markFieldAsTouched,
    } from "../../../stores/wizard-state";

    interface GeoSelectorProps {
        scope?: "local" | "estatal" | "internacional";
        localities?: string;
        onScopeChange: (scope: "local" | "estatal" | "internacional") => void;
        onLocalitiesChange: (localities: string) => void;
    }

    let { scope, localities, onScopeChange, onLocalitiesChange }: GeoSelectorProps = $props();

    // Reactive validation errors
    const errors = $derived($validationErrors);
    const touched = $derived($touchedFields);
    const showScopeError = $derived(touched.has("geographicScope") && errors.geographicScope);
    const showLocalitiesError = $derived(touched.has("localities") && errors.localities);

    /**
     * Handle scope change
     */
    function handleScopeChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const newScope = target.value as "local" | "estatal" | "internacional";
        onScopeChange(newScope);
    }

    /**
     * Handle localities input change
     */
    function handleLocalitiesChange(event: Event) {
        const target = event.target as HTMLInputElement;
        onLocalitiesChange(target.value);
    }

    /**
     * Handle blur events for validation
     */
    function handleScopeBlur() {
        markFieldAsTouched("geographicScope");
    }

    function handleLocalitiesBlur() {
        markFieldAsTouched("localities");
    }
</script>

<div class="space-y-4">
    <!-- Geographic Scope Dropdown -->
    <div>
        <label for="geographic-scope" class="text-secondary mb-2 block text-sm font-medium">
            Alcance geográfico *
        </label>
        <select
            id="geographic-scope"
            value={scope || ""}
            onchange={handleScopeChange}
            onblur={handleScopeBlur}
            data-testid="geo-scope-select"
            class="border-light-muted focus:border-primary w-full rounded-lg border px-4 py-2 {showScopeError
                ? 'border-red-500'
                : ''}"
        >
            <option value="">Selecciona el alcance</option>
            <option value="local">Local</option>
            <option value="estatal">Estatal</option>
            <option value="internacional">Internacional</option>
        </select>

        {#if showScopeError}
            <ValidationError message={errors.geographicScope} />
        {/if}
    </div>

    <!-- Conditional Localities Input -->
    {#if scope === "local"}
        <div>
            <label for="localities" class="text-secondary mb-2 block text-sm font-medium">
                Indica localidades *
            </label>
            <input
                type="text"
                id="localities"
                value={localities || ""}
                oninput={handleLocalitiesChange}
                onblur={handleLocalitiesBlur}
                data-testid="geo-localities-input"
                placeholder="Ej: Barcelona, Madrid, Valencia"
                class="border-light-muted focus:border-primary w-full rounded-lg border px-4 py-2 {showLocalitiesError
                    ? 'border-red-500'
                    : ''}"
            />
            <p class="text-tertiary mt-1 text-sm">Separa las localidades con comas.</p>

            {#if showLocalitiesError}
                <ValidationError message={errors.localities} />
            {/if}
        </div>
    {/if}
</div>
