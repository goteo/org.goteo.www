<script>
    import BookmarkIcon from "../svgs/BookmarkIcon.svelte";
    import MapIcon from "../svgs/MapIcon.svelte";
    export let tags;
    import { t } from "../i18n/store";
</script>

<div class="flex w-auto gap-2">
    <div class="border-secondary flex gap-2 rounded-sm border px-2 py-1">
        <BookmarkIcon />
        {$t(`categories.${tags.categoryTag}`)}
    </div>
    <div class=" border-secondary flex gap-2 rounded-sm border px-2 py-1">
        <MapIcon />{tags.territoryTag}
    </div>
</div>
