/**
 * Education Section
 * Multiple education records with add/remove functionality
 * Includes polite handling for users without formal education
 */

import { useState, useEffect } from "react";
import { GraduationCap, Plus, Trash2, School, Calendar, Award, Heart, Sparkles, Check } from "lucide-react";

interface EducationRecord {
	id?: string;
	level: string;
	institution: string;
	boardOrUniversity?: string;
	yearOfPassing: number;
	gradeOrPercentage?: string;
}

interface EducationSectionProps {
	records: EducationRecord[];
	onAdd: (record: Omit<EducationRecord, 'id'>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	saving?: boolean;
	onMarkNoFormalEducation?: () => Promise<void>;
	hasNoFormalEducation?: boolean;
}

const EDUCATION_LEVELS = [
	{ value: "no_education", label: "No Formal Education" },
	{ value: "below_10th", label: "Below 10th Class" },
	{ value: "10th", label: "10th Class" },
	{ value: "12th", label: "12th Class" },
	{ value: "iti", label: "ITI / Vocational Training" },
	{ value: "diploma", label: "Diploma" },
	{ value: "ug", label: "Graduate (UG)" },
	{ value: "pg", label: "Post Graduate (PG)" },
	{ value: "phd", label: "PhD / Doctorate" },
	{ value: "other", label: "Other" },
];

export default function EducationSection({ 
	records, 
	onAdd, 
	onDelete, 
	saving,
	onMarkNoFormalEducation,
	hasNoFormalEducation = false 
}: EducationSectionProps) {
	const [educationPath, setEducationPath] = useState<"formal" | "no_formal" | null>(null);
	const [showForm, setShowForm] = useState(false);
	const [newRecord, setNewRecord] = useState<Omit<EducationRecord, 'id'>>({
		level: "",
		institution: "",
		boardOrUniversity: "",
		yearOfPassing: new Date().getFullYear(),
		gradeOrPercentage: "",
	});

	// Sync state with props - handle all edge cases properly
	useEffect(() => {
		// If we are actively adding a record, force 'formal' mode regardless of other flags
		if (showForm) {
			setEducationPath("formal");
			return;
		}

		// Priority: hasNoFormalEducation > records.length > null
		if (hasNoFormalEducation) {
			setEducationPath("no_formal");
		} else if (records.length > 0) {
			setEducationPath("formal");
		} else {
			// If not showing form and no records/flag, reset to selection state
			setEducationPath(null);
		}
	}, [records.length, hasNoFormalEducation, showForm]);

	const handleAdd = async () => {
		await onAdd(newRecord);
		setNewRecord({
			level: "",
			institution: "",
			boardOrUniversity: "",
			yearOfPassing: new Date().getFullYear(),
			gradeOrPercentage: "",
		});
		setShowForm(false);
	};

	const handleNoFormalEducation = async () => {
		setEducationPath("no_formal");
		setShowForm(false); // Ensure form is hidden when selecting no formal education
		if (onMarkNoFormalEducation) {
			await onMarkNoFormalEducation();
		}
	};

	// If user hasn't selected a path yet
	if (educationPath === null && records.length === 0) {
		return (
			<div className="space-y-4">
				<p className="text-gray-600 text-sm mb-4">
					Tell us about your educational background. This helps us find the right opportunities for you.
				</p>
				
				{/* Choice Cards */}
				<div className="grid grid-cols-1 gap-3">
					<button
						type="button"
						onClick={() => {
							setEducationPath("formal");
							setShowForm(true);
						}}
						className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
					>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
								<GraduationCap size={22} />
							</div>
							<div>
								<p className="font-medium text-gray-800">I have formal education</p>
								<p className="text-sm text-gray-500 mt-0.5">Add your school, college, or other educational qualifications</p>
							</div>
						</div>
					</button>

					<button
						type="button"
						onClick={handleNoFormalEducation}
						className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all text-left group"
					>
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-200 transition-colors">
								<Heart size={22} />
							</div>
							<div>
								<p className="font-medium text-gray-800">I haven't had formal schooling</p>
								<p className="text-sm text-gray-500 mt-0.5">That's completely okay! Your skills and experience matter most</p>
							</div>
						</div>
					</button>
				</div>
			</div>
		);
	}

	// User selected "No formal education"
	if (educationPath === "no_formal") {
		return (
			<div className="space-y-4">
				{/* Supportive Message */}
				<div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
					<div className="flex items-start gap-3">
						<div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
							<Sparkles size={24} />
						</div>
						<div>
							<h4 className="font-semibold text-green-800 text-lg">You're all set!</h4>
							<p className="text-green-700 mt-1">
								No problem at all! Many successful people learned through experience rather than 
								formal schooling. Your practical skills, life experience, and dedication matter 
								more than any degree.
							</p>
							<p className="text-green-600 text-sm mt-3 flex items-center gap-1">
								<Award size={16} />
								We'll focus on highlighting your skills and work experience to employers.
							</p>
						</div>
					</div>
				</div>

				{/* Option to change */}
				<button
					type="button"
					onClick={async () => {
						// First, we need to clear the "no formal education" flag
						// This will be handled by adding an education record, which will override the flag
						setEducationPath("formal");
						setShowForm(true);
					}}
					className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
				>
					Actually, I'd like to add education details
				</button>

				{/* Completion hint */}
				<p className="mt-4 text-sm text-blue-600 flex items-center justify-center gap-1">
					<Check size={16} />
					Employers can now see your education background.
				</p>
			</div>
		);
	}

	// User has formal education - show records and form
	return (
		<div className="space-y-4">
			{/* Existing Records */}
			{records.length > 0 && (
				<div className="space-y-3">
					{records.map((edu) => (
						<div 
							key={edu.id}
							className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
						>
							<div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
								<GraduationCap size={20} />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-gray-800">{edu.institution}</p>
								<p className="text-sm text-gray-500">
									{EDUCATION_LEVELS.find(l => l.value === edu.level)?.label || edu.level} • {edu.yearOfPassing}
									{edu.gradeOrPercentage && ` • ${edu.gradeOrPercentage}`}
								</p>
							</div>
							<button
								onClick={() => edu.id && onDelete(edu.id)}
								className="text-red-500 hover:text-red-700 p-1"
								title="Remove"
							>
								<Trash2 size={18} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Add New Button */}
			{!showForm && (
				<button
					onClick={() => setShowForm(true)}
					className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
				>
					<Plus size={20} />
					Add Education
				</button>
			)}

			{/* Add Form */}
			{showForm && (
				<div className="p-4 border-2 border-blue-200 bg-blue-50/50 rounded-lg space-y-4">
					<h4 className="font-medium text-gray-800 flex items-center gap-2">
						<GraduationCap size={18} />
						Add Education Details
					</h4>
					
					{/* Level */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Education Level <span className="text-red-500">*</span>
						</label>
						<select
							value={newRecord.level}
							onChange={e => setNewRecord({ ...newRecord, level: e.target.value })}
							className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
						>
							<option value="">Select Level</option>
							{EDUCATION_LEVELS.filter(l => l.value !== "no_education").map(l => (
								<option key={l.value} value={l.value}>{l.label}</option>
							))}
						</select>
					</div>

					{/* Institution */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							School/College Name <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<School size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								value={newRecord.institution}
								onChange={e => setNewRecord({ ...newRecord, institution: e.target.value })}
								placeholder="e.g., Government School, Delhi University"
								className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
							/>
						</div>
					</div>

					{/* Year & Grade */}
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Year of Passing <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="number"
									value={newRecord.yearOfPassing}
									onChange={e => setNewRecord({ ...newRecord, yearOfPassing: parseInt(e.target.value) || 0 })}
									min={1970}
									max={new Date().getFullYear() + 5}
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Marks/Grade</label>
							<div className="relative">
								<Award size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="text"
									value={newRecord.gradeOrPercentage || ""}
									onChange={e => setNewRecord({ ...newRecord, gradeOrPercentage: e.target.value })}
									placeholder="e.g., 85% or A+"
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<button
							onClick={() => setShowForm(false)}
							className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleAdd}
							disabled={saving || !newRecord.level || !newRecord.institution || !newRecord.yearOfPassing}
							className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 font-medium min-h-[48px]"
						>
							{saving ? "Adding..." : "Add Education"}
						</button>
					</div>
				</div>
			)}

			{/* Option to switch */}
			{records.length === 0 && !showForm && (
				<button
					type="button"
					onClick={handleNoFormalEducation}
					className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
				>
					I don't have formal education
				</button>
			)}

			{records.length > 0 && (
				<p className="text-center text-sm text-blue-600 flex items-center justify-center gap-1">
					<Award size={16} />
					Employers can now see your education background.
				</p>
			)}
		</div>
	);
}
