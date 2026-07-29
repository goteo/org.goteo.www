<!--
    Tiptap rich text editor with a bold / italic / alignment / font-size toolbar.

    Content flows one way: `value` renders into the editor and edits are reported through
    `onChange` — there is no two-way binding. `minLength`/`maxLength` only colour the
    character counter; enforcement lives in stores/drafts/draftValidation.ts.
-->
<script lang="ts">
    import { Editor } from "@tiptap/core";
    import TextAlign from "@tiptap/extension-text-align";
    import { FontSize, TextStyle } from "@tiptap/extension-text-style";
    import { CharacterCount, Placeholder } from "@tiptap/extensions";
    import StarterKit from "@tiptap/starter-kit";
    import { untrack } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

    import { t } from "../../../i18n/store";
    import Align from "../../icons/Align.svelte";
    import Chevron from "../../icons/navigation/Chevron.svelte";

    interface RichTextEditorProps {
        id: string;
        value: string;
        onChange: (html: string) => void;
        placeholder?: string;
        error?: string;
        ariaDescribedBy?: string;
        class?: ClassNameValue;
        minLength?: number;
        maxLength?: number;
    }

    type Alignment = "left" | "center" | "right";

    interface ToolbarButton {
        id: string;
        labelKey: string;
        active: boolean;
        run: () => void;
        align?: Alignment;
        glyph?: { text: string; class: string };
    }

    let {
        id,
        value = "",
        onChange,
        placeholder = "",
        error,
        ariaDescribedBy,
        class: className = "",
        minLength,
        maxLength,
    }: RichTextEditorProps = $props();

    const ALIGNMENTS = [
        { value: "left", labelKey: "common.richTextEditor.alignLeft" },
        { value: "center", labelKey: "common.richTextEditor.alignCenter" },
        { value: "right", labelKey: "common.richTextEditor.alignRight" },
    ] as const satisfies readonly { value: Alignment; labelKey: string }[];

    const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px"];
    const DEFAULT_FONT_SIZE = "16px";

    let editorElement = $state<HTMLDivElement>();
    let editor = $state<Editor | null>(null);

    let toolbar = $state({
        bold: false,
        italic: false,
        alignment: "left" as Alignment,
        fontSize: DEFAULT_FONT_SIZE,
        characters: 0,
    });

    const markButtons: ToolbarButton[] = $derived([
        {
            id: "bold",
            labelKey: "common.richTextEditor.bold",
            active: toolbar.bold,
            run: () => editor?.chain().focus().toggleBold().run(),
            glyph: { text: "B", class: "font-bold" },
        },
        {
            id: "italic",
            labelKey: "common.richTextEditor.italic",
            active: toolbar.italic,
            run: () => editor?.chain().focus().toggleItalic().run(),
            glyph: { text: "I", class: "font-serif italic" },
        },
    ]);

    const alignButtons: ToolbarButton[] = $derived(
        ALIGNMENTS.map(({ value: alignment, labelKey }) => ({
            id: alignment,
            labelKey,
            active: toolbar.alignment === alignment,
            run: () => editor?.chain().focus().setTextAlign(alignment).run(),
            align: alignment,
        })),
    );

    const editorAttributes = $derived({
        id,
        role: "textbox",
        "aria-multiline": "true",
        "aria-invalid": String(!!error),
        ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
        class: "min-h-60 p-4 focus:outline-none",
    });

    const isCountOutOfRange = $derived(
        (minLength !== undefined && toolbar.characters < minLength) ||
            (maxLength !== undefined && toolbar.characters > maxLength),
    );

    function syncToolbar(instance: Editor) {
        toolbar.bold = instance.isActive("bold");
        toolbar.italic = instance.isActive("italic");
        toolbar.alignment =
            ALIGNMENTS.find(({ value: alignment }) => instance.isActive({ textAlign: alignment }))
                ?.value ?? "left";
        toolbar.fontSize = instance.getAttributes("textStyle").fontSize ?? DEFAULT_FONT_SIZE;
        toolbar.characters = instance.storage.characterCount.characters();
    }

    function createEditor(element: HTMLDivElement) {
        return new Editor({
            element,
            extensions: [
                StarterKit.configure({
                    heading: false,
                    bulletList: false,
                    orderedList: false,
                    listItem: false,
                    strike: false,
                    code: false,
                    codeBlock: false,
                    link: false,
                    underline: false,
                }),
                TextAlign.configure({
                    types: ["paragraph"],
                    alignments: ALIGNMENTS.map(({ value: alignment }) => alignment),
                    defaultAlignment: "left",
                }),
                Placeholder.configure({ placeholder }),
                TextStyle,
                FontSize,
                CharacterCount,
            ],
            content: value,
            editorProps: { attributes: editorAttributes },
            onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
            onTransaction: ({ editor: instance }) => syncToolbar(instance),
        });
    }

    $effect(() => {
        const element = editorElement;
        if (!element) return;

        const instance = untrack(() => createEditor(element));
        editor = instance;
        untrack(() => syncToolbar(instance));

        return () => {
            instance.destroy();
            editor = null;
        };
    });

    $effect(() => {
        const html = value;
        if (editor && html !== editor.getHTML()) {
            editor.commands.setContent(html, { emitUpdate: false });
        }
    });

    $effect(() => {
        editor?.setOptions({ editorProps: { attributes: editorAttributes } });
    });
</script>

{#snippet toolbarButton({ labelKey, active, run, align, glyph }: ToolbarButton)}
    <button
        type="button"
        onclick={run}
        class={twMerge(
            "flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-white shadow-sm",
            active ? "border-secondary" : "border-grey",
        )}
        aria-label={$t(labelKey)}
        title={$t(labelKey)}
        aria-pressed={active}
    >
        {#if align}
            <Align
                {align}
                width="24"
                height="24"
                class={active ? "text-secondary" : "text-content"}
            />
        {:else if glyph}
            <span class={glyph.class}>{glyph.text}</span>
        {/if}
    </button>
{/snippet}

<div class={twMerge("space-y-4", className)}>
    <div
        class="flex items-center justify-between"
        role="toolbar"
        aria-label={$t("common.richTextEditor.toolbar")}
    >
        <div class="flex items-center gap-2">
            <div class="relative flex">
                <select
                    value={toolbar.fontSize}
                    onchange={(event) =>
                        editor?.chain().focus().setFontSize(event.currentTarget.value).run()}
                    aria-label={$t("common.richTextEditor.fontSize")}
                    title={$t("common.richTextEditor.fontSize")}
                    class="border-grey text-secondary flex h-10 w-auto max-w-27.5 cursor-pointer appearance-none items-center justify-center rounded-lg border bg-white bg-none px-2 py-1 pr-8 text-sm shadow-sm ring-0"
                >
                    {#each FONT_SIZES as size (size)}
                        <option value={size}>{size}</option>
                    {/each}
                </select>
                <Chevron
                    direction="down"
                    width="16"
                    height="16"
                    class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
                />
            </div>

            {#each markButtons as button (button.id)}
                {@render toolbarButton(button)}
            {/each}
        </div>

        <div class="flex items-center gap-2">
            {#each alignButtons as button (button.id)}
                {@render toolbarButton(button)}
            {/each}
        </div>
    </div>

    <div
        bind:this={editorElement}
        class={twMerge(
            "max-h-100 overflow-y-auto rounded-lg border",
            error ? "border-tertiary" : "border-secondary",
        )}
    ></div>

    {#if maxLength !== undefined}
        <p
            class={twMerge(
                "text-right text-sm",
                isCountOutOfRange ? "text-tertiary" : "text-black",
            )}
        >
            {$t("common.richTextEditor.characterCount", {
                current: toolbar.characters,
                max: maxLength,
            })}
        </p>
    {/if}

    {#if error}
        <p role="alert" class="text-tertiary mt-2 text-sm">{error}</p>
    {/if}
</div>

<style>
    :global(.tiptap p.is-editor-empty:first-child::before) {
        color: var(--color-content);
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }
</style>
