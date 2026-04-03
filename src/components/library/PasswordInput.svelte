<script lang="ts">
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../i18n/store";
    import Eye from "../../svgs/Eye.svelte";

    interface Props {
        class?: ClassNameValue;
        value?: string;
        placeholder?: string;
        name?: string;
        id?: string;
        label?: string;
    }

    let {
        class: classes = "",
        value = $bindable(""),
        placeholder = $t("login.form.password"),
        name = "password",
        id = "password",
        label = undefined,
    }: Props = $props();

    let showPassword = $state(false);

    function togglePassword() {
        showPassword = !showPassword;
    }
</script>

<div
    class={twMerge(
        "border-secondary relative flex h-14 w-full items-center justify-between rounded-3xl border bg-white p-4",
        classes,
    )}
>
    {#if label !== undefined}
        <label for={id} class="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-700">
            {label}
        </label>
    {/if}

    <input
        type={showPassword ? "text" : "password"}
        {name}
        {id}
        {placeholder}
        bind:value
        class="flex-1 border-none bg-white text-black outline-none focus:ring-0"
    />

    <button type="button" onclick={togglePassword} class="text-secondary cursor-pointer">
        <Eye class="pointer-events-none h-6 w-6" closed={!showPassword} />
    </button>
</div>
