<script lang="ts">
    import { onMount } from "svelte";

    import { t } from "../i18n/store";
    import ClockIcon from "../svgs/ClockIcon.svelte";

    export let deadline: Date | undefined = undefined;

    let timeLeft: {
        total: number;
        days?: number;
        hours?: number;
        minutes?: number;
        seconds?: number;
    } = { total: 0 };

    if (deadline) {
        const now = new Date().getTime();
        const diff = deadline.getTime() - now;
        if (diff > 0) {
            timeLeft = calculateTimeLeft();
        }
    }

    onMount(() => {
        if (!deadline) return;

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
        const difference = deadline!.getTime() - now;

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

<div class="text-secondary flex items-center gap-2 text-end text-2xl font-bold lg:justify-end">
    {#if timeLeft.total > 0}
        <ClockIcon />
        <p>{$t("countdown.remaining")} {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</p>
    {:else}
        <ClockIcon />
        <p>{$t("countdown.expired")}</p>
    {/if}
</div>
