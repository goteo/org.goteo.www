<script lang="ts">
    let { location }: { location: string & Location } = $props();

    $effect(() => {
        window.location = location;
    });
</script>
