<script lang="ts">
    import { t } from "../../i18n/store";

    import { getUnit } from "../../utils/currencies";

    import type { ActivityData } from "../../types/me-page";

    interface Props {
        /**
         * Card type (determines behavior and content)
         */
        type: "donations" | "projects";

        /**
         * Current language locale
         */
        lang: string;

        /**
         * Optional activity data for filled state
         * If undefined/null, shows empty state
         */
        data?: ActivityData;
    }

    let { type, lang, data }: Props = $props();

    function getCurrencySymbol(locale: string, currency: string) {
        try {
            const parts = new Intl.NumberFormat(locale, {
                style: "currency",
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).formatToParts(0);
            const currencyPart = parts.find((part) => part.type === "currency");
            return currencyPart?.value ?? currency;
        } catch (error) {
            console.warn("Failed to derive currency symbol", error);
            return currency;
        }
    }

    function formatAmountWithSymbol(amount?: number, currency?: string | null) {
        if (amount === undefined) return "";
        const normalizedCurrency = currency ?? "EUR";
        const unit = getUnit(normalizedCurrency) || 1;
        const value = amount / unit;
        const needsDecimals = Math.abs(value % 1) > Number.EPSILON;
        const digits = needsDecimals ? 2 : 0;
        const formattedNumber = new Intl.NumberFormat(lang, {
            minimumFractionDigits: digits,
            maximumFractionDigits: 2,
        }).format(value);
        const symbol = getCurrencySymbol(lang, normalizedCurrency);
        return `${formattedNumber}${symbol}`;
    }

    const fallbackProjectTitle = $derived(lang === "es" ? "Proyecto" : "Project");

    // Determine if this card has data (check for count > 0, not just object existence)
    const hasData = $derived(
        type === "donations"
            ? !!(data?.donations && data.donations.count > 0)
            : !!(data?.projects && data.projects.count > 0),
    );

    // Get type-specific data
    const activityData = $derived(type === "donations" ? data?.donations : data?.projects);

    // Get featured project for projects card
    const featuredProject = $derived(
        type === "projects" ? data?.projects?.featuredProject : undefined,
    );

    // Translation keys based on card type
    const translationBase = $derived(type === "donations" ? "me.donations" : "me.projects");

    // Get title from translations
    const title = $derived($t(`${translationBase}.title`));

    // Empty state properties
    const emptyMessage = $derived($t(`${translationBase}.empty`));
    const emptyCtaLabel = $derived(
        type === "donations" ? $t("me.donations.explore") : $t("me.projects.create"),
    );
    const emptyCtaLink = $derived(
        type === "donations" ? $t("me.donations.ctaLink") : $t("me.projects.ctaLink"),
    );
    const illustrationPath = $derived(
        type === "donations" ? $t("me.donations.illustration") : $t("me.projects.illustration"),
    );

    // Filled state formatting
    const formattedTotal = $derived(
        type === "donations" && data?.donations?.total
            ? formatAmountWithSymbol(data.donations.total.amount, data.donations.total.currency)
            : type === "projects" && data?.projects?.totalRaised
              ? formatAmountWithSymbol(
                    data.projects.totalRaised.amount,
                    data.projects.totalRaised.currency,
                )
              : "",
    );

    // Format obtained amount (for projects with featured data)
    const formattedObtained = $derived(
        type === "projects" && featuredProject?.funding?.obtained
            ? formatAmountWithSymbol(
                  featuredProject.funding.obtained.amount,
                  featuredProject.funding.obtained.currency,
              )
            : "",
    );

    // Format minimum goal (for projects with featured data)
    const formattedMinimum = $derived(
        type === "projects" && featuredProject?.funding?.minimum
            ? formatAmountWithSymbol(
                  featuredProject.funding.minimum.amount,
                  featuredProject.funding.minimum.currency,
              )
            : "",
    );

    // Check if optimum goal is reached
    const isOptimumReached = $derived(
        type === "projects" && featuredProject?.badgeVariant === "optimumReached",
    );

    // Get badge text based on variant
    const badgeText = $derived(
        featuredProject?.badgeVariant
            ? $t(`me.projects.badge.${featuredProject.badgeVariant}`)
            : "",
    );

    // Action handlers for filled state
    async function handleCertificateRequest() {
        // TODO: Implement certificate request action
        // Will call POST /v4/users/me/certificates
    }
</script>

{#if hasData}
    <!-- Filled State -->
    {#if type === "projects" && featuredProject}
        <!-- Projects Card with Featured Project -->
        <div
            class="relative box-border flex flex-col gap-[8px] overflow-clip rounded-[32px] border border-[#f3f3ef] bg-[#fbfbfb] p-[24px]"
        >
            <div class="flex flex-col gap-[24px]">
                <!-- Achievement Badge (top-right overlay) -->
                {#if isOptimumReached}
                    <div class="absolute top-[16px] right-[16px] z-10 rounded-[8px] bg-[#fbfbfb]">
                        <div
                            class="box-border flex items-center justify-center gap-[8px] rounded-[8px] border border-[#462949] px-[8px] py-[4px]"
                        >
                            <p
                                class="font-['Karla'] text-[12px] leading-[16px] font-medium text-nowrap whitespace-pre text-[#462949]"
                            >
                                {badgeText}
                            </p>
                        </div>
                    </div>
                {/if}

                <!-- Hero Image -->
                {#if featuredProject.imageUrl}
                    <div class="h-[215px] w-full shrink-0 overflow-hidden rounded-[24px]">
                        <img
                            src={featuredProject.imageUrl}
                            alt={featuredProject.title}
                            class="size-full object-cover"
                        />
                    </div>
                {:else}
                    <div
                        class="flex h-[215px] w-full shrink-0 items-center justify-center rounded-[24px] bg-[#f3f3ef]"
                    >
                        <p class="font-['Karla'] text-[14px] leading-[20px] text-[#575757]">
                            {fallbackProjectTitle}
                        </p>
                    </div>
                {/if}

                <!-- Tags Section -->
                <div class="flex w-full shrink-0 items-start gap-[8px]">
                    <!-- Time Remaining Tag -->
                    {#if featuredProject.daysLeft !== null && featuredProject.daysLeft !== undefined}
                        <div
                            class="box-border flex shrink-0 items-center justify-center gap-[8px] rounded-[4px] border border-[#faf9ff] bg-[#f3f3ef] px-[8px] py-[4px]"
                        >
                            <!-- Clock Icon -->
                            <div class="relative size-[32px] shrink-0 overflow-clip">
                                <svg
                                    class="size-full"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
                                        stroke="#462949"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                    <path
                                        d="M12 7V12L15 15"
                                        stroke="#462949"
                                        stroke-width="1.5"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </div>
                            <p
                                class="font-['Karla'] text-[14px] leading-[24px] font-bold text-nowrap whitespace-pre text-[#462949]"
                            >
                                {lang === "es"
                                    ? `Quedan ${featuredProject.daysLeft} días`
                                    : `${featuredProject.daysLeft} days left`}
                            </p>
                        </div>
                    {/if}

                    <!-- Category Tag -->
                    {#if featuredProject.category}
                        <div
                            class="box-border flex shrink-0 items-center justify-center gap-[8px] rounded-[4px] border border-[#faf9ff] bg-[#f3f3ef] px-[8px] py-[4px]"
                        >
                            <!-- Category Icon -->
                            <div class="relative size-[32px] shrink-0 overflow-clip">
                                <svg
                                    class="size-full"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                                        stroke="#462949"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M12 3C12 3 15 7 15 12C15 17 12 21 12 21"
                                        stroke="#462949"
                                        stroke-width="1.5"
                                    />
                                    <path
                                        d="M12 3C12 3 9 7 9 12C9 17 12 21 12 21"
                                        stroke="#462949"
                                        stroke-width="1.5"
                                    />
                                    <path d="M3 12H21" stroke="#462949" stroke-width="1.5" />
                                </svg>
                            </div>
                            <p
                                class="overflow-hidden font-['Karla'] text-[14px] leading-[24px] font-bold text-nowrap overflow-ellipsis whitespace-pre text-[#462949]"
                            >
                                {featuredProject.category}
                            </p>
                        </div>
                    {/if}
                </div>

                <!-- Project Title -->
                <div class="flex h-[64px] w-full shrink-0 flex-col gap-[8px]">
                    <p
                        class="line-clamp-2 w-full overflow-hidden font-['Karla'] text-[24px] leading-[32px] font-bold overflow-ellipsis text-[#462949]"
                        style="-webkit-box-orient: vertical; display: -webkit-box; -webkit-line-clamp: 2;"
                    >
                        {featuredProject.title}
                    </p>
                </div>

                <!-- Stats Section -->
                <div class="flex w-full shrink-0 items-start justify-between">
                    <!-- Obtained Amount -->
                    <div
                        class="flex shrink-0 flex-col gap-[4px] font-['Karla'] font-bold text-nowrap whitespace-pre text-[#3d3d3d]"
                    >
                        <p class="text-[16px] leading-[24px]">
                            {lang === "es" ? "Obtenido" : "Obtained"}
                        </p>
                        <p class="text-[32px] leading-[40px]">{formattedObtained}</p>
                    </div>

                    <!-- Minimum Goal -->
                    <div
                        class="flex min-h-px min-w-px grow basis-0 items-start justify-end gap-[16px] self-stretch"
                    >
                        <div
                            class="flex shrink-0 flex-col gap-[8px] font-['Karla'] font-bold text-[#3d3d3d]"
                        >
                            <p class="w-full text-[16px] leading-[24px]">
                                {lang === "es" ? "Mínimo" : "Minimum"}
                            </p>
                            <p class="w-full text-[24px] leading-[32px]">{formattedMinimum}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex w-full shrink-0 gap-[16px]">
                <button
                    class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] border border-[#462949] px-[24px] py-[16px] font-['Karla'] text-[16px] leading-[24px] font-bold text-[#462949] transition-all duration-200 hover:bg-[#46294910]"
                >
                    {lang === "es" ? "Mensaje a donantes" : "Message to donors"}
                </button>
                <a
                    href={lang === "es"
                        ? `/projects/${featuredProject.slug}/news/new`
                        : `/${lang}/projects/${featuredProject.slug}/news/new`}
                    class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] bg-[#e6e5f7] px-[24px] py-[16px] font-['Karla'] text-[16px] leading-[24px] font-bold text-[#462949] no-underline transition-all duration-200 hover:opacity-90"
                >
                    {lang === "es" ? "Subir novedad" : "Post update"}
                </a>
            </div>
        </div>
    {:else}
        <!-- Simple Donations or Projects Card (without featured project) -->
        <div
            class="relative box-border flex min-h-[384px] flex-col justify-between overflow-clip rounded-[32px] border border-[#f3f3ef] bg-[#fbfbfb] p-[24px]"
        >
            <!-- Header with title -->
            <div class="relative z-10 mb-[16px]">
                <h2 class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                    {title}
                </h2>
            </div>

            <!-- Stats section -->
            <div class="relative z-10 mb-[16px] flex items-start justify-between gap-[16px]">
                <div class="flex flex-col gap-[4px]">
                    <p class="font-['Karla'] text-[12px] leading-[16px] font-medium text-[#575757]">
                        {$t(`${translationBase}.count`)}
                    </p>
                    <p class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                        {activityData?.count ?? 0}
                    </p>
                </div>
                <div class="flex flex-col gap-[4px] text-right">
                    <p class="font-['Karla'] text-[12px] leading-[16px] font-medium text-[#575757]">
                        {type === "donations" ? $t("me.donations.total") : $t("me.projects.raised")}
                    </p>
                    <p class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                        {formattedTotal}
                    </p>
                </div>
            </div>

            <!-- Recent items list -->
            <div class="relative z-10 mb-[16px] flex min-h-[120px] flex-grow flex-col gap-[12px]">
                <h3 class="font-['Karla'] text-[16px] leading-[24px] font-bold text-[#3d3d3d]">
                    {$t(`${translationBase}.recent`)}
                </h3>
                <ul class="flex flex-col gap-[8px]">
                    {#if type === "donations" && data?.donations?.recentDonations}
                        {#each data.donations.recentDonations.slice(0, 2) as donation}
                            <li class="flex flex-wrap items-center gap-[8px]">
                                <span
                                    class="font-['Karla'] text-[14px] leading-[20px] font-semibold text-[#3d3d3d]"
                                >
                                    {formatAmountWithSymbol(
                                        donation.amount.amount,
                                        donation.amount.currency,
                                    )}
                                </span>
                                <span
                                    class="font-['Karla'] text-[14px] leading-[20px] font-semibold text-[#3d3d3d]"
                                >
                                    -
                                </span>
                                <a
                                    href={lang === "es"
                                        ? `/projects/${donation.projectSlug}`
                                        : `/${lang}/projects/${donation.projectSlug}`}
                                    class="font-['Karla'] text-[14px] leading-[20px] font-normal text-[#462949] no-underline hover:underline"
                                >
                                    {donation.projectTitle || fallbackProjectTitle}
                                </a>
                            </li>
                        {/each}
                    {:else if type === "projects" && data?.projects?.recentProjects}
                        {#each data.projects.recentProjects.slice(0, 2) as project}
                            <li class="flex items-start gap-[8px]">
                                <a
                                    href={lang === "es"
                                        ? `/projects/${project.slug}`
                                        : `/${lang}/projects/${project.slug}`}
                                    class="font-['Karla'] text-[14px] leading-[20px] font-normal text-[#575757] no-underline hover:text-[#462949]"
                                >
                                    {project.title}
                                </a>
                            </li>
                        {/each}
                    {/if}
                </ul>
            </div>

            <!-- Actions -->
            <div
                class="relative z-10 flex w-full shrink-0 flex-col gap-[12px] md:flex-row md:gap-[16px]"
            >
                <a
                    href={lang === "es"
                        ? type === "donations"
                            ? "/me/donations"
                            : "/me/projects"
                        : `/${lang}/me/${type === "donations" ? "donations" : "projects"}`}
                    class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] bg-[#e6e5f7] px-[24px] py-[12px] font-['Karla'] text-[14px] leading-[20px] font-bold text-[#462949] no-underline transition-all duration-200 hover:opacity-90 md:py-[16px] md:text-[16px] md:leading-[24px]"
                >
                    {$t(`${translationBase}.viewAll`)}
                </a>
                {#if type === "donations"}
                    <button
                        onclick={handleCertificateRequest}
                        class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] border border-[#462949] bg-transparent px-[24px] py-[12px] font-['Karla'] text-[14px] leading-[20px] font-bold text-[#462949] transition-all duration-200 hover:bg-[#46294910] md:py-[16px] md:text-[16px] md:leading-[24px]"
                    >
                        {$t("me.donations.certificate")}
                    </button>
                {:else}
                    <a
                        href={lang === "es" ? "/projects/new" : `/${lang}/projects/new`}
                        class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] border border-[#462949] bg-transparent px-[24px] py-[12px] font-['Karla'] text-[14px] leading-[20px] font-bold text-[#462949] no-underline transition-all duration-200 hover:bg-[#46294910] md:py-[16px] md:text-[16px] md:leading-[24px]"
                    >
                        {$t("me.projects.createNew")}
                    </a>
                {/if}
            </div>
        </div>
    {/if}
{:else}
    <!-- Empty State -->
    <div
        class="relative box-border flex min-h-[384px] flex-col items-center justify-between overflow-clip rounded-[32px] border border-[#f3f3ef] bg-[#fbfbfb] p-[24px]"
    >
        <!-- Decorative illustration - positioned exactly as in Figma -->
        <div
            class="absolute top-[calc(50%+48.5px)] left-[calc(50%-126px)] h-[389px] w-[389px] -translate-x-1/2 -translate-y-1/2 opacity-[0.04]"
            style="color: #462949;"
            aria-hidden="true"
        >
            <img
                src={illustrationPath}
                alt=""
                class="size-full object-contain"
                aria-hidden="true"
            />
        </div>

        <!-- Content - centered and takes up available space -->
        <div
            class="relative z-10 flex min-h-px min-w-px grow basis-0 flex-col items-center justify-center gap-[4px] text-center"
        >
            <h2
                class="w-full shrink-0 font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]"
            >
                {title}
            </h2>
            <p
                class="w-full shrink-0 font-['Karla'] text-[16px] leading-[24px] font-normal text-[#575757]"
            >
                {emptyMessage}
            </p>
        </div>

        <!-- Actions -->
        <div class="relative z-10 flex w-full shrink-0 gap-[16px]">
            <a
                href={emptyCtaLink}
                class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] bg-[#e6e5f7] px-[24px] py-[16px] font-['Karla'] text-[16px] leading-[24px] font-bold text-[#462949] no-underline transition-all duration-200 hover:opacity-90"
            >
                {emptyCtaLabel}
            </a>
        </div>
    </div>
{/if}
