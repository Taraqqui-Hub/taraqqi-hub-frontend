/**
 * Contact Details Page (Screen 4A)
 * Collects Phone and WhatsApp. Phone verification is skipped for now but planned.
 */

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ContactDetailsPage() {
	const router = useRouter();
	const { user, updateProfile, isLoading, error } = useAuthStore();
	
	const [phone, setPhone] = useState("");
	const [whatsapp, setWhatsapp] = useState("");
	const [sameAsMobile, setSameAsMobile] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<{ phone?: string; whatsapp?: string }>({});

	// Initialize with existing data if available
	useEffect(() => {
		if (user) {
			if (user.phone) {
				setPhone(user.phone);
				if (user.phone === user.phone /* Determine logic if needed */) {
                    // Assuming no whatsapp field in user object yet? 
                    // API only updates name/phone. 
                    // User requested "WhatsApp number" in Screen 4A.
                    // But backend API updateMe only accepts name/phone.
                    // I might need to add whatsapp to backend or just ignore for now?
                    // User said "WhatsApp optional but recommended".
                    // I will collect it but if backend doesn't support it, I might lose it?
                    // Or maybe store it in `phone` as well if they are same?
                    // For now I'll focus on primary phone.
                }
			}
		}
	}, [user]);

	const phoneRegex = /^\+[1-9]\d{10,14}$/;

	const validatePhone = (val: string, field: "phone" | "whatsapp") => {
		if (field === "phone" && !val) return "Phone number is required";
		if (val && !phoneRegex.test(val)) return "Format: +[CountryCode][Number]";
		return undefined;
	};

	const handleSameAsMobileChange = (checked: boolean) => {
		setSameAsMobile(checked);
		if (checked) {
			setWhatsapp(phone);
		}
	};

    // Update whatsapp if same as mobile
    useEffect(() => {
        if (sameAsMobile) {
            setWhatsapp(phone);
        }
    }, [phone, sameAsMobile]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		
		const phoneErr = validatePhone(phone, "phone");
		const waErr = validatePhone(whatsapp, "whatsapp");

		if (phoneErr || waErr) {
			setFieldErrors({ phone: phoneErr, whatsapp: waErr });
			return;
		}

		try {
			// Save both phone and WhatsApp number
			await updateProfile({ 
				phone,
				...(whatsapp && { whatsappNumber: whatsapp })
			});
			// Navigate to intent selection
			router.push("/onboarding/intent");
		} catch (err) {
			// Error handled in store/UI
		}
	};

	return (
		<ProtectedRoute allowedUserTypes={["individual", "employer"]}>
			<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-8">
				<div className="w-full max-w-md">
					{/* Progress Indicator? */}
                    <div className="mb-6">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-1/3"></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-right">Step 1 of 3</p>
                    </div>

					<div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm border border-[#E2E8F0]">
						<h2 className="text-xl font-bold text-[#0F172A] mb-2">Contact Details</h2>
						<p className="text-[#475569] text-sm mb-6">
							We need your contact information to connect you with opportunities.
						</p>

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 text-sm">
								{error}
							</div>
						)}

						<form onSubmit={handleSubmit}>
							<div className="mb-4">
								<label htmlFor="phone" className="block text-sm font-medium text-[#0F172A] mb-2">
									Mobile Number <span className="text-red-500">*</span>
								</label>
								<input
									type="tel"
									id="phone"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
									placeholder="+919926488445"
									className={`w-full px-4 py-3 bg-white border rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base ${
										fieldErrors.phone ? "border-red-500" : "border-[#E2E8F0]"
									}`}
								/>
                                {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
                                <p className="text-xs text-[#64748B] mt-1">Format: +[CountryCode][Number]</p>
							</div>

							<div className="mb-6">
								<div className="flex items-center justify-between mb-2">
									<label htmlFor="whatsapp" className="block text-sm font-medium text-[#0F172A]">
										WhatsApp Number
									</label>
									<label className="flex items-center text-xs text-[#64748B] cursor-pointer">
										<input
											type="checkbox"
											checked={sameAsMobile}
											onChange={(e) => handleSameAsMobileChange(e.target.checked)}
											className="mr-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
										/>
										Same as mobile
									</label>
								</div>
								<input
									type="tel"
									id="whatsapp"
									value={whatsapp}
									onChange={(e) => {
                                        setWhatsapp(e.target.value);
                                        setSameAsMobile(false);
                                    }}
									placeholder="+919926488445"
									className={`w-full px-4 py-3 bg-white border rounded-md text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition text-base ${
										fieldErrors.whatsapp ? "border-red-500" : "border-[#E2E8F0]"
									}`}
								/>
                                {fieldErrors.whatsapp && <p className="text-xs text-red-600 mt-1">{fieldErrors.whatsapp}</p>}
							</div>

							<button
								type="submit"
								disabled={isLoading || !phone}
								className="w-full py-3 px-4 bg-[#2563EB] hover:bg-[#1E40AF] text-white font-semibold rounded-md shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
							>
								{isLoading ? "Saving..." : "Continue"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
