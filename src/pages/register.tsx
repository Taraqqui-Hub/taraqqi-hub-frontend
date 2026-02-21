/**
 * Register Page
 * Simplified registration flow defaulting to Individual accounts
 */

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type UserType = "individual" | "employer";

export default function RegisterPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { signup, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();

	// Form state
	// Default to "individual" as per new "One Identity" model
	const [userType, setUserType] = useState<UserType>("individual");

	// Effect to set user type from query param (e.g. from homepage "Hire Talent" button)
	useEffect(() => {
		if (router.isReady && router.query.type === "employer") {
			setUserType("employer");
		}
	}, [router.isReady, router.query]);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [success, setSuccess] = useState(false);
	
	const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [resendMessage, setResendMessage] = useState<string>("");

	// Redirect if already authenticated
	if (isAuthenticated) {
		if (user?.userType === "employer") {
			router.replace("/employer/dashboard");
		} else {
			router.replace("/dashboard");
		}
		return null;
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		clearError();

		if (password !== confirmPassword) {
			return;
		}

		try {
			await signup(name, email, password, userType);
			setSuccess(true);
		} catch (err: any) {
			// Handle errors
		}
	};

	const handleResendLink = async () => {
		if (!email) return;

		setResendStatus("loading");
		try {
			await authApi.resendVerification(email);
			setResendStatus("success");
			setResendMessage(t("register.verificationLinkSent"));
			setTimeout(() => setResendStatus("idle"), 5000);
		} catch (err: any) {
			setResendStatus("error");
			setResendMessage(err.response?.data?.error || t("register.failedToResend"));
			setTimeout(() => {
				setResendStatus("idle");
				setResendMessage("");
			}, 3000);
		}
	};

	// Success screen
	if (success) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
				<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
				<div className="w-full max-w-md">
					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-4">{t("register.checkYourEmail")}</h2>
						<p className="text-[#475569] mb-6 text-sm sm:text-base">
							{t("register.verificationSent")} <span className="text-[#2563EB] font-medium break-all">{email}</span>. {t("register.checkInbox")}
						</p>
						{userType === "employer" && (
							<p className="text-[#64748B] text-sm mb-4">
								{t("register.afterVerifyEmployer")}
							</p>
						)}
						<Link
							href="/login"
							className="inline-block py-3 px-6 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md transition"
						>
							{t("register.goToLogin")}
						</Link>

						<div className="mt-6 border-t pt-4">
							<p className="text-sm text-gray-500 mb-2">{t("register.didntReceiveEmail")}</p>
							<button
								onClick={handleResendLink}
								disabled={resendStatus === "loading" || resendStatus === "success"}
								className="text-[#2563EB] hover:text-[#1E40AF] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{resendStatus === "loading" ? t("register.sending") : resendStatus === "success" ? t("register.sent") : t("register.resendVerificationLink")}
							</button>
							{resendMessage && (
								<p className={`text-xs mt-2 ${resendStatus === "error" ? "text-red-600" : "text-green-600"}`}>
									{resendMessage}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	// Registration form
	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8 relative">
			<div className="absolute top-4 right-4"><LanguageSwitcher /></div>
			<div className="w-full max-w-md">
				<div className="text-center mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
						{userType === "employer" ? t("register.createEmployerAccount") : t("register.joinTaraqqiHub")}
					</h1>
					<p className="text-[#475569]">
						{userType === "employer" ? t("register.startHiring") : t("register.createProfileAccess")}
					</p>
				</div>

				<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label htmlFor="name" className="block text-sm font-medium text-[#0F172A] mb-2">
								{userType === "employer" ? t("register.contactPersonName") : t("register.fullName")}
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={userType === "employer" ? t("register.yourName") : t("register.yourFullName")}
								className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base"
								required
								minLength={2}
							/>
						</div>

						<div className="mb-4">
							<label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-2">
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

						<div className="mb-4">
							<label htmlFor="password" className="block text-sm font-medium text-[#0F172A] mb-2">
								{t("auth.password")}
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={t("register.minChars")}
									className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition pr-12 text-base"
									required
									minLength={8}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] p-1"
								>
									{showPassword ? (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242" />
										</svg>
									) : (
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
										</svg>
									)}
								</button>
							</div>
							<p className="text-xs text-[#64748B] mt-1">
								{t("register.passwordHint")}
							</p>
						</div>

						<div className="mb-6">
							<label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0F172A] mb-2">
								{t("register.confirmPassword")}
							</label>
							<input
								type="password"
								id="confirmPassword"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder={t("register.reenterPassword")}
								className={`w-full px-4 py-3 bg-white border rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base ${
									confirmPassword && password !== confirmPassword 
										? "border-red-500" 
										: "border-[#E2E8F0]"
								}`}
								required
							/>
							{confirmPassword && password !== confirmPassword && (
								<p className="text-xs text-red-600 mt-1">{t("register.passwordsDoNotMatch")}</p>
							)}
						</div>

						<button
							type="submit"
							disabled={isLoading || !name || !email || !password || password !== confirmPassword}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
										<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
										<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
									</svg>
									{t("register.creatingAccount")}
								</span>
							) : (
								t("register.createAccount")
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-[#475569] text-sm sm:text-base mb-2">
							{userType === "individual" ? (
								<>
									{t("register.wantToHire")}{" "}
									<button 
										onClick={() => setUserType("employer")} 
										className="text-[#2563EB] hover:text-[#1E40AF] font-medium"
									>
										{t("register.createEmployerAccountLink")}
									</button>
								</>
							) : (
								<>
									{t("register.lookingForOpportunities")}{" "}
									<button 
										onClick={() => setUserType("individual")} 
										className="text-[#2563EB] hover:text-[#1E40AF] font-medium"
									>
										{t("register.joinAsIndividual")}
									</button>
								</>
							)}
						</p>
						<p className="text-[#475569] text-sm sm:text-base">
							{t("register.alreadyHaveAccount")}{" "}
							<Link href="/login" className="text-[#2563EB] hover:text-[#1E40AF] font-medium">
								{t("auth.signIn")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
