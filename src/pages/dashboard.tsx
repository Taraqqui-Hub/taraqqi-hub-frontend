import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { 
    User,
    Mail,
    Phone,
    Shield,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Briefcase,
    GraduationCap,
    Star,
    Clock,
    FileText,
    Lock,
    Eye,
    TrendingUp,
    Bell
} from "lucide-react";

// Profile sections with completion tracking
const PROFILE_SECTIONS = [
    { id: "personal", label: "Personal Info", icon: User, required: true },
    { id: "education", label: "Education", icon: GraduationCap, required: true },
    { id: "skills", label: "Skills", icon: Star, required: true },
    { id: "experience", label: "Experience", icon: Briefcase, required: true },
];

export default function Dashboard() {
    const { user, isVerified } = useAuthStore();
    const [profileData, setProfileData] = useState<any>(null);
    
    // Calculate profile completion based on user data
    const profileCompletion = user?.profileCompletionPercentage ?? 0;
    const isProfileComplete = profileCompletion >= 100;

    // Simulated section completion (in real app, fetch from API)
    const [sectionStatus, setSectionStatus] = useState({
        personal: false,
        education: false,
        skills: false,
        experience: false,
    });

    return (
        <ProtectedRoute allowedUserTypes={["individual"]}>
            <DashboardLayout>
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* Profile Completion Banner */}
                    {!isProfileComplete && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-amber-100 rounded-full">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Your profile is {profileCompletion}% complete. Complete all sections to unlock full platform access.
                                        </p>
                                    </div>
                                </div>
                                <Link 
                                    href="/profile"
                                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition shadow-sm"
                                >
                                    Complete Now
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                                        style={{ width: `${profileCompletion}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Profile Card */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                
                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-bold text-gray-900">{user?.name || "User"}</h2>
                                        {isVerified() && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                                        {user?.email && (
                                            <span className="flex items-center gap-1.5">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                {user.email}
                                            </span>
                                        )}
                                        {user?.phone && (
                                            <span className="flex items-center gap-1.5">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                {user.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Edit Profile Button */}
                                <Link
                                    href="/profile"
                                    className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition text-sm"
                                >
                                    Edit Profile
                                </Link>
                            </div>
                        </div>

                        {/* Profile Sections Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
                            {PROFILE_SECTIONS.map((section) => {
                                const isComplete = sectionStatus[section.id as keyof typeof sectionStatus];
                                const Icon = section.icon;
                                
                                return (
                                    <Link
                                        key={section.id}
                                        href={`/profile?step=${section.id}`}
                                        className="p-4 hover:bg-gray-50 transition group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                <Icon className={`w-5 h-5 ${isComplete ? 'text-green-600' : 'text-gray-500'}`} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                                    {section.label}
                                                </p>
                                                <p className={`text-xs ${isComplete ? 'text-green-600' : 'text-gray-400'}`}>
                                                    {isComplete ? 'Complete' : 'Incomplete'}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Actions & Activity Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Quick Actions */}
                        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link
                                    href="/jobs"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition group"
                                >
                                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Browse Jobs</p>
                                        <p className="text-sm text-gray-500">Find opportunities</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/applications"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition group"
                                >
                                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">My Applications</p>
                                        <p className="text-sm text-gray-500">Track your progress</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/profile"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition group"
                                >
                                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                                        <User className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Update Profile</p>
                                        <p className="text-sm text-gray-500">Keep info current</p>
                                    </div>
                                </Link>
                                
                                <Link
                                    href="/kyc"
                                    className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition group"
                                >
                                    <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition">
                                        <Shield className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Verification</p>
                                        <p className="text-sm text-gray-500">KYC status</p>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-5 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-purple-600" />
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {[
                                    { text: "Profile updated", time: "Just now" },
                                    { text: "KYC submitted", time: "1 hour ago" },
                                    { text: "Account created", time: "Today" },
                                ].map((activity, i) => (
                                    <div key={i} className="p-4 hover:bg-gray-50 transition flex gap-3 items-center">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-800">{activity.text}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Legal & Privacy Notice */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-slate-200 rounded-lg flex-shrink-0">
                                <Lock className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                    Your Data is Protected
                                    <Eye className="w-4 h-4 text-slate-400" />
                                </h4>
                                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                                    We collect your information to connect you with relevant opportunities and improve your experience. 
                                    Your personal data is encrypted, stored securely, and never shared without your consent. 
                                    You can manage your data preferences and request deletion anytime.
                                </p>
                                <div className="flex flex-wrap gap-3 mt-3">
                                    <Link href="/privacy" className="text-xs text-blue-600 hover:underline">
                                        Privacy Policy
                                    </Link>
                                    <Link href="/terms" className="text-xs text-blue-600 hover:underline">
                                        Terms of Service
                                    </Link>
                                    <Link href="/data-rights" className="text-xs text-blue-600 hover:underline">
                                        Your Data Rights
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
