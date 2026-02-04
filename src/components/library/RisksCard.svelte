<script lang="ts">
    import Button from "./Button.svelte";
    import Tag from "./Tag.svelte";
</script>

<article class="flex flex-col p-6 rounded-2xl gap-8 border border-variant1 bg-soft-purple w-full max-w-[437px]">
    <div class="flex flex-col gap-4">
        <div class="flex justify-between">
            <div class="flex flex-col gap-1">
                <h2 class="text-secondary text-2xl font-bold">Configuración</h2>
                <span class="text-content text-sm/4">32 chats. Última actividad 12/11/2025</span>
            </div>
            <Tag variant="success">Riesgo bajo</Tag>
        </div>
        <p class="text-base text-content w-full min-h-24 max-h-24 overflow-hidden overflow-ellipsis">
            Lorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit ametLorem
            ipsum dolor sit ametLorem ipsum dolor sit ametLorem ipsum dolor sit amet
        </p>
    </div>
    <div class="flex justify-between">
        <Button kind="ghost">Ver conversación</Button>
        <Button kind="secondary">Cambiar riesgo</Button>
    </div>
</article>
