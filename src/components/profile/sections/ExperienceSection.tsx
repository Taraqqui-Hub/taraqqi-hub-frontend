/**
 * Experience Section
 * Work experience records with add/remove/edit functionality
 */

import { useState } from "react";
import { Briefcase, Building2, Calendar, Plus, Trash2, GraduationCap, Check } from "lucide-react";

interface ExperienceRecord {
	id?: string;
	companyName: string;
	jobTitle: string;
	startDate?: string;
	endDate?: string;
	isCurrent: boolean;
	leavingReason?: string;
	salaryRange?: string;
}

interface ExperienceSectionProps {
	records: ExperienceRecord[];
	onAdd: (record: Omit<ExperienceRecord, 'id'>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onMarkFresher?: () => void;
	saving?: boolean;
}

export default function ExperienceSection({ records, onAdd, onDelete, onMarkFresher, saving }: ExperienceSectionProps) {
	const [showForm, setShowForm] = useState(records.length === 0);
	const [isFresher, setIsFresher] = useState(false);
	const [newRecord, setNewRecord] = useState<Omit<ExperienceRecord, 'id'>>({
		companyName: "",
		jobTitle: "",
		startDate: "",
		endDate: "",
		isCurrent: false,
		salaryRange: "",
	});

	const handleAdd = async () => {
		await onAdd(newRecord);
		setNewRecord({
			companyName: "",
			jobTitle: "",
			startDate: "",
			endDate: "",
			isCurrent: false,
			salaryRange: "",
		});
		setShowForm(false);
	};

	const handleFresher = () => {
		setIsFresher(true);
		onMarkFresher?.();
	};

	// Show fresher option if no records
	if (records.length === 0 && !showForm && !isFresher) {
		return (
			<div className="space-y-4">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<button
						onClick={() => setShowForm(true)}
						className="p-6 border-2 border-dashed border-blue-300 rounded-xl text-center hover:bg-blue-50 transition-all"
					>
						<div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
							<Briefcase size={24} />
						</div>
						<p className="font-medium text-gray-800">I have work experience</p>
						<p className="text-sm text-gray-500">Add your job details</p>
					</button>
					<button
						onClick={handleFresher}
						className="p-6 border-2 border-dashed border-green-300 rounded-xl text-center hover:bg-green-50 transition-all"
					>
						<div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center text-green-600">
							<GraduationCap size={24} />
						</div>
						<p className="font-medium text-gray-800">I am a fresher</p>
						<p className="text-sm text-gray-500">No work experience yet</p>
					</button>
				</div>
			</div>
		);
	}

	if (isFresher) {
		return (
			<div className="text-center py-6">
				<div className="w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center text-green-600">
					<GraduationCap size={32} />
				</div>
				<h4 className="font-semibold text-gray-800 mb-1">Great! You&apos;re a fresher</h4>
				<p className="text-sm text-gray-500 mb-4">Everyone starts somewhere!</p>
				<button
					onClick={() => setIsFresher(false)}
					className="text-sm text-blue-600 hover:underline"
				>
					Actually, I do have some experience
				</button>
				<p className="mt-4 text-sm text-blue-600 flex items-center justify-center gap-1">
					<Check size={16} />
					Your potential matters. We&apos;ll match entry-level roles for you.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Existing Records */}
			{records.length > 0 && (
				<div className="space-y-3">
					{records.map((exp) => (
						<div 
							key={exp.id}
							className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100"
						>
							<div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
								<Briefcase size={20} />
							</div>
							<div className="flex-1 min-w-0">
								<p className="font-medium text-gray-800">{exp.jobTitle}</p>
								<p className="text-sm text-gray-600">{exp.companyName}</p>
								<p className="text-xs text-gray-400">
									{exp.startDate && new Date(exp.startDate).getFullYear()}
									{" — "}
									{exp.isCurrent ? "Present" : exp.endDate && new Date(exp.endDate).getFullYear()}
								</p>
							</div>
							<button
								onClick={() => exp.id && onDelete(exp.id)}
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
					Add Another Job
				</button>
			)}

			{/* Add Form */}
			{showForm && (
				<div className="p-4 border-2 border-blue-200 bg-blue-50/50 rounded-lg space-y-4">
					<h4 className="font-medium text-gray-800 flex items-center gap-2">
						<Briefcase size={18} />
						Add Work Experience
					</h4>
					
					{/* Company & Title */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Company Name <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="text"
									value={newRecord.companyName}
									onChange={e => setNewRecord({ ...newRecord, companyName: e.target.value })}
									placeholder="e.g., ABC Company"
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Job Title <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="text"
									value={newRecord.jobTitle}
									onChange={e => setNewRecord({ ...newRecord, jobTitle: e.target.value })}
									placeholder="e.g., Sales Executive"
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>
					</div>

					{/* Dates */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
							<div className="relative">
								<Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="date"
									value={newRecord.startDate}
									onChange={e => setNewRecord({ ...newRecord, startDate: e.target.value })}
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
								/>
							</div>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
							<div className="relative">
								<Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="date"
									value={newRecord.endDate}
									onChange={e => setNewRecord({ ...newRecord, endDate: e.target.value })}
									disabled={newRecord.isCurrent}
									className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
								/>
							</div>
						</div>
					</div>

					{/* Currently working */}
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={newRecord.isCurrent}
							onChange={e => setNewRecord({ ...newRecord, isCurrent: e.target.checked, endDate: "" })}
							className="w-4 h-4 text-blue-600 rounded"
						/>
						<span className="text-sm text-gray-700">I currently work here</span>
					</label>

					{/* Actions */}
					<div className="flex gap-3">
						<button
							onClick={() => {
								setShowForm(false);
								if (records.length === 0) setIsFresher(false);
							}}
							className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
						>
							Cancel
						</button>
						<button
							onClick={handleAdd}
							disabled={saving || !newRecord.companyName || !newRecord.jobTitle}
							className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all font-medium min-h-[48px]"
						>
							{saving ? "Adding..." : "Add Experience"}
						</button>
					</div>
				</div>
			)}

			{records.length > 0 && (
				<p className="text-center text-sm text-blue-600 flex items-center justify-center gap-1">
					<Check size={16} />
					Your work story is now part of your profile.
				</p>
			)}
		</div>
	);
}
