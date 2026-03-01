/**
 * Edit Job Page
 * Reuses the wizard flow from PostJobPage but for editing existing jobs.
 */

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { 
	Briefcase, MapPin, FileText, 
	DollarSign, Users, ArrowRight, 
	Trophy, Sparkles, AlertCircle, CheckCircle,
	Building, Map, Loader2, ExternalLink, MessageCircle, Phone
} from "lucide-react";

// Reuse UI components
import QuestCard from "@/components/profile/QuestCard";
import MultiSelect from "@/components/common/MultiSelect";
import PhoneInput from "@/components/PhoneInput";
import { INDIAN_STATES_DISTRICTS } from "@/data/indianStatesDistricts";
import { getFormTypeForCategory, type JobFormType } from "@/data/jobCategoryFormConfig";
import { DEFAULT_COUNTRY_CODE } from "@/lib/countries";

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
	addressLine1: "",
	addressLine2: "",
	pincode: "",
	city: "",
	district: "",
	state: "",
	roleSummary: "",
	// Structured timing for simple jobs
	workStartTime: "",
	workEndTime: "",
	// Legacy free-text timing (fallback for older jobs)
	workTiming: "",
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
	ageCategory: "",
	ageMin: "",
	ageMax: "",
	genderPreference: "",
	applicationDeadline: "",
	maxApplications: "",
	autoCloseOnLimit: false,
	isResumeRequired: false,
	status: "draft",
	howToApply: "platform" as "platform" | "direct" | "both" | "external",
	externalApplyUrl: "",
};

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
		preferences: true,
		workAndPay: true,
	});

	// Minimal employer contact info so we can explain what individuals will see for direct/both flows
	const [contactInfo, setContactInfo] = useState({
		loaded: false,
		loading: false,
		saving: false,
		error: "",
		hasProfile: true,
		contactPhone: "",
		whatsappNumber: "",
		phoneCountryCode: DEFAULT_COUNTRY_CODE,
		whatsappCountryCode: DEFAULT_COUNTRY_CODE,
		showCallToApplicants: true,
		showWhatsAppToApplicants: true,
	});

	// State/District options
	const stateOptions = useMemo(() => 
		INDIAN_STATES_DISTRICTS.map(s => ({ value: s.state, label: s.state })), 
	[]);
	const districtOptions = useMemo(() => {
		if (formData.state) {
			const stateData = INDIAN_STATES_DISTRICTS.find(s => s.state === formData.state);
			return stateData?.districts.map(d => ({ value: d, label: d })) || [];
		}
		return INDIAN_STATES_DISTRICTS.flatMap(s => 
			s.districts.map(d => ({ value: `${d}|${s.state}`, label: `${d} (${s.state})` }))
		);
	}, [formData.state]);
	const selectedDistrictValue = useMemo(() => {
		if (!formData.district) return [];
		if (formData.state) return [formData.district];
		const found = INDIAN_STATES_DISTRICTS.find(s => s.districts.includes(formData.district));
		return found ? [`${formData.district}|${found.state}`] : [];
	}, [formData.district, formData.state]);

	const formType: JobFormType = useMemo(() => getFormTypeForCategory(formData.category), [formData.category]);
	const isSimple = formType === "simple";

	const hasVisibleContact =
		(contactInfo.showCallToApplicants && contactInfo.contactPhone.trim().length > 0) ||
		(contactInfo.showWhatsAppToApplicants && contactInfo.whatsappNumber.trim().length > 0);

	const parsePhoneFromProfile = (raw: string | null | undefined) => {
		const fallbackCode = DEFAULT_COUNTRY_CODE;
		if (!raw) {
			return { code: fallbackCode, number: "" };
		}
		const trimmed = String(raw).trim();
		if (trimmed.startsWith("+")) {
			const withoutPlus = trimmed.slice(1);
			const match = withoutPlus.match(/^(\d{1,3})(\d*)$/);
			if (match) {
				return {
					code: `+${match[1]}`,
					number: match[2] ?? "",
				};
			}
		}
		const digits = trimmed.replace(/\D/g, "");
		if (!digits) {
			return { code: fallbackCode, number: "" };
		}
		return { code: fallbackCode, number: digits };
	};

	// For simple (labor/field) jobs, always enforce Full-time + Onsite
	useEffect(() => {
		if (isSimple) {
			setFormData((prev) => ({
				...prev,
				jobType: "full-time",
				locationType: "onsite",
			}));
		}
	}, [isSimple]);

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
                        addressLine1: job.address || "",
                        addressLine2: (job as { addressLine2?: string }).addressLine2 || "",
                        pincode: job.pincode || "",
                        city: job.city || "",
                        district: job.district || "",
                        state: job.state || "",
                        roleSummary: job.roleSummary || "",
                        // Try to parse timing from description for simple jobs so start/end fields are pre-filled
                        ...(() => {
                            const d: string = job.description || "";
                            const timingMatch = d.match(/\n\nTiming:\s*([0-9:APMapm\s]+?)-\s*([0-9:APMapm\s]+?)(?:\n|$)/);
                            if (timingMatch) {
                                const start = timingMatch[1].trim();
                                const end = timingMatch[2].trim();
                                return {
                                    workStartTime: start,
                                    workEndTime: end,
                                    workTiming: `${start} - ${end}`,
                                };
                            }
                            const legacyMatch = d.match(/\n\nTiming:\s*(.+?)(?:\n|$)/);
                            const timingText = legacyMatch ? legacyMatch[1].trim() : "";
                            return {
                                workStartTime: "",
                                workEndTime: "",
                                workTiming: timingText,
                            };
                        })(),
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
                        ageCategory: (() => {
                            const min = job.ageMin;
                            const max = job.ageMax;
                            if (min == null && max == null) return "";
                            if (min === 18 && max === 25) return "youth";
                            if (min === 26 && max === 45) return "adult";
                            if (min === 46 && max === 65) return "senior";
                            return "custom";
                        })(),
                        ageMin: job.ageMin != null ? String(job.ageMin) : "",
                        ageMax: job.ageMax != null ? String(job.ageMax) : "",
                        genderPreference: job.genderPreference || "",
                        applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : "",
                        maxApplications: job.maxApplications || "",
                        autoCloseOnLimit: job.autoCloseOnLimit || false,
                        isResumeRequired: job.isResumeRequired || false,
                        status: job.status || "draft",
                        howToApply: (() => {
                            const raw = (job as { howToApply?: string }).howToApply;
                            if (raw === "direct" || raw === "both" || raw === "external") return raw;
                            return "platform";
                        })(),
                        externalApplyUrl: (job as { externalApplyUrl?: string }).externalApplyUrl || "",
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

	// Load employer contact info for the helper beneath how-to-apply radios
	useEffect(() => {
		setContactInfo((prev) => ({ ...prev, loading: true }));
		api
			.get("/profile/employer")
			.then((r) => {
				const p = r.data?.payload?.profile || r.data?.profile;
				if (!p) {
					setContactInfo((prev) => ({
						...prev,
						loading: false,
						loaded: true,
						hasProfile: false,
					}));
					return;
				}
				setContactInfo({
					loaded: true,
					loading: false,
					saving: false,
					error: "",
					hasProfile: true,
					...(() => {
						const parsedPhone = parsePhoneFromProfile(p.contactPhone);
						const parsedWhatsApp = parsePhoneFromProfile(p.whatsappNumber);
						return {
							contactPhone: parsedPhone.number,
							whatsappNumber: parsedWhatsApp.number,
							phoneCountryCode: parsedPhone.code,
							whatsappCountryCode: parsedWhatsApp.code,
						};
					})(),
					showCallToApplicants: p.showCallToApplicants !== false,
					showWhatsAppToApplicants: p.showWhatsAppToApplicants !== false,
				});
			})
			.catch((err: any) => {
				if (err.response?.status === 404) {
					setContactInfo((prev) => ({
						...prev,
						loading: false,
						loaded: true,
						hasProfile: false,
					}));
				} else {
					setContactInfo((prev) => ({
						...prev,
						loading: false,
						loaded: true,
						error: "Failed to load company contact details.",
					}));
				}
			});
	}, []);

	const handleContactInfoChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const { name, type } = e.target;
		const value =
			type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
		setContactInfo((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSaveContactInfo = async () => {
		const phoneTrimmed = contactInfo.contactPhone.trim();
		const waTrimmed = contactInfo.whatsappNumber.trim();
		const phoneDigits = phoneTrimmed.replace(/\D/g, "");
		const waDigits = waTrimmed.replace(/\D/g, "");

		if (!phoneDigits && !waDigits) {
			setContactInfo((prev) => ({
				...prev,
				error: "Add at least a phone or WhatsApp number so candidates can contact you.",
			}));
			return;
		}

		if (phoneTrimmed && phoneDigits.length !== 10) {
			setContactInfo((prev) => ({
				...prev,
				error: "Enter a valid 10 digit phone number.",
			}));
			return;
		}

		if (waTrimmed && waDigits.length !== 10) {
			setContactInfo((prev) => ({
				...prev,
				error: "Enter a valid 10 digit WhatsApp number.",
			}));
			return;
		}
		setContactInfo((prev) => ({ ...prev, saving: true, error: "" }));
		try {
			const fullPhone = phoneDigits
				? `${contactInfo.phoneCountryCode}${phoneDigits}`
				: null;
			const fullWhatsApp = waDigits
				? `${contactInfo.whatsappCountryCode}${waDigits}`
				: null;
			await api.patch("/profile/employer", {
				contactPhone: fullPhone,
				whatsappNumber: fullWhatsApp,
				showCallToApplicants: contactInfo.showCallToApplicants,
				showWhatsAppToApplicants: contactInfo.showWhatsAppToApplicants,
			});
			setContactInfo((prev) => ({
				...prev,
				saving: false,
				error: "",
				hasProfile: true,
			}));
		} catch (err: any) {
			const status = err.response?.status;
			let message = "Failed to save contact details.";
			if (status === 404) {
				message = "Create your company profile first from the Company Profile page.";
			} else if (err.response?.data?.message) {
				message = err.response.data.message;
			}
			setContactInfo((prev) => ({
				...prev,
				saving: false,
				error: message,
			}));
		}
	};

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
	) => {
		const { name, value, type } = e.target;
		
		if (name === "pincode") {
			setFormData((prev) => ({ ...prev, pincode: value.replace(/\D/g, "").slice(0, 6) }));
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
		if (name === "maxApplications" && !value) {
			setFormData((prev) => ({ ...prev, maxApplications: "", autoCloseOnLimit: false }));
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
		const timingText =
			formData.workStartTime || formData.workEndTime
				? `Timing: ${formData.workStartTime || "?"} - ${formData.workEndTime || "?"}`
				: (formData.workTiming?.trim() ? `Timing: ${formData.workTiming.trim()}` : "");

		const description = isSimple
			? [formData.roleSummary?.trim(), timingText].filter(Boolean).join("\n\n") || formData.description
			: formData.description;
		return {
			title: formData.title,
			category: formData.category || undefined,
			jobType: formData.jobType,
			locationType: formData.locationType,
			address: formData.addressLine1?.trim() || undefined,
			addressLine2: formData.addressLine2?.trim() || undefined,
			pincode: formData.pincode?.trim() || undefined,
			city: formData.city?.trim() || undefined,
			district: formData.district || undefined,
			state: formData.state || undefined,
			roleSummary: formData.roleSummary || undefined,
			description: description || (formData.roleSummary?.trim() || "Job opening"),
			requirements: isSimple ? undefined : (formData.requirements || undefined),
			responsibilities: isSimple ? undefined : (formData.responsibilities || undefined),
			skillsRequired: isSimple ? undefined : (formData.skillsRequired.length > 0 ? formData.skillsRequired : undefined),
			minExperienceYears: formData.minExperienceYears,
			maxExperienceYears: formData.maxExperienceYears ? parseInt(formData.maxExperienceYears as string, 10) : undefined,
			educationRequired: isSimple ? undefined : (formData.educationRequired || undefined),
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
			isResumeRequired: isSimple ? false : formData.isResumeRequired,
			status: statusOverride || formData.status,
			howToApply: formData.howToApply || "platform",
			externalApplyUrl: formData.howToApply === "external" && formData.externalApplyUrl?.trim() ? formData.externalApplyUrl.trim() : undefined,
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
		const locationValid = formData.locationType === "remote" || (
			!!formData.addressLine1?.trim() &&
			!!formData.city?.trim() &&
			!!formData.district?.trim() &&
			!!formData.state?.trim() &&
			!!formData.pincode?.trim() &&
			formData.pincode.length === 6
		);
		return basicValid && locationValid;
	};

	const validateDetails = () => {
		if (isSimple) return true;
		return formData.description.trim().length >= 1 && formData.skillsRequired.length > 0 && formData.educationRequired;
	};

	const validateWorkAndPay = () => {
		const hasWork = formData.roleSummary.trim().length >= 1;
		const hasPay = (formData.salaryMin && parseFloat(formData.salaryMin as string) > 0) || formData.hideSalary;
		return hasWork && hasPay;
	};

	const validateCompensation = () => {
		return (formData.salaryMin && parseFloat(formData.salaryMin as string) > 0) || formData.hideSalary;
	};

	const totalSteps = isSimple ? 4 : 5;
	const completedCount = isSimple
		? [completedSections.overview, completedSections.workAndPay, completedSections.preferences].filter(Boolean).length
		: [completedSections.overview, completedSections.details, completedSections.compensation, completedSections.preferences].filter(Boolean).length;
	const progressPercentage = totalSteps > 1 ? Math.round((completedCount / (totalSteps - 1)) * 100) : 0;

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
							<span>{completedCount} of {totalSteps - 1} steps completed</span>
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
										{isSimple && formData.category && (
											<p className="text-xs text-indigo-600 mt-1.5 font-medium">Simple form: we’ll only ask what’s the work, pay, and timing.</p>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
										{isSimple ? (
											<div className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium">
												Full-time (fixed for this job type)
											</div>
										) : (
											<select
												name="jobType"
												value={formData.jobType}
												onChange={handleChange}
												className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
											>
												<option value="full-time">Full-time</option>
												<option value="part-time">Part-time</option>
												<option value="contract">Contract</option>
												<option value="internship">Internship</option>
												<option value="freelance">Freelance</option>
											</select>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Work Mode *</label>
										{isSimple ? (
											<div className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 text-sm font-medium">
												Onsite (field work)
											</div>
										) : (
											<select
												name="locationType"
												value={formData.locationType}
												onChange={handleChange}
												className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
											>
												<option value="onsite">Onsite</option>
												<option value="hybrid">Hybrid</option>
												<option value="remote">Remote</option>
											</select>
										)}
									</div>
								</div>

								<div className="pt-4 border-t border-slate-100">
									<h4 className="text-sm font-semibold text-slate-900 mb-3">Location Details</h4>
									{formData.locationType === "remote" && (
										<div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-sm mb-4">
											Remote job selected. You can optionally specify a base location below.
										</div>
									)}

									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Address Line 1 {formData.locationType !== "remote" && <span className="text-rose-500">*</span>}</label>
											<div className="relative">
												<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
												<input
													name="addressLine1"
													value={formData.addressLine1}
													onChange={handleChange}
													className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
													placeholder="House No., Building, Street, Area"
												/>
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2 <span className="text-slate-400 text-xs">(Optional)</span></label>
											<input
												name="addressLine2"
												value={formData.addressLine2}
												onChange={handleChange}
												className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
												placeholder="Landmark or extended address"
											/>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-slate-700 mb-1">City / Town {formData.locationType !== "remote" && <span className="text-rose-500">*</span>}</label>
												<div className="relative">
													<Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
													<input
														name="city"
														value={formData.city}
														onChange={handleChange}
														className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
														placeholder="e.g. Mumbai, Indore"
													/>
												</div>
											</div>
											<div className="relative z-10">
												<label className="block text-sm font-medium text-slate-700 mb-1">District {formData.locationType !== "remote" && <span className="text-rose-500">*</span>}</label>
												<MultiSelect
													options={districtOptions}
													selected={selectedDistrictValue}
													onChange={(selected) => {
														if (selected.length === 0) setFormData((p) => ({ ...p, district: "" }));
														else {
															const val = selected[0];
															if (formData.state) setFormData((p) => ({ ...p, district: val }));
															else {
																const [d, s] = val.split("|");
																setFormData((p) => ({ ...p, district: d, state: s }));
															}
														}
													}}
													placeholder="Select District"
													searchPlaceholder="Search District..."
													singleSelect
												/>
											</div>
											<div className="relative z-10">
												<label className="block text-sm font-medium text-slate-700 mb-1">State / UT {formData.locationType !== "remote" && <span className="text-rose-500">*</span>}</label>
												<MultiSelect
													options={stateOptions}
													selected={formData.state ? [formData.state] : []}
													onChange={(selected) => {
														const newState = selected[0] || "";
														setFormData((p) => ({ ...p, state: newState, district: newState !== p.state ? "" : p.district }));
													}}
													placeholder="Select State"
													searchPlaceholder="Search State..."
													singleSelect
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-slate-700 mb-1">PIN Code {formData.locationType !== "remote" && <span className="text-rose-500">*</span>}</label>
												<div className="relative">
													<MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
													<input
														name="pincode"
														value={formData.pincode}
														onChange={handleChange}
														className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
														placeholder="e.g. 452001"
														maxLength={6}
													/>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* How do you want to receive responses? */}
								<div className="pt-6 border-t border-slate-100">
									<h4 className="text-base font-semibold text-slate-900 mb-1">How do you want to receive responses?</h4>
									<p className="text-sm text-slate-500 mb-4">Candidates will see this on your job. Choose what works best for you.</p>
									<div className="grid gap-3 sm:grid-cols-2">
										<label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.howToApply === "platform" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"}`}>
											<input type="radio" name="howToApply" value="platform" checked={formData.howToApply === "platform"} onChange={handleChange} className="mt-1 text-indigo-600" />
											<div>
												<span className="font-medium text-slate-900">Apply on platform</span>
												<p className="text-xs text-slate-600 mt-0.5">Candidates submit their profile and application here. You review them in your dashboard.</p>
											</div>
										</label>
										<label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.howToApply === "direct" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"}`}>
											<input type="radio" name="howToApply" value="direct" checked={formData.howToApply === "direct"} onChange={handleChange} className="mt-1 text-indigo-600" />
											<div>
												<span className="font-medium text-slate-900">Direct contact only (call / WhatsApp)</span>
												<p className="text-xs text-slate-600 mt-0.5">No applications on platform. Candidates will call or WhatsApp you. Add phone/WhatsApp in company profile.</p>
											</div>
										</label>
										<label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.howToApply === "both" ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300"}`}>
											<input type="radio" name="howToApply" value="both" checked={formData.howToApply === "both"} onChange={handleChange} className="mt-1 text-indigo-600" />
											<div>
												<span className="font-medium text-slate-900">Both</span>
												<p className="text-xs text-slate-600 mt-0.5">Candidates can apply here or contact you directly. Best if you’re fine with either.</p>
											</div>
										</label>
										<label className={`flex gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${formData.howToApply === "external" ? "border-indigo-500 bg-indigo-50/50 shadow-sm" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
											<input type="radio" name="howToApply" value="external" checked={formData.howToApply === "external"} onChange={handleChange} className="mt-0.5 shrink-0 text-indigo-600" />
											<div className="min-w-0">
												<div className="flex items-center gap-2 font-medium text-slate-900">
													<ExternalLink className="w-4 h-4 text-amber-600 shrink-0" />
													Third-party URL
												</div>
												<p className="text-xs text-slate-600 mt-1">Redirect to your career page or ATS.</p>
											</div>
										</label>
									</div>

									{formData.howToApply === "external" && (
										<div className="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
											<label className="block text-sm font-medium text-slate-800">Application URL <span className="text-red-500">*</span></label>
											<input
												type="url"
												name="externalApplyUrl"
												value={formData.externalApplyUrl}
												onChange={handleChange}
												placeholder="https://careers.example.com/apply/..."
												className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
											/>
											<p className="text-xs text-slate-500">Candidates will click a button to open this link in a new tab.</p>
										</div>
									)}

									{(formData.howToApply === "direct" || formData.howToApply === "both") && (
										<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
											<p className="text-xs font-semibold text-amber-900">
												To get direct calls or WhatsApp from candidates, we use your company contact details.
											</p>

											{contactInfo.loading ? (
												<p className="text-xs text-slate-500">Loading contact details…</p>
											) : (
												<>
													<div className="text-xs text-slate-700 space-y-1">
														<p className="font-semibold text-slate-900">What candidates will see on this job:</p>
														{hasVisibleContact ? (
															<>
																<ul className="list-disc list-inside space-y-0.5">
																	{contactInfo.showCallToApplicants && contactInfo.contactPhone.trim().length > 0 && (
																		<li>
																			Phone: {contactInfo.phoneCountryCode}
																			{contactInfo.contactPhone}
																		</li>
																	)}
																	{contactInfo.showWhatsAppToApplicants && contactInfo.whatsappNumber.trim().length > 0 && (
																		<li>
																			WhatsApp: {contactInfo.whatsappCountryCode}
																			{contactInfo.whatsappNumber}
																		</li>
																	)}
																</ul>
																<p className="text-xs text-slate-500 mt-1">
																	You can update these contact details below. Changes apply to this and future jobs.
																</p>
															</>
														) : (
															<p className="text-xs text-amber-800">
																No phone or WhatsApp is set yet. Add at least one contact below so candidates can reach you directly.
															</p>
														)}
													</div>
													<div className="grid gap-3 md:grid-cols-2">
														<div>
															<label className="block text-xs font-medium text-slate-800 mb-1">
																Phone number (for calls)
															</label>
															<div className="flex rounded-xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-[border-color,box-shadow]">
																<PhoneInput
																	id="employer-contact-phone-edit"
																	countryCode={contactInfo.phoneCountryCode}
																	onCountryChange={(code) =>
																		setContactInfo((prev) => ({
																			...prev,
																			phoneCountryCode: code,
																		}))
																	}
																	value={contactInfo.contactPhone}
																	onChange={(val) =>
																		setContactInfo((prev) => ({
																			...prev,
																			contactPhone: val,
																		}))
																	}
																	placeholder="10-digit mobile number"
																	ariaLabel="Phone number for calls"
																/>
															</div>
														</div>
														<div>
															<label className="block text-xs font-medium text-slate-800 mb-1">
																WhatsApp number
															</label>
															<div className="flex rounded-xl border border-slate-200 bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-[border-color,box-shadow]">
																<PhoneInput
																	id="employer-contact-whatsapp-edit"
																	countryCode={contactInfo.whatsappCountryCode}
																	onCountryChange={(code) =>
																		setContactInfo((prev) => ({
																			...prev,
																			whatsappCountryCode: code,
																		}))
																	}
																	value={contactInfo.whatsappNumber}
																	onChange={(val) =>
																		setContactInfo((prev) => ({
																			...prev,
																			whatsappNumber: val,
																		}))
																	}
																	placeholder="Number where you use WhatsApp"
																	ariaLabel="WhatsApp number"
																/>
															</div>
														</div>
													</div>
													<div className="flex flex-col gap-1 mt-1">
														<label className="inline-flex items-center gap-2 text-xs text-slate-700">
															<input
																type="checkbox"
																name="showCallToApplicants"
																checked={contactInfo.showCallToApplicants}
																onChange={handleContactInfoChange}
																className="w-3 h-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
															/>
															<span>Show this phone number to applicants</span>
														</label>
														<label className="inline-flex items-center gap-2 text-xs text-slate-700">
															<input
																type="checkbox"
																name="showWhatsAppToApplicants"
																checked={contactInfo.showWhatsAppToApplicants}
																onChange={handleContactInfoChange}
																className="w-3 h-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
															/>
															<span>Show this WhatsApp number to applicants</span>
														</label>
													</div>
													<div className="flex items-center justify-between gap-3 mt-2">
														<button
															type="button"
															onClick={handleSaveContactInfo}
															disabled={contactInfo.saving}
															className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
														>
															{contactInfo.saving ? "Saving…" : "Save contact for this & future jobs"}
														</button>
														{!contactInfo.hasProfile && (
															<a
																href="/employer/profile"
																className="text-[11px] text-slate-600 hover:text-slate-900 underline"
															>
																Open full Company Profile
															</a>
														)}
													</div>
													{contactInfo.error && (
														<p className="mt-1 text-[11px] text-red-600">{contactInfo.error}</p>
													)}
												</>
											)}
										</div>
									)}
								</div>

								<div className="pt-2 flex justify-end">
									<button 
										type="button" 
										disabled={!validateOverview()}
										onClick={() => handleCompleteSection("overview", isSimple ? "workAndPay" : "details")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Next Step <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>

						{isSimple && (
						<QuestCard
							title="Work & Pay"
							description="What is the work? How much do we pay? Timing."
							icon={<DollarSign size={20} />}
							showXp={false}
							completed={completedSections.workAndPay}
							locked={!completedSections.overview}
							hidden={!completedSections.overview && expandedSection !== "workAndPay"}
							stepNumber={2}
							totalSteps={totalSteps}
							expanded={expandedSection === "workAndPay"}
							onToggle={() => setExpandedSection(expandedSection === "workAndPay" ? null : "workAndPay")}
						>
							<div className="space-y-5">
								<div>
									<label className="block text-sm font-bold text-slate-700 mb-1.5">What is the work? <span className="text-rose-500">*</span></label>
									<textarea name="roleSummary" value={formData.roleSummary} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" placeholder="e.g. Loading/unloading goods at warehouse. Packing and labeling." />
									<p className="text-xs text-slate-500 mt-1">Briefly describe what the worker will do.</p>
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-1">Work timing <span className="text-slate-400 text-xs">(Optional)</span></label>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<div>
											<label className="block text-xs font-medium text-slate-500 mb-1">Start time</label>
											<input
												type="time"
												name="workStartTime"
												value={formData.workStartTime}
												onChange={handleChange}
												className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
											/>
										</div>
										<div>
											<label className="block text-xs font-medium text-slate-500 mb-1">End time</label>
											<input
												type="time"
												name="workEndTime"
												value={formData.workEndTime}
												onChange={handleChange}
												className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 text-sm"
											/>
										</div>
									</div>
								</div>
								<div className="border-t border-slate-100 pt-4">
									<h4 className="text-sm font-semibold text-slate-900 mb-3">Pay</h4>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Min Salary (₹) <span className="text-rose-500">*</span></label>
											<input type="number" name="salaryMin" value={formData.salaryMin} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
										</div>
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Max Salary (₹)</label>
											<input type="number" name="salaryMax" value={formData.salaryMax} onChange={handleChange} min={0} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
										</div>
									</div>
									<div className="flex flex-wrap gap-4 items-center mt-4">
										<div>
											<label className="block text-sm font-medium text-slate-700 mb-1">Payment frequency</label>
											<select name="salaryType" value={formData.salaryType} onChange={handleChange} className="px-3 py-2 border border-slate-200 rounded-lg bg-white w-40">
												<option value="daily">Daily</option>
												<option value="weekly">Weekly</option>
												<option value="monthly">Monthly</option>
												<option value="quarterly">Quarterly</option>
												<option value="yearly">Yearly</option>
											</select>
										</div>
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" checked={formData.isSalaryNegotiable} onChange={(e) => setFormData((p) => ({ ...p, isSalaryNegotiable: e.target.checked }))} className="rounded border-slate-300" />
											<span className="text-sm text-slate-700">Negotiable</span>
										</label>
										<label className="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" checked={formData.hideSalary} onChange={(e) => setFormData((p) => ({ ...p, hideSalary: e.target.checked }))} className="rounded border-slate-300" />
											<span className="text-sm text-slate-700">Hide from listing</span>
										</label>
									</div>
								</div>
								<div className="border-t border-slate-100 pt-4">
									<label className="block text-sm font-medium text-slate-700 mb-2">Benefits (optional)</label>
									<div className="flex flex-wrap gap-2 mb-3">
										{BENEFITS_OPTIONS.map((b) => (
											<label key={b.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${formData.benefits.includes(b.id) ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-200 text-slate-600"}`}>
												<input type="checkbox" checked={formData.benefits.includes(b.id)} onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement>)} name={b.id} className="hidden" />
												<span>{b.label}</span>
												{formData.benefits.includes(b.id) && <CheckCircle size={14} className="text-indigo-600" />}
											</label>
										))}
									</div>
									<div className="flex flex-wrap gap-2 items-center">
										<input
											type="text"
											placeholder="Add custom (e.g. Food, Overtime pay)"
											className="flex-1 min-w-[140px] px-3 py-2 border border-slate-200 rounded-lg text-sm"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													const input = e.target as HTMLInputElement;
													const v = input.value.trim();
													if (v && !formData.benefits.includes(v)) {
														setFormData((p) => ({ ...p, benefits: [...p.benefits, v] }));
														input.value = "";
													}
												}
											}}
											id="custom-benefit-simple-edit"
										/>
										<button
											type="button"
											onClick={() => {
												const input = document.getElementById("custom-benefit-simple-edit") as HTMLInputElement;
												const v = input?.value?.trim();
												if (v && !formData.benefits.includes(v)) {
													setFormData((p) => ({ ...p, benefits: [...p.benefits, v] }));
													if (input) input.value = "";
												}
											}}
											className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
										>
											Add
										</button>
									</div>
								</div>
								<div className="pt-2 flex justify-end gap-3">
									<button
										type="button"
										disabled={!completedSections.overview}
										onClick={() => setExpandedSection("preferences")}
										className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
									>
										Optional preferences
									</button>
									<button
										type="button"
										disabled={!validateWorkAndPay()}
										onClick={() => handleCompleteSection("workAndPay", "preview")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Go to review <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>
						)}

						{!isSimple && (
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
									<label className="block text-sm font-medium text-slate-700 mb-1">Full Description <span className="text-rose-500">*</span></label>
									<textarea name="description" value={formData.description} onChange={handleChange} required rows={5} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Detailed job description. Add as much detail as you need." />
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
						)}

						{!isSimple && (
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
											<option value="daily">Daily</option>
											<option value="weekly">Weekly</option>
											<option value="monthly">Monthly</option>
											<option value="quarterly">Quarterly</option>
											<option value="yearly">Yearly</option>
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
									<div className="flex flex-wrap gap-2 mb-4">
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
									<div className="flex flex-wrap gap-2 items-center">
										<input
											type="text"
											placeholder="Add custom benefit (e.g. Work from home, Gym)"
											className="flex-1 min-w-[180px] px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													const input = e.target as HTMLInputElement;
													const v = input.value.trim();
													if (v && !formData.benefits.includes(v)) {
														setFormData((p) => ({ ...p, benefits: [...p.benefits, v] }));
														input.value = "";
													}
												}
											}}
											id="custom-benefit-input-edit"
										/>
										<button
											type="button"
											onClick={() => {
												const input = document.getElementById("custom-benefit-input-edit") as HTMLInputElement;
												const v = input?.value?.trim();
												if (v && !formData.benefits.includes(v)) {
													setFormData((p) => ({ ...p, benefits: [...p.benefits, v] }));
													if (input) input.value = "";
												}
											}}
											className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
										>
											Add
										</button>
									</div>
									{formData.benefits.filter((b) => !BENEFITS_OPTIONS.some((opt) => opt.id === b)).length > 0 && (
										<div className="flex flex-wrap gap-2 mt-3">
											{formData.benefits.filter((b) => !BENEFITS_OPTIONS.some((opt) => opt.id === b)).map((custom) => (
												<span key={custom} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm">
													{custom}
													<button
														type="button"
														onClick={() => setFormData((p) => ({ ...p, benefits: p.benefits.filter((x) => x !== custom) }))}
														className="text-indigo-500 hover:text-indigo-700"
														aria-label="Remove"
													>
														×
													</button>
												</span>
											))}
										</div>
									)}
								</div>

								<div className="pt-2 flex justify-end gap-3">
									<button
										type="button"
										disabled={!completedSections.details}
										onClick={() => setExpandedSection("preferences")}
										className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all"
									>
										Optional preferences
									</button>
									<button 
										type="button" 
										disabled={!validateCompensation()}
										onClick={() => handleCompleteSection("compensation", "preview")}
										className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 transition-all flex items-center gap-2"
									>
										Go to review <ArrowRight size={18} />
									</button>
								</div>
							</div>
						</QuestCard>
						)}

						{/* Step 3 (Simple) or 4 (Full): Preferences & Settings */}
						<QuestCard
							title="Preferences & Settings"
							description="Hiring criteria and application rules"
							icon={<Users size={20} />}
							showXp={false}
							completed={completedSections.preferences}
							locked={isSimple ? !completedSections.workAndPay : !completedSections.compensation}
							hidden={(isSimple ? !completedSections.workAndPay : !completedSections.compensation) && expandedSection !== "preferences"}
							stepNumber={isSimple ? 3 : 4}
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
								
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-slate-700 mb-1">Job age category</label>
										<select
											name="ageCategory"
											value={formData.ageCategory}
											onChange={(e) => {
												const v = e.target.value;
												setFormData((p) => {
													const next = { ...p, ageCategory: v };
													if (v === "none" || v === "") {
														next.ageMin = "";
														next.ageMax = "";
													} else if (v === "youth") {
														next.ageMin = "18";
														next.ageMax = "25";
													} else if (v === "adult") {
														next.ageMin = "26";
														next.ageMax = "45";
													} else if (v === "senior") {
														next.ageMin = "46";
														next.ageMax = "65";
													}
													return next;
												});
											}}
											className="w-full px-4 py-2 border border-slate-200 rounded-lg"
										>
											<option value="">No preference</option>
											<option value="youth">Youth (18–25)</option>
											<option value="adult">Adult (26–45)</option>
											<option value="senior">Senior (46–65)</option>
											<option value="custom">Custom range</option>
										</select>
									</div>
									{formData.ageCategory === "custom" && (
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-slate-700 mb-1">Age Min <span className="text-rose-500">*</span></label>
												<input type="number" name="ageMin" value={formData.ageMin} onChange={handleChange} min={18} max={100} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="18" />
											</div>
											<div>
												<label className="block text-sm font-medium text-slate-700 mb-1">Age Max <span className="text-rose-500">*</span></label>
												<input type="number" name="ageMax" value={formData.ageMax} onChange={handleChange} min={18} max={100} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="60" />
											</div>
										</div>
									)}
									{formData.ageCategory && formData.ageCategory !== "custom" && (
										<p className="text-sm text-slate-600">
											Age range: {formData.ageMin}–{formData.ageMax} years
										</p>
									)}
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
									<div>
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
									<label className={`flex items-center gap-2 cursor-pointer ${!formData.maxApplications ? "opacity-60 cursor-not-allowed" : ""}`}>
										<input
											type="checkbox"
											checked={formData.autoCloseOnLimit}
											onChange={(e) => setFormData((p) => ({ ...p, autoCloseOnLimit: e.target.checked }))}
											disabled={!formData.maxApplications}
											className="rounded border-slate-300"
										/>
										<span className="text-sm text-slate-700">Auto-close job when limit reached</span>
									</label>
									{!formData.maxApplications && <p className="text-xs text-slate-500 mt-1">Set a max application limit above to enable this option.</p>}
									{!isSimple && (
									<label className="flex items-center gap-2 cursor-pointer mt-2">
										<input type="checkbox" name="isResumeRequired" checked={formData.isResumeRequired} onChange={handleChange} className="rounded border-slate-300" />
										<span className="text-sm text-slate-700">Require Resume/CV from applicants</span>
									</label>
									)}
									{isSimple && <p className="text-xs text-slate-500 mt-2">Resume is not required for this type of job.</p>}
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
							locked={
								!completedSections.overview ||
								(isSimple ? !completedSections.workAndPay : !completedSections.compensation)
							}
							hidden={
								(!completedSections.overview ||
									(isSimple ? !completedSections.workAndPay : !completedSections.compensation)) &&
								expandedSection !== "preview"
							}
							stepNumber={isSimple ? 4 : 5}
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
											<p>{formData.locationType === "remote" ? "Remote" : [formData.addressLine1, formData.addressLine2, formData.city, formData.district, formData.state, formData.pincode].filter(Boolean).join(", ")}</p>
										</div>
										{(!formData.hideSalary && (formData.salaryMin || formData.salaryMax)) && (
											<div>
												<p className="font-medium text-slate-900">Salary:</p>
												<p>₹{formData.salaryMin || "?"} – ₹{formData.salaryMax || "?"} / {formData.salaryType} {formData.isSalaryNegotiable && "(Negotiable)"}</p>
											</div>
										)}
										<div>
											<p className="font-medium text-slate-900">{isSimple ? "Work & Pay:" : "Description:"}</p>
											<p className="line-clamp-3 text-slate-600">{isSimple ? [formData.roleSummary, formData.workTiming && `Timing: ${formData.workTiming}`].filter(Boolean).join(" · ") || "No details." : (formData.description || "No description provided.")}</p>
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
