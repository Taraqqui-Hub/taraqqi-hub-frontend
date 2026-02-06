/**
 * Employer Profile Page
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

export default function EmployerProfilePage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [hasProfile, setHasProfile] = useState(false);

	const [formData, setFormData] = useState({
		companyName: "",
		companyType: "",
		industry: "",
		companySize: "",
		foundedYear: "",
		website: "",
		contactPersonName: "",
		contactEmail: "",
		contactPhone: "",
		address: "",
		city: "",
		state: "",
		pincode: "",
		description: "",
		culture: "",
		benefits: "",
		gstin: "",
		pan: "",
	});

	useEffect(() => {
		loadProfile();
	}, []);

	const loadProfile = async () => {
		try {
			const response = await api.get("/profile/employer");
			const p = response.data?.payload?.profile || response.data?.profile;
			setHasProfile(true);
			setFormData({
				companyName: p.companyName || "",
				companyType: p.companyType || "",
				industry: p.industry || "",
				companySize: p.companySize || "",
				foundedYear: p.foundedYear?.toString() || "",
				website: p.website || "",
				contactPersonName: p.contactPersonName || "",
				contactEmail: p.contactEmail || "",
				contactPhone: p.contactPhone || "",
				address: p.address || "",
				city: p.city || "",
				state: p.state || "",
				pincode: p.pincode || "",
				description: p.description || "",
				culture: p.culture || "",
				benefits: p.benefits?.join(", ") || "",
				gstin: p.gstin || "",
				pan: p.pan || "",
			});
		} catch (err: any) {
			if (err.response?.status !== 404) {
				setError("Failed to load profile");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setSuccess(null);

		try {
			const data = {
				...formData,
				foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
				benefits: formData.benefits.split(",").map((s) => s.trim()).filter(Boolean),
			};

			if (hasProfile) {
				await api.patch("/profile/employer", data);
			} else {
				await api.post("/profile/employer", data);
				setHasProfile(true);
			}

			setSuccess("Profile saved successfully!");
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to save profile");
		} finally {
			setSaving(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Company Profile</h1>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : (
						<form onSubmit={handleSubmit} className="space-y-6">
							{error && (
								<div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
							)}
							{success && (
								<div className="bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>
							)}

							{/* Company Info */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">Company Information</h2>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Company Name *
										</label>
										<input
											type="text"
											name="companyName"
											value={formData.companyName}
											onChange={handleChange}
											required
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Company Type
										</label>
										<select
											name="companyType"
											value={formData.companyType}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="">Select</option>
											<option value="startup">Startup</option>
											<option value="sme">SME</option>
											<option value="enterprise">Enterprise</option>
											<option value="agency">Agency</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Industry
										</label>
										<input
											type="text"
											name="industry"
											value={formData.industry}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Company Size
										</label>
										<select
											name="companySize"
											value={formData.companySize}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="">Select</option>
											<option value="1-10">1-10 employees</option>
											<option value="11-50">11-50 employees</option>
											<option value="51-200">51-200 employees</option>
											<option value="201-500">201-500 employees</option>
											<option value="500+">500+ employees</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Founded Year
										</label>
										<input
											type="number"
											name="foundedYear"
											value={formData.foundedYear}
											onChange={handleChange}
											min="1800"
											max={new Date().getFullYear()}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Website
										</label>
										<input
											type="url"
											name="website"
											value={formData.website}
											onChange={handleChange}
											placeholder="https://"
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>

							{/* Contact & Location */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">Contact & Location</h2>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Contact Person
										</label>
										<input
											type="text"
											name="contactPersonName"
											value={formData.contactPersonName}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Contact Email
										</label>
										<input
											type="email"
											name="contactEmail"
											value={formData.contactEmail}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											City
										</label>
										<input
											type="text"
											name="city"
											value={formData.city}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											State
										</label>
										<input
											type="text"
											name="state"
											value={formData.state}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>

							{/* About */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">About</h2>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Company Description
										</label>
										<textarea
											name="description"
											value={formData.description}
											onChange={handleChange}
											rows={4}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Benefits (comma separated)
										</label>
										<input
											type="text"
											name="benefits"
											value={formData.benefits}
											onChange={handleChange}
											placeholder="Health insurance, Flexible hours, WFH"
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>

							{/* Business Verification */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">Business Details</h2>
								<p className="text-sm text-slate-500 mb-4">
									For verification purposes only. Will not be displayed publicly.
								</p>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											GSTIN
										</label>
										<input
											type="text"
											name="gstin"
											value={formData.gstin}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											PAN
										</label>
										<input
											type="text"
											name="pan"
											value={formData.pan}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>

							<div className="flex flex-col sm:flex-row gap-4 pt-4">
								<button
									type="submit"
									disabled={saving}
									className="flex-1 py-3 bg-[#2563EB] text-white font-semibold rounded-lg hover:bg-[#1E40AF] disabled:opacity-50"
								>
									{saving ? "Saving..." : "Save Profile"}
								</button>
								<Link
									href="/kyc"
									className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-lg hover:border-[#2563EB] hover:text-[#2563EB] flex items-center justify-center transition"
								>
									Proceed to KYC →
								</Link>
							</div>
						</form>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
