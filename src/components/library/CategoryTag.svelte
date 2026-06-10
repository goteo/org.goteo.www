<script lang="ts">
    import { locale } from "../../i18n/store";
    import { apiCategoriesIdGet, type Category } from "../../openapi/client";
    import { extractId } from "../../utils/extractId";
    import BookmarkIcon from "../icons/Bookmark.svelte";
    import Tag from "./Tag.svelte";

    interface Props {
        iri: string;
    }

    let { iri }: Props = $props();

    async function getCategory(iri: string): Promise<Category> {
        const { data: category } = await apiCategoriesIdGet({
            headers: { "Accept-Language": $locale },
            path: { id: extractId(iri)! },
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
