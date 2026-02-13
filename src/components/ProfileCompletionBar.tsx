import { useAuthStore } from "@/store/authStore";
import { Clock, TrendingUp, Lock } from "lucide-react";

interface ProfileCompletionBarProps {
	percentage?: number;
}

export default function ProfileCompletionBar({ percentage }: ProfileCompletionBarProps) {
	const { user } = useAuthStore();
	
	// Use prop or user state
	const completion = percentage ?? user?.profileCompletionPercentage ?? 
		(user?.profileComplete ? 100 : 0);

	const remainingMinutes = Math.max(1, Math.round((100 - completion) / 20) * 2);

	return (
		<div className="w-full bg-white border-b border-gray-200 py-3 px-4 sticky top-0 z-40 shadow-sm">
			<div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="relative w-10 h-10 flex items-center justify-center">
						<svg className="w-full h-full transform -rotate-90">
							<circle
								cx="20"
								cy="20"
								r="16"
								fill="transparent"
								stroke="#E2E8F0"
								strokeWidth="4"
							/>
							<circle
								cx="20"
								cy="20"
								r="16"
								fill="transparent"
								stroke="#2563EB"
								strokeWidth="4"
								strokeDasharray={`${2 * Math.PI * 16}`}
								strokeDashoffset={`${2 * Math.PI * 16 * ((100 - completion) / 100)}`}
								className="transition-all duration-1000 ease-out"
							/>
						</svg>
						<span className="absolute text-[10px] font-bold text-[#2563EB]">
							{Math.round(completion)}%
						</span>
					</div>
					<div>
						<p className="text-sm font-semibold text-[#0F172A]">Build Your Professional Story</p>
						<p className="text-xs text-[#64748B] flex items-center gap-1">
							{completion < 100 ? (
								<>
									<Clock size={10} />
									~{remainingMinutes} min left to complete
								</>
							) : (
								"Your profile is complete!"
							)}
						</p>
					</div>
				</div>
                
                {completion < 100 && (
                    <div className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                        <Lock size={10} />
                        Dashboard Locked
                    </div>
                )}
			</div>
		</div>
	);
}
