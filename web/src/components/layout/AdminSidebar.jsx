"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Clock,
  Users,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/admin",              label: "Overview",     icon: LayoutDashboard },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar        },
  { href: "/admin/doctors",      label: "Doctors",      icon: Stethoscope     },
  { href: "/admin/availability", label: "Availability", icon: Clock           },
  { href: "/admin/patients",     label: "Patients",     icon: Users           },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background px-4 py-3 backdrop-blur-md lg:hidden">
        <span className="text-lg font-semibold italic tracking-tight">MyClinic</span>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className="rounded-md border border-border p-2"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Sidebar - Desktop Sticky, Mobile Fixed Overlay */}
      <aside className={`
        ${open ? "translate-x-0" : "-translate-x-full"}
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground
        border-r border-border/60 transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:translate-x-0
      `}>
        <div className="flex h-full flex-col">
          {/* Logo - Desktop only */}
          <div className="hidden h-16 items-center border-b border-border/60 px-6 lg:flex">
            <div>
              <span className="text-xl font-semibold italic tracking-tight">MyClinic</span>
              <p className="text-[10px] text-muted-foreground">Admin Portal</p>
            </div>
          </div>

          {/* Section label */}
          <div className="px-3 pb-2 pt-6 text-[10px] font-medium uppercase tracking-widest text-muted-foreground lg:pt-4">
            Administration
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-1 px-3">
            {links.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                  <span>{label}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User dropdown */}
          <div className="border-t border-border/60 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-md border border-border bg-card p-2 text-left transition-colors hover:bg-accent/40">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-xs font-medium text-primary-foreground">
                    {initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{user?.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">Administrator</span>
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile overlay backdrop */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" 
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}