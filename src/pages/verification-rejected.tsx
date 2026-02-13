/**
 * Verification Rejected Page
 * Shown to users whose KYC was rejected - Professional design
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function VerificationRejectedPage() {
	const router = useRouter();
	const { user, isAuthenticated, isVerified, logout } = useAuthStore();

	// Redirect if not authenticated or if verified
	useEffect(() => {
		if (!isAuthenticated) {
			router.replace("/login");
		} else if (isVerified()) {
			if (user?.userType === "employer") {
				router.replace("/employer/dashboard");
			} else {
				router.replace("/dashboard");
			}
		}
	}, [isAuthenticated, isVerified, router, user]);

	if (!isAuthenticated || !user) {
		return null;
	}

	// Get rejection reason
	const rejectionReason = user?.rejectedReason || "The submitted documents were unclear or did not match the provided information.";

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E2E8F0] text-center">
					{/* Icon */}
					<div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-[#0F172A] mb-4">Verification Not Approved</h1>

					{/* Status badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 rounded-full mb-6">
						<svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
						<span className="text-red-700 text-sm font-medium">Rejected</span>
					</div>

					{/* Rejection reason */}
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 text-left">
						<h3 className="text-red-700 font-semibold mb-2">Reason for Rejection</h3>
						<p className="text-[#475569] text-sm">{rejectionReason}</p>
					</div>

					{/* What to do */}
					<div className="bg-[#F8FAFC] rounded-lg p-6 mb-8 text-left border border-[#E2E8F0]">
						<h3 className="text-[#0F172A] font-semibold mb-4">What can you do?</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<p className="text-[#475569] text-sm">Ensure your document photos are clear and readable</p>
							</li>
							<li className="flex items-start gap-3">
								<svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<p className="text-[#475569] text-sm">Make sure all information matches your profile</p>
							</li>
							<li className="flex items-start gap-3">
								<svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<p className="text-[#475569] text-sm">Submit valid government-issued ID documents</p>
							</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-3">
						<Link
							href="/kyc"
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md transition text-center"
						>
							Resubmit Documents
						</Link>
						<button
							onClick={() => logout()}
							className="w-full py-3 px-4 text-[#64748B] hover:text-[#0F172A] transition"
						>
							Sign Out
						</button>
					</div>

					{/* Contact support */}
					<p className="text-[#64748B] text-sm mt-6">
						Need help? Contact{" "}
						<a href="mailto:support@taraqqihub.com" className="text-[#2563EB] hover:text-[#1E40AF]">
							support@taraqqihub.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
}
