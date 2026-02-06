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
					<div className="flex flex-wrap gap-3">
						{skills.map(skill => (
							<div 
								key={skill.id || skill.skillName}
								className="group relative"
							>
								<div className={`
									flex items-center gap-2 pl-3 pr-2 py-2 rounded-lg border transition-all
									${skill.proficiencyLevel 
										? 'bg-white border-gray-200 shadow-sm' 
										: 'bg-blue-50 border-blue-100 text-blue-700'}
								`}>
									<div className="flex flex-col">
										<span className="font-medium text-sm">{skill.skillName}</span>
										<button
											onClick={() => skill.id && handleEditClick(skill.id, skill.proficiencyLevel)}
											className={`
												text-[10px] uppercase font-bold tracking-wider text-left mt-0.5 flex items-center gap-1
												${skill.proficiencyLevel 
													? PROFICIENCY_LEVELS.find(p => p.value === skill.proficiencyLevel)?.color.replace('bg-', 'text-').split(' ')[1] || 'text-gray-500' 
													: 'text-blue-600 animate-pulse'}
											`}
										>
											{skill.proficiencyLevel 
												? PROFICIENCY_LEVELS.find(p => p.value === skill.proficiencyLevel)?.label 
												: 'Set Level'}
											<ChevronDown size={10} />
										</button>
									</div>

									<button
										onClick={() => skill.id && onDelete(skill.id)}
										className="w-6 h-6 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors ml-1"
									>
										<X size={14} />
									</button>
								</div>
								
								{/* Proficiency dropdown */}
								{editingId === skill.id && (
									<div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 p-2 min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
										<div className="text-[10px] font-semibold text-gray-400 px-2 py-1 mb-1">SELECT LEVEL</div>
										<div className="space-y-1 mb-2">
											{PROFICIENCY_LEVELS.map(level => (
												<button
													key={level.value}
													onClick={() => setTempProficiency(level.value)}
													className={`
														w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group/item
														${tempProficiency === level.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}
													`}
												>
													<span className="flex items-center gap-2">
														<span className={`w-1.5 h-1.5 rounded-full ${level.color.split(' ')[0].replace('bg-', 'bg-')}`}></span>
														{level.label}
													</span>
													{tempProficiency === level.value && <Check size={14} />}
												</button>
											))}
										</div>
										
										{/* Actions */}
										<div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-1">
											<button
												onClick={handleCancelEdit}
												className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
											>
												Cancel
											</button>
											<button
												onClick={() => skill.id && handleSaveProficiency(skill.id)}
												disabled={!tempProficiency}
												className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
											>
												Save
											</button>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Progress hint */}
			<div className={`
				p-3 rounded-lg text-sm flex items-center gap-2
				${skills.length >= 3 
					? 'bg-green-50 text-green-700' 
					: 'bg-amber-50 text-amber-700'}
			`}>
				{skills.length >= 3 ? (
					<>
						<Check size={18} />
						Great! You earned +20 Points for this section
					</>
				) : (
					<>
						<Wrench size={18} />
						Add {3 - skills.length} more skill{3 - skills.length > 1 ? 's' : ''} to complete this section
					</>
				)}
			</div>
		</div>
	);
}
