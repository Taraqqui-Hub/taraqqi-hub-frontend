import { useEffect, useState, MouseEvent } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
	MapPin,
	Briefcase,
	DollarSign,
	Clock,
	Building2,
	Bookmark,
	Zap,
	Star,
	ArrowRight,
	Trash2,
} from "lucide-react";

interface Job {
	id: string;
	uuid: string;
	title: string;
	slug: string;
	jobType: string;
	category: string | null;
	city: string | null;
	area: string | null;
	state: string | null;
	locationType: string | null;
	salaryMin: string | null;
	salaryMax: string | null;
	salaryType: string | null;
	hideSalary: boolean | null;
	minExperienceYears: number | null;
	maxExperienceYears: number | null;
	publishedAt: string | null;
	status: string;
	expiresAt: string | null;
	savedAt: string;
	company: {
		brandName: string | null;
		companyName: string | null;
		logoUrl: string | null;
	} | null;
	hasApplied?: boolean;
}

export default function SavedJobsPage() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadSavedJobs();
	}, []);

	const loadSavedJobs = async () => {
		setLoading(true);
		try {
			const response = await api.get("/saved-jobs");
			console.log("Saved Jobs Response:", response);
			
			const data = response.data;
			if (Array.isArray(data)) {
				setJobs(data);
			} else if (data && Array.isArray(data.payload)) {
				// Handle case where API wraps response
				setJobs(data.payload);
			} else {
				console.warn("Unexpected saved jobs data format:", data);
				setJobs([]);
			}
		} catch (err) {
			console.error("Failed to load saved jobs", err);
		} finally {
			setLoading(false);
		}
	};

	const removeSavedJob = async (jobId: string, e: MouseEvent) => {
		e.preventDefault(); // Prevent navigation if clicking card
		e.stopPropagation();
		
		if (!confirm("Are you sure you want to remove this job from saved list?")) return;

		try {
			await api.delete(`/saved-jobs/${jobId}`);
			setJobs(prev => prev.filter(job => job.id !== jobId && job.uuid !== jobId));
		} catch (err) {
			console.error("Failed to remove saved job", err);
			alert("Failed to remove job");
		}
	};

	const formatSalary = (min: string | null, max: string | null, type: string | null, hide: boolean | null) => {
		if (hide) return "Not disclosed";
		if (!min && !max) return "Not specified";
		const minVal = min ? parseInt(min) : null;
		const maxVal = max ? parseInt(max) : null;
		const unit = type === "monthly" ? "/mo" : type === "yearly" ? " LPA" : "";
		const currency = "₹";

		if (minVal && maxVal) {
			return `${currency}${compactNumber(minVal)} - ${currency}${compactNumber(maxVal)}${unit}`;
		}
		if (minVal) return `${currency}${compactNumber(minVal)}+${unit}`;
		if (maxVal) return `Up to ${currency}${compactNumber(maxVal)}${unit}`;
		return "Not specified";
	};

	const compactNumber = (num: number) => {
		if (num >= 100000) return `${(num / 100000).toFixed(1).replace(/\.0$/, '')}L`;
		if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
		return num.toString();
	};

	const formatExperience = (min: number | null, max: number | null) => {
		if (min === 0 && (max === 0 || max === null)) return "Fresher";
		if (min === null && max === null) return "Exp. N/A";
		if (min !== null && max !== null) return `${min}-${max} Yrs`;
		if (min !== null) return `${min}+ Yrs`;
		return `Up to ${max} Yrs`;
	};

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<DashboardLayout>
				<div className="max-w-5xl mx-auto">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold text-slate-900">Saved Jobs</h1>
							<p className="text-slate-500 text-sm mt-1">
								You have saved {jobs.length} job{jobs.length !== 1 ? 's' : ''}
							</p>
						</div>
					</div>

					{loading ? (
						<div className="space-y-4">
							{[1, 2, 3].map(i => (
								<div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
									<div className="h-6 bg-slate-100 rounded w-2/3 mb-4"></div>
									<div className="h-4 bg-slate-100 rounded w-1/3 mb-6"></div>
									<div className="flex gap-4">
										<div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
										<div className="h-8 w-20 bg-slate-100 rounded-lg"></div>
									</div>
								</div>
							))}
						</div>
					) : jobs.length > 0 ? (
						<div className="space-y-4">
							{jobs.map((job) => {
								const isActive = job.status === "active";
								return (
								<div 
									key={job.id}
									className={`group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 relative ${!isActive ? 'opacity-75 grayscale bg-slate-50' : ''}`}
								>
									{/* Inactive Badge */}
									{!isActive && (
										<div className="absolute top-0 right-0 bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-slate-200 rounded-tr-2xl flex items-center gap-1 z-10">
											<Clock size={10} /> INACTIVE
										</div>
									)}
									
									<div className="flex gap-4">
										{/* Logo Placeholder */}
										<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm p-2">
											{job.company?.logoUrl ? (
												<img src={job.company.logoUrl} alt={job.company.companyName || "Company"} className="w-full h-full object-contain" />
											) : (
												<Building2 className="text-slate-400" size={24} />
											)}
										</div>

										<div className="flex-1 min-w-0">
											<div className="flex justify-between items-start">
												<div>
													<Link href={`/jobs/${job.uuid}`} className={`block ${!isActive ? 'pointer-events-none' : ''}`}>
														<h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
															{job.title}
														</h3>
													</Link>
													<p className="text-sm font-medium text-slate-600 mb-2">{job.category || "Technology Company"}</p>
												</div>
												{/* Remove Action */}
												<button 
													onClick={(e) => removeSavedJob(job.id, e)}
													className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors relative z-20"
													title="Remove from saved jobs"
												>
													<Trash2 size={20} />
												</button>
											</div>

											{/* Meta Tags */}
											<div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-slate-500 mb-4">
												{job.city && (
													<span className="flex items-center gap-1">
														<MapPin size={14} /> {job.city}{job.area ? `, ${job.area}` : ''}
													</span>
												)}
												<span className="flex items-center gap-1">
													<Briefcase size={14} /> {formatExperience(job.minExperienceYears, job.maxExperienceYears)}
												</span>
												{!job.hideSalary && (job.salaryMin || job.salaryMax) && (
													<span className="flex items-center gap-1 font-medium text-slate-700">
														<DollarSign size={14} /> {formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.hideSalary)}
													</span>
												)}
												{job.savedAt && (
													<span className="flex items-center gap-1 text-slate-400">
														<Clock size={14} /> Saved {new Date(job.savedAt).toLocaleDateString()}
													</span>
												)}
											</div>

											{/* Footer */}
											<div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
												<div className="flex items-center gap-2">
													{job.hasApplied && (
														<span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">
															Applied
														</span>
													)}
												</div>
												
												{isActive && (
													<Link href={`/jobs/${job.uuid}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/link">
														View Details <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
													</Link>
												)}
												{!isActive && (
													<span className="text-sm font-semibold text-slate-400 flex items-center gap-1 cursor-not-allowed">
														No longer accepting applications
													</span>
												)}
											</div>
										</div>
									</div>
								</div>
								);
							})}
						</div>
					) : (
						<div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
							<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
								<Bookmark className="w-10 h-10 text-slate-300" />
							</div>
							<h3 className="text-xl font-bold text-slate-900 mb-2">No saved jobs</h3>
							<p className="text-slate-500 mb-8 max-w-md mx-auto">
								You haven't saved any jobs yet. Browse jobs and save them to view them later.
							</p>
							<Link
								href="/jobs"
								className="inline-flex px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-lg"
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
