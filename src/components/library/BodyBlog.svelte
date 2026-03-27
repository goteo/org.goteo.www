<script lang="ts">
    import { t } from "../../i18n/store";
    import ShareIcon from "../../svgs/ShareIcon.svelte";
</script>

<div id="container">
    <div class="w-4xl" id="top">
        <h1>Impulsa el cambio que el mundo anhela</h1>
        <p class="pb-4">
            Únete a una comunidad que transforma realidades. Cada donación impulsa proyectos
            sociales innovadores: desde educación inclusiva hasta sostenibilidad ambiental. Aquí, tu
            contribución no es solo un gesto; es la semilla de un impacto duradero. ¡Sé parte de la
            solución!
        </p>
        <img src="imgs/resource-2.png" id="bigImg" alt="" />
        <div class="pt-6">
            <div id="profile">
                <img src="imgs/resource-2.png" id="profileImg" alt="" />
                <div>
                    <p id="autor">Por: Fulano de Tal</p>
                    <p id="fecha">03/12/2024</p>
                </div>
            </div>
            <div id="compartir">
                <button
                    class="text-secondary flex cursor-pointer flex-row items-center gap-2 p-2 font-bold"
                >
                    <ShareIcon />
                    {$t("project.actions.share")}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    h1 {
        padding-bottom: 16px;
        color: var(--color-secondary);
        font-size: 40px;
        font-weight: var(--font-weight-black);
        line-height: var(--text-xs--line-height);
    }

    p {
        font-size: 16px;
        color: var(--color-content);
    }
    #top img {
        width: 898px;
        height: 400px;
        border-radius: 16px;
        object-fit: cover;
    }
    #profile {
        display: flex;
        height: 64px;
        align-items: center;
        gap: 8px;
    }
    #profile img {
        border-radius: 8px;
        display: flex;
        width: 64px;
        height: 64px;
        align-items: center;
        gap: 8px;
    }
    #profile p {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    #profile div {
        padding-left: 16px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    #container {
        display: flex;
        justify-content: center;
        height: 100vh;
    }
    #autor {
        color: var(--color-secondary);
        font-family: Karla;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        line-height: 24px;
    }
    #fecha {
        color: var(--Content-text, #575757);
        font-variant-numeric: ordinal;
        font-feature-settings: "case" on;
        font-family: Karla;
        font-size: 16px;
        font-style: normal;
        font-weight: 400;
        line-height: 24px;
    }
    #top div {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        align-self: stretch;
    }

    #compartir button {
        display: flex;
        padding: 8px 16px;
        justify-content: center;
        align-items: center;
        gap: 8px;
        border-radius: 16px;
        border: 1px solid var(--Secondary, #462949);
    }
</style>
