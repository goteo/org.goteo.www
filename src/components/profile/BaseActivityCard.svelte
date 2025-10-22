<script lang="ts">
    import { t } from "../../i18n/store";
    import type { Snippet } from "svelte";

    interface Props {
        /**
         * Card title translation key
         */
        titleKey: string;

        /**
         * Left stat label translation key
         */
        leftStatLabel: string;

        /**
         * Left stat value (formatted)
         */
        leftStatValue: string | number;

        /**
         * Right stat label translation key
         */
        rightStatLabel: string;

        /**
         * Right stat value (formatted)
         */
        rightStatValue: string;

        /**
         * Recent items section title translation key
         */
        recentTitleKey: string;

        /**
         * Path to decorative illustration
         */
        illustrationPath: string;

        /**
         * Primary action button label translation key
         */
        primaryActionLabel: string;

        /**
         * Primary action button href
         */
        primaryActionHref: string;

        /**
         * Secondary action button label translation key
         */
        secondaryActionLabel: string;

        /**
         * Secondary action button href
         */
        secondaryActionHref: string;

        /**
         * Whether the card is in empty state
         */
        isEmpty?: boolean;

        /**
         * Empty state message translation key
         */
        emptyMessageKey?: string;

        /**
         * Empty state CTA label translation key
         */
        emptyCtaLabel?: string;

        /**
         * Empty state CTA link
         */
        emptyCtaLink?: string;

        /**
         * Optional children (slot content) for filled state
         */
        children?: Snippet;
    }

    let {
        titleKey,
        leftStatLabel,
        leftStatValue,
        rightStatLabel,
        rightStatValue,
        recentTitleKey,
        illustrationPath,
        primaryActionLabel,
        primaryActionHref,
        secondaryActionLabel,
        secondaryActionHref,
        isEmpty = false,
        emptyMessageKey,
        emptyCtaLabel,
        emptyCtaLink,
        children,
    }: Props = $props();
</script>

{#if isEmpty}
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
                {$t(titleKey)}
            </h2>
            {#if emptyMessageKey}
                <p
                    class="w-full shrink-0 font-['Karla'] text-[16px] leading-[24px] font-normal text-[#575757]"
                >
                    {$t(emptyMessageKey)}
                </p>
            {/if}
        </div>

        <!-- Actions -->
        {#if emptyCtaLabel && emptyCtaLink}
            <div class="relative z-10 flex w-full shrink-0 gap-[16px]">
                <a
                    href={emptyCtaLink}
                    class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] bg-[#e6e5f7] px-[24px] py-[16px] font-['Karla'] text-[16px] leading-[24px] font-bold text-[#462949] no-underline transition-all duration-200 hover:opacity-90"
                >
                    {$t(emptyCtaLabel)}
                </a>
            </div>
        {/if}
    </div>
{:else}
    <!-- Filled State -->
    <div
        class="relative box-border flex min-h-[384px] flex-col justify-between overflow-clip rounded-[32px] border border-[#f3f3ef] bg-[#fbfbfb] p-[24px]"
    >
        <!-- Decorative illustration - top right corner -->
        <div class="absolute top-[24px] right-[24px] z-0 h-[120px] w-[120px] opacity-100">
            <img
                src={illustrationPath}
                alt=""
                class="size-full object-contain"
                aria-hidden="true"
            />
        </div>

        <!-- Header with title -->
        <div class="relative z-10 mb-[16px]">
            <h2 class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                {$t(titleKey)}
            </h2>
        </div>

        <!-- Stats section -->
        <div class="relative z-10 mb-[16px] flex items-start justify-between gap-[16px]">
            <div class="flex flex-col gap-[4px]">
                <p class="font-['Karla'] text-[12px] leading-[16px] font-medium text-[#575757]">
                    {$t(leftStatLabel)}
                </p>
                <p class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                    {leftStatValue}
                </p>
            </div>
            <div class="flex flex-col gap-[4px] text-right">
                <p class="font-['Karla'] text-[12px] leading-[16px] font-medium text-[#575757]">
                    {$t(rightStatLabel)}
                </p>
                <p class="font-['Karla'] text-[24px] leading-[32px] font-bold text-[#3d3d3d]">
                    {rightStatValue}
                </p>
            </div>
        </div>

        <!-- Recent items list -->
        <div class="relative z-10 mb-[16px] flex min-h-[120px] flex-grow flex-col gap-[12px]">
            <h3 class="font-['Karla'] text-[16px] leading-[24px] font-bold text-[#3d3d3d]">
                {$t(recentTitleKey)}
            </h3>
            <ul class="flex flex-col gap-[8px]">
                {@render children?.()}
            </ul>
        </div>

        <!-- Actions -->
        <div
            class="relative z-10 flex w-full shrink-0 flex-col gap-[12px] md:flex-row md:gap-[16px]"
        >
            <a
                href={primaryActionHref}
                class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] bg-[#e6e5f7] px-[24px] py-[12px] font-['Karla'] text-[14px] leading-[20px] font-bold text-[#462949] no-underline transition-all duration-200 hover:opacity-90 md:py-[16px] md:text-[16px] md:leading-[24px]"
            >
                {$t(primaryActionLabel)}
            </a>
            <a
                href={secondaryActionHref}
                class="box-border flex min-h-px min-w-px grow basis-0 items-center justify-center gap-[8px] rounded-[24px] border border-[#462949] bg-transparent px-[24px] py-[12px] font-['Karla'] text-[14px] leading-[20px] font-bold text-[#462949] no-underline transition-all duration-200 hover:bg-[#46294910] md:py-[16px] md:text-[16px] md:leading-[24px]"
            >
                {$t(secondaryActionLabel)}
            </a>
        </div>
    </div>
{/if}
