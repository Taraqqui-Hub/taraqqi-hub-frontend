/**
 * My Applications Page
 * Modern, minimalistic, and clear design for tracking job functionality
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import {
	MapPin,
	Briefcase,
	DollarSign,
	Clock,
	CheckCircle2,
	Eye,
	FileText,
	MoreHorizontal,
	Building2,
	ChevronDown,
	ChevronUp,
	Calendar
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
		description?: string | null;
		salaryMin: string | null;
		salaryMax: string | null;
	};
}

const statusConfig: Record<
	string,
	{ label: string; color: string; bg: string; border: string; description: string }
> = {
	pending: {
		label: "Applied",
		color: "text-blue-600",
		bg: "bg-blue-50",
		border: "border-blue-200",
		description: "Application submitted",
	},
	reviewed: {
		label: "Viewed",
		color: "text-purple-600",
		bg: "bg-purple-50",
		border: "border-purple-200",
		description: "Profile viewed",
	},
	shortlisted: {
		label: "Shortlisted",
		color: "text-amber-600",
		bg: "bg-amber-50",
		border: "border-amber-200",
		description: "You are shortlisted",
	},
	interview: {
		label: "Interview",
		color: "text-indigo-600",
		bg: "bg-indigo-50",
		border: "border-indigo-200",
		description: "Interview scheduled",
	},
	offered: {
		label: "Offer",
		color: "text-emerald-600",
		bg: "bg-emerald-50",
		border: "border-emerald-200",
		description: "Offer received",
	},
	hired: {
		label: "Hired",
		color: "text-green-600",
		bg: "bg-green-50",
		border: "border-green-200",
		description: "You are hired!",
	},
	rejected: {
		label: "Not Selected",
		color: "text-red-600",
		bg: "bg-red-50",
		border: "border-red-200",
		description: "Application declined",
	},
	withdrawn: {
		label: "Withdrawn",
		color: "text-slate-500",
		bg: "bg-slate-100",
		border: "border-slate-200",
		description: "You withdrew application",
	},
};

export default function ApplicationsPage() {
	const { user } = useAuthStore();
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [withdrawing, setWithdrawing] = useState<string | null>(null);
	const [expandedApp, setExpandedApp] = useState<string | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>("all");

	useEffect(() => {
		if (user) {
			loadApplications();
		}
	}, [user]);

	const loadApplications = async () => {
		try {
			const response = await api.get("/applications");
			console.log('API Response:', response);
			// Handle potential variations in response structure
			const data = response.data || response;
			console.log('Data object:', data);
			
			const apps = data?.applications || data?.payload?.applications || [];
			console.log('Extracted apps:', apps);
			
			setApplications(apps);
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
		
		const format = (n: number) => {
			if (n >= 100000) return `${(n / 100000).toFixed(1).replace('.0', '')}L`;
			if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
			return n.toString();
		};

		if (minVal && maxVal) return `₹${format(minVal)} - ₹${format(maxVal)}`;
		if (minVal) return `₹${format(minVal)}+`;
		if (maxVal) return `Up to ₹${format(maxVal)}`;
		return "Not specified";
	};

	const getStatusTimeline = (status: string) => {
		const steps = [
			{ key: "pending", label: "Applied" },
			{ key: "reviewed", label: "Viewed" },
			{ key: "shortlisted", label: "Shortlisted" },
			{ key: "interview", label: "Interview" },
			{ key: "offered", label: "Offer" },
			{ key: "hired", label: "Hired" },
		];
		
		// Find current step index
		let currentIndex = steps.findIndex(s => s.key === status);
		if (status === "rejected" || status === "withdrawn") currentIndex = -1; // Handle separately or show as stopped
		
		// Map to timeline objects
		return steps.map((step, idx) => ({
			...step,
			completed: currentIndex >= idx,
			current: currentIndex === idx
		}));
	};

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<DashboardLayout>
				<div className="max-w-5xl mx-auto px-4 py-8">
					{/* Header */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
						<div>
							<h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Applications</h1>
							<p className="text-slate-500 mt-1">Track the status of your job applications</p>
						</div>
						<div className="flex items-center gap-3">
							<Link
								href="/jobs"
								className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow"
							>
								<Briefcase className="w-4 h-4 mr-2" />
								Browse Jobs
							</Link>
						</div>
					</div>

					{/* Stats / Filter Tabs */}
					<div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
						<div className="flex items-center gap-2">
							<button
								onClick={() => setFilterStatus("all")}
								className={`
									px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
									${filterStatus === "all" 
										? "bg-indigo-600 text-white shadow-sm" 
										: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
								`}
							>
								All Applications <span className="ml-1 opacity-60 text-xs">({applications.length})</span>
							</button>
							{Object.keys(statusConfig).map((status) => {
								const count = applications.filter((app) => app.status === status).length;
								if (count === 0) return null;
								return (
									<button
										key={status}
										onClick={() => setFilterStatus(status)}
										className={`
											px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
											${filterStatus === status
												? "bg-indigo-600 text-white shadow-sm"
												: "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"}
										`}
									>
										{statusConfig[status].label} <span className="ml-1 opacity-60 text-xs">({count})</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* List */}
					{loading ? (
						<div className="text-center py-20">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
							<p className="mt-4 text-slate-500 text-sm">Loading your applications...</p>
						</div>
					) : filteredApplications.length > 0 ? (
						<div className="space-y-4">
							{filteredApplications.map((app) => {
								const statusInfo = statusConfig[app.status] || statusConfig.pending;
								const isExpanded = expandedApp === app.id;
								const timeline = getStatusTimeline(app.status);

								return (
									<div 
										key={app.id}
										className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
									>
										{/* Card Header & Main Info */}
										<div className="p-5 sm:p-6">
											<div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
												<div className="flex gap-4">
													<div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
														<Building2 className="w-6 h-6 text-slate-400" />
													</div>
													<div>
														<Link href={`/jobs/${app.job.uuid}`}>
															<h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
																{app.job.title}
															</h3>
														</Link>
														<div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1.5 text-sm text-slate-500">
															{app.job.city && (
																<span className="flex items-center gap-1.5">
																	<MapPin className="w-3.5 h-3.5" />
																	{app.job.city}
																</span>
															)}
															<span className="flex items-center gap-1.5 capitalize">
																<Briefcase className="w-3.5 h-3.5" />
																{app.job.jobType.replace(/_/g, " ")}
															</span>
															{(app.job.salaryMin || app.job.salaryMax) && (
																<span className="flex items-center gap-1.5">
																	<DollarSign className="w-3.5 h-3.5" />
																	{formatSalary(app.job.salaryMin, app.job.salaryMax)}
																</span>
															)}
														</div>
													</div>
												</div>
												
												<div className={`
													self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
													${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}
												`}>
													{statusInfo.label}
												</div>
											</div>

											{/* Timeline / Progress - Clear & Minimal */}
											{app.status !== 'withdrawn' && app.status !== 'rejected' && (
												<div className="mb-6 relative hidden sm:block">
													<div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 rounded-full" />
													<div className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-1000"
														style={{ width: `${(Math.max(0, timeline.filter(t => t.completed).length - 1) / (timeline.length - 1)) * 100}%` }}
													/>
													<div className="relative flex justify-between px-1">
														{timeline.map((step, idx) => (
															<div key={idx} className="relative flex flex-col items-center group">
																<div className={`
																	w-3 h-3 rounded-full ring-4 ring-white z-10 transition-all duration-300
																	${step.completed ? "bg-indigo-600" : "bg-slate-200"}
																`} />
																<span className={`
																	absolute top-6 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors
																	${step.current ? "text-indigo-600 font-bold" : step.completed ? "text-slate-900" : "text-slate-400"}
																	-translate-x-1/2 left-1/2
																`}>
																	{step.label}
																</span>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Mobile Status Text (if timeline hidden or simple view needed) */}
											<div className="sm:hidden mb-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
												Status: <span className="font-medium text-slate-900">{statusInfo.description}</span>
											</div>

											{/* Footer Action Bar */}
											<div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
												<div className="text-xs text-slate-400 font-medium flex items-center gap-1">
													<Clock className="w-3.5 h-3.5" />
													Applied on {new Date(app.appliedAt).toLocaleDateString(undefined, {
														year: 'numeric',
														month: 'short',
														day: 'numeric'
													})}
												</div>
												
												<div className="flex items-center gap-3">
													{canWithdraw(app.status) && (
														<button
															onClick={() => handleWithdraw(app.id)}
															disabled={withdrawing === app.id}
															className="text-sm text-slate-500 hover:text-red-600 transition-colors font-medium px-2 py-1"
														>
															{withdrawing === app.id ? "Withdrawing..." : "Withdraw"}
														</button>
													)}
													<button
														onClick={() => setExpandedApp(isExpanded ? null : app.id)}
														className="text-sm font-semibold text-slate-900 hover:text-indigo-600 flex items-center gap-1 transition-colors px-2 py-1"
													>
														{isExpanded ? "Less Details" : "View Details"}
														{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
													</button>
												</div>
											</div>
										</div>

										{/* Expandable Details */}
										{isExpanded && (
											<div className="bg-slate-50 border-t border-slate-100 p-5 sm:p-6 animate-in slide-in-from-top-2 duration-200">
												<div className="grid md:grid-cols-2 gap-6">
													{app.coverLetter && (
														<div>
															<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
																<FileText className="w-3 h-3" /> Cover Letter
															</h4>
															<div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 leading-relaxed max-h-60 overflow-y-auto">
																{app.coverLetter}
															</div>
														</div>
													)}
													
													<div>
														<h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
															<CheckCircle2 className="w-3 h-3" /> Application Details
														</h4>
														<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
															{app.expectedSalary && (
																<div className="flex justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
																	<span className="text-sm text-slate-500">Expected Salary</span>
																	<span className="text-sm font-semibold text-slate-900">₹{app.expectedSalary}</span>
																</div>
															)}
															{app.noticePeriodDays !== null && (
																<div className="flex justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
																	<span className="text-sm text-slate-500">Notice Period</span>
																	<span className="text-sm font-semibold text-slate-900">{app.noticePeriodDays} Days</span>
																</div>
															)}
															<div className="flex justify-between p-3 hover:bg-slate-50/50 transition-colors">
																<span className="text-sm text-slate-500">Resume</span>
																<span className="text-sm font-semibold text-indigo-600 cursor-pointer hover:underline">View Resume</span>
															</div>
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
						<div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
							<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
								<Briefcase className="w-8 h-8 text-slate-300" />
							</div>
							<h3 className="text-lg font-bold text-slate-900 mb-1">No applications found</h3>
							<p className="text-slate-500 mb-6 max-w-sm mx-auto">
								{filterStatus === "all" 
									? "You haven't applied to any jobs yet. Start your journey today!" 
									: `No applications with status "${statusConfig[filterStatus]?.label}" found.`}
							</p>
							{filterStatus === "all" ? (
								<Link
									href="/jobs"
									className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all"
								>
									Browse Opportunities
								</Link>
							) : (
								<button
									onClick={() => setFilterStatus("all")}
									className="inline-flex items-center px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
								>
									Clear Filters
								</button>
							)}
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
