<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Bookmark } from "lucide-svelte";
    import { t } from "$lib/i18n";

    export let label: string;

    // Use the categories namespace in the translation files
    const displayLabel = $t(`categories.${label}`);
</script>

<Button variant="outline" size="sm" class="border-black">
    <Bookmark class="mr-2" />
    {displayLabel || label}
</Button>
