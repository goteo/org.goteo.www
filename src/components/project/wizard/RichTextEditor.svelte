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
    - minLength?: number - Minimum character length
    - maxLength?: number - Maximum character length

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
    import { Editor } from "@tiptap/core";
    import Placeholder from "@tiptap/extension-placeholder";
    import TextAlign from "@tiptap/extension-text-align";
    import { TextStyle, FontSize } from "@tiptap/extension-text-style";
    import StarterKit from "@tiptap/starter-kit";
    import { onMount, onDestroy } from "svelte";
    import { twMerge, type ClassNameValue } from "tailwind-merge";

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

    let {
        value = $bindable(""),
        onChange,
        placeholder = "",
        error,
        ariaDescribedBy,
        class: className = "",
        minLength,
        maxLength,
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

    const BUTTONS_CLASSES: ClassNameValue =
        "flex size-10 cursor-pointer items-center justify-center rounded-lg border bg-white shadow-sm";

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
                    defaultAlignment: "left",
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

    $effect.pre(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
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

    function handleFontSizeChange(
        event: Event & {
            currentTarget: EventTarget & HTMLSelectElement;
        },
    ) {
        selectedFontSize = event.currentTarget.value;
        editor?.chain().focus().setFontSize(event.currentTarget.value).run();
    }
</script>

<div class={twMerge("rich-text-editor space-y-4", className)}>
    <!-- Toolbar -->
    <div
        class="editor-toolbar border-light-muted bg-light-surface flex items-center justify-between"
        role="toolbar"
        aria-label="Text formatting toolbar"
    >
        <!-- Left Group: Font Size, Bold, Italic -->
        <div class="flex items-center gap-2">
            <!-- Font Size Dropdown -->
            <div class="relative flex gap-2">
                <select
                    bind:value={selectedFontSize}
                    onchange={handleFontSizeChange}
                    aria-label="Font size"
                    title="Font size"
                    class={twMerge(
                        BUTTONS_CLASSES,
                        "border-grey text-secondary w-auto max-w-[110px] appearance-none bg-none px-2 py-1 pr-8 text-sm ring-0",
                    )}
                >
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                </select>
                <svg
                    class="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M3 5.5L8 10.5L13 5.5"
                        stroke="#462949"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </div>

            <!-- Bold Button -->
            <button
                type="button"
                onclick={toggleBold}
                class={twMerge(
                    BUTTONS_CLASSES,
                    isBoldActive ? "border-secondary" : "border-grey p-2",
                )}
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
                class={twMerge(
                    BUTTONS_CLASSES,
                    isItalicActive ? "border-secondary" : "border-grey p-2",
                )}
                aria-label="Italic"
                title="Italic (Ctrl+I)"
                aria-pressed={isItalicActive}
            >
                <span class="font-serif italic">I</span>
            </button>
        </div>

        <!-- Right Group: Alignment Buttons -->
        <div class="flex items-center gap-2">
            <!-- Left Align Button -->
            <button
                type="button"
                onclick={() => setTextAlign("left")}
                class={twMerge(
                    BUTTONS_CLASSES,
                    isLeftAligned ? "border-secondary" : "border-grey p-2",
                )}
                aria-label="Align left"
                aria-pressed={isLeftAligned}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M13.5 18H4.5M19.5 12H4.5M19.5 6H4.5"
                        stroke="#464646"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>

            <!-- Center Align Button -->
            <button
                type="button"
                onclick={() => setTextAlign("center")}
                class={twMerge(
                    BUTTONS_CLASSES,
                    isCenterAligned ? "border-secondary" : "border-grey p-2",
                )}
                aria-label="Align center"
                aria-pressed={isCenterAligned}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M15 18H9M19.5 12H4.5M15 6H9"
                        stroke="#464646"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>

            <!-- Right Align Button -->
            <button
                type="button"
                onclick={() => setTextAlign("right")}
                class={twMerge(
                    BUTTONS_CLASSES,
                    isRightAligned ? "border-secondary" : "border-grey p-2",
                )}
                aria-label="Align right"
                aria-pressed={isRightAligned}
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10.5 18H19.5M4.5 12H19.5M4.5 6H19.5"
                        stroke="#464646"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- Editor Content -->
    <div
        bind:this={editorElement}
        class="editor-content h-60 rounded-lg border {error
            ? 'border-red-500'
            : 'border-secondary'}"
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
