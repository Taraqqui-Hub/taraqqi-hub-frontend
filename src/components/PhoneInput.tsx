"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import {
	COUNTRY_OPTIONS,
	getFlagEmoji,
	type CountryOption,
} from "@/lib/countries";

export interface PhoneInputProps {
	countryCode: string;
	onCountryChange: (code: string) => void;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	id?: string;
	disabled?: boolean;
	ariaLabel?: string;
}

export default function PhoneInput({
	countryCode,
	onCountryChange,
	value,
	onChange,
	placeholder = "Phone number",
	id,
	disabled = false,
	ariaLabel = "Phone number",
}: PhoneInputProps) {
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selected = COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0];

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", onDocClick);
		return () => document.removeEventListener("mousedown", onDocClick);
	}, [open]);

	const handleSelect = (c: CountryOption) => {
		onCountryChange(c.code);
		setOpen(false);
	};

	return (
		<div ref={containerRef} className="relative flex min-w-0 flex-1 overflow-visible">
			{/* Country selector trigger — compact width */}
			<button
				type="button"
				onClick={(e) => {
					e.preventDefault();
					if (!disabled) setOpen((o) => !o);
				}}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label="Country code"
				className="flex shrink-0 items-center gap-1.5 pl-2.5 pr-2 py-3.5 text-left text-sm text-neutral-900 border-0 border-r border-neutral-200 bg-neutral-50/80 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60 rounded-l-xl w-[6.5rem] min-w-[6.5rem] justify-center"
			>
				<span className="text-base leading-none shrink-0" aria-hidden>
					{getFlagEmoji(selected.iso2)}
				</span>
				<span className="font-medium tabular-nums truncate">{selected.code}</span>
				<ChevronDown
					className={`w-3.5 h-3.5 text-neutral-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden
				/>
			</button>

			{/* Dropdown — high z-index so it appears above other content */}
			{open && (
				<div
					role="listbox"
					className="absolute left-0 top-full z-[100] mt-1 w-64 max-h-60 overflow-auto rounded-xl border border-neutral-200 bg-white py-1 shadow-lg"
					aria-label="Select country"
				>
					{COUNTRY_OPTIONS.map((c) => (
						<button
							key={c.code}
							type="button"
							role="option"
							aria-selected={c.code === countryCode}
							onMouseDown={(e) => e.preventDefault()}
							onClick={() => handleSelect(c)}
							className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-neutral-900 hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none"
						>
							<span className="text-lg leading-none">{getFlagEmoji(c.iso2)}</span>
							<span className="flex-1 truncate">{c.label}</span>
							<span className="text-neutral-500 tabular-nums font-medium">{c.code}</span>
						</button>
					))}
				</div>
			)}

			{/* Number input */}
			<input
				type="tel"
				id={id}
				value={value}
				onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 15))}
				placeholder={placeholder}
				disabled={disabled}
				autoComplete="tel-national"
				aria-label={ariaLabel}
				className="flex-1 min-w-0 py-3.5 px-4 text-neutral-900 placeholder:text-neutral-400 text-sm bg-white border-0 focus:outline-none focus:ring-0 disabled:bg-transparent disabled:opacity-60 rounded-r-xl"
			/>
		</div>
	);
}
