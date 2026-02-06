/**
 * Employer Applicants overview
 * List jobs with links to view applicants
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

interface JobRow {
	id: string;
	title: string;
	status: string;
	applicationsCount: number;
}

export default function EmployerApplicantsPage() {
	const [jobs, setJobs] = useState<JobRow[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get("/employer/jobs");
				const list = res.data?.payload?.jobs ?? res.data?.jobs ?? [];
				setJobs(list.map((j: any) => ({
					id: String(j.id),
					title: j.title,
					status: j.status,
					applicationsCount: j.applicationsCount || 0,
				})));
			} catch (_) {}
			finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Applicants</h1>
					<p className="text-[#475569] text-sm mb-6">
						Select a job to view and manage applicants.
					</p>

					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
						</div>
					) : jobs.length === 0 ? (
						<div className="bg-white rounded-xl border border-[#E2E8F0] p-8 text-center">
							<p className="text-[#475569] mb-4">No jobs yet.</p>
							<Link
								href="/jobs/new"
								className="inline-block py-2 px-4 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1E40AF]"
							>
								Post a job
							</Link>
						</div>
					) : (
						<div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
							<ul className="divide-y divide-[#E2E8F0]">
								{jobs.map((job) => (
									<li key={job.id}>
										<Link
											href={`/jobs/${job.id}/applicants`}
											className="flex flex-wrap items-center justify-between gap-4 p-4 hover:bg-[#F8FAFC] transition"
										>
											<div>
												<p className="font-medium text-[#0F172A]">{job.title}</p>
												<p className="text-sm text-[#64748B]">
													{job.applicationsCount} applicant{job.applicationsCount !== 1 ? "s" : ""}
												</p>
											</div>
											<span className={`text-xs px-2 py-1 rounded-full ${
												job.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
											}`}>
												{job.status}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
