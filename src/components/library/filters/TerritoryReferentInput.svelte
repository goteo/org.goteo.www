<script lang="ts">
    import TerritoryInput, { type Territories } from "../inputs/TerritoryInput.svelte";

    interface Props {
        value?: string;
        onChange: (value: string) => void;
        labelText?: string;
    }

    let { value = "", onChange, labelText }: Props = $props();

    let selectedTerritory = $derived(value ? (JSON.parse(value) as Territories) : undefined);
</script>

<TerritoryInput
    multiple
    {selectedTerritory}
    placeholder={labelText}
    onTerritoryChange={(territories) => onChange(JSON.stringify(territories))}
/>
