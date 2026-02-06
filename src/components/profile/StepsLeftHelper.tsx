/**
 * Steps Left Helper
 * Sticky floating widget showing progress and remaining steps
 */

import { CheckCircle, ArrowRight, Target } from "lucide-react";

interface StepsLeftHelperProps {
	completedSteps: number;
	totalSteps: number;
	onContinue?: () => void;
}

export default function StepsLeftHelper({ 
	completedSteps, 
	totalSteps, 
	onContinue 
}: StepsLeftHelperProps) {
	const remainingSteps = totalSteps - completedSteps;
	const isComplete = remainingSteps === 0;

	if (isComplete) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-40 animate-fade-in">
			<div className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 max-w-[200px]">
				{/* Progress indicator */}
				<div className="flex items-center gap-2 mb-2">
					<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
						<Target size={16} className="text-blue-600" />
					</div>
					<div>
						<p className="text-sm font-semibold text-gray-800">
							{remainingSteps} {remainingSteps === 1 ? 'step' : 'steps'} left
						</p>
						<p className="text-[10px] text-gray-500">
							{completedSteps}/{totalSteps} complete
						</p>
					</div>
				</div>

				{/* Progress bar */}
				<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
					<div 
						className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
						style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
					/>
				</div>

				{/* CTA Button */}
				{onContinue && (
					<button
						onClick={onContinue}
						className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1"
					>
						Continue
						<ArrowRight size={12} />
					</button>
				)}
			</div>
		</div>
	);
}
