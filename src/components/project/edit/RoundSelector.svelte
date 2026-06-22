<!--
    Funding Rounds Selector Component

    Allows users to choose between 1 or 2 funding rounds for their campaign.

    Features:
    - Simple horizontal radio button layout
    - Defaults to 1 round
    - Minimal design matching Figma specifications

    Design System:
    - Primary color for selected state
    - Clean, compact layout without card wrappers
-->
<script lang="ts">
    import { t } from "../../../i18n/store";
    import RadioButton from "../../library/RadioButton.svelte";

    import type { Project } from "../../../openapi/client";

    interface RoundSelectorProps {
        deadline: Project["deadline"];
        onChange: (selectedDeadline: "minimum" | "optimum") => void;
    }

    let { deadline = $bindable("minimum"), onChange }: RoundSelectorProps = $props();

    /**
     * Handle round selection change
     */
    function handleChange(selectedDeadline: "minimum" | "optimum") {
        onChange(selectedDeadline);
    }
</script>

<div class="flex gap-4">
    <!-- 1 Round Option -->
    <RadioButton
        bind:group={deadline}
        name="funding-rounds"
        value="minimum"
        onchange={() => handleChange("minimum")}
        label={$t("pages.project.edit.configuration.rounds.option1")}
    />

    <!-- 2 Rounds Option -->
    <RadioButton
        bind:group={deadline}
        name="funding-rounds"
        value="optimum"
        onchange={() => handleChange("optimum")}
        label={$t("pages.project.edit.configuration.rounds.option2")}
    />
</div>
