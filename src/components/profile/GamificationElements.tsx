/**
 * Journey Elements
 * Progress bar, benefit toasts, and celebration effects
 * Replaces old XP/points gamification with benefit-driven UX
 */

import { useEffect, useState } from "react";
import {
	CheckCircle,
	Clock,
	TrendingUp,
	Sparkles,
} from "lucide-react";

// ============================================
// Journey Progress Bar
// ============================================

const STEP_LABELS = ["Basic Info", "Location", "Education", "Skills", "Experience"];

interface JourneyProgressBarProps {
	completionPercentage: number;
	completedSteps: number;
	totalSteps: number;
	animate?: boolean;
}

export function JourneyProgressBar({
	completionPercentage,
	completedSteps,
	totalSteps,
	animate = true,
}: JourneyProgressBarProps) {
	const [displayPercentage, setDisplayPercentage] = useState(animate ? 0 : completionPercentage);

	useEffect(() => {
		if (animate) {
			const timer = setTimeout(() => setDisplayPercentage(completionPercentage), 100);
			return () => clearTimeout(timer);
		} else {
			setDisplayPercentage(completionPercentage);
		}
	}, [completionPercentage, animate]);

	const remainingSteps = totalSteps - completedSteps;
	const estimatedMinutes = remainingSteps * 2; // ~2 min per step

	return (
		<div className="journey-progress">
			{/* Status Text */}
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
					<TrendingUp size={16} className="text-blue-600" />
					<span>{Math.round(displayPercentage)}% Complete</span>
				</div>
				{remainingSteps > 0 && (
					<div className="flex items-center gap-1 text-xs text-gray-500">
						<Clock size={12} />
						<span>~{estimatedMinutes} min left</span>
					</div>
				)}
			</div>

			{/* Progress Bar */}
			<div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
				<div
					className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
					style={{ width: `${displayPercentage}%` }}
				/>
			</div>

			{/* Labeled Step Milestones */}
			<div className="flex justify-between mt-3 gap-1">
				{STEP_LABELS.map((label, i) => (
					<div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
						<div
							className={`w-3 h-3 rounded-full transition-all duration-300 flex items-center justify-center ${
								i < completedSteps
									? "bg-blue-500"
									: i === completedSteps
									? "bg-blue-300 ring-4 ring-blue-100"
									: "bg-gray-200"
							}`}
						/>
						<span className={`text-[9px] font-medium text-center leading-tight ${
							i < completedSteps
								? "text-blue-600"
								: i === completedSteps
								? "text-blue-500"
								: "text-gray-400"
						}`}>{label}</span>
					</div>
				))}
			</div>
		</div>
	);
}

// ============================================
// Benefit Toast (replaces Achievement Badge)
// ============================================

interface BenefitToastProps {
	message: string;
	show: boolean;
	onClose: () => void;
}

export function BenefitToast({ message, show, onClose }: BenefitToastProps) {
	useEffect(() => {
		if (show) {
			const timer = setTimeout(onClose, 3500);
			return () => clearTimeout(timer);
		}
	}, [show, onClose]);

	if (!show) return null;

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
			<div className="bg-white rounded-xl shadow-2xl border border-green-200 px-5 py-3 flex items-center gap-3 max-w-md">
				<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
					<CheckCircle size={18} className="text-green-600" />
				</div>
				<p className="text-sm font-medium text-gray-800">{message}</p>
			</div>
		</div>
	);
}

// ============================================
// Confetti Celebration (kept from original)
// ============================================

interface ConfettiProps {
	show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
	if (!show) return null;

	const particles = Array.from({ length: 50 }, (_, i) => ({
		id: i,
		color: ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"][i % 5],
		left: `${Math.random() * 100}%`,
		delay: Math.random() * 0.5,
		size: 4 + Math.random() * 6,
	}));

	return (
		<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
			{particles.map((p) => (
				<div
					key={p.id}
					className="absolute animate-confetti"
					style={{
						left: p.left,
						top: "-10px",
						width: p.size,
						height: p.size,
						backgroundColor: p.color,
						borderRadius: Math.random() > 0.5 ? "50%" : "0",
						animationDelay: `${p.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

// ============================================
// Persuasion Popup (shows at 70%)
// ============================================

interface PersuasionPopupProps {
	show: boolean;
	onClose: () => void;
}

export function PersuasionPopup({ show, onClose }: PersuasionPopupProps) {
	if (!show) return null;

	return (
		<div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 animate-fadeIn">
			<div className="bg-white rounded-2xl shadow-2xl p-6 mx-4 max-w-sm text-center">
				<div className="w-14 h-14 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
					<TrendingUp size={28} className="text-blue-600" />
				</div>
				<h3 className="text-lg font-bold text-gray-900 mb-2">
					You&apos;re almost there!
				</h3>
				<p className="text-sm text-gray-600 mb-4">
					Complete your profile to increase match accuracy by <span className="font-semibold text-blue-600">3x</span>. Just a few more details!
				</p>
				<button
					onClick={onClose}
					className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all text-sm"
				>
					Let&apos;s finish it
				</button>
			</div>
		</div>
	);
}

// ============================================
// Privacy Badge
// ============================================

interface PrivacyBadgeProps {
	text?: string;
}

export function PrivacyBadge({ text = "Private & Secure" }: PrivacyBadgeProps) {
	return (
		<div className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
			<Sparkles size={12} className="text-gray-400" />
			<span>{text}</span>
		</div>
	);
}

// Keep backward compatibility for imports
// Old named exports that other files might reference
export const XPProgressBar = JourneyProgressBar as any;
export const LevelBadge = () => null;
export const AchievementBadge = () => null;
export function SectionProgress() { return null; }
export function StreakCounter() { return null; }

export default {
	JourneyProgressBar,
	BenefitToast,
	Confetti,
	PersuasionPopup,
	PrivacyBadge,
};
