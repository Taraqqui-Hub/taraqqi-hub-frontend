/**
 * Applicants View Page — Employer view of who applied to a job
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { Phone, MessageCircle, AlertCircle, CheckCircle2, User } from "lucide-react";

interface Applicant {
	id: string;
	uuid: string;
	status: string;
	coverLetter: string | null;
	expectedSalary: string | null;
	noticePeriodDays: number | null;
	rating: number | null;
	appliedAt: string;
	viewedAt: string | null;
	displayName: string | null; // fallback from users.name
	profile: {
		id: string;
		firstName: string | null;
		lastName: string | null;
		headline: string | null;
		city: string | null;
		state: string | null;
		experienceYears: number | null;
		skills: string[] | null;
		profilePhotoUrl: string | null;
		resumeUrl: string | null;
		profileCompletion: number | null;
		summary: string | null;
		gender: string | null;
	};
	contact?: {
		email: string | null;
		phone: string | null;
		whatsappNumber?: string | null;
	};
}

const getStatusOptions = (t: (k: string) => string) => [
	{ value: "reviewed", label: t("employerApplicants.reviewed") },
	{ value: "shortlisted", label: t("employerApplicants.shortlisted") },
	{ value: "interview", label: t("employerApplicants.interview") },
	{ value: "offered", label: t("employerApplicants.offered") },
	{ value: "hired", label: t("employerApplicants.selected") },
	{ value: "rejected", label: t("employerApplicants.rejected") },
];

const statusColors: Record<string, string> = {
	pending: "bg-yellow-100 text-yellow-700",
	reviewed: "bg-blue-100 text-blue-700",
	shortlisted: "bg-purple-100 text-purple-700",
	interview: "bg-indigo-100 text-indigo-700",
	offered: "bg-emerald-100 text-emerald-700",
	hired: "bg-green-100 text-green-700",
	rejected: "bg-red-100 text-red-700",
};

/** Returns the best displayable name for an applicant */
function resolveApplicantName(app: Applicant): string {
	const first = app.profile?.firstName?.trim();
	const last = app.profile?.lastName?.trim();
	if (first || last) return [first, last].filter(Boolean).join(" ");
	if (app.displayName?.trim()) return app.displayName.trim();
	if (app.contact?.email) return app.contact.email.split("@")[0];
	return "Applicant";
}

/** Returns true when the profile is missing key info an employer needs */
function isProfileIncomplete(app: Applicant): boolean {
	const hasName = !!(app.profile?.firstName || app.profile?.lastName || app.displayName);
	const hasLocation = !!(app.profile?.city);
	return !hasName || !hasLocation;
}

/** Completion badge colour */
function completionColor(pct: number | null): string {
	if (!pct) return "bg-red-100 text-red-700";
	if (pct >= 80) return "bg-green-100 text-green-700";
	if (pct >= 50) return "bg-amber-100 text-amber-700";
	return "bg-red-100 text-red-700";
}

export default function ApplicantsPage() {
	const router = useRouter();
	const { id } = router.query;
	const { t } = useTranslation();

	const [job, setJob] = useState<{ id: string; title: string; isResumeRequired?: boolean } | null>(null);
	const [applicants, setApplicants] = useState<Applicant[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (id) loadApplicants();
	}, [id]);

	const loadApplicants = async () => {
		try {
			setError(null);
			const jobId = Array.isArray(id) ? id[0] : id;
			if (!jobId) return;
			const response = await api.get(`/employer/jobs/${jobId}/applicants`);
			const payload = response.data?.payload ?? response.data;
			if (!payload) throw new Error("Invalid response format");
			setJob(payload.job);
			setApplicants(payload.applicants || []);
		} catch (err: any) {
			console.error("Failed to load applicants", err);
			setError(err.response?.data?.message || err.message || "Failed to load applicants");
		} finally {
			setLoading(false);
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

	const handleMarkViewed = async (applicationId: string) => {
		try {
			await api.post(`/employer/jobs/applications/${applicationId}/view`);
			loadApplicants();
		} catch (err: any) {
			console.error("Failed to record view", err);
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<button
							onClick={() => router.back()}
							className="text-sm text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1"
						>
							← {t("employerApplicants.backToJobs")}
						</button>
						<h1 className="text-2xl font-bold text-slate-900">
							{t("employerApplicants.applicantsFor")} {job ? job.title : ""}
						</h1>
						{!loading && (
							<p className="text-sm text-slate-500 mt-1">
								{applicants.length} applicant{applicants.length !== 1 ? "s" : ""}
							</p>
						)}
					</div>

					{error && (
						<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
							<span className="font-medium">Error!</span> {error}
						</div>
					)}

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto" />
						</div>
					) : applicants.length > 0 ? (
						<div className="space-y-5">
							{applicants.map((app) => {
								const name = resolveApplicantName(app);
								const incomplete = isProfileIncomplete(app);
								const pct = app.profile?.profileCompletion;
								const location = [app.profile?.city, app.profile?.state].filter(Boolean).join(", ");

								return (
									<div
										key={app.id}
										className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
									>
										{/* Incomplete profile banner */}
										{incomplete && (
											<div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 border-b border-amber-100 text-amber-800 text-sm">
												<AlertCircle className="w-4 h-4 flex-shrink-0" />
												<span>
													<strong>Incomplete profile</strong> — this applicant hasn't filled in all their details yet (name / location missing). Their full profile will appear below as they update it.
												</span>
											</div>
										)}

										<div className="p-5 md:p-6">
											<div className="flex flex-col md:flex-row md:items-start gap-4">
												{/* Avatar */}
												{app.profile?.profilePhotoUrl ? (
													<img
														src={app.profile.profilePhotoUrl}
														alt={name}
														className="w-16 h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-slate-100"
													/>
												) : (
													<div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-slate-200">
														<User className="w-7 h-7 text-slate-400" />
													</div>
												)}

												<div className="flex-1 min-w-0">
													{/* Name row */}
													<div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
														<div className="min-w-0">
															<h3 className="text-lg font-bold text-slate-900 truncate">
																{name}
															</h3>
															{app.profile?.headline && (
																<p className="text-slate-600 text-sm">{app.profile.headline}</p>
															)}

															{/* Meta: location, experience */}
															<div className="flex flex-wrap items-center text-sm text-slate-500 mt-2 gap-x-4 gap-y-1">
																<span className="flex items-center gap-1">
																	📍 {location || <em className="text-amber-500">Location not set</em>}
																</span>
																<span className="flex items-center gap-1">
																	💼 {app.profile?.experienceYears != null ? `${app.profile.experienceYears} yrs exp` : <em className="text-slate-400">Exp not set</em>}
																</span>
																{app.expectedSalary && (
																	<span className="flex items-center gap-1">
																		💰 Expected ₹{app.expectedSalary}
																	</span>
																)}
																{app.noticePeriodDays != null && (
																	<span className="flex items-center gap-1">
																		🗓 {app.noticePeriodDays === 0 ? "Immediate" : `${app.noticePeriodDays}d notice`}
																	</span>
																)}
																{app.profile?.gender && (
																	<span className="flex items-center gap-1 capitalize">
																		🧑 {app.profile.gender}
																	</span>
																)}
															</div>

															{/* Profile completion badge */}
															<div className="mt-2 flex items-center gap-2">
																<span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full ${completionColor(pct)}`}>
																	{pct != null ? (
																		<><CheckCircle2 className="w-3 h-3" /> {pct}% complete</>
																	) : (
																		<><AlertCircle className="w-3 h-3" /> Profile incomplete</>
																	)}
																</span>
															</div>
														</div>

														{/* Status badge + applied date */}
														<div className="flex flex-col items-start md:items-end gap-1 flex-shrink-0">
															<span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[app.status] || "bg-slate-100 text-slate-600"}`}>
																{getStatusOptions(t).find((o) => o.value === app.status)?.label || app.status}
															</span>
															<span className="text-xs text-slate-400">
																Applied {new Date(app.appliedAt).toLocaleDateString()}
															</span>
															{app.viewedAt && (
																<span className="text-xs text-blue-400">
																	Viewed {new Date(app.viewedAt).toLocaleDateString()}
																</span>
															)}
														</div>
													</div>

													{/* Contact buttons */}
													<div className="mt-3 flex flex-wrap items-center gap-2">
														{app.contact?.phone && (
															<a
																href={`tel:${app.contact.phone.replace(/\s/g, "")}`}
																className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition"
															>
																<Phone className="w-4 h-4" />
																{t("employerApplicants.call")}
															</a>
														)}
														{(app.contact?.whatsappNumber || app.contact?.phone) && (
															<a
																href={`https://wa.me/${(app.contact?.whatsappNumber || app.contact?.phone || "").replace(/\D/g, "")}`}
																target="_blank"
																rel="noopener noreferrer"
																className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 transition"
															>
																<MessageCircle className="w-4 h-4" />
																{t("employerApplicants.whatsApp")}
															</a>
														)}
														{app.contact?.email && (
															<a
																href={`mailto:${app.contact.email}`}
																className="text-sm text-slate-600 hover:underline"
															>
																{app.contact.email}
															</a>
														)}
													</div>

													{/* Summary */}
													{app.profile?.summary && (
														<div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-700">
															<p className="font-semibold text-xs text-slate-400 uppercase mb-1">Summary</p>
															<p className="line-clamp-3">{app.profile.summary}</p>
														</div>
													)}

													{/* Cover Letter */}
													{app.coverLetter && (
														<div className="mt-3 p-3 bg-indigo-50 rounded-xl text-sm text-indigo-900 border border-indigo-100">
															<p className="font-semibold text-xs text-indigo-400 uppercase mb-1">Cover Letter / Message</p>
															{app.coverLetter}
														</div>
													)}

													{/* Skills */}
													{app.profile?.skills && app.profile.skills.length > 0 && (
														<div className="flex flex-wrap gap-2 mt-4">
															{app.profile.skills.slice(0, 10).map((skill, i) => (
																<span
																	key={i}
																	className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
																>
																	{skill}
																</span>
															))}
														</div>
													)}

													{/* Action bar */}
													<div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
														<div className="flex items-center gap-3 flex-wrap">
															{/* Resume */}
															{job?.isResumeRequired === false ? (
																<span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg">
																	Resume not required
																</span>
															) : app.profile?.resumeUrl ? (
																<a
																	href={app.profile.resumeUrl}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm"
																>
																	📄 View Resume
																</a>
															) : (
																<span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-800 text-sm font-medium rounded-lg border border-amber-200">
																	No resume provided
																</span>
															)}

															{/* Mark viewed */}
															{!app.viewedAt && (
																<button
																	onClick={() => handleMarkViewed(app.id)}
																	className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
																>
																	Mark as Viewed
																</button>
															)}
														</div>

														{/* Status changer */}
														<div className="flex items-center gap-2">
															<label className="text-sm font-medium text-slate-600">Status:</label>
															<select
																value={app.status}
																onChange={(e) => handleStatusChange(app.id, e.target.value)}
																className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
															>
																{getStatusOptions(t).map((opt) => (
																	<option key={opt.value} value={opt.value}>
																		{opt.label}
																	</option>
																))}
															</select>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
							<div className="text-4xl mb-4">📭</div>
							<h3 className="text-lg font-medium text-slate-900">No applicants yet</h3>
							<p className="text-slate-500 mt-1">When people apply to this job, they will appear here.</p>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
