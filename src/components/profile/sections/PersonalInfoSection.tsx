/**
 * Personal Info Section
 * Name, DOB, gender, photo, languages
 */

import { useState, useEffect, useRef } from "react";
import { User, Calendar, Save, Loader2, Camera, X } from "lucide-react";
import MultiSelect from "../../common/MultiSelect";
import useCloudinaryUpload from "@/hooks/useCloudinaryUpload";

interface PersonalInfoData {
	fullName: string;
	dateOfBirth: string;
	gender: string;
	nationality: string;
	profilePhotoUrl: string;
	motherTongue: string;
	languagesKnown: string[];
}

interface PersonalInfoSectionProps {
	data: Partial<PersonalInfoData>;
	onChange: (data: Partial<PersonalInfoData>) => void;
	onSave: () => Promise<void>;
	onSaveSilent?: (data: Partial<PersonalInfoData>) => Promise<void>;
	saving?: boolean;
}

// Comprehensive list of Indian languages
// Includes all 22 Scheduled Languages + major regional languages
const INDIAN_LANGUAGES = [
	// 22 Scheduled Languages
	{ value: "hindi", label: "Hindi" },
	{ value: "english", label: "English" },
	{ value: "bengali", label: "Bengali (বাংলা)" },
	{ value: "telugu", label: "Telugu (తెలుగు)" },
	{ value: "marathi", label: "Marathi (मराठी)" },
	{ value: "tamil", label: "Tamil (தமிழ்)" },
	{ value: "urdu", label: "Urdu (اردو)" },
	{ value: "gujarati", label: "Gujarati (ગુજરાતી)" },
	{ value: "kannada", label: "Kannada (ಕನ್ನಡ)" },
	{ value: "malayalam", label: "Malayalam (മലയാളം)" },
	{ value: "odia", label: "Odia (ଓଡ଼ିଆ)" },
	{ value: "punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
	{ value: "assamese", label: "Assamese (অসমীয়া)" },
	{ value: "maithili", label: "Maithili (मैथिली)" },
	{ value: "santali", label: "Santali (ᱥᱟᱱᱛᱟᱲᱤ)" },
	{ value: "kashmiri", label: "Kashmiri (कॉशुर)" },
	{ value: "nepali", label: "Nepali (नेपाली)" },
	{ value: "sindhi", label: "Sindhi (سنڌي)" },
	{ value: "konkani", label: "Konkani (कोंकणी)" },
	{ value: "dogri", label: "Dogri (डोगरी)" },
	{ value: "manipuri", label: "Manipuri (মৈতৈলোন্)" },
	{ value: "bodo", label: "Bodo (बर')" },
	{ value: "sanskrit", label: "Sanskrit (संस्कृतम्)" },
	// Major Regional Languages
	{ value: "bhojpuri", label: "Bhojpuri (भोजपुरी)" },
	{ value: "rajasthani", label: "Rajasthani (राजस्थानी)" },
	{ value: "chhattisgarhi", label: "Chhattisgarhi (छत्तीसगढ़ी)" },
	{ value: "magahi", label: "Magahi (मगही)" },
	{ value: "marwari", label: "Marwari (मारवाड़ी)" },
	{ value: "haryanvi", label: "Haryanvi (हरियाणवी)" },
	{ value: "awadhi", label: "Awadhi (अवधी)" },
	{ value: "bundeli", label: "Bundeli (बुंदेली)" },
	{ value: "malvi", label: "Malvi (माळवी)" },
	{ value: "mewari", label: "Mewari (मेवाड़ी)" },
	{ value: "garhwali", label: "Garhwali (गढ़वाली)" },
	{ value: "kumaoni", label: "Kumaoni (कुमाऊँनी)" },
	{ value: "tulu", label: "Tulu (ತುಳು)" },
	{ value: "kodava", label: "Kodava (ಕೊಡವ)" },
	{ value: "khasi", label: "Khasi" },
	{ value: "mizo", label: "Mizo (Mizo ṭawng)" },
	{ value: "nagamese", label: "Nagamese" },
	{ value: "sikkimese", label: "Sikkimese (Bhutia)" },
	{ value: "lepcha", label: "Lepcha" },
	{ value: "angika", label: "Angika (अंगिका)" },
];

export default function PersonalInfoSection({ data, onChange, onSave, onSaveSilent, saving }: PersonalInfoSectionProps) {
	// Sync local state with prop data for languagesKnown
	const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
	const [isSavingPhoto, setIsSavingPhoto] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	
	// Cloudinary upload hook
	const { upload: uploadPhoto, uploading: uploadingPhoto, error: uploadError } = useCloudinaryUpload("profile_photo");

	// Initialize from data - sync all fields including profile photo
	useEffect(() => {
		if (data.languagesKnown && data.languagesKnown.length > 0) {
			setSelectedLanguages(data.languagesKnown);
		} else if (data.languagesKnown && data.languagesKnown.length === 0) {
			// Reset if explicitly empty array
			setSelectedLanguages([]);
		}
	}, [data.languagesKnown]);

	const handleLanguagesChange = (langs: string[]) => {
		setSelectedLanguages(langs);
		onChange({ ...data, languagesKnown: langs });
	};

	const handleMotherTongueChange = (selected: string[]) => {
		const motherTongue = selected[0] || "";
		onChange({ ...data, motherTongue });
	};

	const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith('image/')) {
			alert('Please select an image file');
			return;
		}

		// Validate file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			alert('Image must be smaller than 2MB');
			return;
		}

		try {
			// 1. Upload to Cloudinary
			const result = await uploadPhoto(file);
			const newUrl = result.url;
			
			// 2. Update local state
			const updatedData = { ...data, profilePhotoUrl: newUrl };
			onChange(updatedData);

			// 3. Auto-save to backend if handler provided
			if (onSaveSilent) {
				setIsSavingPhoto(true);
				await onSaveSilent(updatedData);
			}
		} catch (error) {
			console.error('Error uploading photo:', error);
			alert('Failed to upload photo. Please try again.');
		} finally {
			setIsSavingPhoto(false);
		}
	};

	const handleRemovePhoto = async () => {
		const updatedData = { ...data, profilePhotoUrl: '' };
		onChange(updatedData);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
		
		// Auto-save removal too
		if (onSaveSilent) {
			setIsSavingPhoto(true);
			try {
				await onSaveSilent(updatedData);
			} catch (error) {
				console.error('Error removing photo:', error);
			} finally {
				setIsSavingPhoto(false);
			}
		}
	};

	const isProcessingPhoto = uploadingPhoto || isSavingPhoto;

	return (
		<div className="space-y-4">
			{/* Profile Photo Upload */}
			<div className="flex items-center gap-4">
				<div className="relative">
					{data.profilePhotoUrl ? (
						<div className="relative">
							<img
								src={data.profilePhotoUrl}
								alt="Profile"
								className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
							/>
							{isProcessingPhoto ? (
								<div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center">
									<Loader2 size={20} className="text-blue-600 animate-spin" />
								</div>
							) : (
								<button
									type="button"
									onClick={handleRemovePhoto}
									className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all"
								>
									<X size={12} />
								</button>
							)}
						</div>
					) : (
						<label className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
							{isProcessingPhoto ? (
								<Loader2 size={20} className="text-gray-400 animate-spin" />
							) : (
								<Camera size={20} className="text-gray-400" />
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handlePhotoUpload}
								className="hidden"
							/>
						</label>
					)}
				</div>
				<div>
					<p className="text-sm font-medium text-gray-700">Profile Photo</p>
					<p className="text-xs text-gray-500">Optional • Max 5MB</p>
				</div>
			</div>

			{/* Full Name */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					Full Name <span className="text-red-500">*</span>
				</label>
				<div className="relative">
					<User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={data.fullName || ""}
						onChange={e => onChange({ ...data, fullName: e.target.value })}
						placeholder="Enter your full name"
						className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
					/>
				</div>
			</div>


			{/* DOB & Gender */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Date of Birth <span className="text-red-500">*</span>
					</label>
					<div className="relative">
						<Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="date"
							value={data.dateOfBirth || ""}
							onChange={e => onChange({ ...data, dateOfBirth: e.target.value })}
							className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm"
						/>
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Gender <span className="text-red-500">*</span>
					</label>
					<div className="flex gap-3">
						{[
							{ value: "male", label: "Male" },
							{ value: "female", label: "Female" },
							{ value: "other", label: "Other" }
						].map(g => (
							<button
								key={g.value}
								type="button"
								onClick={() => onChange({ ...data, gender: g.value })}
								className={`
									flex-1 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all
									${data.gender === g.value 
										? 'border-blue-500 bg-blue-50 text-blue-700' 
										: 'border-gray-200 text-gray-600 hover:border-gray-300'}
								`}
							>
								{g.label}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Mother Tongue */}
			<MultiSelect
				options={INDIAN_LANGUAGES}
				selected={data.motherTongue ? [data.motherTongue.toLowerCase()] : []}
				onChange={handleMotherTongueChange}
				label="Mother Tongue"
				placeholder="Select your mother tongue"
				searchPlaceholder="Search languages..."
				singleSelect={true}
			/>

			{/* Languages Known */}
			<MultiSelect
				options={INDIAN_LANGUAGES}
				selected={selectedLanguages}
				onChange={handleLanguagesChange}
				label="Languages You Know"
				placeholder="Select languages you can speak"
				searchPlaceholder="Search languages..."
				maxDisplayChips={4}
			/>

			{/* Continue Button */}
			<button
				onClick={onSave}
				disabled={saving || !data.fullName || !data.dateOfBirth || !data.gender}
				className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
			>
				{saving ? (
					<>
						<Loader2 size={18} className="animate-spin" />
						Saving...
					</>
				) : (
					"Continue → Next Step"
				)}
			</button>
		</div>
	);
}
