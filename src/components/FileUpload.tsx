/**
 * File Upload Component
 * Reusable upload component using Cloudinary - Professional design
 */

import { useRef, useState } from "react";
import useCloudinaryUpload, { UploadType } from "@/hooks/useCloudinaryUpload";

interface FileUploadProps {
	uploadType: UploadType;
	onSuccess: (url: string, publicId: string) => void;
	onError?: (error: string) => void;
	label?: string;
	accept?: string;
	currentUrl?: string;
	className?: string;
}

export default function FileUpload({
	uploadType,
	onSuccess,
	onError,
	label = "Upload File",
	accept,
	currentUrl,
	className = "",
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const { upload, uploading, progress, error, config } = useCloudinaryUpload(uploadType);
	const [dragActive, setDragActive] = useState(false);

	const acceptString =
		accept || config?.allowedFormats.map((f) => `.${f}`).join(",") || "*";

	const handleFile = async (file: File) => {
		try {
			const result = await upload(file);
			onSuccess(result.url, result.publicId);
		} catch (err: any) {
			onError?.(err.message);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	const handleDrag = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		const file = e.dataTransfer.files?.[0];
		if (file) {
			handleFile(file);
		}
	};

	return (
		<div className={className}>
			<input
				ref={inputRef}
				type="file"
				accept={acceptString}
				onChange={handleChange}
				className="hidden"
				disabled={uploading}
			/>

			<div
				onClick={() => inputRef.current?.click()}
				onDragEnter={handleDrag}
				onDragLeave={handleDrag}
				onDragOver={handleDrag}
				onDrop={handleDrop}
				className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition
          ${dragActive ? "border-[#2563EB] bg-blue-50" : "border-[#E2E8F0] hover:border-[#2563EB]"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
			>
				{uploading ? (
					<div>
						<div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-[#2563EB] animate-spin mx-auto"></div>
						<p className="text-sm text-[#475569] mt-3">Uploading... {progress}%</p>
					</div>
				) : currentUrl ? (
					<div>
						{uploadType === "profile_photo" || uploadType === "company_logo" ? (
							<img
								src={currentUrl}
								alt="Upload"
								className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
							/>
						) : (
							<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
								<span className="text-green-600 text-xl">✓</span>
							</div>
						)}
						<p className="text-sm text-[#475569]">Click to replace</p>
					</div>
				) : (
					<div>
						<div className="w-12 h-12 bg-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
							<span className="text-2xl">📁</span>
						</div>
						<p className="text-[#0F172A] font-medium">{label}</p>
						<p className="text-xs text-[#64748B] mt-1">
							{config
								? `${config.allowedFormats.join(", ").toUpperCase()} up to ${config.maxFileSizeMB}MB`
								: "Drag and drop or click to select"}
						</p>
					</div>
				)}
			</div>

			{error && (
				<p className="text-sm text-red-600 mt-2">{error}</p>
			)}
		</div>
	);
}
