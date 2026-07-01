<script lang="ts">
    interface Props {
        class?: string;
        width?: string | number;
        height?: string | number;
    }

    let { class: className = "", width = "49", height = "48" }: Props = $props();
</script>

<svg
    {width}
    {height}
    viewBox="0 0 49 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class={className}
>
    <g clip-path="url(#clip0_568_33965)">
        <mask
            id="mask0_568_33965"
            style="mask-type:luminance"
            maskUnits="userSpaceOnUse"
            x="-10"
            y="-10"
            width="69"
            height="68"
        >
            <path d="M-9.10156 -9.5999H58.0984V57.6001H-9.10156V-9.5999Z" fill="white" />
        </mask>
        <g mask="url(#mask0_568_33965)">
            <path
                d="M48.5 24C48.5 10.7452 37.7548 -3.8147e-06 24.5 -3.8147e-06C11.2452 -3.8147e-06 0.5 10.7452 0.5 24C0.5 35.2555 8.24864 44.6997 18.7022 47.2932V31.334H13.7532V24H18.7022V20.8398C18.7022 12.6709 22.3989 8.8847 30.4188 8.8847C31.9392 8.8847 34.5628 9.18278 35.6361 9.48096V16.1293C35.0696 16.0697 34.0858 16.0399 32.8634 16.0399C28.9281 16.0399 27.4075 17.5306 27.4075 21.4063V24H35.2468L33.9001 31.334H27.4075V47.8242C39.291 46.3889 48.5 36.2705 48.5 24Z"
                fill="#0866FF"
            />
            <path
                d="M33.9008 31.334L35.2476 24H27.4084V21.4062C27.4084 17.5305 28.9288 16.0399 32.8641 16.0399C34.0865 16.0399 35.0703 16.0696 35.6368 16.1292V9.48096C34.5635 9.18279 31.94 8.88461 30.4195 8.88461C22.3998 8.88461 18.7029 12.6709 18.7029 20.8398V24H13.7539V31.334H18.7029V47.2932C20.5598 47.7539 22.5014 48 24.5007 48C25.4851 48 26.4551 47.9393 27.4084 47.8242V31.334H33.9008Z"
                fill="white"
            />
        </g>
    </g>
    <defs>
        <clipPath id="clip0_568_33965">
            <rect width="48" height="48" fill="white" transform="translate(0.5)" />
        </clipPath>
    </defs>
</svg>
