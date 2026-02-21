/**
 * Forgot Password Page
 * Request password reset code via email - matches login/verify-email design
 */

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { authApi } from "@/lib/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ForgotPasswordPage() {
	const { t } = useTranslation();
	const [email, setEmail] = useState("");
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState<string>("");

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setStatus("loading");
		setMessage("");

		try {
			const res = await authApi.forgotPassword(email);
			const msg = (res as { payload?: { message?: string }; message?: string }).payload?.message
				?? (res as { message?: string }).message
				?? "If this email exists, password reset instructions have been sent.";
			setMessage(msg);
			setStatus("success");
		} catch (err: any) {
			const errorMsg =
				err.response?.data?.payload?.error
				?? err.response?.data?.error
				?? err.message
				?? "Something went wrong. Please try again.";
			setMessage(errorMsg);
			setStatus("error");
		}
	};

	// Success state: show generic message (don't reveal if email exists)
	if (status === "success") {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
				<div className="w-full max-w-md">
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Taraqqi Hub</h1>
						<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
					</div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-4">{t("forgotPassword.checkYourEmail")}</h2>
						<p className="text-[#475569] mb-6">{message}</p>
						<p className="text-sm text-[#64748B] mb-6">{t("forgotPassword.resetLinkSent")}</p>
						<Link
							href="/login"
							className="inline-block w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition text-center"
						>
							{t("forgotPassword.backToSignIn")}
						</Link>
						<p className="mt-6 text-[#475569] text-sm">
							{t("register.didntReceiveEmail")}{" "}
							<button
								type="button"
								onClick={() => { setStatus("idle"); setMessage(""); }}
								className="text-[#2563EB] hover:text-[#1E40AF] font-medium"
							>
								{t("forgotPassword.tryAgain")}
							</button>
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
			<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
			<div className="w-full max-w-md">
				<div className="text-center mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Taraqqi Hub</h1>
					<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
				</div>

				<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
					<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-2">{t("forgotPassword.forgotPasswordTitle")}</h2>
					<p className="text-[#475569] text-sm mb-6">{t("forgotPassword.enterEmailReset")}</p>

					{status === "error" && message && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
							{message}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-6">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								{t("auth.emailAddress")}
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={t("auth.placeholders.email")}
								className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base"
								required
							/>
						</div>

						<button
							type="submit"
							disabled={status === "loading" || !email}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
						>
							{status === "loading" ? (
								<span className="flex items-center justify-center">
									<svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
									{t("register.sending")}
								</span>
							) : (
								t("forgotPassword.sendResetLink")
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<Link
							href="/login"
							className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium"
						>
							{t("forgotPassword.backToSignIn")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
