<script lang="ts">
    import { CircleUserRound } from "lucide-svelte";
    import { enhance } from "$app/forms";
    import { goto } from "$app/navigation";
    import { Button } from "$lib/components/ui/button";

    export let user: any | null = null;

    // Custom enhance function to force page reload after logout
    function enhanceLogout() {
        return enhance(() => {
            return async () => {
                window.location.reload();
            };
        });
    }
</script>

{#if user}
    <div class="flex items-center">
        <Button variant="ghost" class="text-base text-primary-foreground">
            <CircleUserRound strokeWidth={1} class="mr-2 h-6 w-6 sm:h-10 sm:w-10" />
            <span class="hidden sm:inline">Hola</span>
            {user.username}
        </Button>
        <form method="post" action="/api/logout" use:enhanceLogout>
            <Button type="submit" variant="ghost" class="text-base text-primary-foreground">
                Logout
            </Button>
        </form>
    </div>
{:else}
    <Button
        variant="ghost"
        class="text-base text-primary-foreground"
        on:click={() => goto("/login")}
    >
        <CircleUserRound strokeWidth={1} class="mr-1 h-6 w-6 sm:mr-2 sm:h-10 sm:w-10" />
        <span class="hidden sm:inline">Login</span>
    </Button>
{/if}
