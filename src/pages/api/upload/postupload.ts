import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

import {
    createClient,
    generateStorageKey,
    getFileStorableData,
} from "../../../utils/media/objectStorage";
import {
    STORAGE_ALLOWEDTYPES,
    STORAGE_MAXSIZE,
    STORAGE_PREFIX_STABLE,
    STORAGE_PREFIX_TEMP,
} from "../../../utils/media/objectStorage.types";
import { Unauthorized } from "../../../utils/responses";

import type { APIRoute } from "astro";

/**
 * Path to the storage bucket.
 * Derived from: `OBJECT_STORAGE_ENDPOINT/OBJECT_STORAGE_BUCKET` (no trailing slash)
 */
export const STORAGE_ADDRESS =
    import.meta.env.OBJECT_STORAGE_ENDPOINT.replace(/\/$/, "") +
    `/${import.meta.env.OBJECT_STORAGE_BUCKET}`;

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export const POST: APIRoute = async ({ request, locals }) => {
    const { session } = locals;
    if (!session) return Unauthorized;

    const { key } = (await request.json()) as { key?: string };
    if (!key) {
        return json({ error: `Missing key "key" in request body` }, 400);
    }

    const userPrefix = `${STORAGE_PREFIX_TEMP}/${session.user.id}/`;
    if (!key.startsWith(userPrefix)) {
        return json({ error: `Given key "${key}" does not belong to current user` }, 403);
    }

    try {
        const client = createClient();
        const res = await client.send(
            new GetObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        if (!res.Body || res.ContentLength === undefined) {
            return json({ error: `Could not get object of key "${key}"` }, 404);
        }

        const MAX_SIZE = Number(import.meta.env.PUBLIC_DEFAULT_MAXSIZE) || STORAGE_MAXSIZE;
        if (res.ContentLength > MAX_SIZE) {
            return json(
                {
                    error: `File size is larger (${res.ContentLength}) than max allowed size (${MAX_SIZE})`,
                },
                400,
            );
        }

        const buffer = new Uint8Array(await res.Body.transformToByteArray());
        const file = await getFileStorableData(buffer);

        if (!STORAGE_ALLOWEDTYPES.includes(file.type.mime)) {
            return json(
                { error: `Invalid type. Allowed types are: ${STORAGE_ALLOWEDTYPES.join(",")}` },
                400,
            );
        }

        const stableKey = generateStorageKey(STORAGE_PREFIX_STABLE, session.user.id!, file);

        await client.send(
            new PutObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: stableKey,
                Body: buffer,
                ContentType: file.type.mime,
            }),
        );

        await client.send(
            new DeleteObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        const stableUrl = `${STORAGE_ADDRESS}/${stableKey}`;

        return json({ url: stableUrl, key: stableKey });
    } catch (err: any) {
        console.error(err);

        const message = err?.Code
            ? `Bucket responded with error code "${err.Code}"`
            : err?.message || "Unknown upload error";

        return json({ error: message }, err?.$metadata?.httpStatusCode || 500);
    }
};
