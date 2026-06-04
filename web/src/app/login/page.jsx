"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, Stethoscope } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectPath = user.role === "admin" ? "/admin" : "/portal";
      router.push(redirectPath);
    }
  }, [user, router]);

  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup state
  const [signupData, setSignupData] = useState({
    name: "", email: "", password: "", phone: "",
  });
  const [signupErrors, setSignupErrors] = useState({});
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Login logic
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/.+@.+\..+/.test(loginData.email)) errs.email = "Enter a valid email.";
    if (loginData.password.length < 6)      errs.password = "Password must be at least 6 characters.";
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await api.post("/api/users/login", {
        email:    loginData.email,
        password: loginData.password,
      });
      const { token, ...user } = res.data;
      login(token, user);
      toast.success(`Welcome, ${user.name.split(" ")[0]}`);
      router.push(user.role === "admin" ? "/admin" : "/portal");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Signup logic
  const handleSignup = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!signupData.name.trim())             errs.name     = "Name is required.";
    if (!/.+@.+\..+/.test(signupData.email)) errs.email    = "Enter a valid email.";
    if (signupData.password.length < 6)      errs.password = "Password must be at least 6 characters.";
    if (!signupData.phone.trim())            errs.phone    = "Phone number is required.";
    setSignupErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const res = await api.post("/api/users/register", signupData);
      const { token, ...user } = res.data;
      login(token, user);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      router.push("/portal");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">

      {/* Left panel */}
      <div className="flex flex-col justify-between px-6 py-8 md:px-12 md:py-12">
        <Link href="/" className="inline-block">
          <span className="text-2xl font-semibold italic tracking-tight">
            MyClinic
          </span>
        </Link>

        <div className="mx-auto w-full max-w-sm py-12">
          <h1 className="text-4xl font-semibold md:text-5xl">
            {tab === "login" ? "Welcome back." : "Create account."}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tab === "login"
              ? "Sign in to manage your appointments and records."
              : "Join MyClinic and start booking appointments today."}
          </p>

          {/* Tabs */}
          <div className="mt-6 flex rounded-lg border p-1 gap-1">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setTab("signup")}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                tab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Login form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="abebe@email.com"
                  autoComplete="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  aria-invalid={!!loginErrors.email}
                />
                {loginErrors.email && (
                  <p className="text-xs text-destructive">{loginErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    aria-invalid={!!loginErrors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showLoginPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-xs text-destructive">{loginErrors.password}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                  : "Sign in"
                }
              </Button>
            </form>
          )}

          {/* Signup form */}
          {tab === "signup" && (
            <form onSubmit={handleSignup} className="mt-6 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Abebe Kebede"
                  autoComplete="name"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  aria-invalid={!!signupErrors.name}
                />
                {signupErrors.name && (
                  <p className="text-xs text-destructive">{signupErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="abebe@email.com"
                  autoComplete="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  aria-invalid={!!signupErrors.email}
                />
                {signupErrors.email && (
                  <p className="text-xs text-destructive">{signupErrors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    aria-invalid={!!signupErrors.password}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showSignupPassword
                      ? <EyeOff className="h-4 w-4" />
                      : <Eye className="h-4 w-4" />
                    }
                  </button>
                </div>
                {signupErrors.password && (
                  <p className="text-xs text-destructive">{signupErrors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="signup-phone">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="0911234567"
                  autoComplete="tel"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  aria-invalid={!!signupErrors.phone}
                />
                {signupErrors.phone && (
                  <p className="text-xs text-destructive">{signupErrors.phone}</p>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account…</>
                  : "Create account"
                }
              </Button>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} MyClinic Health
        </p>
      </div>

      {/* Right panel */}
      <aside className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.3), transparent 40%), radial-gradient(circle at 80% 80%, oklch(1 0 0 / 0.2), transparent 50%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-center p-12">
          <div>
            <Stethoscope className="h-8 w-8 opacity-80" />
            <p className="mt-6 max-w-md text-4xl font-semibold leading-tight">
              &ldquo;It is health that is the real wealth, and not pieces of gold and silver.&rdquo;
            </p>
            <p className="mt-4 text-sm opacity-80">- Mahatma Gandhi</p>
          </div>
        </div>
      </aside>

    </div>
  );
}