<!--
    Geographic Scope Selector Component

    Allows users to select the geographic reach of their campaign.

    Features:
    - Dropdown for scope selection (Local, Estatal, Internacional)
    - Conditional localities input (only shown for Local scope)
    - Validation on blur

    Design System:
    - Uses Select component from library
    - Error states with red border and message
-->
<script lang="ts">
    import Select from "../../library/Select.svelte";
    import TextInput from "../../library/TextInput.svelte";
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
    function handleScopeChange(value: string) {
        const newScope = value as "local" | "estatal" | "internacional";
        onScopeChange(newScope);
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

    /**
     * Watch localities changes and propagate to parent
     */
    $effect(() => {
        if (localities !== undefined) {
            onLocalitiesChange(localities);
        }
    });
</script>

<div class="space-y-4">
    <!-- Geographic Scope Dropdown -->
    <Select
        bind:value={scope}
        name="geographic-scope"
        labelText="Alcance geográfico"
        required={true}
        error={showScopeError ? errors.geographicScope : undefined}
        onBlur={handleScopeBlur}
        onChange={handleScopeChange}
    >
        <option value="">Selecciona el alcance</option>
        <option value="local">Local</option>
        <option value="estatal">Estatal</option>
        <option value="internacional">Internacional</option>
    </Select>

    <!-- Conditional Localities Input -->
    {#if scope === "local"}
        <TextInput
            bind:value={localities}
            name="localities"
            labelText="Indica localidades"
            placeholder="Ej: Barcelona, Madrid, Valencia"
            required={true}
            error={showLocalitiesError ? errors.localities : undefined}
            helperText={!showLocalitiesError ? "Separa las localidades con comas." : undefined}
            onBlur={handleLocalitiesBlur}
        />
    {/if}
</div>
