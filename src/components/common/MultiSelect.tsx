/**
 * MultiSelect Component
 * Reusable searchable multi-select dropdown with chip-based selection display
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { X, ChevronDown, Search, Check } from "lucide-react";

export interface MultiSelectOption {
	value: string;
	label: string;
}

interface MultiSelectProps {
	options: MultiSelectOption[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	label?: string;
	required?: boolean;
	searchPlaceholder?: string;
	maxDisplayChips?: number;
	singleSelect?: boolean;
	disabled?: boolean;
}

export default function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = "Select options...",
	label,
	required = false,
	searchPlaceholder = "Search...",
	maxDisplayChips = 3,
	singleSelect = false,
	disabled = false,
}: MultiSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Filter options based on search
	const filteredOptions = options.filter((opt) =>
		opt.label.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Get selected option labels
	const selectedLabels = selected
		.map((val) => options.find((opt) => opt.value === val)?.label || val)
		.filter(Boolean);

	// Handle click outside to close
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
				setSearchQuery("");
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Focus input when opened
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	const handleToggle = useCallback(() => {
		if (!disabled) {
			setIsOpen(!isOpen);
		}
	}, [disabled, isOpen]);

	const handleSelect = useCallback(
		(value: string) => {
			if (singleSelect) {
				onChange([value]);
				setIsOpen(false);
				setSearchQuery("");
			} else {
				if (selected.includes(value)) {
					onChange(selected.filter((v) => v !== value));
				} else {
					onChange([...selected, value]);
				}
			}
		},
		[singleSelect, selected, onChange]
	);

	const handleRemove = useCallback(
		(value: string, e: React.MouseEvent) => {
			e.stopPropagation();
			onChange(selected.filter((v) => v !== value));
		},
		[selected, onChange]
	);

	const handleClearAll = useCallback(
		(e: React.MouseEvent) => {
			e.stopPropagation();
			onChange([]);
		},
		[onChange]
	);

	return (
		<div className="relative" ref={containerRef}>
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1">
					{label} {required && <span className="text-red-500">*</span>}
				</label>
			)}

			{/* Trigger Button */}
			<button
				type="button"
				onClick={handleToggle}
				disabled={disabled}
				className={`
					w-full min-h-[50px] px-3 py-3 text-left rounded-lg border transition-all
					flex items-center gap-2 flex-wrap
					${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white cursor-pointer"}
					${isOpen ? "border-blue-500 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"}
				`}
			>
				{/* Selected Chips */}
				{selected.length > 0 ? (
					<div className="flex-1 flex flex-wrap gap-1">
						{selectedLabels.slice(0, maxDisplayChips).map((label, idx) => (
							<span
								key={selected[idx]}
								className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-sm rounded-full"
							>
								{label}
								{!singleSelect && (
									<button
										type="button"
										onClick={(e) => handleRemove(selected[idx], e)}
										className="hover:bg-blue-200 rounded-full p-0.5"
									>
										<X size={12} />
									</button>
								)}
							</span>
						))}
						{selected.length > maxDisplayChips && (
							<span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-sm rounded-full">
								+{selected.length - maxDisplayChips} more
							</span>
						)}
					</div>
				) : (
					<span className="flex-1 text-gray-400">{placeholder}</span>
				)}

				{/* Clear & Chevron */}
				<div className="flex items-center gap-1">
					{selected.length > 0 && !singleSelect && (
						<button
							type="button"
							onClick={handleClearAll}
							className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
							title="Clear all"
						>
							<X size={16} />
						</button>
					)}
					<ChevronDown
						size={18}
						className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
					/>
				</div>
			</button>

			{/* Dropdown */}
			{isOpen && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
					{/* Search */}
					<div className="p-2 border-b border-gray-100">
						<div className="relative">
							<Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								ref={inputRef}
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder={searchPlaceholder}
								className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-100 outline-none"
							/>
						</div>
					</div>

					{/* Options List */}
					<div className="max-h-48 overflow-y-auto">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-4 text-center text-gray-500 text-sm">
								No options found
							</div>
						) : (
							filteredOptions.map((opt) => {
								const isSelected = selected.includes(opt.value);
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => handleSelect(opt.value)}
										className={`
											w-full px-3 py-2.5 text-left flex items-center justify-between
											hover:bg-blue-50 transition-colors
											${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-700"}
										`}
									>
										<span className="text-sm">{opt.label}</span>
										{isSelected && <Check size={16} className="text-blue-600" />}
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
}
