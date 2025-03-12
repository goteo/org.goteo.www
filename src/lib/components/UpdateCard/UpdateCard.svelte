<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import type { ButtonEventHandler } from "bits-ui";

    export let image: string = "https://placehold.co/256";

    function action(e: ButtonEventHandler<MouseEvent>): void {
        throw new Error("Function not implemented.");
    }
</script>

<Card.Root class="w-full max-w-3xl drop-shadow-sm">
    <Card.Header>
        <p class="text-xl font-bold">01 Dic. 2024</p>
        <img src={image} alt="Reward" class="h-64 w-full object-cover rounded-3xl" />
        <Card.Title tag="h1" class="text-3xl font-bold">Esto es todo un apoyo</Card.Title>
    </Card.Header>
    <Card.Content>
        <h2 class="text-base font-medium">
            Donación superior a 2.500 euros a la campaña. ¡Super-agradecimiento!
        </h2>
        <p>
            Llevamos años demostrando que otro mundo es posible. En esta plataforma, sin ir más
            lejos, tenemos todo un catálogo de iniciativas que demuestran que hay esperanza.
        </p>
    </Card.Content>
    <Card.Footer class="justify-end">
        <Button variant="outline" size="lg" class="" on:click={action}>Seguir leyendo</Button>
    </Card.Footer>
</Card.Root>
