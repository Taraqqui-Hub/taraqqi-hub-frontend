/**
 * Employer Company Profile (post-payment)
 * Company details before KYC
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Building, MapPin } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { INDIAN_STATES_DISTRICTS } from "@/data/indianStatesDistricts";

// Broad list of common industry types for employers
const INDUSTRY_OPTIONS = [
	"Information Technology (IT) & Software",
	"Business Process Outsourcing (BPO) / KPO",
	"Banking, Financial Services & Insurance (BFSI)",
	"E-commerce & Internet",
	"Telecommunications",
	"Manufacturing",
	"Automobile & Auto Components",
	"Construction & Real Estate",
	"Infrastructure & Engineering",
	"Retail & Wholesale",
	"FMCG (Fast-Moving Consumer Goods)",
	"Food & Beverages",
	"Healthcare & Hospitals",
	"Pharmaceuticals & Biotechnology",
	"Education & Training",
	"Media, Entertainment & Publishing",
	"Advertising, PR & Marketing",
	"Consulting & Professional Services",
	"Legal Services",
	"Travel, Hospitality & Tourism",
	"Transport, Logistics & Warehousing",
	"Energy, Oil & Gas",
	"Power & Utilities",
	"Mining & Metals",
	"Electronics & Hardware",
	"Agriculture & Agro-based",
	"Textiles & Apparel",
	"Non-profit / NGO / Social Sector",
	"Government / Public Sector",
	"Startups & Early-stage Ventures",
	"Other / Not Listed",
];

export default function EmployerRegisterCompanyPage() {
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const [formData, setFormData] = useState({
		companyName: "",
		brandName: "",
		industry: "",
		companySize: "",
		website: "",
		description: "",
		addressLine1: "",
		addressLine2: "",
		city: "",
		district: "",
		state: "",
		country: "India",
		pincode: "",
		contactPersonName: "",
		contactEmail: "",
		contactPhone: "",
		recruiterPhone: "",
		whatsappNumber: "",
	});

	const { checkAuth, user } = useAuthStore();

	// Normalize saved state to match INDIAN_STATES_DISTRICTS so district lookup works
	const normalizeState = (stateName: string) => {
		if (!stateName) return "";
		const match = INDIAN_STATES_DISTRICTS.find(
			(s) =>
				s.state === stateName ||
				s.state.replace(/\s*\([^)]*\)\s*$/, "").trim() === stateName
		);
		return match ? match.state : stateName;
	};

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get("/profile/employer").catch(() => null);
				const profile = res?.data?.payload?.profile ?? res?.data?.profile;
				if (profile) {
					const savedState = profile.state || "";
					setFormData(prev => ({
						...prev,
						companyName: profile.companyName || "",
						brandName: profile.brandName || "",
						industry: profile.industry || "",
						companySize: profile.companySize || "",
						website: profile.website || "",
						description: profile.description || "",
						addressLine1: profile.addressLine1 || profile.address || "", // Fallback
						addressLine2: profile.addressLine2 || "",
						city: profile.city || "",
						state: normalizeState(savedState),
						district: profile.district || "",
						country: profile.country || "India",
						pincode: profile.pincode || "",
						contactPersonName: profile.contactPersonName || prev.contactPersonName || "",
						contactEmail: profile.contactEmail || prev.contactEmail || user?.email || "",
						contactPhone: profile.contactPhone || prev.contactPhone || user?.phone || "",
						recruiterPhone: profile.recruiterPhone || prev.recruiterPhone || "",
						whatsappNumber: profile.whatsappNumber || prev.whatsappNumber || user?.whatsappNumber || "",
					}));
				}
			} catch (_) {
				// No profile yet
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const next = { ...prev, [name]: value };
			if (name === "state") next.district = "";
			return next;
		});
	};

	const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		setFormData(prev => ({ ...prev, pincode: value }));
	};

	const districtOptions = useMemo(() => {
		const stateData = INDIAN_STATES_DISTRICTS.find((s) => s.state === formData.state);
		return stateData?.districts ?? [];
	}, [formData.state]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		try {
			await api.post("/registration/employer/company", formData);
			// Refresh auth state to update profileComplete status
			await checkAuth();
			router.push("/kyc");
		} catch (err: any) {
			setError(
				err.response?.data?.error || "Failed to save. Please try again."
			);
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<ProtectedRoute allowedUserTypes={["employer"]}>
				<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
				</div>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
				<div className="max-w-2xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-2">
						Company details
					</h1>
					<p className="text-[#475569] text-sm mb-6">
						Complete your company profile before business verification.
					</p>

					<form
						onSubmit={handleSubmit}
						className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 space-y-4"
					>
						{error && (
							<div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
								{error}
							</div>
						)}

						<div>
							<label className="block text-sm font-medium text-[#0F172A] mb-1">
								Company legal name *
							</label>
							<input
								type="text"
								name="companyName"
								value={formData.companyName}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-[#0F172A] mb-1">
								Brand name
							</label>
							<input
								type="text"
								name="brandName"
								value={formData.brandName}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Industry *
								</label>
								<select
									name="industry"
									value={formData.industry}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB] bg-white"
								>
									<option value="">Select industry</option>
									{INDUSTRY_OPTIONS.map((ind) => (
										<option key={ind} value={ind}>
											{ind}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Company size
								</label>
								<select
									name="companySize"
									value={formData.companySize}
									onChange={handleChange}
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								>
									<option value="">Select</option>
									<option value="1-10">1-10</option>
									<option value="11-50">11-50</option>
									<option value="51-200">51-200</option>
									<option value="201-500">201-500</option>
									<option value="500+">500+</option>
								</select>
							</div>
						</div>
						{/* Address Section */}
						<div className="space-y-4 pt-2 border-t border-gray-100">
							<h3 className="text-sm font-medium text-gray-900">Address Details</h3>

							{/* Address Line 1 */}
							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Address Line 1 *
								</label>
								<input
									type="text"
									name="addressLine1"
									value={formData.addressLine1}
									onChange={handleChange}
									required
									placeholder="House/Flat No, Street, Area..."
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								/>
							</div>

							{/* Address Line 2 */}
							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Address Line 2 (optional)
								</label>
								<input
									type="text"
									name="addressLine2"
									value={formData.addressLine2}
									onChange={handleChange}
									placeholder="Landmark..."
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								/>
							</div>

							{/* City & State */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										City *
									</label>
									<div className="relative">
										<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
										<input
											type="text"
											name="city"
											value={formData.city}
											onChange={handleChange}
											required
											placeholder="City / Town"
											className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										State *
									</label>
									<div className="relative">
										<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
										<select
											name="state"
											value={formData.state}
											onChange={handleChange}
											required
											className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB] appearance-none bg-white"
										>
											<option value="">Select State</option>
											{INDIAN_STATES_DISTRICTS.map((s) => (
												<option key={s.state} value={s.state}>
													{s.state}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>

							{/* District & Country */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										District *
									</label>
									<select
										name="district"
										value={formData.district}
										onChange={handleChange}
										required
										disabled={!formData.state}
										className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB] bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
									>
										<option value="">
											{formData.state ? "Select District" : "Select State first"}
										</option>
										{districtOptions.map((d) => (
											<option key={d} value={d}>
												{d}
											</option>
										))}
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Country *
									</label>
									<input
										type="text"
										name="country"
										value={formData.country}
										onChange={handleChange}
										disabled
										className="w-full px-4 py-2 bg-gray-50 border border-[#E2E8F0] rounded-lg text-[#94A3B8] cursor-not-allowed"
									/>
								</div>
							</div>

							{/* PIN Code */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									PIN Code *
								</label>
								<div className="relative">
									<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										value={formData.pincode}
										onChange={handlePincodeChange}
										placeholder="Enter 6 digit PIN code"
										maxLength={6}
										className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 text-sm"
									/>
								</div>
							</div>
						</div>

						{/* Contact Person Section */}
						<div className="space-y-4 pt-2 border-t border-gray-100">
							<h3 className="text-sm font-medium text-gray-900">Contact person details</h3>
							<p className="text-xs text-gray-500">
								These details will be used by Taraqqi Hub for communication and can be shown on job listings based on your preferences later.
							</p>

							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Contact person name *
								</label>
								<input
									type="text"
									name="contactPersonName"
									value={formData.contactPersonName}
									onChange={handleChange}
									required
									placeholder="Full name of primary contact"
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								/>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Contact email
									</label>
									<input
										type="email"
										name="contactEmail"
										value={formData.contactEmail}
										onChange={handleChange}
										placeholder="name@company.com"
										className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Contact phone
									</label>
									<input
										type="tel"
										name="contactPhone"
										value={formData.contactPhone}
										onChange={handleChange}
										placeholder="10-digit mobile number"
										className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										Recruiter phone (optional)
									</label>
									<input
										type="tel"
										name="recruiterPhone"
										value={formData.recruiterPhone}
										onChange={handleChange}
										placeholder="Alternate number for candidates"
										className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-[#0F172A] mb-1">
										WhatsApp number (optional)
									</label>
									<input
										type="tel"
										name="whatsappNumber"
										value={formData.whatsappNumber}
										onChange={handleChange}
										placeholder="Number where you use WhatsApp"
										className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
							</div>
						</div>

						<div className="pt-2 border-t border-gray-100">
							<label className="block text-sm font-medium text-[#0F172A] mb-1">
								Website (optional)
							</label>
							<input
								type="url"
								name="website"
								value={formData.website}
								onChange={handleChange}
								placeholder="https://"
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-[#0F172A] mb-1">
								Company description (optional)
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleChange}
								rows={3}
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>

						<div className="flex gap-3 pt-4">
							<button
								type="button"
								onClick={() => router.back()}
								className="flex-1 py-3 border border-[#E2E8F0] text-[#0F172A] font-medium rounded-lg hover:bg-[#F8FAFC]"
							>
								Back
							</button>
							<button
								disabled={saving || !formData.companyName || !formData.industry || !formData.addressLine1 || !formData.city || !formData.state || !formData.district || !formData.pincode || !formData.contactPersonName}
								className="flex-1 py-3 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1E40AF] disabled:opacity-50"
							>
								{saving ? "Saving…" : "Save & continue to verification"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</ProtectedRoute>
	);
}
