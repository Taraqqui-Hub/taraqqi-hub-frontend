/**
 * Journey Step Card
 * Clean, minimal card for each profile step
 * Conversational design with benefit messaging
 */

import { ReactNode, useRef, useEffect } from "react";
import { ChevronDown, Check, Lock, ArrowRight } from "lucide-react";

interface QuestCardProps {
	title: string;
	description: string;
	helperText?: string;
	icon: ReactNode;
	xp?: number;
	showXp?: boolean;
	completed: boolean;
	optional?: boolean;
	locked?: boolean;
	hidden?: boolean;
	expanded?: boolean;
	stepNumber?: number;
	totalSteps?: number;
	isActive?: boolean;
	onToggle?: () => void;
	children: ReactNode;
}

export default function QuestCard({
	title,
	description,
	helperText,
	icon,
	completed,
	optional = false,
	locked = false,
	hidden = false,
	expanded = false,
	stepNumber,
	isActive = false,
	onToggle,
	children,
}: QuestCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	// Auto-scroll into view when expanded
	useEffect(() => {
		if (expanded && cardRef.current) {
			setTimeout(() => {
				cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
			}, 100);
		}
	}, [expanded]);

	const handleToggle = () => {
		if (locked) return;
		if (onToggle) onToggle();
	};

	if (hidden) return null;

	return (
		<div
			ref={cardRef}
			className={`
				rounded-2xl border transition-all duration-300
				${completed
					? "border-gray-200 bg-white"
					: locked
					? "border-gray-100 bg-gray-50/60"
					: expanded
					? "border-blue-200 bg-white shadow-lg shadow-blue-500/5"
					: "border-gray-200 bg-white hover:shadow-md hover:border-gray-300"}
			`}
		>
			{/* Header */}
			<button
				onClick={handleToggle}
				disabled={locked}
				className={`
					w-full py-4 px-4 flex items-center gap-4 text-left min-h-[56px]
					${locked ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
				`}
			>
				{/* Step Number / Icon */}
				<div
					className={`
						w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
						${completed
							? "bg-green-50 text-green-600"
							: locked
							? "bg-gray-100 text-gray-400"
							: isActive || expanded
							? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
							: "bg-gray-100 text-gray-500"}
					`}
				>
					{completed ? (
						<Check size={20} strokeWidth={2.5} />
					) : locked ? (
						<Lock size={16} />
					) : stepNumber ? (
						<span className="text-sm font-bold">{stepNumber}</span>
					) : (
						icon
					)}
				</div>

				{/* Title & Description */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<h3
							className={`font-semibold text-[15px] ${
								completed
									? "text-gray-700"
									: locked
									? "text-gray-400"
									: "text-gray-900"
							}`}
						>
							{title}
						</h3>
						{optional && (
							<span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
								Optional
							</span>
						)}
						{completed && (
							<span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
								Completed
							</span>
						)}
					</div>
					<p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{description}</p>
				</div>

				{/* Expand/Collapse */}
				{!locked && (
					<div className="flex items-center">
						{completed && !expanded ? (
							<span className="text-xs font-medium text-blue-600 mr-1">Edit</span>
						) : null}
						<ChevronDown
							size={18}
							className={`text-gray-400 transition-transform duration-300 flex-shrink-0 ${
								expanded ? "rotate-180" : ""
							}`}
						/>
					</div>
				)}
			</button>

			{/* Helper Text */}
			{expanded && !locked && helperText && (
				<div className="px-4 pb-2">
					<p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 flex items-center gap-2">
						<ArrowRight size={12} className="flex-shrink-0" />
						{helperText}
					</p>
				</div>
			)}

			{/* Content */}
			{expanded && !locked && (
				<div className="px-4 pb-5 pt-2 border-t border-gray-100 space-y-4">
					{children}
				</div>
			)}

			{/* Locked Message */}
			{locked && !hidden && (
				<div className="px-4 pb-3 flex items-center justify-center gap-2 text-xs text-gray-400">
					<Lock size={12} />
					Complete previous step to unlock
				</div>
			)}
		</div>
	);
}
