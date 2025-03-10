<script lang="ts">
    import { _ } from "svelte-i18n";
    import { Share2 } from "lucide-svelte";

    import * as Dialog from "$lib/components/ui/dialog";
    import { Button } from "$lib/components/ui/button";
    import global from "./global.svg";
    import facebook from "./facebook.svg";
    import twitter from "./twitter.svg";
    import code from "./code.svg";
    import { toast } from 'svelte-sonner'; // Import toast from svelte-sonner
</script>

<Dialog.Root>
    <Dialog.Trigger class="text-left">
        <Button variant="ghost" size="sm"
            ><Share2 class="mr-2 h-4" /> {$_("project.actions.share")}</Button
        >
    </Dialog.Trigger>
    <Dialog.Content>
        <Dialog.Header>
            <Dialog.Title>{$_("ShareButton.title")}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Description>
            {$_("ShareButton.description")}
        </Dialog.Description>
        <div class="flex justify-around">
            <Button variant="outline" size="icon" class="h-24 w-24"
                on:click={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.info($_("ShareButton.copied")); // Display toast message
                }}
                ><img src={global} alt={$_("ShareButton.global")} /></Button
            >
            <Button variant="outline" size="icon" class="h-24 w-24"
                on:click={() => {
                    const facebookShareUrl = `https://www.facebook.com/dialog/share?app_id=YOUR_APP_ID&display=popup&href=${encodeURIComponent(window.location.href)}&redirect_uri=${encodeURIComponent(window.location.href)}`;
                    window.open(facebookShareUrl, '_blank');
                }}
                ><img src={facebook} alt={$_("ShareButton.facebook")} /></Button
            >
            <Button variant="outline" size="icon" class="h-24 w-24"
                on:click={() => {
                    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(window.location.href)}`;
                    window.open(twitterShareUrl, '_blank');
                }}
                ><img src={twitter} alt={$_("ShareButton.twitter")} /></Button
            >
            <Button variant="outline" size="icon" class="h-24 w-24"
                ><img src={code} alt={$_("ShareButton.code")} /></Button
            >
        </div>
    </Dialog.Content>
</Dialog.Root>
