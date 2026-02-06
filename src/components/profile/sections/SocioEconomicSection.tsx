/**
 * Socio-Economic Section (Optional/Bonus)
 * Income range, housing type, etc.
 */

import { Wallet, Home, Users, Save, Loader2, Lock } from "lucide-react";

interface SocioEconomicData {
	familyIncomeRange?: string;
	earningMembersCount?: number;
	dependentsCount?: number;
	housingType?: string;
}

interface SocioEconomicSectionProps {
	data: Partial<SocioEconomicData>;
	onChange: (data: Partial<SocioEconomicData>) => void;
	onSave: () => Promise<void>;
	saving?: boolean;
}

const INCOME_RANGES = [
	{ value: "0-2L", label: "Below ₹2 Lakh" },
	{ value: "2-5L", label: "₹2 - 5 Lakh" },
	{ value: "5-10L", label: "₹5 - 10 Lakh" },
	{ value: "10-20L", label: "₹10 - 20 Lakh" },
	{ value: "20L+", label: "Above ₹20 Lakh" },
];

const HOUSING_TYPES = [
	{ value: "owned", label: "Own House", icon: Home },
	{ value: "rented", label: "Rented", icon: Home },
	{ value: "family", label: "With Family", icon: Users },
	{ value: "hostel", label: "Hostel/PG", icon: Home },
];

export default function SocioEconomicSection({ data, onChange, onSave, saving }: SocioEconomicSectionProps) {
	return (
		<div className="space-y-4">
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-xs text-blue-700 flex items-start gap-2">
				<Lock size={16} className="flex-shrink-0 mt-0.5" />
				<span>Private information. Helps us find better opportunities for you.</span>
			</div>

			{/* Income Range */}
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
					<Wallet size={14} />
					Annual Family Income (Approximate)
				</label>
				<div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
					{INCOME_RANGES.map(range => (
						<button
							key={range.value}
							type="button"
							onClick={() => onChange({ ...data, familyIncomeRange: range.value })}
							className={`
								px-2 py-1.5 rounded-lg border-2 text-xs font-medium transition-all
								${data.familyIncomeRange === range.value
									? 'border-blue-500 bg-blue-50 text-blue-700'
									: 'border-gray-200 text-gray-600 hover:border-gray-300'}
							`}
						>
							{range.label}
						</button>
					))}
				</div>
			</div>

			{/* Earning & Dependents */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">
						Earning Members in Family
					</label>
					<input
						type="number"
						value={data.earningMembersCount ?? ""}
						onChange={e => onChange({ ...data, earningMembersCount: parseInt(e.target.value) || 0 })}
						min={0}
						max={20}
						placeholder="1, 2, 3..."
						className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
				</div>
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">
						Dependents
					</label>
					<input
						type="number"
						value={data.dependentsCount ?? ""}
						onChange={e => onChange({ ...data, dependentsCount: parseInt(e.target.value) || 0 })}
						min={0}
						max={20}
						placeholder="0, 1, 2..."
						className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
					/>
				</div>
			</div>

			{/* Housing Type */}
			<div>
				<label className="block text-xs font-medium text-gray-700 mb-1.5">
					Housing Type
				</label>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
					{HOUSING_TYPES.map(type => (
						<button
							key={type.value}
							type="button"
							onClick={() => onChange({ ...data, housingType: type.value })}
							className={`
								p-2.5 rounded-lg border-2 text-center transition-all
								${data.housingType === type.value
									? 'border-blue-500 bg-blue-50'
									: 'border-gray-200 hover:border-gray-300'}
							`}
						>
							<div className="w-6 h-6 mx-auto mb-0.5 flex items-center justify-center text-gray-600">
								<type.icon size={20} />
							</div>
							<div className="text-xs font-medium text-gray-700">{type.label}</div>
						</button>
					))}
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
