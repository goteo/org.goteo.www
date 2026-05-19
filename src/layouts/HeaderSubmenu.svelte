<script lang="ts">
    import HeaderCategories from "./HeaderCategories.svelte";
    import { t } from "../i18n/store";
</script>

<nav class="mt-5 mb-10 flex gap-20 px-2 md:px-6">
    <section>
        <h2 class="mb-4 text-3xl font-bold text-black">
            {$t("domain.header.categories")}
        </h2>

        <HeaderCategories />
    </section>
</nav>
