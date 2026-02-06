/**
 * Manage Jobs Page
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import { 
  MapPin, 
  Clock, 
  Eye, 
  Users, 
  Plus, 
  Calendar, 
  Edit3, 
  Power, 
  Pause,
  Play,
  Briefcase
} from "lucide-react";

interface Job {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  city: string;
  jobType: string;
  status: string;
  viewsCount: number;
  applicationsCount: number;
  publishedAt: string | null;
  createdAt: string;
}

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get("/employer/jobs");
      setJobs(response?.data?.payload?.jobs || response?.data?.jobs || []);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await api.patch(`/employer/jobs/${jobId}`, { status: newStatus });
      loadJobs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to close this job?")) return;

    try {
      await api.delete(`/employer/jobs/${jobId}`);
      loadJobs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || "Failed to close job");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "draft":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "paused":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
  };

  return (
    <ProtectedRoute allowedUserTypes={["employer"]}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                My Jobs
              </h1>
              <p className="text-slate-500 mt-1">Manage and track your job postings</p>
            </div>
            <Link
              href="/jobs/new"
              className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Post New Job</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ring-1 ring-slate-900/5"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-slate-900 truncate">
                          {job.title}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border uppercase tracking-wider ${getStatusColor(
                            job.status
                          )}`}
                        >
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm mb-4">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{job.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="capitalize">
                            {job.jobType?.replace("-", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            {job.publishedAt
                              ? `Published ${new Date(job.publishedAt).toLocaleDateString()}`
                              : `Created ${new Date(job.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Link
                        href={`/jobs/${job.id}/applicants`}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 border border-slate-200 transition-colors group/btn"
                      >
                        <Users className="w-4 h-4 text-slate-500 group-hover/btn:text-indigo-600 transition-colors" />
                        <span className="font-medium text-sm">{job.applicationsCount} Applicants</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-slate-700">{job.viewsCount}</span>
                      <span className="text-slate-400">views</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                      {job.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "active")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Publish
                        </button>
                      )}
                      
                      {job.status === "active" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "paused")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                      )}
                      
                      {job.status === "paused" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "active")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Resume
                        </button>
                      )}
                      
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Power className="w-4 h-4" />
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No jobs posted yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                Get started by posting your first job requirement and find the perfect candidate.
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
