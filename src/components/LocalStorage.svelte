<script lang="ts">
    let { set = {}, remove = [] }: { set: any; remove: string[] } = $props();

    $effect(() => {
        const toSet = Object.entries(set || {});

        for (const [key, value] of toSet) {
            localStorage.setItem(key, JSON.stringify(value));
        }
    });

    $effect(() => {
        const toRemove = remove;

        for (const key of toRemove) {
            localStorage.removeItem(key);
        }
    });
</script>
