<script lang="ts">
    import { t } from "../i18n/store";
    import { onMount } from "svelte";
    import ClockIcon from "../svgs/ClockIcon.svelte";

    /* TODO: Setup custom time*/
    let countdownEnd = new Date("2025-03-23T23:59:59-05:00").getTime();
    let timeLeft = calculateTimeLeft();

    onMount(() => {
        const interval = setInterval(() => {
            timeLeft = calculateTimeLeft();
            if (timeLeft.total !== undefined && timeLeft.total <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    });

    function calculateTimeLeft() {
        let now = new Date().getTime();
        let difference = countdownEnd - now;

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

<div>
    {#if timeLeft.total > 0}
        <div class="text-tertiary flex items-center gap-2 text-2xl/[32px] font-bold">
            <ClockIcon />
            <p>{$t("countdown.remaining")}</p>
            <div class="flex items-center gap-1">
                <p class="flex items-center">{timeLeft.days}d</p>
                <p class="flex items-center">{timeLeft.hours}h</p>
                <p class="flex items-center">{timeLeft.minutes}m</p>
            </div>
        </div>
    {:else}
        <p>{$t("countdown.finished")}</p>
    {/if}
</div>
