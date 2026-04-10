<!--
    Configuration Step Component

    First step of the project setup wizard.
    Handles:
    - Funding rounds (1 or 2)

    Validation:
    - Funding rounds defaults to 1
-->
<script lang="ts">
    import RoundSelector from "./RoundSelector.svelte";
    import { t } from "../../../i18n/store";
    import { wizardState, updateConfiguration, navigateToStep } from "../../../stores/wizard-state";
    import Button from "../../library/Button.svelte";

    interface ConfigurationStepProps {
        onContinue?: () => void;
    }

    let { onContinue }: ConfigurationStepProps = $props();

    // Reactive values from store
    const configuration = $derived($wizardState.configuration);
    let projectDeadline = $state(configuration.projectDeadline ?? "minimum");

    /**
     * Handle Continue button
     * Simple navigation to next step (2) - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(2);
        if (onContinue) {
            onContinue();
        }
    }

    /**
     * Handle funding rounds change
     */
    function handleRoundsChange(projectDeadline: "minimum" | "optimum") {
        updateConfiguration({ projectDeadline });
    }
</script>

<div class="space-y-8">
    <!-- Page Header -->
    <div class="space-y-4">
        <h1 class="text-[40px]/12 font-bold text-black">
            {$t("pages.project.edit.configuration.title")}
        </h1>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.configuration.subtitle")}
        </p>
    </div>

    <!-- Funding Rounds Section -->
    <div class="space-y-6">
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.configuration.rounds.title")}
            </h2>
            <p class="text-content text-base font-normal">
                {$t("pages.project.edit.configuration.rounds.description")}
            </p>
        </div>
        <RoundSelector bind:projectDeadline onChange={handleRoundsChange} />
    </div>

    <!-- Continue Button -->
    <div class="mb- flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.configuration.continue")}
        </Button>
    </div>
</div>
