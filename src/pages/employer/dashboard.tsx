import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import api from "@/lib/api";
import {
    Users,
    Briefcase,
    PlusCircle,
    MessageSquare,
} from "lucide-react";

export default function EmployerDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState({
        activeJobs: 0,
        totalApplications: 0,
        recentJobs: [] as { id: string; title: string; applicationsCount: number; status: string }[],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [jobsRes, regRes] = await Promise.all([
                    api.get("/employer/jobs").catch(() => ({ data: { payload: { jobs: [] }, jobs: [] } })),
                    api.get("/registration/status").catch(() => null),
                ]);
                const jobs = jobsRes.data?.payload?.jobs ?? jobsRes.data?.jobs ?? [];
                const active = jobs.filter((j: any) => j.status === "active");
                const totalApplications = (jobs as any[]).reduce((s, j) => s + (j.applicationsCount || 0), 0);
                setStats({
                    activeJobs: active.length,
                    totalApplications,
                    recentJobs: jobs.slice(0, 5).map((j: any) => ({
                        id: String(j.id),
                        title: j.title,
                        applicationsCount: j.applicationsCount || 0,
                        status: j.status,
                    })),
                });
            } catch (_) {}
            finally {
                setLoading(false);
            }
        })();
    }, []);

    return (
        <ProtectedRoute allowedUserTypes={["employer"]}>
            <DashboardLayout>
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Welcome Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Hello, {user?.name}! 👋
                            </h1>
                            <p className="text-gray-500 mt-1">
                                Here's what's happening with your hiring pipeline.
                            </p>
                        </div>
                        <Link 
                            href="/jobs/new"
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <PlusCircle size={20} />
                            Post New Job
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "…" : stats.activeJobs}</p>
                                </div>
                                <div className="p-4 rounded-full bg-blue-100">
                                    <Briefcase className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? "…" : stats.totalApplications}</p>
                                </div>
                                <div className="p-4 rounded-full bg-purple-100">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Post a job</p>
                                    <p className="text-lg font-bold text-gray-900 mt-2">Boost reach</p>
                                </div>
                                <Link href="/jobs/new" className="p-4 rounded-full bg-green-100 hover:bg-green-200 transition">
                                    <PlusCircle className="w-6 h-6 text-green-600" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Applicants */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-blue-600" />
                                    Recent Applicants
                                </h3>
                                <Link href="/jobs/manage" className="text-sm text-blue-600 font-medium hover:underline">
                                    My Jobs
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50 min-h-[120px]">
                                {loading ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">Loading…</div>
                                ) : stats.recentJobs.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">No jobs yet. Post your first job.</div>
                                ) : (
                                    stats.recentJobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/jobs/${job.id}/applicants`}
                                            className="p-4 hover:bg-gray-50 transition flex justify-between items-center block"
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900">{job.title}</p>
                                                <p className="text-xs text-gray-500">{job.applicationsCount} applicants</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${job.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                {job.status}
                                            </span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Recent Jobs */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={20} className="text-purple-600" />
                                    My Jobs
                                </h3>
                                <Link href="/jobs/manage" className="text-sm text-blue-600 font-medium hover:underline">
                                    Manage
                                </Link>
                            </div>
                            <div className="p-4 space-y-4">
                                {loading ? (
                                    <p className="text-sm text-gray-500">Loading…</p>
                                ) : stats.recentJobs.length === 0 ? (
                                    <p className="text-sm text-gray-500">No jobs yet.</p>
                                ) : (
                                    stats.recentJobs.map((job) => (
                                        <Link
                                            key={job.id}
                                            href={`/jobs/${job.id}/applicants`}
                                            className="block p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <p className="font-medium text-gray-900">{job.title}</p>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${job.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <div className="mt-2 text-xs text-gray-500">
                                                {job.applicationsCount} applicants
                                            </div>
                                        </Link>
                                    ))
                                )}
                                <Link href="/jobs/new" className="block text-center text-sm text-blue-600 font-medium mt-4 hover:underline">
                                    Post New Job
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
