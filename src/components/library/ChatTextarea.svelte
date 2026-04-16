<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import SendIcon from "../icons/SendIcon.svelte";

    interface Props {
        class?: ClassNameValue;
        value?: string;
        onSubmit?: (value: string) => void;
    }

    let { class: classes = "", value = $bindable(""), onSubmit }: Props = $props();
</script>

<div class={twMerge("flex items-center gap-6", classes)}>
    <div class="bg-grey flex flex-1 items-center gap-2 rounded-lg p-4 shadow-sm">
        <textarea
            bind:value
            class="placeholder:text-content flex-1 resize-none border-none bg-transparent outline-none focus:ring-0 focus:outline-none"
            placeholder={$t("common.textPlaceholder")}
            rows="1"
        ></textarea>
    </div>
    <button
        onclick={() => onSubmit?.(value)}
        class="border-grey flex aspect-square h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-white p-2 shadow-md disabled:opacity-50"
    >
        <SendIcon />
    </button>
</div>
