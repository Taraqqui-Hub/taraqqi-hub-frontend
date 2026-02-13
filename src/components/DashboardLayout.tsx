/**
 * Dashboard Layout
 * Modern, minimalistic layout with Lucide icons
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import {
	LayoutDashboard,
	User,
	Briefcase,
	FileText,
	Building2,
	Settings,
	LogOut,
	Menu,
	X,
	ChevronRight,
	Shield,
	Wallet,
	Bell,
	Bookmark,
} from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

// Navigation items with Lucide icons
const getNavItems = (userType: string) => {
	if (userType === "individual") {
		return [
			{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
			{ href: "/profile", label: "Profile", icon: User },
			{ href: "/jobs", label: "Browse Jobs", icon: Briefcase },
			{ href: "/applications", label: "Applications", icon: FileText },

			// { href: "/wallet", label: "Wallet", icon: Wallet },
			{ href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
		];
	}
	return [
		{ href: "/employer/dashboard", label: "Dashboard", icon: LayoutDashboard },
		{ href: "/employer/profile", label: "Company Profile", icon: Building2 },
		{ href: "/jobs/manage", label: "My Jobs", icon: Briefcase },
		{ href: "/employer/applicants", label: "Applicants", icon: FileText },
		{ href: "/employer/billing", label: "Billing & Invoices", icon: Wallet },
	];
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const { user, isAuthenticated, isLoading, logout } = useAuthStore();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
		}
	}, [isLoading, isAuthenticated, router]);

	// Close mobile menu on route change
	useEffect(() => {
		setMobileMenuOpen(false);
	}, [router.pathname]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-slate-50 flex items-center justify-center">
				<div className="flex flex-col items-center gap-3">
					<div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent"></div>
					<p className="text-sm text-slate-500">Loading...</p>
				</div>
			</div>
		);
	}

	if (!isAuthenticated || !user) {
		console.log("DashboardLayout: Not authenticated or no user", { isAuthenticated, user });
		return null;
	}

	console.log("DashboardLayout: Rendering for user", user.id);

	const navItems = getNavItems(user.userType);

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Sidebar - Desktop */}
			<aside 
				className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 hidden md:flex flex-col transition-all duration-300 ${
					sidebarCollapsed ? "w-20" : "w-64"
				}`}
			>
				{/* Logo */}
				<div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
					{!sidebarCollapsed && (
						<Link href={user.userType === "employer" ? "/employer/dashboard" : "/dashboard"} className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">T</span>
							</div>
							<span className="text-lg font-bold text-slate-800">Taraqqi</span>
						</Link>
					)}
					{sidebarCollapsed && (
						<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mx-auto">
							<span className="text-white font-bold text-sm">T</span>
						</div>
					)}
				</div>

				{/* User Info */}
				{!sidebarCollapsed && (
					<div className="p-4 border-b border-slate-100">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
								{user.name?.charAt(0)?.toUpperCase() || "U"}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-slate-800 truncate">
									{user.name || "User"}
								</p>
								<p className="text-xs text-slate-500 truncate">
									{user.email || user.phone}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Navigation */}
				<nav className="flex-1 p-3 space-y-1 overflow-y-auto">
					{navItems.map((item) => {
						const isActive = router.pathname === item.href;
						const Icon = item.icon;
						
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
									isActive
										? "bg-blue-50 text-blue-600"
										: "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
								} ${sidebarCollapsed ? "justify-center" : ""}`}
								title={sidebarCollapsed ? item.label : undefined}
							>
								<Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`} />
								{!sidebarCollapsed && <span>{item.label}</span>}
								{!sidebarCollapsed && isActive && (
									<ChevronRight className="w-4 h-4 ml-auto" />
								)}
							</Link>
						);
					})}
				</nav>

				{/* Bottom Actions */}
				<div className="p-3 border-t border-slate-100 space-y-1">
					<Link
						href="/kyc"
						className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all ${
							sidebarCollapsed ? "justify-center" : ""
						}`}
						title={sidebarCollapsed ? "Verification" : undefined}
					>
						<Shield className="w-5 h-5 text-slate-400" />
						{!sidebarCollapsed && <span>Verification</span>}
					</Link>
					<button
						onClick={() => logout()}
						className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all ${
							sidebarCollapsed ? "justify-center" : ""
						}`}
						title={sidebarCollapsed ? "Logout" : undefined}
					>
						<LogOut className="w-5 h-5" />
						{!sidebarCollapsed && <span>Logout</span>}
					</button>
				</div>

				{/* Collapse Toggle */}
				<button
					onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
					className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition"
				>
					<ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
				</button>
			</aside>

			{/* Main Content Area */}
			<div className={`transition-all duration-300 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
				{/* Top Header - Mobile & Desktop */}
				<header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
					<div className="flex items-center justify-between h-16 px-4 sm:px-6">
						{/* Mobile Menu Button */}
						<button
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
						>
							{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>

						{/* Mobile Logo */}
						<Link href={user.userType === "employer" ? "/employer/dashboard" : "/dashboard"} className="md:hidden flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-sm">T</span>
							</div>
							<span className="text-lg font-bold text-slate-800">Taraqqi</span>
						</Link>

						{/* Spacer for desktop */}
						<div className="hidden md:block" />

						{/* Right Section */}
						<div className="flex items-center gap-3">
							{/* Notifications */}
							<button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition relative">
								<Bell className="w-5 h-5" />
								<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
							</button>

							{/* User Badge - Desktop */}
							<div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
								<span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full capitalize">
									{user.userType}
								</span>
							</div>
						</div>
					</div>
				</header>

				{/* Mobile Menu Overlay */}
				{mobileMenuOpen && (
					<div className="fixed inset-0 z-50 md:hidden">
						<div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileMenuOpen(false)} />
						<div className="fixed inset-y-0 left-0 w-72 bg-white shadow-xl">
							{/* Mobile Menu Header */}
							<div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
								<Link href={user.userType === "employer" ? "/employer/dashboard" : "/dashboard"} className="flex items-center gap-2">
									<div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
										<span className="text-white font-bold text-sm">T</span>
									</div>
									<span className="text-lg font-bold text-slate-800">Taraqqi</span>
								</Link>
								<button
									onClick={() => setMobileMenuOpen(false)}
									className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
								>
									<X className="w-5 h-5" />
								</button>
							</div>

							{/* Mobile User Info */}
							<div className="p-4 border-b border-slate-100">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
										{user.name?.charAt(0)?.toUpperCase() || "U"}
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-medium text-slate-800 truncate">
											{user.name || "User"}
										</p>
										<p className="text-sm text-slate-500 truncate">
											{user.email || user.phone}
										</p>
									</div>
								</div>
							</div>

							{/* Mobile Navigation */}
							<nav className="p-3 space-y-1">
								{navItems.map((item) => {
									const isActive = router.pathname === item.href;
									const Icon = item.icon;
									
									return (
										<Link
											key={item.href}
											href={item.href}
											className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
												isActive
													? "bg-blue-50 text-blue-600"
													: "text-slate-600 hover:bg-slate-50"
											}`}
										>
											<Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
											<span>{item.label}</span>
										</Link>
									);
								})}
							</nav>

							{/* Mobile Bottom Actions */}
							<div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-100 bg-white space-y-1">
								<Link
									href="/kyc"
									className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
								>
									<Shield className="w-5 h-5 text-slate-400" />
									<span>Verification</span>
								</Link>
								<button
									onClick={() => logout()}
									className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
								>
									<LogOut className="w-5 h-5" />
									<span>Logout</span>
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Mobile Bottom Nav */}
				<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-40 safe-area-pb">
					<div className="flex justify-around py-2">
						{navItems.slice(0, 4).map((item) => {
							const isActive = router.pathname === item.href;
							const Icon = item.icon;
							
							return (
								<Link
									key={item.href}
									href={item.href}
									className={`flex flex-col items-center px-3 py-1.5 ${
										isActive ? "text-blue-600" : "text-slate-400"
									}`}
								>
									<Icon className="w-5 h-5 mb-0.5" />
									<span className="text-[10px] font-medium">{item.label.split(" ")[0]}</span>
								</Link>
							);
						})}
					</div>
				</nav>

				{/* Main Content */}
				<main className="p-4 sm:p-6 pb-24 md:pb-6 min-h-[calc(100vh-4rem)]">
					{children}
				</main>
			</div>
		</div>
	);
}
