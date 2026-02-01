import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { 
    Users, 
    Briefcase,
    PlusCircle,
    MessageSquare,
    TrendingUp
} from "lucide-react";

export default function EmployerDashboard() {
    const { user } = useAuthStore();
    const [stats, setStats] = useState([
        { label: "Active Jobs", value: "3", icon: Briefcase, color: "bg-blue-500" },
        { label: "Total Applications", value: "142", icon: Users, color: "bg-purple-500" },
        { label: "Interviews", value: "8", icon: MessageSquare, color: "bg-green-500" },
    ]);

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
                            href="/employer/jobs/new"
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            <PlusCircle size={20} />
                            Post a Job
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`p-4 rounded-full ${stat.color} bg-opacity-10`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                <Link href="/employer/applications" className="text-sm text-blue-600 font-medium hover:underline">
                                    View All
                                </Link>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {[1, 2, 3, 4].map((_, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                                JD
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">John Doe</p>
                                                <p className="text-xs text-gray-500">Applied for Frontend Developer</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1 text-xs border rounded hover:bg-gray-50">Profile</button>
                                            <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100">Review</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Jobs */}
                         <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                             <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={20} className="text-purple-600" />
                                    Active Jobs
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                {["Frontend Developer", "Marketing Manager", "Sales Executive"].map((job, i) => (
                                    <div key={i} className="p-3 border border-gray-100 rounded-lg hover:border-blue-200 transition">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-gray-900">{job}</p>
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Active</span>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                            <span>Posted 3d ago</span>
                                            <span>12 Applicants</span>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/employer/jobs" className="block text-center text-sm text-blue-600 font-medium mt-4 hover:underline">
                                    Manage All Jobs
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
