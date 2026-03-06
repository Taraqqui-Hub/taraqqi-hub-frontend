import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function UnauthorizedPage() {
	const { user, isAuthenticated } = useAuthStore();

	let primaryLinkHref = "/";
	let primaryLinkLabel = "Go to homepage";

	if (isAuthenticated && user?.userType === "employer") {
		primaryLinkHref = "/employer/dashboard";
		primaryLinkLabel = "Go to employer dashboard";
	} else if (isAuthenticated) {
		primaryLinkHref = "/dashboard";
		primaryLinkLabel = "Go to dashboard";
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4">
			<div className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-sm">
				<h1 className="text-2xl font-bold text-[#0F172A] mb-2">
					You don&apos;t have access to this page
				</h1>
				<p className="text-sm text-[#64748B] mb-6 leading-relaxed">
					This section is not available for your account type. If you think this is a mistake,
					please contact support, or go back to a page that is available to you.
				</p>
				<Link
					href={primaryLinkHref}
					className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1E40AF] transition-colors"
				>
					{primaryLinkLabel}
				</Link>
			</div>
		</div>
	);
}

