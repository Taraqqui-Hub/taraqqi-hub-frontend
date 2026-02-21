/**
 * Verification Pending Page
 * Shown to users who have submitted KYC and are awaiting review - Professional design
 */

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

export default function VerificationPendingPage() {
	const router = useRouter();
	const { t } = useTranslation();
	const { user, isAuthenticated, isVerified, logout } = useAuthStore();

	// Redirect if not authenticated or if already verified
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

	return (
		<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
			<div className="w-full max-w-lg">
				<div className="bg-white rounded-lg p-8 shadow-sm border border-[#E2E8F0] text-center">
					{/* Icon */}
					<div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>

					{/* Title */}
					<h1 className="text-2xl font-bold text-[#0F172A] mb-4">{t("verificationPending.verificationInProgress")}</h1>

					{/* Status badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
						<span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
						<span className="text-amber-700 text-sm font-medium">
							{user.verificationStatus === "under_review" ? t("verificationPending.underReview") : t("verificationPending.submitted")}
						</span>
					</div>

					{/* Message */}
					<p className="text-[#475569] mb-8">
						{t("verificationPending.thankYouMessage")} <span className="text-[#0F172A] font-semibold">{t("verificationPending.businessDays")}</span>.
					</p>

					{/* Employer vs individual: what you can / cannot do */}
					{user?.userType === "employer" ? (
						<div className="space-y-4 mb-8">
							<div className="bg-green-50 rounded-lg p-4 border border-green-200 text-left">
								<h3 className="text-[#0F172A] font-semibold mb-2">{t("verificationPending.youCan")}</h3>
								<ul className="text-sm text-[#475569] space-y-1">
									<li>• {t("verificationPending.completeCompanyProfile")}</li>
									<li>• {t("verificationPending.prepareDrafts")}</li>
								</ul>
							</div>
							<div className="bg-amber-50 rounded-lg p-4 border border-amber-200 text-left">
								<h3 className="text-[#0F172A] font-semibold mb-2">{t("verificationPending.youCannotYet")}</h3>
								<ul className="text-sm text-[#475569] space-y-1">
									<li>• {t("verificationPending.publishJobs")}</li>
									<li>• {t("verificationPending.viewApplicants")}</li>
								</ul>
							</div>
						</div>
					) : null}

					{/* What happens next */}
					<div className="bg-[#F8FAFC] rounded-lg p-6 mb-8 text-left border border-[#E2E8F0]">
						<h3 className="text-[#0F172A] font-semibold mb-4">{t("verificationPending.whatHappensNext")}</h3>
						<ul className="space-y-3">
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-[#2563EB] text-xs font-bold">1</span>
								</div>
								<p className="text-[#475569] text-sm">{t("verificationPending.weVerifyDocs")}</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-[#2563EB] text-xs font-bold">2</span>
								</div>
								<p className="text-[#475569] text-sm">{t("verificationPending.emailNotification")}</p>
							</li>
							<li className="flex items-start gap-3">
								<div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
									<span className="text-[#2563EB] text-xs font-bold">3</span>
								</div>
								<p className="text-[#475569] text-sm">
									{user?.userType === "employer"
										? t("verificationPending.onceApprovedEmployer")
										: t("verificationPending.onceApprovedIndividual")}
								</p>
							</li>
						</ul>
					</div>

					{/* Contact support */}
					<p className="text-[#64748B] text-sm mb-6">
						{t("verificationPending.questionsContact")}{" "}
						<a href="mailto:support@taraqqihub.com" className="text-[#2563EB] hover:text-[#1E40AF]">
							support@taraqqihub.com
						</a>
					</p>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<button
							onClick={() => router.reload()}
							className="px-6 py-3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] font-medium rounded-md transition"
						>
							{t("verificationPending.refreshStatus")}
						</button>
						<button
							onClick={() => logout()}
							className="px-6 py-3 text-[#64748B] hover:text-[#0F172A] transition"
						>
							{t("verificationPending.signOut")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
