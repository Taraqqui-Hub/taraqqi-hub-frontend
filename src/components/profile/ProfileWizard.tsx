/**
 * Profile Wizard
 * Gamified multi-step profile completion wizard
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { 
	User, MapPin, GraduationCap, Wrench, Briefcase, 
	Users, Wallet, Shield, Heart, Star, Target, Gift,
	ArrowRight, Check, Trophy
} from "lucide-react";
import { XPProgressBar, AchievementBadge, Confetti, LevelBadge } from "./GamificationElements";
import QuestCard from "./QuestCard";
import StepsLeftHelper from "./StepsLeftHelper";
import PersonalInfoSection from "./sections/PersonalInfoSection";
import AddressSection from "./sections/AddressSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import ExperienceSection from "./sections/ExperienceSection";
import FamilySection from "./sections/FamilySection";
import SocioEconomicSection from "./sections/SocioEconomicSection";
import CommunitySection from "./sections/CommunitySection";
import InterestsSection from "./sections/InterestsSection";
import { profileWizardApi, educationApi, experienceApi, skillsApi, interestsApi } from "@/lib/api";

interface WizardStatus {
	sections: Record<string, {
		completed: boolean;
		xp: number;
		optional?: boolean;
		count?: number;
		fields?: any;
	}>;
	summary: {
		earnedXP: number;
		maxXP: number;
		completionPercentage: number;
		level: number;
		levelName: string;
		completedRequired: number;
		totalRequired: number;
		isProfileComplete: boolean;
	};
	profiles: {
		userProfile: any;
		jobseekerProfile: any;
		socioEconomicProfile: any;
		familyProfile: any;
		communityProfile: any;
	};
}

export default function ProfileWizard() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState<WizardStatus | null>(null);
	const [expandedSection, setExpandedSection] = useState<string | null>("personal");
	
	// Achievement popup state
	const [achievement, setAchievement] = useState<{ title: string; xp: number; icon: React.ReactNode } | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);

	// Section-specific data (prefilled from API)
	const [personalData, setPersonalData] = useState<any>({});
	const [addressData, setAddressData] = useState<any>({});
	const [familyData, setFamilyData] = useState<any>({});
	const [socioEconomicData, setSocioEconomicData] = useState<any>({});
	const [communityData, setCommunityData] = useState<any>({});
	const [educationRecords, setEducationRecords] = useState<any[]>([]);
	const [experienceRecords, setExperienceRecords] = useState<any[]>([]);
	const [skills, setSkills] = useState<any[]>([]);
	const [interests, setInterests] = useState<any[]>([]);

	// Load all data and prefill forms
	// skipAutoExpand: Set to true when explicitly navigating to next section after saving
	const loadData = useCallback(async (skipAutoExpand = false) => {
		try {
			const [statusData, eduData, expData, skillsData, interestsData] = await Promise.all([
				profileWizardApi.getStatus(),
				educationApi.list().catch((err) => {
					console.error("Failed to fetch education records:", err);
					return { records: [] };
				}),
				experienceApi.list().catch(() => ({ records: [] })),
				skillsApi.list().catch(() => ({ skills: [] })),
				interestsApi.list().catch(() => ({ interests: [] })),
			]);

			const rawStatusData = statusData;
			const data = rawStatusData.payload || rawStatusData;
			setStatus(data);

			// Unwraps response.payload if it exists, otherwise uses response directly
			const unwrap = (res: any) => res?.payload || res || {};

			setEducationRecords(unwrap(eduData).records || []);
			setExperienceRecords(unwrap(expData).records || []);
			setSkills(unwrap(skillsData).skills || []);
			setInterests(unwrap(interestsData).interests || []);

			// Prefill form data from existing profiles
			const up = data.profiles?.userProfile;
			const jp = data.profiles?.jobseekerProfile;
			
			// Always set personal data, even if empty, to ensure form is properly initialized
			const personalInfo = {
				fullName: up?.fullName || (jp?.firstName && jp?.lastName ? `${jp.firstName} ${jp.lastName}` : "") || "",
				dateOfBirth: up?.dateOfBirth ? new Date(up.dateOfBirth).toISOString().split('T')[0] : 
				             jp?.dateOfBirth ? new Date(jp.dateOfBirth).toISOString().split('T')[0] : "",
				gender: up?.gender || jp?.gender || "",
				nationality: up?.nationality || "Indian",
				motherTongue: up?.motherTongue || "",
				languagesKnown: up?.languagesKnown || [],
				profilePhotoUrl: up?.profilePhotoUrl || jp?.profilePhotoUrl || "",
			};
			setPersonalData(personalInfo);
			
			// Address data - map address field from jobseekerProfile to addressLine1
			// Always set address data to ensure form fields are properly initialized
			const addressInfo = {
				currentCity: up?.currentCity || jp?.city || "",
				district: up?.district || "",
				state: up?.state || jp?.state || "",
				pincode: up?.pincode || jp?.pincode || "",
				addressLine1: jp?.address || "", // Map jobseekerProfile.address to addressLine1
				locality: "", // Not stored in schema, but kept for form compatibility
			};
			setAddressData(addressInfo);

			// Prefill family data
			if (data.profiles?.familyProfile) {
				setFamilyData(data.profiles.familyProfile);
			}
			
			// Prefill socio-economic data
			if (data.profiles?.socioEconomicProfile) {
				setSocioEconomicData(data.profiles.socioEconomicProfile);
			}
			
			// Prefill community data
			if (data.profiles?.communityProfile) {
				setCommunityData({
					...data.profiles.communityProfile,
					consent: true,
				});
			}

			// Auto-expand first incomplete required section (only on initial load)
			if (!skipAutoExpand) {
				const sections = data.sections;
				const requiredOrder = ['personal', 'address', 'education', 'skills', 'experience'];
				const firstIncomplete = requiredOrder.find(key => !sections[key]?.completed);
				if (firstIncomplete) {
					setExpandedSection(firstIncomplete);
				}
			}

		} catch (error) {
			console.error("Failed to load profile data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	const showAchievementPopup = (title: string, xp: number, icon: React.ReactNode) => {
		setAchievement({ title, xp, icon });
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 2000);
	};

	// Section save handlers
	const handleSavePersonal = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updatePersonal(personalData);
			
			// If not already completed, show achievement and advance
			if (!sections?.personal?.completed) {
				showAchievementPopup("Personal Info Complete!", 20, <User size={32} />);
				setExpandedSection("address");
			} else {
				// Just close the section if editing
				setExpandedSection(null);
			}
			
			await loadData(true);
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleSaveAddress = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updateAddress(addressData);
			
			if (!sections?.address?.completed) {
				showAchievementPopup("Address Saved!", 15, <MapPin size={32} />);
				setExpandedSection("education");
			} else {
				setExpandedSection(null);
			}
			
			await loadData(true);
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleAddEducation = async (record: any) => {
		setSaving(true);
		try {
			await educationApi.create(record);
			const wasEmpty = educationRecords.length === 0;
			await loadData(true);
			if (wasEmpty) {
				showAchievementPopup("Education Added!", 25, <GraduationCap size={32} />);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteEducation = async (id: string) => {
		try {
			await educationApi.delete(id);
			await loadData(true);
		} catch (error) {
			console.error(error);
		}
	};

	const handleMarkNoFormalEducation = async () => {
		setSaving(true);
		try {
			await educationApi.markNoFormalEducation();
			showAchievementPopup("Education Complete!", 25, <GraduationCap size={32} />);
			await loadData();
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleAddSkill = async (skill: any) => {
		setSaving(true);
		try {
			await skillsApi.create(skill);
			const newCount = skills.length + 1;
			await loadData(true);
			if (newCount === 3) {
				showAchievementPopup("Skills Unlocked!", 20, <Wrench size={32} />);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleBulkAddSkills = async (skillNames: string[]) => {
		setSaving(true);
		try {
			await skillsApi.bulkCreate(skillNames);
			await loadData(true);
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteSkill = async (id: string) => {
		try {
			await skillsApi.delete(id);
			await loadData(true);
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpdateSkill = async (id: string, data: any) => {
		try {
			await skillsApi.update(id, data);
			await loadData(true);
		} catch (error) {
			console.error(error);
		}
	};

	const handleAddExperience = async (record: any) => {
		setSaving(true);
		try {
			await experienceApi.create(record);
			const wasEmpty = experienceRecords.length === 0;
			await loadData(true);
			if (wasEmpty) {
				showAchievementPopup("Experience Added!", 25, <Briefcase size={32} />);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteExperience = async (id: string) => {
		try {
			await experienceApi.delete(id);
			await loadData(true);
		} catch (error) {
			console.error(error);
		}
	};

	const handleSaveFamily = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updateFamily(familyData);
			
			if (!sections?.family?.completed) {
				showAchievementPopup("Family Info Saved!", 10, <Users size={32} />);
			}
			setExpandedSection(null); // Always close optional/bonus sections on save
			await loadData();
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleSaveSocioEconomic = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updateSocioEconomic(socioEconomicData);
			
			if (!sections?.socioEconomic?.completed) {
				showAchievementPopup("Economic Info Saved!", 10, <Wallet size={32} />);
			}
			setExpandedSection(null);
			await loadData();
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleSaveCommunity = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updateCommunity(communityData);
			
			if (!sections?.community?.completed) {
				showAchievementPopup("Community Info Saved!", 10, <Shield size={32} />);
			}
			setExpandedSection(null);
			await loadData();
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleAddInterest = async (interest: any) => {
		setSaving(true);
		try {
			await interestsApi.create(interest);
			const wasEmpty = interests.length === 0;
			await loadData(true);
			if (wasEmpty) {
				showAchievementPopup("Interests Added!", 10, <Heart size={32} />);
			}
		} catch (error) {
			console.error(error);
		} finally {
			setSaving(false);
		}
	};

	const handleDeleteInterest = async (id: string) => {
		try {
			await interestsApi.delete(id);
			await loadData(true);
		} catch (error) {
			console.error(error);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
					<p className="text-gray-500">Loading your profile...</p>
				</div>
			</div>
		);
	}

	const sections = status?.sections || {};
	const summary = status?.summary || {
		earnedXP: 0,
		maxXP: 145,
		completionPercentage: 0,
		level: 1,
		levelName: "Newcomer",
		isProfileComplete: false,
		completedRequired: 0,
		totalRequired: 5,
	};

	return (
		<div className="max-w-3xl mx-auto">
			{/* Achievement Popup - DISABLED: Only show confetti now */}
			{/* <AchievementBadge
				title={achievement?.title || ""}
				xp={achievement?.xp || 0}
				icon={achievement?.icon || <Trophy size={32} />}
				show={!!achievement}
				onClose={() => setAchievement(null)}
			/> */}

			{/* Confetti */}
			<Confetti show={showConfetti} />

			{/* Compact Header - Progress Only */}
			<div className="bg-white rounded-xl shadow-sm p-3 mb-4 border border-gray-100">
				<div className="flex items-center justify-between mb-2">
					<div className="flex items-center gap-2">
						<LevelBadge level={summary.level} size="sm" />
						<div>
							<h1 className="text-base font-semibold text-gray-800">Complete Your Profile</h1>
						</div>
					</div>
					<span className="text-xs text-gray-500">{summary.earnedXP}/{summary.maxXP} pts</span>
				</div>
				<XPProgressBar
					currentXP={summary.earnedXP}
					maxXP={summary.maxXP}
					level={summary.level}
					levelName={summary.levelName}
					compact
				/>
				
				{summary.isProfileComplete && (
					<div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg text-center">
						<p className="text-green-700 font-medium flex items-center justify-center gap-1 text-sm">
							<Check size={16} />
							Profile complete!
						</p>
						<button
							onClick={() => router.push("/dashboard")}
							className="mt-1.5 px-4 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 mx-auto"
						>
							Go to Dashboard
							<ArrowRight size={14} />
						</button>
					</div>
				)}
			</div>

			{/* Required Sections */}
			<div className="mb-4">
				<div className="flex items-center justify-between mb-2">
					<h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
						<Target size={16} />
						Required Steps
					</h2>
					<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
						{summary.completedRequired || 0} of {summary.totalRequired || 5}
					</span>
				</div>
				<div className="space-y-2">
					<QuestCard
						title="Personal Information"
						description="Your name, date of birth, gender"
						icon={<User size={20} />}
						xp={20}
						completed={sections?.personal?.completed || false}
						stepNumber={1}
						totalSteps={5}
						expanded={expandedSection === "personal"}
						onToggle={() => setExpandedSection(expandedSection === "personal" ? null : "personal")}
					>
						<PersonalInfoSection
							data={personalData}
							onChange={setPersonalData}
							onSave={handleSavePersonal}
							onSaveSilent={async (data) => {
								try {
									await profileWizardApi.updatePersonal(data);
									// Don't reload everything to keep it silent and avoid UI jumps
									// await loadData(true); 
								} catch (error) {
									console.error(error);
									throw error; 
								}
							}}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Address"
						description="Your city, state, and pin code"
						icon={<MapPin size={20} />}
						xp={15}
						completed={sections.address?.completed || false}
						locked={!sections?.personal?.completed}
						hidden={!sections?.personal?.completed && expandedSection !== "address"}
						stepNumber={2}
						totalSteps={5}
						expanded={expandedSection === "address"}
						onToggle={() => setExpandedSection(expandedSection === "address" ? null : "address")}
					>
						<AddressSection
							data={addressData}
							onChange={setAddressData}
							onSave={handleSaveAddress}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Education"
						description="Your school and college details"
						icon={<GraduationCap size={20} />}
						xp={25}
						completed={sections.education?.completed || false}
						locked={!sections?.address?.completed}
						hidden={!sections?.address?.completed && expandedSection !== "education"}
						stepNumber={3}
						totalSteps={5}
						expanded={expandedSection === "education"}
						onToggle={() => setExpandedSection(expandedSection === "education" ? null : "education")}
					>
						<EducationSection
							records={educationRecords}
							onAdd={handleAddEducation}
							onDelete={handleDeleteEducation}
							saving={saving}
							onMarkNoFormalEducation={handleMarkNoFormalEducation}
							hasNoFormalEducation={status?.profiles?.userProfile?.hasNoFormalEducation || false}
						/>
					</QuestCard>

					<QuestCard
						title="Skills"
						description="What you know and can do"
						icon={<Wrench size={20} />}
						xp={20}
						completed={sections.skills?.completed || false}
						locked={!sections?.education?.completed}
						hidden={!sections?.education?.completed && expandedSection !== "skills"}
						stepNumber={4}
						totalSteps={5}
						expanded={expandedSection === "skills"}
						onToggle={() => setExpandedSection(expandedSection === "skills" ? null : "skills")}
					>
						<SkillsSection
							skills={skills}
							onAdd={handleAddSkill}
							onBulkAdd={handleBulkAddSkills}
							onDelete={handleDeleteSkill}
							onUpdate={handleUpdateSkill}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Work Experience"
						description="Your previous jobs or fresher status"
						icon={<Briefcase size={20} />}
						xp={25}
						completed={sections.experience?.completed || false}
						locked={!sections?.skills?.completed}
						hidden={!sections?.skills?.completed && expandedSection !== "experience"}
						stepNumber={5}
						totalSteps={5}
						expanded={expandedSection === "experience"}
						onToggle={() => setExpandedSection(expandedSection === "experience" ? null : "experience")}
					>
						<ExperienceSection
							records={experienceRecords}
							onAdd={handleAddExperience}
							onDelete={handleDeleteExperience}
							saving={saving}
						/>
					</QuestCard>
				</div>
			</div>

			{/* Bonus Sections */}
			<div className="mb-4">
				<h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
					<Gift size={16} />
					Bonus Sections
					<span className="text-xs font-normal text-gray-400">(Optional)</span>
				</h2>
				<div className="space-y-2">
					<QuestCard
						title="Family Background"
						description="Parent details and family type"
						icon={<Users size={20} />}
						xp={10}
						completed={sections.family?.completed || false}
						optional
						expanded={expandedSection === "family"}
						onToggle={() => setExpandedSection(expandedSection === "family" ? null : "family")}
					>
						<FamilySection
							data={familyData}
							onChange={setFamilyData}
							onSave={handleSaveFamily}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Economic Status"
						description="Income range and housing type"
						icon={<Wallet size={20} />}
						xp={10}
						completed={sections.socioEconomic?.completed || false}
						optional
						expanded={expandedSection === "socio-economic"}
						onToggle={() => setExpandedSection(expandedSection === "socio-economic" ? null : "socio-economic")}
					>
						<SocioEconomicSection
							data={socioEconomicData}
							onChange={setSocioEconomicData}
							onSave={handleSaveSocioEconomic}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Community"
						description="Religion and caste (with consent)"
						icon={<Shield size={20} />}
						xp={10}
						completed={sections.community?.completed || false}
						optional
						expanded={expandedSection === "community"}
						onToggle={() => setExpandedSection(expandedSection === "community" ? null : "community")}
					>
						<CommunitySection
							data={communityData}
							onChange={setCommunityData}
							onSave={handleSaveCommunity}
							saving={saving}
						/>
					</QuestCard>

					<QuestCard
						title="Hobbies & Interests"
						description="Your interests and activities"
						icon={<Heart size={20} />}
						xp={10}
						completed={sections.interests?.completed || false}
						optional
						expanded={expandedSection === "interests"}
						onToggle={() => setExpandedSection(expandedSection === "interests" ? null : "interests")}
					>
						<InterestsSection
							interests={interests}
							onAdd={handleAddInterest}
							onDelete={handleDeleteInterest}
							saving={saving}
						/>
					</QuestCard>
				</div>
			</div>

		</div>
	);
}
