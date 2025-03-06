<script lang="ts">
    import { _ } from "svelte-i18n";

    import { Button } from "$lib/components/ui/button";
    import google from "./google.svg";
    import facebook from "./facebook.svg";
    import twitter from "./twitter.svg";
    import linkedin from "./linkedin.svg";
</script>

<p>{$_("login.page.otherAccessMethods")}</p>
<div class="flex justify-around">
    <Button variant="outline" size="icon" class="h-24 w-24"
        ><img src={google} alt={$_("ShareButton.google")} /></Button
    >
    <Button variant="outline" size="icon" class="h-24 w-24"
        ><img src={facebook} alt={$_("ShareButton.facebook")} /></Button
    >
    <Button variant="outline" size="icon" class="h-24 w-24"
        ><img src={twitter} alt={$_("ShareButton.twitter")} /></Button
    >
    <Button variant="outline" size="icon" class="h-24 w-24"
        ><img src={linkedin} alt={$_("ShareButton.linkedin")} /></Button
    >
</div>
