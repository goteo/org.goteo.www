import { uploadImage, type UploadResult, type UploadStage } from "./imageUpload";

export function createImageUploader() {
    let uploading = $state(false);
    let stage = $state<UploadStage | null>(null);
    let error = $state<string | null>(null);

    async function upload(file: File): Promise<UploadResult | null> {
        uploading = true;
        stage = null;
        error = null;

        try {
            const result = await uploadImage(file, {
                onProgress: (s) => {
                    stage = s;
                },
            });
            return result;
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
            return null;
        } finally {
            uploading = false;
        }
    }

    return {
        get uploading() {
            return uploading;
        },
        get stage() {
            return stage;
        },
        get error() {
            return error;
        },
        upload,
    };
}
