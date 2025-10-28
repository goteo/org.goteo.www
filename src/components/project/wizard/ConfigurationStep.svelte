<!--
    Configuration Step Component

    First step of the project setup wizard.
    Handles:
    - Campaign languages (primary + secondary)
    - Geographic scope (local, estatal, internacional)
    - Localities (if local scope selected)
    - Funding rounds (1 or 2)

    Validation:
    - At least one language required
    - Geographic scope required
    - Localities required if scope is local
    - Funding rounds defaults to 1
-->
<script lang="ts">
    import BaseCard from "../../BaseCard.svelte";
    import Button from "../../library/Button.svelte";
    import LanguageSelector from "./LanguageSelector.svelte";
    import GeoSelector from "./GeoSelector.svelte";
    import RoundSelector from "./RoundSelector.svelte";
    import {
        wizardState,
        updateConfiguration,
        validateConfiguration,
        completeCurrentStep,
        isConfigurationValid,
    } from "../../../stores/wizard-state";

    interface ConfigurationStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: ConfigurationStepProps = $props();

    // Reactive values from store
    const configuration = $derived($wizardState.configuration);
    const isValid = $derived($isConfigurationValid);

    /**
     * Handle Continue button
     * Validates current step and navigates to next
     */
    function handleContinue() {
        const isStepValid = validateConfiguration();

        if (isStepValid) {
            completeCurrentStep();
            if (onContinue) {
                onContinue();
            }
        } else {
            console.warn("Configuration step validation failed");
        }
    }

    /**
     * Handle language changes
     */
    function handleLanguagesChange(languages: string[]) {
        updateConfiguration({ languages });
    }

    /**
     * Handle geographic scope changes
     */
    function handleScopeChange(scope: "local" | "estatal" | "internacional") {
        updateConfiguration({
            geographicScope: scope,
            // Clear localities if scope is not local
            localities: scope === "local" ? configuration.localities : undefined,
        });
    }

    /**
     * Handle localities change
     */
    function handleLocalitiesChange(localities: string) {
        updateConfiguration({ localities });
    }

    /**
     * Handle funding rounds change
     */
    function handleRoundsChange(rounds: 1 | 2) {
        updateConfiguration({ fundingRounds: rounds });
    }
</script>

<div class="space-y-6">
    <!-- Languages Section -->
    <BaseCard>
        <h2 class="text-secondary mb-4 text-xl font-bold">Idiomas de la campaña</h2>
        <p class="text-tertiary mb-4 text-sm">
            Selecciona el idioma principal y añade idiomas secundarios si tu campaña es multilingüe.
        </p>
        <LanguageSelector languages={configuration.languages} onChange={handleLanguagesChange} />
    </BaseCard>

    <!-- Geographic Scope Section -->
    <BaseCard>
        <h2 class="text-secondary mb-4 text-xl font-bold">Alcance geográfico</h2>
        <p class="text-tertiary mb-4 text-sm">Indica el alcance geográfico de tu campaña.</p>
        <GeoSelector
            scope={configuration.geographicScope}
            localities={configuration.localities}
            onScopeChange={handleScopeChange}
            onLocalitiesChange={handleLocalitiesChange}
        />
    </BaseCard>

    <!-- Funding Rounds Section -->
    <BaseCard>
        <h2 class="text-secondary mb-4 text-xl font-bold">Rondas de financiación</h2>
        <p class="text-tertiary mb-4 text-sm">Elige las rondas que tendrá tu campaña.</p>
        <RoundSelector rounds={configuration.fundingRounds} onChange={handleRoundsChange} />
    </BaseCard>

    <!-- Continue Button -->
    <div class="flex justify-end">
        <Button
            kind="primary"
            size="md"
            disabled={!isValid}
            onclick={handleContinue}
            data-testid="config-continue-btn"
        >
            Continuar con info de campaña
        </Button>
    </div>
</div>
