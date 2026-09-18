<script lang="ts">
    import { clearForUser } from "../../stores/checkoutsStore";

    let { userId }: { userId: number } = $props();

    $effect(() => {
        clearForUser(userId);
    });
</script>
