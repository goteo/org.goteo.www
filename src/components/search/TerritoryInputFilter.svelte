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
    }

    let {
        value = $bindable(""),
        label = "",
        placeholder = "",
        onTerritoryDetected,
    }: Props = $props();

    const inputId = `territory-input-${Math.random().toString(36).slice(2, 9)}`;

    async function handleValidation(text: string) {
        // Si el campo está vacío, reseteamos los filtros de territorio en el store
        if (!text || text.trim().length < 2) {
            return;
        }

        // Llamada al servicio fetch de Nominatim
        const result = await nominatim.findIsoByText(text);

        // Enviamos los datos encontrados (o nulls si no hubo match) al padre
        onTerritoryDetected({
            rawQuery: text || "",
            territory: result,
        });
    }
</script>

<div class="flex w-full flex-col gap-1.5">
    {#if label}
        <label for={inputId} class="text-secondary text-sm font-medium">
            {label}
        </label>
    {/if}

    <SearchInput
        id={inputId}
        {value}
        {placeholder}
        label=""
        onSearch={(text) => (value = text)}
        onEnter={() => handleValidation(value)}
        onBlur={() => handleValidation(value)}
        data-testid="territory-search-input"
    />
</div>
