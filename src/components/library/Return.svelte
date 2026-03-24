<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import Back from "../../svgs/Back.svelte";

    interface Props {
        class?: ClassNameValue;

        text?: string;
    }

    let { class: classes = "", text = $t("global.btn.back") }: Props = $props();

    function goBack() {
        window.history.back();
    }
</script>

<button
    class={twMerge(
        "flex cursor-pointer items-center justify-center gap-2 px-0 py-2 font-medium text-black",
        classes,
    )}
    type="button"
    onclick={goBack}
>
    <Back />

    <span class="text-base">{text}</span>
</button>
