/**
 * Auth Store
 * Zustand store for authentication state management with verification status
 */

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authApi, setAccessToken, User, VerificationStatus } from "@/lib/api";

interface AuthState {
	// State
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;

	// Actions
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string, userType: "individual" | "employer") => Promise<void>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
	clearError: () => void;
	hasPermission: (permission: string) => boolean;

	setUser: (user: User | null) => void;
	updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;

	// Verification helpers
	isVerified: () => boolean;
	isPending: () => boolean;
	isRejected: () => boolean;
	needsEmailVerification: () => boolean;
	needsProfileCompletion: () => boolean;
	getVerificationRedirect: () => string | null;
}

// In-flight guard: prevent duplicate checkAuth API calls (e.g. from _app + login page or React Strict Mode)
let checkAuthPromise: Promise<void> | null = null;

// Redirect map based on verification status
const VERIFICATION_REDIRECTS: Record<VerificationStatus, string | null> = {
	draft: null, // Handled dynamically in getVerificationRedirect
	payment_verified: "/employer/register/company",
	submitted: "/verification-pending",
	under_review: "/verification-pending",
	verified: null,
	rejected: "/verification-rejected",
	suspended: "/account-suspended",
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			// Initial state
			user: null,
			isAuthenticated: false,
			isLoading: true,
			error: null,

			// Login with email/password
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });
				try {
					const response = await authApi.login({ email, password });
					const { user } = response.payload;

					set({
						user,
						isAuthenticated: true,
						isLoading: false,
					});
				} catch (error: any) {
					const message =
						error.response?.data?.error ||
						error.message ||
						"Login failed";
					set({ error: message, isLoading: false });
					throw error;
				}
			},

			// Signup with email/password
			signup: async (
				name: string,
				email: string,
				password: string,
				userType: "individual" | "employer"
			) => {
				set({ isLoading: true, error: null });
				try {
					const response = await authApi.signup({
						name,
						email,
						password,
						userType,
					});

					// User needs to verify email before logging in
					set({
						isLoading: false,
					});

					return;
				} catch (error: any) {
					const message =
						error.response?.data?.error ||
						error.message ||
						"Registration failed";
					set({ error: message, isLoading: false });
					throw error;
				}
			},

			// Logout
			logout: async () => {
				set({ isLoading: true });
				try {
					await authApi.logout();
				} catch {
					// Ignore errors on logout
				}
				setAccessToken(null);
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			// Check auth status on app load (deduplicated: concurrent calls share one request)
			checkAuth: async () => {
				if (checkAuthPromise) {
					return checkAuthPromise;
				}
				set({ isLoading: true });
				checkAuthPromise = (async () => {
					try {
						await authApi.refresh();
						const response = await authApi.getMe();
						const user = response.payload?.user;
						if (user) {
							set({
								user,
								isAuthenticated: true,
								isLoading: false,
							});
						} else {
							set({ isLoading: false });
						}
					} catch {
						set({
							user: null,
							isAuthenticated: false,
							isLoading: false,
						});
					} finally {
						checkAuthPromise = null;
					}
				})();
				return checkAuthPromise;
			},

			// Clear error
			clearError: () => set({ error: null }),

			// Check permission
			hasPermission: (permission: string) => {
				const { user } = get();
				return user?.permissions?.includes(permission) ?? false;
			},

			// Set user (for external updates)
			setUser: (user: User | null) => {
				set({ user, isAuthenticated: !!user });
			},

			// Update profile
			updateProfile: async (data) => {
				set({ isLoading: true, error: null });
				try {
					await authApi.updateProfile(data);
					// Update user in store from getMe (keep current session; avoid checkAuth/refresh which can redirect to login)
					const response = await authApi.getMe();
					const payload = response?.payload ?? response;
					const updatedUser = payload?.user;
					if (updatedUser) {
						set({
							user: {
								...updatedUser,
								permissions: payload?.permissions ?? updatedUser.permissions ?? [],
							},
							isLoading: false,
						});
					} else {
						set({ isLoading: false });
					}
				} catch (error: any) {
					const message =
						error.response?.data?.error ||
						error.message ||
						"Failed to update profile";
					set({ error: message, isLoading: false });
					throw error;
				}
			},

			// Verification status helpers
			isVerified: () => {
				const { user } = get();
				return user?.verificationStatus === "verified";
			},

			isPending: () => {
				const { user } = get();
				return (
					user?.verificationStatus === "submitted" ||
					user?.verificationStatus === "under_review"
				);
			},

			isRejected: () => {
				const { user } = get();
				return user?.verificationStatus === "rejected";
			},

			needsEmailVerification: () => {
				const { user } = get();
				return user?.emailVerified === false;
			},

			needsProfileCompletion: () => {
				const { user } = get();
				return user?.verificationStatus === "draft" && user?.profileComplete === false;
			},

			getVerificationRedirect: () => {
				const { user } = get();
				if (!user) return "/login";

				// 0. Verified users always have access (bypass other checks)
				if (user.verificationStatus === "verified") {
					return null;
				}
				
				// 1. Email not verified
				if (!user.emailVerified) {
					return "/verify-email";
				}

				// 2. KYC submitted/under_review – check BEFORE contact/intent so refresh on
				//    verification-pending always stays there (persisted user can be stale re phone/preferences)
				if (
					user.verificationStatus === "submitted" ||
					user.verificationStatus === "under_review"
				) {
					return "/verification-pending";
				}

				// 3. KYC rejected
				if (user.verificationStatus === "rejected") {
					return "/verification-rejected";
				}

				// 4. Suspended
				if (user.verificationStatus === "suspended") {
					return "/account-suspended";
				}
				
				// 5. Contact Details (Phone) – only for users not yet in verification pipeline
				if (!user.phone) {
					return "/onboarding/contact";
				}

				// 6. User Intent/Preferences (only for individuals)
				if (user.userType === "individual" && user.hasPreferences === false) {
					return "/onboarding/intent";
				}

				// 7. Employer: pay registration fee first
				if (user.userType === "employer" && user.verificationStatus === "draft") {
					return "/employer/register/payment";
				}
				// 8. Individual: profile then KYC
				if (user.userType === "individual" && user.verificationStatus === "draft") {
					return "/kyc";
				}
				// 9. Employer payment_verified: company profile then KYC
				if (user.userType === "employer" && user.verificationStatus === "payment_verified") {
					if (!user.profileComplete) {
						return "/employer/register/company";
					}
					return "/kyc";
				}

				// 10. All complete -> Allow access
				return null;
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				// Only persist user, not tokens
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
