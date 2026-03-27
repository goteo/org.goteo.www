<script lang="ts">
    import { onMount } from "svelte";

    import FacebookIcon from "../../../svgs/FacebookIcon.svelte";

    const appId = "184483011630708";

    let fbShareUrl = $state("");
    let fbWindow: Window | null = null;

    function openFbPopup() {
        const width = 626;
        const height = 436;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        if (fbWindow && !fbWindow.closed) {
            fbWindow.close();
        }

        fbWindow = window.open(
            fbShareUrl,
            "facebook-share-dialog",
            `width=${width},height=${height},top=${top},left=${left}`,
        );
    }

    onMount(() => {
        const currentUrl = encodeURIComponent(window.location.href);
        fbShareUrl = `https://www.facebook.com/dialog/share?app_id=${appId}&display=popup&href=${currentUrl}&redirect_uri=${currentUrl}`;
    });
</script>

<button
    onclick={openFbPopup}
    class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    <FacebookIcon />
</button>
