"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute role="admin">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}