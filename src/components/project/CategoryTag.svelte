<script lang="ts">
    import { locale } from "../../i18n/store";
    import { apiCategoriesIdOrSlugGet, type Category } from "../../openapi/client";
    import { extractId } from "../../utils/extractId";
    import BookmarkIcon from "../icons/actions/Bookmark.svelte";
    import Tag from "../library/tags/Tag.svelte";

    interface Props {
        iri: string;
    }

    let { iri }: Props = $props();

    async function getCategory(iri: string): Promise<Category> {
        const { data: category } = await apiCategoriesIdOrSlugGet({
            headers: { "Accept-Language": $locale },
            path: { idOrSlug: extractId(iri)! },
        });

        return category!;
    }
</script>

<Tag>
    <BookmarkIcon />
    {#await getCategory(iri) then category}
        <span>{category?.name}</span>
    {/await}
</Tag>
