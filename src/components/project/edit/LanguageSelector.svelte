<script lang="ts">
    import { t } from "../../../i18n/store";
    import { getLanguageDisplayName } from "../../../utils/lang";
    import { iso639_1Codes } from "../../../utils/lang.types";
    import PlusIcon from "../../icons/actions/PlusIcon.svelte";
    import Close from "../../icons/navigation/Close.svelte";
    import Select from "../../library/inputs/Select.svelte";

    interface LanguageOption {
        code: string;
        name: string;
    }

    interface LanguageSelectorProps {
        languages: string[];
        current: string;
        onChange: (languages: string[]) => void;
    }

    let { languages = [], current, onChange }: LanguageSelectorProps = $props();

    const availableLanguages: LanguageOption[] = iso639_1Codes
        .map((code) => ({ code, name: getLanguageDisplayName(code) }))
        .filter((lang): lang is LanguageOption => lang.name !== undefined);

    let pending = $state(false);

    const primary = $derived(languages[0]);
    const secondaries = $derived(languages.slice(1));

    function isLanguageTaken(code: string): boolean {
        return languages.includes(code);
    }

    function replace(from: string, to: string) {
        if (!to || to === from || languages.includes(to)) return;

        onChange(languages.map((language) => (language === from ? to : language)));
    }

    function remove(language: string) {
        if (language === current) return;

        onChange(languages.filter((other) => other !== language));
    }

    function add(language: string) {
        if (!language || languages.includes(language)) return;

        pending = false;
        onChange([...languages, language]);
    }
</script>

<div class="space-y-4">
    <Select
        value={primary}
        id="primary-language"
        class="cursor-pointer"
        labelText={$t("pages.project.edit.configuration.languages.primaryLabel")}
        required={true}
        onChange={(value) => replace(primary, value)}
    >
        {#each availableLanguages as lang}
            <option value={lang.code} disabled={isLanguageTaken(lang.code)}>{lang.name}</option>
        {/each}
    </Select>

    {#each secondaries as secondary (secondary)}
        <div class="flex gap-2">
            <div class="flex-1">
                <Select
                    value={secondary}
                    id="secondary-language-{secondary}"
                    class="cursor-pointer"
                    labelText={$t("pages.project.edit.configuration.languages.secondaryLabel")}
                    onChange={(value) => replace(secondary, value)}
                >
                    {#each availableLanguages as lang}
                        <option value={lang.code} disabled={isLanguageTaken(lang.code)}
                            >{lang.name}</option
                        >
                    {/each}
                </Select>
            </div>
            <div class="flex items-center">
                <button
                    type="button"
                    onclick={() => remove(secondary)}
                    disabled={secondary === current}
                    data-testid="language-remove-btn-{secondary}"
                    class="text-secondary cursor-pointer rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={$t("common.remove")}
                    title={secondary === current
                        ? $t("pages.project.edit.configuration.languages.removeCurrent")
                        : $t("common.remove")}
                >
                    <Close class="size-4" />
                </button>
            </div>
        </div>
    {/each}

    {#if pending}
        <div class="flex gap-2">
            <div class="flex-1">
                <Select
                    value=""
                    id="pending-language"
                    class="cursor-pointer"
                    labelText={$t("pages.project.edit.configuration.languages.secondaryLabel")}
                    onChange={add}
                >
                    <option value="">{$t("common.select")}</option>
                    {#each availableLanguages as lang}
                        <option value={lang.code} disabled={isLanguageTaken(lang.code)}
                            >{lang.name}</option
                        >
                    {/each}
                </Select>
            </div>
            <div class="flex items-center">
                <button
                    type="button"
                    onclick={() => (pending = false)}
                    data-testid="language-cancel-btn"
                    class="text-secondary cursor-pointer rounded-lg p-2 transition-colors"
                    aria-label={$t("common.cancel")}
                    title={$t("common.cancel")}
                >
                    <Close class="size-4" />
                </button>
            </div>
        </div>
    {/if}

    <button
        type="button"
        onclick={() => (pending = true)}
        disabled={pending}
        data-testid="language-add-btn"
        class="text-secondary flex cursor-pointer items-center gap-2 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
        <PlusIcon class="size-5" />
        {$t("common.add")}
    </button>
</div>
