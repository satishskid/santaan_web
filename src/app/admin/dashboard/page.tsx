
import { Suspense } from "react";
import CRM from "@/components/admin/CRM";

export const metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminDashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-500">Manage your patient relationships and seminars.</p>
                </div>
                <Suspense fallback={<div className="text-sm text-gray-500">Loading dashboard...</div>}>
                    <CRM />
                </Suspense>
            </div>
        </div>
    );
}
