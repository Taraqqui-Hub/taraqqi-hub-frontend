/**
 * Manage Jobs Page
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Job {
	id: string;
	uuid: string;
	title: string;
	slug: string;
	city: string;
	jobType: string;
	status: string;
	viewsCount: number;
	applicationsCount: number;
	publishedAt: string | null;
	createdAt: string;
}

export default function ManageJobsPage() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadJobs();
	}, []);

	const loadJobs = async () => {
		try {
			const response = await api.get("/employer/jobs");
			setJobs(response.data.jobs || []);
		} catch (err) {
			console.error("Failed to load jobs", err);
		} finally {
			setLoading(false);
		}
	};

	const handleStatusChange = async (jobId: string, newStatus: string) => {
		try {
			await api.patch(`/employer/jobs/${jobId}`, { status: newStatus });
			loadJobs();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to update status");
		}
	};

	const handleDelete = async (jobId: string) => {
		if (!confirm("Are you sure you want to close this job?")) return;

		try {
			await api.delete(`/employer/jobs/${jobId}`);
			loadJobs();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to close job");
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-5xl mx-auto">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-bold text-[#0F172A]">My Jobs</h1>
						<Link
							href="/jobs/new"
							className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm hover:bg-[#1E40AF]"
						>
							+ Post New Job
						</Link>
					</div>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : jobs.length > 0 ? (
						<div className="space-y-4">
							{jobs.map((job) => (
								<div
									key={job.id}
									className="bg-white rounded-xl p-5 shadow-sm border border-slate-200"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<div className="flex items-center gap-3">
												<h3 className="text-lg font-semibold text-[#0F172A]">{job.title}</h3>
												<span
													className={`px-2 py-0.5 text-xs rounded capitalize ${
														job.status === "active"
															? "bg-green-100 text-green-700"
															: job.status === "draft"
															? "bg-slate-100 text-slate-600"
															: job.status === "paused"
															? "bg-yellow-100 text-yellow-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{job.status}
												</span>
											</div>
											<p className="text-sm text-slate-500 mt-1">
												{job.city} • {job.jobType?.replace("-", " ")}
											</p>
										</div>

										<div className="flex items-center space-x-2">
											<Link
												href={`/jobs/${job.id}/applicants`}
												className="px-3 py-1.5 text-sm bg-blue-50 text-[#2563EB] rounded-lg hover:bg-blue-100"
											>
												{job.applicationsCount} Applicants
											</Link>
										</div>
									</div>

									<div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
										<div className="flex items-center text-sm text-slate-500 space-x-4">
											<span>👁 {job.viewsCount} views</span>
											<span>
												{job.publishedAt
													? `Published ${new Date(job.publishedAt).toLocaleDateString()}`
													: `Created ${new Date(job.createdAt).toLocaleDateString()}`}
											</span>
										</div>

										<div className="flex items-center space-x-2">
											{job.status === "draft" && (
												<button
													onClick={() => handleStatusChange(job.id, "active")}
													className="text-sm text-green-600 hover:underline"
												>
													Publish
												</button>
											)}
											{job.status === "active" && (
												<button
													onClick={() => handleStatusChange(job.id, "paused")}
													className="text-sm text-yellow-600 hover:underline"
												>
													Pause
												</button>
											)}
											{job.status === "paused" && (
												<button
													onClick={() => handleStatusChange(job.id, "active")}
													className="text-sm text-green-600 hover:underline"
												>
													Resume
												</button>
											)}
											<Link
												href={`/jobs/${job.id}/edit`}
												className="text-sm text-[#2563EB] hover:underline"
											>
												Edit
											</Link>
											<button
												onClick={() => handleDelete(job.id)}
												className="text-sm text-red-600 hover:underline"
											>
												Close
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
							<p className="text-slate-500 mb-4">No jobs posted yet</p>
							<Link
								href="/jobs/new"
								className="inline-block px-6 py-3 bg-[#2563EB] text-white rounded-lg"
							>
								Post Your First Job
							</Link>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
