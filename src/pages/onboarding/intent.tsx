/**
 * Engagement Intent Page (Screen 5A)
 * Collects user preferences/intent.
 */

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import { preferencesApi } from "@/lib/api";

export default function IntentPage() {
	const router = useRouter();
	const { isLoading: authLoading } = useAuthStore();
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
			
			// Navigate to KYC
			router.push("/kyc");
		} catch (err: any) {
			setError(err.response?.data?.error || "Failed to save preferences");
		} finally {
			setSaving(false);
		}
	};

    const options = [
        { id: "job_search", label: "I am looking for a job now" },
        { id: "passive", label: "I want to keep my profile for future opportunities" },
        { id: "skills", label: "I want skill development programs" },
        { id: "community", label: "I want community updates" },
    ];

	return (
		<ProtectedRoute allowedUserTypes={["individual"]}>
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md">
                     <div className="mb-6">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-2/3"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">Step 2 of 3</p>
                    </div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
						<h2 className="text-xl font-bold text-[#0F172A] mb-2">What are you looking for?</h2>
						<p className="text-[#475569] text-sm mb-6">
							Help us personalize your experience.
						</p>

						<div className="space-y-3 mb-8">
                            {options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => toggleIntent(opt.id)}
                                    className={`w-full text-left p-4 rounded-lg border transition ${
                                        intents.includes(opt.id)
                                            ? "border-blue-600 bg-blue-50 text-blue-700"
                                            : "border-gray-200 hover:border-blue-300 text-slate-700"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 ${
                                            intents.includes(opt.id) ? "bg-blue-600 border-blue-600" : "border-gray-300"
                                        }`}>
                                            {intents.includes(opt.id) && (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="font-medium text-sm">{opt.label}</span>
                                    </div>
                                </button>
                            ))}
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
								{error}
							</div>
						)}

						<button
							onClick={handleSubmit}
							disabled={saving}
							className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{saving ? "Saving..." : "Continue"}
						</button>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
