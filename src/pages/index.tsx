/**
 * Landing Page — Taraqqi Hub
 * Modern, minimalistic design with solid blue color theme
 */

import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

/* ──────────────────────────────────────
   Icon Components (inline SVG)
   ────────────────────────────────────── */

const SearchIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
);

const ShieldIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
	</svg>
);

const UserPlusIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
	</svg>
);

const BriefcaseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
	</svg>
);

const RocketIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m6 5.96a14.926 14.926 0 01-5.84 2.58m0 0a6 6 0 01-7.38-5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.58-5.84L12 2m0 0L9.41 4.59" />
	</svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);

const ClockIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const CurrencyIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);

const QuoteIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
	<svg className={className} fill="currentColor" viewBox="0 0 24 24" opacity={0.15}>
		<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.75-9.57 9-10.609L10 5.151C7.563 6.068 6 8.789 6 11h4v10H0z" />
	</svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
	</svg>
);

const MenuIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
	</svg>
);

const CloseIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
	<svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
	</svg>
);

/* ──────────────────────────────────────
   Sample Data
   ────────────────────────────────────── */

const FEATURED_JOBS = [
	{
		title: "Frontend Developer",
		company: "TechServe Solutions",
		location: "Bengaluru, KA",
		experience: "2–4 years",
		salary: "₹6–10 LPA",
	},
	{
		title: "Sales Executive",
		company: "GreenLeaf Industries",
		location: "Hyderabad, TS",
		experience: "1–3 years",
		salary: "₹3–5 LPA",
	},
	{
		title: "Data Analyst",
		company: "Finova Analytics",
		location: "Mumbai, MH",
		experience: "0–2 years",
		salary: "₹4–7 LPA",
	},
];

const STEPS = [
	{
		number: "01",
		icon: <UserPlusIcon className="w-7 h-7" />,
		title: "Create Your Profile",
		description:
			"Sign up and build your professional profile. Add your education, experience and skills. The more complete your profile, the better your chances.",
	},
	{
		number: "02",
		icon: <BriefcaseIcon className="w-7 h-7" />,
		title: "Apply with Confidence",
		description:
			"Browse verified job listings and apply directly. No middlemen, no hidden process. Track your applications from your dashboard.",
	},
	{
		number: "03",
		icon: <RocketIcon className="w-7 h-7" />,
		title: "Connect and Grow",
		description:
			"Employers review your profile and contact shortlisted candidates. Attend interviews, receive updates and move forward in your career with clarity.",
	},
];

const TESTIMONIALS = [
	{
		quote:
			"I was struggling to find a trustworthy job listing. Through this platform, I found a verified employer and secured a role within one month. The process was clear and professional.",
		name: "Ahmed K.",
		role: "Job Seeker",
	},
	{
		quote:
			"As an employer, we needed skilled and reliable candidates. The platform helped us connect with serious applicants quickly and efficiently.",
		name: "Fatima R.",
		role: "Employer",
	},
];

/* ──────────────────────────────────────
   Page Component
   ────────────────────────────────────── */

export default function HomePage() {
	const { t } = useTranslation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			{/* ─── Header ─── */}
			<header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E2E8F0]">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2 group">
							<div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
								<span className="text-white font-bold text-sm">T</span>
							</div>
							<span className="text-lg font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
								Taraqqi Hub
							</span>
						</Link>

						{/* Desktop Nav */}
						<nav className="hidden md:flex items-center gap-8">
							<Link
								href="/jobs"
								className="text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
							>
								{t("landing.findJobs")}
							</Link>
							<Link
								href="/register?type=employer"
								className="text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
							>
								{t("landing.forEmployers")}
							</Link>
							<a
								href="#how-it-works"
								className="text-sm font-medium text-[#475569] hover:text-[#2563EB] transition-colors"
							>
								{t("landing.howItWorks")}
							</a>
						</nav>

						{/* Desktop Actions */}
						<div className="hidden md:flex items-center gap-3">
							<LanguageSwitcher />
							<Link
								href="/login"
								className="text-sm font-medium text-[#475569] hover:text-[#0F172A] transition-colors px-4 py-2"
							>
								{t("landing.signIn")}
							</Link>
							<Link
								href="/register"
								className="text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1E40AF] px-5 py-2.5 rounded-lg transition-colors"
							>
								{t("landing.getStarted")}
							</Link>
						</div>

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden p-2 text-[#475569] hover:text-[#0F172A]"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
						</button>
					</div>

					{/* Mobile Menu */}
					{mobileMenuOpen && (
						<div className="md:hidden pb-4 border-t border-[#E2E8F0] pt-4 animate-fade-in-up">
							<nav className="flex flex-col gap-3">
								<Link
									href="/jobs"
									className="text-sm font-medium text-[#475569] hover:text-[#2563EB] px-2 py-1.5"
								>
									{t("landing.findJobs")}
								</Link>
								<Link
									href="/register?type=employer"
									className="text-sm font-medium text-[#475569] hover:text-[#2563EB] px-2 py-1.5"
								>
									{t("landing.forEmployers")}
								</Link>
								<a
									href="#how-it-works"
									className="text-sm font-medium text-[#475569] hover:text-[#2563EB] px-2 py-1.5"
								>
									{t("landing.howItWorks")}
								</a>
								<div className="flex gap-3 mt-2">
									<Link
										href="/login"
										className="flex-1 text-center text-sm font-medium text-[#475569] border border-[#E2E8F0] rounded-lg py-2.5 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
									>
										{t("landing.signIn")}
									</Link>
									<Link
										href="/register"
										className="flex-1 text-center text-sm font-semibold text-white bg-[#2563EB] rounded-lg py-2.5 hover:bg-[#1E40AF] transition-colors"
									>
										{t("landing.getStarted")}
									</Link>
								</div>
							</nav>
						</div>
					)}
				</div>
			</header>

			<main>
				{/* ─── Hero Section ─── */}
				<section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
					{/* Decorative backgrounds */}
					<div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 animate-pulse-soft" />
					<div className="absolute bottom-0 left-0 w-72 h-72 bg-[#2563EB]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 animate-pulse-soft" />

					<div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
						{/* Badge */}
						<div className="animate-fade-in-up inline-flex items-center gap-2 px-4 py-1.5 bg-[#2563EB]/5 border border-[#2563EB]/15 rounded-full mb-8">
							<ShieldIcon className="w-4 h-4 text-[#2563EB]" />
							<span className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
								{t("landing.badge")}
							</span>
						</div>

						<h1 className="animate-fade-in-up-delay-1 text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-[#0F172A] leading-tight tracking-tight">
							{t("landing.heroTitle")}
						</h1>

						<p className="animate-fade-in-up-delay-2 mt-6 text-base sm:text-lg text-[#475569] max-w-2xl mx-auto leading-relaxed">
							{t("landing.heroSubtitle")}
						</p>

						<p className="animate-fade-in-up-delay-3 mt-4 text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
							{t("landing.heroGoal")}
						</p>

						{/* CTA Buttons */}
						<div className="animate-fade-in-up-delay-4 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/jobs"
								className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#1E40AF] transition-all text-base shadow-lg shadow-[#2563EB]/20 hover:shadow-xl hover:shadow-[#2563EB]/30"
							>
								{t("landing.findJobs")}
								<ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</Link>
							<Link
								href="/register?type=employer"
								className="inline-flex items-center justify-center px-8 py-4 bg-white text-[#0F172A] font-semibold rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] hover:text-[#2563EB] transition-all text-base shadow-sm hover:shadow-md"
							>
								{t("landing.postAJob")}
							</Link>
						</div>
					</div>
				</section>

				{/* ─── Search Section ─── */}
				<section className="pb-16 sm:pb-20">
					<div className="max-w-2xl mx-auto px-4 sm:px-6">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
								<SearchIcon className="w-5 h-5 text-[#94A3B8]" />
							</div>
							<input
								type="text"
								placeholder="Search by Job Title, Skill or Location"
								className="w-full pl-13 pr-5 py-4 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] shadow-sm transition-all"
							/>
						</div>
						<p className="mt-3 text-xs text-[#64748B] text-center leading-relaxed">
							Explore verified opportunities across different industries and skill levels.
							Filter by experience, salary and job type to find what fits you best.
						</p>
					</div>
				</section>

				{/* ─── Featured Jobs ─── */}
				<section className="py-16 sm:py-20 bg-white border-y border-[#E2E8F0]">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						{/* Header */}
						<div className="text-center mb-12">
							<h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
								Featured Opportunities
							</h2>
							<p className="mt-3 text-sm text-[#64748B] max-w-lg mx-auto">
								Handpicked and verified openings from trusted employers.
								Updated regularly to ensure genuine and active listings.
							</p>
						</div>

						{/* Job Cards */}
						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
							{FEATURED_JOBS.map((job, idx) => (
								<div
									key={idx}
									className="group bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 hover:border-[#2563EB]/30 hover:shadow-md transition-all duration-300"
								>
									{/* Company badge */}
									<div className="flex items-start justify-between mb-4">
										<div className="w-10 h-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-sm">
											{job.company.charAt(0)}
										</div>
										<span className="text-xs font-medium text-[#2563EB] bg-[#2563EB]/5 px-2.5 py-1 rounded-full">
											New
										</span>
									</div>

									<h3 className="text-base font-semibold text-[#0F172A] mb-1 group-hover:text-[#2563EB] transition-colors">
										{job.title}
									</h3>
									<p className="text-sm text-[#475569] mb-4">{job.company}</p>

									{/* Meta */}
									<div className="space-y-2 mb-5">
										<div className="flex items-center gap-2 text-xs text-[#64748B]">
											<MapPinIcon className="w-3.5 h-3.5" />
											{job.location}
										</div>
										<div className="flex items-center gap-2 text-xs text-[#64748B]">
											<ClockIcon className="w-3.5 h-3.5" />
											{job.experience}
										</div>
										<div className="flex items-center gap-2 text-xs text-[#64748B]">
											<CurrencyIcon className="w-3.5 h-3.5" />
											{job.salary}
										</div>
									</div>

									<button className="w-full py-2.5 text-sm font-semibold text-[#2563EB] bg-[#2563EB]/5 rounded-lg hover:bg-[#2563EB] hover:text-white transition-all duration-200">
										Apply Now
									</button>
								</div>
							))}
						</div>

						{/* View all */}
						<div className="text-center mt-10">
							<Link
								href="/jobs"
								className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors group"
							>
								Browse All Jobs
								<ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</div>
					</div>
				</section>

				{/* ─── How It Works ─── */}
				<section id="how-it-works" className="py-16 sm:py-20">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						{/* Header */}
						<div className="text-center mb-14">
							<h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
								How It Works
							</h2>
						</div>

						{/* Steps */}
						<div className="grid md:grid-cols-3 gap-8">
							{STEPS.map((step, idx) => (
								<div key={idx} className="relative text-center group">
									{/* Connector line */}
									{idx < STEPS.length - 1 && (
										<div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-[#E2E8F0]" />
									)}

									{/* Icon */}
									<div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm flex items-center justify-center text-[#2563EB] group-hover:border-[#2563EB]/30 group-hover:shadow-md transition-all duration-300">
										{step.icon}
										<span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-bold flex items-center justify-center">
											{step.number}
										</span>
									</div>

									<h3 className="text-lg font-semibold text-[#0F172A] mb-3">
										{step.title}
									</h3>
									<p className="text-sm text-[#64748B] leading-relaxed max-w-xs mx-auto">
										{step.description}
									</p>
								</div>
							))}
						</div>

						{/* Tagline */}
						<p className="text-center mt-12 text-sm font-medium text-[#94A3B8] tracking-wide">
							Simple. Transparent. Accountable.
						</p>
					</div>
				</section>

				{/* ─── Success Stories ─── */}
				<section className="py-16 sm:py-20 bg-white border-y border-[#E2E8F0]">
					<div className="max-w-5xl mx-auto px-4 sm:px-6">
						{/* Header */}
						<div className="text-center mb-12">
							<h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A]">
								Real Success. Real Impact.
							</h2>
							<p className="mt-3 text-sm text-[#64748B] max-w-md mx-auto">
								When opportunity meets preparation, growth follows. Here are stories from candidates and employers who connected through this platform.
							</p>
						</div>

						{/* Testimonials */}
						<div className="grid md:grid-cols-2 gap-6">
							{TESTIMONIALS.map((t, idx) => (
								<div
									key={idx}
									className="relative bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-8 hover:border-[#2563EB]/20 transition-all duration-300"
								>
									<QuoteIcon className="w-10 h-10 text-[#2563EB] mb-4" />
									<p className="text-sm text-[#475569] leading-relaxed mb-6 italic">
										&ldquo;{t.quote}&rdquo;
									</p>
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold text-sm">
											{t.name.charAt(0)}
										</div>
										<div>
											<p className="text-sm font-semibold text-[#0F172A]">{t.name}</p>
											<p className="text-xs text-[#64748B]">{t.role}</p>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* View more */}
						<div className="text-center mt-10">
							<button className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors group">
								View More Stories
								<ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
							</button>
						</div>
					</div>
				</section>

				{/* ─── Register CTA ─── */}
				<section className="py-16 sm:py-20">
					<div className="max-w-3xl mx-auto px-4 sm:px-6">
						<div className="relative bg-[#0F172A] rounded-2xl p-10 sm:p-14 text-center overflow-hidden">
							{/* Decorative */}
							<div className="absolute top-0 right-0 w-64 h-64 bg-[#2563EB]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
							<div className="absolute bottom-0 left-0 w-48 h-48 bg-[#2563EB]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

							<div className="relative z-10">
								<h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
									Ready to Take the Next Step?
								</h2>
								<p className="text-sm sm:text-base text-[#94A3B8] max-w-lg mx-auto mb-9 leading-relaxed">
									Whether you are searching for a job or hiring talent, start today.
									Build your profile, explore opportunities and become part of a professional and responsible community network.
								</p>

								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link
										href="/register?type=jobseeker"
										className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#2563EB] text-white font-semibold rounded-xl hover:bg-[#3B82F6] transition-all text-sm shadow-lg shadow-[#2563EB]/30"
									>
										Register as Job Seeker
										<ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
									</Link>
									<Link
										href="/register?type=employer"
										className="inline-flex items-center justify-center px-7 py-3.5 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-sm"
									>
										Register as Employer
									</Link>
								</div>

								<p className="mt-8 text-xs text-[#64748B]">
									{t("landing.trustFooter")}
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>

			{/* ─── Footer ─── */}
			<footer className="bg-white border-t border-[#E2E8F0] py-10">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-md bg-[#2563EB] flex items-center justify-center">
								<span className="text-white font-bold text-xs">T</span>
							</div>
							<span className="text-sm font-bold text-[#0F172A]">Taraqqi Hub</span>
						</div>
						<p className="text-xs text-[#94A3B8]">
							{t("landing.copyright", { year: new Date().getFullYear() })}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
