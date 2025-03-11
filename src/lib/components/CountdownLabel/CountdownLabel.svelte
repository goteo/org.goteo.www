<script lang="ts">
    import { Clock } from "lucide-svelte";
    import { _ } from "svelte-i18n";
    import { onMount, onDestroy } from "svelte";
    import { locale } from "svelte-i18n";

    export let deadline: Date;

    let days = 0;
    let hours = 0;
    let minutes = 0;
    let formattedTime = "";
    let intervalId: ReturnType<typeof setInterval>;

    function updateCountdown() {
        const now = new Date();
        const diff = deadline.getTime() - now.getTime();

        if (diff <= 0) {
            // Deadline has passed
            formattedTime = $_("countdown.ended");
            return;
        }

        // Calculate days, hours, minutes
        days = Math.floor(diff / (1000 * 60 * 60 * 24));
        hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Format with two digits in the format: XXd XXh XXm
        formattedTime = `${days.toString().padStart(2, "0")}d ${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
    }

    // Update when locale changes
    $: $locale, updateCountdown();

    onMount(() => {
        updateCountdown();
        // Update countdown every minute
        intervalId = setInterval(updateCountdown, 60000);
    });

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
    });
</script>

<div class="flex items-center gap-2 text-2xl font-medium text-primary-foreground">
    <Clock size={32} />
    <span>{$_("countdown.remaining", { values: { time: formattedTime } })}</span>
</div>
