/**
 * My Applications Page
 * View and manage job applications - Professional design
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Application {
	id: string;
	uuid: string;
	status: string;
	appliedAt: string;
	viewedAt: string | null;
	job: {
		id: string;
		uuid: string;
		title: string;
		city: string;
		jobType: string;
	};
}

const statusColors: Record<string, string> = {
	pending: "bg-yellow-100 text-yellow-700",
	reviewed: "bg-blue-100 text-[#2563EB]",
	shortlisted: "bg-green-100 text-green-700",
	interview: "bg-blue-100 text-[#2563EB]",
	offered: "bg-emerald-100 text-emerald-700",
	hired: "bg-green-200 text-green-800",
	rejected: "bg-red-100 text-red-700",
	withdrawn: "bg-[#F1F5F9] text-[#64748B]",
};

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [withdrawing, setWithdrawing] = useState<string | null>(null);

	useEffect(() => {
		loadApplications();
	}, []);

	const loadApplications = async () => {
		try {
			const response = await api.get("/applications");
			setApplications(response.data.applications || []);
		} catch (err) {
			console.error("Failed to load applications", err);
		} finally {
			setLoading(false);
		}
	};

	const handleWithdraw = async (id: string) => {
		if (!confirm("Are you sure you want to withdraw this application?")) {
			return;
		}

		setWithdrawing(id);
		try {
			await api.delete(`/applications/${id}`);
			loadApplications();
		} catch (err: any) {
			alert(err.response?.data?.error || "Failed to withdraw application");
		} finally {
			setWithdrawing(null);
		}
	};

	const canWithdraw = (status: string) => {
		return ["pending", "reviewed", "shortlisted"].includes(status);
	};

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker"]}>
			<DashboardLayout>
				<div className="max-w-4xl mx-auto">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-bold text-[#0F172A]">My Applications</h1>
						<Link
							href="/jobs"
							className="px-4 py-2 bg-[#2563EB] text-white rounded-md text-sm hover:bg-[#1E40AF]"
						>
							Browse Jobs
						</Link>
					</div>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : applications.length > 0 ? (
						<div className="space-y-4">
							{applications.map((app) => (
								<div
									key={app.id}
									className="bg-white rounded-lg p-5 shadow-sm border border-[#E2E8F0]"
								>
									<div className="flex items-start justify-between">
										<div className="flex-1">
											<Link
												href={`/jobs/${app.job.uuid}`}
												className="text-lg font-semibold text-[#0F172A] hover:text-[#2563EB]"
											>
												{app.job.title}
											</Link>
											<div className="flex items-center text-sm text-[#64748B] mt-1 gap-3">
												<span>📍 {app.job.city}</span>
												<span className="capitalize">{app.job.jobType?.replace("_", " ")}</span>
											</div>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
												statusColors[app.status] || "bg-[#F1F5F9] text-[#64748B]"
											}`}
										>
											{app.status}
										</span>
									</div>

									<div className="mt-4 flex items-center justify-between text-sm">
										<div className="text-[#64748B]">
											Applied {new Date(app.appliedAt).toLocaleDateString()}
											{app.viewedAt && (
												<span className="ml-3 text-green-600">
													✓ Viewed by employer
												</span>
											)}
										</div>

										{canWithdraw(app.status) && (
											<button
												onClick={() => handleWithdraw(app.id)}
												disabled={withdrawing === app.id}
												className="text-red-600 hover:text-red-700 disabled:opacity-50"
											>
												{withdrawing === app.id ? "Withdrawing..." : "Withdraw"}
											</button>
										)}
									</div>

									{/* Status Timeline */}
									<div className="mt-4 pt-4 border-t border-[#E2E8F0]">
										<div className="flex items-center text-xs">
											{["pending", "reviewed", "shortlisted", "interview", "offered", "hired"].map(
												(step, i, arr) => {
													const current =
														arr.indexOf(app.status) >= i || app.status === "hired";
													const isRejected = app.status === "rejected";
													const isWithdrawn = app.status === "withdrawn";

													return (
														<div key={step} className="flex items-center">
															<div
																className={`w-6 h-6 rounded-full flex items-center justify-center ${
																	isRejected || isWithdrawn
																		? "bg-[#E2E8F0]"
																		: current
																		? "bg-[#2563EB] text-white"
																		: "bg-[#E2E8F0]"
																}`}
															>
																{current && !isRejected && !isWithdrawn ? "✓" : i + 1}
															</div>
															{i < arr.length - 1 && (
																<div
																	className={`w-8 h-0.5 ${
																		current && arr.indexOf(app.status) > i
																			? "bg-[#2563EB]"
																			: "bg-[#E2E8F0]"
																	}`}
																/>
															)}
														</div>
													);
												}
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-lg border border-[#E2E8F0]">
							<p className="text-[#64748B] mb-4">No applications yet</p>
							<Link
								href="/jobs"
								className="inline-block px-6 py-3 bg-[#2563EB] text-white rounded-md hover:bg-[#1E40AF]"
							>
								Browse Jobs
							</Link>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
