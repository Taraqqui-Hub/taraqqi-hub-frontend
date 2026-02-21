/**
 * Category-driven job posting form config.
 * Form type determines which fields/steps are shown so posting stays simple and relevant.
 *
 * - simple: Labor, field work, hourly work. Focus: What is the work? Pay. Timing. No resume, no long description.
 * - standard: Mid-level roles. Short description, optional skills/education.
 * - full: Professional/office roles. Full description, skills, education, responsibilities, resume option.
 */

export type JobFormType = "simple" | "standard" | "full";

const SIMPLE_CATEGORIES = [
	"Helpers & Labor",
	"Construction & Site Work",
	"Driver & Delivery",
	"Security & Housekeeping",
	"Cook, Chef & Waiter",
	"Manufacturing & Production",
	"Technician & Mechanic",
	"Hotel & Restaurant Staff",
	"Logistics & Supply Chain",
	"Agriculture & Farming",
	"Retail & Counter Sales",
	"Beautician & Spa",
];

const STANDARD_CATEGORIES = [
	"Sales & Business Development",
	"Marketing & Advertising",
	"Telecalling & BPO",
	"Back Office & Data Entry",
	"Receptionist & Front Desk",
	"Event Management",
];

// Full = everything else: HR & Admin, Accounts & Finance, IT, Design, Teaching, Healthcare, Legal, Real Estate, Other

export function getFormTypeForCategory(category: string): JobFormType {
	if (!category) return "full";
	if (SIMPLE_CATEGORIES.includes(category)) return "simple";
	if (STANDARD_CATEGORIES.includes(category)) return "standard";
	return "full";
}

/** For simple form: no resume requirement, no long description/skills/education step. */
export function isSimpleForm(formType: JobFormType): boolean {
	return formType === "simple";
}

/** For standard form: shorter details step, optional skills/education. */
export function isStandardForm(formType: JobFormType): boolean {
	return formType === "standard";
}

export function isFullForm(formType: JobFormType): boolean {
	return formType === "full";
}
