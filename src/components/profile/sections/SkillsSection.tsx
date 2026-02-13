/**
 * Skills Section
 * Skills with proficiency levels and bulk add
 */

import { useState, useMemo, useEffect } from "react";
import { Wrench, X, ChevronDown, Check } from "lucide-react";
import MultiSelect from "@/components/common/MultiSelect";

interface SkillRecord {
	id?: string;
	skillName: string;
	proficiencyLevel?: string;
	yearsOfExperience?: number;
}

interface SkillsSectionProps {
	skills: SkillRecord[];
	onAdd: (skill: Omit<SkillRecord, 'id'>) => Promise<void>;
	onBulkAdd: (skills: string[]) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
	onUpdate: (id: string, data: Partial<SkillRecord>) => Promise<void>;
	saving?: boolean;
}

const PROFICIENCY_LEVELS = [
	{ value: "beginner", label: "Beginner", color: "bg-gray-100 text-gray-600" },
	{ value: "intermediate", label: "Intermediate", color: "bg-blue-100 text-blue-600" },
	{ value: "advanced", label: "Advanced", color: "bg-green-100 text-green-600" },
	{ value: "expert", label: "Expert", color: "bg-purple-100 text-purple-600" },
];

const ALL_SKILLS = [
	// Technology & Digital
	"Computer Basics", "MS Office", "MS Excel", "MS Word", "PowerPoint", "Typing", "Data Entry",
	"Email", "Internet Browsing", "Digital Marketing", "Social Media", "Graphic Design", "Video Editing",
	"Programming", "Web Design", "App Development", "SEO", "Content Writing", "Tally", "Accounting Software",
	
	// Vocational & Trades
	"Driving (2-Wheeler)", "Driving (4-Wheeler)", "Driving (Heavy Vehicle)", "Mechanic", "Electrician",
	"Plumbing", "Carpentry", "Masonry", "Painting", "Welding", "Fitter", "Turner", "Machinist",
	"AC Repair", "Refrigerator Repair", "Mobile Repair", "Laptop Repair", "TV Repair",
	"Tailoring", "Sewing", "Embroidery", "Fashion Design", "Textile Printing",
	"Cooking", "Baking", "Chef", "Catering", "Housekeeping", "Cleaning",
	
	// Construction & Manual Labor
	"Construction Logistics", "Labor Work", "Loading/Unloading", "Packaging", "Warehouse Management",
	"Gardening", "Farming", "Agriculture", "Security Guard", "Delivery", 
	
	// Business & Office
	"Sales", "Marketing", "Customer Service", "Telecalling", "Receptionist", 
	"Office Assistant", "HR Operations", "Recruitment", "Team Management", "Leadership",
	"Project Management", "Time Management", "Communication", "Public Speaking",
	
	// Healthcare
	"Nursing", "First Aid", "Patient Care", "Pharmacy Assistant", "Lab Technician", 
	"Yoga Instructor", "Physiotherapy Assistant",
	
	// Creative & Arts
	"Drawing", "Painting (Art)", "Sketching", "Music", "Singing", "Dancing", "Acting",
	"Photography", "Videography", "Handicrafts", "Pottery", "Jewelry Making",
	
	// Beauty & Wellness
	"Beautician", "Hair Styling", "Makeup Artist", "Mehendi Art", "Nail Art", 
	"Spa Therapy", "Massage Therapy", "Gym Trainer",
	
	// Education
	"Teaching", "Tutoring", "Training", "Coaching", "Curriculum Development",
];

export default function SkillsSection({ skills, onAdd, onBulkAdd, onDelete, onUpdate, saving }: SkillsSectionProps) {
	const [editingId, setEditingId] = useState<string | null>(null);
	const [otherSkills, setOtherSkills] = useState("");
	const [showOtherSkills, setShowOtherSkills] = useState(false);
	
	// Pending skills to be added (separate from existing skills to avoid duplicates)
	const [pendingSkills, setPendingSkills] = useState<string[]>([]);
	
	// Temporary proficiency state for the dropdown
	const [tempProficiency, setTempProficiency] = useState<string | null>(null);

	// Get current skill names to filter options
	const currentSkillNames = useMemo(() => skills.map(s => s.skillName), [skills]);

	// Filter options: Exclude skills the user already has
	const availableSkillOptions = useMemo(() => {
		return ALL_SKILLS
			.filter(s => !currentSkillNames.includes(s))
			.map(s => ({ value: s, label: s }));
	}, [currentSkillNames]);

	const handlePendingSkillsChange = (newSelected: string[]) => {
		setPendingSkills(newSelected);
	};

	const handleSavePendingSkills = async () => {
		if (pendingSkills.length === 0) return;

		if (pendingSkills.length === 1) {
			await onAdd({ skillName: pendingSkills[0] });
		} else {
			await onBulkAdd(pendingSkills);
		}
		
		// Clear pending selection after save
		setPendingSkills([]);
	};

	const handleAddOtherSkills = async () => {
		if (!otherSkills.trim()) return;
		
		const newSkills = otherSkills
			.split(',')
			.map(s => s.trim())
			.filter(s => {
				// Filter out empty strings
				if (s.length === 0) return false;
				// Filter out skills already in existing skills
				if (currentSkillNames.some(existing => existing.toLowerCase() === s.toLowerCase())) return false;
				// Filter out skills already in pending skills
				if (pendingSkills.some(pending => pending.toLowerCase() === s.toLowerCase())) return false;
				return true;
			});

		if (newSkills.length > 0) {
			// Save immediately to match previous behavior for "Other Skills"
			if (newSkills.length === 1) {
				await onAdd({ skillName: newSkills[0] });
			} else {
				await onBulkAdd(newSkills);
			}
			setOtherSkills("");
		}
	};

	// Initialize temp proficiency when opening dropdown
	const handleEditClick = (skillId: string, currentLevel?: string) => {
		if (editingId === skillId) {
			// If already open, do not toggle off automatically.
			// User wants explicit cancel/save.
			return; 
		}
		setEditingId(skillId);
		setTempProficiency(currentLevel || null);
	};
	
	const handleSaveProficiency = async (skillId: string) => {
		if (tempProficiency) {
			await onUpdate(skillId, { proficiencyLevel: tempProficiency });
		}
		setEditingId(null);
		setTempProficiency(null);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setTempProficiency(null);
	};

	return (
		<div className="space-y-6">
			{/* MultiSelect for additions */}
			<div className="space-y-4">
				<div>
					<MultiSelect
						options={availableSkillOptions}
						selected={pendingSkills}
						onChange={handlePendingSkillsChange}
						placeholder="Search and select skills..."
						searchPlaceholder="Type to search (e.g. Cooking, Excel)..."
						label="Select Skills"
						maxDisplayChips={50} // Show chips inside
					/>
					<div className="flex justify-between items-start mt-2">
						<p className="text-xs text-gray-500 ml-1">
							Select multiple skills to add.
						</p>
						<button
							onClick={handleSavePendingSkills}
							disabled={pendingSkills.length === 0 || saving}
							className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
						>
							{saving ? "Saving..." : "Save Selection"}
						</button>
					</div>
				</div>

				{/* Other Skills Checkbox */}
				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						id="showOtherSkills"
						checked={showOtherSkills}
						onChange={(e) => setShowOtherSkills(e.target.checked)}
						className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
					/>
					<label htmlFor="showOtherSkills" className="text-sm text-gray-700 font-medium cursor-pointer select-none">
						I have other skills not listed above
					</label>
				</div>

				{/* Other Skills Input */}
				{showOtherSkills && (
					<div className="animate-in fade-in slide-in-from-top-2 duration-200 pl-6 border-l-2 border-gray-100 ml-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Other Skills
						</label>
						<div className="flex gap-2">
							<input
								type="text"
								value={otherSkills}
								onChange={e => setOtherSkills(e.target.value)}
								onKeyDown={e => e.key === 'Enter' && handleAddOtherSkills()}
								placeholder="Type skills separated by comma (e.g. Pottery, Karate)..."
								className="flex-1 px-3 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
							/>
							<button
								onClick={handleAddOtherSkills}
								disabled={!otherSkills.trim() || saving}
								className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all font-medium text-sm border border-gray-200"
							>
								Add
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Current skills */}
		{skills.length > 0 && (
			<div className="space-y-3">
				<p className="text-sm font-medium text-gray-700">Your Skills ({skills.length})</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
					{skills.map(skill => {
						const isExpanded = editingId === skill.id;
						const level = PROFICIENCY_LEVELS.find(p => p.value === skill.proficiencyLevel);

						return (
							<div 
								key={skill.id || skill.skillName}
								className={`
									relative rounded-xl border transition-all overflow-hidden
									${isExpanded
										? 'border-blue-200 bg-blue-50/30 shadow-sm'
										: 'border-gray-200 bg-white hover:border-gray-300'}
								`}
							>
								{/* Skill Row */}
								<div className="flex items-center gap-2 px-3 py-2.5">
									{/* Skill Name & Level Badge */}
									<button
										onClick={() => skill.id && setEditingId(isExpanded ? null : skill.id)}
										className="flex-1 flex items-center gap-2 text-left min-w-0"
									>
										<span className="font-medium text-sm text-gray-900 truncate">
											{skill.skillName}
										</span>
										{level ? (
											<span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${level.color}`}>
												{level.label}
											</span>
										) : (
											<span className="text-[10px] text-blue-500 font-medium whitespace-nowrap">
												Set level
											</span>
										)}
									</button>

									{/* Delete */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											skill.id && onDelete(skill.id);
										}}
										className="w-6 h-6 rounded-full hover:bg-red-50 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
									>
										<X size={14} />
									</button>
								</div>

								{/* Level Selector (only shows for THIS skill) */}
								{isExpanded && (
									<div className="px-3 pb-3 pt-1 border-t border-blue-100">
										<p className="text-[10px] text-gray-500 font-medium mb-1.5 uppercase tracking-wider">Select Level</p>
										<div className="flex gap-1.5">
											{PROFICIENCY_LEVELS.map(lvl => (
												<button
													key={lvl.value}
													onClick={async () => {
														if (skill.id) {
															await onUpdate(skill.id, { proficiencyLevel: lvl.value });
															setEditingId(null);
														}
													}}
													className={`
														flex-1 text-[11px] py-1.5 rounded-lg border font-semibold transition-all
														${skill.proficiencyLevel === lvl.value
															? `${lvl.color} border-blue-300 ring-2 ring-blue-200`
															: `${lvl.color} border-transparent hover:border-gray-300 hover:shadow-sm`}
													`}
												>
													{lvl.label}
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		)}

			{skills.length >= 3 ? (
				<div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-blue-50 text-blue-700">
					<Check size={18} />
					Your profile is now more visible to recruiters.
				</div>
			) : (
				<div className="p-3 rounded-lg text-sm flex items-center gap-2 bg-amber-50 text-amber-700">
					<Wrench size={18} />
					Add {3 - skills.length} more skill{3 - skills.length > 1 ? 's' : ''} to complete this section
				</div>
			)}
		</div>
	);
}
