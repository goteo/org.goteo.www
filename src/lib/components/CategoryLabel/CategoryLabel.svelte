<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Bookmark } from "lucide-svelte";

    export let label: string;
</script>

<Button variant="outline" size="sm" class="border-black">
    <Bookmark class="mr-2" />
    {label}
</Button>
