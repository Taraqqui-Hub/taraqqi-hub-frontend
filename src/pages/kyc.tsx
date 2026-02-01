/**
 * KYC Page
 * Submit and view KYC verification status - Professional design
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface KycRecord {
	id: string;
	documentType: string;
	status: string;
	createdAt: string;
	rejectionReason: string | null;
}

export default function KycPage() {
	const [records, setRecords] = useState<KycRecord[]>([]);
	const [overallStatus, setOverallStatus] = useState<string>("not_submitted");
	const [loading, setLoading] = useState(true);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// Form
	// Form
	const [documentType, setDocumentType] = useState("aadhaar");
	const [documentNumber, setDocumentNumber] = useState("");
	const [documentFile, setDocumentFile] = useState<File | null>(null);
	const [selfieFile, setSelfieFile] = useState<File | null>(null);

	useEffect(() => {
		loadKycStatus();
	}, []);

	const loadKycStatus = async () => {
		try {
			const response = await api.get("/kyc");
			const payload = response.data?.payload;
			setRecords(payload?.records || []);
			setOverallStatus(payload?.overallStatus || "not_submitted");
		} catch (err) {
			console.error("Failed to load KYC status", err);
		} finally {
			setLoading(false);
		}
	};

	const uploadFile = async (file: File, type: string) => {
		const { data } = await api.get(`/kyc/upload/${type}`);
		// Handle both direct response and payload-wrapped response
		const uploadParams = data.payload || data;
		
		if (!uploadParams || !uploadParams.uploadUrl) {
			console.error("Invalid upload params:", data);
			throw new Error("Failed to get upload parameters");
		}
		
		const formData = new FormData();
		formData.append("file", file);
		formData.append("api_key", uploadParams.apiKey);
		formData.append("timestamp", uploadParams.timestamp.toString());
		formData.append("signature", uploadParams.signature);
		formData.append("folder", uploadParams.folder);
		// Include ALL parameters that were signed
		formData.append("public_id", uploadParams.publicId);
		formData.append("tags", uploadParams.tags);
		if (uploadParams.allowedFormats && uploadParams.allowedFormats.length > 0) {
			formData.append("allowed_formats", uploadParams.allowedFormats.join(","));
		}

		const cloudinaryRes = await fetch(uploadParams.uploadUrl, {
			method: "POST",
			body: formData,
		});
		const result = await cloudinaryRes.json();
		
		// Check for Cloudinary errors
		if (result.error) {
			console.error(`Cloudinary upload error for ${type}:`, result.error);
			throw new Error(result.error.message || `Failed to upload ${type}`);
		}
		
		if (!result.secure_url) {
			console.error(`No secure_url in Cloudinary response for ${type}:`, result);
			throw new Error(`Failed to get upload URL for ${type}`);
		}
		
		return result;
	};

	const handleUpload = async () => {
		if (!documentNumber.trim()) {
			setError("Please enter document number");
			return;
		}
		if (!documentFile) {
			setError("Please select a document image");
			return;
		}
		if (!selfieFile) {
			setError("Please take/upload a selfie");
			return;
		}

		setUploading(true);
		setError(null);

		try {
			// Upload both files
			console.log("Starting document upload...");
			const [docRes, selfieRes] = await Promise.all([
				uploadFile(documentFile, documentType),
				uploadFile(selfieFile, "selfie"),
			]);
			console.log("Upload complete:", { docRes, selfieRes });

			// Submit KYC
			console.log("Submitting KYC...");
			await api.post("/kyc", {
				documentType,
				documentNumber: documentNumber.trim(),
				documentUrl: docRes.secure_url,
				selfieUrl: selfieRes.secure_url,
			});
			console.log("KYC submitted successfully");

			setSuccess("KYC verification submitted successfully!");
			setDocumentNumber("");
			setDocumentFile(null);
			setSelfieFile(null);
			loadKycStatus();
		} catch (err: any) {
			console.error("KYC submission error:", err);
			setError(err.response?.data?.error || err.message || "Failed to submit KYC");
		} finally {
			setUploading(false);
		}
	};

	const documentTypes = [
		{ value: "pan", label: "PAN Card (Recommended)" },
		{ value: "aadhaar", label: "Aadhaar Card" },
		{ value: "voter_id", label: "Voter ID" },
		{ value: "passport", label: "Passport" },
		{ value: "driving_license", label: "Driving License" },
	];

	return (
		<ProtectedRoute allowedUserTypes={["individual", "employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-2">Identity Verification</h1>
					<p className="text-[#475569] mb-6">
						To keep this platform safe and trusted, we verify every user. 
						Verification usually takes up to 3 working days.
					</p>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : (
						<>
							{/* Status Banner */}
							<div
								className={`p-4 rounded-md mb-6 ${
									overallStatus === "approved"
										? "bg-green-50 border border-green-200"
										: overallStatus === "pending"
										? "bg-yellow-50 border border-yellow-200"
										: "bg-[#F8FAFC] border border-[#E2E8F0]"
								}`}
							>
								<div className="flex items-center">
									<span className="text-2xl mr-3">
										{overallStatus === "approved"
											? "✓"
											: overallStatus === "pending"
											? "⏳"
											: "🛡️"}
									</span>
									<div>
										<p className="font-medium text-[#0F172A]">
											{overallStatus === "approved"
												? "Your KYC is verified"
												: overallStatus === "pending"
												? "Verification in Progress"
												: "Document Verification Required"}
										</p>
										<p className="text-sm text-[#475569]">
											{overallStatus === "approved"
												? "You have full access to all features"
												: overallStatus === "pending"
												? "Up to 3 working days"
												: "Please upload your government ID and selfie"}
										</p>
									</div>
								</div>
							</div>

							{/* Upload Form */}
							{overallStatus !== "approved" && overallStatus !== "pending" && (
								<div className="bg-white rounded-lg p-6 shadow-sm border border-[#E2E8F0]">
									<h2 className="text-lg font-semibold text-[#0F172A] mb-4">Upload Documents</h2>

									{error && (
										<div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 text-sm">
											{error}
										</div>
									)}

									<div className="mb-4">
										<label className="block text-sm font-medium text-[#0F172A] mb-1">
											Document Type
										</label>
										<select
											value={documentType}
											onChange={(e) => setDocumentType(e.target.value)}
											className="w-full px-4 py-2 border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
										>
											{documentTypes.map((type) => (
												<option key={type.value} value={type.value}>
													{type.label}
												</option>
											))}
										</select>
									</div>

									<div className="mb-4">
										<label className="block text-sm font-medium text-[#0F172A] mb-1">
											Document Number
										</label>
										<input
											type="text"
											value={documentNumber}
											onChange={(e) => setDocumentNumber(e.target.value)}
											placeholder="Enter document number"
											className="w-full px-4 py-2 border border-[#E2E8F0] rounded-md focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
										/>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
										<div>
											<label className="block text-sm font-medium text-[#0F172A] mb-1">
												Document Front
											</label>
											<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer relative">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
													className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
												/>
												{documentFile ? (
													<p className="text-sm text-green-600 truncate">{documentFile.name}</p>
												) : (
													<p className="text-sm text-gray-500">Click to upload doc</p>
												)}
											</div>
										</div>

										<div>
											<label className="block text-sm font-medium text-[#0F172A] mb-1">
												Your Selfie
											</label>
											<div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition cursor-pointer relative">
												<input
													type="file"
													accept="image/*"
													onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
													className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
												/>
												{selfieFile ? (
													<p className="text-sm text-green-600 truncate">{selfieFile.name}</p>
												) : (
													<p className="text-sm text-gray-500">Click to upload selfie</p>
												)}
											</div>
										</div>
									</div>

									<button
										onClick={handleUpload}
										disabled={uploading || !documentNumber.trim() || !documentFile || !selfieFile}
										className="w-full py-3 bg-[#2563EB] text-white font-semibold rounded-md hover:bg-[#1E40AF] disabled:opacity-50"
									>
										{uploading ? "Uploading securely..." : "Submit for Verification"}
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
