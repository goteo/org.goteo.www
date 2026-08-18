import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

export function createClient(options?: S3ClientConfig): S3Client {
    return new S3Client({
        region: options?.region || import.meta.env.OBJECT_STORAGE_REGION,
        endpoint: options?.endpoint || import.meta.env.OBJECT_STORAGE_ENDPOINT,
        credentials: {
            // @ts-expect-error key does not exist on AwsCredentialIdentity event though it fucking does
            accessKeyId: options?.credentials?.accessKeyId || import.meta.env.OBJECT_STORAGE_ACCESS_KEY,
            // @ts-expect-error key does not exist on AwsCredentialIdentity event though it fucking does
            secretAccessKey: options?.credentials?.secretAccessKey || import.meta.env.OBJECT_STORAGE_SECRET_KEY,
        },
        forcePathStyle: options?.forcePathStyle || true,
        ...options
    })
};
