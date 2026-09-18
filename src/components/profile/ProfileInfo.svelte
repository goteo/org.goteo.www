<script lang="ts">
    import FacebookIcon from "../icons/social/FacebookIcon.svelte";
    import GmailIcon from "../icons/social/GmailIcon.svelte";
    import InstagramIcon from "../icons/social/InstagramIcon.svelte";
    import LinkedinIcon from "../icons/social/LinkedinIcon.svelte";
    import MediumIcon from "../icons/social/MediumIcon.svelte";
    import XIcon from "../icons/social/XIcon.svelte";
    import Title from "../library/typography/Title.svelte";
    import TerritoryTag from "../project/TerritoryTag.svelte";

    import type { Link, Territory } from "../../openapi/client/types.gen";

    interface Props {
        displayName: string;
        territory?: Territory;
        links?: Link[];
        email?: string;
    }

    let { displayName, territory, links = [], email }: Props = $props();

    type SocialLinkKey = "email" | "facebook" | "instagram" | "linkedin" | "medium" | "twitter";

    interface SocialLink {
        url: string;
        label: string;
        icon: any;
    }

    function detectSocialPlatform(link: Link): SocialLinkKey | null {
        const url = (link.url ?? "").toLowerCase();
        const rel = (link.rel ?? "").toLowerCase();
        if (rel === "twitter" || url.includes("twitter.com") || url.includes("x.com"))
            return "twitter";
        if (rel === "instagram" || url.includes("instagram.com")) return "instagram";
        if (rel === "facebook" || url.includes("facebook.com")) return "facebook";
        if (rel === "linkedin" || url.includes("linkedin.com")) return "linkedin";
        if (rel === "medium" || url.includes("medium.com")) return "medium";
        return null;
    }

    const resolvedLinks = $derived(
        links.reduce<Record<string, string>>(
            (acc, link) => {
                const platform = detectSocialPlatform(link);
                if (platform && link.url && !acc[platform]) acc[platform] = link.url;
                return acc;
            },
            email ? { email: `mailto:${email}` } : {},
        ),
    );

    const allSocialLinks: Record<SocialLinkKey, SocialLink> = $derived({
        email: { url: resolvedLinks.email || "", label: "Email", icon: GmailIcon },
        facebook: { url: resolvedLinks.facebook || "", label: "Facebook", icon: FacebookIcon },
        instagram: { url: resolvedLinks.instagram || "", label: "Instagram", icon: InstagramIcon },
        linkedin: { url: resolvedLinks.linkedin || "", label: "LinkedIn", icon: LinkedinIcon },
        medium: { url: resolvedLinks.medium || "", label: "Medium", icon: MediumIcon },
        twitter: { url: resolvedLinks.twitter || "", label: "X/Twitter", icon: XIcon },
    });

    const socialMediaLinks = $derived(
        (Object.entries(allSocialLinks) as [SocialLinkKey, SocialLink][]).filter(
            ([, link]) => link.url,
        ),
    );
</script>

<div class="mt-28 flex w-full flex-col items-center gap-4">
    <!-- Name -->
    <Title level={1} variant="subsection" color="secondary" class="leading-tight">
        {displayName}
    </Title>

    <!-- Location -->
    {#if territory}
        <TerritoryTag {territory} class="border-0 bg-transparent" />
    {/if}

    <!-- Social Media Links -->
    {#if socialMediaLinks.length > 0}
        <div class="flex items-center gap-2">
            {#each socialMediaLinks as [, link]}
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bg-variant1 text-secondary focus:ring-secondary flex size-6 items-center justify-center rounded p-1 transition-opacity hover:opacity-90 focus:ring-2 focus:outline-none"
                    aria-label={link.label}
                >
                    <link.icon class="size-full" />
                </a>
            {/each}
        </div>
    {/if}
</div>
