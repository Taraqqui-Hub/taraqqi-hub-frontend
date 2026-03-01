/**
 * Reset Password Page
 * Set new password using code from email link - matches login/verify-email design
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { authApi } from "@/lib/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function ResetPasswordPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { code } = router.query;

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [codeValid, setCodeValid] = useState<boolean | null>(null);
	const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [message, setMessage] = useState<string>("");

	// Validate code when code is in URL
	useEffect(() => {
		if (!code || typeof code !== "string") {
			setCodeValid(false);
			return;
		}
		let cancelled = false;
		authApi
			.validateResetCode(code)
			.then((res: { valid?: boolean }) => {
				if (!cancelled) setCodeValid(res.valid === true);
			})
			.catch(() => {
				if (!cancelled) setCodeValid(false);
			});
		return () => {
			cancelled = true;
		};
	}, [code]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (!code || typeof code !== "string") {
			setMessage("Invalid or missing reset code.");
			setStatus("error");
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage("Passwords do not match.");
			setStatus("error");
			return;
		}
		setStatus("loading");
		setMessage("");

		try {
			const res = await authApi.resetPassword(code, newPassword);
			const msg = (res as { payload?: { message?: string }; message?: string }).payload?.message
				?? (res as { message?: string }).message
				?? "Password has been reset successfully. You can now sign in.";
			setMessage(msg);
			setStatus("success");
		} catch (err: any) {
			const errorMsg =
				err.response?.data?.payload?.error
				?? err.response?.data?.payload?.message
				?? err.response?.data?.error
				?? err.message
				?? "Failed to reset password. The link may have expired.";
			setMessage(errorMsg);
			setStatus("error");
		}
	};

	// No code or invalid code
	if (code !== undefined && code !== "" && codeValid === false) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
				<div className="w-full max-w-md">
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Equalio</h1>
						<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
					</div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
							</svg>
						</div>
						<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-4">{t("resetPassword.invalidOrExpiredLink")}</h2>
						<p className="text-[#475569] mb-6">{t("resetPassword.invalidLinkMessage")}</p>
						<Link
							href="/forgot-password"
							className="inline-block w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition text-center"
						>
							{t("resetPassword.requestNewResetLink")}
						</Link>
						<p className="mt-6">
							<Link href="/login" className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium">
								{t("forgotPassword.backToSignIn")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Success
	if (status === "success") {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
				<div className="w-full max-w-md">
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Equalio</h1>
						<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
					</div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-4">{t("resetPassword.passwordReset")}</h2>
						<p className="text-[#475569] mb-6">{message}</p>
						<Link
							href="/login"
							className="inline-block w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition text-center"
						>
							{t("auth.signIn")}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Loading code validation (code present but not yet validated)
	if (code && codeValid === null) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md text-center">
					<div className="animate-spin h-12 w-12 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-6"></div>
					<p className="text-[#0F172A]">{t("resetPassword.checkingResetLink")}</p>
				</div>
			</div>
		);
	}

	// No code in URL
	if (!code || (Array.isArray(code) && code.length === 0)) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
				<div className="w-full max-w-md">
					<div className="text-center mb-6 sm:mb-8">
						<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Equalio</h1>
						<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
					</div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0] text-center">
						<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-4">{t("resetPassword.resetLinkRequired")}</h2>
						<p className="text-[#475569] mb-6">
							{t("resetPassword.useLinkFromEmail")}
						</p>
						<Link
							href="/forgot-password"
							className="inline-block w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition text-center"
						>
							{t("resetPassword.requestResetLink")}
						</Link>
						<p className="mt-6">
							<Link href="/login" className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium">
								{t("forgotPassword.backToSignIn")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Form: valid code, set new password
	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
			<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
			<div className="w-full max-w-md">
				<div className="text-center mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Equalio</h1>
					<p className="text-sm sm:text-base text-[#475569]">{t("auth.tagline")}</p>
				</div>

				<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
					<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-6">{t("resetPassword.setNewPassword")}</h2>

					{status === "error" && message && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
							{message}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label
								htmlFor="newPassword"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								{t("resetPassword.newPassword")}
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="newPassword"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									placeholder={t("auth.placeholders.password")}
									className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent pr-12 text-base"
									required
									minLength={8}
									maxLength={16}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-1"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
							<p className="mt-1 text-xs text-[#64748B]">{t("resetPassword.passwordRequirements")}</p>
						</div>

						<div className="mb-6">
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								{t("resetPassword.confirmNewPassword")}
							</label>
							<input
								type={showPassword ? "text" : "password"}
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder={t("auth.placeholders.password")}
								className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent text-base"
								required
								minLength={8}
								maxLength={16}
							/>
						</div>

						<button
							type="submit"
							disabled={status === "loading" || !newPassword || !confirmPassword}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
						>
							{status === "loading" ? (
								<span className="flex items-center justify-center">
									<svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
									{t("resetPassword.resettingPassword")}
								</span>
							) : (
								t("resetPassword.resetPasswordBtn")
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<Link href="/login" className="text-sm text-[#2563EB] hover:text-[#1E40AF] font-medium">
							{t("forgotPassword.backToSignIn")}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
