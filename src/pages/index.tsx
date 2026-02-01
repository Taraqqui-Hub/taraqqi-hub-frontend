/**
 * Landing Page
 * Professional, trust-focused design
 */

import Link from "next/link";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			{/* Header */}
			<header className="bg-white border-b border-[#E2E8F0]">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<span className="text-xl font-bold text-[#2563EB]">Taraqqi Hub</span>
						<div className="flex items-center gap-4">
							<Link
								href="/login"
								className="text-sm font-medium text-[#475569] hover:text-[#0F172A]"
							>
								Sign In
							</Link>
							<Link
								href="/register"
								className="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-md hover:bg-[#1E40AF]"
							>
								Get Started
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main>
				<section className="py-20">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 leading-tight">
							Build Your Career with
							<span className="text-[#2563EB]"> Taraqqi Hub</span>
						</h1>
						<p className="text-lg text-[#475569] mb-10 max-w-2xl mx-auto">
							A trusted platform connecting verified job seekers with reputable employers. 
							Complete your KYC once and apply to jobs with confidence.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/register?type=jobseeker"
								className="px-8 py-4 bg-[#2563EB] text-white font-semibold rounded-md hover:bg-[#1E40AF] text-lg"
							>
								Find Jobs
							</Link>
							<Link
								href="/register?type=employer"
								className="px-8 py-4 bg-white text-[#0F172A] font-semibold rounded-md border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] text-lg"
							>
								Hire Talent
							</Link>
						</div>
					</div>
				</section>

				{/* Features */}
				<section className="py-16 bg-white border-t border-[#E2E8F0]">
					<div className="max-w-6xl mx-auto px-4">
						<h2 className="text-2xl font-bold text-[#0F172A] text-center mb-12">
							Why Taraqqi Hub?
						</h2>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="text-center p-6">
								<div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-[#0F172A] mb-2">Verified Profiles</h3>
								<p className="text-[#475569] text-sm">
									KYC verification ensures authentic candidates and legitimate employers.
								</p>
							</div>
							<div className="text-center p-6">
								<div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-[#0F172A] mb-2">Quality Jobs</h3>
								<p className="text-[#475569] text-sm">
									Curated job listings from verified companies in India.
								</p>
							</div>
							<div className="text-center p-6">
								<div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
									<svg className="w-7 h-7 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
								</div>
								<h3 className="text-lg font-semibold text-[#0F172A] mb-2">Secure Transactions</h3>
								<p className="text-[#475569] text-sm">
									Transparent wallet system for employers with clear fee structure.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA */}
				<section className="py-16">
					<div className="max-w-4xl mx-auto px-4 text-center">
						<div className="bg-white rounded-lg p-10 border border-[#E2E8F0] shadow-sm">
							<h2 className="text-2xl font-bold text-[#0F172A] mb-4">
								Ready to get started?
							</h2>
							<p className="text-[#475569] mb-6">
								Join thousands of verified job seekers and employers on Taraqqi Hub.
							</p>
							<Link
								href="/register"
								className="inline-block px-8 py-3 bg-[#2563EB] text-white font-semibold rounded-md hover:bg-[#1E40AF]"
							>
								Create Free Account
							</Link>
						</div>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-white border-t border-[#E2E8F0] py-8">
				<div className="max-w-6xl mx-auto px-4 text-center">
					<p className="text-sm text-[#64748B]">
						© 2026 Taraqqi Hub. All rights reserved.
					</p>
				</div>
			</footer>
		</div>
	);
}
