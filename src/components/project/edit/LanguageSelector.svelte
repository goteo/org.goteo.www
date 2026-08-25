<!--
    Language Selector Component

    Lists the content languages (locales) a Project is published in.

    Features:
    - Registered languages are shown locked: the API has no "change language"
      operation, only add and remove, so editing a saved slot is not offered
    - New languages are added through an empty slot
    - Removing a language asks for confirmation — it deletes that translation
    - Already-registered languages are excluded from the dropdown

    Design System:
    - Uses Select component from library
-->
<script lang="ts">
    import DeleteModal from "./DeleteModal.svelte";
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
        /**
         * Locales already registered for the Project, first one is the primary.
         */
        languages: string[];
        /**
         * Locale the editor is currently working on. It cannot be removed.
         */
        current: string;
        /**
         * Registers a language. Must resolve once `languages` reflects the change.
         */
        onAdd: (language: string) => Promise<void> | void;
        /**
         * Removes a language and all its content.
         */
        onRemove: (language: string) => Promise<void> | void;
        /**
         * Moves the content of a registered language over to another one.
         */
        onReplace: (from: string, to: string) => Promise<void> | void;
    }

    let { languages = [], current, onAdd, onRemove, onReplace }: LanguageSelectorProps = $props();

    // Codes without a display name in the current UI locale are not offerable
    const availableLanguages: LanguageOption[] = iso639_1Codes
        .map((code) => ({ code, name: getLanguageDisplayName(code) }))
        .filter((lang): lang is LanguageOption => lang.name !== undefined);

    // Empty slots the user opened to add a language, not registered yet
    let pending = $state<string[]>([]);
    let busy = $state(false);

    // Pending confirmation: a removal (no `to`) or a replacement (with `to`)
    let confirming = $state<{ from: string; to?: string } | undefined>();
    let confirmOpen = $state(false);

    // Bumping this remounts the selects, discarding a cancelled pick
    let resetKey = $state(0);

    // TODO(api): `locales` has no order and no primary — this is just the first
    // one the API returns. Needs a writable `primaryLocale` to mean anything.
    const primary = $derived(languages[0]);
    const secondaries = $derived(languages.slice(1));

    function isLanguageTaken(code: string): boolean {
        return languages.includes(code) || pending.includes(code);
    }

    /**
     * Register the language picked in an empty slot
     */
    async function handlePendingChange(index: number, value: string) {
        if (!value || busy) return;

        pending = pending.map((lang, i) => (i === index ? value : lang));

        busy = true;
        try {
            await onAdd(value);
            pending = pending.filter((_, i) => i !== index);
        } finally {
            busy = false;
        }
    }

    function addPendingSlot() {
        pending = [...pending, ""];
    }

    function removePendingSlot(index: number) {
        pending = pending.filter((_, i) => i !== index);
    }

    function askRemoval(language: string) {
        confirming = { from: language };
        confirmOpen = true;
    }

    /**
     * Changing a registered language means moving its content to the new one
     * and dropping the old one, so it goes through confirmation too
     */
    function askReplacement(from: string, to: string) {
        if (!to || to === from) return;

        confirming = { from, to };
        confirmOpen = true;
    }

    // Dialog dismissed (Cancel or the X) without going through with it
    $effect(() => {
        if (!confirmOpen && confirming) {
            confirming = undefined;
            resetKey += 1;
        }
    });

    /**
     * Apply the confirmed removal or replacement
     */
    async function handleConfirmation() {
        const pendingChange = confirming;
        confirmOpen = false;
        confirming = undefined;

        // A removal without a language would delete the whole Project
        if (!pendingChange?.from || busy) return;

        busy = true;
        try {
            if (pendingChange.to) {
                await onReplace(pendingChange.from, pendingChange.to);
            } else {
                await onRemove(pendingChange.from);
            }
        } finally {
            busy = false;
            resetKey += 1;
        }
    }
</script>

<div class="space-y-4">
    <!-- Primary Language -->
    {#key resetKey}
        <Select
            value={primary}
            id="primary-language"
            class="cursor-pointer"
            labelText={$t("pages.project.edit.configuration.languages.primaryLabel")}
            required={true}
            disabled={busy}
            onChange={(value) => askReplacement(primary, value)}
        >
            {#each availableLanguages as lang}
                <option value={lang.code} disabled={isLanguageTaken(lang.code)}>{lang.name}</option>
            {/each}
        </Select>
    {/key}

    <!-- Registered Secondary Languages -->
    {#each secondaries as secondary (secondary)}
        <div class="flex gap-2">
            <div class="flex-1">
                {#key resetKey}
                    <Select
                        value={secondary}
                        id="secondary-language-{secondary}"
                        class="cursor-pointer"
                        labelText={$t("pages.project.edit.configuration.languages.secondaryLabel")}
                        disabled={busy}
                        onChange={(value) => askReplacement(secondary, value)}
                    >
                        {#each availableLanguages as lang}
                            <option value={lang.code} disabled={isLanguageTaken(lang.code)}
                                >{lang.name}</option
                            >
                        {/each}
                    </Select>
                {/key}
            </div>
            <div class="flex items-center">
                <button
                    type="button"
                    onclick={() => askRemoval(secondary)}
                    disabled={busy || secondary === current}
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

    <!-- Slots for languages not registered yet -->
    {#each pending as slot, index}
        <div class="flex gap-2">
            <div class="flex-1">
                <Select
                    value={slot}
                    id="pending-language-{index}"
                    class="cursor-pointer"
                    labelText={$t("pages.project.edit.configuration.languages.secondaryLabel")}
                    disabled={busy}
                    onChange={(value) => handlePendingChange(index, value)}
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
                    onclick={() => removePendingSlot(index)}
                    disabled={busy}
                    data-testid="language-cancel-btn-{index}"
                    class="text-secondary cursor-pointer rounded-lg p-2 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={$t("common.cancel")}
                >
                    <Close class="size-4" />
                </button>
            </div>
        </div>
    {/each}

    <!-- Add Language Button -->
    <button
        type="button"
        onclick={addPendingSlot}
        disabled={busy || pending.length > 0}
        data-testid="language-add-btn"
        class="text-secondary flex cursor-pointer items-center gap-2 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    >
        <PlusIcon class="size-5" />
        {$t("pages.project.edit.configuration.languages.addButton")}
    </button>
</div>

<DeleteModal
    variant={confirming?.to ? "configuration.languages.replace" : "configuration.languages"}
    bind:open={confirmOpen}
    onclick={handleConfirmation}
/>
