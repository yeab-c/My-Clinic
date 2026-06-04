// /portal/book

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, ChevronLeft, ChevronRight, Clock, Stethoscope, UserRound, Sparkles } from "lucide-react";
import { format, addDays } from "date-fns";
import { toast } from "sonner";
import api from "@/lib/api";

const services = [
  {
    id: "General Consultation",
    name: "General Consultation",
    description: "Routine checkups and primary care visits with experienced physicians.",
    duration: 30,
    price: 500,
    icon: UserRound,
  },
  {
    id: "Dental Checkup",
    name: "Dental Checkup",
    description: "Comprehensive dental exams, cleaning, and preventive care.",
    duration: 30,
    price: 800,
    icon: Sparkles,
  },
  {
    id: "Specialist Consultation",
    name: "Specialist Consultation",
    description: "In-depth consultations with specialist physicians for complex conditions.",
    duration: 30,
    price: 1200,
    icon: Stethoscope,
  },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

const steps = ["Service", "Doctor", "Date", "Time"];

export default function BookPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(addDays(new Date(), 1));
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);
  
  const [doctors, setDoctors] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/api/doctors/active");
        setDoctors(res.data);
      } catch (err) {
        console.error("Failed to fetch doctors", err);
        toast.error("Could not load doctors");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch availability and appointments when doctor/date changes
  useEffect(() => {
    if (!doctorId || !date) return;

    const fetchAvailability = async () => {
      try {
        const dateStr = format(date, "yyyy-MM-dd");
        
        // Fetch slots with their status (available/blocked/booked)
        const availRes = await api.get("/api/availability", {
          params: { doctorId, date: dateStr }
        });
        
        // Extract blocked and booked slots
        const slots = availRes.data || [];
        const blocked = slots.filter(s => s.status === "blocked").map(s => s.time);
        const booked = slots.filter(s => s.status === "booked").map(s => s.time);
        
        setBlockedSlots([...blocked, ...booked]);
      } catch (err) {
        console.error("Failed to fetch availability", err);
        setBlockedSlots([]);
      }
    };

    fetchAvailability();
  }, [doctorId, date]);

  const dateKey = date ? format(date, "yyyy-MM-dd") : "";

  // Calculate blocked time slots
  const blocked = useMemo(() => {
    return new Set(blockedSlots);
  }, [blockedSlots]);

  const service = services.find((s) => s.id === serviceId);
  const doctor = doctors.find((d) => d._id === doctorId);

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!doctorId) ||
    (step === 2 && !!date) ||
    (step === 3 && !!time);

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const confirm = async () => {
    if (!serviceId || !doctorId || !date || !time) return;

    setLoading(true);
    try {
      await api.post("/api/appointments/create", {
        doctorId,
        service: serviceId,
        date: dateKey,
        time,
        reason,
      });
      
      setConfirmOpen(false);
      setDone(true);
      toast.success("Appointment confirmed!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-green-500/15 text-green-600">
          <Check className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-4xl font-semibold">You're all set.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We've scheduled your appointment and sent a confirmation to your email.
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left">
          <Row label="Service" value={service?.name ?? ""} />
          <Row label="Doctor" value={doctor?.name ?? ""} />
          <Row label="When" value={`${format(date, "EEE, MMM d")} · ${time}`} />
          <Row label="Total" value={`ETB ${service?.price}`} />
        </div>
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDone(false);
              setStep(0);
              setServiceId("");
              setDoctorId("");
              setTime("");
              setReason("");
            }}
          >
            Book another
          </Button>
          <Button onClick={() => router.push("/portal/appointments")}>
            View appointments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Book
        </div>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
          Schedule a visit.
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Four short steps. You can change anything before confirming.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <Stepper step={step} />

          {/* Step 0: Select Service */}
          {step === 0 && (
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {services.map((s) => {
                const active = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`text-left rounded-xl border p-5 transition-all ${
                      active
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div className="mt-4 font-medium">{s.name}</div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {s.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{s.duration} min</span>
                      <span className="text-lg font-semibold">ETB {s.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 1: Select Doctor */}
          {step === 1 && (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((d) => {
                const active = d._id === doctorId;
                const accentColor = `hsl(${Math.abs(d.name.charCodeAt(0) * 137) % 360}, 70%, 60%)`;
                return (
                  <button
                    key={d._id}
                    onClick={() => setDoctorId(d._id)}
                    className={`text-left rounded-xl border p-5 transition-all ${
                      active
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold"
                        style={{
                          background: `color-mix(in oklab, ${accentColor} 25%, transparent)`,
                          color: accentColor,
                        }}
                      >
                        {getInitials(d.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.specialty}</div>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground line-clamp-2">
                      {d.bio || "Experienced healthcare professional."}
                    </p>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{d.experience} yrs exp</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 ${
                          d.isActive
                            ? "bg-green-500/10 text-green-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            d.isActive ? "bg-green-600" : "bg-muted-foreground"
                          }`}
                        />
                        {d.isActive ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <div className="mt-8 grid gap-6 lg:grid-cols-[auto_1fr]">
              <div className="flex justify-center rounded-xl border border-border bg-background p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) =>
                    d < new Date(new Date().toDateString()) ||
                    d > addDays(new Date(), 60)
                  }
                  className="pointer-events-auto"
                />
              </div>
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-sm text-muted-foreground">
                <Stethoscope className="h-5 w-5 text-primary" />
                <p className="mt-3">
                  Pick any weekday in the next 60 days. We'll show you the half-hour
                  slots available for{" "}
                  <strong className="text-foreground">{doctor?.name}</strong>.
                </p>
                {date && (
                  <p className="mt-4 text-foreground">
                    Selected:{" "}
                    <strong>{format(date, "EEEE, MMMM d, yyyy")}</strong>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <div className="mt-8">
              <div className="mb-4 flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="text-muted-foreground">
                  All slots are 30 minutes. Blocked slots are unavailable.
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm border border-border bg-card" />{" "}
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-primary" /> Selected
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-sm bg-muted" /> Blocked
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {timeSlots.map((t) => {
                  const isBlocked = blocked.has(t);
                  const isSelected = t === time;
                  return (
                    <button
                      key={t}
                      disabled={isBlocked}
                      onClick={() => setTime(t)}
                      className={`rounded-md border px-3 py-2.5 text-sm transition-all ${
                        isBlocked
                          ? "cursor-not-allowed border-dashed border-border bg-muted/40 text-muted-foreground/50 line-through"
                          : isSelected
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background hover:border-primary/40 hover:bg-accent/40"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            {step < 3 ? (
              <Button
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={!canNext}
                onClick={() => setConfirmOpen(true)}
              >
                Review & confirm
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar Summary */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Summary
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <Summary label="Service" value={service?.name ?? "—"} />
              <Summary label="Doctor" value={doctor?.name ?? "—"} />
              <Summary label="Date" value={date ? format(date, "EEE, MMM d") : "—"} />
              <Summary label="Time" value={time || "—"} />
              <Summary
                label="Duration"
                value={service ? `${service.duration} min` : "—"}
              />
            </dl>
            <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total
                </div>
                <div className="text-3xl font-semibold">
                  ETB {service?.price ?? 0}
                </div>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your appointment</DialogTitle>
            <DialogDescription>
              Please review the details before confirming.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 text-sm">
            <Row label="Service" value={service?.name ?? ""} />
            <Row label="Doctor" value={doctor?.name ?? ""} />
            <Row
              label="When"
              value={date && time ? `${format(date, "EEE, MMM d")} · ${time}` : ""}
            />
            <Row label="Total" value={`ETB ${service?.price ?? 0}`} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={loading}>
              {loading ? "Booking..." : "Confirm booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Stepper({ step }) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((label, i) => {
        const active = i === step;
        const complete = i < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${
                complete
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "border border-primary text-primary"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {complete ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span
              className={`hidden text-xs sm:inline ${
                active || complete ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Summary({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
