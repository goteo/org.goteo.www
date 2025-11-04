<script lang="ts">
    import { locale } from "../i18n/store";
    import { languagesList } from "../i18n/locales";
    import { getDefaultLanguage } from "../utils/consts";

    const languages = Object.keys(languagesList);

    function handleSelect(event: Event) {
        const selectedLang = (event.target as HTMLSelectElement).value;

        if (!languages.includes(selectedLang)) {
            console.error(`The language "${selectedLang}" is not supported by the interface.`);
            return;
        }

        document.cookie = `preferred-lang=${encodeURIComponent(selectedLang)}; Path=/; Max-Age=31536000; SameSite=Strict`;

        let pathParts = window.location.pathname.split("/").filter(Boolean);

        if (languages.includes(pathParts[0])) {
            pathParts.shift();
        }

        if (selectedLang !== getDefaultLanguage()) {
            pathParts.unshift(selectedLang);
        }

        const newPath = `/${pathParts.join("/")}`;

        window.location.href = newPath;
    }
</script>

<select
    id="language-select"
    class="bg-light-surface rounded-lg border-none font-bold shadow-sm"
    on:change={handleSelect}
>
    {#each languages as lang}
        <option value={lang} selected={lang === $locale}>
            {lang.toUpperCase()}
        </option>
    {/each}
</select>
