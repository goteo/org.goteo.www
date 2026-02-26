<script lang="ts">
    import { t } from "../../../i18n/store";
    import MinusIcon from "../../../svgs/MinusIcon.svelte";
    import PlusIcon from "../../../svgs/PlusIcon.svelte";

    let {
        value = $bindable(1),
        unlimited = $bindable(true),
        min = 1,
    } = $props<{
        value?: number;
        unlimited?: boolean;
        min?: number;
    }>();

    function increment() {
        if (!unlimited) value += 1;
    }

    function decrement() {
        if (!unlimited && value > min) value -= 1;
    }
</script>

<div class="flex flex-col gap-4">
    <h3 class="text-base font-bold text-secondary">
        {$t("wizard.steps.rewards.modal.rewardItems.title")}
    </h3>

    <div class="flex items-center gap-10">
        <div class="flex gap-4">
            <button
                type="button"
                onclick={decrement}
                disabled={unlimited || value <= min}
                class="flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
                <MinusIcon />
            </button>

            <span class="w-fit text-center text-2xl font-bold text-secondary">
                {unlimited ? "∞" : value}
            </span>

            <button
                type="button"
                onclick={increment}
                disabled={unlimited}
                class="flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
                <PlusIcon />
            </button>
        </div>

        <label class="flex cursor-pointer items-center gap-2 text-base text-content font-normal">
            <!-- Pending to add Checkbox library component, which is implemented in another PR -->
            <input type="checkbox" bind:checked={unlimited} />
            {$t("wizard.steps.rewards.modal.rewardItems.unlimited")}
        </label>
    </div>
</div>
