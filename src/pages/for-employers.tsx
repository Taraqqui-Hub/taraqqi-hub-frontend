import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Briefcase, Users, ShieldCheck } from "lucide-react";

export default function ForEmployersPage() {
	const { user, isAuthenticated } = useAuthStore();
	const isEmployer = isAuthenticated && user?.userType === "employer";

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Top bar consistent with landing/header */}
			<header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
					<Link href="/" className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
							<span className="text-white font-bold text-sm">E</span>
						</div>
						<span className="text-lg font-bold text-slate-900">Equalio</span>
					</Link>
					<div className="flex items-center gap-3">
						<LanguageSwitcher />
						{!isAuthenticated && (
							<Link
								href="/login"
								className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
							>
								Sign in
							</Link>
						)}
					</div>
				</div>
			</header>

			<main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
				{/* Hero section – matches employer tone */}
				<section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-start">
					<div className="flex-1 space-y-3">
						<p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-indigo-600 uppercase">
							<ShieldCheck className="w-4 h-4" />
							For Employers
						</p>
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
							What is Taraqqi Hub for Employers?
						</h1>
						<p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
							Taraqqi Hub is your hiring workspace for verified, serious candidates. Create a trusted
							company profile, publish clear job posts, and review applicants in one simple dashboard
							instead of juggling calls and WhatsApp chats.
						</p>
					</div>
					<div className="w-full md:w-64 bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-2">
						<p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
							At a glance
						</p>
						<ul className="space-y-1.5 text-xs text-indigo-900">
							<li>• Post jobs in under 5 minutes</li>
							<li>• Get a clean list of applicants</li>
							<li>• Call / WhatsApp candidates directly</li>
							<li>• Track who is shortlisted or selected</li>
						</ul>
					</div>
				</section>

				{/* 3‑step flow – cards styled like dashboard cards */}
				<section className="grid md:grid-cols-3 gap-6">
					<div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
						<div className="flex items-center justify-between mb-3">
							<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
								Step 1
							</p>
							<div className="p-2 rounded-full bg-indigo-50">
								<ShieldCheck className="w-4 h-4 text-indigo-600" />
							</div>
						</div>
						<h2 className="text-sm font-semibold text-slate-900 mb-2">
							Create your employer account
						</h2>
						<p className="text-sm text-slate-600 leading-relaxed">
							Register with your work email and contact details. Add your company name, city and a short
							introduction so candidates know who they are speaking to.
						</p>
					</div>

					<div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
						<div className="flex items-center justify-between mb-3">
							<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
								Step 2
							</p>
							<div className="p-2 rounded-full bg-blue-50">
								<Briefcase className="w-4 h-4 text-blue-600" />
							</div>
						</div>
						<h2 className="text-sm font-semibold text-slate-900 mb-2">
							Post simple, clear jobs
						</h2>
						<p className="text-sm text-slate-600 leading-relaxed">
							Use a guided form to add role, salary, location and skills. For many roles you can allow
							direct Call / WhatsApp so serious candidates reach you quickly.
						</p>
					</div>

					<div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
						<div className="flex items-center justify-between mb-3">
							<p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
								Step 3
							</p>
							<div className="p-2 rounded-full bg-emerald-50">
								<Users className="w-4 h-4 text-emerald-600" />
							</div>
						</div>
						<h2 className="text-sm font-semibold text-slate-900 mb-2">
							Review applicants & hire faster
						</h2>
						<p className="text-sm text-slate-600 leading-relaxed">
							See all applicants in one place with simple status labels (new, shortlisted, interview,
							selected). Call candidates directly, update status, and keep your team aligned.
						</p>
					</div>
				</section>

				{/* Why full flow – info block similar to profile page cards */}
				<section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
					<h2 className="text-lg sm:text-xl font-bold text-slate-900">
						Why do we ask for a full employer flow?
					</h2>
					<p className="text-sm sm:text-base text-slate-600 leading-relaxed">
						We verify employers and capture basic company details so that jobseekers can trust your
						postings. A proper flow (contact details, company profile, payment and KYC where applicable)
						reduces fraud, makes your jobs look professional, and improves response quality.
					</p>
					<ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
						<li>Jobseekers see which employers are verified and feel safer applying.</li>
						<li>Your HR / hiring team gets structured information instead of random incoming calls.</li>
						<li>You can re-use your company profile across multiple job postings.</li>
					</ul>
				</section>

				{/* CTA row – buttons matching dashboard/register styles */}
				<section className="flex flex-col sm:flex-row gap-4 sm:items-center">
					{isEmployer ? (
						<>
							<Link
								href="/employer/dashboard"
								className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
							>
								Go to employer dashboard
							</Link>
							<Link
								href="/jobs/new"
								className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-indigo-200 text-indigo-700 text-sm font-semibold hover:bg-indigo-50 transition-colors"
							>
								Post a job
							</Link>
						</>
					) : (
						<>
							<Link
								href="/register?type=employer"
								className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
							>
								Create employer account
							</Link>
							{isAuthenticated ? (
								<p className="text-xs text-slate-500 max-w-xs">
									You are already signed in. To create a separate employer account, you may need to
									sign out first.
								</p>
							) : (
								<Link
									href="/login"
									className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 text-slate-800 text-sm font-semibold hover:bg-white transition-colors"
								>
									Sign in as existing employer
								</Link>
							)}
						</>
					)}
				</section>
			</main>
		</div>
	);
}

