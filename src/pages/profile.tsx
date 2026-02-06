/**
 * Profile Page
 * Gamified multi-step profile completion wizard
 */

import DashboardLayout from "@/components/DashboardLayout";
import ProfileWizard from "@/components/profile/ProfileWizard";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProfilePage() {
	return (
		<ProtectedRoute>
			<DashboardLayout>
				<div className="p-4 md:p-6 lg:p-8">
					<ProfileWizard />
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	);
}
