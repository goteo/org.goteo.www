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
    class="flex flex-col justify-between gap-10 rounded-[32px] border p-6 transition-shadow duration-200 {isDark
        ? 'border-grey bg-secondary text-background'
        : 'border-variant1 bg-soft-purple text-content'}"
>
    <!-- Content -->
    <div class="flex flex-col gap-4">
        <h2
            class="text-3xl leading-tight font-bold md:text-4xl"
            style="display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;"
        >
            {title}
        </h2>
        <p class="text-sm leading-tight md:text-base md:leading-normal">
            {description}
        </p>
    </div>

    <!-- Actions -->
    <div class="flex flex-col flex-wrap gap-4 md:flex-row">
        {#each buttons as button}
            <a
                href={button.href}
                class="inline-flex w-full items-center justify-center rounded-3xl px-6 py-4 text-base leading-normal font-bold no-underline transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:w-auto {button.variant ===
                'primary'
                    ? 'bg-light-accent text-secondary focus-visible:ring-secondary hover:opacity-90'
                    : isDark
                      ? 'hover:text-secondary focus-visible:ring-offset-secondary border-background text-background hover:bg-background border bg-transparent focus-visible:ring-white'
                      : 'border-secondary text-secondary hover:bg-secondary focus-visible:ring-secondary border bg-transparent hover:text-white'}"
            >
                {button.label}
            </a>
        {/each}
    </div>
</div>
