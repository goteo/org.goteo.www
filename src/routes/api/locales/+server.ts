import { json } from "@sveltejs/kit";

export async function GET() {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return json({
        locales: [
            { code: "en", label: "English" },
            { code: "es", label: "Español" },
            { code: "ca", label: "Català" },
        ],
    });
}
