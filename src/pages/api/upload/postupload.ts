import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";

import { STORAGE_PREFIX_TEMP } from "./preupload";
import { Unauthorized } from "../../../utils/responses";

import type { APIRoute } from "astro";

const s3 = new S3Client({
    region: import.meta.env.OBJECT_STORAGE_REGION,
    endpoint: import.meta.env.OBJECT_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: import.meta.env.OBJECT_STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});

/**
 * Stable pre-fix for processed files.
 */
export const STORAGE_PREFIX_STABLE = "uploads/public";

/**
 * 8MBs maximum file size.
 */
export const STORAGE_MAXSIZE = 8388608;

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

async function getHexHash(buffer: Uint8Array<ArrayBuffer>): Promise<string> {
    const digest = await crypto.subtle.digest("SHA-256", buffer);

    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

export const POST: APIRoute = async ({ request, locals }) => {
    const { session } = locals;
    if (!session) return Unauthorized;

    const { key } = await request.json();
    if (!key) {
        return json({ error: "Missing key `key` in request body" }, 400);
    }

    const userPrefix = `${STORAGE_PREFIX_TEMP}/${session.user.id}/`;
    if (!key.startsWith(userPrefix)) {
        return json({ error: `Given key ${key} does not belong to current user` }, 403);
    }

    try {
        const res = await s3.send(
            new GetObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        if (!res.Body || res.ContentLength === undefined) {
            return json({ error: "File not found" }, 404);
        }

        const MAX_SIZE = Number(import.meta.env.PUBLIC_DEFAULT_MAXSIZE) || STORAGE_MAXSIZE;
        if (res.ContentLength > MAX_SIZE) {
            return json({ error: `File too large (max ${MAX_SIZE})` }, 400);
        }

        const buffer = new Uint8Array(await res.Body.transformToByteArray());

        const detected = await fileTypeFromBuffer(buffer);
        if (!detected) {
            return json({ error: "Unknown or invalid file" }, 400);
        }

        const allowed = ["image/png", "image/jpeg", "image/webp"];
        if (!allowed.includes(detected.mime)) {
            return json({ error: "Invalid image type" }, 400);
        }

        const hash = await getHexHash(buffer);
        const stableKey = `${STORAGE_PREFIX_STABLE}/${session.user.id}/${hash}.${detected.ext}`;

        await s3.send(
            new PutObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: stableKey,
                Body: buffer,
                ContentType: detected.mime,
            }),
        );

        await s3.send(
            new DeleteObjectCommand({
                Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
                Key: key,
            }),
        );

        const base = new URL(import.meta.env.OBJECT_STORAGE_ENDPOINT).toString().replace(/\/$/, "");
        const url = `${base}/${import.meta.env.OBJECT_STORAGE_BUCKET}/${stableKey}`;

        return json({ url, key: stableKey });
    } catch (err) {
        console.error(err);
        return json({ error: "Upload processing failed" }, 500);
    }
};
