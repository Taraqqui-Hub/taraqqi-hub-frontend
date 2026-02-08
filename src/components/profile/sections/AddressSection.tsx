/**
 * Address Section
 * Redesigned with interdependent District/State selection.
 */

import { useMemo } from "react";
import { MapPin, Building } from "lucide-react";
import { INDIAN_STATES_DISTRICTS } from "../../../data/indianStatesDistricts";
import MultiSelect from "../../common/MultiSelect"; // Ensure correct path to common components

interface AddressData {
	currentCity: string;
	district: string;
	state: string;
	pincode: string;
	addressLine1?: string;
	addressLine2?: string;
	locality?: string;
}

interface AddressSectionProps {
	data: Partial<AddressData>;
	onChange: (data: Partial<AddressData>) => void;
	onSave: () => Promise<void>;
	saving?: boolean;
}

export default function AddressSection({ data, onChange, onSave, saving }: AddressSectionProps) {
	// Prepare State Options
	const stateOptions = useMemo(() => 
		INDIAN_STATES_DISTRICTS.map(s => ({ value: s.state, label: s.state })), 
	[]);

	// Prepare District Options
	// If state is selected, show only districts for that state.
	// If no state is selected, show all districts with state name appended for disambiguation.
	const districtOptions = useMemo(() => {
		if (data.state) {
			const stateData = INDIAN_STATES_DISTRICTS.find(s => s.state === data.state);
			return stateData?.districts.map(d => ({ value: d, label: d })) || [];
		}
		// Show all districts
		return INDIAN_STATES_DISTRICTS.flatMap(s => 
			s.districts.map(d => ({ 
				value: `${d}|${s.state}`, // Composite value to identify state
				label: `${d} (${s.state})`
			}))
		);
	}, [data.state]);

	const handleDistrictChange = (selected: string[]) => {
		if (selected.length === 0) {
			onChange({ ...data, district: "" });
			return;
		}

		const val = selected[0]; // Single select
		
		if (data.state) {
			// State already selected, val is just the district name
			onChange({ ...data, district: val });
		} else {
			// No state selected, val is "District|State"
			const [districtName, stateName] = val.split("|");
			onChange({ 
				...data, 
				district: districtName, 
				state: stateName 
			});
		}
	};

	const handleStateChange = (selected: string[]) => {
		const newState = selected[0] || "";
		if (newState !== data.state) {
			// Clear district if state changes to avoid invalid combination
			onChange({ ...data, state: newState, district: "" });
		} else {
			onChange({ ...data, state: newState });
		}
	};

	// Determine the value to pass to District MultiSelect
	const selectedDistrictValue = useMemo(() => {
		if (!data.district) return [];
		if (data.state) return [data.district]; // If state is selected, value is just district name
		// If no state selected, try to reconstruct composite value (edge case)
		// But in our logic, selecting proper district sets the state immediately.
		// So data.state should be present if data.district is set via our UI.
		// If data pre-exists without state, this might be tricky, but we'll assume standard flow.
		// Fallback finding the state for the district if missing?
		const found = INDIAN_STATES_DISTRICTS.find(s => s.districts.includes(data.district || ""));
		if (found) return [`${data.district}|${found.state}`];
		return [];
	}, [data.district, data.state]);

	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Permanent Address</h3>
			</div>

			{/* Address Line 1 */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Address Line 1 <span className="text-red-500">*</span>
				</label>
				<input
					type="text"
					value={data.addressLine1 || ""}
					onChange={e => onChange({ ...data, addressLine1: e.target.value })}
					placeholder="House No., Building, Street Area"
					className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
				/>
			</div>

			{/* Address Line 2 */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Address Line 2 <span className="text-gray-400 text-xs">(Optional)</span>
				</label>
				<input
					type="text"
					value={data.addressLine2 || ""}
					onChange={e => onChange({ ...data, addressLine2: e.target.value })}
					placeholder="Landmark, or extended address"
					className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
				/>
			</div>

			{/* City & District */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5 pointer-events-auto">
				<div className="relative"> {/* Added relative to contain z-index context if needed */}
					<label className="block text-sm font-medium text-gray-700 mb-1">
						City / Town <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							type="text"
							value={data.currentCity || ""}
							onChange={e => onChange({ ...data, currentCity: e.target.value })}
							placeholder="e.g. Indore, Mumbai"
							className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
						/>
					</div>
				</div>
				<div className="relative z-20"> {/* Higher Z-Index for MultiSelect Dropdown */}
					<label className="block text-sm font-medium text-gray-700 mb-1">
						District <span className="text-red-500">*</span>
					</label>
					<MultiSelect
						options={districtOptions}
						selected={selectedDistrictValue}
						onChange={handleDistrictChange}
						placeholder="Select District"
						searchPlaceholder="Search District..."
						singleSelect
						required
					/>
					{!data.state && data.district && (
						<p className="text-xs text-blue-600 mt-1">State auto-selected based on district.</p>
					)}
				</div>
			</div>

			{/* State & Zip Code */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
				<div className="relative z-10">
					<label className="block text-sm font-medium text-gray-700 mb-1">
						State / Union Territory <span className="text-red-500">*</span>
					</label>
					<MultiSelect
						options={stateOptions}
						selected={data.state ? [data.state] : []}
						onChange={handleStateChange}
						placeholder="Select State"
						searchPlaceholder="Search State..."
						singleSelect
						required
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Zip Code <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
						<input
							type="text"
							value={data.pincode || ""}
							onChange={e => {
								const val = e.target.value.replace(/\D/g, "").slice(0, 6);
								onChange({ ...data, pincode: val });
							}}
							placeholder="e.g. 452001"
							maxLength={6}
							className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm outline-none"
						/>
					</div>
				</div>
			</div>

			{/* Continue Button */}
			<div className="pt-6">
				<button
					onClick={onSave}
					disabled={saving || !data.currentCity || !data.state || !data.district || !data.pincode || !data.addressLine1}
					className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-xl shadow-blue-500/20"
				>
					{saving ? (
						<>
							<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							Saving...
						</>
					) : (
						"Continue → Next Step"
					)}
				</button>
			</div>
		</div>
	);
}
