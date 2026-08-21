<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../../i18n/store";
    import Close from "../../icons/navigation/Close.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";

    let {
        open = $bindable(false),
        paidValue = $bindable(""),
        maxAchieved = "",
        onsave,
    } = $props<{
        open: boolean;
        paidValue: string;
        maxAchieved?: string;
        onsave?: (paidValue: string) => void;
    }>();

    let mode = $state<"total" | "parcial">("total");

    $effect(() => {
        if (open && mode === "total") {
            paidValue = maxAchieved;
        }
    });

    function setTotal() {
        mode = "total";
        paidValue = maxAchieved;
    }

    function setPartial() {
        mode = "parcial";
    }
</script>

<Modal
    bind:open
    title={$t("pages.admin.projects.modals.paid.title")}
    dismissable={false}
    class="relative max-w-lg"
>
    <button
        type="button"
        class="text-secondary absolute inset-e-4 top-4 cursor-pointer bg-transparent p-1 shadow-none hover:opacity-80 focus:ring-0"
        onclick={() => (open = false)}
        aria-label={$t("domain.dateInput.close")}
    >
        <Close width="24" height="24" />
    </button>

    <div class="flex flex-col gap-6">
        <p class="text-content text-sm">
            {$t("pages.admin.projects.modals.paid.description")}
        </p>

        <div class="flex gap-2">
            <button
                type="button"
                class={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-bold ${
                    mode === "total"
                        ? "bg-primary text-secondary border-primary"
                        : "text-content border-variant1 bg-white"
                }`}
                onclick={setTotal}
            >
                {$t("pages.admin.projects.modals.paid.total")}
            </button>
            <button
                type="button"
                class={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-bold ${
                    mode === "parcial"
                        ? "bg-primary text-secondary border-primary"
                        : "text-content border-variant1 bg-white"
                }`}
                onclick={setPartial}
            >
                {$t("pages.admin.projects.modals.paid.partial")}
            </button>
        </div>

        <TextInput
            bind:value={paidValue}
            labelText={$t("pages.admin.projects.modals.paid.input")}
            disabled={mode === "total"}
        />

        <div class="flex justify-end">
            <Button kind="primary" onclick={() => onsave?.(paidValue)}>
                {$t("pages.admin.projects.modals.paid.save")}
            </Button>
        </div>
    </div>
</Modal>
