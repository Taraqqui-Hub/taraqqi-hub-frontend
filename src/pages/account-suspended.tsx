/**
 * Account Suspended Page
 * Shown to users whose account has been suspended - Professional design
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";

export default function AccountSuspendedPage() {
	const router = useRouter();
	const { user, isAuthenticated, logout } = useAuthStore();

	// Redirect if not authenticated
	useEffect(() => {
		if (!isAuthenticated) {
			router.replace("/login");
		} else if (user?.verificationStatus !== "suspended") {
			router.replace("/dashboard");
		}
	}, [isAuthenticated, user, router]);

	if (!isAuthenticated || !user) {
		return null;
	}

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				<div className="bg-white rounded-lg p-8 shadow-sm border border-red-200 text-center">
					{/* Icon */}
					<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
						</svg>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-[#0F172A] mb-4">Account Suspended</h1>

					{/* Status badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full mb-6">
						<svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
						</svg>
						<span className="text-red-700 text-sm font-medium">Suspended</span>
					</div>

					{/* Message */}
					<p className="text-[#475569] mb-8">
						Your account has been suspended due to a violation of our terms of service 
						or suspicious activity. If you believe this is a mistake, please contact our support team.
					</p>

					{/* Contact info */}
					<div className="bg-[#F8FAFC] rounded-lg p-6 mb-8 border border-[#E2E8F0]">
						<h3 className="text-[#0F172A] font-semibold mb-4">Contact Support</h3>
						<div className="space-y-3">
							<a 
								href="mailto:support@taraqqihub.com" 
								className="flex items-center justify-center gap-3 text-[#2563EB] hover:text-[#1E40AF] transition"
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								support@taraqqihub.com
							</a>
						</div>
					</div>

					{/* When contacting */}
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 text-left">
						<p className="text-amber-800 text-sm">
							<strong>When contacting support:</strong> Please include your registered email address 
							and any relevant information that might help us review your case.
						</p>
					</div>

					{/* Sign out */}
					<button
						onClick={() => logout()}
						className="w-full py-3 px-4 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-medium rounded-md transition"
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
}
