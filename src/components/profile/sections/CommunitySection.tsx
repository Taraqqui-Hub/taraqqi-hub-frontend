/**
 * Community Section (Optional, Consent-Gated)
 * Religion, caste, community affiliation
 */

import { useState } from "react";
import { Shield, AlertTriangle, Check, Save, Loader2 } from "lucide-react";

interface CommunityData {
	religion?: string;
	casteCategory?: string;
	subCaste?: string;
	minoritySelfIdentification?: string;
	communityAffiliation?: string;
	consent?: boolean;
}

interface CommunitySectionProps {
	data: Partial<CommunityData>;
	onChange: (data: Partial<CommunityData>) => void;
	onSave: () => Promise<void>;
	saving?: boolean;
}

const RELIGIONS = [
	{ value: "hindu", label: "Hindu" },
	{ value: "muslim", label: "Muslim" },
	{ value: "christian", label: "Christian" },
	{ value: "sikh", label: "Sikh" },
	{ value: "buddhist", label: "Buddhist" },
	{ value: "jain", label: "Jain" },
	{ value: "other", label: "Other" },
	{ value: "prefer_not", label: "Prefer not to say" }
];

const CASTE_CATEGORIES = [
	{ value: "general", label: "General" },
	{ value: "obc", label: "OBC" },
	{ value: "sc", label: "SC" },
	{ value: "st", label: "ST" },
	{ value: "ews", label: "EWS" },
];

export default function CommunitySection({ data, onChange, onSave, saving }: CommunitySectionProps) {
	const [consentGiven, setConsentGiven] = useState(data.consent || false);

	const handleConsentChange = (checked: boolean) => {
		setConsentGiven(checked);
		onChange({ ...data, consent: checked });
	};

	return (
		<div className="space-y-4">
			{/* Consent Warning */}
			<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
				<div className="flex items-start gap-2">
					<AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
					<div>
						<h4 className="font-medium text-amber-800 mb-0.5 text-sm">Optional & Confidential</h4>
						<p className="text-xs text-amber-700">
							Helps us connect you with relevant government schemes. Visible only to admins. You can skip this.
						</p>
					</div>
				</div>
			</div>

			{/* Consent Checkbox */}
			<label className="flex items-start gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-200 transition-all">
				<input
					type="checkbox"
					checked={consentGiven}
					onChange={e => handleConsentChange(e.target.checked)}
					className="mt-0.5 w-4 h-4 text-blue-600 rounded"
				/>
				<div>
					<span className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
						<Shield size={16} />
						I want to share my community information
					</span>
					<p className="text-xs text-gray-500 mt-0.5">
						Optional and confidential.
					</p>
				</div>
			</label>

			{consentGiven && (
				<div className="space-y-3 animate-fadeIn">
					{/* Religion */}
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Religion</label>
						<select
							value={data.religion || ""}
							onChange={e => onChange({ ...data, religion: e.target.value })}
							className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
						>
							<option value="">Select</option>
							{RELIGIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
						</select>
					</div>

					{/* Caste Category */}
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1.5">Caste Category</label>
						<div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
							{CASTE_CATEGORIES.map(cat => (
								<button
									key={cat.value}
									type="button"
									onClick={() => onChange({ ...data, casteCategory: cat.value })}
									className={`
										px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
										${data.casteCategory === cat.value
											? 'border-blue-500 bg-blue-50 text-blue-700'
											: 'border-gray-200 text-gray-600 hover:border-gray-300'}
									`}
								>
									{cat.label}
								</button>
							))}
						</div>
					</div>

					{/* Sub Caste (optional) */}
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Sub-Caste (If applicable)</label>
						<input
							type="text"
							value={data.subCaste || ""}
							onChange={e => onChange({ ...data, subCaste: e.target.value })}
							placeholder="Enter sub-caste"
							className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
						/>
					</div>

					{/* Community Affiliation */}
					<div>
						<label className="block text-xs font-medium text-gray-700 mb-1">Community Organization (If any)</label>
						<input
							type="text"
							value={data.communityAffiliation || ""}
							onChange={e => onChange({ ...data, communityAffiliation: e.target.value })}
							placeholder="Community group or organization"
							className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
						/>
					</div>
				</div>
			)}

			{/* Save Button */}
			<button
				onClick={onSave}
				disabled={saving || !consentGiven}
				className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
			>
				{!consentGiven ? (
					<>
						<Shield size={16} />
						Give consent to save
					</>
				) : saving ? (
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
