/**
 * Browse Jobs Page — Naukri-inspired, ultra-simple design
 * Smart matching: shows preferred jobs → area jobs → all jobs (auto-fallback)
 */

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
	Search,
	MapPin,
	Briefcase,
	Clock,
	Filter,
	X,
	Check,
	Building2,
	Bookmark,
	Zap,
	Star,
	ArrowRight,
	ChevronDown,
	ChevronUp,
	Target,
	Globe,
	Sparkles,
	RefreshCw,
	IndianRupee,
	GraduationCap,
	Users,
	TrendingUp,
	SlidersHorizontal,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

type MatchMode = "preferred_match" | "area_match" | "all_jobs" | "filtered";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const compactNumber = (num: number) => {
	if (num >= 100000) return `${(num / 100000).toFixed(1).replace(/\.0$/, "")}L`;
	if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
	return num.toString();
};

const formatSalary = (
	min: string | null,
	max: string | null,
	type: string | null,
	hide: boolean | null
) => {
	if (hide) return "Not Disclosed";
	if (!min && !max) return null;
	const minVal = min ? parseInt(min) : null;
	const maxVal = max ? parseInt(max) : null;
	let unit = "";
	switch (type) {
		case "daily": unit = "/day"; break;
		case "weekly": unit = "/week"; break;
		case "monthly": unit = "/month"; break;
		case "yearly": unit = " LPA"; break;
		default: unit = "";
	}
	if (minVal && maxVal) return `₹${compactNumber(minVal)} – ₹${compactNumber(maxVal)}${unit}`;
	if (minVal) return `₹${compactNumber(minVal)}+${unit}`;
	if (maxVal) return `Up to ₹${compactNumber(maxVal)}${unit}`;
	return null;
};

const formatExp = (min: number | null, max: number | null) => {
	if (min === 0 && (max === 0 || max === null)) return "Fresher";
	if (min === null && max === null) return null;
	if (min !== null && max !== null) return `${min}–${max} yrs`;
	if (min !== null) return `${min}+ yrs`;
	return `Up to ${max} yrs`;
};

const timeAgo = (date: string | null) => {
	if (!date) return null;
	const d = new Date(date);
	const diff = Math.floor((Date.now() - d.getTime()) / 1000);
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
	return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const JOB_TYPE_LABELS: Record<string, string> = {
	"full-time": "Full Time",
	"part-time": "Part Time",
	contract: "Contract",
	internship: "Internship",
	freelance: "Freelance",
};

const LOC_TYPE_LABELS: Record<string, string> = {
	onsite: "On-site",
	remote: "Remote",
	hybrid: "Hybrid",
};

// ─── Match mode banner config ────────────────────────────────────────────────

const matchBannerConfig = {
	preferred_match: {
		icon: <Target size={18} className="text-blue-600" />,
		bg: "bg-blue-50 border-blue-200",
		titleColor: "text-blue-800",
		msgColor: "text-blue-700",
		title: "Jobs matched to your profile",
		getMessage: (p: any) => {
			const parts: string[] = [];
			if (p?.city) parts.push(p.city);
			if (p?.jobTypes?.length) parts.push(p.jobTypes.join(", "));
			return parts.length
				? `Showing jobs for: ${parts.join(" · ")}`
				: "Based on your profile preferences";
		},
	},
	area_match: {
		icon: <MapPin size={18} className="text-green-600" />,
		bg: "bg-green-50 border-green-200",
		titleColor: "text-green-800",
		msgColor: "text-green-700",
		title: "Jobs near you",
		getMessage: (p: any) =>
			p?.city || p?.state
				? `Showing available jobs in ${[p.city, p.state].filter(Boolean).join(", ")}`
				: "Showing jobs in your area",
	},
	all_jobs: {
		icon: <Globe size={18} className="text-amber-600" />,
		bg: "bg-amber-50 border-amber-200",
		titleColor: "text-amber-800",
		msgColor: "text-amber-700",
		title: "Explore all jobs",
		getMessage: () =>
			"No location preference found — showing all available jobs. Complete your profile to see better matches!",
	},
	filtered: null,
};

// ─── Skeleton Card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
	<div className="browse-card animate-pulse">
		<div className="flex gap-4">
			<div className="w-14 h-14 bg-slate-200 rounded-xl shrink-0" />
			<div className="flex-1 space-y-3">
				<div className="h-5 bg-slate-200 rounded w-2/3" />
				<div className="h-4 bg-slate-200 rounded w-1/3" />
				<div className="flex gap-2">
					<div className="h-6 w-16 bg-slate-200 rounded-full" />
					<div className="h-6 w-20 bg-slate-200 rounded-full" />
					<div className="h-6 w-14 bg-slate-200 rounded-full" />
				</div>
			</div>
		</div>
	</div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
	job: Job;
	onToggleSave: (e: React.MouseEvent, job: Job) => void;
}

const JobCard = ({ job, onToggleSave }: JobCardProps) => {
	const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.hideSalary);
	const exp = formatExp(job.minExperienceYears, job.maxExperienceYears);
	const posted = timeAgo(job.publishedAt);

	return (
		<div className="browse-card group">
			{/* Urgent badge */}
			{job.isUrgentHighlight && (
				<div className="urgent-badge">
					<Zap size={10} /> Urgent
				</div>
			)}

			<div className="flex gap-3 sm:gap-4 items-start">
				{/* Company logo */}
				<div className="company-logo-box shrink-0">
					<Building2 size={22} className="text-slate-400" />
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					{/* Title row */}
					<div className="flex items-start justify-between gap-2 mb-0.5">
						<div className="min-w-0">
							<Link href={`/jobs/${job.uuid}`} className="block">
								<h3 className="job-title">{job.title}</h3>
							</Link>
							{job.category && (
								<p className="text-[13px] text-slate-500 font-medium mt-0.5 truncate">
									{job.category}
								</p>
							)}
						</div>
						<button
							onClick={(e) => onToggleSave(e, job)}
							aria-label={job.isSaved ? "Unsave job" : "Save job"}
							className={`save-btn shrink-0 ${job.isSaved ? "save-btn--saved" : ""}`}
						>
							<Bookmark size={18} fill={job.isSaved ? "currentColor" : "none"} />
						</button>
					</div>

					{/* Meta chips */}
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2 mb-3">
						{(job.city || job.state) && (
							<span className="meta-chip">
								<MapPin size={13} />
								{[job.city, job.area].filter(Boolean).join(", ") || job.state}
							</span>
						)}
						{exp && (
							<span className="meta-chip">
								<Briefcase size={13} />
								{exp}
							</span>
						)}
						{salary && (
							<span className="meta-chip meta-chip--salary">
								<IndianRupee size={13} />
								{salary}
							</span>
						)}
						<span className="meta-chip meta-chip--type">
							{JOB_TYPE_LABELS[job.jobType] || job.jobType}
						</span>
						{job.locationType && job.locationType !== "onsite" && (
							<span className="meta-chip meta-chip--remote">
								{LOC_TYPE_LABELS[job.locationType] || job.locationType}
							</span>
						)}
					</div>

					{/* Skills */}
					{job.skillsRequired && job.skillsRequired.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mb-3">
							{job.skillsRequired.slice(0, 5).map((s, i) => (
								<span key={i} className="skill-chip">{s}</span>
							))}
							{job.skillsRequired.length > 5 && (
								<span className="skill-chip text-slate-400">+{job.skillsRequired.length - 5}</span>
							)}
						</div>
					)}

					{/* Footer */}
					<div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
						<div className="flex items-center flex-wrap gap-2">
							{job.hasApplied && (
								<span className="status-pill status-pill--applied">
									<Check size={11} /> Applied
								</span>
							)}
							{job.badges.includes("Featured") && (
								<span className="status-pill status-pill--featured">
									<Star size={11} /> Featured
								</span>
							)}
							{posted && (
								<span className="text-xs text-slate-400 flex items-center gap-1">
									<Clock size={12} /> {posted}
								</span>
							)}
							{(job.applicationsCount ?? 0) > 0 && (
								<span className="text-xs text-slate-400 flex items-center gap-1">
									<Users size={12} /> {job.applicationsCount}
								</span>
							)}
						</div>
						<Link
							href={`/jobs/${job.uuid}`}
							className="view-details-link"
						>
							View <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrowseJobsPage() {
	const { t } = useTranslation();
	const router = useRouter();
	const { user } = useAuthStore();

	const [jobs, setJobs] = useState<Job[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [matchMode, setMatchMode] = useState<MatchMode>("filtered");
	const [preferenceProfile, setPreferenceProfile] = useState<any>(null);
	const [showFilters, setShowFilters] = useState(false);
	const [activeFiltersCount, setActiveFiltersCount] = useState(0);

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
		limit: 20,
		offset: 0,
		hasMore: false,
	});

	const searchDebounce = useRef<NodeJS.Timeout | null>(null);
	const didInit = useRef(false);

	// Count active filters
	useEffect(() => {
		const count = filters.jobType.length +
			filters.locationType.length +
			(filters.city ? 1 : 0) +
			(filters.search ? 1 : 0) +
			(filters.minSalary ? 1 : 0) +
			(filters.maxSalary ? 1 : 0) +
			(filters.minExperience ? 1 : 0) +
			(filters.maxExperience ? 1 : 0);
		setActiveFiltersCount(count);
	}, [filters]);

	// Parse response
	const parseResponse = (data: any): { jobList: Job[]; paginationData: any; matchMode: MatchMode; preferenceProfile: any } => {
		const payload = data?.payload || data;
		const jobList: Job[] = payload?.jobs ?? [];
		const paginationData = payload?.pagination ?? null;
		const mode: MatchMode = payload?.matchMode ?? "filtered";
		const prefProfile = payload?.preferenceProfile ?? null;
		return { jobList, paginationData, matchMode: mode, preferenceProfile: prefProfile };
	};

	const buildParams = useCallback((f: Filters, offset: number, limit: number) => {
		const params = new URLSearchParams();
		if (f.search) params.append("search", f.search);
		if (f.city) params.append("city", f.city);
		f.jobType.forEach((t) => params.append("jobType", t));
		f.locationType.forEach((t) => params.append("locationType", t));
		if (f.minSalary) params.append("minSalary", f.minSalary);
		if (f.maxSalary) params.append("maxSalary", f.maxSalary);
		if (f.minExperience) params.append("minExperience", f.minExperience);
		if (f.maxExperience) params.append("maxExperience", f.maxExperience);
		params.append("limit", String(limit));
		params.append("offset", String(offset));
		return params;
	}, []);

	const fetchJobs = useCallback(async (f: Filters, offset: number, reset: boolean) => {
		try {
			const params = buildParams(f, offset, pagination.limit);
			const res = await api.get(`/jobs?${params.toString()}`);
			return parseResponse(res?.data);
		} catch {
			return null;
		}
	}, [buildParams, pagination.limit]);

	const loadJobs = useCallback(async (resetJobs = true, overrideFilters?: Partial<Filters>) => {
		const effective = overrideFilters ? { ...filters, ...overrideFilters } : filters;
		const offs = resetJobs ? 0 : pagination.offset;

		if (resetJobs) setLoading(true);
		else setLoadingMore(true);

		const result = await fetchJobs(effective, offs, resetJobs);

		if (result) {
			setJobs((prev) => resetJobs ? result.jobList : [...prev, ...result.jobList]);
			if (result.paginationData) {
				setPagination((prev) => ({
					...prev,
					...result.paginationData,
					offset: offs,
				}));
			}
			setMatchMode(result.matchMode);
			setPreferenceProfile(result.preferenceProfile);
		}

		setLoading(false);
		setLoadingMore(false);
	}, [filters, pagination.offset, fetchJobs]);

	// Initial load — read search/city from URL when redirected from landing search
	useEffect(() => {
		if (didInit.current) return;
		if (!router.isReady) return;
		didInit.current = true;
		const q = router.query;
		const searchFromUrl = typeof q.search === "string" ? q.search : "";
		const cityFromUrl = typeof q.city === "string" ? q.city : "";
		if (searchFromUrl || cityFromUrl) {
			setFilters((prev) => ({
				...prev,
				search: searchFromUrl,
				city: cityFromUrl,
			}));
			loadJobs(true, { search: searchFromUrl, city: cityFromUrl });
		} else {
			loadJobs(true);
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.isReady, router.query]);

	// Filter change → debounced reload
	const isFirstFilterRender = useRef(true);
	useEffect(() => {
		if (isFirstFilterRender.current) {
			isFirstFilterRender.current = false;
			return;
		}
		if (searchDebounce.current) clearTimeout(searchDebounce.current);
		searchDebounce.current = setTimeout(() => {
			setPagination((prev) => ({ ...prev, offset: 0 }));
			loadJobs(true);
		}, 500);
		return () => {
			if (searchDebounce.current) clearTimeout(searchDebounce.current);
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters]);

	const loadMore = async () => {
		const newOffset = pagination.offset + pagination.limit;
		setPagination((prev) => ({ ...prev, offset: newOffset }));
		setLoadingMore(true);
		const result = await fetchJobs(filters, newOffset, false);
		if (result) {
			setJobs((prev) => [...prev, ...result.jobList]);
			if (result.paginationData) {
				setPagination((prev) => ({
					...prev,
					...result.paginationData,
					offset: newOffset,
				}));
			}
		}
		setLoadingMore(false);
	};

	const toggleSave = async (e: React.MouseEvent, job: Job) => {
		e.preventDefault();
		e.stopPropagation();
		const wasSaved = job.isSaved;
		setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, isSaved: !wasSaved } : j));
		try {
			if (wasSaved) await api.delete(`/saved-jobs/${job.uuid}`);
			else await api.post("/saved-jobs", { jobId: job.uuid });
		} catch {
			setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, isSaved: wasSaved } : j));
		}
	};

	const toggleArrayFilter = (key: "jobType" | "locationType", value: string) => {
		setFilters((prev) => {
			const cur = prev[key];
			return { ...prev, [key]: cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value] };
		});
	};

	const clearFilters = () => {
		setFilters({ search: "", city: "", jobType: [], locationType: [], minSalary: "", maxSalary: "", minExperience: "", maxExperience: "" });
	};

	const bannerConfig = matchMode !== "filtered" ? matchBannerConfig[matchMode] : null;

	// ── Render ────────────────────────────────────────────────────────────────
	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<Head>
				<title>Browse Jobs – Taraqqi Hub</title>
				<meta name="description" content="Find jobs near you — matched to your skills and location" />
			</Head>
			<DashboardLayout>
				<style jsx global>{`
					/* ── Browse Jobs Design System ── */
					.browse-card {
						background: #fff;
						border: 1px solid #e8eaf0;
						border-radius: 14px;
						padding: 18px 20px;
						position: relative;
						transition: box-shadow .18s, border-color .18s, transform .12s;
						cursor: default;
					}
					.browse-card:hover {
						border-color: #c7d2fe;
						box-shadow: 0 4px 20px rgba(99,102,241,.08);
						transform: translateY(-1px);
					}
					.urgent-badge {
						position: absolute;
						top: 0; right: 0;
						display: flex; align-items: center; gap: 4px;
						background: #fef2f2; color: #dc2626;
						font-size: 11px; font-weight: 700;
						padding: 4px 10px;
						border-radius: 0 14px 0 10px;
						border-left: 1px solid #fecaca;
						border-bottom: 1px solid #fecaca;
					}
					.company-logo-box {
						width: 52px; height: 52px;
						background: #f8f9fb;
						border: 1px solid #e8eaf0;
						border-radius: 12px;
						display: flex; align-items: center; justify-content: center;
					}
					.job-title {
						font-size: 16px;
						font-weight: 700;
						color: #1e293b;
						line-height: 1.35;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;
						transition: color .15s;
					}
					.browse-card:hover .job-title {
						color: #4f46e5;
					}
					.save-btn {
						padding: 7px;
						border-radius: 50%;
						border: none;
						background: transparent;
						color: #94a3b8;
						cursor: pointer;
						transition: background .15s, color .15s;
						line-height: 0;
					}
					.save-btn:hover { background: #eef2ff; color: #4f46e5; }
					.save-btn--saved { color: #4f46e5; background: #eef2ff; }
					.meta-chip {
						display: inline-flex; align-items: center; gap: 4px;
						font-size: 13px; color: #475569;
					}
					.meta-chip--salary { font-weight: 600; color: #1e293b; }
					.meta-chip--type {
						background: #f1f5f9; color: #475569;
						padding: 2px 8px; border-radius: 20px;
						font-size: 12px; font-weight: 500;
					}
					.meta-chip--remote {
						background: #ecfdf5; color: #059669;
						padding: 2px 8px; border-radius: 20px;
						font-size: 12px; font-weight: 500;
					}
					.skill-chip {
						background: #f8f9fb; border: 1px solid #e2e8f0;
						color: #475569; font-size: 12px; font-weight: 500;
						padding: 2px 9px; border-radius: 20px;
						transition: background .15s, border-color .15s;
					}
					.browse-card:hover .skill-chip {
						background: #f0f4ff; border-color: #c7d2fe;
					}
					.status-pill {
						display: inline-flex; align-items: center; gap: 3px;
						font-size: 11px; font-weight: 700; text-transform: uppercase;
						letter-spacing: .04em; padding: 2px 7px; border-radius: 6px;
					}
					.status-pill--applied { background: #f0fdf4; color: #16a34a; }
					.status-pill--featured { background: #fffbeb; color: #d97706; }
					.view-details-link {
						display: inline-flex; align-items: center; gap: 4px;
						font-size: 13px; font-weight: 600; color: #4f46e5;
						text-decoration: none;
						transition: color .15s;
					}
					.view-details-link:hover { color: #4338ca; }

					/* Filter sidebar */
					.filter-sidebar {
						background: #fff;
						border: 1px solid #e8eaf0;
						border-radius: 14px;
						padding: 20px;
					}
					.filter-section-title {
						font-size: 13px; font-weight: 700; color: #334155;
						text-transform: uppercase; letter-spacing: .06em;
						margin-bottom: 12px;
					}
					.filter-chip-btn {
						display: inline-flex; align-items: center; gap: 5px;
						padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
						border: 1.5px solid #e2e8f0; background: #fff; color: #475569;
						cursor: pointer; transition: all .15s;
					}
					.filter-chip-btn:hover { border-color: #818cf8; color: #4f46e5; }
					.filter-chip-btn--active { border-color: #4f46e5; background: #eef2ff; color: #4f46e5; }

					/* Search bar */
					.search-bar-input {
						width: 100%; padding: 13px 16px 13px 44px;
						border: 1.5px solid #e2e8f0; border-radius: 10px;
						font-size: 15px; background: #fafbfc;
						transition: border-color .15s, box-shadow .15s;
						outline: none; color: #1e293b;
					}
					.search-bar-input:focus {
						border-color: #818cf8;
						box-shadow: 0 0 0 3px rgba(99,102,241,.1);
						background: #fff;
					}
					.search-btn-primary {
						padding: 13px 28px; background: #4f46e5; color: #fff;
						border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
						cursor: pointer; transition: background .15s, box-shadow .15s;
						white-space: nowrap;
					}
					.search-btn-primary:hover {
						background: #4338ca;
						box-shadow: 0 4px 12px rgba(79,70,229,.25);
					}

					/* Match Banner */
					.match-banner {
						border-radius: 12px; border: 1.5px solid;
						padding: 14px 18px;
						display: flex; align-items: flex-start; gap: 12px;
					}

					/* Load More */
					.load-more-btn {
						width: 100%; padding: 14px;
						border: 1.5px dashed #c7d2fe; border-radius: 12px;
						background: transparent; color: #4f46e5;
						font-size: 14px; font-weight: 600;
						cursor: pointer; transition: background .15s;
					}
					.load-more-btn:hover { background: #f0f4ff; }
					.load-more-btn:disabled { opacity: .6; cursor: not-allowed; }
				`}</style>

				<div className="max-w-6xl mx-auto px-2 sm:px-0">

					{/* ── Hero Search Bar ─────────────────────────────────────── */}
					<div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 sm:p-8 mb-6 shadow-lg">
						<div className="mb-5">
							<h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
								ढूंढें अपना काम 💼
							</h1>
							<p className="text-indigo-200 text-sm sm:text-base">
								Find jobs near you — matched to your skills
							</p>
						</div>

						{/* Search Form */}
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="flex-1 relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
								<input
									id="browse-search"
									type="text"
									placeholder="Job title, skill, or keyword..."
									value={filters.search}
									onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
									className="search-bar-input"
								/>
							</div>
							<div className="sm:w-64 relative">
								<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
								<input
									id="browse-city"
									type="text"
									placeholder="City or area..."
									value={filters.city}
									onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
									className="search-bar-input"
								/>
							</div>
							<button
								id="browse-search-btn"
								onClick={() => loadJobs(true)}
								className="search-btn-primary"
							>
								<Search size={18} className="inline mr-2" />
								Search
							</button>
						</div>
					</div>

					{/* ── Quick Filter Chips ──────────────────────────────────── */}
					<div className="flex flex-wrap items-center gap-2 mb-5">
						<span className="text-sm font-medium text-slate-500">Quick:</span>
						{["full-time", "part-time", "contract", "internship"].map((jt) => (
							<button
								key={jt}
								id={`quick-filter-${jt}`}
								onClick={() => toggleArrayFilter("jobType", jt)}
								className={`filter-chip-btn ${filters.jobType.includes(jt) ? "filter-chip-btn--active" : ""}`}
							>
								{filters.jobType.includes(jt) && <Check size={13} />}
								{JOB_TYPE_LABELS[jt]}
							</button>
						))}
						{["remote", "onsite"].map((lt) => (
							<button
								key={lt}
								id={`quick-filter-loc-${lt}`}
								onClick={() => toggleArrayFilter("locationType", lt)}
								className={`filter-chip-btn ${filters.locationType.includes(lt) ? "filter-chip-btn--active" : ""}`}
							>
								{filters.locationType.includes(lt) && <Check size={13} />}
								{LOC_TYPE_LABELS[lt]}
							</button>
						))}
						<button
							id="browse-more-filters"
							onClick={() => setShowFilters((p) => !p)}
							className={`filter-chip-btn ml-auto ${showFilters ? "filter-chip-btn--active" : ""}`}
						>
							<SlidersHorizontal size={14} />
							More filters
							{activeFiltersCount > 0 && (
								<span className="bg-indigo-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
									{activeFiltersCount}
								</span>
							)}
							{showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
						</button>
						{activeFiltersCount > 0 && (
							<button
								id="browse-clear-filters"
								onClick={clearFilters}
								className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
							>
								<X size={14} /> Clear
							</button>
						)}
					</div>

					{/* ── Advanced Filters Panel ────────────────────────────────── */}
					{showFilters && (
						<div className="filter-sidebar mb-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								{/* Salary */}
								<div>
									<p className="filter-section-title">Salary Range (₹)</p>
									<div className="flex gap-2">
										<input
											type="number"
											placeholder="Min"
											value={filters.minSalary}
											onChange={(e) => setFilters((p) => ({ ...p, minSalary: e.target.value }))}
											className="search-bar-input !pl-3 !py-2 text-sm"
										/>
										<input
											type="number"
											placeholder="Max"
											value={filters.maxSalary}
											onChange={(e) => setFilters((p) => ({ ...p, maxSalary: e.target.value }))}
											className="search-bar-input !pl-3 !py-2 text-sm"
										/>
									</div>
								</div>
								{/* Experience */}
								<div>
									<p className="filter-section-title">Experience (Years)</p>
									<div className="flex gap-2">
										<input
											type="number"
											placeholder="Min"
											min="0"
											value={filters.minExperience}
											onChange={(e) => setFilters((p) => ({ ...p, minExperience: e.target.value }))}
											className="search-bar-input !pl-3 !py-2 text-sm"
										/>
										<input
											type="number"
											placeholder="Max"
											min="0"
											value={filters.maxExperience}
											onChange={(e) => setFilters((p) => ({ ...p, maxExperience: e.target.value }))}
											className="search-bar-input !pl-3 !py-2 text-sm"
										/>
									</div>
								</div>
								{/* Job Type */}
								<div>
									<p className="filter-section-title">Job Type</p>
									<div className="flex flex-wrap gap-2">
										{Object.entries(JOB_TYPE_LABELS).map(([id, label]) => (
											<button
												key={id}
												onClick={() => toggleArrayFilter("jobType", id)}
												className={`filter-chip-btn !py-1.5 !px-3 !text-xs ${filters.jobType.includes(id) ? "filter-chip-btn--active" : ""}`}
											>
												{filters.jobType.includes(id) && <Check size={11} />}
												{label}
											</button>
										))}
									</div>
								</div>
								{/* Work Mode */}
								<div>
									<p className="filter-section-title">Work Mode</p>
									<div className="flex flex-wrap gap-2">
										{Object.entries(LOC_TYPE_LABELS).map(([id, label]) => (
											<button
												key={id}
												onClick={() => toggleArrayFilter("locationType", id)}
												className={`filter-chip-btn !py-1.5 !px-3 !text-xs ${filters.locationType.includes(id) ? "filter-chip-btn--active" : ""}`}
											>
												{filters.locationType.includes(id) && <Check size={11} />}
												{label}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* ── Match Mode Banner ────────────────────────────────────── */}
					{bannerConfig && !loading && jobs.length > 0 && (
						<div className={`match-banner ${bannerConfig.bg} mb-5`}>
							<div className="shrink-0 mt-0.5">{bannerConfig.icon}</div>
							<div className="flex-1 min-w-0">
								<p className={`font-semibold text-sm ${bannerConfig.titleColor}`}>
									{bannerConfig.title}
								</p>
								<p className={`text-xs mt-0.5 ${bannerConfig.msgColor}`}>
									{bannerConfig.getMessage(preferenceProfile)}
								</p>
							</div>
							{matchMode === "all_jobs" && (
								<Link
									href="/profile"
									className="shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
								>
									Update Profile →
								</Link>
							)}
						</div>
					)}

					{/* ── Results Bar ──────────────────────────────────────────── */}
					{!loading && (
						<div className="flex items-center justify-between mb-4">
							<p className="text-sm text-slate-600 font-medium">
								{pagination.total > 0 ? (
									<>
										<span className="font-bold text-slate-800">{pagination.total.toLocaleString()}</span> jobs found
									</>
								) : "No jobs found"}
							</p>
							{activeFiltersCount > 0 && (
								<button onClick={clearFilters} className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1">
									<X size={13} /> Clear filters
								</button>
							)}
						</div>
					)}

					{/* ── Job List ─────────────────────────────────────────────── */}
					{loading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4, 5].map((i) => <SkeletonCard key={i} />)}
						</div>
					) : jobs.length > 0 ? (
						<div className="space-y-3">
							{jobs.map((job) => (
								<JobCard key={job.id} job={job} onToggleSave={toggleSave} />
							))}

							{/* Load More */}
							{pagination.hasMore && (
								<button
									id="browse-load-more"
									onClick={loadMore}
									disabled={loadingMore}
									className="load-more-btn mt-2"
								>
									{loadingMore ? (
										<span className="flex items-center justify-center gap-2">
											<RefreshCw size={16} className="animate-spin" /> Loading...
										</span>
									) : (
										<span className="flex items-center justify-center gap-2">
											Load more jobs <ChevronDown size={16} />
										</span>
									)}
								</button>
							)}
						</div>
					) : (
						/* ── Empty State ───────────────────────────────────── */
						<div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
							<div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
								<Briefcase size={36} className="text-indigo-400" />
							</div>
							<h3 className="text-xl font-bold text-slate-800 mb-2">
								कोई काम नहीं मिला
							</h3>
							<p className="text-slate-500 text-sm mb-1">No jobs found in your area right now.</p>
							<p className="text-slate-400 text-sm mb-6">
								Try removing some filters, or check back later — new jobs are posted daily!
							</p>
							<div className="flex flex-wrap justify-center gap-3">
								<button
									id="browse-explore-all"
									onClick={() => { clearFilters(); loadJobs(true); }}
									className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
								>
									Explore all jobs
								</button>
								<button
									id="browse-clear-all"
									onClick={clearFilters}
									className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
								>
									Clear filters
								</button>
							</div>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
