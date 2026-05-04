import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { Unauthorized } from "../../../utils/responses";

import type { APIRoute } from "astro";

/**
 * Temporary pre-fix for unvalidated, unprocessed files.
 */
export const STORAGE_PREFIX_TEMP = "uploads/temp";

const s3 = new S3Client({
    region: import.meta.env.OBJECT_STORAGE_REGION,
    endpoint: import.meta.env.OBJECT_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: import.meta.env.OBJECT_STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});

function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

export const POST: APIRoute = async ({ request, locals }) => {
    const { session } = locals;
    if (!session) return Unauthorized;

    const { contentType } = await request.json();
    if (!contentType) {
        return json({ error: "Missing key `contentType` in request body" }, 400);
    }

    const tempKey = `${STORAGE_PREFIX_TEMP}/${session.user.id}/${crypto.randomUUID()}`;

    const command = new PutObjectCommand({
        Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
        Key: tempKey,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3, command, {
        expiresIn: 120,
    });

    return json({ url: signedUrl, key: tempKey });
};
