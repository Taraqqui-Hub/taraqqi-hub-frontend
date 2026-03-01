/**
 * Individual Dashboard
 * Modern, data-rich dashboard for job seekers
 * Shows application metrics, status overview, recent activity, and profile status
 */

import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
import Link from "next/link";
import {
    Briefcase,
    FileText,
    CheckCircle2,
    TrendingUp,
    Clock,
    Eye,
    Star,
    ChevronRight,
    ArrowUpRight,
    Bookmark,
    AlertCircle,
    User,
    Shield,
    Activity,
    BarChart2,
    Zap,
    MapPin,
    Calendar,
    Bell,
    RefreshCw,
    Target,
    Award,
    Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Application {
    id: string;
    uuid: string;
    status: string;
    appliedAt: string;
    viewedAt: string | null;
    statusChangedAt: string | null;
    job: {
        id: string;
        uuid: string;
        title: string;
        slug: string;
        city: string | null;
        jobType: string;
        salaryMin: string | null;
        salaryMax: string | null;
    };
}

interface DashboardStats {
    total: number;
    pending: number;
    reviewed: number;
    shortlisted: number;
    interview: number;
    offered: number;
    hired: number;
    rejected: number;
    withdrawn: number;
    viewedByEmployer: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    pending:     { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-500",    border: "border-blue-200" },
    reviewed:    { bg: "bg-violet-50",  text: "text-violet-700", dot: "bg-violet-500",  border: "border-violet-200" },
    shortlisted: { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500",   border: "border-amber-200" },
    interview:   { bg: "bg-indigo-50",  text: "text-indigo-700", dot: "bg-indigo-500",  border: "border-indigo-200" },
    offered:     { bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-500", border: "border-emerald-200" },
    hired:       { bg: "bg-green-50",   text: "text-green-700",  dot: "bg-green-500",   border: "border-green-200" },
    rejected:    { bg: "bg-red-50",     text: "text-red-700",    dot: "bg-red-500",     border: "border-red-200" },
    withdrawn:   { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400",   border: "border-slate-200" },
};

const statusLabels: Record<string, string> = {
    pending: "Applied",
    reviewed: "Viewed",
    shortlisted: "Shortlisted",
    interview: "Interview",
    offered: "Offer",
    hired: "Hired",
    rejected: "Not Selected",
    withdrawn: "Withdrawn",
};

function timeAgo(dateStr: string) {
    const now = Date.now();
    const diff = now - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return "Just now";
}

function compactNum(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
    return n.toString();
}

// Mini bar chart component (pure CSS)
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-0.5 h-10">
            {data.map((v, i) => (
                <div
                    key={i}
                    className={`flex-1 rounded-t transition-all duration-700 ${color}`}
                    style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? "3px" : "2px", opacity: 0.3 + 0.7 * (i / (data.length - 1)) }}
                />
            ))}
        </div>
    );
}

// Circular progress ring
function RingProgress({ value, size = 64, stroke = 5, color = "#6366f1" }: { value: number; size?: number; stroke?: number; color?: string }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
            />
        </svg>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
    const { t } = useTranslation();
    const { user, isVerified } = useAuthStore();
    const [applications, setApplications] = useState<Application[]>([]);
    const [savedCount, setSavedCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const profileCompletion = user?.profileCompletionPercentage ?? 0;
    const verified = isVerified();

    // Derived stats
    const stats: DashboardStats = {
        total: applications.length,
        pending: applications.filter(a => a.status === "pending").length,
        reviewed: applications.filter(a => a.status === "reviewed").length,
        shortlisted: applications.filter(a => a.status === "shortlisted").length,
        interview: applications.filter(a => a.status === "interview").length,
        offered: applications.filter(a => a.status === "offered").length,
        hired: applications.filter(a => a.status === "hired").length,
        rejected: applications.filter(a => a.status === "rejected").length,
        withdrawn: applications.filter(a => a.status === "withdrawn").length,
        viewedByEmployer: applications.filter(a => a.viewedAt !== null).length,
    };

    // Charts: applications by day (last 7 days)
    const last7DaysBars = (() => {
        const days: number[] = Array(7).fill(0);
        const now = new Date();
        applications.forEach(app => {
            const d = new Date(app.appliedAt);
            const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
            if (diff >= 0 && diff < 7) days[6 - diff]++;
        });
        return days;
    })();

    // Positive outcome rate
    const positiveStatuses = ["shortlisted", "interview", "offered", "hired"];
    const positiveCount = applications.filter(a => positiveStatuses.includes(a.status)).length;
    const successRate = stats.total > 0 ? Math.round((positiveCount / stats.total) * 100) : 0;

    // Recent applications (last 5)
    const recentApps = [...applications]
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5);

    // Active applications (not rejected/withdrawn)
    const activeApps = applications.filter(a => !["rejected", "withdrawn"].includes(a.status));

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [appsRes, savedRes] = await Promise.allSettled([
                api.get("/applications"),
                api.get("/saved-jobs"),
            ]);

            if (appsRes.status === "fulfilled") {
                const data = appsRes.value.data;
                const apps = data?.applications || data?.payload?.applications || [];
                setApplications(apps);
            }

            if (savedRes.status === "fulfilled") {
                const data = savedRes.value.data;
                const saved = Array.isArray(data) ? data : data?.payload ?? [];
                setSavedCount(saved.length);
            }
        } catch (err) {
            console.error("Dashboard load error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.id) loadData();
    }, [user?.id]);

    const greeting = (() => {
        const h = new Date().getHours();
        if (h < 12) return "Good morning";
        if (h < 17) return "Good afternoon";
        return "Good evening";
    })();

    return (
        <ProtectedRoute allowedUserTypes={["individual"]}>
            <DashboardLayout>
                <div className="max-w-7xl mx-auto space-y-6 pb-8">

                    {/* ── Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {greeting}, {user?.name?.split(" ")[0] || "there"} 👋
                            </h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Here&apos;s your job search overview
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => loadData(true)}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                                Refresh
                            </button>
                            <Link
                                href="/jobs"
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm shadow-indigo-200"
                            >
                                <Search className="w-4 h-4" />
                                Browse Jobs
                            </Link>
                        </div>
                    </div>

                    {/* ── Alerts ── */}
                    {!verified && (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-amber-800">KYC verification pending</p>
                                <p className="text-amber-700 mt-0.5">Complete your KYC to unlock job applications.</p>
                            </div>
                            <Link href="/kyc" className="px-3 py-1.5 bg-amber-500 text-white font-semibold rounded-lg text-xs hover:bg-amber-600 transition flex-shrink-0">
                                Verify Now
                            </Link>
                        </div>
                    )}

                    {verified && profileCompletion < 80 && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm">
                            <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-semibold text-blue-800">Strengthen your profile</p>
                                <p className="text-blue-700 mt-0.5">Your profile is {profileCompletion}% complete. Higher completion = more visibility to employers.</p>
                            </div>
                            <Link href="/profile" className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded-lg text-xs hover:bg-blue-700 transition flex-shrink-0">
                                Complete Profile
                            </Link>
                        </div>
                    )}

                    {/* ── Top Stats Row ── */}
                    {loading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Applications */}
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-white/20 rounded-xl">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-indigo-200 text-xs font-medium">Total</span>
                                </div>
                                <div className="text-4xl font-bold">{compactNum(stats.total)}</div>
                                <p className="text-indigo-200 text-sm mt-1">Applications</p>
                                <div className="mt-3">
                                    <MiniBarChart data={last7DaysBars} color="bg-white" />
                                </div>
                            </div>

                            {/* Active (not rejected/withdrawn) */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-green-100 rounded-xl">
                                        <Activity className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">Live</span>
                                </div>
                                <div className="text-4xl font-bold text-slate-900">{activeApps.length}</div>
                                <p className="text-slate-500 text-sm mt-1">Active</p>
                                <p className="text-xs text-slate-400 mt-3">in review by employers</p>
                            </div>

                            {/* Employer Views */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-violet-100 rounded-xl">
                                        <Eye className="w-5 h-5 text-violet-600" />
                                    </div>
                                    <span className="text-xs text-slate-400">of {stats.total}</span>
                                </div>
                                <div className="text-4xl font-bold text-slate-900">{stats.viewedByEmployer}</div>
                                <p className="text-slate-500 text-sm mt-1">Profile Views</p>
                                <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-violet-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.total > 0 ? (stats.viewedByEmployer / stats.total) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>

                            {/* Shortlist + Interview + Offers */}
                            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="p-2 bg-amber-100 rounded-xl">
                                        <Star className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <span className="text-xs text-slate-400">{successRate}% rate</span>
                                </div>
                                <div className="text-4xl font-bold text-slate-900">{positiveCount}</div>
                                <p className="text-slate-500 text-sm mt-1">Positive Replies</p>
                                <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
                                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                    Shortlisted · Interview · Offers
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Middle Row: Status Breakdown + Profile ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Application Status Breakdown */}
                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
                                <div className="flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-indigo-600" />
                                    <h2 className="font-bold text-slate-900">Application Status</h2>
                                </div>
                                <Link href="/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            {loading ? (
                                <div className="p-6 space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-8 bg-slate-50 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : stats.total === 0 ? (
                                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                                        <Briefcase className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="font-semibold text-slate-700 mb-1">No applications yet</p>
                                    <p className="text-sm text-slate-400 mb-5">Start applying to jobs and your stats will appear here.</p>
                                    <Link href="/jobs" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition">
                                        Browse Jobs
                                    </Link>
                                </div>
                            ) : (
                                <div className="p-6">
                                    {/* Stacked Progress Bar */}
                                    <div className="flex h-3 rounded-full overflow-hidden mb-6 gap-0.5">
                                        {Object.entries({
                                            pending: stats.pending,
                                            reviewed: stats.reviewed,
                                            shortlisted: stats.shortlisted,
                                            interview: stats.interview,
                                            offered: stats.offered,
                                            hired: stats.hired,
                                            rejected: stats.rejected,
                                            withdrawn: stats.withdrawn,
                                        }).map(([key, val]) => {
                                            const pct = stats.total > 0 ? (val / stats.total) * 100 : 0;
                                            if (!pct) return null;
                                            const dotMap: Record<string, string> = {
                                                pending: "bg-blue-400", reviewed: "bg-violet-400",
                                                shortlisted: "bg-amber-400", interview: "bg-indigo-500",
                                                offered: "bg-emerald-400", hired: "bg-green-500",
                                                rejected: "bg-red-400", withdrawn: "bg-slate-300",
                                            };
                                            return (
                                                <div
                                                    key={key}
                                                    className={`${dotMap[key]} transition-all duration-1000 rounded-sm`}
                                                    style={{ width: `${pct}%` }}
                                                    title={`${statusLabels[key]}: ${val}`}
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Status Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { key: "pending", label: "Applied", count: stats.pending },
                                            { key: "reviewed", label: "Viewed", count: stats.reviewed },
                                            { key: "shortlisted", label: "Shortlisted", count: stats.shortlisted },
                                            { key: "interview", label: "Interview", count: stats.interview },
                                            { key: "offered", label: "Offer Received", count: stats.offered },
                                            { key: "hired", label: "Hired", count: stats.hired },
                                            { key: "rejected", label: "Not Selected", count: stats.rejected },
                                            { key: "withdrawn", label: "Withdrawn", count: stats.withdrawn },
                                        ].map(item => {
                                            const cfg = statusColors[item.key];
                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={`/applications?status=${item.key}`}
                                                    className={`p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:opacity-80 transition group`}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                        <span className={`text-xs font-medium ${cfg.text}`}>{item.label}</span>
                                                    </div>
                                                    <div className={`text-2xl font-bold ${cfg.text}`}>{item.count}</div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile & Quick Stats */}
                        <div className="space-y-4">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                                <div className="flex flex-col items-center text-center">
                                    {/* Avatar */}
                                    <div className="relative mb-3">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
                                            {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        {verified && (
                                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-slate-900">{user?.name || "User"}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 mb-4">{user?.email || user?.phone}</p>

                                    {/* Ring Progress */}
                                    <div className="relative inline-flex items-center justify-center mb-2">
                                        <RingProgress value={profileCompletion} size={72} stroke={6} color={profileCompletion >= 80 ? "#22c55e" : "#6366f1"} />
                                        <div className="absolute text-center">
                                            <span className="text-sm font-bold text-slate-900">{profileCompletion}%</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4">Profile Complete</p>

                                    <Link
                                        href="/profile"
                                        className="w-full py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition"
                                    >
                                        Edit Profile
                                    </Link>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-50">
                                    <h3 className="font-bold text-slate-900 text-sm">Quick Links</h3>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {[
                                        { href: "/applications", icon: FileText, label: "My Applications", badge: stats.total > 0 ? String(stats.total) : null, color: "text-indigo-600", bg: "bg-indigo-50" },
                                        { href: "/saved-jobs", icon: Bookmark, label: "Saved Jobs", badge: savedCount > 0 ? String(savedCount) : null, color: "text-amber-600", bg: "bg-amber-50" },
                                        { href: "/jobs", icon: Briefcase, label: "Browse Jobs", badge: null, color: "text-green-600", bg: "bg-green-50" },
                                        { href: "/kyc", icon: Shield, label: "Verification", badge: !verified ? "!" : null, color: "text-violet-600", bg: "bg-violet-50" },
                                    ].map(item => {
                                        const Icon = item.icon;
                                        return (
                                            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition group">
                                                <div className={`p-1.5 ${item.bg} rounded-lg`}>
                                                    <Icon className={`w-4 h-4 ${item.color}`} />
                                                </div>
                                                <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">{item.label}</span>
                                                {item.badge && (
                                                    <span className="text-xs font-bold text-white bg-indigo-600 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                                        {item.badge}
                                                    </span>
                                                )}
                                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Recent Applications ── */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-600" />
                                <h2 className="font-bold text-slate-900">Recent Applications</h2>
                            </div>
                            {stats.total > 0 && (
                                <Link href="/applications" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                                    View all <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>

                        {loading ? (
                            <div className="divide-y divide-slate-50">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-slate-100 rounded w-2/3" />
                                            <div className="h-3 bg-slate-100 rounded w-1/3" />
                                        </div>
                                        <div className="w-20 h-6 bg-slate-100 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : recentApps.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                                    <FileText className="w-7 h-7 text-slate-300" />
                                </div>
                                <p className="font-semibold text-slate-700 mb-1">No applications yet</p>
                                <p className="text-sm text-slate-400 max-w-xs">When you apply to jobs, they&apos;ll appear here with their latest status.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {recentApps.map(app => {
                                    const cfg = statusColors[app.status] || statusColors.pending;
                                    return (
                                        <Link
                                            key={app.id}
                                            href={`/jobs/${app.job.uuid}`}
                                            className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition group"
                                        >
                                            {/* Company Icon */}
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-50 transition">
                                                <Briefcase className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate text-sm group-hover:text-indigo-700 transition-colors">
                                                    {app.job.title}
                                                </p>
                                                <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                                                    {app.job.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3 h-3" /> {app.job.city}
                                                        </span>
                                                    )}
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {timeAgo(app.appliedAt)}
                                                    </span>
                                                    {app.viewedAt && (
                                                        <span className="flex items-center gap-1 text-violet-500">
                                                            <Eye className="w-3 h-3" /> Viewed
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
                                                {statusLabels[app.status] || app.status}
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-400" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Bottom Row: 7-day chart + Success tips ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* 7-Day Activity */}
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900">7-Day Activity</h3>
                                </div>
                                <span className="text-xs text-slate-400">Applications sent</span>
                            </div>

                            {/* Bar Chart */}
                            <div className="flex items-end gap-2 h-24 mb-3">
                                {last7DaysBars.map((val, i) => {
                                    const maxVal = Math.max(...last7DaysBars, 1);
                                    const pct = (val / maxVal) * 100;
                                    const isToday = i === 6;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <div className="relative w-full flex-1 flex items-end">
                                                <div
                                                    className={`w-full rounded-t-lg transition-all duration-1000 ${isToday ? "bg-indigo-600" : "bg-indigo-200"}`}
                                                    style={{ height: pct > 0 ? `${Math.max(pct, 8)}%` : "4px" }}
                                                />
                                            </div>
                                            {val > 0 && (
                                                <span className={`text-xs font-bold ${isToday ? "text-indigo-700" : "text-slate-500"}`}>{val}</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Day Labels */}
                            <div className="flex gap-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"].map((d, i) => (
                                    <div key={d} className="flex-1 text-center text-[10px] text-slate-400 font-medium">{d}</div>
                                ))}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-sm">
                                <span className="text-slate-500">This week</span>
                                <span className="font-bold text-slate-900">
                                    {last7DaysBars.reduce((a, b) => a + b, 0)} applications
                                </span>
                            </div>
                        </div>

                        {/* Tips & Insights */}
                        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-5 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <h3 className="font-bold">Tips to Get Hired Faster</h3>
                            </div>

                            <div className="space-y-3">
                                {[
                                    {
                                        icon: User,
                                        tip: "Complete your profile",
                                        desc: profileCompletion >= 80
                                            ? `Great! Your profile is ${profileCompletion}% complete.`
                                            : `Reach 80% completion to apply to all jobs (currently ${profileCompletion}%).`,
                                        done: profileCompletion >= 80,
                                    },
                                    {
                                        icon: Shield,
                                        tip: "Get KYC verified",
                                        desc: verified
                                            ? "You're verified! Employers trust verified profiles."
                                            : "KYC-verified profiles get 3x more interview calls.",
                                        done: verified,
                                    },
                                    {
                                        icon: Award,
                                        tip: "Apply consistently",
                                        desc: "Apply to 3-5 relevant jobs per day for the best results.",
                                        done: stats.total >= 5,
                                    },
                                ].map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${item.done ? "bg-green-500/20" : "bg-white/10"}`}>
                                                <Icon className={`w-4 h-4 ${item.done ? "text-green-400" : "text-white/70"}`} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white">{item.tip}</p>
                                                    {item.done && (
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <p className={`text-xs mt-0.5 ${item.done ? "text-green-300" : "text-white/60"}`}>{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Link
                                href="/jobs"
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
                            >
                                Find Matching Jobs <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
