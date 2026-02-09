<script lang="ts">
    import type { ClassNameValue } from "tailwind-merge";

    let { class: classes = "", color = "#462949" } = $props<{
        class?: ClassNameValue;
        color?: string;
    }>();
</script>

<svg
    class={classes}
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
>
    <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M2.08561 1.07918L18.5605 9.31662C18.931 9.50186 19.0811 9.95237 18.8959 10.3229C18.8233 10.468 18.7056 10.5857 18.5605 10.6583L2.08561 18.8957C1.71513 19.0809 1.26463 18.9308 1.07938 18.5603C0.987283 18.3761 0.974979 18.1621 1.04536 17.9686L3.25799 11.8838C3.34749 11.6377 3.55892 11.4561 3.81574 11.4047L10.9021 9.98744L3.81574 8.57016C3.55892 8.5188 3.34749 8.33718 3.25799 8.09103L1.04536 2.00631C0.903804 1.61703 1.10462 1.18671 1.4939 1.04516C1.68744 0.974775 1.90141 0.987079 2.08561 1.07918Z"
        stroke={color}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
