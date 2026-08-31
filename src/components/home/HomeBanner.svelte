<script lang="ts">
    import { getCookie, setCookie } from "../../utils/cookies";
    import Close from "../icons/navigation/Close.svelte";
    import Button from "../library/buttons/Button.svelte";
    import Title from "../library/typography/Title.svelte";

    const CLOSED_BANNERS_COOKIE = "goteo-banners-closed";

    interface Props {
        id: number;
        title: string;
        description: string;
        ctaText: string;
        ctaLink: string;
        closeAriaLabel: string;
        onClose?: () => void;
    }

    let { id, title, description, ctaText, ctaLink, closeAriaLabel, onClose }: Props = $props();

    let visible = $state(true);

    function handleClose() {
        visible = false;

        const closed = (getCookie(CLOSED_BANNERS_COOKIE) ?? "").split(",").filter(Boolean);
        if (!closed.includes(String(id))) {
            setCookie(CLOSED_BANNERS_COOKIE, [...closed, id].join(","));
        }

        if (onClose) onClose();
    }
</script>

{#if visible}
    <div class="bg-secondary relative overflow-hidden rounded-3xl p-4 text-white sm:p-6 md:p-8">
        <div class="pointer-events-none absolute inset-0 z-0">
            <img
                src="/images/home/banner-home.svg"
                alt=""
                class="absolute top-[-23%] right-97 h-56.5 w-61 translate-y-[-25%] rotate-[4deg]"
            />
            <img
                src="/images/home/banner-home.svg"
                alt=""
                class="absolute top-[54%] right-53.5 h-56.5 w-61 translate-y-[-37%] -rotate-2"
            />
            <img
                src="/images/home/banner-home.svg"
                alt=""
                class="absolute top-[24%] right-0 h-56.5 w-61 translate-y-[-60%] rotate-2"
            />
        </div>

        <div
            class="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
            <div class="flex-1 space-y-3">
                <Title level={2} variant="section" class="text-variant1 tracking-tight">
                    {title}
                </Title>
                <p class="text-variant1 max-w-3xl text-sm opacity-90 sm:text-base md:text-lg">
                    {description}
                </p>
            </div>

            <div class="bg-variant-1 flex items-center gap-4">
                <Button
                    kind="secondary"
                    size="md"
                    class="w-full"
                    onclick={() => (window.location.href = ctaLink)}
                >
                    {ctaText}
                </Button>

                <button
                    onclick={handleClose}
                    aria-label={closeAriaLabel}
                    class="flex size-12 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                >
                    <Close class="text-purple-soft h-6 w-6" />
                </button>
            </div>
        </div>
    </div>
{/if}
