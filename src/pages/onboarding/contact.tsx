/**
 * Contact Details Page (Screen 4A)
 * Collects Phone and WhatsApp. Default country +91, dummy placeholder only.
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const DEFAULT_COUNTRY_CODE = "+91";
const COUNTRY_CODES = [
	{ code: "+91", label: "India (+91)" },
	{ code: "+1", label: "US/Canada (+1)" },
	{ code: "+44", label: "UK (+44)" },
	{ code: "+92", label: "Pakistan (+92)" },
	{ code: "+971", label: "UAE (+971)" },
	{ code: "+966", label: "Saudi (+966)" },
	{ code: "+61", label: "Australia (+61)" },
	{ code: "+81", label: "Japan (+81)" },
	{ code: "+86", label: "China (+86)" },
	{ code: "+33", label: "France (+33)" },
	{ code: "+49", label: "Germany (+49)" },
	{ code: "+65", label: "Singapore (+65)" },
];

export default function ContactDetailsPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { user, updateProfile, isLoading, error } = useAuthStore();

	const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [whatsappCountryCode, setWhatsappCountryCode] = useState(DEFAULT_COUNTRY_CODE);
	const [whatsappNumber, setWhatsappNumber] = useState("");
	const [sameAsMobile, setSameAsMobile] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<{ phone?: string; whatsapp?: string }>({});

	// Do NOT prefill or show user's real number — placeholder only (dummy number in locale)

	const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
	const fullWhatsapp = sameAsMobile
		? fullPhone
		: `${whatsappCountryCode}${whatsappNumber.replace(/\D/g, "")}`;

	const phoneRegex = /^\+[1-9]\d{10,14}$/;

	const validatePhone = (val: string, field: "phone" | "whatsapp") => {
		if (field === "phone" && !val) return t("onboarding.contact.phoneRequired");
		if (val && !phoneRegex.test(val)) return t("onboarding.contact.formatInvalid");
		return undefined;
	};

	const handleSameAsMobileChange = (checked: boolean) => {
		setSameAsMobile(checked);
		if (checked) {
			setWhatsappCountryCode(countryCode);
			setWhatsappNumber(phoneNumber);
		}
	};

	useEffect(() => {
		if (sameAsMobile) {
			setWhatsappCountryCode(countryCode);
			setWhatsappNumber(phoneNumber);
		}
	}, [phoneNumber, countryCode, sameAsMobile]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const phoneErr = validatePhone(fullPhone, "phone");
		const waErr = validatePhone(fullWhatsapp, "whatsapp");

		if (phoneErr || waErr) {
			setFieldErrors({ phone: phoneErr, whatsapp: waErr });
			return;
		}

		try {
			await updateProfile({
				phone: fullPhone,
				...(fullWhatsapp && { whatsappNumber: fullWhatsapp }),
			});
			router.push("/onboarding/intent");
		} catch {
			// Error shown from store
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["individual", "employer"]}>
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md">
					<div className="mb-6">
						<div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
							<div className="h-full bg-blue-600 w-1/3" />
						</div>
						<p className="text-xs text-gray-500 mt-2 text-right">
							{t("onboarding.contact.step")}
						</p>
					</div>

					<div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
						<h2 className="text-xl font-bold text-[#0F172A] mb-2">
							{t("onboarding.contact.title")}
						</h2>
						<p className="text-[#475569] text-sm mb-6">
							{t("onboarding.contact.subtitle")}
						</p>

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<label
									htmlFor="phone"
									className="block text-sm font-medium text-[#0F172A] mb-2"
								>
									{t("onboarding.contact.mobileNumber")} <span className="text-red-500">*</span>
								</label>
								<div className="flex rounded-md border border-[#E2E8F0] overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-transparent">
									<select
										value={countryCode}
										onChange={(e) => setCountryCode(e.target.value)}
										className="px-3 py-3 bg-[#F8FAFC] border-r border-[#E2E8F0] text-[#0F172A] text-sm font-medium focus:outline-none min-w-[110px]"
										aria-label="Country code"
									>
										{COUNTRY_CODES.map(({ code, label }) => (
											<option key={code} value={code}>
												{label}
											</option>
										))}
									</select>
									<input
										type="tel"
										id="phone"
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 15))}
										placeholder={t("onboarding.contact.placeholderPhone")}
										className="flex-1 px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none min-w-0"
										autoComplete="tel-national"
									/>
								</div>
								{fieldErrors.phone && (
									<p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>
								)}
								<p className="text-xs text-[#64748B] mt-1">{t("onboarding.contact.formatHint")}</p>
							</div>

							<div className="mb-6">
								<div className="flex items-center justify-between mb-2">
									<label htmlFor="whatsapp" className="block text-sm font-medium text-[#0F172A]">
										{t("onboarding.contact.whatsappNumber")}
									</label>
									<label className="flex items-center text-xs text-[#64748B] cursor-pointer">
										<input
											type="checkbox"
											checked={sameAsMobile}
											onChange={(e) => handleSameAsMobileChange(e.target.checked)}
											className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										{t("onboarding.contact.sameAsMobile")}
									</label>
								</div>
								<div className="flex rounded-md border border-[#E2E8F0] overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-transparent">
									<select
										value={whatsappCountryCode}
										onChange={(e) => {
											setWhatsappCountryCode(e.target.value);
											setSameAsMobile(false);
										}}
										disabled={sameAsMobile}
										className="px-3 py-3 bg-[#F8FAFC] border-r border-[#E2E8F0] text-[#0F172A] text-sm font-medium focus:outline-none min-w-[110px] disabled:opacity-70"
										aria-label="WhatsApp country code"
									>
										{COUNTRY_CODES.map(({ code, label }) => (
											<option key={code} value={code}>
												{label}
											</option>
										))}
									</select>
									<input
										type="tel"
										id="whatsapp"
										value={whatsappNumber}
										onChange={(e) => {
											setWhatsappNumber(e.target.value.replace(/\D/g, "").slice(0, 15));
											setSameAsMobile(false);
										}}
										placeholder={t("onboarding.contact.placeholderPhone")}
										disabled={sameAsMobile}
										className="flex-1 px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] focus:outline-none min-w-0 disabled:opacity-70"
										autoComplete="tel-national"
									/>
								</div>
								{fieldErrors.whatsapp && (
									<p className="text-xs text-red-600 mt-1">{fieldErrors.whatsapp}</p>
								)}
							</div>

							<button
								type="submit"
								disabled={isLoading || !phoneNumber.trim()}
								className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
							>
								{isLoading ? t("onboarding.contact.saving") : t("onboarding.contact.continue")}
							</button>
						</form>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
