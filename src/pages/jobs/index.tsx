/**
 * Browse Jobs Page
 * Modern, minimalistic, and intuitive design inspired by LinkedIn/Naukri
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
	Search,
	MapPin,
	Briefcase,
	DollarSign,
	Clock,
	Filter,
	X,
	Check,
	ChevronDown,
	Building2,
	Bookmark,
	Zap,
	TrendingUp,
	Star,
	ArrowRight,
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
	roleSummary: string | null;
	skillsRequired: string[] | null;
	publishedAt: string | null;
	isFeatured: boolean | null;
	promotionType: string | null;
	isUrgentHighlight: boolean | null;
	expiresAt: string | null;
	viewsCount: number | null;
	applicationsCount: number | null;
	hasApplied?: boolean;
	isSaved?: boolean;
	badges: string[];
}

interface Filters {
	search: string;
	city: string;
	jobType: string[];
	locationType: string[];
	minSalary: string;
	maxSalary: string;
	minExperience: string;
	maxExperience: string;
}

export default function BrowseJobsPage() {
	const router = useRouter();
	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [showMobileFilters, setShowMobileFilters] = useState(false);
	
	// Enhanced filters state
	const [filters, setFilters] = useState<Filters>({
		search: "",
		city: "",
		jobType: [],
		locationType: [],
		minSalary: "",
		maxSalary: "",
		minExperience: "",
		maxExperience: "",
	});

	const [pagination, setPagination] = useState({
		total: 0,
		limit: 10,
		offset: 0,
		hasMore: false,
	});

	const [suggestedMode, setSuggestedMode] = useState(false);

	// Debounce search
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);

	// Initial load
	useEffect(() => {
		loadJobs();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Pagination load
	useEffect(() => {
		if (pagination.offset > 0) {
			loadJobs();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pagination.offset]);

	// Debounced filter effect
	useEffect(() => {
		if (searchTimeout.current) clearTimeout(searchTimeout.current);
		
		// Skip first render/initial load to avoid double fetching
		// We handle direct changes elsewhere or rely on this
		searchTimeout.current = setTimeout(() => {
			setPagination(prev => ({ ...prev, offset: 0 }));
			loadJobs(true);
		}, 600);
		
		return () => {
			if (searchTimeout.current) clearTimeout(searchTimeout.current);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters]);

	const loadJobs = async (reset = false) => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (filters.search) params.append("search", filters.search);
			if (filters.city) params.append("city", filters.city);
			
			// Handle array filters
			filters.jobType.forEach(t => params.append("jobType", t));
			filters.locationType.forEach(t => params.append("locationType", t));

			if (filters.minSalary) params.append("minSalary", filters.minSalary);
			if (filters.maxSalary) params.append("maxSalary", filters.maxSalary);
			if (filters.minExperience) params.append("minExperience", filters.minExperience);
			
			const currentOffset = reset ? 0 : pagination.offset;
			params.append("limit", pagination.limit.toString());
			params.append("offset", currentOffset.toString());

			const response = await api.get(`/jobs?${params.toString()}`);
			const data = response?.data;
			
			if (!data) throw new Error("No data received");

			let jobList: Job[] = [];
			if (data.payload?.jobs && Array.isArray(data.payload.jobs)) {
				jobList = data.payload.jobs;
			} else if (Array.isArray(data.payload)) {
				jobList = data.payload;
			} else if (Array.isArray(data.jobs)) {
				jobList = data.jobs;
			}

			// "Smart" suggestion logic:
			// If we filtered by city but found 0 results, suggest nearby (simulated by clearing city filter)
			// Only do this if we are not already in suggested mode and it's a reset search
			if (jobList.length === 0 && filters.city && !suggestedMode && reset) {
				setSuggestedMode(true);
				// Fetch without city
				const nearbyParams = new URLSearchParams();
				if (filters.search) nearbyParams.append("search", filters.search);
				// nearbyParams.delete("city"); // effectively skipping it
				filters.jobType.forEach(t => nearbyParams.append("jobType", t));
				filters.locationType.forEach(t => nearbyParams.append("locationType", t));
								if (filters.minSalary) nearbyParams.append("minSalary", filters.minSalary);
				if (filters.maxSalary) nearbyParams.append("maxSalary", filters.maxSalary);
				if (filters.minExperience) nearbyParams.append("minExperience", filters.minExperience);

				nearbyParams.append("limit", pagination.limit.toString());
				nearbyParams.append("offset", "0");

				const nearbyResponse = await api.get(`/jobs?${nearbyParams.toString()}`);
				const nearbyData = nearbyResponse?.data;
				
				if (nearbyData?.payload?.jobs) {
					jobList = nearbyData.payload.jobs;
					setJobs(jobList);
					const nearbyPagination = nearbyData.payload.pagination;
					if (nearbyPagination) {
						setPagination(prev => ({ ...prev, ...nearbyPagination, offset: 0 }));
					}
					// Exit early since we handled state
					setLoading(false);
					return;
				}
			}

			// If we found jobs, or failed to find nearby either
			if (reset && jobList.length > 0) setSuggestedMode(false);
			
			setJobs(prev => reset ? jobList : [...prev, ...jobList]);
			
			// Pagination logic
			const paginationData = data.payload?.pagination || data.pagination;
			if (paginationData) {
				setPagination(prev => ({ ...prev, ...paginationData, offset: currentOffset }));
			}
		} catch (err) {
			console.error("Failed to load jobs", err);
		} finally {
			setLoading(false);
		}
	};

	const toggleSave = async (e: React.MouseEvent, job: Job) => {
		e.preventDefault();
		e.stopPropagation();

		// Optimistic update
		const wasSaved = job.isSaved;
		setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isSaved: !wasSaved } : j));

		try {
			if (wasSaved) {
				await api.delete(`/saved-jobs/${job.uuid}`);
			} else {
				await api.post("/saved-jobs", { jobId: job.uuid });
			}
		} catch (error) {
			console.error("Failed to toggle save", error);
			// Revert on failure
			setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isSaved: wasSaved } : j));
		}
	};

	const toggleArrayFilter = (key: 'jobType' | 'locationType', value: string) => {
		setFilters(prev => {
			const current = prev[key];
			const updated = current.includes(value)
				? current.filter(item => item !== value)
				: [...current, value];
			return { ...prev, [key]: updated };
		});
	};

	const clearFilters = () => {
		setFilters({
			search: "",
			city: "",
			jobType: [],
			locationType: [],
			minSalary: "",
			maxSalary: "",
			minExperience: "",
			maxExperience: "",
		});
		setSuggestedMode(false);
	};

	const formatSalary = (min: string | null, max: string | null, type: string | null, hide: boolean | null) => {
		if (hide) return "Not disclosed";
		if (!min && !max) return "Not specified";
		const minVal = min ? parseInt(min) : null;
		const maxVal = max ? parseInt(max) : null;
		// Determine unit
		const unit = type === "monthly" ? "/mo" : type === "yearly" ? " LPA" : "";
		const currency = "₹"; 

		if (minVal && maxVal) {
			// Compact display: ₹3L - ₹5L or ₹20k - ₹30k
			return `${currency}${compactNumber(minVal)} - ${currency}${compactNumber(maxVal)}${unit}`;
		}
		if (minVal) return `${currency}${compactNumber(minVal)}+${unit}`;
		if (maxVal) return `Up to ${currency}${compactNumber(maxVal)}${unit}`;
		return "Not specified";
	};

	// Helper to make large numbers compact (e.g. 500000 -> 5L, 20000 -> 20k)
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

	// Mock stats for sidebar (would come from API in real world)
	const jobTypes = [
		{ id: "full-time", label: "Full Time" },
		{ id: "part-time", label: "Part Time" },
		{ id: "contract", label: "Contract" },
		{ id: "internship", label: "Internship" },
		{ id: "freelance", label: "Freelance" },
	];

	const locationTypes = [
		{ id: "onsite", label: "Onsite" },
		{ id: "remote", label: "Remote" },
		{ id: "hybrid", label: "Hybrid" },
	];

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<DashboardLayout>
				{/* Modern Header Section */}
				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
					<h1 className="text-2xl font-bold text-slate-900 mb-1">Find your dream job</h1>
					<p className="text-slate-500 text-sm mb-6">Browse through thousands of opportunities tailor-made for you</p>
					
					<div className="flex flex-col md:flex-row gap-3">
						<div className="flex-1 relative group">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
							<input
								type="text"
								placeholder="Job title, skills, or company"
								value={filters.search}
								onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
								className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
							/>
						</div>
						<div className="flex-1 relative group">
							<MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors h-5 w-5" />
							<input
								type="text"
								placeholder="City, state, or zip code"
								value={filters.city}
								onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
								className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
							/>
						</div>
						<button 
							onClick={() => loadJobs(true)}
							className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
						>
							Search Jobs
						</button>
					</div>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 items-start">
					{/* Mobile Filter Toggle */}
					<button 
						onClick={() => setShowMobileFilters(!showMobileFilters)}
						className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
					>
						<span className="flex items-center gap-2"><Filter size={18} /> Filters</span>
						<span className="text-sm bg-slate-100 px-2 py-1 rounded-md">{Object.values(filters).flat().filter(Boolean).length} Active</span>
					</button>

					{/* Sidebar Filters (Desktop & Mobile Drawer) */}
					<aside className={`
						${showMobileFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto p-4' : 'hidden'} 
						lg:block lg:w-72 lg:shrink-0
					`}>
						{showMobileFilters && (
							<div className="flex items-center justify-between mb-4 lg:hidden">
								<h2 className="text-xl font-bold">Filters</h2>
								<button onClick={() => setShowMobileFilters(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
							</div>
						)}

						<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-6 lg:sticky lg:top-24">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-slate-900 flex items-center gap-2">
									<Filter size={18} className="text-indigo-600" /> Filters
								</h3>
								<button onClick={clearFilters} className="text-xs font-medium text-slate-500 hover:text-indigo-600">
									Clear All
								</button>
							</div>

							{/* Job Type */}
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-slate-900">Job Type</h4>
								<div className="space-y-2">
									{jobTypes.map(type => (
										<label key={type.id} className="flex items-center gap-3 cursor-pointer group">
											<div className={`
												w-5 h-5 rounded border flex items-center justify-center transition-colors
												${filters.jobType.includes(type.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'}
											`}>
												{filters.jobType.includes(type.id) && <Check size={12} className="text-white" />}
											</div>
											<input 
												type="checkbox" 
												className="hidden" 
												checked={filters.jobType.includes(type.id)}
												onChange={() => toggleArrayFilter('jobType', type.id)}
											/>
											<span className="text-sm text-slate-600 group-hover:text-slate-900">{type.label}</span>
										</label>
									))}
								</div>
							</div>

							<hr className="border-slate-100" />

							{/* Work Mode */}
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-slate-900">Work Mode</h4>
								<div className="space-y-2">
									{locationTypes.map(type => (
										<label key={type.id} className="flex items-center gap-3 cursor-pointer group">
											<div className={`
												w-5 h-5 rounded border flex items-center justify-center transition-colors
												${filters.locationType.includes(type.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-400'}
											`}>
												{filters.locationType.includes(type.id) && <Check size={12} className="text-white" />}
											</div>
											<input 
												type="checkbox" 
												className="hidden"
												checked={filters.locationType.includes(type.id)}
												onChange={() => toggleArrayFilter('locationType', type.id)}
											/>
											<span className="text-sm text-slate-600 group-hover:text-slate-900">{type.label}</span>
										</label>
									))}
								</div>
							</div>

							<hr className="border-slate-100" />

							{/* Experience */}
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-slate-900">Experience (Years)</h4>
								<div className="flex gap-2">
									<input
										type="number"
										placeholder="Min"
										value={filters.minExperience}
										onChange={(e) => setFilters(prev => ({ ...prev, minExperience: e.target.value }))}
										className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
									/>
									<span className="text-slate-400 self-center">-</span>
									<input
										type="number"
										placeholder="Max"
										value={filters.maxExperience}
										onChange={(e) => setFilters(prev => ({ ...prev, maxExperience: e.target.value }))}
										className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
									/>
								</div>
							</div>

							<hr className="border-slate-100" />

							{/* Salary */}
							<div className="space-y-3">
								<h4 className="text-sm font-semibold text-slate-900">Salary Range (₹)</h4>
								<div className="flex flex-col gap-2">
									<input
										type="number"
										placeholder="Min Annual Salary"
										value={filters.minSalary}
										onChange={(e) => setFilters(prev => ({ ...prev, minSalary: e.target.value }))}
										className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
									/>
									<input
										type="number"
										placeholder="Max Annual Salary"
										value={filters.maxSalary}
										onChange={(e) => setFilters(prev => ({ ...prev, maxSalary: e.target.value }))}
										className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
									/>
								</div>
							</div>
						</div>
					</aside>

					{/* Main Feed */}
					<div className="flex-1 min-w-0 space-y-4">
						{/* Suggested Mode Banner */}
						{suggestedMode && (
							<div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
								<MapPin className="text-indigo-600 mt-0.5 shrink-0" size={20} />
								<div>
									<h4 className="font-semibold text-indigo-900">Expanding your search</h4>
									<p className="text-sm text-indigo-700 mt-1">
										We couldn't find exact matches for <strong>{filters.city}</strong>, so we're showing you jobs from nearby and other locations.
									</p>
								</div>
								<button 
									onClick={() => {
										setFilters(prev => ({ ...prev, city: "" }));
										setSuggestedMode(false);
										loadJobs(true);
									}}
									className="ml-auto text-indigo-600 hover:text-indigo-800"
								>
									<X size={18} />
								</button>
							</div>
						)}

						{/* Results Info */}
						<div className="flex items-center justify-between pb-2">
							<h2 className="text-slate-700 font-medium">
								{loading ? "Searching..." : (
									<>Found <span className="font-bold text-slate-900">{pagination.total}</span> jobs</>
								)}
							</h2>
							<div className="flex items-center gap-2 text-sm text-slate-500">
								<span>Sort by:</span>
								<select className="bg-transparent border-none font-medium text-slate-900 focus:ring-0 cursor-pointer py-0 pl-1">
									<option>Relevance</option>
									<option>Date Posted</option>
									<option>Salary: High to Low</option>
								</select>
							</div>
						</div>

						{/* Job List */}
						{loading && pagination.offset === 0 ? (
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
								{jobs.map((job) => (
									<div 
										key={job.id}
										className="group bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 relative"
									>
										{/* Highlight Badge */}
										{job.isUrgentHighlight && (
											<div className="absolute top-0 right-0 bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-red-100 rounded-tr-2xl flex items-center gap-1">
												<Zap size={10} /> URGENT
											</div>
										)}
										
										<div className="flex gap-4">
											{/* Logo Placeholder */}
											<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-sm p-2">
												{/* If we had a logo URL, we'd use Next Image here. Fallback to icon. */}
												<Building2 className="text-slate-400" size={24} />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-start">
													<div>
														<Link href={`/jobs/${job.uuid}`} className="block">
															<h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
																{job.title}
															</h3>
														</Link>
														<p className="text-sm font-medium text-slate-600 mb-2">{job.category || "Technology Company"}</p>
													</div>
													{/* Actions */}
													<button 
														onClick={(e) => toggleSave(e, job)}
														className={`p-2 rounded-full transition-colors ${
															job.isSaved 
																? "text-indigo-600 bg-indigo-50 hover:bg-indigo-100" 
																: "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
														}`}
													>
														<Bookmark size={20} fill={job.isSaved ? "currentColor" : "none"} />
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
													{job.publishedAt && (
														<span className="flex items-center gap-1 text-slate-400">
															<Clock size={14} /> {new Date(job.publishedAt).toLocaleDateString()}
														</span>
													)}
												</div>

												{/* Skills */}
												{job.skillsRequired && job.skillsRequired.length > 0 && (
													<div className="flex flex-wrap gap-2 mb-4">
														{job.skillsRequired.slice(0, 4).map((skill, idx) => (
															<span key={idx} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-colors">
																{skill}
															</span>
														))}
														{job.skillsRequired.length > 4 && (
															<span className="px-2 py-1 text-slate-400 text-xs">+ {job.skillsRequired.length - 4}</span>
														)}
													</div>
												)}

												{/* Footer */}
												<div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-50">
													<div className="flex items-center gap-2">
														{job.hasApplied && (
															<span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-md">
																<Check size={10} /> Applied
															</span>
														)}
														{job.badges.includes("Featured") && (
															<span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
																<Star size={10} /> Featured
															</span>
														)}
														<span className="text-xs text-slate-400">
															{job.applicationsCount || 0} applicants
														</span>
													</div>
													
													<Link href={`/jobs/${job.uuid}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group/link">
														View Details <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
													</Link>
												</div>
											</div>
										</div>
									</div>
								))}

								{/* Load More */}
								{pagination.hasMore && (
									<button
										onClick={() => {
											setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
										}}
										disabled={loading}
										className="w-full py-4 text-center text-indigo-600 font-medium hover:bg-indigo-50 rounded-xl transition-colors border border-dashed border-indigo-200 mt-4"
									>
										{loading ? "Loading..." : "Load More Jobs"}
									</button>
								)}
							</div>
						) : (
							<div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
								<div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
									<Search className="w-10 h-10 text-slate-300" />
								</div>
								<h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
								<p className="text-slate-500 mb-8 max-w-md mx-auto">
									We couldn't find any jobs matching your criteria. Try widening your search or clearing some filters.
								</p>
								<button
									onClick={clearFilters}
									className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-shadow shadow-md hover:shadow-lg"
								>
									Clear All Filters
								</button>
							</div>
						)}
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
