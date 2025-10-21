<script lang="ts">
    /**
     * CTACard Component
     *
     * Displays a call-to-action card with title, description, and 1-2 action buttons.
     * Supports dark (purple) and light (soft purple) variants.
     *
     * @example
     * ```svelte
     * <CTACard
     *     variant="dark"
     *     title="Descubre, conecta y dona"
     *     description="Imagina un lugar donde cientos de proyectos sociales esperan tu apoyo..."
     *     buttons={[
     *         {
     *             label: "Dona a un proyecto",
     *             href: "/projects",
     *             variant: "primary",
     *         },
     *     ]}
     * />
     * ```
     */

    interface Button {
        label: string;
        href: string;
        variant: "primary" | "secondary";
    }

    interface Props {
        /**
         * Visual variant (dark = purple bg, light = soft purple bg)
         */
        variant: "dark" | "light";

        /**
         * Card title (max 2 lines with ellipsis)
         */
        title: string;

        /**
         * Card description text
         */
        description: string;

        /**
         * Action buttons (1-2 buttons supported)
         */
        buttons: Button[];
    }

    let { variant, title, description, buttons }: Props = $props();

    // Derived state
    const isDark = $derived(variant === "dark");
</script>

<div
    class="flex flex-col justify-between gap-[40px] rounded-[32px] border p-[24px] transition-shadow duration-200 {isDark
        ? 'border-light-muted bg-secondary text-light-surface'
        : 'border-purple-tint bg-soft-purple text-content'}"
>
    <!-- Content -->
    <div class="flex flex-col gap-[16px]">
        <h2
            class="text-[32px] leading-[40px] font-bold md:text-[32px] md:leading-[40px]"
            style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;"
        >
            {title}
        </h2>
        <p class="text-[14px] leading-[20px] md:text-[16px] md:leading-[24px]">
            {description}
        </p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col flex-wrap gap-[16px] md:flex-row">
        {#each buttons as button}
            <a
                href={button.href}
                class="inline-flex w-full items-center justify-center rounded-[24px] px-[24px] py-[16px] text-[16px] leading-[24px] font-bold no-underline transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:w-auto {button.variant ===
                'primary'
                    ? 'bg-light-accent text-secondary hover:opacity-90 focus-visible:ring-secondary'
                    : isDark
                      ? 'border border-white bg-transparent text-white hover:bg-white hover:text-secondary focus-visible:ring-white focus-visible:ring-offset-secondary'
                      : 'border border-secondary bg-transparent text-secondary hover:bg-secondary hover:text-white focus-visible:ring-secondary'}"
            >
                {button.label}
            </a>
        {/each}
    </div>
</div>
