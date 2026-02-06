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
				
				// Handle potential payload wrapper or direct response
				const responseData = signResponse.data.payload || signResponse.data;
				const { params, config: uploadConfig, uploadUrl } = responseData;

				if (!uploadConfig) {
					console.error("Missing upload config in response:", signResponse.data);
					throw new Error("Failed to get upload configuration");
				}

				setConfig(uploadConfig);

				// Validate file size
				if (uploadConfig.maxFileSizeBytes && file.size > uploadConfig.maxFileSizeBytes) {
					throw new Error(`File too large. Maximum size: ${uploadConfig.maxFileSizeMB}MB`);
				}

				// Validate file format
				const fileExt = file.name.split(".").pop()?.toLowerCase();
				if (fileExt && uploadConfig.allowedFormats && !uploadConfig.allowedFormats.includes(fileExt)) {
					throw new Error(
						`Invalid format: ${fileExt}. Allowed: ${uploadConfig.allowedFormats.join(", ")}`
					);
				}

				// Step 2: Upload directly to Cloudinary
				// IMPORTANT: Parameters must be added in ALPHABETICAL ORDER to match signature
				const formData = new FormData();
				
				// 1. api_key
				formData.append("api_key", params.apiKey);
				
				// 2. folder
				formData.append("folder", params.folder);
				
				// 3. public_id
				formData.append("public_id", params.publicId);
				
				// 4. tags
				formData.append("tags", params.tags);
				
				// 5. timestamp
				formData.append("timestamp", params.timestamp.toString());

				// 6. allowed_formats (Optional but critical if part of signature)
				if (params.allowedFormats && params.allowedFormats.length > 0) {
					formData.append("allowed_formats", params.allowedFormats.join(","));
				}

				// 7. file (must be last or after all signed params)
				formData.append("file", file);
				
				// 8. signature
				formData.append("signature", params.signature);

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
