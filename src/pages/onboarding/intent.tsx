/**
 * Engagement Intent Page (Screen 5A)
 * Collects user preferences/intent.
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { preferencesApi } from "@/lib/api";
import { Briefcase, Clock, Wrench, Users } from "lucide-react";

export default function IntentPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { isLoading: authLoading, checkAuth } = useAuthStore();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [intents, setIntents] = useState<string[]>([]);

	const toggleIntent = (intent: string) => {
		if (intents.includes(intent)) {
			setIntents(intents.filter((i) => i !== intent));
		} else {
			setIntents([...intents, intent]);
		}
	};

	const handleSubmit = async () => {
		setSaving(true);
		setError(null);
		
		try {
			// Map selections to preferences API format
			await preferencesApi.save({
				wantsJobNow: intents.includes("job_search"),
				openToFutureJobs: intents.includes("passive"),
				wantsSkillPrograms: intents.includes("skills"),
				wantsCommunityPrograms: intents.includes("community"),
			});
			
			// Refresh user state so hasPreferences is updated
			await checkAuth();
			
			// Navigate to KYC
			router.push("/kyc");
		} catch (err: any) {
			setError(err.response?.data?.error || t("onboarding.intent.failedToSave"));
		} finally {
			setSaving(false);
		}
	};

    const options = [
        { id: "job_search", label: t("onboarding.intent.jobNow"), icon: Briefcase },
        { id: "passive", label: t("onboarding.intent.futureOpportunities"), icon: Clock },
        { id: "skills", label: t("onboarding.intent.skillPrograms"), icon: Wrench },
        { id: "community", label: t("onboarding.intent.communityUpdates"), icon: Users },
    ];

	return (
		<ProtectedRoute allowedUserTypes={["individual"]}>
			<div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12 sm:py-16">
				<div className="w-full max-w-[500px]">
					{/* Minimal progress — same as Step 1 (contact) */}
					<div className="flex items-center justify-end gap-2 mb-8">
						<div className="flex gap-1">
							<span className="w-2 h-2 rounded-full bg-neutral-200" aria-hidden />
							<span className="w-2 h-2 rounded-full bg-neutral-900" aria-hidden />
							<span className="w-2 h-2 rounded-full bg-neutral-200" aria-hidden />
						</div>
						<span className="text-xs text-neutral-400 tabular-nums">
							{t("onboarding.intent.step")}
						</span>
					</div>

					{/* Card — same style as Step 1 */}
					<div className="bg-white rounded-2xl px-6 py-8 sm:px-8 sm:py-10 shadow-none border border-neutral-100">
						<h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-1.5">
							{t("onboarding.intent.title")}
						</h1>
						<p className="text-sm text-neutral-500 leading-relaxed mb-8">
							{t("onboarding.intent.subtitle")}
						</p>

						<div className="space-y-3 mb-8">
							{options.map((opt) => {
								const Icon = opt.icon;
								return (
									<button
										key={opt.id}
										type="button"
										onClick={() => toggleIntent(opt.id)}
										className={`w-full text-left p-4 rounded-xl border transition-colors ${
											intents.includes(opt.id)
												? "border-neutral-900 bg-neutral-50 text-neutral-900"
												: "border-neutral-200 hover:border-neutral-300 text-neutral-700"
										}`}
									>
										<div className="flex items-center gap-3">
											<div
												className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
													intents.includes(opt.id)
														? "bg-neutral-900 text-white"
														: "bg-neutral-100 text-neutral-600"
												}`}
											>
												<Icon className="w-5 h-5" />
											</div>
											<div
												className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
													intents.includes(opt.id)
														? "bg-neutral-900 border-neutral-900"
														: "border-neutral-300"
												}`}
											>
												{intents.includes(opt.id) && (
													<svg
														className="w-3 h-3 text-white"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={3}
															d="M5 13l4 4L19 7"
														/>
													</svg>
												)}
											</div>
											<span className="font-medium text-sm">{opt.label}</span>
										</div>
									</button>
								);
							})}
						</div>

						{error && (
							<div className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm mb-6 border border-red-100">
								{error}
							</div>
						)}

						<button
							type="button"
							onClick={handleSubmit}
							disabled={saving}
							className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						>
							{saving ? t("onboarding.intent.saving") : t("onboarding.intent.continue")}
						</button>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
