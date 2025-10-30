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

<div class="space-y-8">
    <!-- Page Header -->
    <div>
        <h1 class="text-secondary mb-2 text-[32px] leading-tight font-bold">Configuración</h1>
        <p class="text-secondary text-base">Configura los datos básicos de tu campaña</p>
    </div>

    <!-- Languages Section -->
    <div class="space-y-4">
        <div>
            <h2 class="text-secondary mb-2 text-xl font-bold">Idiomas de la campaña</h2>
            <p class="text-secondary text-sm">
                Cuáles son los idiomas en los que publicarás la información de campaña.
            </p>
        </div>
        <LanguageSelector languages={configuration.languages} onChange={handleLanguagesChange} />
    </div>

    <!-- Geographic Scope Section -->
    <div class="space-y-4">
        <div>
            <h2 class="text-secondary mb-2 text-xl font-bold">Indica el alcance geográfico</h2>
            <p class="text-secondary text-sm">Describe a quién va dirigido tu proyecto</p>
        </div>
        <GeoSelector
            scope={configuration.geographicScope}
            localities={configuration.localities}
            onScopeChange={handleScopeChange}
            onLocalitiesChange={handleLocalitiesChange}
        />
    </div>

    <!-- Funding Rounds Section -->
    <div class="space-y-4">
        <div>
            <h2 class="text-secondary mb-2 text-xl font-bold">
                Elige las rondas que tendrá tu campaña
            </h2>
            <p class="text-secondary text-sm">
                La configuración predeterminada son 40 días cada ronda, puedes solicitar
                modificaciones a tu asesor si tu proyecto es seleccionado
            </p>
        </div>
        <RoundSelector rounds={configuration.fundingRounds} onChange={handleRoundsChange} />
    </div>

    <!-- Continue Button -->
    <div class="flex justify-start pt-4">
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
