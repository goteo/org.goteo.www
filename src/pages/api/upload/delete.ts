import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { STORAGE_ADDRESS } from "./postupload";
import { createClient, parseStorageKey } from "../../../utils/media/objectStorage";
import { Unauthorized } from "../../../utils/responses";

import type { APIRoute } from "astro";

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export const POST: APIRoute = async ({ request, locals }) => {
    const { session } = locals;
    if (!session) return Unauthorized;

    const body = await request.json();
    const { keyOrUrl } = body as { keyOrUrl?: unknown };
    if (!keyOrUrl || typeof keyOrUrl !== "string") {
        return json({ error: `Missing key "keyOrUrl" in request body` }, 400);
    }

    const key = keyOrUrl.replace(`${STORAGE_ADDRESS}/`, "");

    const { owner } = parseStorageKey(key);
    if (owner !== String(session.user.id)) {
        return json({ error: `Given key "${key}" does not belong to current user` }, 403);
    }

    try {
        const client = createClient();
        await client.send(
            new DeleteObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        return json({ success: true });
    } catch (err: any) {
        console.error(err);

        const message = err?.Code
            ? `Bucket responded with error code "${err.Code}"`
            : err?.message || "Unknown upload error";

        return json({ error: message }, err?.$metadata?.httpStatusCode || 500);
    }
};
