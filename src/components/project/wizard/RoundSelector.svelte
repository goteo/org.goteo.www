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
    interface RoundSelectorProps {
        rounds: 1 | 2;
        onChange: (rounds: 1 | 2) => void;
    }

    let { rounds = 1, onChange }: RoundSelectorProps = $props();

    /**
     * Handle round selection change
     */
    function handleChange(selectedRounds: 1 | 2) {
        onChange(selectedRounds);
    }
</script>

<div class="flex gap-6">
    <!-- 1 Round Option -->
    <label class="text-secondary flex cursor-pointer items-center gap-2 font-medium">
        <input
            type="radio"
            name="funding-rounds"
            value="1"
            checked={rounds === 1}
            onchange={() => handleChange(1)}
            data-testid="round-1-radio"
            class="text-primary focus:ring-primary size-5"
        />
        <span>1 Ronda</span>
    </label>

    <!-- 2 Rounds Option -->
    <label class="text-secondary flex cursor-pointer items-center gap-2 font-medium">
        <input
            type="radio"
            name="funding-rounds"
            value="2"
            checked={rounds === 2}
            onchange={() => handleChange(2)}
            data-testid="round-2-radio"
            class="text-primary focus:ring-primary size-5"
        />
        <span>2 Rondas</span>
    </label>
</div>
