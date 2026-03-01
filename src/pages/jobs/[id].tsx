/**
 * Job Detail Page - Full job information with apply functionality
 * Similar to LinkedIn/Naukri job detail pages
 */

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import {
	MapPin,
	Briefcase,
	DollarSign,
	Clock,
	GraduationCap,
	CheckCircle2,
	XCircle,
	Send,
	Bookmark,
	Share2,
	Building2,
	Star,
	Zap,
	TrendingUp,
	Copy,
	Mail,
	Linkedin,
	Twitter,
	MessageCircle,
	ArrowLeft,
	MoreHorizontal,
	FileText,
	Users
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useAuthStore } from "@/store/authStore";
import { useTranslation } from "react-i18next";
import { getFormTypeForCategory } from "@/data/jobCategoryFormConfig";
import { Phone, ExternalLink } from "lucide-react";

const BENEFIT_LABELS: Record<string, string> = {
	pf: "PF",
	esi: "ESI",
	accommodation: "Accommodation",
	food: "Food",
	transport: "Transport",
	health_insurance: "Health Insurance",
};

interface Job {
	id: string;
	uuid: string;
	title: string;
	description: string | null;
	roleSummary: string | null;
	requirements: string | null;
	responsibilities: string | null;
	jobType: string;
	category: string | null;
	experienceLevel: string | null;
	skillsRequired: string[] | null;
	locationType: string | null;
	city: string | null;
	area: string | null;
	state: string | null;
	address: string | null;
	addressLine2: string | null;
	district: string | null;
	pincode: string | null;
	salaryMin: string | null;
	salaryMax: string | null;
	salaryType: string | null;
	hideSalary: boolean | null;
	isSalaryNegotiable: boolean | null;
	benefits: string[] | null;
	minExperienceYears: number | null;
	maxExperienceYears: number | null;
	educationRequired: string | null;
	preferredLanguage: string | null;
	freshersAllowed: boolean | null;
	ageMin: number | null;
	ageMax: number | null;
	genderPreference: string | null;
	applicationDeadline: string | null;
	maxApplications: number | null;
	status: string;
	isFeatured: boolean | null;
	promotionType: string | null;
	isUrgentHighlight: boolean | null;
	isResumeRequired: boolean | null;
	expiresAt: string | null;
	howToApply?: string; // "platform" | "direct" | "both" | "external"
	externalApplyUrl?: string | null;
	viewsCount: number | null;
	applicationsCount: number | null;
	publishedAt: string | null;
	createdAt: string;
	badges: string[];
	company: {
		companyName: string | null;
		brandName: string | null;
		logoUrl: string | null;
		industry: string | null;
		companySize: string | null;
		isVerified: boolean | null;
		contactPhone?: string | null;
		whatsappNumber?: string | null;
	} | null;
	hasApplied: boolean;
}

// Profile issues detected for the logged-in jobseeker
interface ProfileIssue {
	field: string;
	label: string;
}

export default function JobDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const { t } = useTranslation();
	const { user } = useAuthStore();
	const isProfileComplete = user?.profileComplete === true;
	const [job, setJob] = useState<Job | null>(null);
	const [loading, setLoading] = useState(true);
	const [applying, setApplying] = useState(false);
	const [applyError, setApplyError] = useState<string | null>(null);
	const [showApplyModal, setShowApplyModal] = useState(false);
	const [coverLetter, setCoverLetter] = useState("");
	const [expectedSalary, setExpectedSalary] = useState("");
	const [noticePeriodDays, setNoticePeriodDays] = useState("");
	const [resumeUrl, setResumeUrl] = useState("");
	const [showShareMenu, setShowShareMenu] = useState(false);
	const [isSaved, setIsSaved] = useState(false);
	const [saveLoading, setSaveLoading] = useState(false);
	const shareMenuRef = useRef<HTMLDivElement>(null);
	const [isSpeaking, setIsSpeaking] = useState(false);
	// Profile completeness for employer-visible fields
	const [profileIssues, setProfileIssues] = useState<ProfileIssue[]>([]);
	const isSimpleJob = job ? getFormTypeForCategory(job.category || "") === "simple" : false;
	const howToApply = job?.howToApply ?? "platform";
	const companyPhone = job?.company && "contactPhone" in job.company ? job.company.contactPhone : null;
	const companyWhatsApp = job?.company && "whatsappNumber" in job.company ? job.company.whatsappNumber : null;
	const showDirectContact = (howToApply === "direct" || howToApply === "both") && (companyPhone || companyWhatsApp);
	const showApplyOnPlatform = howToApply === "platform" || howToApply === "both";
	const showExternalApply = howToApply === "external" && job?.externalApplyUrl;

	useEffect(() => {
		if (id) {
			loadJob();
			checkSavedStatus();
		}
	}, [id]);

	// Fetch the jobseeker's own profile to detect missing employer-visible fields
	useEffect(() => {
		if (user?.userType === "individual") {
			api.get("/profile/jobseeker")
				.then((res) => {
					const profile = res.data?.profile;
					if (!profile) return;
					const issues: ProfileIssue[] = [];
					if (!profile.firstName && !profile.lastName) issues.push({ field: "name", label: "Full name" });
					if (!profile.city) issues.push({ field: "city", label: "City / Location" });
					if (!profile.headline) issues.push({ field: "headline", label: "Headline / Job title" });
					if (profile.experienceYears == null) issues.push({ field: "experienceYears", label: "Years of experience" });
					if (!profile.skills || profile.skills.length === 0) issues.push({ field: "skills", label: "Skills" });
					setProfileIssues(issues);
				})
				.catch(() => {});
		}
	}, [user]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
				setShowShareMenu(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const loadJob = async () => {
		try {
			const response = await api.get(`/jobs/${id}`);
			const payload = response?.data?.payload || response?.data;
			setJob(payload);
		} catch (err: any) {
			console.error("Failed to load job", err);
			if (err.response?.status === 404) {
				router.push("/jobs");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleApply = async () => {
		if (!job) return;

		setApplying(true);
		setApplyError(null);

		try {
			await api.post("/applications", {
				jobId: job.id,
				coverLetter: coverLetter || undefined,
				expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
				noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : undefined,
				resumeUrl: resumeUrl || undefined,
			});
			
			setShowApplyModal(false);
			setCoverLetter("");
			setExpectedSalary("");
			setNoticePeriodDays("");
			setResumeUrl("");
			loadJob(); // Refresh to show "Applied" status
			alert(t("jobDetail.applicationSubmittedSuccess"));
		} catch (err: any) {
			setApplyError(err.response?.data?.error || "Failed to submit application");
		} finally {
			setApplying(false);
		}
	};

	const checkSavedStatus = async () => {
		try {
			if (!id) return;
			const response = await api.get(`/saved-jobs/check/${id}`);
			setIsSaved(response.data.isSaved);
		} catch (err) {
			console.error("Failed to check saved status", err);
		}
	};

	const handleSave = async () => {
		if (!job) return;
		setSaveLoading(true);
		try {
			if (isSaved) {
				await api.delete(`/saved-jobs/${job.id}`);
				setIsSaved(false);
			} else {
				await api.post("/saved-jobs", { jobId: job.id });
				setIsSaved(true);
			}
		} catch (err) {
			console.error("Failed to toggle save", err);
			alert("Failed to update saved status");
		} finally {
			setSaveLoading(false);
		}
	};

	const handleShare = (platform: string) => {
		if (!job) return;
		const url = window.location.href;
		const text = `Check out this job: ${job.title} at ${job.company?.brandName || "Equalio"}`;

		let shareUrl = "";
		switch (platform) {
			case "whatsapp":
				shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
				break;
			case "linkedin":
				shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
				break;
			case "twitter":
				shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
				break;
			case "email":
				shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`;
				break;
			case "copy":
				navigator.clipboard.writeText(url);
				alert("Link copied to clipboard!");
				setShowShareMenu(false);
				return;
		}

		if (shareUrl) window.open(shareUrl, "_blank");
		setShowShareMenu(false);
	};

	const formatSalary = (min: string | null, max: string | null, type: string | null, hide: boolean | null) => {
		if (hide) return "Not disclosed";
		if (!min && !max) return "Not specified";
		const minVal = min ? parseInt(min) : null;
		const maxVal = max ? parseInt(max) : null;

		let typeLabel = "";
		switch (type) {
			case "daily":
				typeLabel = "per day";
				break;
			case "weekly":
				typeLabel = "per week";
				break;
			case "monthly":
				typeLabel = "PM";
				break;
			case "quarterly":
				typeLabel = "per quarter";
				break;
			case "yearly":
				typeLabel = "LPA";
				break;
			default:
				typeLabel = "";
		}

		if (minVal && maxVal) return `₹${minVal} - ₹${maxVal} ${typeLabel}`.trim();
		if (minVal) return `₹${minVal}+ ${typeLabel}`.trim();
		if (maxVal) return `Up to ₹${maxVal} ${typeLabel}`.trim();
		return "Not specified";
	};

	const formatExperience = (min: number | null, max: number | null) => {
		if (min === null && max === null) return "Not specified";
		if (min === 0 && max === null) return "Fresher";
		if (min !== null && max !== null) return `${min} - ${max} years`;
		if (min !== null) return `${min}+ years`;
		if (max !== null) return `Up to ${max} years`;
		return "Not specified";
	};

	// 12-hour format for dates and date-times (e.g. deadline, posted)
	const formatDate12h = (dateStr: string | null | undefined) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleDateString(undefined, { hour12: true });
	};
	const formatDateTime12h = (dateStr: string | null | undefined) => {
		if (!dateStr) return "";
		const d = new Date(dateStr);
		return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short", hour12: true });
	};

	const handleListenToJob = () => {
		if (!job || typeof window === "undefined" || !window.speechSynthesis) return;

		// If already speaking, stop current playback
		if (isSpeaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
			return;
		}

		const companyName = job.company?.brandName || job.company?.companyName || "";
		const location = [job.address, job.city, job.area, job.state].filter(Boolean).join(", ");
		const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.hideSalary);
		const expText = formatExperience(job.minExperienceYears, job.maxExperienceYears);

		const text = [
			`Job Name: ${job.title}`,
			companyName && `Company: ${companyName}`,
			location && `Location: ${location}`,
			`Salary: ${salaryText}`,
			`Experience: ${expText}`,
			job.roleSummary || job.description?.slice(0, 200) || "",
		]
			.filter(Boolean)
			.join(". ");

		const utterance = new SpeechSynthesisUtterance(text);

		// Prefer Indian voices for better local accent (Hindi or Indian English)
		const preferredLang = document.documentElement.lang === "hi" ? "hi-IN" : "en-IN";
		const voices = window.speechSynthesis.getVoices() || [];

		let selectedVoice =
			voices.find((v) => v.lang === preferredLang) ||
			voices.find((v) => v.lang.startsWith(preferredLang.split("-")[0]) && v.lang.endsWith("IN")) ||
			voices.find((v) => v.lang.includes("IN")) ||
			null;

		if (selectedVoice) {
			utterance.voice = selectedVoice;
			utterance.lang = selectedVoice.lang;
		} else {
			utterance.lang = preferredLang;
		}

		// Slightly slower and clearer speech for easier understanding
		utterance.rate = 1.0;
		utterance.pitch = 1.0;

		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);

		window.speechSynthesis.speak(utterance);
		setIsSpeaking(true);
	};

	if (loading) {
		return (
			<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
				<DashboardLayout>
					<div className="min-h-screen bg-slate-50 flex justify-center items-center">
						<div className="relative">
							<div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
							<div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	if (!job) {
		return (
			<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
				<DashboardLayout>
					<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
						<div className="text-center max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
							<div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
								<Briefcase className="w-8 h-8 text-slate-400" />
							</div>
							<h2 className="text-xl font-bold text-slate-900 mb-2">{t("jobDetail.jobNotFound")}</h2>
							<p className="text-slate-500 mb-6">{t("jobDetail.jobNotFoundDesc")}</p>
							<Link href="/jobs" className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium inline-block w-full">
								{t("jobDetail.browseMoreJobs")}
							</Link>
						</div>
					</div>
				</DashboardLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
			<DashboardLayout>
				<div className="min-h-screen bg-slate-50/50 pb-12">
					{/* Navigation Bar */}
					<div className="bg-white border-b border-slate-200 sticky top-16 z-30 px-4 md:px-8 py-4 shadow-sm bg-opacity-90 backdrop-blur-md -mx-4 sm:-mx-6 mb-6">
						<div className="max-w-6xl mx-auto flex items-center justify-between">
							<Link
								href="/jobs"
								className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group"
							>
								<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
								<span>{t("jobDetail.backToJobs")}</span>
							</Link>
							<div className="flex gap-2">
								<button
									onClick={handleSave}
									disabled={saveLoading}
									className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium text-sm border ${
										isSaved
											? "bg-indigo-50 text-indigo-600 border-indigo-200"
											: "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent hover:border-slate-200"
									}`}
								>
									<Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
									<span>{isSaved ? t("jobDetail.unsaveJob") : t("jobDetail.saveJob")}</span>
								</button>
								<button 
									className="hidden md:flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium text-sm border border-transparent hover:border-slate-200"
								    onClick={() => setShowShareMenu(!showShareMenu)}
                                >
									<Share2 className="w-4 h-4" />
                                    <span>{t("jobDetail.share")}</span>
								</button>
								<button className={`p-2 md:hidden rounded-lg transition-colors ${isSaved ? "text-indigo-600 bg-indigo-50" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"}`}
									onClick={handleSave}
								>
									<Bookmark className={`w-5 h-5 ${isSaved ? "fill-current" : ""}`} />
								</button>
								<button className="p-2 md:hidden text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                >
									<MoreHorizontal className="w-5 h-5" />
								</button>
                                
                                {showShareMenu && (
                                    <div className="fixed inset-0 z-[60] md:absolute md:inset-auto md:top-16 md:right-0 md:w-64" ref={shareMenuRef}>
                                        <div className="absolute inset-0 bg-black/20 md:hidden" onClick={() => setShowShareMenu(false)}></div>
                                        <div className="absolute bottom-0 left-0 right-0 md:static bg-white rounded-t-2xl md:rounded-xl shadow-2xl border-t md:border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-top-2 duration-200">
                                            <div className="p-4 md:p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Share this job</p>
                                                <button onClick={() => setShowShareMenu(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 hover:bg-green-50 text-slate-700 hover:text-green-700 rounded-lg transition-colors group">
                                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg group-hover:bg-green-200 transition-colors">
                                                        <MessageCircle className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">WhatsApp</span>
                                                </button>
                                                <button onClick={() => handleShare('linkedin')} className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors group">
                                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                                                        <Linkedin className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">LinkedIn</span>
                                                </button>
                                                <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg transition-colors group">
                                                    <div className="p-2 bg-slate-200 text-slate-600 rounded-lg group-hover:bg-slate-300 transition-colors">
                                                        <Twitter className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">X / Twitter</span>
                                                </button>
                                                <button onClick={() => handleShare('email')} className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-lg transition-colors group">
                                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                                        <Mail className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">Email</span>
                                                </button>
                                                <div className="h-px bg-slate-100 my-1"></div>
                                                <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-3 py-3 md:py-2.5 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors group">
                                                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-slate-200 transition-colors">
                                                        <Copy className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-medium text-sm">Copy Link</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
							</div>
						</div>
					</div>

					<div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Main Content */}
							<div className="lg:col-span-2 space-y-6">
								{/* Header Card */}
								<div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:-mr-14 group-hover:-mt-14"></div>
                                    
									<div className="flex flex-col md:flex-row gap-6 items-start relative z-1">
										{job.company?.logoUrl ? (
											<img
												src={job.company.logoUrl}
												alt={job.company.brandName || "Company"}
												className="w-20 h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
											/>
										) : (
											<div className="w-20 h-20 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-100 text-indigo-600">
												<Building2 className="w-10 h-10" />
											</div>
										)}
										
										<div className="flex-1">
											{/* Badges */}
											{job.badges && job.badges.length > 0 && (
												<div className="flex flex-wrap items-center gap-2 mb-3">
													{job.badges.map((badge, idx) => (
														<span
															key={idx}
															className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 uppercase tracking-wide ${
																badge === "Featured"
																	? "bg-amber-50 text-amber-600 border border-amber-100"
																	: badge === "Urgent"
																	? "bg-red-50 text-red-600 border border-red-100"
																	: "bg-blue-50 text-blue-600 border border-blue-100"
															}`}
														>
															{badge === "Featured" && <Star className="w-3 h-3" />}
															{badge === "Urgent" && <Zap className="w-3 h-3" />}
															{badge}
														</span>
													))}
												</div>
											)}
											
											<div className="flex flex-wrap items-center gap-2 mb-2">
												<h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
													{job.title}
												</h1>
												{typeof window !== "undefined" && "speechSynthesis" in window && (
													<button
														type="button"
														onClick={handleListenToJob}
														className={`p-2.5 rounded-xl border transition-colors ${isSpeaking ? "bg-indigo-100 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600"}`}
														title={t("jobDetail.listenToJob")}
														aria-label={t("jobDetail.listenToJob")}
													>
														{isSpeaking ? (
															<XCircle className="w-5 h-5" />
														) : (
															<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
														)}
													</button>
												)}
											</div>
											
											<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-600 text-sm mb-4">
												<span className="font-semibold text-slate-900 flex items-center gap-1.5">
													<Building2 className="w-4 h-4 text-slate-400" />
													{job.company?.brandName || job.company?.companyName}
													{job.company?.isVerified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
												</span>

												{(job.address || job.city) && (
													<span className="flex items-center gap-1.5">
														<MapPin className="w-4 h-4 text-slate-400" />
														{[job.address, job.addressLine2, job.city, job.area, job.district, job.state, job.pincode].filter(Boolean).join(", ")}
													</span>
												)}
												<span className="flex items-center gap-1.5">
													<Clock className="w-4 h-4 text-slate-400" />
													Posted {formatDate12h(job.publishedAt || job.createdAt)}
												</span>
											</div>
										</div>
									</div>

									{/* Quick Stats Grid */}
									<div className={`grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100 relative z-1 ${(job.ageMin != null || job.ageMax != null) ? "lg:grid-cols-5" : "lg:grid-cols-4"}`}>
										<div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
											<div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <DollarSign className="w-4 h-4" />
                                                <p className="text-xs font-bold uppercase tracking-wide">Salary</p>
                                            </div>
											<p className="font-bold text-slate-900 text-sm md:text-base truncate">
												{formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.hideSalary)}
											</p>
										</div>
										<div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
											<div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <Briefcase className="w-4 h-4" />
                                                <p className="text-xs font-bold uppercase tracking-wide">Experience</p>
                                            </div>
											<p className="font-bold text-slate-900 text-sm md:text-base truncate">
												{formatExperience(job.minExperienceYears, job.maxExperienceYears)}
											</p>
										</div>
										<div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
											<div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <Clock className="w-4 h-4" />
                                                <p className="text-xs font-bold uppercase tracking-wide">Job Type</p>
                                            </div>
											<p className="font-bold text-slate-900 text-sm md:text-base capitalize">
												{job.jobType.replace("-", " ")}
											</p>
										</div>
										<div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
											<div className="flex items-center gap-2 mb-2 text-slate-500">
                                                <MapPin className="w-4 h-4" />
                                                <p className="text-xs font-bold uppercase tracking-wide">Work Mode</p>
                                            </div>
											<p className="font-bold text-slate-900 text-sm md:text-base capitalize">
												{job.locationType}
											</p>
										</div>
										{(job.ageMin != null || job.ageMax != null) && (
											<div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-colors">
												<div className="flex items-center gap-2 mb-2 text-slate-500">
													<Users className="w-4 h-4" />
													<p className="text-xs font-bold uppercase tracking-wide">Age range</p>
												</div>
												<p className="font-bold text-slate-900 text-sm md:text-base">
													{job.ageMin != null && job.ageMax != null
														? `${job.ageMin}–${job.ageMax} years`
														: job.ageMin != null
														? `${job.ageMin}+ years`
														: `${job.ageMax} years or below`}
												</p>
											</div>
										)}
									</div>
								</div>

								{/* Job Description & Details */}
								<div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm space-y-10">
									<div>
										<h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
											<div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
											Job Overview
										</h2>
										{(() => {
											const rs = (job.roleSummary || "").trim();
											const desc = (job.description || "").trim();
											const descHasSummary = !rs || desc === rs || desc.startsWith(rs);
											if (job.description && descHasSummary) return <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">{job.description}</p>;
											if (job.roleSummary) return <p className="text-slate-600 mb-4 leading-relaxed text-base">{job.roleSummary}</p>;
											return null;
										})()}
										{(() => {
											const rs = (job.roleSummary || "").trim();
											const desc = (job.description || "").trim();
											const descHasSummary = !rs || desc === rs || desc.startsWith(rs);
											if (!job.description || descHasSummary) return null;
											return <p className="text-slate-600 leading-relaxed text-base whitespace-pre-wrap">{job.description}</p>;
										})()}
									</div>

									{job.responsibilities && (
										<div>
											<h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
											    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </div>
												Responsibilities
											</h2>
											<div className="text-slate-600 leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-100 py-1">
												{job.responsibilities}
											</div>
										</div>
									)}

									{job.requirements && (
										<div>
											<h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
											    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
												Requirements
											</h2>
											<div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
												{job.requirements}
											</div>
										</div>
									)}

									{/* Skills Tags */}
									{job.skillsRequired && job.skillsRequired.length > 0 && (
										<div>
											<h2 className="text-lg font-bold text-slate-900 mb-4">Required Skills</h2>
											<div className="flex flex-wrap gap-2">
												{job.skillsRequired.map((skill, idx) => (
													<span
														key={idx}
														className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium border border-slate-100 hover:border-indigo-200 hover:text-indigo-700 hover:bg-indigo-50 transition-colors cursor-default"
													>
														{skill}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
								
								{/* Perks & Benefits (if available) */}
								{job.benefits && job.benefits.length > 0 && (
									<div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
										<h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
										    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
											Perks & Benefits
										</h2>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
											{job.benefits.map((benefit, idx) => (
												<div key={idx} className="flex items-center gap-3 p-4 bg-green-50/30 rounded-2xl border border-green-100/50 hover:bg-green-50 hover:border-green-100 transition-colors">
													<div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
													<span className="text-slate-700 font-medium">{BENEFIT_LABELS[benefit] || benefit}</span>
												</div>
											))}
										</div>
									</div>
								)}
							</div>

							{/* Sidebar */}
							<div className="lg:col-span-1">
								<div className="sticky top-24 space-y-6">
									{/* Application Status / CTA */}
									<div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
										{/* Stats strip */}
										<div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
											<span className="text-sm text-slate-500">Applications <strong className="text-slate-900 ml-0.5">{job.applicationsCount ?? 0}</strong></span>
											<span className="text-sm text-slate-400">·</span>
											<span className="text-sm text-slate-500">Views <strong className="text-slate-900 ml-0.5">{job.viewsCount ?? 0}</strong></span>
										</div>
										<div className="p-5">
										{job.hasApplied ? (
											<div className="text-center py-2">
												<div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
													<CheckCircle2 className="w-8 h-8" />
												</div>
												<h3 className="text-xl font-bold text-slate-900 mb-1">Applied!</h3>
												<p className="text-slate-500 text-sm mb-5">
													You applied on {formatDate12h(new Date().toISOString())}
												</p>
												<Link
													href="/applications"
													className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
												>
													View application status
												</Link>
											</div>
										) : howToApply === "direct" && showDirectContact ? (
											<div className="text-center py-2">
												<p className="text-slate-600 text-sm mb-4">{t("jobDetail.employerPrefersDirectContact")}</p>
												<div className="flex flex-col sm:flex-row gap-3">
													{companyPhone && (
														<a
															href={`tel:${companyPhone.replace(/\s/g, "")}`}
															className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all shadow-lg shadow-slate-900/20"
														>
															<Phone className="w-4 h-4" />
															{t("jobDetail.callEmployer")}
														</a>
													)}
													{companyWhatsApp && (
														<a
															href={`https://wa.me/${companyWhatsApp.replace(/\D/g, "")}`}
															target="_blank"
															rel="noopener noreferrer"
															className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20BD5A] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"
														>
															<MessageCircle className="w-4 h-4" />
															{t("jobDetail.whatsAppEmployer")}
														</a>
													)}
												</div>
											</div>
										) : showExternalApply ? (
											<div className="text-center py-2">
												<p className="text-slate-600 text-sm mb-4">Apply via the company&apos;s link below.</p>
												<a
													href={job.externalApplyUrl!}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center justify-center gap-2 w-full px-5 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 active:scale-[0.98] transition-all"
												>
													Apply on company site
													<ExternalLink className="w-5 h-5" />
												</a>
											</div>
										) : !isProfileComplete && showApplyOnPlatform ? (
											<div className="text-center py-2">
												<div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
													<FileText className="w-8 h-8" />
												</div>
												<h3 className="text-lg font-bold text-slate-900 mb-1">{t("jobDetail.completeProfileToApply")}</h3>
												<p className="text-slate-500 text-sm mb-5">{t("jobDetail.completeProfileToApplyDesc")}</p>
												<Link
													href="/profile"
													className="inline-flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-base hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/25"
												>
													{t("jobDetail.completeProfile")}
													<ArrowLeft className="w-4 h-4 rotate-180" />
												</Link>
											</div>
										) : showApplyOnPlatform ? (
											<>
                                                    {job.applicationDeadline && (
                                                        <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm flex items-center gap-2">
                                                            <Clock className="w-4 h-4 shrink-0" />
                                                            <span>Deadline: <strong>{formatDateTime12h(job.applicationDeadline)}</strong></span>
                                                        </div>
                                                    )}
													{job.isResumeRequired && (
														<div className="mb-4 p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-sm flex items-center gap-2">
															<FileText className="w-4 h-4 shrink-0" />
															<span>Resume <strong>required</strong></span>
														</div>
													)}
												{profileIssues.length > 0 && (
													<div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200">
														<p className="font-semibold text-amber-900 text-sm">Profile incomplete for employers</p>
														<ul className="mt-1 ml-4 space-y-0.5 text-xs text-amber-800">
															{profileIssues.map((issue) => (
																<li key={issue.field}>· {issue.label}</li>
															))}
														</ul>
														<Link href="/profile" className="mt-2 inline-block text-xs font-semibold text-amber-700 hover:underline">Fix profile →</Link>
													</div>
												)}

												{/* Primary CTA */}
												<button
													onClick={() => setShowApplyModal(true)}
													className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-4 rounded-2xl bg-indigo-600 text-white font-bold text-base shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all"
												>
													{isSimpleJob ? t("jobDetail.applyWithProfile") : t("common.applyNow")}
													<Send className="w-5 h-5" />
												</button>

												{showDirectContact && (
													<>
														{howToApply === "both" && (
															<p className="mt-4 text-xs text-center text-slate-400">{t("jobDetail.orContactDirectly")}</p>
														)}
														<div className="flex gap-3 mt-2">
															{companyPhone && (
																<a
																	href={`tel:${companyPhone.replace(/\s/g, "")}`}
																	className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all"
																>
																	<Phone className="w-4 h-4" />
																	{t("jobDetail.callEmployer")}
																</a>
															)}
															{companyWhatsApp && (
																<a
																	href={`https://wa.me/${companyWhatsApp.replace(/\D/g, "")}`}
																	target="_blank"
																	rel="noopener noreferrer"
																	className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 border-[#25D366]/40 bg-[#25D366]/10 text-[#128C7E] font-semibold text-sm hover:bg-[#25D366]/20 active:scale-[0.98] transition-all"
																>
																	<MessageCircle className="w-4 h-4" />
																	{t("jobDetail.whatsAppEmployer")}
																</a>
															)}
														</div>
													</>
												)}

												<p className="mt-4 text-xs text-center text-slate-400">
													{job.maxApplications ? `${job.maxApplications} spots. ` : ""}Don&apos;t miss out!
												</p>
											</>
										) : null}
										</div>
									</div>
                                    
                                    {/* Company Info Sidebar */}
                                    {job.company && (
                                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                                            <div className="flex items-center gap-4 mb-4">
                                                {job.company.logoUrl ? (
                                                    <img
                                                        src={job.company.logoUrl}
                                                        alt={job.company.brandName || "Company"}
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                                                        <Building2 className="w-6 h-6" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-sm">{job.company.brandName || job.company.companyName}</h4>
                                                    <p className="text-xs text-slate-500">{job.company.industry}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 pt-3 border-t border-slate-50">
                                                {job.company.companySize && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-slate-500">Size</span>
                                                        <span className="font-medium text-slate-900">{job.company.companySize}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Verified</span>
                                                    <span className="font-medium text-slate-900 flex items-center gap-1">
                                                        {job.company.isVerified ? (
                                                            <><CheckCircle2 className="w-3 h-3 text-blue-500" /> Yes</>
                                                        ) : 'No'}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* <button className="block w-full mt-4 px-4 py-2 bg-slate-50 text-slate-400 text-sm font-semibold rounded-lg cursor-not-allowed text-center" disabled>
                                                View Company Profile
                                            </button> */}
                                        </div>
                                    )}
								</div>
							</div>
						</div>
					</div>

					{/* Apply Modal — quick (optional note only) for simple jobs, full for standard/full */}
					{showApplyModal && (
						<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
							<div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">
								<div className="flex justify-between items-center mb-6">
									<div>
										<h2 className="text-2xl font-bold text-slate-900">
											{isSimpleJob ? t("applyModal.quickApplyTitle") : t("applyModal.title")}
										</h2>
										<p className="text-slate-500 text-sm mt-1">{job.title}</p>
									</div>
									<button onClick={() => setShowApplyModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
										<XCircle className="w-6 h-6 text-slate-500" />
									</button>
								</div>

								{/* Profile completeness warning inside modal */}
								{profileIssues.length > 0 && (
									<div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
										<p className="font-semibold text-amber-900">⚠️ Employers will see your profile as incomplete</p>
										<p className="text-amber-700 text-xs mt-1">Missing: {profileIssues.map(i => i.label).join(", ")}</p>
										<Link href="/profile" className="text-xs font-semibold text-amber-700 hover:underline">Update profile first →</Link>
									</div>
								)}

								{isSimpleJob ? (
									<>
										<p className="text-slate-600 text-sm mb-4">{t("applyModal.quickApplySubtitle")}</p>
										<div className="mb-6">
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												{t("applyModal.addMessageOptional")}
											</label>
											<textarea
												value={coverLetter}
												onChange={(e) => setCoverLetter(e.target.value)}
												rows={3}
												className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-slate-50 focus:bg-white"
												placeholder={t("applyModal.messageToEmployerPlaceholder")}
											/>
										</div>
									</>
								) : (
									<div className="space-y-6">
										<p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
											{t("applyModal.profileWillBeSent")}
										</p>
										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												{t("applyModal.resumeCv")} {job.isResumeRequired ? <span className="text-red-500">*</span> : <span className="text-slate-400 font-normal">({t("applyModal.optional")})</span>}
											</label>
											<FileUpload
												uploadType="resume"
												onSuccess={(url) => setResumeUrl(url)}
												currentUrl={resumeUrl}
												label={job.isResumeRequired ? t("applyModal.uploadResumeRequired") : t("applyModal.uploadResumeOptional")}
												className="mb-2"
											/>
											<p className="text-xs text-slate-500">{t("applyModal.supportedFormats")}</p>
										</div>

										<div>
											<label className="block text-sm font-semibold text-slate-700 mb-2">
												{t("applyModal.coverLetter")} <span className="text-slate-400 font-normal">({t("applyModal.optional")})</span>
											</label>
											<textarea
												value={coverLetter}
												onChange={(e) => setCoverLetter(e.target.value)}
												rows={4}
												className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow resize-none bg-slate-50 focus:bg-white"
												placeholder={t("applyModal.messageToEmployerPlaceholder")}
											/>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">
													{t("applyModal.expectedSalary")} <span className="text-slate-400 font-normal">({t("applyModal.optional")})</span>
												</label>
												<div className="relative">
													<span className="absolute left-3 top-3 text-slate-400">₹</span>
													<input
														type="number"
														value={expectedSalary}
														onChange={(e) => setExpectedSalary(e.target.value)}
														className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-slate-50 focus:bg-white"
														placeholder="0"
													/>
												</div>
											</div>

											<div>
												<label className="block text-sm font-semibold text-slate-700 mb-2">
													{t("applyModal.noticePeriod")} <span className="text-slate-400 font-normal">({t("applyModal.noticePeriodDays")})</span>
												</label>
												<input
													type="number"
													value={noticePeriodDays}
													onChange={(e) => setNoticePeriodDays(e.target.value)}
													className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow bg-slate-50 focus:bg-white"
													placeholder={t("applyModal.noticePeriodPlaceholder")}
												/>
											</div>
										</div>
									</div>
								)}

								{applyError && (
									<div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-2 mt-4">
										<XCircle className="w-5 h-5 shrink-0 mt-0.5" />
										{applyError}
									</div>
								)}

								<div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
									<button
										onClick={() => {
											setShowApplyModal(false);
											setApplyError(null);
										}}
										className="flex-1 px-6 py-3 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
									>
										{t("applyModal.cancel")}
									</button>
									<button
										onClick={handleApply}
										disabled={applying}
										className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
									>
										{applying ? (
											<span className="flex items-center justify-center gap-2">
												<span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
												{t("applyModal.sending")}
											</span>
										) : (
											t("applyModal.submitApplication")
										)}
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
