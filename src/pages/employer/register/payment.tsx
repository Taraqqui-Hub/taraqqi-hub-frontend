/**
 * Employer Registration Payment
 * One-time onboarding fee — mandatory before company profile
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface PaymentInfo {
	amountPaise: string;
	amountRupees: number;
	currency: string;
	oneTime: boolean;
	whatsIncluded: string[];
}

export default function EmployerRegisterPaymentPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [paying, setPaying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<PaymentInfo | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const res = await api.get("/registration/employer/payment-info");
				const data = res.data?.payload ?? res.data;
				setInfo({
					amountPaise: data.amountPaise,
					amountRupees: data.amountRupees ?? Number(data.amountPaise) / 100,
					currency: data.currency || "INR",
					oneTime: data.oneTime !== false,
					whatsIncluded: data.whatsIncluded || [],
				});
			} catch (e) {
				setError("Could not load payment details.");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handlePay = async () => {
		setPaying(true);
		setError(null);
		try {
			const res = await api.post("/registration/employer/complete-payment", {
				simulate: true,
			});
			const data = res.data?.payload ?? res.data;
			if (data.nextStep) {
				router.push(data.nextStep);
				return;
			}
			router.push("/employer/register/company");
		} catch (err: any) {
			setError(
				err.response?.data?.error || "Payment failed. Please try again."
			);
		} finally {
			setPaying(false);
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-lg">
					<div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
						<div className="p-6 sm:p-8">
							<h1 className="text-2xl font-bold text-[#0F172A] mb-2">
								One-time onboarding fee
							</h1>
							<p className="text-[#475569] text-sm mb-6">
								To maintain a verified and spam-free hiring platform, employers
								are required to pay a one-time onboarding fee.
							</p>

							{loading && (
								<div className="flex justify-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
								</div>
							)}

							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
									{error}
								</div>
							)}

							{!loading && info && (
								<>
									<div className="mb-6 p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg">
										<div className="flex justify-between items-center">
											<span className="text-[#475569]">Amount</span>
											<span className="text-2xl font-bold text-[#0F172A]">
												₹{info.amountRupees}
											</span>
										</div>
										<p className="text-xs text-[#64748B] mt-2">
											One-time • No hidden charges
										</p>
									</div>

									<div className="mb-6">
										<h3 className="text-sm font-semibold text-[#0F172A] mb-3">
											What this unlocks
										</h3>
										<ul className="space-y-2">
											{info.whatsIncluded.map((item, i) => (
												<li
													key={i}
													className="flex items-center gap-2 text-sm text-[#475569]"
												>
													<svg
														className="w-4 h-4 text-green-500 flex-shrink-0"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M5 13l4 4L19 7"
														/>
													</svg>
													{item}
												</li>
											))}
										</ul>
									</div>

									<button
										type="button"
										onClick={handlePay}
										disabled={paying}
										className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{paying ? "Processing…" : `Pay ₹${info.amountRupees} — Continue`}
									</button>
								</>
							)}
						</div>
						<div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-center">
							<Link
								href="/employer/dashboard"
								className="text-sm text-[#64748B] hover:text-[#2563EB]"
							>
								Back to dashboard
							</Link>
						</div>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
