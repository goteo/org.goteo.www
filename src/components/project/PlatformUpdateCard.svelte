<script lang="ts">
    import { twMerge } from "tailwind-merge";

    import Bullet from "../../components/icons/Bullet.svelte";
    import { locale } from "../../i18n/store";
    import { type ProjectUpdate } from "../../openapi/client/index";
    import { formatDate } from "../../utils/dates.ts";

    export type ProjectUpdateCardType = "contracted" | "expanded" | "mobile";

    interface Props {
        update: ProjectUpdate;
        type?: ProjectUpdateCardType;
        isActive?: boolean;
    }

    let { update, type, isActive }: Props = $props();

    let cardClasses = $state("");

    $effect(() => {
        cardClasses = isActive ? "opacity-100" : "";
    });

    function getCardClasses(): string {
        const baseClasses =
            "flex shrink-0 flex-col rounded-[1.25rem] border border-[#E7E1F1] bg-[#FCFAFF] p-4 shadow-sm transition-[width,opacity,box-shadow] duration-300 ease-out";

        if (type === "expanded") {
            return twMerge(baseClasses, "h-[24.5rem] w-[30.75rem]", cardClasses);
        }

        if (type === "mobile") {
            return twMerge(baseClasses, "h-[25.625rem] w-[13.5rem]", cardClasses);
        }

        return twMerge(baseClasses, "h-[24.5rem] w-[21.75rem] opacity-70", cardClasses);
    }

    function getPanelClasses(): string {
        const baseClasses =
            "relative isolate flex h-full overflow-hidden rounded-2xl bg-[#FF4ED1] p-4 text-white";

        if (type === "mobile") {
            return twMerge(baseClasses, "min-h-0");
        }

        return twMerge(baseClasses, "min-h-0");
    }

    function getBackgroundSvgClasses(): string {
        const baseClasses = "pointer-events-none absolute z-0 max-w-none";

        if (type === "expanded") {
            return twMerge(baseClasses, "-right-24 -bottom-28 h-[34rem] w-[34rem]");
        }

        if (type === "mobile") {
            return twMerge(baseClasses, "-right-52 -bottom-10 h-[31rem] w-[31rem]");
        }

        return twMerge(baseClasses, "-right-40 -bottom-28 h-[34rem] w-[34rem]");
    }
</script>

<div class={getCardClasses()}>
    <div class="text-secondary flex shrink-0 flex-row gap-0.5 text-lg leading-6 font-bold">
        {#if update.date}
            {formatDate(new Date(update.date), $locale)}
        {/if}
        <div class="pt-0.5">
            <Bullet />
        </div>
    </div>

    <div class="mt-3 flex min-h-0 flex-1">
        <div class={getPanelClasses()}>
            <svg
                class={getBackgroundSvgClasses()}
                viewBox="0 0 535 533"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    opacity="0.08"
                    d="M339.41 -307.908C341.812 -308.41 342.063 -306.776 342.23 -305.059C382.622 -179.016 441.101 -96.5034 517.041 -10.932C589.701 70.9316 673.723 148.459 680.594 291.679C685.983 404.231 636.839 495.227 584.73 551.849C526.585 615.069 432.183 658.578 333.771 656.504C232.603 654.346 149.792 609.602 91.271 543.386C32.9799 477.443 -7.07829 393.966 1.04613 280.346C12.9717 113.351 138.075 31.8013 218.171 -73.1467C270.238 -141.436 306.579 -212.072 339.41 -307.908ZM130.744 314.323C131.747 390.552 172.849 460.14 229.449 495.332C309.294 544.957 420.362 532.242 486.047 467.011C520.717 432.615 544.254 384.603 550.896 314.323C463.219 314.323 443.211 313.024 341.332 313.024C341.332 243.247 342.251 169.114 342.251 99.3786C220.426 99.0644 129.262 199.781 130.744 314.323Z"
                    fill="#3D3D3D"
                />
            </svg>

            <h2
                class={twMerge(
                    "relative z-10 font-bold text-white",
                    type === "mobile" ? "text-2xl leading-8" : "text-double leading-10",
                )}
            >
                {update.title}
            </h2>
        </div>
    </div>
</div>
