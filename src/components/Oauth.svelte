<script lang="ts">
    import FacebookIcon from "../svgs/FacebookIcon.svelte";
    import GoogleIcon from "../svgs/GoogleIcon.svelte";
    import LinkedinIcon from "../svgs/LinkedinIcon.svelte";
    import XIcon from "../svgs/XIcon.svelte";

    const providers = [
        { icon: GoogleIcon, id: "google" },
        { icon: XIcon, id: "x" },
        { icon: FacebookIcon, id: "facebook" },
        { icon: LinkedinIcon, id: "linkedin" },
    ];

    const handleLogin = (id: string) => {
        console.log(`Iniciando flujo de Oauth para: ${id}`);
    };
</script>

<div class="flex flex-row flex-wrap items-center justify-start gap-4">
    {#each providers as { icon: Icon, id }}
        <button
            type="button"
            onclick={() => handleLogin(id)}
            class="flex size-22.75 shrink-0 items-center justify-center rounded-2xl border border-[#F3F3EF] bg-[#FBFBFB] p-4.5 shadow-[0_1px_3px_0_rgba(0,0,0,0.10)] transition-all hover:bg-white hover:shadow-md active:scale-95"
        >
            <Icon width="48" height="48" />
        </button>
    {/each}
</div>
