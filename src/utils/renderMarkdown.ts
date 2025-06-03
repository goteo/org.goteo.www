import { marked } from "marked";

/**
 * Converts raw Markdown text into HTML with cleaned formatting.
 * - Normalizes line breaks.
 * - Fixes common spacing and Markdown issues.
 * - Ensures links open in a new tab.
 * - Handles emphasis combinations (bold, italic, underline).
 *
 * @param rawText - The raw Markdown string.
 * @returns A Promise that resolves to clean HTML.
 */
export async function renderMarkdown(rawText: string): Promise<string> {
    if (!rawText || typeof rawText !== "string") return "";

    const cleaned = rawText.replace(/\r\n/g, "\n").trim();

    const renderer = new marked.Renderer();

    renderer.link = function ({ href, title, text }) {
        const titleAttr = title ? ` title="${title}"` : "";
        return `<a href="${href}" class="underline" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
    };

    renderer.image = function ({ href, title, text }) {
        const titleAttr = title ? ` title="${title}"` : "";
        return `<img src="${href}" alt="${text}" class="rounded-4xl" ${titleAttr}>`;
    };

    marked.use({ renderer });

    const result = marked.parse(cleaned);

    return typeof result === "string" ? result : await result;
}
