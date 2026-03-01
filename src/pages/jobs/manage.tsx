/**
 * Manage Jobs Page
 */

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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

type JobStatusFilter = "all" | "active" | "draft" | "paused" | "closed";

export default function ManageJobsPage() {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "pause" | "close" | "resume";
    job: Job;
  } | null>(null);
  const [working, setWorking] = useState(false);
  const [statusFilter, setStatusFilter] = useState<JobStatusFilter>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  // Load archived job ids from localStorage (per browser)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("employerArchivedJobIds");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setArchivedIds(parsed.map(String));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persistArchived = (next: string[]) => {
    setArchivedIds(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("employerArchivedJobIds", JSON.stringify(next));
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const response = await api.get("/employer/jobs");
      const data = response?.data;
      const jobList = Array.isArray(data?.payload) ? data.payload : (data?.payload?.jobs || data?.jobs || []);
      setJobs(jobList);
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setWorking(true);
    try {
      await api.patch(`/employer/jobs/${jobId}`, { status: newStatus });
      loadJobs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || t("manageJobs.failedToUpdateStatus"));
    } finally {
      setWorking(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async (jobId: string) => {
    setWorking(true);
    try {
      await api.delete(`/employer/jobs/${jobId}`);
      loadJobs();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      alert(error.response?.data?.error || t("manageJobs.failedToCloseJob"));
    } finally {
      setWorking(false);
      setConfirmAction(null);
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

  // Derived list: filter + archive + sort
  const visibleJobs = useMemo(() => {
    const statusPriority: Record<string, number> = {
      active: 0,
      draft: 1,
      closed: 2,
      expired: 2,
      paused: 3, // "held up" jobs at the bottom
    };

    const filtered = jobs.filter((job) => {
      const isArchived = archivedIds.includes(String(job.id));
      if (isArchived && !showArchived) return false;

      if (statusFilter === "all") return true;
      return job.status === statusFilter;
    });

    return filtered.sort((a, b) => {
      const aIsArchived = archivedIds.includes(String(a.id));
      const bIsArchived = archivedIds.includes(String(b.id));
      if (aIsArchived !== bIsArchived) {
        return aIsArchived ? 1 : -1; // archived always below non-archived
      }

      const aPr = statusPriority[a.status] ?? 99;
      const bPr = statusPriority[b.status] ?? 99;
      if (aPr !== bPr) return aPr - bPr;

      const aDate = new Date(a.publishedAt || a.createdAt).getTime();
      const bDate = new Date(b.publishedAt || b.createdAt).getTime();
      return bDate - aDate; // recent on top
    });
  }, [jobs, statusFilter, archivedIds, showArchived]);

  return (
    <ProtectedRoute allowedUserTypes={["employer"]}>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                {t("manageJobs.title")}
              </h1>
              <p className="text-slate-500 mt-1">{t("manageJobs.subtitle")}</p>
            </div>
            <Link
              href="/jobs/new"
              className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">{t("manageJobs.postNewJob")}</span>
            </Link>
          </div>

          {/* Filters */}
          {!loading && jobs.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">
                  {t("manageJobs.filterStatusLabel")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {(["all", "active", "draft", "paused", "closed"] as JobStatusFilter[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setStatusFilter(key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        statusFilter === key
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {t(`manageJobs.filterStatus.${key}`)}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="ml-auto px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {showArchived ? t("manageJobs.hideArchived") : t("manageJobs.showArchived")}
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100"></div>
                <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
            </div>
          ) : visibleJobs.length > 0 ? (
            <div className="space-y-4">
              {visibleJobs.map((job) => {
                const isArchived = archivedIds.includes(String(job.id));
                return (
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
                              ? `${t("manageJobs.published")} ${new Date(job.publishedAt).toLocaleDateString()}`
                              : `${t("manageJobs.created")} ${new Date(job.createdAt).toLocaleDateString()}`}
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
                        <span className="font-medium text-sm">{job.applicationsCount} {t("manageJobs.applicants")}</span>
                      </Link>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Eye className="w-4 h-4 text-indigo-500" />
                      <span className="font-medium text-slate-700">{job.viewsCount}</span>
                      <span className="text-slate-400">{t("manageJobs.views")}</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                      {job.status === "draft" && (
                        <button
                          onClick={() => handleStatusChange(job.id, "active")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          {t("manageJobs.publish")}
                        </button>
                      )}
                      
                      {job.status === "active" && (
                        <button
                          onClick={() => setConfirmAction({ type: "pause", job })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          {t("manageJobs.pause")}
                        </button>
                      )}
                      
                      {job.status === "paused" && (
                        <button
                          onClick={() => setConfirmAction({ type: "resume", job })}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          {t("manageJobs.resume")}
                        </button>
                      )}
                      
                      <Link
                        href={`/jobs/${job.id}/edit`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        {t("manageJobs.edit")}
                      </Link>
                      
                      <button
                        onClick={() => setConfirmAction({ type: "close", job })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Power className="w-4 h-4" />
                        {t("manageJobs.close")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const idStr = String(job.id);
                          if (archivedIds.includes(idStr)) {
                            persistArchived(archivedIds.filter((x) => x !== idStr));
                          } else {
                            persistArchived([...archivedIds, idStr]);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors"
                      >
                        {isArchived ? t("manageJobs.unarchive") : t("manageJobs.archive")}
                      </button>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{t("manageJobs.noJobsPostedYet")}</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                {t("manageJobs.noJobsPostedDesc")}
              </p>
              <Link
                href="/jobs/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all font-medium"
              >
                <Plus className="w-5 h-5" />
                {t("manageJobs.postFirstJob")}
              </Link>
            </div>
          )}
          {confirmAction && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
              <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-slate-900">
                    {confirmAction.type === "pause"
                      ? t("manageJobs.pauseModalTitle")
                      : confirmAction.type === "close"
                      ? t("manageJobs.closeModalTitle")
                      : t("manageJobs.resumeModalTitle")}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {confirmAction.type === "pause"
                      ? t("manageJobs.pauseModalBody")
                      : confirmAction.type === "close"
                      ? t("manageJobs.closeModalBody")
                      : t("manageJobs.resumeModalBody")}
                  </p>
                  <p className="mt-3 text-sm font-medium text-slate-800">
                    {confirmAction.job.title}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => setConfirmAction(null)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                  >
                    {t("manageJobs.modalCancel")}
                  </button>
                  <button
                    type="button"
                    disabled={working}
                    onClick={() => {
                      if (!confirmAction) return;
                      if (confirmAction.type === "close") {
                        handleDelete(confirmAction.job.id);
                      } else if (confirmAction.type === "pause") {
                        handleStatusChange(confirmAction.job.id, "paused");
                      } else {
                        handleStatusChange(confirmAction.job.id, "active");
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${
                      confirmAction.type === "close"
                        ? "bg-rose-600 hover:bg-rose-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                  >
                    {confirmAction.type === "pause"
                      ? t("manageJobs.pauseModalConfirm")
                      : confirmAction.type === "close"
                      ? t("manageJobs.closeModalConfirm")
                      : t("manageJobs.resumeModalConfirm")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
