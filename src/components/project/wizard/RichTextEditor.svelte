<!--
    Rich Text Editor Component

    Reusable rich text editor using Tiptap.

    Features:
    - Basic formatting (bold, italic, lists, headings)
    - Character/word count
    - Validation state display
    - Placeholder support
    - Keyboard shortcuts
-->
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import Placeholder from "@tiptap/extension-placeholder";
    import TextAlign from "@tiptap/extension-text-align";

    interface RichTextEditorProps {
        id: string;
        value: string;
        onChange: (html: string) => void;
        placeholder?: string;
        minLength?: number;
        maxLength?: number;
        error?: string;
        ariaDescribedBy?: string;
    }

    let {
        value,
        onChange,
        placeholder = "",
        minLength,
        maxLength = 5000,
        error,
        ariaDescribedBy,
    }: RichTextEditorProps = $props();

    let editorElement: HTMLDivElement;
    let editor: Editor | null = $state(null);
    let selectedFontSize = $state("16px");

    const charCount = $derived(editor ? (editor.state as any).doc.textContent.length : 0);
    const wordCount = $derived(
        editor ? (editor.state as any).doc.textContent.split(/\s+/).filter(Boolean).length : 0,
    );

    onMount(() => {
        if (!editorElement) return;

        editor = new Editor({
            element: editorElement,
            extensions: [
                StarterKit.configure({
                    heading: false,
                    bulletList: false,
                    orderedList: false,
                    listItem: false,
                    bold: {},
                    italic: {},
                    strike: false,
                    code: false,
                    codeBlock: false,
                }),
                TextAlign.configure({
                    types: ["paragraph"],
                    alignments: ["left", "center", "right"],
                }),
                Placeholder.configure({
                    placeholder: placeholder,
                }),
            ],
            content: value,
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                onChange(html);
            },
            editorProps: {
                attributes: {
                    class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4",
                },
            },
        });
    });

    onDestroy(() => {
        if (editor) {
            editor.destroy();
        }
    });

    function toggleBold() {
        editor?.chain().focus().toggleBold().run();
    }

    function toggleItalic() {
        editor?.chain().focus().toggleItalic().run();
    }

    function setTextAlign(alignment: "left" | "center" | "right") {
        editor?.chain().focus().setTextAlign(alignment).run();
    }

    function handleFontSizeChange(e: Event) {
        const select = e.target as HTMLSelectElement;
        selectedFontSize = select.value;
        // Note: Font size styling would require additional extension or inline styles
    }

    const isBoldActive = $derived(editor ? (editor as any).isActive("bold") : false);
    const isItalicActive = $derived(editor ? (editor as any).isActive("italic") : false);
    const isLeftAligned = $derived(
        editor ? (editor as any).isActive({ textAlign: "left" }) : false,
    );
    const isCenterAligned = $derived(
        editor ? (editor as any).isActive({ textAlign: "center" }) : false,
    );
    const isRightAligned = $derived(
        editor ? (editor as any).isActive({ textAlign: "right" }) : false,
    );
</script>

<div class="rich-text-editor">
    <!-- Toolbar -->
    <div
        class="editor-toolbar border-light-muted bg-light flex items-center gap-2 border-b p-2"
        role="toolbar"
        aria-label="Text formatting toolbar"
    >
        <!-- Font Size Dropdown -->
        <select
            value={selectedFontSize}
            onchange={handleFontSizeChange}
            class="border-light-muted focus:ring-primary/20 rounded-md border px-2 py-1 text-sm focus:ring-2 focus:outline-none"
            aria-label="Font Size"
        >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
        </select>

        <!-- Bold Button -->
        <button
            type="button"
            onclick={toggleBold}
            class="toolbar-button {isBoldActive ? 'active' : ''}"
            aria-label="Bold"
            title="Bold (Ctrl+B)"
            aria-pressed={isBoldActive}
        >
            <span class="font-bold">B</span>
        </button>

        <!-- Italic Button -->
        <button
            type="button"
            onclick={toggleItalic}
            class="toolbar-button {isItalicActive ? 'active' : ''}"
            aria-label="Italic"
            title="Italic (Ctrl+I)"
            aria-pressed={isItalicActive}
        >
            <span class="font-serif italic">I</span>
        </button>

        <!-- Left Align Button -->
        <button
            type="button"
            onclick={() => setTextAlign("left")}
            class="toolbar-button {isLeftAligned ? 'active' : ''}"
            aria-label="Align left"
            aria-pressed={isLeftAligned}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="17" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="17" y1="18" x2="3" y2="18"></line>
            </svg>
        </button>

        <!-- Center Align Button -->
        <button
            type="button"
            onclick={() => setTextAlign("center")}
            class="toolbar-button {isCenterAligned ? 'active' : ''}"
            aria-label="Align center"
            aria-pressed={isCenterAligned}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="18" y1="10" x2="6" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="18" y1="18" x2="6" y2="18"></line>
            </svg>
        </button>

        <!-- Right Align Button -->
        <button
            type="button"
            onclick={() => setTextAlign("right")}
            class="toolbar-button {isRightAligned ? 'active' : ''}"
            aria-label="Align right"
            aria-pressed={isRightAligned}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            >
                <line x1="21" y1="10" x2="7" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="7" y2="18"></line>
            </svg>
        </button>
    </div>

    <!-- Editor Content -->
    <div
        bind:this={editorElement}
        class="editor-content border-light-muted rounded-b-md border {error
            ? 'border-red-500'
            : ''}"
        role="textbox"
        aria-multiline="true"
        aria-required={minLength ? "true" : "false"}
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
    ></div>

    <!-- Footer -->
    <div class="editor-footer mt-2 flex items-center justify-between text-sm">
        <span class="text-secondary">
            {charCount} / {maxLength} caracteres ({wordCount} palabras)
        </span>
        {#if error}
            <p role="alert" class="text-red-500">{error}</p>
        {/if}
    </div>
</div>

<style>
    .toolbar-button {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
    }

    .toolbar-button:hover {
        background-color: rgba(0, 0, 0, 0.05);
    }

    .toolbar-button.active {
        background-color: var(--color-primary, #3b82f6);
        color: white;
    }

    .toolbar-button:focus-visible {
        outline: 2px solid var(--color-primary, #3b82f6);
        outline-offset: 2px;
    }

    :global(.ProseMirror) {
        outline: none;
    }

    :global(.ProseMirror p) {
        margin-bottom: 1rem;
    }

    :global(.ProseMirror h2) {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
    }

    :global(.ProseMirror h3) {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
    }

    :global(.ProseMirror ul),
    :global(.ProseMirror ol) {
        padding-left: 1.5rem;
        margin-bottom: 1rem;
    }

    :global(.ProseMirror p.is-editor-empty:first-child::before) {
        color: #adb5bd;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }
</style>
