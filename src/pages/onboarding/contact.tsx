/**
 * Contact Details Page (Screen 4A)
 * Collects Phone and WhatsApp. Default country +91, dummy placeholder only.
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import PhoneInput from "@/components/PhoneInput";
import { DEFAULT_COUNTRY_CODE } from "@/lib/countries";

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
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12 sm:py-16">
				<div className="w-full max-w-[500px]">
					{/* Minimal progress */}
					<div className="flex items-center justify-end gap-2 mb-8">
						<div className="flex gap-1">
							<span className="w-2 h-2 rounded-full bg-neutral-900" aria-hidden />
							<span className="w-2 h-2 rounded-full bg-neutral-200" aria-hidden />
							<span className="w-2 h-2 rounded-full bg-neutral-200" aria-hidden />
						</div>
						<span className="text-xs text-neutral-400 tabular-nums">
							{t("onboarding.contact.step")}
						</span>
					</div>

					{/* Card — flat, minimal */}
					<div className="bg-white rounded-2xl px-6 py-8 sm:px-8 sm:py-10 shadow-none border border-neutral-100">
						<h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-1.5">
							{t("onboarding.contact.title")}
						</h1>
						<p className="text-sm text-neutral-500 leading-relaxed mb-8">
							{t("onboarding.contact.subtitle")}
						</p>

						{error && (
							<div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm mb-6 border border-red-100">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-6">
							{/* Mobile */}
							<div>
								<label
									htmlFor="phone"
									className="block text-sm font-medium text-neutral-700 mb-1.5"
								>
									{t("onboarding.contact.mobileNumber")}{" "}
									<span className="text-red-500" aria-hidden>*</span>
								</label>
								<div className="flex rounded-xl border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400 transition-[border-color,box-shadow]">
									<PhoneInput
										id="phone"
										countryCode={countryCode}
										onCountryChange={setCountryCode}
										value={phoneNumber}
										onChange={setPhoneNumber}
										placeholder={t("onboarding.contact.placeholderPhone")}
										ariaLabel={t("onboarding.contact.mobileNumber")}
									/>
								</div>
								{fieldErrors.phone && (
									<p className="text-xs text-red-600 mt-1.5">{fieldErrors.phone}</p>
								)}
								<p className="text-xs text-neutral-400 mt-1.5">
									{t("onboarding.contact.formatHint")}
								</p>
							</div>

							{/* WhatsApp */}
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<label htmlFor="whatsapp" className="text-sm font-medium text-neutral-700">
										{t("onboarding.contact.whatsappNumber")}
									</label>
									<label className="flex items-center gap-2 text-xs text-neutral-500 cursor-pointer select-none">
										<input
											type="checkbox"
											checked={sameAsMobile}
											onChange={(e) => handleSameAsMobileChange(e.target.checked)}
											className="w-3.5 h-3.5 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400 focus:ring-offset-0"
										/>
										{t("onboarding.contact.sameAsMobile")}
									</label>
								</div>
								<div className="flex rounded-xl border border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400 transition-[border-color,box-shadow] [&:has(:disabled)]:opacity-60 [&:has(:disabled)]:bg-neutral-50">
									<PhoneInput
										id="whatsapp"
										countryCode={whatsappCountryCode}
										onCountryChange={(code) => {
											setWhatsappCountryCode(code);
											setSameAsMobile(false);
										}}
										value={whatsappNumber}
										onChange={(v) => {
											setWhatsappNumber(v);
											setSameAsMobile(false);
										}}
										placeholder={t("onboarding.contact.placeholderPhone")}
										disabled={sameAsMobile}
										ariaLabel={t("onboarding.contact.whatsappNumber")}
									/>
								</div>
								{fieldErrors.whatsapp && (
									<p className="text-xs text-red-600 mt-1.5">{fieldErrors.whatsapp}</p>
								)}
							</div>

							<button
								type="submit"
								disabled={isLoading || !phoneNumber.trim()}
								className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
