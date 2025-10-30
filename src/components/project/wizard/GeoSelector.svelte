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
    import { t } from "../../../i18n/store";
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
        labelText={$t("wizard.configuration.geography.scopeLabel")}
        required={true}
        error={showScopeError ? errors.geographicScope : undefined}
        onBlur={handleScopeBlur}
        onChange={handleScopeChange}
    >
        <option value="">{$t("wizard.configuration.geography.scopePlaceholder")}</option>
        <option value="local">{$t("wizard.configuration.geography.options.local")}</option>
        <option value="estatal">{$t("wizard.configuration.geography.options.estatal")}</option>
        <option value="internacional"
            >{$t("wizard.configuration.geography.options.internacional")}</option
        >
    </Select>

    <!-- Conditional Localities Input -->
    {#if scope === "local"}
        <TextInput
            bind:value={localities}
            name="localities"
            labelText={$t("wizard.configuration.geography.localitiesLabel")}
            placeholder={$t("wizard.configuration.geography.localitiesPlaceholder")}
            required={true}
            error={showLocalitiesError ? errors.localities : undefined}
            helperText={!showLocalitiesError
                ? $t("wizard.configuration.geography.localitiesHelper")
                : undefined}
            onBlur={handleLocalitiesBlur}
        />
    {/if}
</div>
