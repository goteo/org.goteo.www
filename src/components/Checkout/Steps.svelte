<script>
    export let step = 1;
    async function redirectToPayment() {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const languages = ["es", "en", "ca", "eu", "gl", "fr", "de"];
        const currentLang = languages.includes(pathParts[0]) ? pathParts[0] : "es";

        const newPath = `/${currentLang}/payment`;
        window.location.href = newPath;
    }
</script>

<div class="bg-primary flex w-full items-center justify-between rounded-full border">
    {#each [1, 2, 3, 4] as i}
        <div
            class="h-4 w-4 rounded-full border-2 transition-all duration-300"
            class:bg-purple-900={i <= step}
            class:bg-white={i > step}
            class:border-white={i <= step}
            class:border-purple-900={i > step}
        ></div>
    {/each}
</div>

<div class="mt-2 flex w-full items-center justify-between text-sm font-medium text-gray-700">
    <div class={step >= 1 ? "text-purple-900" : ""}>Recompensas</div>
    <div class={step >= 2 ? "text-purple-900" : ""}>Tus datos</div>
    <div class={step >= 3 ? "text-purple-900" : ""}>Método de pago</div>
    <div class={step >= 4 ? "text-purple-900" : ""}>Confirmar</div>
</div>

<button
    on:click={redirectToPayment}
    class="mt-4 rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
>
    Continuar
</button>
