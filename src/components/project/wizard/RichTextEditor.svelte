<!--
    Rich Text Editor Component

    Reusable rich text editor using Tiptap with design system components.

    Features:
    - Basic formatting (bold, italic, text alignment)
    - Font size selection
    - Validation state display
    - Placeholder support
    - Keyboard shortcuts
    - Full keyboard accessibility

    Design System Compliance:
    - Colors: bg-light-surface for toolbar, border-secondary for inputs
    - Border radius: rounded-md for select, rounded-lg for editor
    - Spacing: gap-2 for toolbar items
    - Typography: text-sm for select
    - Components: Uses Button (kind="ghost", size="sm") and Select from library
    - Uses tailwind-merge for class composition
    - Active state: bg-primary with text-secondary
    - Hover state: hover:bg-purple-tint

    Props:
    - id: string - Component identifier
    - value: string - HTML content value
    - onChange: (html: string) => void - Callback when content changes
    - placeholder?: string - Placeholder text for empty editor
    - error?: string - Validation error message
    - ariaDescribedBy?: string - ARIA describedby attribute
    - class?: ClassNameValue - Additional Tailwind classes

    Usage:
    ```svelte
    <RichTextEditor
        id="description"
        bind:value={description}
        onChange={(html) => updateDescription(html)}
        placeholder="Enter your description..."
        error={descriptionError}
        class="mt-4"
    />
    ```

    Accessibility:
    - ARIA labels for all toolbar buttons
    - aria-pressed for toggle button states
    - role="toolbar" for button group
    - role="textbox" for editor content
    - aria-multiline for editor
    - aria-invalid for validation errors
    - aria-describedby for error association
    - Keyboard navigation support
    - Screen reader friendly messages
-->
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { Editor } from "@tiptap/core";
    import StarterKit from "@tiptap/starter-kit";
    import Placeholder from "@tiptap/extension-placeholder";
    import TextAlign from "@tiptap/extension-text-align";
    import { TextStyle, FontSize } from "@tiptap/extension-text-style";
    import { twMerge, type ClassNameValue } from "tailwind-merge";
    import Button from "../../../components/library/Button.svelte";
    import Select from "../../../components/library/Select.svelte";

    interface RichTextEditorProps {
        id: string;
        value: string;
        onChange: (html: string) => void;
        placeholder?: string;
        error?: string;
        ariaDescribedBy?: string;
        class?: ClassNameValue;
    }

    let {
        value,
        onChange,
        placeholder = "",
        error,
        ariaDescribedBy,
        class: className = "",
    }: RichTextEditorProps = $props();

    let editorElement: HTMLDivElement;
    let editor: Editor | null = $state(null);
    let selectedFontSize = $state("16px");

    // Active states - tracked as state variables
    let isBoldActive = $state(false);
    let isItalicActive = $state(false);
    let isLeftAligned = $state(false);
    let isCenterAligned = $state(false);
    let isRightAligned = $state(false);

    /**
     * Updates active states from editor
     */
    function updateActiveStates() {
        if (!editor) return;
        isBoldActive = editor.isActive("bold");
        isItalicActive = editor.isActive("italic");
        isLeftAligned = editor.isActive({ textAlign: "left" });
        isCenterAligned = editor.isActive({ textAlign: "center" });
        isRightAligned = editor.isActive({ textAlign: "right" });
    }

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
                TextStyle,
                FontSize.configure({
                    types: ["textStyle"],
                }),
            ],
            content: value,
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                onChange(html);
                updateActiveStates();
            },
            onSelectionUpdate: () => {
                updateActiveStates();
            },
            editorProps: {
                attributes: {
                    class: "prose prose-sm max-w-none focus:outline-none min-h-[150px] p-4",
                },
            },
        });

        // Initial update
        updateActiveStates();
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

    function handleFontSizeChange(value: string) {
        selectedFontSize = value;
        editor?.chain().focus().setFontSize(value).run();
    }
</script>

<div class={twMerge("rich-text-editor", className)}>
    <!-- Toolbar -->
    <div
        class="editor-toolbar border-light-muted bg-light-surface flex items-center justify-between border-b p-2"
        role="toolbar"
        aria-label="Text formatting toolbar"
    >
        <!-- Left Group: Font Size, Bold, Italic -->
        <div class="flex items-center gap-2">
            <!-- Font Size Dropdown -->
            <Select
                bind:value={selectedFontSize}
                onChange={handleFontSizeChange}
                labelText="Font Size"
                class="w-auto min-w-[120px] px-2 py-1 text-sm"
            >
                {#snippet children()}
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                {/snippet}
            </Select>

            <!-- Bold Button -->
            <Button
                type="button"
                kind="ghost"
                size="sm"
                onclick={toggleBold}
                class={twMerge("rounded-lg", isBoldActive ? "!bg-primary !text-secondary" : "hover:bg-purple-tint")}
                aria-label="Bold"
                title="Bold (Ctrl+B)"
                aria-pressed={isBoldActive}
            >
                {#snippet children()}
                    <span class="font-bold">B</span>
                {/snippet}
            </Button>

            <!-- Italic Button -->
            <Button
                type="button"
                kind="ghost"
                size="sm"
                onclick={toggleItalic}
                class={twMerge("rounded-lg", isItalicActive ? "!bg-primary !text-secondary" : "hover:bg-purple-tint")}
                aria-label="Italic"
                title="Italic (Ctrl+I)"
                aria-pressed={isItalicActive}
            >
                {#snippet children()}
                    <span class="font-serif italic">I</span>
                {/snippet}
            </Button>
        </div>

        <!-- Right Group: Alignment Buttons -->
        <div class="flex items-center gap-2">
            <!-- Left Align Button -->
            <Button
                type="button"
                kind="ghost"
                size="sm"
                onclick={() => setTextAlign("left")}
                class={twMerge("rounded-lg", isLeftAligned ? "!bg-primary !text-secondary" : "hover:bg-purple-tint")}
                aria-label="Align left"
                aria-pressed={isLeftAligned}
            >
                {#snippet children()}
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
                {/snippet}
            </Button>

            <!-- Center Align Button -->
            <Button
                type="button"
                kind="ghost"
                size="sm"
                onclick={() => setTextAlign("center")}
                class={twMerge("rounded-lg", isCenterAligned ? "!bg-primary !text-secondary" : "hover:bg-purple-tint")}
                aria-label="Align center"
                aria-pressed={isCenterAligned}
            >
                {#snippet children()}
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
                {/snippet}
            </Button>

            <!-- Right Align Button -->
            <Button
                type="button"
                kind="ghost"
                size="sm"
                onclick={() => setTextAlign("right")}
                class={twMerge("rounded-lg", isRightAligned ? "!bg-primary !text-secondary" : "hover:bg-purple-tint")}
                aria-label="Align right"
                aria-pressed={isRightAligned}
            >
                {#snippet children()}
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
                {/snippet}
            </Button>
        </div>
    </div>

    <!-- Editor Content -->
    <div
        bind:this={editorElement}
        class="editor-content rounded-xl border {error ? 'border-red-500' : ''}"
        role="textbox"
        aria-multiline="true"
        aria-invalid={!!error}
        aria-describedby={ariaDescribedBy}
    ></div>

    <!-- Error Message -->
    {#if error}
        <p role="alert" class="mt-2 text-sm text-red-500">{error}</p>
    {/if}
</div>
