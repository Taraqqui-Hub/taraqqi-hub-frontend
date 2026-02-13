/**
 * Protected Route Component
 * Wraps pages that require authentication
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requiredPermission?: string;
	// Default: allow only jobseeker and employer (not admin)
	allowedUserTypes?: ("jobseeker" | "employer" | "admin" | "individual")[];
}

export default function ProtectedRoute({
	children,
	requiredPermission,
	allowedUserTypes = ["individual", "employer"], // Main app excludes admin
}: ProtectedRouteProps) {
	const router = useRouter();
	const { user, isAuthenticated, isLoading, checkAuth, hasPermission, getVerificationRedirect } =
		useAuthStore();



	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			// Ensure we don't redirect to an un-interpolated path (containing [brackets])
			// which would cause a runtime error on login redirect
			const currentPath = router.asPath;
			if (currentPath && !currentPath.includes("[") && !currentPath.includes("]")) {
				router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
			} else {
				router.replace("/login");
			}
		}
	}, [isLoading, isAuthenticated, router]);

	// Check permission
	useEffect(() => {
		if (!isLoading && isAuthenticated && requiredPermission) {
			if (!hasPermission(requiredPermission)) {
				router.replace("/unauthorized");
			}
		}
	}, [isLoading, isAuthenticated, requiredPermission, hasPermission, router]);

	// Check verification status
	useEffect(() => {
		if (!isLoading && isAuthenticated && user) {
			const redirect = getVerificationRedirect();
			if (redirect) {
				// Don't redirect if we're already on the target page or a sub-path of it (for profile)
				if (router.pathname !== redirect && !router.pathname.startsWith(redirect + "/")) {
					// Check for allowed exceptions manually if not covered by getVerificationRedirect logic
					// e.g. If status is rejected, allow access to /kyc for resubmission
					if (redirect === "/verification-rejected" && router.pathname === "/kyc") {
						return; 
					}
					router.replace(redirect);
				}
			}
		}
	}, [isLoading, isAuthenticated, user, router, getVerificationRedirect, checkAuth]);

	// Check user type
	useEffect(() => {
		if (
			!isLoading &&
			isAuthenticated &&
			user &&
			allowedUserTypes &&
			allowedUserTypes.length > 0
		) {
			if (!allowedUserTypes.includes(user.userType)) {
				// Prevent double redirect if verification check handles it
				if (!getVerificationRedirect()) {
					router.replace("/unauthorized");
				}
			}
		}
	}, [isLoading, isAuthenticated, user, allowedUserTypes, router, getVerificationRedirect]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	// Not authenticated
	if (!isAuthenticated) {
		console.log("Not authenticated");
		return null;
	}

	// Permission check failed
	if (requiredPermission && !hasPermission(requiredPermission)) {
		console.log("Permission check failed");
		return null;
	}

	// User type check failed
	if (
		allowedUserTypes &&
		allowedUserTypes.length > 0 &&
		user &&
		!allowedUserTypes.includes(user.userType)
	) {
		console.log("User type check failed");
		return null;
	}

	return <>{children}</>;
}

/**
 * Hook for role-based rendering
 */
export function useHasPermission(permission: string): boolean {
	const { hasPermission } = useAuthStore();
	return hasPermission(permission);
}

/**
 * Hook for user type check
 */
export function useIsUserType(
	...types: ("jobseeker" | "employer" | "admin" | "individual")[]
): boolean {
	const { user } = useAuthStore();
	if (!user) return false;
	return types.includes(user.userType);
}
