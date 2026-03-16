export function getLanguageDisplayName(lang: string): string | undefined {
    const displayNames = new Intl.DisplayNames(lang, { type: "language" });
    const displayName = displayNames.of(lang)!;

    if (["es", "ca", "eu", "gl"].includes(lang)) {
        return displayName.charAt(0).toUpperCase() + displayName.slice(1);
    }

    if (displayName === lang) return;

    return displayName;
}
