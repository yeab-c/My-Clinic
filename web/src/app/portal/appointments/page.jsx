"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarDays, Search, X, Clock, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";

const services = {
  "General Consultation": { duration: 30, price: 500 },
  "Dental Checkup": { duration: 30, price: 800 },
  "Specialist Consultation": { duration: 30, price: 1200 },
};

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cancelingId, setCancelingId] = useState(null);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get("/api/appointments");
        const now = new Date();
        
        // Update appointments that have passed (client-side backup)
        const updatedAppointments = res.data.map((apt) => {
          // Only update if currently "upcoming"
          if (apt.status !== "upcoming") return apt;
          
          // Parse appointment date and time
          const [year, month, day] = apt.date.split("-").map(Number);
          const [hours, minutes] = apt.time.split(":").map(Number);
          const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
          
          // If appointment time has passed, mark as past
          if (appointmentDateTime < now) {
            return { ...apt, status: "past" };
          }
          
          return apt;
        });
        
        setAppointments(updatedAppointments);
      } catch (err) {
        console.error("Failed to fetch appointments", err);
        toast.error("Could not load appointments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
    
    // Check and update every 5 minutes
    const interval = setInterval(() => {
      const now = new Date();
      setAppointments((prev) =>
        prev.map((apt) => {
          if (apt.status !== "upcoming") return apt;
          
          const [year, month, day] = apt.date.split("-").map(Number);
          const [hours, minutes] = apt.time.split(":").map(Number);
          const appointmentDateTime = new Date(year, month - 1, day, hours, minutes);
          
          if (appointmentDateTime < now) {
            return { ...apt, status: "past" };
          }
          
          return apt;
        })
      );
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Filter appointments by status and search query
  const filterByStatus = (status) => {
    return appointments.filter((a) => {
      const matchesStatus = status === "all" || a.status === status;
      const matchesSearch = searchQuery
        ? (a.doctorId?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.service || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesStatus && matchesSearch;
    });
  };

  const handleCancel = async (appointmentId) => {
    setCancelingId(appointmentId);
    try {
      await api.patch(`/api/appointments/${appointmentId}/cancel`);
      
      // Update local state
      setAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: "cancelled" } : a
        )
      );
      
      toast.success("Appointment cancelled successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel appointment");
    } finally {
      setCancelingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Appointments
          </div>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            My appointments.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search, filter, or cancel any visit.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search appointments..."
            className="pl-9"
          />
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {["upcoming", "past", "cancelled", "all"].map((status) => (
          <TabsContent key={status} value={status} className="mt-6 space-y-3">
            {filterByStatus(status).length === 0 && <Empty />}
            {filterByStatus(status).map((appointment) => {
              const serviceInfo = services[appointment.service] || {};
              return (
                <AppointmentCard
                  key={appointment._id}
                  appointment={appointment}
                  serviceInfo={serviceInfo}
                  onCancel={handleCancel}
                  canceling={cancelingId === appointment._id}
                />
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

function AppointmentCard({ appointment, serviceInfo, onCancel, canceling }) {
  const statusColors = {
    upcoming: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    past: "bg-green-500/10 text-green-600 border-green-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md md:flex-row md:items-center md:justify-between">
      {/* Left section */}
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {appointment.service} with {appointment.doctorId?.name || "Doctor"}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(appointment.date), "EEEE, MMMM d, yyyy")}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {appointment.time}
            </span>
            <span>·</span>
            <span>{serviceInfo.duration || 30} min</span>
          </div>
          {appointment.reason && (
            <p className="mt-2 text-sm text-muted-foreground">
              Reason: {appointment.reason}
            </p>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span
          className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${
            statusColors[appointment.status] || "bg-muted text-muted-foreground"
          }`}
        >
          {appointment.status}
        </span>
        {appointment.status === "upcoming" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCancel(appointment._id)}
            disabled={canceling}
            className="text-destructive hover:text-destructive"
          >
            {canceling ? (
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-1 h-4 w-4" />
            )}
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
      <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <h3 className="mt-4 text-lg font-semibold">No appointments here yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Book your first appointment to get started.
      </p>
      <Button asChild className="mt-6">
        <a href="/portal/book">Book appointment</a>
      </Button>
    </div>
  );
}
