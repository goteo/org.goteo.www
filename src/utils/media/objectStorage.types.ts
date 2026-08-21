/**
 * Uploaded file data
 */
export interface UploadedObject {
    id: string;

    /**
     * Full URL to the object.
     */
    url: string;

    /**
     * Object Key.
     */
    key?: string;

    /**
     * Original file reference
     */
    file?: File;

    /**
     * MIME type.
     */
    type: string;

    /**
     * Object size in bytes
     */
    size: number;

    /**
     * Original filename
     */
    name: string;
}

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
 */
export const STORAGE_MAXSIZE = import.meta.env.PUBLIC_DEFAULT_MAXSIZE;

/**
 * Allowed MIME types of single objects.
 */
export const STORAGE_ALLOWEDTYPES = [
    "image/jpeg",
    "image/webp",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "video/mp4",
    "video/webm",
    "video/quicktime",
];

/**
 * Path to the storage bucket.
 * Derived from: `OBJECT_STORAGE_ENDPOINT/OBJECT_STORAGE_BUCKET` (no trailing slash)
 */
export const STORAGE_ADDRESS = new URL(import.meta.env.OBJECT_STORAGE_ENDPOINT).toString().replace(/\/$/, "") + `/${import.meta.env.OBJECT_STORAGE_BUCKET}`;
