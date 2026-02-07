/**
 * API Client
 * Axios instance with interceptors for auth handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true, // Send cookies with requests
	headers: {
		"Content-Type": "application/json",
	},
});

// Token storage (in-memory for security)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
	accessToken = token;
};

export const getAccessToken = () => accessToken;

// Request interceptor - add auth token
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// Response interceptor - handle token refresh and verification errors
api.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & {
			_retry?: boolean;
		};

		// If 401 and not already retried, try to refresh token
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;

			try {
				// Try to refresh token
				const response = await api.post("/auth/refresh");
				const newToken = response?.data?.payload?.accessToken;

				if (newToken) {
					setAccessToken(newToken);
					originalRequest.headers.Authorization = `Bearer ${newToken}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				// Refresh failed, redirect to login
				setAccessToken(null);
				if (typeof window !== "undefined") {
					window.location.href = "/login";
				}
			}
		}

		// Handle verification required responses
		if (error.response?.status === 403) {
			const data = error.response.data as any;
			if (data?.code === "VERIFICATION_REQUIRED" && data?.redirectTo) {
				if (typeof window !== "undefined") {
					window.location.href = data.redirectTo;
				}
			}
		}

		return Promise.reject(error);
	}
);

// ============================================
// Types
// ============================================

export type VerificationStatus =
	| "draft"
	| "payment_verified"
	| "submitted"
	| "under_review"
	| "verified"
	| "rejected"
	| "suspended";

export interface User {
	id: string;
	uuid: string;
	name: string | null;
	phone: string;
	whatsappNumber?: string;
	email: string | null;
	userType: "individual" | "employer" | "admin";
	verificationStatus: VerificationStatus;
	emailVerified: boolean;
	profileComplete?: boolean;
	profileCompletionPercentage?: number;
	hasPreferences?: boolean;
	permissions: string[];
}

export interface LoginParams {
	email: string;
	password: string;
}

export interface SignupParams {
	name: string;
	email: string;
	phone?: string;
	password: string;
	userType: "individual" | "employer";
}

export interface AuthResponse {
	accessToken: string;
	expiresIn: number;
	user: User;
}

// ============================================
// Auth API
// ============================================

export const authApi = {
	// Email/password login
	login: async (params: LoginParams): Promise<{ payload: AuthResponse }> => {
		const response = await api.post("/auth/login", params);
		const token = response.data.payload?.accessToken;
		if (token) {
			setAccessToken(token);
		}
		return response.data;
	},

	// Email/password signup
	signup: async (params: SignupParams): Promise<{ payload: { userId: string; email: string; message: string; user: User } }> => {
		const response = await api.post("/auth/signup", params);
		return response.data;
	},

	// Verify email
	verifyEmail: async (token: string): Promise<{ message: string }> => {
		const response = await api.get(`/auth/verify-email?token=${token}`);
		return response.data;
	},

	// Resend email verification
	resendVerification: async (email: string): Promise<{ message: string }> => {
		const response = await api.post("/auth/verify-email/resend", { email });
		return response.data;
	},

	// Get current user
	getMe: async () => {
		const response = await api.get("/auth/me");
		return response.data;
	},

	// Logout
	logout: async () => {
		const response = await api.delete("/auth/logout");
		setAccessToken(null);
		return response.data;
	},

	// Refresh token
	refresh: async () => {
		const response = await api.post("/auth/refresh");
		const newToken = response.data.payload?.accessToken;
		if (newToken) {
			setAccessToken(newToken);
		}
		return response.data;
	},

	// Request password reset
	forgotPassword: async (email: string): Promise<{ message: string }> => {
		const response = await api.post("/auth/forgot-password", { email });
		return response.data;
	},

	// Reset password with code
	resetPassword: async (code: string, newPassword: string): Promise<{ message: string }> => {
		const response = await api.post("/auth/reset-password", { code, newPassword });
		return response.data;
	},

	// Update profile
	updateProfile: async (data: { name?: string; phone?: string; whatsappNumber?: string }): Promise<{ message: string }> => {
		const response = await api.patch("/auth/me", data);
		return response.data;
	},
};

// ============================================
// Registration API
// ============================================

export const registrationApi = {
	// Get registration status
	getStatus: async () => {
		const response = await api.get("/registration/status");
		return response.data;
	},

	// Complete jobseeker profile
	completeJobseekerProfile: async (data: {
		firstName: string;
		lastName: string;
		gender: "male" | "female" | "other";
		dateOfBirth?: string;
		city?: string;
		bio?: string;
	}) => {
		const response = await api.post("/registration/jobseeker/profile", data);
		return response.data;
	},

	// Complete employer company
	completeEmployerCompany: async (data: {
		companyName: string;
		industry?: string;
		companySize?: string;
		website?: string;
		description?: string;
	}) => {
		const response = await api.post("/registration/employer/company", data);
		return response.data;
	},

	// Submit KYC
	submitKyc: async (userType: string, data: {
		documentType: string;
		documentNumber: string;
		documentUrl: string;
		documentBackUrl?: string;
		selfieUrl?: string;
	}) => {
		const response = await api.post(`/registration/${userType}/kyc`, data);
		return response.data;
	},
};

// ============================================
// Education API
// ============================================

export const educationApi = {
	list: async () => {
		const response = await api.get("/profile/jobseeker/education");
		return response.data;
	},
	create: async (data: any) => {
		const response = await api.post("/profile/jobseeker/education", data);
		return response.data;
	},
	delete: async (id: string) => {
		const response = await api.delete(`/profile/jobseeker/education/${id}`);
		return response.data;
	},
	markNoFormalEducation: async () => {
		const response = await api.post("/profile/jobseeker/education/no-formal");
		return response.data;
	},
};

// ============================================
// Preferences API
// ============================================

export interface UserPreferences {
	wantsJobNow?: boolean;
	openToFutureJobs?: boolean;
	wantsSkillPrograms?: boolean;
	wantsCommunityPrograms?: boolean;
}

export const preferencesApi = {
	get: async (): Promise<{ preferences: UserPreferences | null }> => {
		const response = await api.get("/preferences");
		return response.data;
	},
	save: async (data: UserPreferences): Promise<{ message: string }> => {
		const response = await api.post("/preferences", data);
		return response.data;
	},
};

// ============================================
// Profile Wizard API
// ============================================

export const profileWizardApi = {
	getStatus: async () => {
		const response = await api.get("/profile/wizard/status");
		return response.data;
	},
	updatePersonal: async (data: any) => {
		const response = await api.patch("/profile/wizard/personal", data);
		return response.data;
	},
	updateAddress: async (data: any) => {
		const response = await api.patch("/profile/wizard/address", data);
		return response.data;
	},
	updateSocioEconomic: async (data: any) => {
		const response = await api.patch("/profile/wizard/socio-economic", data);
		return response.data;
	},
	updateFamily: async (data: any) => {
		const response = await api.patch("/profile/wizard/family", data);
		return response.data;
	},
	updateCommunity: async (data: any) => {
		const response = await api.patch("/profile/wizard/community", data);
		return response.data;
	},
};

// ============================================
// Experience API
// ============================================

export const experienceApi = {
	list: async () => {
		const response = await api.get("/profile/jobseeker/experience");
		return response.data;
	},
	create: async (data: any) => {
		const response = await api.post("/profile/jobseeker/experience", data);
		return response.data;
	},
	update: async (id: string, data: any) => {
		const response = await api.patch(`/profile/jobseeker/experience/${id}`, data);
		return response.data;
	},
	delete: async (id: string) => {
		const response = await api.delete(`/profile/jobseeker/experience/${id}`);
		return response.data;
	},
};

// ============================================
// Skills API
// ============================================

export const skillsApi = {
	list: async () => {
		const response = await api.get("/profile/jobseeker/skills");
		return response.data;
	},
	create: async (data: any) => {
		const response = await api.post("/profile/jobseeker/skills", data);
		return response.data;
	},
	bulkCreate: async (skills: string[]) => {
		const response = await api.post("/profile/jobseeker/skills/bulk", { skills });
		return response.data;
	},
	update: async (id: string, data: any) => {
		const response = await api.patch(`/profile/jobseeker/skills/${id}`, data);
		return response.data;
	},
	delete: async (id: string) => {
		const response = await api.delete(`/profile/jobseeker/skills/${id}`);
		return response.data;
	},
};

// ============================================
// Interests API
// ============================================

export const interestsApi = {
	list: async () => {
		const response = await api.get("/profile/jobseeker/interests");
		return response.data;
	},
	create: async (data: any) => {
		const response = await api.post("/profile/jobseeker/interests", data);
		return response.data;
	},
	delete: async (id: string) => {
		const response = await api.delete(`/profile/jobseeker/interests/${id}`);
		return response.data;
	},
};

export default api;
