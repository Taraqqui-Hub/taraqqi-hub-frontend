/**
 * Quest Card
 * Collapsible card component for each profile section
 * Compact design with progressive reveal support
 */

import { ReactNode, useState, useRef, useEffect } from "react";
import { ChevronDown, Lock, Check, Sparkles, ArrowRight } from "lucide-react";

interface QuestCardProps {
	title: string;
	description: string;
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
	onToggle?: () => void;
	children: ReactNode;
}

export default function QuestCard({
	title,
	description,
	icon,
	xp = 0,
	showXp = true,
	completed,
	optional = false,
	locked = false,
	hidden = false,
	expanded = false,
	stepNumber,
	totalSteps,
	onToggle,
	children,
}: QuestCardProps) {
	const [internalExpanded, setInternalExpanded] = useState(expanded);
	const isExpanded = onToggle ? expanded : internalExpanded;
	const cardRef = useRef<HTMLDivElement>(null);

	// Auto-scroll into view when expanded
	useEffect(() => {
		if (isExpanded && cardRef.current) {
			setTimeout(() => {
				cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 100);
		}
	}, [isExpanded]);

	const handleToggle = () => {
		if (locked) return;
		if (onToggle) {
			onToggle();
		} else {
			setInternalExpanded(!internalExpanded);
		}
	};

	// Hide locked sections completely for progressive reveal
	if (hidden) {
		return null;
	}

	return (
		<div 
			ref={cardRef}
			className={`
				quest-card rounded-xl border-2 transition-all duration-300
				${completed 
					? 'border-green-200 bg-green-50/50' 
					: locked 
						? 'border-gray-100 bg-gray-50/50' 
						: isExpanded 
							? 'border-blue-300 bg-white shadow-md' 
							: 'border-gray-200 bg-white hover:border-blue-200'}
			`}
		>
			{/* Header - Compact padding */}
			<button
				onClick={handleToggle}
				disabled={locked}
				className={`
					w-full p-3 flex items-center gap-3 text-left
					${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
				`}
			>
				{/* Icon - Slightly smaller */}
				<div className={`
					w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
					${completed 
						? 'bg-green-100 text-green-600' 
						: locked 
							? 'bg-gray-100 text-gray-400' 
							: 'bg-blue-100 text-blue-600'}
				`}>
					{completed ? <Check size={20} /> : locked ? <Lock size={18} /> : icon}
				</div>

				{/* Title & Description */}
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						{/* Step indicator */}
						{stepNumber && totalSteps && !completed && !locked && (
							<span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">
								Step {stepNumber}/{totalSteps}
							</span>
						)}
						<h3 className={`font-semibold text-sm ${completed ? 'text-green-700' : locked ? 'text-gray-400' : 'text-gray-800'}`}>
							{title}
						</h3>
						{optional && (
							<span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
								Bonus
							</span>
						)}
						{completed && (
							<span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
								<Sparkles size={8} />
								Done
							</span>
						)}
					</div>
					<p className="text-xs text-gray-500 line-clamp-1">{description}</p>
				</div>

				{/* XP Badge - Compact */}
				{showXp && (
					<div className={`
						px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0
						${completed 
							? 'bg-green-100 text-green-600' 
							: 'bg-gray-100 text-gray-500'}
					`}>
						{completed ? '+' : ''}{xp} pts
					</div>
				)}

				{/* Expand/Edit Icon */}
				{!locked && (
					<div className="flex items-center gap-2">
						{completed && (
							<span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
								Edit
							</span>
						)}
						<ChevronDown 
							size={18} 
							className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
						/>
					</div>
				)}
			</button>

			{/* Content - Compact padding */}
			{isExpanded && !locked && (
				<div className="px-3 pb-3 pt-2 border-t border-gray-100">
					{children}
				</div>
			)}

			{/* Locked Message - More friendly */}
			{locked && !hidden && (
				<div className="px-3 pb-3 flex items-center justify-center gap-2 text-xs text-gray-400">
					<Lock size={12} />
					Complete previous step to unlock
				</div>
			)}
		</div>
	);
}
