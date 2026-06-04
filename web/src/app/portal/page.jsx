//portal (profile)

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  CalendarCheck,
  Clock,
  Ban,
  TrendingUp,
  Activity,
  Stethoscope,
  UserRound,
  Sparkles,
} from "lucide-react";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SERVICE_ICONS = {
  "General Consultation": UserRound,
  "Dental Checkup": Sparkles,
  "Specialist Consultation": Stethoscope,
};

const STATUS_COLORS = {
  upcoming: "#3b82f6",
  past: "#10b981",
  cancelled: "#ef4444",
};

const SERVICE_COLORS = ["#8b5cf6", "#ec4899", "#f59e0b"];

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [saving, setSaving] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Load appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/api/appointments");
        setAppointments(res.data);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Compute stats and chart data
  const chartData = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((a) => a.status === "upcoming").length;
    const past = appointments.filter((a) => a.status === "past").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    const statusData = [
      { name: "Upcoming", value: upcoming, fill: STATUS_COLORS.upcoming },
      { name: "Completed", value: past, fill: STATUS_COLORS.past },
      { name: "Cancelled", value: cancelled, fill: STATUS_COLORS.cancelled },
    ].filter((item) => item.value > 0);
    
    const serviceCount = {};
    appointments.forEach((apt) => {
      serviceCount[apt.service] = (serviceCount[apt.service] || 0) + 1;
    });
    const serviceData = Object.entries(serviceCount).map(([name, value], idx) => ({
      name,
      value,
      color: SERVICE_COLORS[idx % SERVICE_COLORS.length],
    }));

    // Appointments over time (by month)
    const monthlyCount = {};
    appointments.forEach((apt) => {
      const date = new Date(apt.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyCount[key] = (monthlyCount[key] || 0) + 1;
    });
    const timeData = Object.entries(monthlyCount)
      .sort()
      .slice(-6) // last 6 months
      .map(([month, count]) => {
        const [year, m] = month.split("-");
        const monthName = new Date(year, m - 1).toLocaleString("default", { month: "short" });
        return { month: monthName, count };
      });

    // Last visit
    const pastAppointments = appointments
      .filter((a) => a.status === "past")
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastVisit = pastAppointments[0]?.date ?? null;

    return {
      total,
      upcoming,
      past,
      cancelled,
      lastVisit,
      statusData,
      serviceData,
      timeData,
    };
  }, [appointments]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required.");
    if (!form.phone.trim()) return toast.error("Phone is required.");

    setSaving(true);
    try {
      const res = await api.put(`/api/patients/${user._id}/profile`, form);
      login(token, { ...user, ...res.data });
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Activity className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="border-b border-border/60 pb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 sm:h-20 sm:w-20">
              <AvatarFallback className="bg-primary text-xl font-semibold text-primary-foreground sm:text-2xl">
                {getInitials(user?.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
                {user?.name}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Patient Account
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground sm:text-right">
            <div className="text-[10px] font-medium uppercase tracking-widest">Member since</div>
            <div className="mt-1 font-medium text-foreground">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })
                : "Recently"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={CalendarCheck}
          label="Total Visits"
          value={chartData.total}
          color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={chartData.upcoming}
          color="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={chartData.past}
          color="bg-green-500/10 text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={Ban}
          label="Cancelled"
          value={chartData.cancelled}
          color="bg-red-500/10 text-red-600 dark:text-red-400"
        />
      </div>

      {/* Charts section */}
      {chartData.total > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status breakdown pie chart */}
          {chartData.statusData.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Appointments by Status</h3>
              <p className="text-sm text-muted-foreground">
                Breakdown of your appointment history
              </p>
              <div className="mt-6" style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius="70%"
                      dataKey="value"
                      nameKey="name"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Service breakdown */}
          {chartData.serviceData.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold">Services Booked</h3>
              <p className="text-sm text-muted-foreground">
                Your most booked healthcare services
              </p>
              <div className="mt-6 space-y-4">
                {chartData.serviceData.map((service, idx) => {
                  const Icon = SERVICE_ICONS[service.name] || Stethoscope;
                  const percentage = (
                    (service.value / chartData.total) *
                    100
                  ).toFixed(0);
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{service.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {service.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: service.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Appointments over time */}
          {chartData.timeData.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold">Appointment History</h3>
              <p className="text-sm text-muted-foreground">
                Your appointments over the last 6 months
              </p>
              <div className="mt-6" style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer>
                  <BarChart data={chartData.timeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {chartData.total === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <CalendarCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No appointments yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Book your first appointment to see your healthcare insights here.
          </p>
          <Button asChild className="mt-6">
            <a href="/portal/book">Book appointment</a>
          </Button>
        </div>
      )}

      {/* Personal information form */}
      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-border bg-card p-6 md:p-8"
      >
        <h3 className="text-xl font-semibold sm:text-2xl">Personal Information</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your name, email, and contact details.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="John Doe"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              value={form.email}
              disabled
              className="cursor-not-allowed opacity-60"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Email cannot be changed.
            </p>
          </Field>

          <Field label="Phone number">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="0911234567"
            />
          </Field>

          {chartData.lastVisit && (
            <Field label="Last visit">
              <Input
                value={new Date(chartData.lastVisit).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                disabled
                className="cursor-not-allowed opacity-60"
              />
            </Field>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setForm({
                name: user?.name ?? "",
                email: user?.email ?? "",
                phone: user?.phone ?? "",
              })
            }
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className={`grid h-12 w-12 place-items-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold sm:text-3xl">{value}</div>
          <div className="text-xs text-muted-foreground sm:text-sm">{label}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
