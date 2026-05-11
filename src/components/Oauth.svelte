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
        console.log(`Iniciando flujo de OAuth para: ${id}`);       
    };
</script>

<div class="flex w-full flex-row gap-4">
    {#each providers as { icon: Icon, id }}
        <button
            type="button"
            onclick={() => handleLogin(id)}
            aria-label={`Login con ${id}`}
            class="flex flex-1 items-center justify-center rounded-xl border border-gray-200 p-4.5 transition-all hover:bg-gray-50 active:scale-95"
        >
            <Icon width="24" height="24" />
        </button>
    {/each}
</div>
