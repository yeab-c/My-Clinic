"use client";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, CalendarCheck, Users, Percent, TrendingUp } from "lucide-react";
import api from "@/lib/api";

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

export default function AdminOverview() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
          api.get("/api/appointments"),
          api.get("/api/patients"),
          api.get("/api/doctors"),
        ]);
        
        setAppointments(appointmentsRes.data);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate analytics
  const analytics = useMemo(() => {
    const upcoming = appointments.filter((a) => a.status === "upcoming").length;
    const completed = appointments.filter((a) => a.status === "past").length;
    const cancelled = appointments.filter((a) => a.status === "cancelled").length;

    // Service popularity
    const serviceCounts = {};
    appointments.forEach((apt) => {
      serviceCounts[apt.service] = (serviceCounts[apt.service] || 0) + 1;
    });
    const servicePopularity = Object.entries(serviceCounts).map(([name, value], idx) => ({
      name,
      value,
      fill: COLORS[idx % COLORS.length],
    }));

    // Doctor workload
    const doctorWorkload = doctors.map((doc) => ({
      name: doc.name.split(" ")[0], // First name only
      visits: appointments.filter((apt) => apt.doctorId?._id === doc._id).length,
    }));

    // Appointments per day (last 7 days)
    const perDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = appointments.filter((apt) => apt.date === dateStr).length;
      perDay.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        appts: count,
      });
    }

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}-${month}`;
      
      const count = appointments.filter((apt) => apt.date.startsWith(monthKey)).length;
      monthlyTrend.push({
        month: date.toLocaleDateString("en-US", { month: "short" }),
        bookings: count,
      });
    }

    // Calculate utilization (appointments / total available slots in last 30 days)
    const totalSlots = doctors.length * 30 * 8; // 8 slots per day per doctor for 30 days
    const last30Days = appointments.filter((apt) => {
      const aptDate = new Date(apt.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return aptDate >= thirtyDaysAgo;
    }).length;
    const utilization = totalSlots > 0 ? Math.round((last30Days / totalSlots) * 100) : 0;

    return {
      upcoming,
      completed,
      cancelled,
      utilization,
      servicePopularity,
      doctorWorkload,
      perDay,
      monthlyTrend,
    };
  }, [appointments, doctors]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Activity className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Overview
        </div>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Operations dashboard.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Live snapshot of the clinic.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi
          label="Total patients"
          value={patients.length}
          icon={Users}
          color="bg-blue-500/10 text-blue-600"
        />
        <Kpi
          label="Total appointments"
          value={appointments.length}
          icon={CalendarCheck}
          color="bg-purple-500/10 text-purple-600"
        />
        <Kpi
          label="Upcoming"
          value={analytics.upcoming}
          icon={TrendingUp}
          color="bg-green-500/10 text-green-600"
        />
        <Kpi
          label="Utilization"
          value={`${analytics.utilization}%`}
          icon={Percent}
          color="bg-orange-500/10 text-orange-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Appointments per day */}
        <Card title="Appointments per day" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={analytics.perDay}>
              <defs>
                <linearGradient id="colorAppts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="day" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="appts"
                stroke={COLORS[0]}
                strokeWidth={2}
                fill="url(#colorAppts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Service popularity */}
        <Card title="Service popularity">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={analytics.servicePopularity}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => value.split(" ")[0]} // Shorten names
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly trend */}
        <Card title="Monthly booking trend" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[0] }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </>
  );
}

function Kpi({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        <div className={`grid h-10 w-10 place-items-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold">{value}</div>
      </div>
    </div>
  );
}

function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-6 ${className}`}>
      <div className="mb-4 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}
