/**
 * Post New Job Page
 */

import { useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

export default function PostJobPage() {
	const router = useRouter();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [moderationIssues, setModerationIssues] = useState<string[]>([]);

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		requirements: "",
		responsibilities: "",
		jobType: "full-time",
		experienceLevel: "",
		category: "",
		skillsRequired: "",
		locationType: "onsite",
		city: "",
		state: "",
		salaryMin: "",
		salaryMax: "",
		hideSalary: false,
		minExperienceYears: 0,
		maxExperienceYears: "",
		educationRequired: "",
		applicationDeadline: "",
		status: "draft",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setSaving(true);
		setError(null);
		setModerationIssues([]);

		try {
			const data = {
				...formData,
				skillsRequired: formData.skillsRequired.split(",").map((s) => s.trim()).filter(Boolean),
				salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
				salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
				maxExperienceYears: formData.maxExperienceYears
					? parseInt(formData.maxExperienceYears)
					: undefined,
				applicationDeadline: formData.applicationDeadline || undefined,
			};

			const response = await api.post("/employer/jobs", data);

			router.push(`/jobs/manage`);
		} catch (err: any) {
			const errData = err.response?.data;
			if (errData?.reason?.issues) {
				setModerationIssues(errData.reason.issues);
			}
			setError(errData?.message || "Failed to create job");
		} finally {
			setSaving(false);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? (e.target as HTMLInputElement).checked
					: type === "number"
					? parseInt(value) || 0
					: value,
		}));
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Post New Job</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						{error && (
							<div className="bg-red-50 text-red-600 p-4 rounded-lg">
								<p className="font-medium">{error}</p>
								{moderationIssues.length > 0 && (
									<ul className="mt-2 list-disc list-inside text-sm">
										{moderationIssues.map((issue, i) => (
											<li key={i}>{issue}</li>
										))}
									</ul>
								)}
							</div>
						)}

						{/* Basic Info */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4">Job Details</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Job Title *
									</label>
									<input
										type="text"
										name="title"
										value={formData.title}
										onChange={handleChange}
										required
										placeholder="e.g. Senior Software Engineer"
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Description * (min 50 characters)
									</label>
									<textarea
										name="description"
										value={formData.description}
										onChange={handleChange}
										required
										rows={6}
										placeholder="Describe the role, responsibilities, and what success looks like..."
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
									<p className="text-xs text-slate-500 mt-1">
										{formData.description.length} / 50 characters
									</p>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Job Type *
										</label>
										<select
											name="jobType"
											value={formData.jobType}
											onChange={handleChange}
											required
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="full-time">Full Time</option>
											<option value="part-time">Part Time</option>
											<option value="contract">Contract</option>
											<option value="internship">Internship</option>
											<option value="freelance">Freelance</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Experience Level
										</label>
										<select
											name="experienceLevel"
											value={formData.experienceLevel}
											onChange={handleChange}
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										>
											<option value="">Select</option>
											<option value="fresher">Fresher</option>
											<option value="junior">Junior</option>
											<option value="mid">Mid-Level</option>
											<option value="senior">Senior</option>
											<option value="lead">Lead</option>
											<option value="executive">Executive</option>
										</select>
									</div>
								</div>
							</div>
						</div>

						{/* Skills */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4">Skills & Requirements</h2>

							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Required Skills (comma separated)
									</label>
									<input
										type="text"
										name="skillsRequired"
										value={formData.skillsRequired}
										onChange={handleChange}
										placeholder="React, Node.js, PostgreSQL"
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>

								<div className="grid gap-4 md:grid-cols-2">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Min Experience (years)
										</label>
										<input
											type="number"
											name="minExperienceYears"
											value={formData.minExperienceYears}
											onChange={handleChange}
											min="0"
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">
											Max Experience (years)
										</label>
										<input
											type="number"
											name="maxExperienceYears"
											value={formData.maxExperienceYears}
											onChange={handleChange}
											min="0"
											className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Location */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4">Location</h2>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Location Type
									</label>
									<select
										name="locationType"
										value={formData.locationType}
										onChange={handleChange}
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									>
										<option value="onsite">On-site</option>
										<option value="remote">Remote</option>
										<option value="hybrid">Hybrid</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										City *
									</label>
									<input
										type="text"
										name="city"
										value={formData.city}
										onChange={handleChange}
										required
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
							</div>
						</div>

						{/* Salary */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4">Compensation</h2>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Min Salary (₹/year)
									</label>
									<input
										type="number"
										name="salaryMin"
										value={formData.salaryMin}
										onChange={handleChange}
										min="0"
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Max Salary (₹/year)
									</label>
									<input
										type="number"
										name="salaryMax"
										value={formData.salaryMax}
										onChange={handleChange}
										min="0"
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
							</div>

							<div className="mt-4">
								<label className="flex items-center">
									<input
										type="checkbox"
										name="hideSalary"
										checked={formData.hideSalary}
										onChange={handleChange}
										className="w-4 h-4 text-[#2563EB] rounded"
									/>
									<span className="ml-2 text-sm text-slate-700">
										Hide salary from job listing
									</span>
								</label>
							</div>
						</div>

						{/* Publish Options */}
						<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
							<h2 className="text-lg font-semibold mb-4">Publishing</h2>

							<div className="grid gap-4 md:grid-cols-2">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Status
									</label>
									<select
										name="status"
										value={formData.status}
										onChange={handleChange}
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									>
										<option value="draft">Save as Draft</option>
										<option value="active">Publish Now</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">
										Application Deadline
									</label>
									<input
										type="date"
										name="applicationDeadline"
										value={formData.applicationDeadline}
										onChange={handleChange}
										className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
								</div>
							</div>
						</div>

						<div className="flex gap-4">
							<button
								type="button"
								onClick={() => router.back()}
								className="flex-1 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={saving}
								className="flex-1 py-3 bg-[#2563EB] text-white font-semibold rounded-lg hover:from-[#1E40AF] hover:to-blue-700 disabled:opacity-50"
							>
								{saving ? "Posting..." : formData.status === "active" ? "Publish Job" : "Save Draft"}
							</button>
						</div>
					</form>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
