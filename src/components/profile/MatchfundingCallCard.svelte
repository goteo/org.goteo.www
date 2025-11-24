<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatAmountWithSymbol } from "../../utils/currencies";
    import type { MatchfundingCall } from "../../types/me-page";

    interface Props {
        /**
         * Current language locale
         */
        lang: string;

        /**
         * Matchfunding call data
         */
        call: MatchfundingCall;
    }

    let { lang, call }: Props = $props();

    const formattedDonation = $derived(
        call?.donationAmount
            ? formatAmountWithSymbol(call.donationAmount.amount, call.donationAmount.currency, lang)
            : "",
    );

    const callUrl = $derived(
        lang === "es" ? `/matchfunding/${call.slug}` : `/${lang}/matchfunding/${call.slug}`,
    );
</script>

<!-- Hero-style Matchfunding Card -->
<div
    class="relative box-border flex w-full flex-col items-start justify-center gap-2 overflow-hidden rounded-[32px] px-0 py-8 md:py-12 lg:py-16"
>
    <!-- Background Image -->
    {#if call.imageUrl}
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 rounded-[32px]">
            <div class="absolute inset-0 overflow-hidden rounded-[32px]">
                <img
                    alt=""
                    src={call.imageUrl}
                    class="absolute top-0 left-0 size-full object-cover"
                />
            </div>
        </div>
    {/if}

    <!-- Content Container -->
    <div
        class="relative z-10 box-border flex w-full flex-col items-center gap-6 px-6 py-0 md:flex-row md:gap-8 md:px-10 lg:px-16"
    >
        <!-- Left Content: Title, Stats, Button -->
        <div
            class="flex min-h-0 min-w-0 flex-1 flex-col items-start justify-end gap-6 md:gap-8 lg:gap-10"
        >
            <!-- Title and Stats Section -->
            <div class="flex w-full flex-col gap-4">
                <!-- Title -->
                <div class="flex w-full flex-col gap-2">
                    <h3
                        class="text-background min-w-full text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
                    >
                        {call.title}
                    </h3>
                </div>

                <!-- Stats Row (Horizontal on desktop, vertical on mobile) -->
                <div class="flex w-full flex-col items-start gap-4 md:h-16 md:flex-row md:gap-6">
                    <!-- Donation Amount -->
                    <div class="text-background flex flex-col items-start">
                        <p class="text-base leading-normal font-normal">
                            {$t("me.matchfunding.callCard.donationCall")}
                        </p>
                        <p class="text-2xl leading-snug font-bold md:text-3xl">
                            {formattedDonation}
                        </p>
                    </div>

                    <!-- Participating Projects -->
                    <div class="text-background flex flex-col items-start">
                        <p class="text-base leading-normal font-normal">
                            {$t("me.matchfunding.callCard.participatingProjects")}
                        </p>
                        <p class="text-2xl leading-snug font-bold md:text-3xl">
                            {call.participatingProjects}
                            {$t("me.matchfunding.callCard.projects")}
                        </p>
                    </div>

                    <!-- Successful Projects -->
                    <div class="text-background flex flex-col items-start">
                        <p class="text-base leading-normal font-normal">
                            {$t("me.matchfunding.callCard.successfulProjects")}
                        </p>
                        <p class="text-2xl leading-snug font-bold md:text-3xl">
                            {call.successfulProjects}
                            {$t("me.matchfunding.callCard.projects")}
                        </p>
                    </div>
                </div>
            </div>

            <!-- Call to Action Button -->
            <a
                href={callUrl}
                class="bg-variant1 text-secondary focus:ring-primary flex items-center justify-center gap-2 rounded-3xl px-6 py-4 text-base leading-normal font-bold no-underline transition-all duration-200 hover:opacity-90 focus:ring-2 focus:outline-none"
            >
                {$t("me.matchfunding.callCard.viewCall")}
            </a>
        </div>

        <!-- Right: Logo Card -->
        {#if call.logo}
            <div
                class="border-grey bg-background flex size-48 shrink-0 flex-col items-center justify-center gap-2 rounded-[32px] border border-solid p-8 md:size-56 lg:size-64"
            >
                <div class="relative aspect-[250/124] w-full shrink-0">
                    <img
                        alt={call.title}
                        src={call.logo}
                        class="pointer-events-none absolute inset-0 size-full max-w-none object-contain object-center"
                    />
                </div>
            </div>
        {/if}
    </div>
</div>
