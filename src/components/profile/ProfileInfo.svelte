<script lang="ts">
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

    const socialMediaLinks = [
        {
            name: "twitter",
            url: socialLinks.twitter,
            label: "X/Twitter",
            viewBox: "0 0 24 24",
            path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
        },
        {
            name: "instagram",
            url: socialLinks.instagram,
            label: "Instagram",
            viewBox: "0 0 24 24",
            path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
        },
        {
            name: "facebook",
            url: socialLinks.facebook,
            label: "Facebook",
            viewBox: "0 0 24 24",
            path: "M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z",
        },
        {
            name: "linkedin",
            url: socialLinks.linkedin,
            label: "LinkedIn",
            viewBox: "0 0 24 24",
            path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
        },
        {
            name: "gmail",
            url: socialLinks.email,
            label: "Email",
            viewBox: "0 0 24 24",
            path: "M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z",
        },
        {
            name: "medium",
            url: socialLinks.medium,
            label: "Medium",
            viewBox: "0 0 24 24",
            path: "M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z",
        },
    ].filter((link) => link.url);
</script>

<div class="mt-32 flex w-full flex-col items-center gap-4">
    <!-- Name -->
    <h1 class="font-['Karla'] text-2xl leading-8 font-bold text-black">
        {displayName}
    </h1>

    <!-- Location -->
    {#if location}
        <div class="flex items-center gap-1">
            <svg class="size-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 32 32">
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 3.333c-4.418 0-8 3.582-8 8 0 6 8 14.667 8 14.667s8-8.667 8-14.667c0-4.418-3.582-8-8-8z"
                ></path>
                <circle
                    cx="16"
                    cy="11.333"
                    r="2.667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                ></circle>
            </svg>
            <span class="font-['Karla'] text-base leading-6 text-black">
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
                    class="flex size-6 items-center justify-center rounded-[4.8px] bg-[#e6e5f7] p-1 text-[#462949] transition hover:bg-[#d5d4e6]"
                    aria-label={link.label}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox={link.viewBox}
                        fill="currentColor"
                        class="size-full"
                    >
                        <path d={link.path}></path>
                    </svg>
                </a>
            {/each}
        </div>
    {/if}
</div>
