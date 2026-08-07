<script lang="ts">
    import HeaderCategories from "./HeaderCategories.svelte";
    import { t } from "../i18n/store";
    import Title from "../components/library/typography/Title.svelte";
</script>

<nav class="mt-5 mb-10 flex gap-20 px-2 md:px-6">
    <section>
        <Title level={2} variant="section" class="mb-4">
            {$t("domain.header.categories")}
        </Title>

        <HeaderCategories />
    </section>
</nav>
