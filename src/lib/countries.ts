/**
 * Country dial codes with ISO 3166-1 alpha-2 codes for flag emoji.
 * Sorted by dial code; India first as default.
 */

export interface CountryOption {
	code: string;
	iso2: string;
	label: string;
}

/** Regional indicator A = U+1F1E6. Flag emoji from ISO2 e.g. "IN" -> 🇮🇳 */
export function getFlagEmoji(iso2: string): string {
	if (!iso2 || iso2.length !== 2) return "";
	return [...iso2.toUpperCase()]
		.map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
		.join("");
}

export const COUNTRY_OPTIONS: CountryOption[] = [
	{ code: "+91", iso2: "IN", label: "India" },
	{ code: "+1", iso2: "US", label: "United States" },
	{ code: "+44", iso2: "GB", label: "United Kingdom" },
	{ code: "+92", iso2: "PK", label: "Pakistan" },
	{ code: "+971", iso2: "AE", label: "United Arab Emirates" },
	{ code: "+966", iso2: "SA", label: "Saudi Arabia" },
	{ code: "+61", iso2: "AU", label: "Australia" },
	{ code: "+81", iso2: "JP", label: "Japan" },
	{ code: "+86", iso2: "CN", label: "China" },
	{ code: "+33", iso2: "FR", label: "France" },
	{ code: "+49", iso2: "DE", label: "Germany" },
	{ code: "+65", iso2: "SG", label: "Singapore" },
];

export const DEFAULT_COUNTRY_CODE = "+91";
