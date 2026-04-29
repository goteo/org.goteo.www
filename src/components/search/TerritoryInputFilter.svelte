<script lang="ts">
    import SearchInput from "./SearchInput.svelte";
    import { nominatim } from "../../services/nominatim";

    import type { Territory } from "../../openapi/client";

    interface TerritoryData {
        rawQuery: string;
        territory: Territory | null;
    }

    interface Props {
        value?: string;
        label?: string;
        placeholder?: string;
        onTerritoryDetected: (data: TerritoryData) => void;
        id?: string;
    }

    let {
        value = $bindable(""),
        label = "",
        placeholder = "",
        onTerritoryDetected,
        id  = `territory-input-${crypto.randomUUID().slice(0, 8)}`,
    }: Props = $props();

   
    async function handleValidation(text: string) {
        if (!text || text.trim().length < 2) return;
        // Call to the Nominatim fetch service
        const result = await nominatim.findIsoByText(text);

        onTerritoryDetected({
            rawQuery: text,
            territory: result,
        });
    }
</script>

<div class="flex w-full flex-col gap-1.5">
    {#if label}
         <label for={id} class="text-secondary text-sm font-medium">    {label}
        </label>
    {/if}

    <SearchInput
        {id}
        {value}
        {placeholder}
        label=""
        onSearch={(text) => (value = text)}
        onEnter={() => handleValidation(value)}
        onBlur={() => handleValidation(value)}
        
    />
</div>
