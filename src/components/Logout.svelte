<script>
    import { actions } from "astro:actions";
    import { t } from "../i18n/store";

    const button = document.querySelector("#btn-logout");
    button?.addEventListener("click", async () => {
        const { error } = await actions.logout();

        console.log("error", error);

        window.location.href = `/`;
    });
</script>

<button
    id="btn-logout"
    class="text-secondary hover:bg-grey block w-full cursor-pointer overflow-hidden px-4 py-2 font-bold overflow-ellipsis"
>
    {$t("logout.label")}
</button>
