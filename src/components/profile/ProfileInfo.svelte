<script lang="ts">
    import MapIcon from "../../svgs/MapIcon.svelte";
    import XIcon from "../../svgs/XIcon.svelte";
    import InstagramIcon from "../../svgs/InstagramIcon.svelte";
    import FacebookIcon from "../../svgs/FacebookIcon.svelte";
    import LinkedinIcon from "../../svgs/LinkedinIcon.svelte";
    import GmailIcon from "../../svgs/GmailIcon.svelte";
    import MediumIcon from "../../svgs/MediumIcon.svelte";

    interface Props {
        displayName: string;
        location?: string;
        socialLinks?: {
            twitter?: string;
            instagram?: string;
            facebook?: string;
            linkedin?: string;
            email?: string;
            medium?: string;
            website?: string;
        };
    }

    let { displayName, location, socialLinks = {} }: Props = $props();

    interface SocialLink {
        name: string;
        url: string;
        label: string;
        icon: any;
    }

    const allSocialLinks: SocialLink[] = [
        {
            name: "twitter",
            url: socialLinks.twitter || "",
            label: "X/Twitter",
            icon: XIcon,
        },
        {
            name: "instagram",
            url: socialLinks.instagram || "",
            label: "Instagram",
            icon: InstagramIcon,
        },
        {
            name: "facebook",
            url: socialLinks.facebook || "",
            label: "Facebook",
            icon: FacebookIcon,
        },
        {
            name: "linkedin",
            url: socialLinks.linkedin || "",
            label: "LinkedIn",
            icon: LinkedinIcon,
        },
        {
            name: "gmail",
            url: socialLinks.email || "",
            label: "Email",
            icon: GmailIcon,
        },
        {
            name: "medium",
            url: socialLinks.medium || "",
            label: "Medium",
            icon: MediumIcon,
        },
    ];

    const socialMediaLinks = $derived(allSocialLinks.filter((link) => link.url));
</script>

<div class="mt-32 flex w-full flex-col items-center gap-4">
    <!-- Name -->
    <h1 class="text-body text-2xl font-bold leading-tight">
        {displayName}
    </h1>

    <!-- Location -->
    {#if location}
        <div class="flex items-center gap-1">
            <MapIcon class="text-body size-8" />
            <span class="text-body text-base leading-normal">
                {location}
            </span>
        </div>
    {/if}

    <!-- Social Media Links -->
    {#if socialMediaLinks.length > 0}
        <div class="flex items-center gap-2">
            {#each socialMediaLinks as link}
                <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="bg-purple-tint text-secondary flex size-6 items-center justify-center rounded p-1 transition-opacity hover:opacity-90 focus:ring-2 focus:ring-secondary focus:outline-none"
                    aria-label={link.label}
                >
                    <link.icon class="size-full" />
                </a>
            {/each}
        </div>
    {/if}
</div>
