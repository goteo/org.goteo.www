<script lang="ts">
    import { Button } from "$lib/components/ui/button";
    import { Bookmark } from "lucide-svelte";

  export let label: string;

  const categoryMap: Record<string, string> = {
    "solidary": "Solidario",
    "libre-software": "Software Libre",
    "employment": "Generar empleo",
    "design": "Desde el diseño",
    "journalism": "Periodismo independiente",
    "education": "Educativo",
    "culture": "Crea culture",
    "ecology": "Ecológico",
    "health-and-cares": "Salud y cuidados",
    "open-data": "Datos abiertos",
    "democracy": "Democracia y participación",
    "equity": "Igualdad de género"
  };

  const displayLabel = categoryMap[label] || label;
</script>

<Button variant="outline" size="sm" class="border-black">
  <Bookmark class="mr-2" />
  {displayLabel}
</Button>
