/**
 * Employer Company Profile (post-payment)
 * Company details before KYC
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { Search, Building, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

// Complete list of Indian States and Union Territories
const INDIAN_STATES = [
	"Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
	"Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
	"Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
	"Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
	"Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
	"Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

interface PincodeLookupState {
	loading: boolean;
	error: string | null;
	success: boolean;
	places: string[];
}

export default function EmployerRegisterCompanyPage() {
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	
	const lastLookedUpPincode = useRef<string | null>(null);
	const [lookupState, setLookupState] = useState<PincodeLookupState>({
		loading: false,
		error: null,
		success: false,
		places: [],
	});

	const [formData, setFormData] = useState({
		companyName: "",
		brandName: "",
		industry: "",
		companySize: "",
		city: "",
		state: "",
		website: "",
		contactPersonName: "",
		contactEmail: "",
		contactPhone: "",
		recruiterPhone: "",
		whatsappNumber: "",
		address: "",
		pincode: "",
		description: "",
		// district seems not in backend schema to be saved, but we can track it in state or use it to populate city
		district: "",
	});

	const { checkAuth } = useAuthStore();

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get("/profile/employer").catch(() => null);
				const profile = res?.data?.payload?.profile ?? res?.data?.profile;
				if (profile) {
					setFormData(prev => ({
						...prev,
						companyName: profile.companyName || "",
						brandName: profile.brandName || "",
						industry: profile.industry || "",
						companySize: profile.companySize || "",
						city: profile.city || "",
						state: profile.state || "",
						website: profile.website || "",
						contactPersonName: profile.contactPersonName || "",
						contactEmail: profile.contactEmail || "",
						contactPhone: profile.contactPhone || "",
						recruiterPhone: profile.recruiterPhone || "",
						whatsappNumber: profile.whatsappNumber || "",
						address: profile.address || "",
						pincode: profile.pincode || "",
						description: profile.description || "",
					}));
				}
			} catch (_) {
				// No profile yet
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	// Pincode Lookup Logic
	const lookupPincode = useCallback(async (pincode: string) => {
		if (pincode.length !== 6) {
			setLookupState({ loading: false, error: null, success: false, places: [] });
			return;
		}

		if (lastLookedUpPincode.current === pincode) {
			return;
		}

		setLookupState({ loading: true, error: null, success: false, places: [] });

		try {
			const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
			const result = await response.json();

			if (result[0]?.Status === "Success" && result[0]?.PostOffice?.length > 0) {
				const postOffice = result[0].PostOffice[0];
				const places = result[0].PostOffice.map((po: any) => po.Name);
				
				lastLookedUpPincode.current = pincode;

				let city = postOffice.Name;
				if (!city || city === "NA") city = postOffice.Division;
				if (!city || city === "NA") city = postOffice.District;

				setFormData(prev => ({
					...prev,
					pincode,
					city: city || "",
					state: postOffice.State || "",
					district: postOffice.District || "",
				}));

				setLookupState({
					loading: false,
					error: null,
					success: true,
					places,
				});
			} else {
				setLookupState({
					loading: false,
					error: "Invalid pincode. Please check and try again.",
					success: false,
					places: [],
				});
			}
		} catch (error) {
			setLookupState({
				loading: false,
				error: "Could not verify pincode. Please enter address manually.",
				success: false,
				places: [],
			});
		}
	}, []);

	useEffect(() => {
		const pincode = formData.pincode || "";
		if (pincode.length === 6 && pincode !== lastLookedUpPincode.current) {
			const timer = setTimeout(() => {
				lookupPincode(pincode);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [formData.pincode, lookupPincode]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		// Reset tracking ref if user manually changes pincode
		if (value !== lastLookedUpPincode.current) {
			lastLookedUpPincode.current = null;
		}
		
		setFormData(prev => ({ ...prev, pincode: value }));
		
		if (value.length < 6) {
			setLookupState({ loading: false, error: null, success: false, places: [] });
		}
	};

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
								<input
									type="text"
									name="industry"
									value={formData.industry}
									onChange={handleChange}
									required
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								/>
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
							
							{/* Pincode with Auto-lookup */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									PIN Code *
								</label>
								<div className="relative">
									<Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<input
										type="text"
										value={formData.pincode}
										onChange={handlePincodeChange}
										placeholder="Enter 6 digit PIN code"
										maxLength={6}
										className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-all text-sm ${
											lookupState.error 
												? "border-red-300 focus:border-red-500 focus:ring-red-100" 
												: lookupState.success 
													? "border-green-300 focus:border-green-500 focus:ring-green-100"
													: "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
										} focus:ring-2`}
									/>
									<div className="absolute right-3 top-1/2 -translate-y-1/2">
										{lookupState.loading && (
											<Loader2 size={18} className="text-blue-500 animate-spin" />
										)}
										{lookupState.success && (
											<CheckCircle size={18} className="text-green-500" />
										)}
										{lookupState.error && (
											<AlertCircle size={18} className="text-red-500" />
										)}
									</div>
								</div>
								{lookupState.success && lookupState.places.length > 0 && (
									<p className="mt-1.5 text-xs text-green-600">
										Found: {lookupState.places.slice(0, 3).join(", ")}
										{lookupState.places.length > 3 && ` +${lookupState.places.length - 3} more`}
									</p>
								)}
								{lookupState.error && (
									<p className="mt-1.5 text-xs text-red-600">
										{lookupState.error}
									</p>
								)}
							</div>

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
											className="w-full pl-10 pr-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB] appearance-none"
										>
											<option value="">Select State</option>
											{INDIAN_STATES.map(s => (
												<option key={s} value={s}>{s}</option>
											))}
										</select>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-[#0F172A] mb-1">
									Full Address
								</label>
								<textarea
									name="address"
									value={formData.address}
									onChange={handleChange}
									rows={2}
									placeholder="House/Flat No, Street, Area..."
									className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
								/>
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
								Recruiter / contact phone *
							</label>
							<input
								type="tel"
								name="recruiterPhone"
								value={formData.recruiterPhone}
								onChange={handleChange}
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>
						<div>
							<label className="flex items-center gap-2 text-sm text-[#475569]">
								<input
									type="checkbox"
									checked={!!formData.whatsappNumber}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											whatsappNumber: e.target.checked
												? prev.recruiterPhone
												: "",
										}))
									}
								/>
								Use same number for WhatsApp
							</label>
							{formData.whatsappNumber && (
								<input
									type="tel"
									name="whatsappNumber"
									value={formData.whatsappNumber}
									onChange={handleChange}
									className="mt-2 w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									placeholder="WhatsApp number"
								/>
							)}
						</div>
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
								className="w-full px-4 py-2 border border-[#E2E8F0] rounded-lg focus:ring-2 focus:ring-[#2563EB]"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-[#0F172A] mb-1">
								Contact Email (optional)
							</label>
							<input
								type="email"
								name="contactEmail"
								value={formData.contactEmail}
								onChange={handleChange}
								placeholder="contact@company.com"
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
								type="submit"
								disabled={saving}
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
