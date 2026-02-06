import { useState, useMemo, useEffect } from "react";
import { Heart, Trophy, HandHeart } from "lucide-react";
import MultiSelect from "@/components/common/MultiSelect";

interface InterestRecord {
	id?: string;
	interestType?: string;
	description: string;
}

interface InterestsSectionProps {
	interests: InterestRecord[];
	onAdd: (interest: Omit<InterestRecord, 'id'>) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	// onBulkAdd is not passed from parent yet? We need to check useProfileWizard
	// If not passed, we loop onAdd.
	onBulkAdd?: (interests: Omit<InterestRecord, 'id'>[]) => Promise<void>;
	saving?: boolean;
}

const INTEREST_TYPES = [
	{ value: "hobby", label: "Hobbies", icon: Heart },
	{ value: "extracurricular", label: "Sports/Activities", icon: Trophy },
	{ value: "volunteering", label: "Volunteering", icon: HandHeart },
];

const HOBBIES_LIST = [
	"Reading", "Cooking", "Gardening", "Painting", "Drawing", "Sketching",
	"Photography", "Traveling", "Music", "Singing", "Dancing", "Writing",
	"Gaming", "Sewing", "Knitting", "DIY Projects", "Fishing", "Bird Watching",
	"Pottery", "Origami", "Calligraphy", "Baking", "Blogging",
];

const SPORTS_LIST = [
	"Cricket", "Football", "Badminton", "Tennis", "Kabaddi", "Kho Kho",
	"Swimming", "Running", "Cycling", "Gym/Fitness", "Yoga", "Basketball",
	"Volleyball", "Table Tennis", "Chess", "Carrom", "Martial Arts", "Boxing",
	"Wrestling", "Hockey", "Athletics",
];

const VOLUNTEERING_LIST = [
	"Teaching", "Community Service", "Animal Shelter", "Food Drive",
	"Environmental Cleanup", "Blood Donation", "NGO Work", "Mentoring",
	"Fundraising", "Social Work", "Tree Planting",
];

export default function InterestsSection({ interests, onAdd, onDelete, saving }: InterestsSectionProps) {
	const [selectedType, setSelectedType] = useState("hobby");
	const [otherInterest, setOtherInterest] = useState("");
	const [showOtherInterest, setShowOtherInterest] = useState(false);
	
	// Local state for manual selection (tracks DESCRIPTIONS only)
	const [localSelected, setLocalSelected] = useState<string[]>([]);

	// Sync local state with props on load
	useEffect(() => {
		setLocalSelected(interests.map(i => i.description));
	}, [interests]);

	// Get current descriptions to diff against
	const currentInterestDescriptions = useMemo(() => interests.map(i => i.description), [interests]);

	const currentOptions = useMemo(() => {
		switch (selectedType) {
			case "hobby": return HOBBIES_LIST.map(i => ({ value: i, label: i }));
			case "extracurricular": return SPORTS_LIST.map(i => ({ value: i, label: i }));
			case "volunteering": return VOLUNTEERING_LIST.map(i => ({ value: i, label: i }));
			default: return [];
		}
	}, [selectedType]);

	const handleSelectionChange = (newSelectedDetails: string[]) => {
		setLocalSelected(newSelectedDetails);
	};

	const handleSave = async () => {
		// Identify additions
		const toAdd = localSelected.filter(desc => !currentInterestDescriptions.includes(desc));
		
		// Identify removals
		const toRemove = currentInterestDescriptions.filter(desc => !localSelected.includes(desc));

		// Process Additions
		for (const desc of toAdd) {
			let type = "hobby"; // Default
			if (SPORTS_LIST.includes(desc)) type = "extracurricular";
			else if (VOLUNTEERING_LIST.includes(desc)) type = "volunteering";
			else if (HOBBIES_LIST.includes(desc)) type = "hobby";
			else type = selectedType; // Fallback to current tab for unknown items

			await onAdd({ description: desc, interestType: type });
		}

		// Process Removals
		for (const desc of toRemove) {
			const record = interests.find(i => i.description === desc);
			if (record?.id) {
				await onDelete(record.id);
			}
		}
	};

	const handleAddOther = async () => {
		if (!otherInterest.trim()) return;
		
		const newInterests = otherInterest
			.split(',')
			.map(s => s.trim())
			.filter(s => s.length > 0 && !currentInterestDescriptions.some(existing => existing.toLowerCase() === s.toLowerCase()));

		if (newInterests.length > 0) {
			for (const interest of newInterests) {
				await onAdd({ description: interest, interestType: selectedType });
			}
			setOtherInterest("");
			// Also add to local selected so it reflects immediately
			setLocalSelected(prev => [...prev, ...newInterests]);
		}
	};

	const hasChanges = useMemo(() => {
		const toAdd = localSelected.filter(s => !currentInterestDescriptions.includes(s));
		const toRemove = currentInterestDescriptions.filter(s => !localSelected.includes(s));
		return toAdd.length > 0 || toRemove.length > 0;
	}, [localSelected, currentInterestDescriptions]);

	return (
		<div className="space-y-6">
			<div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-purple-700 flex items-start gap-2">
				<Heart size={18} className="flex-shrink-0 mt-0.5" />
				<span>Share your interests! This helps us connect you with like-minded people and opportunities.</span>
			</div>

			{/* Interest Type Selector */}
			<div className="grid grid-cols-3 gap-3">
				{INTEREST_TYPES.map(type => (
					<button
						key={type.value}
						type="button"
						onClick={() => setSelectedType(type.value)}
						className={`
							py-4 px-2 rounded-xl border-2 transition-all flex flex-col items-center gap-2 group
							${selectedType === type.value
								? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm'
								: 'border-gray-100 bg-white text-gray-500 hover:border-gray-200 hover:bg-gray-50'}
						`}
					>
						<div className={`
							w-10 h-10 rounded-full flex items-center justify-center transition-colors
							${selectedType === type.value ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}
						`}>
							<type.icon size={20} />
						</div>
						<div className={`text-xs font-semibold ${selectedType === type.value ? 'text-purple-700' : 'text-gray-600'}`}>
							{type.label}
						</div>
					</button>
				))}
			</div>

			{/* MultiSelect Area */}
			<div className="space-y-4">
				<div>
					<MultiSelect
						options={currentOptions}
						selected={localSelected}
						onChange={handleSelectionChange}
						placeholder={`Select ${INTEREST_TYPES.find(t => t.value === selectedType)?.label}...`}
						searchPlaceholder={`Search ${INTEREST_TYPES.find(t => t.value === selectedType)?.label}...`}
						label={`Add ${INTEREST_TYPES.find(t => t.value === selectedType)?.label}`}
						maxDisplayChips={50}
					/>
					<div className="flex justify-between items-start mt-2">
						<p className="text-xs text-gray-500 ml-1">
							Select multiple {INTEREST_TYPES.find(t => t.value === selectedType)?.label.toLowerCase()}.
						</p>
						<button
							onClick={handleSave}
							disabled={!hasChanges || saving}
							className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
						>
							{saving ? "Saving..." : "Save Selection"}
						</button>
					</div>
				</div>

				{/* Other Interest Checkbox */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="showOtherInterest"
						checked={showOtherInterest}
						onChange={(e) => setShowOtherInterest(e.target.checked)}
						className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
					/>
					<label htmlFor="showOtherInterest" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
						I have other interests not listed above
					</label>
				</div>

				{/* Other Interest Input */}
				{showOtherInterest && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-200 pl-6 border-l-2 border-gray-100 ml-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Other Interests
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={otherInterest}
								onChange={e => setOtherInterest(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleAddOther()}
								placeholder="Type interests separated by comma (e.g. Karate, Baking)..."
								className="flex-1 px-3 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm"
							/>
							<button
								onClick={handleAddOther}
								disabled={!otherInterest.trim() || saving}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all font-medium text-sm border border-gray-200"
							>
								Add
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
