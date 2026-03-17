<script lang="ts">
    import Eye from "../../svgs/Eye.svelte";

    interface Props {
        class?: string;
        value?: string;
        placeholder?: string;
        name?: string;
        id?: string;
    }

    let {
        class: classes = "",
        value = $bindable(""),
        placeholder = "Escribe tu contraseña",
        name = "password",
        id = "password",
    }: Props = $props();

    let showPassword = $state(false);

    function togglePassword() {
        showPassword = !showPassword;
    }
</script>

<div
    class="border-secondary flex h-14 w-full max-w-[432px] items-center justify-between rounded-3xl border bg-white p-4 {classes}"
>
    {#if showPassword}
        <input
            type="text"
            {name}
            {id}
            {placeholder}
            bind:value
            class="flex-1 border-none bg-white text-black outline-none focus:ring-0"
        />
    {:else}
        <input
            type="password"
            {name}
            {id}
            {placeholder}
            bind:value
            class="flex-1 border-none bg-white text-black outline-none focus:ring-0"
        />
    {/if}

    <button type="button" onclick={togglePassword} class="text-secondary cursor-pointer">
        <Eye class="pointer-events-none h-6 w-6" closed={!showPassword} />
    </button>
</div>
