export type UploadStage = "preupload" | "uploading" | "postupload";

export interface UploadResult {
    url: string;
    key: string;
}

export interface UploadOptions {
    onProgress?: (stage: UploadStage) => void;
}

async function parseError(res: Response): Promise<string> {
    try {
        const body = await res.json();
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

    const { url: signedUrl, key: tempKey } = await preRes.json();

    options?.onProgress?.("uploading");

    const putRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
    });

    if (!putRes.ok) {
        throw new Error(`S3 PUT failed: HTTP ${putRes.status}`);
    }

    options?.onProgress?.("postupload");

    const postRes = await fetch("/api/upload/postupload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: tempKey }),
    });

    if (!postRes.ok) {
        throw new Error(await parseError(postRes));
    }

    const { url, key } = await postRes.json();
    return { url, key };
}
