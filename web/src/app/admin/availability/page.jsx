"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Ban, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

export default function AvailabilityPage() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [date, setDate] = useState(addDays(new Date(), 1));
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/api/doctors");
        setDoctors(res.data);
        if (res.data.length > 0) {
          setSelectedDoctorId(res.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch doctors", err);
        toast.error("Could not load doctors");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  // Fetch slots when doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !date) return;

    const fetchSlots = async () => {
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        const res = await api.get("/api/availability", {
          params: { doctorId: selectedDoctorId, date: dateStr },
        });
        setSlots(res.data || []);
      } catch (err) {
        console.error("Failed to fetch slots", err);
        setSlots([]);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, date]);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const toggleSlot = async (time) => {
    if (!date) return;

    const dateStr = format(date, "yyyy-MM-dd");
    const slot = slots.find((s) => s.time === time);
    const isBlocked = slot?.status === "blocked";

    setActionLoading(true);
    try {
      if (isBlocked) {
        // Unblock slot
        await api.delete("/api/availability/block", {
          data: { doctorId: selectedDoctorId, date: dateStr, slot: time },
        });
        toast.success("Slot opened");
      } else {
        // Block slot
        await api.post("/api/availability/block", {
          doctorId: selectedDoctorId,
          date: dateStr,
          slot: time,
        });
        toast.success("Slot blocked");
      }

      // Refresh slots
      const res = await api.get("/api/availability", {
        params: { doctorId: selectedDoctorId, date: dateStr },
      });
      setSlots(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update slot");
    } finally {
      setActionLoading(false);
    }
  };

  const blockFullDay = async () => {
    if (!date) return;

    const dateStr = format(date, "yyyy-MM-dd");
    setActionLoading(true);

    try {
      // Block all time slots
      await Promise.all(
        timeSlots.map((time) =>
          api.post("/api/availability/block", {
            doctorId: selectedDoctorId,
            date: dateStr,
            slot: time,
          })
        )
      );

      toast.success("Full day blocked");

      // Refresh slots
      const res = await api.get("/api/availability", {
        params: { doctorId: selectedDoctorId, date: dateStr },
      });
      setSlots(res.data || []);
    } catch (err) {
      toast.error("Failed to block full day");
    } finally {
      setActionLoading(false);
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
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Scheduling
        </div>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Availability.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Block individual slots or full days. Changes appear instantly in the
          booking flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Doctor Selection */}
        <div className="space-y-2">
          <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Doctor
          </div>
          {doctors.map((doctor) => {
            const accentColor = `hsl(${Math.abs(doctor.name.charCodeAt(0) * 137) % 360}, 70%, 60%)`;
            const isSelected = doctor._id === selectedDoctorId;
            return (
              <button
                key={doctor._id}
                onClick={() => setSelectedDoctorId(doctor._id)}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-accent/40"
                }`}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                  style={{
                    background: `color-mix(in oklab, ${accentColor} 25%, transparent)`,
                    color: accentColor,
                  }}
                >
                  {getInitials(doctor.name)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{doctor.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {doctor.specialty}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Calendar and Slots */}
        <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
          {/* Calendar */}
          <div className="flex justify-center rounded-2xl border border-border bg-card p-3">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              disabled={(d) => d < new Date(new Date().toDateString())}
              className="pointer-events-auto"
            />
          </div>

          {/* Time Slots */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Slots for
                </div>
                <div className="mt-1 text-2xl font-semibold">
                  {date ? format(date, "EEEE, MMM d") : "Pick a date"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={blockFullDay}
                disabled={actionLoading || !date}
              >
                <Ban className="mr-1 h-4 w-4" /> Block full day
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {timeSlots.map((time) => {
                const slot = slots.find((s) => s.time === time);
                const isBlocked = slot?.status === "blocked";
                const isBooked = slot?.status === "booked";

                return (
                  <button
                    key={time}
                    onClick={() => !isBooked && toggleSlot(time)}
                    disabled={actionLoading || isBooked}
                    className={`rounded-md border px-3 py-2.5 text-sm transition-all ${
                      isBlocked
                        ? "border-red-500/40 bg-red-500/10 text-red-600"
                        : isBooked
                        ? "cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground/50"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {isBlocked ? (
                        <Ban className="h-3 w-3" />
                      ) : isBooked ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Check className="h-3 w-3 text-green-600" />
                      )}{" "}
                      {time}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm border border-border bg-background" />
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-red-500/20" />
                Blocked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-muted" />
                Booked
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
