/**
 * Address Section
 * City, district, state, pincode with India Post pincode prefill
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Building, Map, Save, Loader2, Search, AlertCircle, CheckCircle } from "lucide-react";

interface AddressData {
	currentCity: string;
	district: string;
	state: string;
	pincode: string;
	addressLine1?: string;
	locality?: string;
}

interface AddressSectionProps {
	data: Partial<AddressData>;
	onChange: (data: Partial<AddressData>) => void;
	onSave: () => Promise<void>;
	saving?: boolean;
}

// Complete list of Indian States and Union Territories
const INDIAN_STATES = [
	// States
	"Andhra Pradesh",
	"Arunachal Pradesh",
	"Assam",
	"Bihar",
	"Chhattisgarh",
	"Goa",
	"Gujarat",
	"Haryana",
	"Himachal Pradesh",
	"Jharkhand",
	"Karnataka",
	"Kerala",
	"Madhya Pradesh",
	"Maharashtra",
	"Manipur",
	"Meghalaya",
	"Mizoram",
	"Nagaland",
	"Odisha",
	"Punjab",
	"Rajasthan",
	"Sikkim",
	"Tamil Nadu",
	"Telangana",
	"Tripura",
	"Uttar Pradesh",
	"Uttarakhand",
	"West Bengal",
	// Union Territories
	"Andaman and Nicobar Islands",
	"Chandigarh",
	"Dadra and Nagar Haveli and Daman and Diu",
	"Delhi",
	"Jammu and Kashmir",
	"Ladakh",
	"Lakshadweep",
	"Puducherry",
];

interface PincodeLookupState {
	loading: boolean;
	error: string | null;
	success: boolean;
	places: string[];
}

export default function AddressSection({ data, onChange, onSave, saving }: AddressSectionProps) {
	const lastLookedUpPincode = useRef<string | null>(null);
	const [lookupState, setLookupState] = useState<PincodeLookupState>({
		loading: false,
		error: null,
		success: false,
		places: [],
	});

	// Debounced pincode lookup
	const lookupPincode = useCallback(async (pincode: string) => {
		if (pincode.length !== 6) {
			setLookupState({ loading: false, error: null, success: false, places: [] });
			return;
		}

		// Prevent duplicate lookups
		if (lastLookedUpPincode.current === pincode) {
			return;
		}

		setLookupState({ loading: true, error: null, success: false, places: [] });

		try {
			// Use India Post API for pincode lookup
			const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
			const result = await response.json();

			if (result[0]?.Status === "Success" && result[0]?.PostOffice?.length > 0) {
				console.log(result)
				const postOffice = result[0].PostOffice[0];
				const places = result[0].PostOffice.map((po: any) => po.Name);
				
				// Update ref to prevent re-lookup
				lastLookedUpPincode.current = pincode;

				// Smart City Selection:
				// 1. Block (often the Tehsil/Taluk)
				// 2. Division (Postal Division, often the City name)
				// 3. District (Fallback)
				let city = postOffice.Name;
				if (!city || city === "NA") city = postOffice.Division;
				if (!city || city === "NA") city = postOffice.District;

				// Auto-fill the address fields
				onChange({
					...data,
					pincode,
					currentCity: city || "",
					district: postOffice.District || "",
					state: postOffice.State || "",
				});

				setLookupState({
					loading: false,
					error: null,
					success: true,
					places,
				});
			} else {
				setLookupState({
					loading: false,
					error: "Invalid pincode. Please check and try again.",
					success: false,
					places: [],
				});
			}
		} catch (error) {
			setLookupState({
				loading: false,
				error: "Could not verify pincode. Please enter address manually.",
				success: false,
				places: [],
			});
		}
	}, [data, onChange]);

	// Debounce effect for pincode changes
	useEffect(() => {
		const pincode = data.pincode || "";
		// Only trigger if pincode is 6 digits and different from last successful lookup
		if (pincode.length === 6 && pincode !== lastLookedUpPincode.current) {
			const timer = setTimeout(() => {
				lookupPincode(pincode);
			}, 500);
			return () => clearTimeout(timer);
		}
	}, [data.pincode, lookupPincode]);

	const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		// Reset tracking ref if user manually changes pincode
		if (value !== lastLookedUpPincode.current) {
			lastLookedUpPincode.current = null;
		}
		
		onChange({ ...data, pincode: value });
		
		// Reset lookup state when pincode changes
		if (value.length < 6) {
			setLookupState({ loading: false, error: null, success: false, places: [] });
		}
	};

	console.log(lookupState, data);
	return (
		<div className="space-y-4">
			{/* Pincode with Auto-lookup */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					PIN Code
				</label>
				<div className="relative">
					<Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={data.pincode || ""}
						onChange={handlePincodeChange}
						placeholder="Enter 6 digit PIN code for auto-fill"
						maxLength={6}
						className={`w-full pl-10 pr-10 py-2 rounded-lg border transition-all text-sm ${
							lookupState.error 
								? "border-red-300 focus:border-red-500 focus:ring-red-100" 
								: lookupState.success 
									? "border-green-300 focus:border-green-500 focus:ring-green-100"
									: "border-gray-200 focus:border-blue-500 focus:ring-blue-100"
						} focus:ring-2`}
					/>
					{/* Status Icon */}
					<div className="absolute right-3 top-1/2 -translate-y-1/2">
						{lookupState.loading && (
							<Loader2 size={18} className="text-blue-500 animate-spin" />
						)}
						{lookupState.success && (
							<CheckCircle size={18} className="text-green-500" />
						)}
						{lookupState.error && (
							<AlertCircle size={18} className="text-red-500" />
						)}
					</div>
				</div>
				{/* Feedback Messages */}
				{lookupState.success && lookupState.places.length > 0 && (
					<p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
						<CheckCircle size={14} />
						Found {lookupState.places.length} location(s): {lookupState.places.slice(0, 3).join(", ")}
						{lookupState.places.length > 3 && ` +${lookupState.places.length - 3} more`}
					</p>
				)}
				{lookupState.error && (
					<p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
						<AlertCircle size={14} />
						{lookupState.error}
					</p>
				)}
				<p className="mt-1 text-xs text-gray-500">
					Enter your PIN code to auto-fill city, district, and state
				</p>
			</div>

			{/* City & District */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						City / Town <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={data.currentCity || ""}
							onChange={e => onChange({ ...data, currentCity: e.target.value })}
							placeholder="e.g., Mumbai, Chandigarh"
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
						/>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						District
					</label>
					<div className="relative">
						<Map size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							value={data.district || ""}
							onChange={e => onChange({ ...data, district: e.target.value })}
							placeholder="Enter your district"
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
						/>
					</div>
				</div>
			</div>

			{/* State */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					State / Union Territory <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<select
						value={data.state || ""}
						onChange={e => onChange({ ...data, state: e.target.value })}
						className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all appearance-none bg-white text-sm"
					>
						<option value="">Select State / UT</option>
						{INDIAN_STATES.map(state => (
							<option key={state} value={state}>{state}</option>
						))}
					</select>
				</div>
			</div>

			{/* Address Line (Optional) */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Full Address <span className="text-gray-400 text-xs">(Optional)</span>
				</label>
				<textarea
					value={data.addressLine1 || ""}
					onChange={e => onChange({ ...data, addressLine1: e.target.value })}
					placeholder="House/Flat No., Street, Landmark..."
					rows={2}
					className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none text-sm"
				/>
			</div>

			{/* Continue Button */}
			<button
				onClick={onSave}
				disabled={saving || !data.currentCity || !data.state}
				className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
			>
				{saving ? (
					<>
						<Loader2 size={18} className="animate-spin" />
						Saving...
					</>
				) : (
					"Continue → Next Step"
				)}
			</button>
		</div>
	);
}
