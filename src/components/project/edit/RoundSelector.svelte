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

    interface RoundSelectorProps {
        projectDeadline: "minimum" | "optimum";
        onChange: (selectedDeadline: "minimum" | "optimum") => void;
    }

    let { projectDeadline = $bindable("minimum"), onChange }: RoundSelectorProps = $props();

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
        name="funding-rounds"
        value="minimum"
        checked={projectDeadline === "minimum"}
        onchange={() => handleChange("minimum")}
        id="round-1-radio"
        label={$t("pages.project.edit.configuration.rounds.option1")}
    />

    <!-- 2 Rounds Option -->
    <RadioButton
        name="funding-rounds"
        value="optimum"
        checked={projectDeadline === "optimum"}
        onchange={() => handleChange("optimum")}
        id="round-2-radio"
        label={$t("pages.project.edit.configuration.rounds.option2")}
    />
</div>
