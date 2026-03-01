/**
 * Employer Profile Page
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

export default function EmployerProfilePage() {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [hasProfile, setHasProfile] = useState(false);
	const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);

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
		whatsappNumber: "",
		showCallToApplicants: true,
		showWhatsAppToApplicants: true,
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

	// Auto-hide toast after a few seconds
	useEffect(() => {
		if (!toast) return;
		const id = setTimeout(() => setToast(null), 4500);
		return () => clearTimeout(id);
	}, [toast]);

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
				whatsappNumber: p.whatsappNumber || "",
				showCallToApplicants: p.showCallToApplicants !== false,
				showWhatsAppToApplicants: p.showWhatsAppToApplicants !== false,
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
				const msg = t("companyProfile.failedToLoadProfile");
				setError(msg);
				setToast({ type: "error", message: msg });
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
		setToast(null);

		try {
			const data = {
				...formData,
				foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
				benefits: formData.benefits.split(",").map((s) => s.trim()).filter(Boolean),
				whatsappNumber: formData.whatsappNumber || undefined,
				showCallToApplicants: formData.showCallToApplicants,
				showWhatsAppToApplicants: formData.showWhatsAppToApplicants,
			};

			if (hasProfile) {
				await api.patch("/profile/employer", data);
			} else {
				await api.post("/profile/employer", data);
				setHasProfile(true);
			}

			const msg = t("companyProfile.profileSavedSuccess");
			setSuccess(msg);
			setToast({ type: "success", message: msg });
		} catch (err: any) {
			const msg = err.response?.data?.error || t("companyProfile.failedToSaveProfile");
			setError(msg);
			setToast({ type: "error", message: msg });
		} finally {
			setSaving(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const name = e.target.name;
		const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto relative">
					{/* Inline toast (top-right) so errors/success are visible even when scrolled */}
					{toast && (
						<div className="fixed right-4 top-20 z-40 max-w-xs animate-in slide-in-from-top-2 fade-in">
							<div
								className={`flex items-start gap-3 rounded-xl px-4 py-3 shadow-lg border text-sm ${
									toast.type === "error"
										? "bg-red-50 border-red-200 text-red-800"
										: "bg-emerald-50 border-emerald-200 text-emerald-800"
								}`}
							>
								<span className="mt-0.5 text-lg">!</span>
								<div className="flex-1">
									<p className="font-medium">{toast.message}</p>
								</div>
								<button
									type="button"
									onClick={() => setToast(null)}
									className="text-xs text-slate-400 hover:text-slate-600"
								>
									✕
								</button>
							</div>
						</div>
					)}
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">{t("companyProfile.title")}</h1>

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
								<h2 className="text-lg font-semibold mb-4">{t("companyProfile.companyInfo")}</h2>

								<div className="grid gap-4 md:grid-cols-2">
									<div className="md:col-span-2">
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.companyName")}
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
											{t("companyProfile.companyType")}
										</label>
										<select
											name="companyType"
											value={formData.companyType}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="">{t("companyProfile.select")}</option>
											<option value="startup">{t("companyProfile.startup")}</option>
											<option value="sme">{t("companyProfile.sme")}</option>
											<option value="enterprise">{t("companyProfile.enterprise")}</option>
											<option value="agency">{t("companyProfile.agency")}</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.industry")}
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
											{t("companyProfile.companySize")}
										</label>
										<select
											name="companySize"
											value={formData.companySize}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="">{t("companyProfile.select")}</option>
											<option value="1-10">{t("companyProfile.employees1_10")}</option>
											<option value="11-50">{t("companyProfile.employees11_50")}</option>
											<option value="51-200">{t("companyProfile.employees51_200")}</option>
											<option value="201-500">{t("companyProfile.employees201_500")}</option>
											<option value="500+">{t("companyProfile.employees500Plus")}</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.foundedYear")}
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
											{t("companyProfile.website")}
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
								<h2 className="text-lg font-semibold mb-4">{t("companyProfile.contactLocation")}</h2>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.contactPerson")}
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
											{t("companyProfile.contactEmail")}
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
											{t("companyProfile.contactPhone")}
										</label>
										<input
											type="tel"
											name="contactPhone"
											value={formData.contactPhone}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											WhatsApp number
										</label>
										<input
											type="tel"
											name="whatsappNumber"
											value={formData.whatsappNumber}
											onChange={handleChange}
											placeholder="+91..."
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.city")}
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
											{t("companyProfile.state")}
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

								{/* Applicant contact visibility */}
								<div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
									<h3 className="text-sm font-semibold text-slate-900">Applicant contact</h3>
									<label className="flex items-start gap-3 cursor-pointer">
										<input
											type="checkbox"
											name="showCallToApplicants"
											checked={formData.showCallToApplicants}
											onChange={handleChange}
											className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
										/>
										<div>
											<span className="text-sm font-medium text-slate-700">{t("companyProfile.showCallToApplicants")}</span>
											<p className="text-xs text-slate-500 mt-0.5">{t("companyProfile.showCallToApplicantsHint")}</p>
										</div>
									</label>
									<label className="flex items-start gap-3 cursor-pointer">
										<input
											type="checkbox"
											name="showWhatsAppToApplicants"
											checked={formData.showWhatsAppToApplicants}
											onChange={handleChange}
											className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
										/>
										<div>
											<span className="text-sm font-medium text-slate-700">{t("companyProfile.showWhatsAppToApplicants")}</span>
											<p className="text-xs text-slate-500 mt-0.5">{t("companyProfile.showWhatsAppToApplicantsHint")}</p>
										</div>
									</label>
								</div>
							</div>

							{/* About */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">{t("companyProfile.about")}</h2>

								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.companyDescription")}
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
											{t("companyProfile.benefitsCommaSeparated")}
										</label>
										<input
											type="text"
											name="benefits"
											value={formData.benefits}
											onChange={handleChange}
											placeholder={t("companyProfile.benefitsPlaceholder")}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>

							{/* Business Verification */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">{t("companyProfile.businessDetails")}</h2>
								<p className="text-sm text-slate-500 mb-4">
									{t("companyProfile.businessDetailsHint")}
								</p>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											{t("companyProfile.gstin")}
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
											{t("companyProfile.pan")}
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
									{saving ? t("companyProfile.saving") : t("companyProfile.saveProfile")}
								</button>
								<Link
									href="/kyc"
									className="px-6 py-3 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold rounded-lg hover:border-[#2563EB] hover:text-[#2563EB] flex items-center justify-center transition"
								>
									{t("companyProfile.proceedToKyc")}
								</Link>
							</div>
						</form>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
