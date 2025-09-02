<script lang="ts">
    import { t } from "../i18n/store";
    import { onMount } from "svelte";
    import ClockIcon from "../svgs/ClockIcon.svelte";

    export let countdownEnd: Date | undefined = undefined;

    let timeLeft: {
        total: number;
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
    } = { total: 0 };

    if (countdownEnd) {
        const now = new Date().getTime();
        const diff = countdownEnd.getTime() - now;
        if (diff > 0) {
            timeLeft = calculateTimeLeft();
        }
    }

    onMount(() => {
        if (!countdownEnd) return;

        const interval = setInterval(() => {
            timeLeft = calculateTimeLeft();
            if (timeLeft.total <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    });

    function calculateTimeLeft() {
        const now = new Date().getTime();
        const difference = countdownEnd!.getTime() - now;

        return difference > 0
            ? {
                  days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                  minutes: Math.floor((difference / 1000 / 60) % 60),
                  seconds: Math.floor((difference / 1000) % 60),
                  total: difference,
              }
            : { total: 0 };
    }
</script>

<div class="text-tertiary flex items-center justify-end gap-2 text-end text-2xl font-bold">
    {#if timeLeft.total > 0}
        <ClockIcon />
        <p>{$t("countdown.remaining")} {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</p>
    {:else}
        <ClockIcon />
        <p>{$t("countdown.expired")}</p>
    {/if}
</div>
