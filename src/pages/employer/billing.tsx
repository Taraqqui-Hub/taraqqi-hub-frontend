/**
 * Employer Billing & Invoices
 * Registration payment + wallet transactions (job promotions)
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface RegistrationPayment {
	amountRupees: number;
	currency: string;
	status: string;
	paidAt: string;
}

interface Transaction {
	id: string;
	type: string;
	category: string;
	amount: number;
	description: string;
	date: string;
	status: string;
}

export default function EmployerBillingPage() {
	const [regPayment, setRegPayment] = useState<RegistrationPayment | null>(null);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const [regRes, txRes] = await Promise.all([
					api.get("/registration/employer/my-payment").catch(() => ({ data: { payload: {}, payment: null } })),
					api.get("/wallet/transactions").catch(() => ({ data: { payload: { transactions: [] }, transactions: [] } })),
				]);
				const reg = regRes.data?.payload?.payment ?? regRes.data?.payment;
				if (reg) setRegPayment(reg);
				const tx = txRes.data?.payload?.transactions ?? txRes.data?.transactions ?? [];
				setTransactions(tx);
			} catch (_) {}
			finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Billing & Invoices</h1>

					{loading ? (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB]" />
						</div>
					) : (
						<div className="space-y-8">
							{/* Registration payment */}
							<div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
								<h2 className="text-lg font-semibold text-[#0F172A] mb-4">Registration fee</h2>
								{regPayment ? (
									<div className="flex flex-wrap items-center justify-between gap-4">
										<div>
											<p className="text-[#475569] text-sm">One-time onboarding</p>
											<p className="text-xl font-bold text-[#0F172A]">₹{regPayment.amountRupees}</p>
											<p className="text-xs text-[#64748B] mt-1">
												Paid on {new Date(regPayment.paidAt).toLocaleDateString()}
											</p>
										</div>
										<span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
											Paid
										</span>
									</div>
								) : (
									<p className="text-[#64748B] text-sm">No registration payment record.</p>
								)}
							</div>

							{/* Job promotions / wallet transactions */}
							<div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
								<h2 className="text-lg font-semibold text-[#0F172A] mb-4">Transactions</h2>
								<p className="text-sm text-[#64748B] mb-4">
									Job promotions and wallet activity.
								</p>
								{transactions.length === 0 ? (
									<p className="text-[#64748B] text-sm">No transactions yet.</p>
								) : (
									<ul className="divide-y divide-[#E2E8F0]">
										{transactions.map((t) => (
											<li key={t.id} className="py-3 flex justify-between items-start">
												<div>
													<p className="text-sm font-medium text-[#0F172A]">{t.description || t.category}</p>
													<p className="text-xs text-[#64748B]">
														{new Date(t.date).toLocaleString()}
													</p>
												</div>
												<span className={`text-sm font-medium ${t.type === "credit" ? "text-green-600" : "text-[#0F172A]"}`}>
													{t.type === "credit" ? "+" : "−"}₹{Math.abs(t.amount)}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
