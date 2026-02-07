/**
 * Job Detail Page - Full job information with apply functionality
 * Similar to LinkedIn/Naukri job detail pages
 */

import { useEffect, useState } from "react";
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
	Calendar,
	User,
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
} from "lucide-react";

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
	expiresAt: string | null;
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
	} | null;
	hasApplied: boolean;
}

export default function JobDetailPage() {
	const router = useRouter();
	const { id } = router.query;
	const [job, setJob] = useState<Job | null>(null);
	const [loading, setLoading] = useState(true);
	const [applying, setApplying] = useState(false);
	const [applyError, setApplyError] = useState<string | null>(null);
	const [showApplyModal, setShowApplyModal] = useState(false);
	const [coverLetter, setCoverLetter] = useState("");
	const [expectedSalary, setExpectedSalary] = useState("");
	const [noticePeriodDays, setNoticePeriodDays] = useState("");

	useEffect(() => {
		if (id) {
			loadJob();
		}
	}, [id]);

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
			});

			setShowApplyModal(false);
			setCoverLetter("");
			setExpectedSalary("");
			setNoticePeriodDays("");
			loadJob(); // Refresh to show "Applied" status
			alert("Application submitted successfully!");
		} catch (err: any) {
			setApplyError(err.response?.data?.error || "Failed to submit application");
		} finally {
			setApplying(false);
		}
	};

	const formatSalary = (min: string | null, max: string | null, type: string | null, hide: boolean | null) => {
		if (hide) return "Not disclosed";
		if (!min && !max) return "Not specified";
		const minVal = min ? parseInt(min) : null;
		const maxVal = max ? parseInt(max) : null;
		const typeLabel = type === "yearly" ? "LPA" : type === "monthly" ? "PM" : "";
		if (minVal && maxVal) return `₹${minVal} - ₹${maxVal} ${typeLabel}`;
		if (minVal) return `₹${minVal}+ ${typeLabel}`;
		if (maxVal) return `Up to ₹${maxVal} ${typeLabel}`;
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

	if (loading) {
		return (
			<ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
				<DashboardLayout>
					<div className="max-w-5xl mx-auto px-4 py-8">
						<div className="flex justify-center items-center py-24">
							<div className="relative">
								<div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
								<div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
							</div>
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
					<div className="max-w-5xl mx-auto px-4 py-8">
						<div className="text-center py-16">
							<XCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
							<h2 className="text-2xl font-bold text-slate-900 mb-2">Job not found</h2>
							<p className="text-slate-600 mb-6">This job may have been removed or is no longer available.</p>
							<Link href="/jobs" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
								Browse Jobs
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
				<div className="max-w-5xl mx-auto px-4 py-6">
					{/* Back Link */}
					<Link
						href="/jobs"
						className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm"
					>
						← Back to Jobs
					</Link>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Header Card */}
							<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
								{/* Badges */}
								{job.badges && job.badges.length > 0 && (
									<div className="flex items-center gap-2 mb-4">
										{job.badges.map((badge, idx) => (
											<span
												key={idx}
												className={`px-3 py-1 text-xs font-semibold rounded-full ${
													badge === "Featured"
														? "bg-indigo-100 text-indigo-700"
														: badge === "Urgent"
														? "bg-red-100 text-red-700"
														: "bg-amber-100 text-amber-700"
												}`}
											>
												{badge === "Featured" && <Star className="w-3 h-3 inline mr-1" />}
												{badge === "Urgent" && <Zap className="w-3 h-3 inline mr-1" />}
												{badge === "Promoted" && <TrendingUp className="w-3 h-3 inline mr-1" />}
												{badge}
											</span>
										))}
									</div>
								)}

								{/* Title */}
								<h1 className="text-3xl font-bold text-slate-900 mb-4">{job.title}</h1>

								{/* Company Info */}
								{job.company && (
									<div className="flex items-center gap-3 mb-4">
										{job.company.logoUrl ? (
											<img
												src={job.company.logoUrl}
												alt={job.company.brandName || job.company.companyName || "Company"}
												className="w-12 h-12 rounded-lg object-cover"
											/>
										) : (
											<div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
												<Building2 className="w-6 h-6 text-slate-400" />
											</div>
										)}
										<div>
											<div className="flex items-center gap-2">
												<h2 className="text-lg font-semibold text-slate-900">
													{job.company.brandName || job.company.companyName || "Company"}
												</h2>
												{job.company.isVerified && (
													<CheckCircle2 className="w-5 h-5 text-indigo-600" />
												)}
											</div>
											{job.company.industry && (
												<p className="text-sm text-slate-600">{job.company.industry}</p>
											)}
										</div>
									</div>
								)}

								{/* Quick Info */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
									{job.city && (
										<div className="flex items-center gap-2 text-slate-600">
											<MapPin className="w-4 h-4 text-slate-400" />
											<span className="text-sm">
												{job.city}
												{job.area && `, ${job.area}`}
											</span>
										</div>
									)}
									{job.jobType && (
										<div className="flex items-center gap-2 text-slate-600">
											<Briefcase className="w-4 h-4 text-slate-400" />
											<span className="text-sm capitalize">{job.jobType.replace("-", " ")}</span>
										</div>
									)}
									{job.locationType && (
										<div className="flex items-center gap-2 text-slate-600">
											<Clock className="w-4 h-4 text-slate-400" />
											<span className="text-sm capitalize">{job.locationType}</span>
										</div>
									)}
									{(job.salaryMin || job.salaryMax) && !job.hideSalary && (
										<div className="flex items-center gap-2 text-slate-600">
											<DollarSign className="w-4 h-4 text-slate-400" />
											<span className="text-sm">
												{formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.hideSalary)}
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Job Description */}
							<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
								<h2 className="text-xl font-bold text-slate-900 mb-4">Job Description</h2>
								{job.roleSummary && (
									<div className="mb-4">
										<h3 className="font-semibold text-slate-900 mb-2">Role Summary</h3>
										<p className="text-slate-700 whitespace-pre-wrap">{job.roleSummary}</p>
									</div>
								)}
								{job.description && (
									<div className="mb-4">
										<p className="text-slate-700 whitespace-pre-wrap">{job.description}</p>
									</div>
								)}
								{job.responsibilities && (
									<div className="mb-4">
										<h3 className="font-semibold text-slate-900 mb-2">Key Responsibilities</h3>
										<div className="text-slate-700 whitespace-pre-wrap">{job.responsibilities}</div>
									</div>
								)}
								{job.requirements && (
									<div>
										<h3 className="font-semibold text-slate-900 mb-2">Requirements</h3>
										<div className="text-slate-700 whitespace-pre-wrap">{job.requirements}</div>
									</div>
								)}
							</div>

							{/* Skills & Experience */}
							<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
								<h2 className="text-xl font-bold text-slate-900 mb-4">Requirements</h2>
								<div className="space-y-4">
									{formatExperience(job.minExperienceYears, job.maxExperienceYears) !== "Not specified" && (
										<div>
											<h3 className="font-semibold text-slate-900 mb-2">Experience</h3>
											<p className="text-slate-700">
												{formatExperience(job.minExperienceYears, job.maxExperienceYears)}
											</p>
										</div>
									)}
									{job.skillsRequired && job.skillsRequired.length > 0 && (
										<div>
											<h3 className="font-semibold text-slate-900 mb-2">Required Skills</h3>
											<div className="flex flex-wrap gap-2">
												{job.skillsRequired.map((skill, idx) => (
													<span
														key={idx}
														className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
													>
														{skill}
													</span>
												))}
											</div>
										</div>
									)}
									{job.educationRequired && (
										<div>
											<h3 className="font-semibold text-slate-900 mb-2">Education</h3>
											<p className="text-slate-700">{job.educationRequired}</p>
										</div>
									)}
								</div>
							</div>

							{/* Benefits */}
							{job.benefits && job.benefits.length > 0 && (
								<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
									<h2 className="text-xl font-bold text-slate-900 mb-4">Benefits</h2>
									<div className="grid grid-cols-2 gap-2">
										{job.benefits.map((benefit, idx) => (
											<div key={idx} className="flex items-center gap-2 text-slate-700">
												<CheckCircle2 className="w-4 h-4 text-green-600" />
												<span>{benefit}</span>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Additional Info */}
							<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
								<h2 className="text-xl font-bold text-slate-900 mb-4">Additional Information</h2>
								<div className="space-y-2 text-sm">
									{job.preferredLanguage && (
										<div className="flex justify-between">
											<span className="text-slate-600">Preferred Language:</span>
											<span className="text-slate-900 font-medium">{job.preferredLanguage}</span>
										</div>
									)}
									{job.freshersAllowed !== null && (
										<div className="flex justify-between">
											<span className="text-slate-600">Freshers Allowed:</span>
											<span className="text-slate-900 font-medium">
												{job.freshersAllowed ? "Yes" : "No"}
											</span>
										</div>
									)}
									{job.isSalaryNegotiable !== null && (
										<div className="flex justify-between">
											<span className="text-slate-600">Salary Negotiable:</span>
											<span className="text-slate-900 font-medium">
												{job.isSalaryNegotiable ? "Yes" : "No"}
											</span>
										</div>
									)}
									{job.applicationDeadline && (
										<div className="flex justify-between">
											<span className="text-slate-600">Application Deadline:</span>
											<span className="text-slate-900 font-medium">
												{new Date(job.applicationDeadline).toLocaleDateString()}
											</span>
										</div>
									)}
									{job.publishedAt && (
										<div className="flex justify-between">
											<span className="text-slate-600">Posted:</span>
											<span className="text-slate-900 font-medium">
												{new Date(job.publishedAt).toLocaleDateString()}
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="lg:col-span-1">
							<div className="sticky top-6 space-y-4">
								{/* Apply Card */}
								<div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
									{job.hasApplied ? (
										<div className="text-center">
											<CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
											<h3 className="text-lg font-bold text-slate-900 mb-2">Application Submitted</h3>
											<p className="text-slate-600 text-sm mb-4">
												Your application has been submitted successfully.
											</p>
											<Link
												href="/applications"
												className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
											>
												View Application
											</Link>
										</div>
									) : (
										<>
											<button
												onClick={() => setShowApplyModal(true)}
												className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center justify-center gap-2 mb-4"
											>
												<Send className="w-5 h-5" />
												Apply Now
											</button>
											<div className="space-y-2 text-sm text-slate-600">
												<div className="flex items-center gap-2">
													<Calendar className="w-4 h-4" />
													<span>
														{job.applicationsCount || 0} application
														{(job.applicationsCount || 0) !== 1 ? "s" : ""}
													</span>
												</div>
												<div className="flex items-center gap-2">
													<Clock className="w-4 h-4" />
													<span>{job.viewsCount || 0} views</span>
												</div>
											</div>
										</>
									)}
								</div>

								{/* Quick Actions */}
								<div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
									<div className="space-y-2">
										<button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
											<Bookmark className="w-4 h-4" />
											<span className="text-sm">Save Job</span>
										</button>
										<button className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-700 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
											<Share2 className="w-4 h-4" />
											<span className="text-sm">Share</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Apply Modal */}
				{showApplyModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
							<h2 className="text-2xl font-bold text-slate-900 mb-4">Apply for {job.title}</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Cover Letter (Optional)
									</label>
									<textarea
										value={coverLetter}
										onChange={(e) => setCoverLetter(e.target.value)}
										rows={4}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="Tell the employer why you're a good fit..."
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Expected Salary (Optional)
									</label>
									<input
										type="number"
										value={expectedSalary}
										onChange={(e) => setExpectedSalary(e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="₹"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Notice Period (Days, Optional)
									</label>
									<input
										type="number"
										value={noticePeriodDays}
										onChange={(e) => setNoticePeriodDays(e.target.value)}
										className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
										placeholder="e.g., 30"
									/>
								</div>

								{applyError && (
									<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
										{applyError}
									</div>
								)}

								<div className="flex gap-3">
									<button
										onClick={() => {
											setShowApplyModal(false);
											setApplyError(null);
										}}
										className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
									>
										Cancel
									</button>
									<button
										onClick={handleApply}
										disabled={applying}
										className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{applying ? "Submitting..." : "Submit Application"}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</DashboardLayout>
		</ProtectedRoute>
	);
}
