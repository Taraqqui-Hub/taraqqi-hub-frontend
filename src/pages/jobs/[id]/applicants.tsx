/**
 * Applicants View Page
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Applicant {
	id: string;
	uuid: string;
	status: string;
	coverLetter: string | null;
	expectedSalary: string | null;
	rating: number | null;
	appliedAt: string;
	viewedAt: string | null;
	profile: {
		id: string;
		firstName: string;
		lastName: string;
		headline: string;
		city: string;
		experienceYears: number;
		skills: string[];
		profilePhotoUrl: string | null;
	};
}

const statusOptions = [
	{ value: "reviewed", label: "Mark Reviewed" },
	{ value: "shortlisted", label: "Shortlist" },
	{ value: "interview", label: "Move to Interview" },
	{ value: "offered", label: "Send Offer" },
	{ value: "hired", label: "Mark Hired" },
	{ value: "rejected", label: "Reject" },
];

export default function ApplicantsPage() {
	const router = useRouter();
	const { id } = router.query;

	const [job, setJob] = useState<{ id: string; title: string } | null>(null);
	const [applicants, setApplicants] = useState<Applicant[]>([]);
	const [loading, setLoading] = useState(true);
	const [unlockCost, setUnlockCost] = useState(50);

	useEffect(() => {
		if (id) {
			loadApplicants();
			loadUnlockCost();
		}
	}, [id]);

	const loadApplicants = async () => {
		try {
			const response = await api.get(`/employer/jobs/${id}/applicants`);
			setJob(response.data.job);
			setApplicants(response.data.applicants || []);
		} catch (err) {
			console.error("Failed to load applicants", err);
		} finally {
			setLoading(false);
		}
	};

	const loadUnlockCost = async () => {
		try {
			const response = await api.get("/resume/unlock/cost");
			setUnlockCost(response.data.cost);
		} catch (err) {
			console.error("Failed to get unlock cost", err);
		}
	};

	const handleStatusChange = async (applicationId: string, status: string) => {
		try {
			await api.patch(`/employer/jobs/applications/${applicationId}/status`, { status });
			loadApplicants();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to update status");
		}
	};

	const handleUnlock = async (profileId: string) => {
		if (!confirm(`This will cost ₹${unlockCost}. Continue?`)) return;

		try {
			const response = await api.post(`/resume/unlock/${profileId}`);
			alert(`Unlocked! Phone: ${response.data.profile.phone}, Email: ${response.data.profile.email}`);
		} catch (err: any) {
			alert(err.response?.data?.message || "Failed to unlock profile");
		}
	};

	const statusColors: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-700",
		reviewed: "bg-blue-100 text-blue-700",
		shortlisted: "bg-green-100 text-green-700",
		interview: "bg-blue-100 text-[#1E40AF]",
		offered: "bg-emerald-100 text-emerald-700",
		hired: "bg-green-200 text-green-800",
		rejected: "bg-red-100 text-red-700",
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-5xl mx-auto">
					<div className="mb-6">
						<button
							onClick={() => router.back()}
							className="text-sm text-slate-500 hover:text-slate-700 mb-2"
						>
							← Back to Jobs
						</button>
						<h1 className="text-2xl font-bold text-slate-900">
							Applicants {job ? `for ${job.title}` : ""}
						</h1>
					</div>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : applicants.length > 0 ? (
						<div className="space-y-4">
							{applicants.map((app) => (
								<div
									key={app.id}
									className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
								>
									<div className="flex items-start gap-4">
										{/* Avatar */}
										{app.profile.profilePhotoUrl ? (
											<img
												src={app.profile.profilePhotoUrl}
												alt=""
												className="w-14 h-14 rounded-full object-cover"
											/>
										) : (
											<div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center text-xl">
												👤
											</div>
										)}

										<div className="flex-1">
											<div className="flex items-start justify-between">
												<div>
													<h3 className="font-semibold text-slate-900">
														{app.profile.firstName} {app.profile.lastName}
													</h3>
													<p className="text-sm text-slate-500">{app.profile.headline}</p>
													<div className="flex items-center text-sm text-slate-400 mt-1 gap-3">
														<span>📍 {app.profile.city}</span>
														<span>{app.profile.experienceYears || 0} yrs exp</span>
													</div>
												</div>
												<span
													className={`px-2 py-1 text-xs rounded capitalize ${
														statusColors[app.status] || "bg-slate-100"
													}`}
												>
													{app.status}
												</span>
											</div>

											{/* Skills */}
											{app.profile.skills && app.profile.skills.length > 0 && (
												<div className="flex flex-wrap gap-1 mt-3">
													{app.profile.skills.slice(0, 5).map((skill, i) => (
														<span
															key={i}
															className="px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded"
														>
															{skill}
														</span>
													))}
												</div>
											)}

											{/* Actions */}
											<div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
												<div className="flex items-center gap-2">
													<select
														value=""
														onChange={(e) => {
															if (e.target.value) {
																handleStatusChange(app.id, e.target.value);
															}
														}}
														className="text-sm border border-slate-300 rounded px-2 py-1"
													>
														<option value="">Change Status</option>
														{statusOptions.map((opt) => (
															<option key={opt.value} value={opt.value}>
																{opt.label}
															</option>
														))}
													</select>

													<button
														onClick={() => handleUnlock(app.profile.id)}
														className="text-sm px-3 py-1 bg-[#2563EB] text-white rounded hover:bg-[#1E40AF]"
													>
														Unlock Contact (₹{unlockCost})
													</button>
												</div>

												<span className="text-xs text-slate-400">
													Applied {new Date(app.appliedAt).toLocaleDateString()}
													{app.viewedAt && " • Viewed"}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
							<p className="text-slate-500">No applicants yet</p>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
