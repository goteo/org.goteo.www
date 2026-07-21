export type UploadStage = "preupload" | "uploading" | "postupload";

export interface UploadResult {
    url: string;
    key: string;
}

export interface UploadOptions {
    onProgress?: (stage: UploadStage) => void;
    onBytesProgress?: (loaded: number, total: number) => void;
}

async function parseError(res: Response): Promise<string> {
    try {
        const body = (await res.json()) as { error?: string };
        if (body?.error) return body.error;
    } catch {
        //
    }
    return `HTTP ${res.status}`;
}

export async function uploadImage(file: File, options?: UploadOptions): Promise<UploadResult> {
    options?.onProgress?.("preupload");

    const preRes = await fetch("/api/upload/preupload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
    });

    if (!preRes.ok) {
        throw new Error(await parseError(preRes));
    }

    const { url: signedUrl, key: tempKey } = (await preRes.json()) as {
        url: string;
        key: string;
    };

    options?.onProgress?.("uploading");

    // Use XMLHttpRequest instead of fetch because fetch does not expose
    // upload progress events. This callback is consumed by FileUpload.svelte
    // to render a real-time progress bar with percentage.
    const result = await new Promise<UploadResult>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", signedUrl);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                options?.onBytesProgress?.(e.loaded, e.total);
            }
        };

        xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    options?.onProgress?.("postupload");

                    const postRes = await fetch("/api/upload/postupload", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ key: tempKey }),
                    });

                    if (!postRes.ok) {
                        reject(new Error(await parseError(postRes)));
                        return;
                    }

                    const { url, key } = (await postRes.json()) as {
                        url: string;
                        key: string;
                    };
                    resolve({ url, key });
                } catch (err) {
                    reject(err);
                }
            } else {
                reject(new Error(`S3 PUT failed: HTTP ${xhr.status}`));
            }
        };

        xhr.onerror = () => reject(new Error("S3 PUT network error"));
        xhr.send(file);
    });

    return result;
}
