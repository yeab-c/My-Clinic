"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, ChevronLeft, CalendarDays, Mail, Phone, User } from "lucide-react";
import { format, parseISO } from "date-fns";
import api from "@/lib/api";

const statusColors = {
  upcoming: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  past: "bg-green-500/10 text-green-600 border border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border border-red-500/20",
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const res = await api.get(`/api/patients/${params.id}`);
        setPatient(res.data.patient);
        setAppointments(res.data.appointments);
      } catch (err) {
        console.error("Failed to fetch patient details", err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPatientDetails();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
        <User className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Patient not found</h3>
        <Button className="mt-6" onClick={() => router.push("/admin/patients")}>
          Back to patients
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/admin/patients")}
        className="mb-6"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        Back to patients
      </Button>

      {/* Page header with patient info */}
      <div className="mb-8 border-b border-border/60 pb-6">
        <div className="flex items-start gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
            {patient.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-semibold sm:text-4xl">{patient.name}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {patient.email}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {patient.phone}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                Joined {format(parseISO(patient.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">
            Total Appointments
          </div>
          <div className="mt-2 text-3xl font-bold">{appointments.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">
            Upcoming
          </div>
          <div className="mt-2 text-3xl font-bold">
            {appointments.filter((a) => a.status === "upcoming").length}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="text-xs font-medium text-muted-foreground">
            Completed
          </div>
          <div className="mt-2 text-3xl font-bold">
            {appointments.filter((a) => a.status === "past").length}
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Appointment History</h2>
          <p className="text-sm text-muted-foreground">
            Complete history of all appointments
          </p>
        </div>

        {appointments.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No appointments yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This patient hasn't booked any appointments.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell className="font-medium">
                      {format(parseISO(apt.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>{apt.time}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {apt.doctorId?.name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {apt.doctorId?.specialty}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{apt.service}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          statusColors[apt.status] ||
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}
