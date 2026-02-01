/**
 * Transaction History Page
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";

interface Transaction {
	id: string;
	type: "credit" | "debit";
	category: string;
	amount: number;
	balanceBefore: number;
	balanceAfter: number;
	status: string;
	description: string;
	date: string;
}

export default function TransactionsPage() {
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [hasMore, setHasMore] = useState(false);
	const [offset, setOffset] = useState(0);

	useEffect(() => {
		loadTransactions();
	}, []);

	const loadTransactions = async (loadMore = false) => {
		try {
			const currentOffset = loadMore ? offset : 0;
			const response = await api.get(`/wallet/transactions?limit=20&offset=${currentOffset}`);

			const newTransactions = response.data.transactions || [];
			if (loadMore) {
				setTransactions((prev) => [...prev, ...newTransactions]);
			} else {
				setTransactions(newTransactions);
			}

			setHasMore(response.data.pagination.hasMore);
			setOffset(currentOffset + newTransactions.length);
		} catch (err) {
			console.error("Failed to load transactions", err);
		} finally {
			setLoading(false);
		}
	};

	const categoryLabels: Record<string, string> = {
		deposit: "Top-up",
		resume_unlock: "Resume Unlock",
		job_post_fee: "Job Posting",
		featured_job_fee: "Featured Job",
		refund: "Refund",
		bonus: "Bonus",
		withdrawal: "Withdrawal",
	};

	const categoryIcons: Record<string, string> = {
		deposit: "💳",
		resume_unlock: "📄",
		job_post_fee: "💼",
		featured_job_fee: "⭐",
		refund: "↩️",
		bonus: "🎁",
		withdrawal: "🏦",
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer", "jobseeker"]}>
			<DashboardLayout>
				<div className="max-w-3xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Transaction History</h1>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : transactions.length > 0 ? (
						<div className="space-y-3">
							{transactions.map((tx) => (
								<div
									key={tx.id}
									className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
								>
									<div className="flex items-start justify-between">
										<div className="flex items-center">
											<span className="text-2xl mr-3">
												{categoryIcons[tx.category] || "💰"}
											</span>
											<div>
												<p className="font-medium text-[#0F172A]">
													{categoryLabels[tx.category] || tx.category}
												</p>
												<p className="text-sm text-slate-500">{tx.description}</p>
												<p className="text-xs text-slate-400 mt-1">
													{new Date(tx.date).toLocaleString()}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p
												className={`font-semibold ${
													tx.type === "credit" ? "text-green-600" : "text-red-600"
												}`}
											>
												{tx.type === "credit" ? "+" : "-"}₹{tx.amount}
											</p>
											<p className="text-xs text-slate-400">
												Balance: ₹{tx.balanceAfter}
											</p>
										</div>
									</div>
								</div>
							))}

							{hasMore && (
								<button
									onClick={() => loadTransactions(true)}
									className="w-full py-3 text-[#2563EB] border border-[#2563EB] rounded-lg hover:bg-blue-50"
								>
									Load More
								</button>
							)}
						</div>
					) : (
						<div className="text-center py-12 bg-white rounded-xl border border-slate-200">
							<p className="text-slate-500">No transactions yet</p>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
