/**
 * Verify Email Page
 * Handles email verification via token in URL - Professional design
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function VerifyEmailPage() {
	const router = useRouter();
	const { token } = router.query;
	const { user } = useAuthStore();

	const [status, setStatus] = useState<"loading" | "success" | "error" | "waiting">("waiting");
	const [error, setError] = useState<string | null>(null);
	const [resendStatus, setResendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
	const [resendMessage, setResendMessage] = useState<string>("");

	// Verify email when token is available
	useEffect(() => {
		if (token && typeof token === "string") {
			verifyEmail(token);
		}
	}, [token]);

	const verifyEmail = async (verificationToken: string) => {
		setStatus("loading");
		try {
			await authApi.verifyEmail(verificationToken);
			setStatus("success");
			// Try to refresh session to update verification status in store
			try {
				const { useAuthStore } = await import("@/store/authStore");
				await useAuthStore.getState().checkAuth();
			} catch (e) {
				// Ignore if checkAuth fails (e.g. different device)
			}
		} catch (err: any) {
			setError(err.response?.data?.error || "Verification failed");
			setStatus("error");
		}
	};

	const handleResendLink = async () => {
		if (!user?.email) return;

		setResendStatus("loading");
		try {
			await authApi.resendVerification(user.email);
			setResendStatus("success");
			setResendMessage("Verification link sent!");
			setTimeout(() => setResendStatus("idle"), 5000);
		} catch (err: any) {
			setResendStatus("error");
			setResendMessage(err.response?.data?.error || "Failed to resend link");
			setTimeout(() => {
				setResendStatus("idle");
				setResendMessage("");
			}, 3000);
		}
	};

	// Waiting for token
	if (status === "waiting" && !token) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-[#0F172A] mb-4">Check Your Email</h1>
						<p className="text-[#475569] mb-6">
							We&apos;ve sent you a verification link. Please check your inbox and click the link to verify your email address.
						</p>
						<Link
							href="/login"
							className="inline-block py-3 px-6 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-medium rounded-md transition"
						>
							Back to Login
						</Link>
						
						{user?.email && (
							<div className="mt-6 border-t pt-4">
								<p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the email?</p>
								<button
									onClick={handleResendLink}
									disabled={resendStatus === "loading" || resendStatus === "success"}
									className="text-[#2563EB] hover:text-[#1E40AF] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{resendStatus === "loading" ? "Sending..." : resendStatus === "success" ? "Sent!" : "Resend Verification Link"}
								</button>
								{resendMessage && (
									<p className={`text-xs mt-2 ${resendStatus === "error" ? "text-red-600" : "text-green-600"}`}>
										{resendMessage}
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		);
	}

	// Loading
	if (status === "loading") {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
				<div className="w-full max-w-md text-center">
					<div className="animate-spin h-12 w-12 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-6"></div>
					<p className="text-[#0F172A] text-lg">Verifying your email...</p>
				</div>
			</div>
		);
	}

	// Success
	if (status === "success") {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E2E8F0] text-center">
						<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h1 className="text-2xl font-bold text-[#0F172A] mb-4">Email Verified!</h1>
						<p className="text-[#475569] mb-6">
							Your email has been successfully verified. You can now sign in to your account.
						</p>
						<Link
							href="/login"
							className="inline-block py-3 px-6 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md transition"
						>
							Sign In
						</Link>
					</div>
				</div>
			</div>
		);
	}

	// Error
	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E2E8F0] text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</div>
					<h1 className="text-2xl font-bold text-[#0F172A] mb-4">Verification Failed</h1>
					<p className="text-[#475569] mb-6">
						{error || "The verification link is invalid or has expired."}
					</p>
					<div className="flex flex-col gap-3">
						
						<Link
							href="/login"
							className="inline-block py-3 px-6 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md transition"
						>
							Sign In
						</Link>
						<Link
							href="/register"
							className="inline-block py-3 px-6 text-[#475569] hover:text-[#0F172A] transition"
						>
							Create New Account
						</Link>
						
						{user?.email && (
							<div className="mt-4 border-t pt-4">
								<p className="text-sm text-gray-500 mb-2">Want to try again?</p>
								<button
									onClick={handleResendLink}
									disabled={resendStatus === "loading" || resendStatus === "success"}
									className="text-[#2563EB] hover:text-[#1E40AF] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{resendStatus === "loading" ? "Sending..." : resendStatus === "success" ? "Link Sent!" : "Resend Verification Link"}
								</button>
								{resendMessage && (
									<p className={`text-xs mt-2 ${resendStatus === "error" ? "text-red-600" : "text-green-600"}`}>
										{resendMessage}
									</p>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
