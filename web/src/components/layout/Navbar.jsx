"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const profileHref = user?.role === "admin" ? "/admin" : "/portal";

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
      scrolled
        ? "border-border/60 bg-background/90 backdrop-blur-md"
        : "border-border/20 bg-transparent"
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold italic tracking-tight">
          MyClinic
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#services" className="transition-colors hover:text-foreground">Services</a>
          <a href="#why"      className="transition-colors hover:text-foreground">Why us</a>
          <a href="#how"      className="transition-colors hover:text-foreground">How it works</a>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link href={profileHref} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors hover:bg-accent">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {initials}
              </span>
              <span className="font-medium">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="rounded-md border border-border p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border/60 bg-background px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            <a href="#services" onClick={() => setOpen(false)} className="hover:text-foreground">Services</a>
            <a href="#why"      onClick={() => setOpen(false)} className="hover:text-foreground">Why us</a>
            <a href="#how"      onClick={() => setOpen(false)} className="hover:text-foreground">How it works</a>
            <div className="pt-2">
              {user ? (
                <Link
                  href={profileHref}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                    {initials}
                  </span>
                  <span className="font-medium">{user.name.split(" ")[0]}</span>
                </Link>
              ) : (
                <Button asChild size="sm" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}