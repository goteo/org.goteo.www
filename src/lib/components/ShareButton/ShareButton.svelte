<script lang="ts">
  import { _ } from "svelte-i18n";
  import { Share2 } from "lucide-svelte";

  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import global from "./global.svg";
  import facebook from "./facebook.svg";
  import twitter from "./twitter.svg";
  import code from "./code.svg";
</script>

<Dialog.Root>
  <Dialog.Trigger class="text-left">
    <Button variant="ghost" size="sm"><Share2 class="mr-2 h-4" /> {$_("project.actions.share")}</Button>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{$_("ShareButton.title")}</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description>
      {$_("ShareButton.description")}
    </Dialog.Description>
    <div class="flex justify-around">
      <Button variant="outline" size="icon" class="h-24 w-24"><img src={global} alt={$_("ShareButton.global")} /></Button>
      <Button variant="outline" size="icon" class="h-24 w-24"><img src={facebook} alt={$_("ShareButton.facebook")} /></Button>
      <Button variant="outline" size="icon" class="h-24 w-24"><img src={twitter} alt={$_("ShareButton.twitter")} /></Button>
      <Button variant="outline" size="icon" class="h-24 w-24"><img src={code} alt={$_("ShareButton.code")} /></Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
