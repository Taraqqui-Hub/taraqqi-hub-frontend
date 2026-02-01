/**
 * Profile Wizard Page
 * Gamified multi-step profile completion
 */

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileCompletionBar from "@/components/ProfileCompletionBar";
import api, { educationApi } from "@/lib/api";
import { useRouter } from "next/router";

// Wizard Steps
const STEPS = ["Personal Info", "Education", "Skills", "Experience"];

export default function ProfileWizard() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form Data State
    const [formData, setFormData] = useState({
        // Personal
        firstName: "",
        lastName: "",
        headline: "",
        summary: "",
        city: "",
        state: "",
        // Education (simplified for initial load, list for detailed)
        educationLevel: "", 
        university: "",
        graduationYear: "",
        educationRecords: [] as any[], // Added list
        // Skills
        skills: [] as string[],
        // Experience
        experienceYears: 0,
        expectedSalary: 0,
        isOpenToWork: true,
        resumeUrl: "",
        profilePhotoUrl: "",
    });

    const [skillInput, setSkillInput] = useState("");

    // Education Form State
    const [newEducation, setNewEducation] = useState({
        level: "",
        institution: "",
        boardOrUniversity: "",
        yearOfPassing: "" as any,
        gradeOrPercentage: "",
    });

    useEffect(() => {
        loadProfile();
        loadEducation();
    }, []);

    const loadProfile = async () => {
        try {
            const { data } = await api.get("/profile/jobseeker");
            if (data?.profile) {
                const p = data.profile;
                setFormData(prev => ({
                    ...prev,
                    firstName: p.firstName || "",
                    lastName: p.lastName || "",
                    headline: p.headline || "",
                    summary: p.summary || "",
                    city: p.city || "",
                    state: p.state || "",
                    // educationLevel: p.educationLevel || "", 
                    // university: p.university || "",
                    // graduationYear: p.graduationYear || "",
                    skills: p.skills || [],
                    experienceYears: p.experienceYears || 0,
                    expectedSalary: p.expectedSalary || 0,
                    isOpenToWork: p.isOpenToWork ?? true,
                    resumeUrl: p.resumeUrl || "",
                    profilePhotoUrl: p.profilePhotoUrl || "",
                }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadEducation = async () => {
        try {
            const res = await educationApi.list();
            setFormData(prev => ({ ...prev, educationRecords: res.records || [] }));
        } catch (error) {
            console.error("Failed to load education", error);
        }
    };

    const handleAddEducation = async () => {
        try {
            await educationApi.create({
                ...newEducation,
                yearOfPassing: Number(newEducation.yearOfPassing),
            });
            setNewEducation({
                level: "",
                institution: "",
                boardOrUniversity: "",
                yearOfPassing: "",
                gradeOrPercentage: "",
            });
            loadEducation();
        } catch (error) {
            alert("Failed to add education record");
            console.error(error);
        }
    };

    const handleNext = async () => {
        // validate current step
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            // Final submit
            await saveProfile(true);
        }
    };

    const saveProfile = async (isFinal = false) => {
        setSaving(true);
        try {
            await api.patch("/profile/jobseeker", formData);
            if (isFinal) {
                router.push("/dashboard");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const calculateCompletion = () => {
        let filled = 0;
        const totalFields = 10; // rough count
        if (formData.firstName) filled++;
        if (formData.lastName) filled++;
        if (formData.headline) filled++;
        if (formData.city) filled++;
        if (formData.skills.length > 0) filled++;
        if (formData.educationLevel) filled++;
        // ... more logic
        return Math.min(100, Math.round((currentStep / STEPS.length) * 100)); // Temporary logic based on steps
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Personal
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">First Name *</label>
                                <input 
                                    value={formData.firstName} 
                                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Last Name *</label>
                                <input 
                                    value={formData.lastName} 
                                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Headline</label>
                            <input 
                                value={formData.headline} 
                                onChange={e => setFormData({...formData, headline: e.target.value})}
                                className="w-full border rounded p-2" 
                                placeholder="e.g. Software Engineer"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Summary</label>
                            <textarea 
                                value={formData.summary} 
                                onChange={e => setFormData({...formData, summary: e.target.value})}
                                className="w-full border rounded p-2" 
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input 
                                    value={formData.city} 
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <input 
                                    value={formData.state} 
                                    onChange={e => setFormData({...formData, state: e.target.value})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                        </div>
                    </div>
                );
            case 1: // Education
                return (
                    <div className="space-y-6">
                        {/* List existing education */}
                        {formData.educationRecords && formData.educationRecords.length > 0 && (
                            <div className="space-y-3">
                                {formData.educationRecords.map((edu: any) => (
                                    <div key={edu.id} className="p-3 bg-gray-50 rounded border flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{edu.institution}</p>
                                            <p className="text-sm text-gray-500">{edu.level} • {edu.yearOfPassing}</p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if(confirm("Delete this record?")) {
                                                    try {
                                                        await educationApi.delete(edu.id);
                                                        // Refresh list
                                                        const res = await educationApi.list();
                                                        setFormData(prev => ({...prev, educationRecords: res.records}));
                                                    } catch(e) { console.error(e); }
                                                }
                                            }}
                                            className="text-red-500 text-sm hover:underline"
                                        >Delete</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new form */}
                        <div className="bg-white border rounded-lg p-4">
                            <h3 className="font-semibold mb-3">Add Education</h3>
                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Level</label>
                                    <select 
                                        value={newEducation.level} 
                                        onChange={e => setNewEducation({...newEducation, level: e.target.value})}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="">Select Level</option>
                                        <option value="10th">10th</option>
                                        <option value="12th">12th</option>
                                        <option value="ug">Graduation</option>
                                        <option value="pg">Post Graduation</option>
                                        <option value="diploma">Diploma</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Institution / School / University</label>
                                    <input 
                                        value={newEducation.institution} 
                                        onChange={e => setNewEducation({...newEducation, institution: e.target.value})}
                                        className="w-full border rounded p-2" 
                                        placeholder="e.g. Delhi University"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium mb-1">Passing Year</label>
                                        <input 
                                            type="number"
                                            value={newEducation.yearOfPassing} 
                                            onChange={e => setNewEducation({...newEducation, yearOfPassing: parseInt(e.target.value) || ""})}
                                            className="w-full border rounded p-2" 
                                            placeholder="YYYY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Grade/Percentage (Optional)</label>
                                        <input 
                                            value={newEducation.gradeOrPercentage} 
                                            onChange={e => setNewEducation({...newEducation, gradeOrPercentage: e.target.value})}
                                            className="w-full border rounded p-2" 
                                            placeholder="e.g. 85%"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleAddEducation}
                                    disabled={!newEducation.level || !newEducation.institution || !newEducation.yearOfPassing}
                                    className="w-full py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
                                >
                                    Add Education Record
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 2: // Skills
                return (
                    <div className="space-y-4">
                        <label className="block text-sm font-medium mb-1">Skills</label>
                        <div className="flex gap-2">
                             <input 
                                value={skillInput} 
                                onChange={e => setSkillInput(e.target.value)}
                                className="flex-1 border rounded p-2" 
                                placeholder="Add a skill (e.g. Java)"
                                onKeyDown={e => {
                                    if(e.key === 'Enter') {
                                        e.preventDefault();
                                        if(skillInput.trim()) {
                                            setFormData(prev => ({...prev, skills: [...prev.skills, skillInput.trim()]}));
                                            setSkillInput("");
                                        }
                                    }
                                }}
                            />
                             <button 
                                type="button"
                                onClick={() => {
                                     if(skillInput.trim()) {
                                        setFormData(prev => ({...prev, skills: [...prev.skills, skillInput.trim()]}));
                                        setSkillInput("");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill, idx) => (
                                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center">
                                    {skill}
                                    <button 
                                        type="button"
                                        onClick={() => setFormData(prev => ({...prev, skills: prev.skills.filter((_, i) => i !== idx)}))}
                                        className="ml-2 text-blue-500 hover:text-blue-900"
                                    >×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                );
            case 3: // Experience
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Years of Experience</label>
                                <input 
                                    type="number"
                                    value={formData.experienceYears} 
                                    onChange={e => setFormData({...formData, experienceYears: parseFloat(e.target.value) || 0})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expected Salary (LPA)</label>
                                <input 
                                    type="number"
                                    value={formData.expectedSalary} 
                                    onChange={e => setFormData({...formData, expectedSalary: parseFloat(e.target.value) || 0})}
                                    className="w-full border rounded p-2" 
                                />
                            </div>
                        </div>
                         <div className="flex items-center gap-2 mt-4">
                             <input 
                                type="checkbox"
                                checked={formData.isOpenToWork} 
                                onChange={e => setFormData({...formData, isOpenToWork: e.target.checked})}
                                className="w-4 h-4 text-blue-600"
                            />
                            <label className="text-sm">I am open to new opportunities</label>
                        </div>
                    </div>
                );
        }
    };

    return (
        <ProtectedRoute allowedUserTypes={["jobseeker", "individual"]}>
            <DashboardLayout>
                <div className="max-w-3xl mx-auto pb-10">
                    <ProfileCompletionBar percentage={calculateCompletion()} />
                    
                    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800">
                                Step {currentStep + 1}: {STEPS[currentStep]}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {currentStep + 1} of {STEPS.length}
                            </span>
                        </div>
                        
                        <div className="p-6">
                            {loading ? (
                                <div className="text-center py-10">Loading...</div>
                            ) : (
                                renderStepContent()
                            )}
                        </div>
                        
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                                disabled={currentStep === 0}
                                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium disabled:opacity-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                {currentStep === STEPS.length - 1 ? (saving ? "Finishing..." : "Finish Profile") : "Next & Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
