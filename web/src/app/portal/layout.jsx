"use client";

import ProtectedRoute from "@/components/ui/ProtectedRoute";
import PortalSidebar from "@/components/layout/PortalSidebar";

export default function PortalLayout({ children }) {
  return (
    <ProtectedRoute role="patient">
      <div className="flex min-h-screen">
        <PortalSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}