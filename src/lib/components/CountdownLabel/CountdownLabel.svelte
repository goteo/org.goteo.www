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
            formattedTime = $_("countdown.ended") || "Campaña finalizada";
            return;
        }

        // Calculate days, hours, minutes
        days = Math.floor(diff / (1000 * 60 * 60 * 24));
        hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        // Use Intl.RelativeTimeFormat for human-readable relative time
        try {
            const rtf = new Intl.RelativeTimeFormat($locale, {
                numeric: "always",
                style: "long",
            });

            // Choose the most appropriate unit
            if (days > 0) {
                formattedTime = rtf.format(days, "day");
            } else if (hours > 0) {
                formattedTime = rtf.format(hours, "hour");
            } else {
                formattedTime = rtf.format(minutes, "minute");
            }
        } catch (e) {
            // Fallback for browsers that don't support RelativeTimeFormat
            formattedTime = `${days}d ${hours}h ${minutes}m`;
        }
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
    <span>{formattedTime}</span>
</div>
