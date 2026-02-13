/**
 * Edit Job Page
 * Reuses the wizard flow from PostJobPage but for editing existing jobs.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { 
	Briefcase, MapPin, FileText, 
	DollarSign, Users, ArrowRight, 
	Trophy, Sparkles, AlertCircle, CheckCircle,
	Search, Loader2, Building, Map
} from "lucide-react";

// Reuse UI components
import QuestCard from "@/components/profile/QuestCard";
import MultiSelect from "@/components/common/MultiSelect";

// Comprehensive Categories List covering all sectors
const CATEGORIES = [
	"Helpers & Labor",
	"Construction & Site Work",
	"Driver & Delivery",
	"Security & Housekeeping",
	"Cook, Chef & Waiter",
	"Manufacturing & Production",
	"Technician & Mechanic",
	"Sales & Business Development",
	"Marketing & Advertising",
	"Telecalling & BPO",
	"Back Office & Data Entry",
	"Receptionist & Front Desk",
	"HR & Admin",
	"Accounts & Finance",
	"IT, Software & Engineering",
	"Design & Creative",
	"Teaching & Education",
	"Healthcare & Medical",
	"Legal & Regulatory",
	"Retail & Counter Sales",
	"Beautician & Spa",
	"Event Management",
	"Hotel & Restaurant Staff",
	"Logistics & Supply Chain",
	"Real Estate",
	"Agriculture & Farming",
	"Other"
];

const SKILL_OPTIONS = [
    // Soft Skills
    { value: "communication", label: "Communication Skills" },
    { value: "english", label: "English Proficiency" },
    { value: "hindi", label: "Hindi Proficiency" },
    { value: "teamwork", label: "Teamwork" },
    { value: "leadership", label: "Leadership" },
    { value: "time_management", label: "Time Management" },
    { value: "customer_service", label: "Customer Service" },
    { value: "sales", label: "Sales & Negotiation" },

    // Office & Tech
    { value: "computer_basics", label: "Basic Computer Skills" },
    { value: "ms_office", label: "MS Office / Excel" },
    { value: "data_entry", label: "Data Entry" },
    { value: "accounting", label: "Accounting / Tally" },
    { value: "coding", label: "Coding / Programming" },
    { value: "react", label: "React.js" },
    { value: "node", label: "Node.js" },
    { value: "java", label: "Java" },
    { value: "python", label: "Python" },
    { value: "sql", label: "SQL / Database" },
    { value: "designing", label: "Graphic Design" },
    { value: "photoshop", label: "Photoshop / Illustrator" },
    { value: "video_editing", label: "Video Editing" },
    { value: "digital_marketing", label: "Digital Marketing" },

    // Blue Collar & Trades
    { value: "driving", label: "Driving (LMV/HMV)" },
    { value: "cooking", label: "Cooking" },
    { value: "cleaning", label: "Cleaning & Housekeeping" },
    { value: "security", label: "Security Management" },
    { value: "machine_operation", label: "Machine Operation" },
    { value: "plumbing", label: "Plumbing" },
    { value: "electrician", label: "Electrical Work" },
    { value: "carpentry", label: "Carpentry" },
    { value: "masonry", label: "Masonry" },
    { value: "welding", label: "Welding" },
    { value: "painting", label: "Painting" },
    { value: "tailoring", label: "Tailoring" },
    { value: "ac_repair", label: "AC & Fridge Repair" },
    { value: "mobile_repair", label: "Mobile Repair" },
    { value: "construction", label: "Construction Helper" },
    { value: "gardening", label: "Gardening" },
    { value: "loading_unloading", label: "Loading / Unloading" },
    { value: "cctv", label: "CCTV Installation" },

    // Service, Hospitality & Retail
    { value: "waiter", label: "Waiter / Steward" },
    { value: "bartender", label: "Bartender" },
    { value: "housekeeping_supervisor", label: "Housekeeping Supervisor" },
    { value: "front_office", label: "Front Office / Reception" },
    { value: "concierge", label: "Concierge" },
    { value: "event_planning", label: "Event Planning" },
    { value: "travel_agent", label: "Travel Agent / Ticketing" },
    { value: "tour_guide", label: "Tour Guide" },
    { value: "cabin_crew", label: "Cabin Crew / Flight Attendant" },
    { value: "store_manager", label: "Store Manager" },
    { value: "merchandising", label: "Visual Merchandising" },
    { value: "inventory_management", label: "Inventory Management" },
    { value: "packaging", label: "Packaging & Labeling" },
    { value: "cashier", label: "Cashier / Billing" },

    // Healthcare & Wellness
    { value: "nursing", label: "Nursing / Patient Care" },
    { value: "pharmacy", label: "Pharmacy Assistant" },
    { value: "physiotherapy", label: "Physiotherapy" },
    { value: "lab_technician", label: "Lab Technician" },
    { value: "elderly_care", label: "Elderly / Patient Care" },
    { value: "babysitting", label: "Babysitting / Nanny" },
    { value: "yoga_instructor", label: "Yoga Instructor" },
    { value: "fitness_trainer", label: "Fitness Training" },
    { value: "beautician", label: "Beautician / Makeup" },
    { value: "hair_styling", label: "Hair Styling" },

    // Logistics & Operations
    { value: "warehouse_management", label: "Warehouse Management" },
    { value: "supply_chain", label: "Supply Chain Operations" },
    { value: "courier", label: "Courier / Delivery Boy" },
    { value: "dispatcher", label: "Dispatcher" },
    { value: "store_keeper", label: "Store Keeper" },
    { value: "forklift", label: "Forklift Operation" },

    // General / Other
    { value: "teaching", label: "Teaching / Training" },
    { value: "banking_operations", label: "Banking Operations" },
    { value: "insurance_sales", label: "Insurance Sales" },
    { value: "real_estate", label: "Real Estate Sales" },
    { value: "content_writing", label: "Content Writing" },
    { value: "photography", label: "Photography" },
];

const EDUCATION_OPTIONS = [
    { value: "illiterate", label: "No Formal Education" },
    { value: "below_10th", label: "Below 10th" },
    { value: "10th_pass", label: "10th Pass" },
    { value: "12th_pass", label: "12th Pass" },
    { value: "diploma", label: "Diploma / ITI" },
    { value: "graduate", label: "Graduate / Bachelor's" },
    { value: "post_graduate", label: "Post Graduate / Master's" },
    { value: "phd", label: "PhD / Doctorate" },
];

const BENEFITS_OPTIONS = [
	{ id: "pf", label: "PF" },
	{ id: "esi", label: "ESI" },
	{ id: "accommodation", label: "Accommodation" },
	{ id: "food", label: "Food" },
	{ id: "transport", label: "Transport" },
	{ id: "health_insurance", label: "Health Insurance" },
];

const INDIAN_STATES = [
	"Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
	"Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
	"Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
	"Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
	"Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const LANGUAGE_OPTIONS = [
    { value: "english", label: "English" },
    { value: "hindi", label: "Hindi" },
    { value: "marathi", label: "Marathi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "bengali", label: "Bengali" },
    { value: "punjabi", label: "Punjabi" },
    { value: "urdu", label: "Urdu" },
    { value: "odia", label: "Odia" },
    { value: "assamese", label: "Assamese" },
    { value: "bhojpuri", label: "Bhojpuri" },
    { value: "haryanvi", label: "Haryanvi" },
    { value: "rajasthani", label: "Rajasthani" },
    { value: "konkani", label: "Konkani" },
    { value: "tulu", label: "Tulu" },
    { value: "sindhi", label: "Sindhi" },
    { value: "nepali", label: "Nepali" },
    { value: "sanskrit", label: "Sanskrit" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "japanese", label: "Japanese" },
    { value: "chinese", label: "Chinese (Mandarin)" },
    { value: "arabic", label: "Arabic" },
    { value: "russian", label: "Russian" },
    { value: "portuguese", label: "Portuguese" },
];

const defaultForm = {
	title: "",
	category: "",
	jobType: "full-time",
	locationType: "onsite",
	pincode: "",
	city: "",
	district: "", 
	area: "",
	state: "",
	roleSummary: "",
	description: "",
	responsibilities: "",
	requirements: "",
	skillsRequired: [] as string[],
	minExperienceYears: 0,
	maxExperienceYears: "",
	educationRequired: "",
	salaryMin: "",
	salaryMax: "",
	salaryType: "yearly",
	hideSalary: false,
	isSalaryNegotiable: false,
	benefits: [] as string[],
	preferredLanguage: [] as string[],
	freshersAllowed: "",
	ageMin: "",
	ageMax: "",
	genderPreference: "",
	applicationDeadline: "",
	maxApplications: "",
	autoCloseOnLimit: false,
	isResumeRequired: false,
	status: "draft",
};

interface PincodeLookupState {
	loading: boolean;
	error: string | null;
	success: boolean;
	places: string[];
}

export default function EditJobPage() {
	const router = useRouter();
    const { id } = router.query;
	const [formData, setFormData] = useState(defaultForm);
	const [saving, setSaving] = useState(false);
    const [fetching, setFetching] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [moderationIssues, setModerationIssues] = useState<string[]>([]);
	// Wizard State
	const [expandedSection, setExpandedSection] = useState<string | null>("overview");
	const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({
		overview: true,
		details: true,
		compensation: true,
		preferences: true
	});

	// Pincode Lookup State
	const lastLookedUpPincode = useRef<string | null>(null);
	const [lookupState, setLookupState] = useState<PincodeLookupState>({
		loading: false,
		error: null,
		success: false,
		places: [],
	});

	// Check eligibility & Fetch Job Details
	useEffect(() => {
        const fetchJobDetails = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/employer/jobs/${id}`);
                const job = response.data?.payload?.job || response.data?.job;

                if (job) {
                    setFormData({
                        title: job.title || "",
                        category: job.category || "",
                        jobType: job.jobType || "full-time",
                        locationType: job.locationType || "onsite",
                        pincode: job.pincode || "",
                        city: job.city || "",
                        district: job.district || "",
                        area: job.area || "",
                        state: job.state || "",
                        roleSummary: job.roleSummary || "",
                        description: job.description || "",
                        responsibilities: job.responsibilities || "",
                        requirements: job.requirements || "",
                        skillsRequired: job.skillsRequired || [],
                        minExperienceYears: job.minExperienceYears || 0,
                        maxExperienceYears: job.maxExperienceYears || "",
                        educationRequired: job.educationRequired || "",
                        salaryMin: job.salaryMin || "",
                        salaryMax: job.salaryMax || "",
                        salaryType: job.salaryType || "yearly",
                        hideSalary: job.hideSalary || false,
                        isSalaryNegotiable: job.isSalaryNegotiable || false,
                        benefits: job.benefits || [],
                        preferredLanguage: job.preferredLanguage?.split(", ") || [],
                        freshersAllowed: job.freshersAllowed === true ? "yes" : job.freshersAllowed === false ? "no" : "",
                        ageMin: job.ageMin || "",
                        ageMax: job.ageMax || "",
                        genderPreference: job.genderPreference || "",
                        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
                        maxApplications: job.maxApplications || "",
                        autoCloseOnLimit: job.autoCloseOnLimit || false,
                        isResumeRequired: job.isResumeRequired || false,
                        status: job.status || "draft",
                    });
                     // Set all sections to completed so user can jump around
                    setCompletedSections({
                        overview: true,
                        details: true,
                        compensation: true,
                        preferences: true
                    });
                }
            } catch {
                setError("Failed to load job details.");
            } finally {
                setFetching(false);
            }
        };

        if (router.isReady) {
            fetchJobDetails();
        }
	}, [id, router.isReady]);

	// Pincode Lookup Logic
	const lookupPincode = useCallback(async (pincode: string) => {
		if (pincode.length !== 6) {
			setLookupState({ loading: false, error: null, success: false, places: [] });
			return;
		}
		if (lastLookedUpPincode.current === pincode) return;

		setLookupState({ loading: true, error: null, success: false, places: [] });

		try {
			const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
			const result = await response.json();

			if (result[0]?.Status === "Success" && result[0]?.PostOffice?.length > 0) {
				const postOffice = result[0].PostOffice[0];
				
				// Keep track of looked up pincode
				lastLookedUpPincode.current = pincode;

				let city = postOffice.Name;
				if (!city || city === "NA") city = postOffice.Division;
				if (!city || city === "NA") city = postOffice.District;

				setFormData((prev) => ({
					...prev,
					city: city || "",
					district: postOffice.District || "",
					state: postOffice.State || "",
					area: postOffice.Name !== city ? postOffice.Name : "", 
				}));

				setLookupState({
					loading: false,
					error: null,
					success: true,
						places: result[0].PostOffice.map((po: { Name: string }) => po.Name),
				});
			} else {
				setLookupState({
					loading: false,
					error: "Invalid pincode.",
					success: false,
					places: [],
				});
			}
		} catch {
			setLookupState({
				loading: false, 
				error: "Lookup failed.", 
				success: false, 
				places: [] 
			});
		}
	}, []);

	// Debounce Pincode
	useEffect(() => {
		const pincode = formData.pincode || "";
		if (pincode.length === 6 && pincode !== lastLookedUpPincode.current) {
			const timer = setTimeout(() => lookupPincode(pincode), 500);
			return () => clearTimeout(timer);
		}
	}, [formData.pincode, lookupPincode]);

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		
		if (name === "pincode") {
			const safeValue = value.replace(/\D/g, "").slice(0, 6);
			if (safeValue !== lastLookedUpPincode.current) lastLookedUpPincode.current = null;
			setFormData((prev) => ({ ...prev, pincode: safeValue }));
			return;
		}

		if (type === "checkbox") {
			const el = e.target as HTMLInputElement;
			if (name === "autoCloseOnLimit" || name === "hideSalary" || name === "isSalaryNegotiable" || name === "isResumeRequired") {
				setFormData((prev) => ({ ...prev, [name]: el.checked }));
			} else if (BENEFITS_OPTIONS.some((b) => b.id === name)) {
				setFormData((prev) => ({
					...prev,
					benefits: el.checked
						? [...prev.benefits, name]
						: prev.benefits.filter((x) => x !== name),
				}));
			}
			return;
		}
		setFormData((prev) => ({
			...prev,
			[name]: type === "number" ? (value ? parseInt(value, 10) : "") : value,
		}));
	};

	// Mark section as complete and move to next
	const handleCompleteSection = (section: string, nextSection: string | null) => {
		setCompletedSections(prev => ({ ...prev, [section]: true }));
		if (nextSection) {
			setExpandedSection(nextSection);
		} else {
			setExpandedSection(null);
		}
	};

	const buildPayload = (statusOverride?: string) => {
		return {
			title: formData.title,
			category: formData.category || undefined,
			jobType: formData.jobType,
			locationType: formData.locationType,
			pincode: formData.pincode || undefined,
			city: formData.city || undefined,
			district: formData.district || undefined,
			area: formData.area || undefined, 
			state: formData.state || undefined,
			roleSummary: formData.roleSummary || undefined,
			description: formData.description,
			requirements: formData.requirements || undefined,
			responsibilities: formData.responsibilities || undefined,
			skillsRequired: formData.skillsRequired.length > 0 ? formData.skillsRequired : undefined,
			minExperienceYears: formData.minExperienceYears,
			maxExperienceYears: formData.maxExperienceYears ? parseInt(formData.maxExperienceYears as string, 10) : undefined,
			educationRequired: formData.educationRequired || undefined,
			salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin as string) : undefined,
			salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax as string) : undefined,
			salaryType: formData.salaryType,
			hideSalary: formData.hideSalary,
			isSalaryNegotiable: formData.isSalaryNegotiable,
			benefits: formData.benefits.length ? formData.benefits : undefined,
			preferredLanguage: formData.preferredLanguage?.length ? formData.preferredLanguage.join(", ") : undefined,
			freshersAllowed: formData.freshersAllowed === "yes" ? true : formData.freshersAllowed === "no" ? false : undefined,
			ageMin: formData.ageMin ? parseInt(formData.ageMin as string, 10) : undefined,
			ageMax: formData.ageMax ? parseInt(formData.ageMax as string, 10) : undefined,
			genderPreference: formData.genderPreference || undefined,
			applicationDeadline: formData.applicationDeadline || undefined,
			maxApplications: formData.maxApplications ? parseInt(formData.maxApplications as string, 10) : undefined,
			autoCloseOnLimit: formData.autoCloseOnLimit,
			isResumeRequired: formData.isResumeRequired,
			status: statusOverride || formData.status,
		};
	};

	const handleSubmit = async (statusOverride?: string) => {
		setSaving(true);
		setError(null);
		setModerationIssues([]);
		try {
            // Use PATCH for editing
			await api.patch(`/employer/jobs/${id}`, buildPayload(statusOverride));
            // Redirect back to manage page
			router.push("/jobs/manage");
		} catch (err: unknown) {
			const error = err as { response?: { data?: { reason?: { issues?: string[] }, message?: string } } };
			const errData = error.response?.data;
			if (errData?.reason?.issues) setModerationIssues(errData.reason.issues);
			setError(errData?.message || "Failed to update job");
		} finally {
			setSaving(false);
		}
	};

	// Validation helpers
	const validateOverview = () => {
		const basicValid = formData.title.trim().length >= 5 && formData.category && formData.jobType && formData.locationType;
		const locationValid = formData.locationType === "remote" || (!!formData.city?.trim() && !!formData.state?.trim());
		return basicValid && locationValid;
	};

	const validateDetails = () => {
		return formData.description.trim().length >= 50 && formData.skillsRequired.length > 0 && formData.educationRequired;
	};

	const validateCompensation = () => {
		return (formData.salaryMin && parseFloat(formData.salaryMin as string) > 0) || formData.hideSalary;
	};

	const totalSteps = 5;
	const completedCount = Object.values(completedSections).filter(Boolean).length;
	const progressPercentage = Math.round((completedCount / (totalSteps - 1)) * 100);

    if (fetching) {
        return (
            <ProtectedRoute allowedUserTypes={["employer"]}>
                <DashboardLayout>
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto pb-20">
					<div className="mb-6">
						<h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">Edit Job</h1>
						<p className="text-slate-500">Update the details of your job posting.</p>
					</div>

					{/* Simple Progress Bar */}
					<div className="mb-8">
						<div className="flex justify-between text-sm text-slate-500 mb-2">
							<span>Progress</span>
							<span>{completedCount} of 4 steps completed</span>
						</div>
						<div className="h-2 bg-slate-100 rounded-full overflow-hidden">
							<div 
								className="h-full bg-indigo-600 transition-all duration-500" 
								style={{ width: `${progressPercentage}%` }}
							/>
						</div>
					</div>

					{error && (
						<div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
							<p className="font-semibold mb-1">{error}</p>
							{moderationIssues.length > 0 && (
								<ul className="list-disc list-inside">{moderationIssues.map((m, i) => <li key={i}>{m}</li>)}</ul>
							)}
						</div>
					)}

					<div className="space-y-4">
						{/* Step 1: Job Overview */}
						<QuestCard
							title="Job Overview"
							description="Title, category, role type, and location"
							icon={<Briefcase size={20} />}
							showXp={false}
							completed={completedSections.overview}
							stepNumber={1}
							totalSteps={totalSteps}
							expanded={expandedSection === "overview"}
							onToggle={() => setExpandedSection(expandedSection === "overview" ? null : "overview")}
						>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="md:col-span-2">
										<label className="block text-sm font-bold text-slate-700 mb-1.5">Job Title <span className="text-rose-500">*</span></label>
										<input name="title" value={formData.title} onChange={handleChange} required minLength={5} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" placeholder="e.g. Senior Software Engineer / Delivery Partner" />
									</div>
									<div>
										<label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
										<select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium bg-white">
											<option value="">Select Category</option>
											{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
										<select name="jobType" value={formData.jobType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
											<option value="full-time">Full-time</option>
											<option value="part-time">Part-time</option>
											<option value="contract">Contract</option>
											<option value="internship">Internship</option>
											<option value="freelance">Freelance</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Work Mode *</label>
										<select name="locationType" value={formData.locationType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all">
											<option value="onsite">Onsite</option>
											<option value="hybrid">Hybrid</option>
											<option value="remote">Remote</option>
										</select>
									</div>
								</div>

								<div className="pt-4 border-t border-slate-100">
									<h4 className="text-sm font-semibold text-slate-900 mb-3">Location Details</h4>
									{formData.locationType === "remote" && (
										<div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
											Remote job selected. You can optionally specify a base location below.
										</div>
									)}

									{/* Pincode Lookup */}
									<div className="mb-4">
										<label className="block text-sm font-medium text-slate-700 mb-1">PIN Code (Auto-fill)</label>
										<div className="relative">
											<Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
											<input
												name="pincode"
												value={formData.pincode}
												onChange={handleChange}
												className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 transition-all ${
													lookupState.error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' :
													lookupState.success ? 'border-green-300 focus:border-green-500 focus:ring-green-100' :
													'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
												}`}
												placeholder="Enter 6 digit PIN code"
												maxLength={6}
											/>
											<div className="absolute right-3 top-1/2 -translate-y-1/2">
												{lookupState.loading && <Loader2 size={18} className="text-blue-500 animate-spin" />}
												{lookupState.success && <CheckCircle size={18} className="text-green-500" />}
												{lookupState.error && <AlertCircle size={18} className="text-red-500" />}
											</div>
										</div>
										<p className="text-xs text-slate-500 mt-1">Enter pincode to automatically fill city, district, and state.</p>
									</div>
									
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">City / Town {formData.locationType !== "remote" && "*"}</label>
											<div className="relative">
												<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
												<input 
													name="city" 
													value={formData.city} 
													onChange={handleChange} 
													className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
													placeholder="e.g. Mumbai" 
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">District</label>
											<div className="relative">
												<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
												<input 
													name="district" 
													value={formData.district} 
													onChange={handleChange} 
													className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 rounded-lg" 
													placeholder="e.g. Mumbai Suburban" 
													readOnly // Mostly auto-filled
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Area / Locality</label>
											<div className="relative">
												<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
												<input 
													name="area" 
													value={formData.area} 
													onChange={handleChange} 
													className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500" 
													placeholder="e.g. Andheri West" 
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">State / UT {formData.locationType !== "remote" && "*"}</label>
											<div className="relative">
												<Map size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
												<select 
													name="state" 
													value={formData.state} 
													onChange={handleChange} 
													className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 appearance-none bg-white"
												>
													<option value="">Select State</option>
													{INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
												</select>
											</div>
										</div>
									</div>
								</div>

								<div className="pt-2 flex justify-end">
									<button 
										type="button" 
										disabled={!validateOverview()}
										onClick={() => handleCompleteSection("overview", "details")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Next Step <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>

						{/* Step 2: Job Details */}
						<QuestCard
							title="Job Details"
							description="Description, skills, and requirements"
							icon={<FileText size={20} />}
							showXp={false}
							completed={completedSections.details}
							locked={!completedSections.overview}
							hidden={!completedSections.overview && expandedSection !== "details"}
							stepNumber={2}
							totalSteps={totalSteps}
							expanded={expandedSection === "details"}
							onToggle={() => setExpandedSection(expandedSection === "details" ? null : "details")}
						>
							<div className="space-y-6">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Role Summary (Short)</label>
									<textarea name="roleSummary" value={formData.roleSummary} onChange={handleChange} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Brief overview of the role..." />
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Full Description * (min 50 chars)</label>
									<textarea name="description" value={formData.description} onChange={handleChange} required minLength={50} rows={5} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Detailed job description..." />
									<p className="text-xs text-right text-slate-500 mt-1">{formData.description.length}/50 characters</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Key Responsibilities</label>
									<textarea name="responsibilities" value={formData.responsibilities} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="List key duties..." />
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<MultiSelect
											label="Required Skills *"
											options={SKILL_OPTIONS}
											selected={formData.skillsRequired}
											onChange={(selected) => setFormData(p => ({ ...p, skillsRequired: selected }))}
											placeholder="Select required skills"
											required
										/>
									</div>
									<div>
										<MultiSelect
											label="Education Required *"
											options={EDUCATION_OPTIONS}
											selected={formData.educationRequired ? [formData.educationRequired] : []}
											onChange={(selected) => setFormData(p => ({ ...p, educationRequired: selected[0] || "" }))}
											placeholder="Select minimum education"
											singleSelect
											required
										/>
									</div>
								</div>
								
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Min Experience (Years)</label>
										<input type="number" name="minExperienceYears" value={formData.minExperienceYears} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Max Experience (Years)</label>
										<input type="number" name="maxExperienceYears" value={formData.maxExperienceYears} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
									</div>
								</div>

								<div className="pt-2 flex justify-end">
									<button 
										type="button" 
										disabled={!validateDetails()}
										onClick={() => handleCompleteSection("details", "compensation")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Next Step <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>

						{/* Step 3: Compensation */}
						<QuestCard
							title="Compensation & Benefits"
							description="Salary range and perks"
							icon={<DollarSign size={20} />}
							showXp={false}
							completed={completedSections.compensation}
							locked={!completedSections.details}
							hidden={!completedSections.details && expandedSection !== "compensation"}
							stepNumber={3}
							totalSteps={totalSteps}
							expanded={expandedSection === "compensation"}
							onToggle={() => setExpandedSection(expandedSection === "compensation" ? null : "compensation")}
						>
							<div className="space-y-5">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Min Salary (₹) *</label>
										<input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Max Salary (₹)</label>
										<input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
									</div>
								</div>
								
								<div className="flex flex-wrap gap-6 items-center">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Payment Frequency</label>
										<select name="salaryType" value={formData.salaryType} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg bg-white w-40">
											<option value="monthly">Monthly</option>
											<option value="yearly">Yearly</option>
											<option value="weekly">Weekly</option>
										</select>
									</div>
									
									<div className="flex flex-col gap-2 mt-5">
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" checked={formData.isSalaryNegotiable} onChange={(e) => setFormData((p) => ({ ...p, isSalaryNegotiable: e.target.checked }))} className="rounded border-slate-300" />
											<span className="text-sm text-slate-700">Negotiable</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" checked={formData.hideSalary} onChange={(e) => setFormData((p) => ({ ...p, hideSalary: e.target.checked }))} className="rounded border-slate-300" />
											<span className="text-sm text-slate-700">Hide from users</span>
										</label>
									</div>
								</div>

								<div className="border-t border-slate-100 pt-4">
									<label className="block text-sm font-medium text-slate-700 mb-3">Benefits & Perks</label>
									<div className="flex flex-wrap gap-2">
										{BENEFITS_OPTIONS.map((b) => (
											<label key={b.id} className={`
												flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all
												${formData.benefits.includes(b.id) 
													? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10' 
													: 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}
											`}>
												<input type="checkbox" checked={formData.benefits.includes(b.id)} onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)} name={b.id} className="hidden" />
												<span>{b.label}</span>
												{formData.benefits.includes(b.id) && <CheckCircle size={14} className="text-indigo-600" />}
											</label>
										))}
									</div>
								</div>

								<div className="pt-2 flex justify-end">
									<button 
										type="button" 
										disabled={!validateCompensation()}
										onClick={() => handleCompleteSection("compensation", "preferences")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Next Step <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>

						{/* Step 4: Preferences & Settings */}
						<QuestCard
							title="Preferences & Settings"
							description="Hiring criteria and application rules"
							icon={<Users size={20} />}
							showXp={false}
							completed={completedSections.preferences}
							locked={!completedSections.compensation}
							hidden={!completedSections.compensation && expandedSection !== "preferences"}
							stepNumber={4}
							totalSteps={totalSteps}
							expanded={expandedSection === "preferences"}
							onToggle={() => setExpandedSection(expandedSection === "preferences" ? null : "preferences")}
							optional
						>
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<MultiSelect
											label="Preferred Language"
											options={LANGUAGE_OPTIONS}
											selected={formData.preferredLanguage}
											onChange={(selected) => setFormData(p => ({ ...p, preferredLanguage: selected }))}
											placeholder="Select languages"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Gender Preference</label>
										<select name="genderPreference" value={formData.genderPreference} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
											<option value="">No preference</option>
											<option value="male">Male</option>
											<option value="female">Female</option>
											<option value="other">Other</option>
										</select>
									</div>
								</div>
								
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Age Min</label>
										<input type="number" name="ageMin" value={formData.ageMin} onChange={handleChange} min={18} max={100} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="18" />
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Age Max</label>
										<input type="number" name="ageMax" value={formData.ageMax} onChange={handleChange} min={18} max={100} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="60" />
									</div>
									<div className="col-span-2 md:col-span-1">
										<label className="block text-sm font-medium text-slate-700 mb-1">Freshers Allowed?</label>
										<select name="freshersAllowed" value={formData.freshersAllowed} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
											<option value="">—</option>
											<option value="yes">Yes</option>
											<option value="no">No</option>
										</select>
									</div>
								</div>

								<div className="border-t border-slate-100 pt-4">
									<h4 className="text-sm font-semibold text-slate-900 mb-3">Application Settings</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Application Deadline</label>
											<input type="date" name="applicationDeadline" value={formData.applicationDeadline} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Max Applications</label>
											<input type="number" name="maxApplications" value={formData.maxApplications} onChange={handleChange} min={1} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="No Limit" />
										</div>
									</div>
									<label className="flex items-center gap-2 cursor-pointer">
										<input type="checkbox" checked={formData.autoCloseOnLimit} onChange={(e) => setFormData((p) => ({ ...p, autoCloseOnLimit: e.target.checked }))} className="rounded border-slate-300" />
										<span className="text-sm text-slate-700">Auto-close job when limit reached</span>
									</label>
									<label className="flex items-center gap-2 cursor-pointer mt-2">
										<input type="checkbox" name="isResumeRequired" checked={formData.isResumeRequired} onChange={handleChange} className="rounded border-slate-300" />
										<span className="text-sm text-slate-700">Require Resume/CV from applicants</span>
									</label>
								</div>

								<div className="pt-2 flex justify-end">
									<button 
										type="button" 
										onClick={() => handleCompleteSection("preferences", "preview")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
									>
										Next Step <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>

						{/* Step 5: Review & Publish */}
						<QuestCard
							title="Review & Update"
							description="Final check before saving"
							icon={<Trophy size={20} />}
							showXp={false}
							completed={false}
							locked={!completedSections.preferences}
							hidden={!completedSections.preferences && expandedSection !== "preview"}
							stepNumber={5}
							totalSteps={totalSteps}
							expanded={expandedSection === "preview"}
							onToggle={() => setExpandedSection(expandedSection === "preview" ? null : "preview")}
						>
							<div className="space-y-6">
								<div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
									<div className="flex justify-between items-start mb-2">
										<h3 className="text-lg font-bold text-slate-900">{formData.title}</h3>
										<span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-medium uppercase tracking-wide">Preview</span>
									</div>
									
									<div className="flex flex-wrap gap-2 text-sm text-slate-600 mb-4">
										<span className="bg-white px-2 py-0.5 rounded border border-slate-200">{formData.category}</span>
										<span className="bg-white px-2 py-0.5 rounded border border-slate-200 capitalize">{formData.jobType}</span>
										<span className="bg-white px-2 py-0.5 rounded border border-slate-200 capitalize">{formData.locationType}</span>
									</div>
									
									<div className="space-y-4 text-sm text-slate-700">
										<div>
											<p className="font-medium text-slate-900">Location:</p>
											<p>{formData.locationType === "remote" ? "Remote" : [formData.city, formData.area, formData.district, formData.state].filter(Boolean).join(", ")}</p>
										</div>
										{(!formData.hideSalary && (formData.salaryMin || formData.salaryMax)) && (
											<div>
												<p className="font-medium text-slate-900">Salary:</p>
												<p>₹{formData.salaryMin || "?"} – ₹{formData.salaryMax || "?"} / {formData.salaryType} {formData.isSalaryNegotiable && "(Negotiable)"}</p>
											</div>
										)}
										<div>
											<p className="font-medium text-slate-900">Description:</p>
											<p className="line-clamp-3 text-slate-600">{formData.description || "No description provided."}</p>
										</div>
									</div>
								</div>

								<div className="flex flex-col sm:flex-row gap-3">
									<button 
										onClick={() => handleSubmit()} 
										disabled={saving}
										className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center justify-center gap-2"
									>
										{saving ? "Updating..." : (
											<>
												<Sparkles size={18} /> Update Job Details
											</>
										)}
									</button>
								</div>
							</div>
						</QuestCard>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
