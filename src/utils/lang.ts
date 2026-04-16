export function getLanguageDisplayName(lang: string): string | undefined {
    const displayNames = new Intl.DisplayNames(lang, { type: "language" });
    const displayName = displayNames.of(lang)!;

    if (displayName === lang) return;

    return displayName.charAt(0).toUpperCase() + displayName.slice(1);
}
