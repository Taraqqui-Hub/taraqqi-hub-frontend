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

			// Check auth status on app load
			checkAuth: async () => {
				// Prevent double invocation which causes race conditions with refresh tokens
				// Removing this check to ensure checkAuth runs on mount even if initial state is loading
				// if (state.isLoading) return;

				set({ isLoading: true });
				try {
					// Try to refresh token first
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
				}
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
					// Refresh user data
					await get().checkAuth();
					set({ isLoading: false });
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

				console.log("Check Redirect - User:", { 
					email: user.email, 
					status: user.verificationStatus, 
					emailVerified: user.emailVerified 
				});

				// 0. Verified users always have access (bypass other checks)
				if (user.verificationStatus === "verified") {
					return null;
				}
				
				// 1. Email not verified
				if (!user.emailVerified) {
					return "/verify-email";
				}
				
				// 1.5 Contact Details (Phone)
				// If strictly enforcing phone verification (user said phone verification is mandatory via OTP)
				// Check if phone exists and is verified? Or just exists?
				// User wants "Screen 4A". I'll route there if phone is missing.
				// Note: userType 'employer' might have different flow, but assuming consistency.
				if (!user.phone) {
					return "/onboarding/contact";
				}

				// 1.6 User Intent/Preferences (only for individuals)
				// If user has phone but hasn't set preferences, route to intent page
				if (user.userType === "individual" && user.hasPreferences === false) {
					return "/onboarding/intent";
				}

				// 2. Employer: pay registration fee first
				if (user.userType === "employer" && user.verificationStatus === "draft") {
					return "/employer/register/payment";
				}
				// 2b. Individual: profile then KYC
				if (user.userType === "individual" && user.verificationStatus === "draft") {
					return "/kyc";
				}
				// 2c. Employer payment_verified: company profile then KYC
				if (user.userType === "employer" && user.verificationStatus === "payment_verified") {
					if (!user.profileComplete) {
						return "/employer/register/company";
					}
					return "/kyc";
				}

				// 3. KYC submitted but not approved
				if (
					user.verificationStatus === "submitted" ||
					user.verificationStatus === "under_review"
				) {
					return "/verification-pending";
				}

				// 4. KYC rejected
				if (user.verificationStatus === "rejected") {
					return "/verification-rejected";
				}

				// 5. Suspended
				if (user.verificationStatus === "suspended") {
					return "/account-suspended";
				}

				// 6. All complete -> Allow access
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
