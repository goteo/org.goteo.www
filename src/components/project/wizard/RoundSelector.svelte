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
        rounds: 1 | 2;
        onChange: (rounds: 1 | 2) => void;
    }

    let { rounds = $bindable(1), onChange }: RoundSelectorProps = $props();

    /**
     * Handle round selection change
     */
    function handleChange(selectedRounds: 1 | 2) {
        onChange(selectedRounds);
    }
</script>

<div class="flex gap-4">
    <!-- 1 Round Option -->
    <RadioButton
        name={"funding-rounds"}
        value={1}
        checked={rounds === 1}
        onchange={() => handleChange(1)}
        id={"round-1-radio"}
        label={$t("wizard.configuration.rounds.option1")}
    />

    <!-- 2 Rounds Option -->
    <RadioButton
        name={"funding-rounds"}
        value={2}
        checked={rounds === 2}
        onchange={() => handleChange(2)}
        id={"round-2-radio"}
        label={$t("wizard.configuration.rounds.option2")}
    />
</div>
