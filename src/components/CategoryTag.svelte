<script lang="ts">
    import { t } from "../i18n/store";
    import BookmarkIcon from "../svgs/BookmarkIcon.svelte";
    import Tag from "./library/Tag.svelte";

    interface Props {
        category: string;
    }

    let { category }: Props = $props();
</script>

<Tag>
    <BookmarkIcon />
    <span>{$t(`categories.${category}`)}</span>
</Tag>
