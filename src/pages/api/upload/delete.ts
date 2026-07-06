import { DeleteObjectCommand } from "@aws-sdk/client-s3";

import { STORAGE_PREFIX_STABLE, client } from "../../../utils/objectStorage";
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

    const body = (await request.json()) as { key?: string } | Record<string, unknown>;
    const { key } = body as { key?: string };
    if (!key) {
        return json({ error: `Missing key "key" in request body` }, 400);
    }

    const userPrefix = `${STORAGE_PREFIX_STABLE}/${session.user.id}/`;
    if (!key.startsWith(userPrefix)) {
        return json({ error: `Given key "${key}" does not belong to current user` }, 403);
    }

    try {
        await client.send(
            new DeleteObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        return json({ success: true });
    } catch (err: any) {
        console.error(err);

        return json(
            { error: `Bucket responded with error code "${err.Code}"` },
            err["$metadata"].httpStatusCode || 500,
        );
    }
};
