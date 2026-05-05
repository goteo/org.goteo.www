import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
    STORAGE_ALLOWEDTYPES,
    STORAGE_PREFIX_TEMP,
    client,
} from "../../../utils/objectStorage";
import { Unauthorized } from "../../../utils/responses";

import type { APIRoute } from "astro";

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
        return json({ error: `Missing key "contentType" in request body` }, 400);
    }

    if (!STORAGE_ALLOWEDTYPES.includes(contentType)) {
        return json(
            { error: `Invalid type. Allowed types are: ${STORAGE_ALLOWEDTYPES.join(",")}` },
            400,
        );
    }

    const tempKey = `${STORAGE_PREFIX_TEMP}/${session.user.id}/${crypto.randomUUID()}`;

    const command = new PutObjectCommand({
        Bucket: import.meta.env.OBJECT_STORAGE_BUCKET,
        Key: tempKey,
        ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(client, command, {
        expiresIn: 120,
    });

    return json({ url: signedUrl, key: tempKey });
};
