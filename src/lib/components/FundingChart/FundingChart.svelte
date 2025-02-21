<script lang="ts">
  import * as Card from "$lib/components/ui/card";
</script>

<Card.Root class="basis-2/3 bg-white/50">
  <Card.Content class="space-y-8">
    <div class="space-y-2">
      <div class="text-sm">
        <span class="font-medium">Mínimo: </span>
        <span>100.000€</span>
      </div>
      <div class="relative h-8">
        <div class="absolute inset-0 flex rounded-lg overflow-hidden">
          <div class="w-[40%] bg-primary-foreground" />
          <div class="w-[35%] bg-destructive" />
          <div class="w-[25%] bg-primary" />
        </div>
        <div
          class="absolute top-1/2 -translate-y-1/2 left-[38%] w-1.5 h-1.5 rounded-full bg-black"
          role="progressindicator"
          aria-label="Estado de la campaña"
        />
      </div>
    </div>

    <div class="space-y-2">
      <div class="text-sm">
        <span class="font-medium">Óptimo: </span>
        <span>150.000€</span>
      </div>
      <div class="relative h-8">
        <div class="absolute inset-0 flex rounded-lg overflow-hidden">
          <div class="w-[45%] bg-primary-foreground" />
          <div class="w-[30%] bg-destructive" />
          <div class="w-[25%] bg-primary" />
        </div>
        <div
          class="absolute top-1/2 -translate-y-1/2 left-[42%] w-1.5 h-1.5 rounded-full bg-black"
          role="progressindicator"
          aria-label="Estado de la campaña"
        />
      </div>
    </div>
  </Card.Content>
  <Card.Footer class="flex justify-end gap-6 text-sm">
    <div class="flex items-center gap-2">
      <div class="h-3 w-3 rounded bg-primary-foreground" />
      <span>Infraestructura</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-3 w-3 rounded bg-destructive" />
      <span>Material</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-3 w-3 rounded bg-primary" />
      <span>Tarea</span>
    </div>
    <div class="flex items-center gap-2">
      <div class="h-1.5 w-1.5 rounded-full bg-black" />
      <span>Estado de la campaña</span>
    </div>
  </Card.Footer>
</Card.Root>
