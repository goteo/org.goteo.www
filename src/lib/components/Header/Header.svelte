<script lang="ts">
    import { Menu, CircleUserRound } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import Logo from "./Logo.svg";
    import Bag from "./bag.svg";
</script>

<header class="bg-primary px-10 py-6">
    <div class="mx-auto flex items-center justify-between">
        <img src={Logo} alt="Goteo Logo" width={100} height={32} class="h-8 w-auto" />
        <div class="flex items-center gap-4">
            <Button variant="ghost" class="text-base text-primary-foreground"
                ><CircleUserRound strokeWidth={1} class="mr-2 h-10 w-10" /> Hola Richard</Button
            >
            <Button variant="ghost" size="icon" class="h-10 w-10">
                <img src={Bag} alt="Bag" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                class="h-10 w-10 bg-primary-foreground text-primary"
            >
                <Menu />
            </Button>
        </div>
    </div>
</header>
