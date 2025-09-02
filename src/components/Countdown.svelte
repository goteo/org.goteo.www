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
    let errorMessage = "";

    if (!countdownEnd) {
        errorMessage = $t("countdown.error.not-found");
    } else {
        const now = new Date().getTime();
        const diff = countdownEnd.getTime() - now;
        if (diff <= 0) {
            errorMessage = $t("countdown.expired");
        } else {
            timeLeft = calculateTimeLeft();
        }
    }

    onMount(() => {
        if (errorMessage || !countdownEnd) return;

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
    <ClockIcon />
    {#if errorMessage}
        <p>{errorMessage}</p>
    {:else if timeLeft.total > 0}
        <p>{$t("countdown.remaining")}</p>
        <div class="flex items-center gap-1">
            <p>{timeLeft.days}d</p>
            <p>{timeLeft.hours}h</p>
            <p>{timeLeft.minutes}m</p>
        </div>
    {:else}
        <p>{$t("countdown.expired")}</p>
    {/if}
</div>
