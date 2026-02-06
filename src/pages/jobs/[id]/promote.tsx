/**
 * Promote Job (OLX-style)
 * Optional paid promotion after job creation
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

interface PromotionOption {
	type: string;
	label: string;
	description: string;
	pricePaise: number;
	priceRupees: number;
	durationDays: number;
}

export default function JobPromotePage() {
	const router = useRouter();
	const { id, new: isNew } = router.query;
	const [options, setOptions] = useState<PromotionOption[]>([]);
	const [promoting, setPromoting] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get("/employer/jobs/promotion-options");
				const data = res.data?.payload ?? res.data;
				setOptions(data.options || []);
			} catch (_) {
				setOptions([]);
			}
		})();
	}, []);

	const handlePromote = async (promotionType: string) => {
		if (!id || typeof id !== "string") return;
		setPromoting(promotionType);
		setError(null);
		try {
			await api.post(`/employer/jobs/${id}/promote`, { promotionType });
			router.push("/jobs/manage");
		} catch (err: any) {
			setError(
				err.response?.data?.error || "Promotion failed. Top up wallet and try again."
			);
		} finally {
			setPromoting(null);
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-2xl mx-auto">
					{isNew === "1" && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
							Job created. Promote it for more reach (optional).
						</div>
					)}
					<h1 className="text-2xl font-bold text-[#0F172A] mb-2">Promote this job</h1>
					<p className="text-[#475569] text-sm mb-6">
						Promoted jobs receive up to 5× more applications.
					</p>

					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
							{error}
						</div>
					)}

					<div className="space-y-4">
						{options.map((opt) => (
							<div
								key={opt.type}
								className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
							>
								<div>
									<p className="font-semibold text-[#0F172A]">{opt.label}</p>
									<p className="text-sm text-[#64748B]">{opt.description}</p>
								</div>
								<div className="flex items-center gap-4">
									<span className="font-bold text-[#0F172A]">₹{opt.priceRupees}</span>
									<button
										type="button"
										onClick={() => handlePromote(opt.type)}
										disabled={!!promoting}
										className="py-2 px-4 bg-[#2563EB] text-white font-medium rounded-lg hover:bg-[#1E40AF] disabled:opacity-50"
									>
										{promoting === opt.type ? "Processing…" : "Promote"}
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="mt-8 flex justify-center">
						<Link
							href="/jobs/manage"
							className="text-[#64748B] hover:text-[#2563EB] text-sm font-medium"
						>
							Skip — go to My Jobs
						</Link>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
