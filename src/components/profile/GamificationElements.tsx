/**
 * Gamification Elements
 * XP bar, level indicators, achievement badges, and celebration effects
 */

import { useEffect, useState } from "react";
import { 
	Star, 
	Trophy, 
	Sparkles, 
	Award,
	TrendingUp,
	Flame
} from "lucide-react";

// ============================================
// XP Progress Bar
// ============================================

interface XPProgressBarProps {
	currentXP: number;
	maxXP: number;
	level: number;
	levelName: string;
	animate?: boolean;
	compact?: boolean;
}

export function XPProgressBar({ currentXP, maxXP, level, levelName, animate = true, compact = false }: XPProgressBarProps) {
	const [displayXP, setDisplayXP] = useState(animate ? 0 : currentXP);
	const percentage = Math.min(100, Math.round((currentXP / maxXP) * 100));

	useEffect(() => {
		if (animate) {
			const timer = setTimeout(() => setDisplayXP(currentXP), 100);
			return () => clearTimeout(timer);
		}
	}, [currentXP, animate]);

	const displayPercentage = Math.min(100, Math.round((displayXP / maxXP) * 100));

	// Compact variant - just a thin progress bar
	if (compact) {
		return (
			<div className="xp-progress-compact">
				<div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
					<div 
						className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out"
						style={{ width: `${displayPercentage}%` }}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="xp-progress-container">
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-3">
					<LevelBadge level={level} />
					<div>
						<p className="text-sm font-semibold text-gray-800">{levelName}</p>
						<p className="text-xs text-gray-500">Level {level}</p>
					</div>
				</div>
				<div className="text-right">
					<p className="text-lg font-bold text-blue-600">{displayXP} Points</p>
					<p className="text-xs text-gray-500">Out of {maxXP} Points</p>
				</div>
			</div>
			
			<div className="relative h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
				<div 
					className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
					style={{ width: `${displayPercentage}%` }}
				/>
				{/* Shine effect */}
				<div 
					className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000"
					style={{ width: `${displayPercentage}%` }}
				/>
			</div>
			
			<div className="flex justify-between mt-1 text-[10px] text-gray-400">
				<span>Start</span>
				<span>{displayPercentage}% Complete</span>
				<span>Complete</span>
			</div>
		</div>
	);
}


// ============================================
// Level Badge
// ============================================

interface LevelBadgeProps {
	level: number;
	size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, size = "md" }: LevelBadgeProps) {
	const colors = [
		"from-gray-400 to-gray-500", // Level 1
		"from-green-400 to-green-600", // Level 2
		"from-blue-400 to-blue-600", // Level 3
		"from-purple-400 to-purple-600", // Level 4
		"from-yellow-400 to-orange-500", // Level 5
	];
	
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
	};

	const iconSizes = {
		sm: 16,
		md: 24,
		lg: 32,
	};

	return (
		<div className={`
			${sizeClasses[size]}
			bg-gradient-to-br ${colors[level - 1] || colors[0]}
			rounded-xl shadow-lg
			flex items-center justify-center
			text-white font-bold
			transform hover:scale-110 transition-transform
			relative overflow-hidden
		`}>
			{/* Shine effect */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
			<Star size={iconSizes[size]} className="relative z-10" fill="currentColor" />
		</div>
	);
}

// ============================================
// Achievement Badge (appears when completing a section)
// ============================================

interface AchievementBadgeProps {
	title: string;
	xp: number;
	icon: React.ReactNode;
	show: boolean;
	onClose: () => void;
}

export function AchievementBadge({ title, xp, icon, show, onClose }: AchievementBadgeProps) {
	useEffect(() => {
		if (show) {
			const timer = setTimeout(onClose, 3000);
			return () => clearTimeout(timer);
		}
	}, [show, onClose]);

	if (!show) return null;

	return (
		<div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
			<div className="achievement-popup pointer-events-auto">
				<div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-yellow-400 animate-bounce-in">
					<div className="text-center">
						<div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white">
							{icon}
						</div>
						<p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Congratulations!</p>
						<h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
						<div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
							<TrendingUp size={14} />
							+{xp} Points
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ============================================
// Confetti Celebration
// ============================================

interface ConfettiProps {
	show: boolean;
}

export function Confetti({ show }: ConfettiProps) {
	if (!show) return null;

	const particles = Array.from({ length: 50 }, (_, i) => ({
		id: i,
		color: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5],
		left: `${Math.random() * 100}%`,
		delay: Math.random() * 0.5,
		size: 4 + Math.random() * 6,
	}));

	return (
		<div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
			{particles.map(p => (
				<div
					key={p.id}
					className="absolute animate-confetti"
					style={{
						left: p.left,
						top: '-10px',
						width: p.size,
						height: p.size,
						backgroundColor: p.color,
						borderRadius: Math.random() > 0.5 ? '50%' : '0',
						animationDelay: `${p.delay}s`,
					}}
				/>
			))}
		</div>
	);
}

// ============================================
// Section Progress Indicator (Mini)
// ============================================

interface SectionProgressProps {
	completed: boolean;
	inProgress?: boolean;
	xp: number;
	optional?: boolean;
}

export function SectionProgress({ completed, inProgress, xp, optional }: SectionProgressProps) {
	return (
		<div className="flex items-center gap-2">
			<div className={`
				w-6 h-6 rounded-full flex items-center justify-center
				${completed 
					? 'bg-gradient-to-br from-green-400 to-green-600 text-white' 
					: inProgress 
						? 'bg-blue-100 text-blue-600 animate-pulse' 
						: 'bg-gray-100 text-gray-400'}
			`}>
				{completed ? <Award size={14} /> : inProgress ? <Sparkles size={14} /> : <Star size={14} />}
			</div>
			<span className={`text-xs font-medium ${completed ? 'text-green-600' : 'text-gray-400'}`}>
				{completed ? `+${xp}` : `${xp}`} Points
			</span>
			{optional && (
				<span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
					Bonus
				</span>
			)}
		</div>
	);
}

// ============================================
// Streak Counter
// ============================================

interface StreakCounterProps {
	days: number;
}

export function StreakCounter({ days }: StreakCounterProps) {
	return (
		<div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
			<Flame size={18} className="text-orange-500" />
			<span className="text-sm font-semibold text-orange-600">{days} Day Streak</span>
		</div>
	);
}

export default {
	XPProgressBar,
	LevelBadge,
	AchievementBadge,
	Confetti,
	SectionProgress,
	StreakCounter,
};
