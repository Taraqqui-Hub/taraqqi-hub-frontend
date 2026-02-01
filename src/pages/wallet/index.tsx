/**
 * Wallet Page
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

// Generate unique idempotency key
const generateIdempotencyKey = () => {
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	}
	return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};


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

const topUpAmounts = [100, 500, 1000, 2000, 5000];

export default function WalletPage() {
	const [balance, setBalance] = useState(0);
	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [topUpLoading, setTopUpLoading] = useState(false);
	const [selectedAmount, setSelectedAmount] = useState(500);
	const [customAmount, setCustomAmount] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		loadWalletData();
	}, []);

	const loadWalletData = async () => {
		try {
			const [walletRes, transactionsRes] = await Promise.allSettled([
				api.get("/wallet"),
				api.get("/wallet/transactions?limit=10"),
			]);

			if (walletRes.status === "fulfilled") {
				setBalance(walletRes.value.data.wallet.balance);
			}
			if (transactionsRes.status === "fulfilled") {
				setTransactions(transactionsRes.value.data.transactions || []);
			}
		} catch (err) {
			console.error("Failed to load wallet data", err);
		} finally {
			setLoading(false);
		}
	};

	const handleTopUp = async () => {
		const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
		if (!amount || amount < 10) {
			setError("Minimum top-up is ₹10");
			return;
		}

		setTopUpLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await api.post("/wallet/topup", {
				amount,
				idempotencyKey: `topup_${Date.now()}_${generateIdempotencyKey()}`,
				paymentMethod: "upi",
			});

			setSuccess(
				response.data.transaction.isDuplicate
					? "Payment already processed"
					: `₹${amount} added successfully!`
			);
			setBalance(response.data.transaction.newBalance);
			setCustomAmount("");
			loadWalletData();
		} catch (err: any) {
			setError(err.response?.data?.message || "Top-up failed");
		} finally {
			setTopUpLoading(false);
		}
	};

	const categoryLabels: Record<string, string> = {
		deposit: "Top-up",
		resume_unlock: "Resume Unlock",
		job_post_fee: "Job Posting",
		featured_job_fee: "Featured Job",
		refund: "Refund",
		bonus: "Bonus",
	};

	return (
		<ProtectedRoute allowedUserTypes={["employer"]}>
			<DashboardLayout>
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold text-[#0F172A] mb-6">Wallet</h1>

					{loading ? (
						<div className="text-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto"></div>
						</div>
					) : (
						<div className="space-y-6">
							{/* Balance Card */}
							<div className="bg-gradient-to-r from-[#2563EB] to-blue-600 rounded-2xl p-6 text-white">
								<p className="text-sm opacity-80">Available Balance</p>
								<p className="text-4xl font-bold mt-1">₹{balance.toLocaleString()}</p>
							</div>

							{/* Top-up Section */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<h2 className="text-lg font-semibold mb-4">Add Credits</h2>

								{error && (
									<div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
										{error}
									</div>
								)}
								{success && (
									<div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
										{success}
									</div>
								)}

								{/* Amount Selection */}
								<div className="flex flex-wrap gap-2 mb-4">
									{topUpAmounts.map((amount) => (
										<button
											key={amount}
											onClick={() => {
												setSelectedAmount(amount);
												setCustomAmount("");
											}}
											className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
												selectedAmount === amount && !customAmount
													? "bg-[#2563EB] text-white"
													: "bg-slate-100 text-slate-700 hover:bg-slate-200"
											}`}
										>
											₹{amount}
										</button>
									))}
								</div>

								{/* Custom Amount */}
								<div className="flex gap-3">
									<input
										type="number"
										placeholder="Custom amount"
										value={customAmount}
										onChange={(e) => {
											setCustomAmount(e.target.value);
										}}
										min="10"
										className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2563EB]"
									/>
									<button
										onClick={handleTopUp}
										disabled={topUpLoading}
										className="px-6 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1E40AF] disabled:opacity-50"
									>
										{topUpLoading ? "Processing..." : "Add Credits"}
									</button>
								</div>

								<p className="text-xs text-slate-500 mt-3">
									Simulated payment - In production, this would connect to a payment gateway.
								</p>
							</div>

							{/* Transaction History */}
							<div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
								<div className="flex justify-between items-center mb-4">
									<h2 className="text-lg font-semibold">Recent Transactions</h2>
									<Link
										href="/wallet/transactions"
										className="text-sm text-[#2563EB] hover:text-[#1E40AF]"
									>
										View All →
									</Link>
								</div>

								{transactions.length > 0 ? (
									<div className="space-y-3">
										{transactions.map((tx) => (
											<div
												key={tx.id}
												className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
											>
												<div>
													<p className="font-medium text-[#0F172A]">
														{categoryLabels[tx.category] || tx.category}
													</p>
													<p className="text-xs text-slate-500">
														{new Date(tx.date).toLocaleString()}
													</p>
												</div>
												<span
													className={`font-semibold ${
														tx.type === "credit" ? "text-green-600" : "text-red-600"
													}`}
												>
													{tx.type === "credit" ? "+" : "-"}₹{tx.amount}
												</span>
											</div>
										))}
									</div>
								) : (
									<p className="text-center text-slate-500 py-4">No transactions yet</p>
								)}
							</div>
						</div>
					)}
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
