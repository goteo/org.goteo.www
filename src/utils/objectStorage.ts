import { S3Client } from "@aws-sdk/client-s3";

/**
 * Stable pre-fix for processed files.
 */
export const STORAGE_PREFIX_STABLE = "uploads/public";

/**
 * Temporary pre-fix for unvalidated, unprocessed files.
 */
export const STORAGE_PREFIX_TEMP = "uploads/temp";

/**
 * Default maximum file size for single objects.
 * 8MBs based on upper normal limit of files in Goteo 3 assets bucket.
 */
export const STORAGE_MAXSIZE = 8388608;

/**
 * Allowed MIME types of single objects.
 */
export const STORAGE_ALLOWEDTYPES = ["image/jpeg", "image/webp", "image/png", "image/gif"];

export const client = new S3Client({
    region: import.meta.env.OBJECT_STORAGE_REGION,
    endpoint: import.meta.env.OBJECT_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: import.meta.env.OBJECT_STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});
