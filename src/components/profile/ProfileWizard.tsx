/**
 * Profile Wizard
 * Conversational step-by-step profile journey
 * Redesigned from accordion form to self-discovery flow
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import {
	User, MapPin, GraduationCap, Wrench, Briefcase,
	Users, Wallet, Shield, Heart,
	ArrowRight, ArrowLeft, Check, Sparkles, Lock,
} from "lucide-react";
import { JourneyProgressBar, BenefitToast, Confetti, PersuasionPopup } from "./GamificationElements";
import QuestCard from "./QuestCard";
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
import { useAuthStore } from "@/store/authStore";

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

// Step configuration with aspirational titles & benefit copy
const REQUIRED_STEPS = [
	{
		key: "personal",
		title: "Let's Know You",
		description: "Your name, photo, and basic details",
		helperText: "This helps employers trust your profile",
		icon: <User size={20} />,
	},
	{
		key: "address",
		title: "Where Do You Belong?",
		description: "Your city, district, and address",
		helperText: "We match you with nearby opportunities",
		icon: <MapPin size={20} />,
	},
	{
		key: "education",
		title: "Your Education Journey",
		description: "School, college, or training details",
		helperText: "Education helps us match the right opportunities for you",
		icon: <GraduationCap size={20} />,
	},
	{
		key: "skills",
		title: "Your Skills & Strengths",
		description: "What you know and can do",
		helperText: "This is what makes you stand out to employers",
		icon: <Wrench size={20} />,
	},
	{
		key: "experience",
		title: "Your Work Story",
		description: "Previous jobs or fresher status",
		helperText: "Even fresher experience matters — show your potential",
		icon: <Briefcase size={20} />,
	},
];

const OPTIONAL_STEPS = [
	{
		key: "family",
		title: "Unlock Scholarship Eligibility",
		description: "Family background for support programs",
		helperText: "Visible only for eligibility-based programs",
		icon: <Users size={20} />,
	},
	{
		key: "socio-economic",
		sectionKey: "socioEconomic",
		title: "Unlock Government Scheme Eligibility",
		description: "Income and housing for scheme matching",
		helperText: "Visible only for eligibility-based programs",
		icon: <Wallet size={20} />,
	},
	{
		key: "community",
		title: "Community Details (Optional & Private)",
		description: "Religion and category with your consent",
		helperText: "Visible only for eligibility-based matching",
		icon: <Shield size={20} />,
	},
	{
		key: "interests",
		title: "Hobbies & Interests",
		description: "Your interests and activities",
		helperText: "Helps us recommend relevant content for you",
		icon: <Heart size={20} />,
	},
];

// Benefit messages shown after completing each step
const BENEFIT_MESSAGES: Record<string, string> = {
	personal: "Nice! Your profile just became more trustworthy to employers.",
	address: "Great! We can now match you with nearby opportunities.",
	education: "Employers can now see your education background.",
	skills: "Your skills are now visible — stand out from the crowd!",
	experience: "Your work story is now part of your profile.",
	family: "You may now be eligible for scholarship programs.",
	socioEconomic: "You may now qualify for government schemes.",
	community: "Category information saved securely.",
	interests: "Your interests help us personalize recommendations.",
};

export default function ProfileWizard() {
	const router = useRouter();
	const { user } = useAuthStore();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [status, setStatus] = useState<WizardStatus | null>(null);
	const [expandedSection, setExpandedSection] = useState<string | null>("personal");

	// Toast state
	const [toastMessage, setToastMessage] = useState("");
	const [showToast, setShowToast] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showPersuasion, setShowPersuasion] = useState(false);
	const [persuasionShown, setPersuasionShown] = useState(false);

	// Section-specific data
	const [personalData, setPersonalData] = useState<any>({});
	const [addressData, setAddressData] = useState<any>({});
	const [familyData, setFamilyData] = useState<any>({});
	const [socioEconomicData, setSocioEconomicData] = useState<any>({});
	const [communityData, setCommunityData] = useState<any>({});
	const [educationRecords, setEducationRecords] = useState<any[]>([]);
	const [experienceRecords, setExperienceRecords] = useState<any[]>([]);
	const [skills, setSkills] = useState<any[]>([]);
	const [interests, setInterests] = useState<any[]>([]);

	// Show benefit toast
	const showBenefitToast = (sectionKey: string) => {
		const message = BENEFIT_MESSAGES[sectionKey] || "Section saved successfully!";
		setToastMessage(message);
		setShowToast(true);
		setShowConfetti(true);
		setTimeout(() => setShowConfetti(false), 2000);
	};

	// Check persuasion popup at 70%
	const checkPersuasionPopup = useCallback((percentage: number) => {
		if (!persuasionShown && percentage >= 80 && percentage < 100) {
			setShowPersuasion(true);
			setPersuasionShown(true);
		}
	}, [persuasionShown]);

	// Load data
	const loadData = useCallback(async (skipAutoExpand = false) => {
		try {
			const [statusData, eduData, expData, skillsData, interestsData] = await Promise.all([
				profileWizardApi.getStatus(),
				educationApi.list().catch(() => ({ records: [] })),
				experienceApi.list().catch(() => ({ records: [] })),
				skillsApi.list().catch(() => ({ skills: [] })),
				interestsApi.list().catch(() => ({ interests: [] })),
			]);

			const rawStatusData = statusData;
			const data = rawStatusData.payload || rawStatusData;
			setStatus(data);

			const unwrap = (res: any) => res?.payload || res || {};

			setEducationRecords(unwrap(eduData).records || []);
			setExperienceRecords(unwrap(expData).records || []);
			setSkills(unwrap(skillsData).skills || []);
			setInterests(unwrap(interestsData).interests || []);

			// Prefill form data from existing profiles
			const up = data.profiles?.userProfile;
			const jp = data.profiles?.jobseekerProfile;

			const personalInfo = {
				fullName: up?.fullName || (jp?.firstName && jp?.lastName ? `${jp.firstName} ${jp.lastName}` : "") || "",
				dateOfBirth: up?.dateOfBirth ? new Date(up.dateOfBirth).toISOString().split("T")[0] :
					jp?.dateOfBirth ? new Date(jp.dateOfBirth).toISOString().split("T")[0] : "",
				gender: up?.gender || jp?.gender || "",
				nationality: up?.nationality || "Indian",
				motherTongue: up?.motherTongue || "",
				languagesKnown: up?.languagesKnown || [],
				profilePhotoUrl: up?.profilePhotoUrl || jp?.profilePhotoUrl || "",
			};
			setPersonalData(personalInfo);

			const addressInfo = {
				currentCity: up?.currentCity || jp?.city || "",
				district: up?.district || "",
				state: up?.state || jp?.state || "",
				pincode: up?.pincode || jp?.pincode || "",
				addressLine1: jp?.address || "",
				addressLine2: jp?.addressLine2 || "",
				locality: "",
			};
			setAddressData(addressInfo);

			if (data.profiles?.familyProfile) {
				setFamilyData(data.profiles.familyProfile);
			}
			if (data.profiles?.socioEconomicProfile) {
				setSocioEconomicData(data.profiles.socioEconomicProfile);
			}
			if (data.profiles?.communityProfile) {
				setCommunityData({
					...data.profiles.communityProfile,
					consent: true,
				});
			}

			// Auto-expand first incomplete required section
			if (!skipAutoExpand) {
				const sections = data.sections;
				const requiredOrder = ["personal", "address", "education", "skills", "experience"];
				const firstIncomplete = requiredOrder.find((key) => !sections[key]?.completed);
				if (firstIncomplete) {
					setExpandedSection(firstIncomplete);
				}
			}

			// Check persuasion
			checkPersuasionPopup(data.summary?.completionPercentage || 0);

		} catch (error) {
			console.error("Failed to load profile data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// ============================================
	// Section Save Handlers (preserved from original)
	// ============================================

	const sections = status?.sections || {};

	const handleSavePersonal = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updatePersonal(personalData);
			if (!sections?.personal?.completed) {
				showBenefitToast("personal");
				setExpandedSection("address");
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

	const handleSaveAddress = async () => {
		setSaving(true);
		try {
			await profileWizardApi.updateAddress(addressData);
			if (!sections?.address?.completed) {
				showBenefitToast("address");
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
				showBenefitToast("education");
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
			showBenefitToast("education");
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
				showBenefitToast("skills");
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
				showBenefitToast("experience");
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
				showBenefitToast("family");
			}
			setExpandedSection(null);
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
				showBenefitToast("socioEconomic");
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
				showBenefitToast("community");
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
				showBenefitToast("interests");
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

	// ============================================
	// Render
	// ============================================

	if (loading) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
					<p className="text-gray-500 text-sm">Loading your profile...</p>
				</div>
			</div>
		);
	}

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

	const userName = user?.name?.split(" ")[0] || "there";

	return (
		<div className="max-w-2xl mx-auto">
			{/* Benefit Toast */}
			<BenefitToast
				message={toastMessage}
				show={showToast}
				onClose={() => setShowToast(false)}
			/>

			{/* Confetti */}
			<Confetti show={showConfetti} />

			{/* Persuasion Popup */}
			<PersuasionPopup
				show={showPersuasion}
				onClose={() => setShowPersuasion(false)}
			/>

			{/* Conversational Header */}
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-4">
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
						{userName.charAt(0).toUpperCase()}
					</div>
					<div>
						<h1 className="text-xl font-bold text-gray-900">
							Hi {userName}, let&apos;s build your professional story
						</h1>
						<p className="text-sm text-gray-500">
							Complete your profile to unlock opportunities
						</p>
					</div>
				</div>

				{/* Progress Bar */}
				<div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
					<JourneyProgressBar
						completionPercentage={summary.completionPercentage}
						completedSteps={summary.completedRequired || 0}
						totalSteps={summary.totalRequired || 5}
					/>

					{summary.isProfileComplete && (
						<div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-center">
							<p className="text-blue-800 font-semibold flex items-center justify-center gap-1.5 text-sm">
								<Sparkles size={16} />
								You&apos;re ready! Let&apos;s find opportunities for you.
							</p>
							<button
								onClick={() => router.push("/jobs")}
								className="mt-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-1.5 mx-auto shadow-md shadow-blue-500/20"
							>
								View Matched Jobs
								<ArrowRight size={14} />
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Required Steps */}
			<div className="mb-6">
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
						<Sparkles size={14} className="text-blue-600" />
						Your Journey
					</h2>
					<span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
						{summary.completedRequired || 0} of {summary.totalRequired || 5} done
					</span>
				</div>

				<div className="space-y-3">
					{REQUIRED_STEPS.map((step, index) => {
						const sectionData = sections?.[step.key];
						const isCompleted = sectionData?.completed || false;
						const prevKey = index > 0 ? REQUIRED_STEPS[index - 1].key : null;
						const isLocked = prevKey ? !sections?.[prevKey]?.completed : false;
						const isHidden = prevKey ? (!sections?.[prevKey]?.completed && expandedSection !== step.key) : false;

						return (
							<QuestCard
								key={step.key}
								title={step.title}
								description={step.description}
								helperText={step.helperText}
								icon={step.icon}
								completed={isCompleted}
								locked={isLocked}
								hidden={isHidden}
								stepNumber={index + 1}
								totalSteps={5}
								isActive={expandedSection === step.key}
								expanded={expandedSection === step.key}
								onToggle={() => setExpandedSection(expandedSection === step.key ? null : step.key)}
							>
								{step.key === "personal" && (
									<PersonalInfoSection
										data={personalData}
										onChange={setPersonalData}
										onSave={handleSavePersonal}
										onSaveSilent={async (data) => {
											try {
												await profileWizardApi.updatePersonal(data);
											} catch (error) {
												console.error(error);
												throw error;
											}
										}}
										saving={saving}
									/>
								)}
								{step.key === "address" && (
									<AddressSection
										data={addressData}
										onChange={setAddressData}
										onSave={handleSaveAddress}
										saving={saving}
									/>
								)}
								{step.key === "education" && (
									<EducationSection
										records={educationRecords}
										onAdd={handleAddEducation}
										onDelete={handleDeleteEducation}
										saving={saving}
										onMarkNoFormalEducation={handleMarkNoFormalEducation}
										hasNoFormalEducation={status?.profiles?.userProfile?.hasNoFormalEducation || false}
									/>
								)}
								{step.key === "skills" && (
									<SkillsSection
										skills={skills}
										onAdd={handleAddSkill}
										onBulkAdd={handleBulkAddSkills}
										onDelete={handleDeleteSkill}
										onUpdate={handleUpdateSkill}
										saving={saving}
									/>
								)}
								{step.key === "experience" && (
									<ExperienceSection
										records={experienceRecords}
										onAdd={handleAddExperience}
										onDelete={handleDeleteExperience}
										saving={saving}
									/>
								)}
							</QuestCard>
						);
					})}
				</div>
			</div>

			{/* Optional Steps — Unlock Benefits */}
			<div className="mb-6">
				<div className="flex items-center gap-2 mb-3">
					<h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
						<Lock size={14} className="text-gray-400" />
						Unlock More Benefits
					</h2>
					<span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
						Optional
					</span>
				</div>

				{/* Privacy notice */}
				<div className="mb-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
					<Shield size={14} className="text-gray-400 flex-shrink-0" />
					<span>Private & Secure — visible only for eligibility-based programs</span>
				</div>

				<div className="space-y-3">
					{OPTIONAL_STEPS.map((step) => {
						const sectionKey = (step as any).sectionKey || step.key;
						const sectionData = sections?.[sectionKey];
						const isCompleted = sectionData?.completed || false;

						return (
							<QuestCard
								key={step.key}
								title={step.title}
								description={step.description}
								helperText={step.helperText}
								icon={step.icon}
								completed={isCompleted}
								optional
								expanded={expandedSection === step.key}
								onToggle={() => setExpandedSection(expandedSection === step.key ? null : step.key)}
							>
								{step.key === "family" && (
									<FamilySection
										data={familyData}
										onChange={setFamilyData}
										onSave={handleSaveFamily}
										saving={saving}
									/>
								)}
								{step.key === "socio-economic" && (
									<SocioEconomicSection
										data={socioEconomicData}
										onChange={setSocioEconomicData}
										onSave={handleSaveSocioEconomic}
										saving={saving}
									/>
								)}
								{step.key === "community" && (
									<CommunitySection
										data={communityData}
										onChange={setCommunityData}
										onSave={handleSaveCommunity}
										saving={saving}
									/>
								)}
								{step.key === "interests" && (
									<InterestsSection
										interests={interests}
										onAdd={handleAddInterest}
										onDelete={handleDeleteInterest}
										saving={saving}
									/>
								)}
							</QuestCard>
						);
					})}
				</div>
			</div>
		</div>
	);
}
