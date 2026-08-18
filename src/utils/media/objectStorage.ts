import { S3Client } from "@aws-sdk/client-s3";

export const client = new S3Client({
    region: import.meta.env.OBJECT_STORAGE_REGION,
    endpoint: import.meta.env.OBJECT_STORAGE_ENDPOINT,
    credentials: {
        accessKeyId: import.meta.env.OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: import.meta.env.OBJECT_STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});
