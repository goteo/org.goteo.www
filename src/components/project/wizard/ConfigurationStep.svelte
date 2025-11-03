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
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import LanguageSelector from "./LanguageSelector.svelte";
    import GeoSelector from "./GeoSelector.svelte";
    import RoundSelector from "./RoundSelector.svelte";
    import { wizardState, updateConfiguration, navigateToStep } from "../../../stores/wizard-state";

    interface ConfigurationStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: ConfigurationStepProps = $props();

    // Reactive values from store
    const configuration = $derived($wizardState.configuration);

    /**
     * Handle Continue button
     * Simple navigation to next step - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(2);
        if (onContinue) {
            onContinue();
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
        <h1 class="text-secondary mb-2 text-3xl leading-tight font-bold lg:text-4xl">
            {$t("wizard.configuration.title")}
        </h1>
        <p class="text-secondary text-base">{$t("wizard.configuration.subtitle")}</p>
    </div>

    <!-- Languages Section -->
    <div class="space-y-4">
        <div>
            <h2 class="text-secondary mb-2 text-xl font-bold">
                {$t("wizard.configuration.languages.title")}
            </h2>
            <p class="text-secondary text-sm">
                {$t("wizard.configuration.languages.description")}
            </p>
        </div>
        <LanguageSelector languages={configuration.languages} onChange={handleLanguagesChange} />
    </div>

    <!-- Geographic Scope Section -->
    <div class="space-y-4">
        <div>
            <h2 class="text-secondary mb-2 text-xl font-bold">
                {$t("wizard.configuration.geography.title")}
            </h2>
            <p class="text-secondary text-sm">{$t("wizard.configuration.geography.description")}</p>
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
                {$t("wizard.configuration.rounds.title")}
            </h2>
            <p class="text-secondary text-sm">
                {$t("wizard.configuration.rounds.description")}
            </p>
        </div>
        <RoundSelector rounds={configuration.fundingRounds} onChange={handleRoundsChange} />
    </div>

    <!-- Continue Button -->
    <div class="flex justify-start pt-4">
        <Button kind="primary" size="md" onclick={handleContinue} data-testid="config-continue-btn">
            {#snippet children()}
                {$t("wizard.buttons.continue")}
            {/snippet}
        </Button>
    </div>
</div>
