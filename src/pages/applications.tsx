/**
 * My Applications Page - Enhanced
 * View and manage job applications with detailed tracking
 * LinkedIn/Naukri style application management
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
	MapPin,
	Briefcase,
	DollarSign,
	Clock,
	CheckCircle2,
	XCircle,
	Eye,
	FileText,
	Calendar,
	Send,
	UserCheck,
	MessageSquare,
	Trophy,
	X,
} from "lucide-react";

interface Application {
	id: string;
	uuid: string;
	status: string;
	appliedAt: string;
	viewedAt: string | null;
	statusChangedAt: string | null;
	coverLetter: string | null;
	expectedSalary: string | null;
	noticePeriodDays: number | null;
	job: {
		id: string;
		uuid: string;
		title: string;
		slug: string;
		city: string | null;
		jobType: string;
		description: string | null;
		salaryMin: string | null;
		salaryMax: string | null;
	};
}

const statusConfig: Record<
	string,
	{ label: string; color: string; icon: any; description: string }
> = {
	pending: {
		label: "Applied",
		color: "bg-yellow-100 text-yellow-700 border-yellow-200",
		icon: Send,
		description: "Your application has been submitted",
	},
	reviewed: {
		label: "Viewed",
		color: "bg-blue-100 text-blue-700 border-blue-200",
		icon: Eye,
		description: "Employer has viewed your profile",
	},
	shortlisted: {
		label: "Shortlisted",
		color: "bg-green-100 text-green-700 border-green-200",
		icon: UserCheck,
		description: "You've been shortlisted for this role",
	},
	interview: {
		label: "Interview",
		color: "bg-indigo-100 text-indigo-700 border-indigo-200",
		icon: MessageSquare,
		description: "Interview scheduled",
	},
	offered: {
		label: "Offer Received",
		color: "bg-emerald-100 text-emerald-700 border-emerald-200",
		icon: Trophy,
		description: "You've received an offer",
	},
	hired: {
		label: "Selected",
		color: "bg-green-200 text-green-800 border-green-300",
		icon: CheckCircle2,
		description: "Congratulations! You've been selected",
	},
	rejected: {
		label: "Rejected",
		color: "bg-red-100 text-red-700 border-red-200",
		icon: XCircle,
		description: "Application was not successful",
	},
	withdrawn: {
		label: "Withdrawn",
		color: "bg-slate-100 text-slate-600 border-slate-200",
		icon: X,
		description: "You withdrew this application",
	},
};

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [withdrawing, setWithdrawing] = useState<string | null>(null);
	const [expandedApp, setExpandedApp] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>("all");

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

	const filteredApplications = filterStatus === "all"
		? applications
		: applications.filter((app) => app.status === filterStatus);

	const formatSalary = (min: string | null, max: string | null) => {
		if (!min && !max) return "Not specified";
		const minVal = min ? parseInt(min) : null;
		const maxVal = max ? parseInt(max) : null;
		if (minVal && maxVal) return `₹${minVal} - ₹${maxVal}`;
		if (minVal) return `₹${minVal}+`;
		if (maxVal) return `Up to ₹${maxVal}`;
		return "Not specified";
	};

	const getStatusTimeline = (status: string) => {
		const timeline = [
			{ key: "pending", label: "Applied", completed: true },
			{ key: "reviewed", label: "Viewed", completed: ["reviewed", "shortlisted", "interview", "offered", "hired"].includes(status) },
			{ key: "shortlisted", label: "Shortlisted", completed: ["shortlisted", "interview", "offered", "hired"].includes(status) },
			{ key: "interview", label: "Interview", completed: ["interview", "offered", "hired"].includes(status) },
			{ key: "offered", label: "Offer", completed: ["offered", "hired"].includes(status) },
			{ key: "hired", label: "Selected", completed: status === "hired" },
		];
		return timeline;
	};

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<DashboardLayout>
				<div className="max-w-6xl mx-auto px-4 py-6">
					{/* Header */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
						<div>
							<h1 className="text-3xl font-bold text-slate-900 mb-1">My Applications</h1>
							<p className="text-slate-600">Track and manage your job applications</p>
						</div>
						<Link
							href="/jobs"
							className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
						>
							<Briefcase className="w-4 h-4" />
							Browse Jobs
						</Link>
					</div>

					{/* Filter Tabs */}
					{applications.length > 0 && (
						<div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-2">
							<button
								onClick={() => setFilterStatus("all")}
								className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
									filterStatus === "all"
										? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
										: "text-slate-600 hover:text-slate-900"
								}`}
							>
								All ({applications.length})
							</button>
							{Object.keys(statusConfig).map((status) => {
								const count = applications.filter((app) => app.status === status).length;
								if (count === 0) return null;
								return (
									<button
										key={status}
										onClick={() => setFilterStatus(status)}
										className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
											filterStatus === status
												? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
												: "text-slate-600 hover:text-slate-900"
										}`}
									>
										{statusConfig[status].label} ({count})
									</button>
								);
							})}
						</div>
					)}

					{loading ? (
						<div className="flex justify-center items-center py-24">
							<div className="relative">
								<div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
								<div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
							</div>
						</div>
					) : filteredApplications.length > 0 ? (
						<div className="space-y-4">
							{filteredApplications.map((app) => {
								const statusInfo = statusConfig[app.status] || statusConfig.pending;
								const StatusIcon = statusInfo.icon;
								const isExpanded = expandedApp === app.id;

								return (
									<div
										key={app.id}
										className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
									>
										{/* Main Card */}
										<div className="p-6">
											<div className="flex items-start justify-between gap-4">
												<div className="flex-1 min-w-0">
													{/* Job Title */}
													<Link
														href={`/jobs/${app.job.uuid}`}
														className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors block mb-2"
													>
														{app.job.title}
													</Link>

													{/* Job Details */}
													<div className="flex flex-wrap items-center gap-4 text-slate-600 text-sm mb-3">
														{app.job.city && (
															<div className="flex items-center gap-1.5">
																<MapPin className="w-4 h-4 text-slate-400" />
																<span>{app.job.city}</span>
															</div>
														)}
														<div className="flex items-center gap-1.5">
															<Briefcase className="w-4 h-4 text-slate-400" />
															<span className="capitalize">{app.job.jobType?.replace("_", " ")}</span>
														</div>
														{(app.job.salaryMin || app.job.salaryMax) && (
															<div className="flex items-center gap-1.5">
																<DollarSign className="w-4 h-4 text-slate-400" />
																<span>{formatSalary(app.job.salaryMin, app.job.salaryMax)}</span>
															</div>
														)}
													</div>

													{/* Status Badge */}
													<div className="flex items-center gap-3 mb-4">
														<span
															className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${statusInfo.color}`}
														>
															<StatusIcon className="w-4 h-4" />
															{statusInfo.label}
														</span>
														<span className="text-xs text-slate-500">
															{statusInfo.description}
														</span>
													</div>

													{/* Timeline */}
													<div className="mt-4 pt-4 border-t border-slate-100">
														<div className="flex items-center gap-2">
															{getStatusTimeline(app.status).map((step, idx, arr) => {
																const isLast = idx === arr.length - 1;
																return (
																	<div key={step.key} className="flex items-center">
																		<div
																			className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
																				step.completed
																					? "bg-indigo-600 text-white"
																					: "bg-slate-100 text-slate-400"
																			}`}
																		>
																			{step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
																		</div>
																		{!isLast && (
																			<div
																				className={`w-12 h-0.5 ${
																					step.completed ? "bg-indigo-600" : "bg-slate-200"
																				}`}
																			/>
																		)}
																	</div>
																);
															})}
														</div>
														<div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
															<span>
																Applied: {new Date(app.appliedAt).toLocaleDateString()}
															</span>
															{app.viewedAt && (
																<span className="text-green-600 flex items-center gap-1">
																	<Eye className="w-3 h-3" />
																	Viewed {new Date(app.viewedAt).toLocaleDateString()}
																</span>
															)}
															{app.statusChangedAt && (
																<span>
																	Updated: {new Date(app.statusChangedAt).toLocaleDateString()}
																</span>
															)}
														</div>
													</div>
												</div>

												{/* Actions */}
												<div className="flex flex-col items-end gap-2">
													{canWithdraw(app.status) && (
														<button
															onClick={() => handleWithdraw(app.id)}
															disabled={withdrawing === app.id}
															className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
														>
															{withdrawing === app.id ? "Withdrawing..." : "Withdraw"}
														</button>
													)}
													<button
														onClick={() => setExpandedApp(isExpanded ? null : app.id)}
														className="px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
													>
														{isExpanded ? "Hide Details" : "View Details"}
													</button>
												</div>
											</div>
										</div>

										{/* Expanded Details */}
										{isExpanded && (
											<div className="px-6 pb-6 pt-0 border-t border-slate-100 bg-slate-50">
												<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
													{app.coverLetter && (
														<div>
															<h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
																<FileText className="w-4 h-4" />
																Cover Letter
															</h4>
															<p className="text-slate-700 text-sm whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200">
																{app.coverLetter}
															</p>
														</div>
													)}
													<div>
														<h4 className="font-semibold text-slate-900 mb-2">Application Details</h4>
														<div className="space-y-2 text-sm bg-white p-3 rounded-lg border border-slate-200">
															{app.expectedSalary && (
																<div className="flex justify-between">
																	<span className="text-slate-600">Expected Salary:</span>
																	<span className="text-slate-900 font-medium">₹{app.expectedSalary}</span>
																</div>
															)}
															{app.noticePeriodDays !== null && (
																<div className="flex justify-between">
																	<span className="text-slate-600">Notice Period:</span>
																	<span className="text-slate-900 font-medium">{app.noticePeriodDays} days</span>
																</div>
															)}
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					) : (
						<div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
							<FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
							<h3 className="text-lg font-bold text-slate-900 mb-2">
								{filterStatus === "all" ? "No applications yet" : `No ${statusConfig[filterStatus]?.label || filterStatus} applications`}
							</h3>
							<p className="text-slate-600 mb-6">
								{filterStatus === "all"
									? "Start applying to jobs to see your applications here"
									: "Try adjusting your filter"}
							</p>
							{filterStatus === "all" ? (
								<Link
									href="/jobs"
									className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
								>
									<Briefcase className="w-5 h-5" />
									Browse Jobs
								</Link>
							) : (
								<button
									onClick={() => setFilterStatus("all")}
									className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
								>
									View All Applications
								</button>
							)}
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
