/**
 * Login Page
 * Email/Password login - Minimalistic, mobile-first design
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
	const router = useRouter();
	const { 
		login, 
		isLoading, 
		error, 
		clearError, 
		isAuthenticated,
		user,
		checkAuth,
		getVerificationRedirect 
	} = useAuthStore();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	// Check auth status on mount to ensure user data is fresh
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	// Redirect based on verification status
	useEffect(() => {
		if (!isLoading && isAuthenticated && user) {
			const redirect = getVerificationRedirect();
			if (redirect) {
				router.replace(redirect);
			} else {
				const { redirect } = router.query;
				const returnUrl = Array.isArray(redirect) ? redirect[0] : redirect;
				
				// Check if returnUrl contains un-interpolated Next.js dynamic segments (e.g., "[id]")
				// This prevents Runtime Error: missing query values
			if (returnUrl && !returnUrl.includes("[") && !returnUrl.includes("]")) {
					router.replace(returnUrl);
				} else {
					if (user.userType === "employer") {
						router.replace("/employer/dashboard");
					} else {
						router.replace("/dashboard");
					}
				}
			}
		}
	}, [isLoading, isAuthenticated, user, router, getVerificationRedirect]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		clearError();

		try {
			await login(email, password);
			// Redirect handled by useEffect
		} catch {
			// Error is set in store
		}
	};

	if (isAuthenticated) {
		return (
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
				<div className="animate-spin h-8 w-8 border-4 border-[#2563EB] border-t-transparent rounded-full"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
			<div className="w-full max-w-md">
				{/* Logo / Brand */}
				<div className="text-center mb-6 sm:mb-8">
					<h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-1 sm:mb-2">Taraqqi Hub</h1>
					<p className="text-sm sm:text-base text-[#475569]">Your career journey starts here</p>
				</div>

				{/* Login Card */}
				<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
					<h2 className="text-lg sm:text-xl font-semibold text-[#0F172A] mb-6">Sign In</h2>

					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div className="mb-4">
							<label
								htmlFor="email"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								Email Address
							</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
								className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base"
								required
							/>
						</div>

						<div className="mb-6">
							<label
								htmlFor="password"
								className="block text-sm font-medium text-[#0F172A] mb-2"
							>
								Password
							</label>
							<div className="relative">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									className="w-full px-4 py-3 bg-white border border-[#E2E8F0] rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition pr-12 text-base"
									required
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
							<div className="mt-2 text-right">
								<Link
									href="/forgot-password"
									className="text-sm text-[#2563EB] hover:text-[#1E40AF]"
								>
									Forgot password?
								</Link>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading || !email || !password}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin h-5 w-5 mr-2"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
											fill="none"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										/>
									</svg>
									Signing in...
								</span>
							) : (
								"Sign In"
							)}
						</button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-[#475569] text-sm sm:text-base">
							Don&apos;t have an account?{" "}
							<Link
								href="/register"
								className="text-[#2563EB] hover:text-[#1E40AF] font-medium"
							>
								Register
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
