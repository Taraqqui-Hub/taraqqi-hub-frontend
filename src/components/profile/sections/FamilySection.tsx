/**
 * Family Section (Optional/Bonus)
 * Family background information
 */

import { Users, Heart, Home, Save, Loader2, Info } from "lucide-react";

interface FamilyData {
	fatherName?: string;
	fatherOccupation?: string;
	fatherEducation?: string;
	motherName?: string;
	motherOccupation?: string;
	motherEducation?: string;
	siblingsCount?: number;
	familyStructure?: string;
	maritalStatus?: string;
}

interface FamilySectionProps {
	data: Partial<FamilyData>;
	onChange: (data: Partial<FamilyData>) => void;
	onSave: () => Promise<void>;
	saving?: boolean;
}

const FAMILY_STRUCTURES = [
	{ value: "nuclear", label: "Nuclear Family" },
	{ value: "joint", label: "Joint Family" },
	{ value: "single_parent", label: "Single Parent" },
	{ value: "other", label: "Other" }
];

const MARITAL_STATUS = [
	{ value: "single", label: "Single" },
	{ value: "married", label: "Married" },
	{ value: "divorced", label: "Divorced" },
	{ value: "widowed", label: "Widowed" }
];

export default function FamilySection({ data, onChange, onSave, saving }: FamilySectionProps) {
	return (
		<div className="space-y-4">
			{/* Trust message */}
			<div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-700 flex items-start gap-2">
				<Info size={16} className="flex-shrink-0 mt-0.5" />
				<div>
					<span className="font-medium">This is optional.</span> Helps us design better support programs. Visible only to platform admins.
				</div>
			</div>

			{/* Father's Details */}
			<div>
				<h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
					<Users size={16} />
					Father&apos;s Details
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						type="text"
						value={data.fatherName || ""}
						onChange={e => onChange({ ...data, fatherName: e.target.value })}
						placeholder="Father's Name"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
					<input
						type="text"
						value={data.fatherOccupation || ""}
						onChange={e => onChange({ ...data, fatherOccupation: e.target.value })}
						placeholder="Occupation"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
					<input
						type="text"
						value={data.fatherEducation || ""}
						onChange={e => onChange({ ...data, fatherEducation: e.target.value })}
						placeholder="Education"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
				</div>
			</div>

			{/* Mother's Details */}
			<div>
				<h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2 text-sm">
					<Heart size={16} />
					Mother&apos;s Details
				</h4>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						type="text"
						value={data.motherName || ""}
						onChange={e => onChange({ ...data, motherName: e.target.value })}
						placeholder="Mother's Name"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
					<input
						type="text"
						value={data.motherOccupation || ""}
						onChange={e => onChange({ ...data, motherOccupation: e.target.value })}
						placeholder="Occupation"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
					<input
						type="text"
						value={data.motherEducation || ""}
						onChange={e => onChange({ ...data, motherEducation: e.target.value })}
						placeholder="Education"
						className="px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
				</div>
			</div>

			{/* Family Structure */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Number of Siblings</label>
					<input
						type="number"
						value={data.siblingsCount ?? ""}
						onChange={e => onChange({ ...data, siblingsCount: parseInt(e.target.value) || 0 })}
						min={0}
						max={20}
						placeholder="0, 1, 2..."
						className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Family Type</label>
					<select
						value={data.familyStructure || ""}
						onChange={e => onChange({ ...data, familyStructure: e.target.value })}
						className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					>
						<option value="">Select</option>
						{FAMILY_STRUCTURES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
					</select>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Marital Status</label>
					<select
						value={data.maritalStatus || ""}
						onChange={e => onChange({ ...data, maritalStatus: e.target.value })}
						className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					>
						<option value="">Select</option>
						{MARITAL_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
					</select>
				</div>
			</div>

			{/* Save Button */}
			<button
				onClick={onSave}
				disabled={saving}
				className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
			>
				{saving ? (
					<>
						<Loader2 size={18} className="animate-spin" />
						Saving...
					</>
				) : (
					"Save & Continue"
				)}
			</button>
		</div>
	);
}
