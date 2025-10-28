<!--
    Funding Rounds Selector Component

    Allows users to choose between 1 or 2 funding rounds for their campaign.

    Features:
    - Radio button selection (1 or 2 rounds)
    - Defaults to 1 round
    - Informational text about round duration

    Design System:
    - Custom radio button styling with primary color
    - Hover states and transitions
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

<div class="space-y-4">
    <!-- Radio Button Options -->
    <div class="space-y-3">
        <!-- 1 Round Option -->
        <label
            class="border-light-muted hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition {rounds ===
            1
                ? 'border-primary bg-purple-tint/10'
                : ''}"
        >
            <input
                type="radio"
                name="funding-rounds"
                value="1"
                checked={rounds === 1}
                onchange={() => handleChange(1)}
                data-testid="round-1-radio"
                class="text-primary focus:ring-primary size-5"
            />
            <div class="flex-1">
                <div class="text-secondary font-medium">1 Ronda</div>
                <div class="text-tertiary text-sm">40 días de campaña</div>
            </div>
        </label>

        <!-- 2 Rounds Option -->
        <label
            class="border-light-muted hover:border-primary flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition {rounds ===
            2
                ? 'border-primary bg-purple-tint/10'
                : ''}"
        >
            <input
                type="radio"
                name="funding-rounds"
                value="2"
                checked={rounds === 2}
                onchange={() => handleChange(2)}
                data-testid="round-2-radio"
                class="text-primary focus:ring-primary size-5"
            />
            <div class="flex-1">
                <div class="text-secondary font-medium">2 Rondas</div>
                <div class="text-tertiary text-sm">40 días por ronda (80 días en total)</div>
            </div>
        </label>
    </div>

    <!-- Informational Text -->
    <div class="bg-purple-tint/10 rounded-lg p-4">
        <p class="text-tertiary text-sm">
            ℹ️ La configuración predeterminada son 40 días cada ronda, puedes solicitar
            modificaciones a tu asesor si tu proyecto es seleccionado.
        </p>
    </div>
</div>
