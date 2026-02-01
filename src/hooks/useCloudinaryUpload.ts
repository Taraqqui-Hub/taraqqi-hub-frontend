/**
 * Cloudinary Upload Hook
 * Handles signed direct uploads to Cloudinary
 */

import { useState, useCallback } from "react";
import api from "@/lib/api";

export type UploadType = "resume" | "kyc_document" | "profile_photo" | "company_logo";

interface UploadConfig {
	allowedFormats: string[];
	maxFileSizeBytes: number;
	maxFileSizeMB: number;
}

interface UploadResult {
	url: string;
	publicId: string;
	format: string;
}

interface UseCloudinaryUploadReturn {
	upload: (file: File) => Promise<UploadResult>;
	uploading: boolean;
	progress: number;
	error: string | null;
	config: UploadConfig | null;
}

export function useCloudinaryUpload(uploadType: UploadType): UseCloudinaryUploadReturn {
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [config, setConfig] = useState<UploadConfig | null>(null);

	const upload = useCallback(
		async (file: File): Promise<UploadResult> => {
			setUploading(true);
			setProgress(0);
			setError(null);

			try {
				// Step 1: Get signed params from backend
				const signResponse = await api.post("/upload/sign", { uploadType });
				const { params, config: uploadConfig, uploadUrl } = signResponse.data;
				setConfig(uploadConfig);

				// Validate file size
				if (file.size > uploadConfig.maxFileSizeBytes) {
					throw new Error(`File too large. Maximum size: ${uploadConfig.maxFileSizeMB}MB`);
				}

				// Validate file format
				const fileExt = file.name.split(".").pop()?.toLowerCase();
				if (fileExt && !uploadConfig.allowedFormats.includes(fileExt)) {
					throw new Error(
						`Invalid format: ${fileExt}. Allowed: ${uploadConfig.allowedFormats.join(", ")}`
					);
				}

				// Step 2: Upload directly to Cloudinary
				const formData = new FormData();
				formData.append("file", file);
				formData.append("api_key", params.apiKey);
				formData.append("timestamp", params.timestamp.toString());
				formData.append("signature", params.signature);
				formData.append("folder", params.folder);
				formData.append("public_id", params.publicId);
				formData.append("tags", params.tags);

				const uploadResponse = await fetch(uploadUrl, {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					const errorData = await uploadResponse.json();
					throw new Error(errorData.error?.message || "Upload failed");
				}

				const cloudinaryResult = await uploadResponse.json();
				setProgress(80);

				// Step 3: Confirm upload with backend
				const confirmResponse = await api.post("/upload/confirm", {
					uploadType,
					url: cloudinaryResult.secure_url,
					publicId: cloudinaryResult.public_id,
				});

				setProgress(100);

				return {
					url: cloudinaryResult.secure_url,
					publicId: cloudinaryResult.public_id,
					format: cloudinaryResult.format,
				};
			} catch (err: any) {
				const errorMessage = err.response?.data?.error || err.message || "Upload failed";
				setError(errorMessage);
				throw new Error(errorMessage);
			} finally {
				setUploading(false);
			}
		},
		[uploadType]
	);

	return { upload, uploading, progress, error, config };
}

export default useCloudinaryUpload;
