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
		resumeUrl: string | null;
	};
	contact?: {
		email: string;
		phone: string;
	};
}

const statusOptions = [
	{ value: "reviewed", label: "Reviewed" },
	{ value: "shortlisted", label: "Shortlisted" },
	{ value: "interview", label: "Interview" },
	{ value: "offered", label: "Offered" },
	{ value: "hired", label: "Selected" },
	{ value: "rejected", label: "Rejected" },
];

export default function ApplicantsPage() {
	const router = useRouter();
	const { id } = router.query;

	const [job, setJob] = useState<{ id: string; title: string } | null>(null);
	const [applicants, setApplicants] = useState<Applicant[]>([]);
	const [loading, setLoading] = useState(true);

	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (id) {
			loadApplicants();
		}
	}, [id]);

	const loadApplicants = async () => {
		try {
			setError(null);
			const jobId = Array.isArray(id) ? id[0] : id;
			if (!jobId) return;

			const response = await api.get(`/employer/jobs/${jobId}/applicants`);
			
			const payload = response.data?.payload ?? response.data;
			
			if (!payload) {
				throw new Error("Invalid response format");
			}

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

	const handleViewProfile = async (applicationId: string) => {
		// This tracks the view and updates status to 'reviewed'
		try {
			await api.post(`/employer/jobs/applications/${applicationId}/view`);
			// We don't necessarily need to reload, just update the local state if needed
			// But sticking to reload for consistency
			loadApplicants();
		} catch (err: any) {
			console.error("Failed to record view", err);
		}
	};

	const statusColors: Record<string, string> = {
		pending: "bg-yellow-100 text-yellow-700",
		reviewed: "bg-blue-100 text-blue-700",
		shortlisted: "bg-purple-100 text-purple-700",
		interview: "bg-indigo-100 text-indigo-700",
		offered: "bg-emerald-100 text-emerald-700",
		hired: "bg-green-100 text-green-700",
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

					{error && (
						<div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
							<span className="font-medium">Error!</span> {error}
						</div>
					)}

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
									<div className="flex flex-col md:flex-row md:items-start gap-4">
										{/* Avatar */}
										{app.profile?.profilePhotoUrl ? (
											<img
												src={app.profile.profilePhotoUrl}
												alt=""
												className="w-16 h-16 rounded-full object-cover"
											/>
										) : (
											<div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-2xl">
												👤
											</div>
										)}

										<div className="flex-1 w-full">
											<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
												<div>
													<h3 className="text-lg font-bold text-slate-900">
														{app.profile?.firstName} {app.profile?.lastName}
													</h3>
													<p className="text-slate-600">{app.profile?.headline}</p>
													
													<div className="flex flex-wrap items-center text-sm text-slate-500 mt-2 gap-4">
														<span className="flex items-center gap-1">
															📍 {app.profile?.city || "Location not specified"}
														</span>
														<span className="flex items-center gap-1">
															💼 {app.profile?.experienceYears || 0} years exp
														</span>
														{app.expectedSalary && (
															<span className="flex items-center gap-1">
																💰 Expected: {app.expectedSalary}
															</span>
														)}
													</div>

													<div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
														{app.contact?.email && (
															<div className="flex items-center gap-2 text-slate-700">
																✉️ <a href={`mailto:${app.contact.email}`} className="hover:underline">{app.contact.email}</a>
															</div>
														)}
														{app.contact?.phone && (
															<div className="flex items-center gap-2 text-slate-700">
																📞 <a href={`tel:${app.contact.phone}`} className="hover:underline">{app.contact.phone}</a>
															</div>
														)}
													</div>
												</div>

												<div className="flex flex-col items-end gap-2">
													<span
														className={`px-3 py-1 text-sm font-medium rounded-full ${
															statusColors[app.status] || "bg-slate-100 text-slate-600"
														}`}
													>
														{app.status === "reviewed" ? "Viewed" : app.status === "hired" ? "Selected" : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
													</span>
													<span className="text-xs text-slate-400">
														Applied {new Date(app.appliedAt).toLocaleDateString()}
													</span>
												</div>
											</div>

											{/* Cover Letter */}
											{app.coverLetter && (
												<div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-700">
													<p className="font-semibold mb-1 text-xs text-slate-500 uppercase">Cover Letter</p>
													{app.coverLetter}
												</div>
											)}

											{/* Skills */}
											{app.profile?.skills && app.profile.skills.length > 0 && (
												<div className="flex flex-wrap gap-2 mt-4">
													{app.profile.skills.slice(0, 8).map((skill, i) => (
														<span
															key={i}
															className="px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
														>
															{skill}
														</span>
													))}
												</div>
											)}

											{/* Action Bar */}
											<div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
												<div className="flex items-center gap-3">
													{app.profile?.resumeUrl && (
														<a
															href={app.profile.resumeUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm"
															onClick={() => handleViewProfile(app.id)}
														>
															📄 View Resume
														</a>
													)}
													
													{!app.viewedAt && (
														<button
															onClick={() => handleViewProfile(app.id)}
															className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition"
														>
															Mark as Viewed
														</button>
													)}
												</div>

												<div className="flex items-center gap-2">
													<label className="text-sm font-medium text-slate-600">Status:</label>
													<select
														value={app.status}
														onChange={(e) => handleStatusChange(app.id, e.target.value)}
														className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
													>
														{statusOptions.map((opt) => (
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
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
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
