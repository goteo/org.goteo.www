<script lang="ts">
    import Header from "./Header.svelte";
    import HeaderSubmenu from "./HeaderSubmenu.svelte";
    import AdminNav from "../components/admin/AdminNav.svelte";
</script>

<Header>
    {#snippet nav()}
        <AdminNav />
    {/snippet}
    <HeaderSubmenu />
</Header>
