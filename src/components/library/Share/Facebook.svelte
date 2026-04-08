<script lang="ts">
    import FacebookIcon from "../../../svgs/FacebookIcon.svelte";

    interface Props {
        url?: string;
        appId?: string;
    }

    let { url = "", appId = import.meta.env.PUBLIC_FACEBOOK_APP_ID }: Props = $props();

    let fbWindow: Window | null = null;

    const fbShareUrl = $derived(() => {
        const encoded = encodeURIComponent(url);
        return `https://www.facebook.com/dialog/share?app_id=${appId}&display=popup&href=${encoded}&redirect_uri=${encoded}`;
    });

    function openFbPopup() {
        const width = 626;
        const height = 436;
        const left = window.screenX + (window.innerWidth - width) / 2;
        const top = window.screenY + (window.innerHeight - height) / 2;

        if (fbWindow && !fbWindow.closed) {
            fbWindow.close();
        }

        fbWindow = window.open(
            fbShareUrl(),
            "facebook-share-dialog",
            `width=${width},height=${height},top=${top},left=${left}`,
        );
    }
</script>

<button
    onclick={openFbPopup}
    class="flex h-23 w-23 items-center justify-center rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.1)]"
>
    <FacebookIcon />
</button>
