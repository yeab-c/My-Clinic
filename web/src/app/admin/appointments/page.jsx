"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Filter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";

const statusColors = {
  upcoming: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
  past: "bg-green-500/10 text-green-600 border border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border border-red-500/20",
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("all");
  const [doctors, setDoctors] = useState([]);

  const services = ["General Consultation", "Dental Checkup", "Specialist Consultation"];
  
  const timeSlots = [
    { value: "morning", label: "Morning (09:00-12:00)" },
    { value: "afternoon", label: "Afternoon (12:00-15:00)" },
    { value: "evening", label: "Evening (15:00-17:00)" },
  ];

  // Fetch appointments and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, doctorsRes] = await Promise.all([
          api.get("/api/appointments"),
          api.get("/api/doctors"),
        ]);
        
        // Sort by date and time (most recent first)
        const sorted = appointmentsRes.data.sort((a, b) => {
          if (a.date !== b.date) {
            return new Date(b.date) - new Date(a.date);
          }
          return b.time.localeCompare(a.time);
        });
        setAppointments(sorted);
        setDoctors(doctorsRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter appointments by status, search, doctor, service, date, and time
  const filterByStatus = (status) => {
    return appointments.filter((a) => {
      const matchesStatus = status === "all" || a.status === status;
      
      const matchesSearch = searchQuery
        ? (a.patientId?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.doctorId?.name || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (a.service || "").toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesDoctor = 
        selectedDoctor === "all" || a.doctorId?._id === selectedDoctor;
      
      const matchesService = 
        selectedService === "all" || a.service === selectedService;
      
      // Date range filter
      const matchesDateRange = (() => {
        if (!dateFrom && !dateTo) return true;
        const aptDate = new Date(a.date);
        if (dateFrom && !dateTo) return aptDate >= new Date(dateFrom);
        if (!dateFrom && dateTo) return aptDate <= new Date(dateTo);
        return aptDate >= new Date(dateFrom) && aptDate <= new Date(dateTo);
      })();
      
      // Time slot filter
      const matchesTimeSlot = (() => {
        if (selectedTimeSlot === "all") return true;
        const [hours] = a.time.split(":").map(Number);
        if (selectedTimeSlot === "morning") return hours >= 9 && hours < 12;
        if (selectedTimeSlot === "afternoon") return hours >= 12 && hours < 15;
        if (selectedTimeSlot === "evening") return hours >= 15 && hours < 17;
        return true;
      })();
      
      return matchesStatus && matchesSearch && matchesDoctor && matchesService && matchesDateRange && matchesTimeSlot;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDoctor("all");
    setSelectedService("all");
    setDateFrom("");
    setDateTo("");
    setSelectedTimeSlot("all");
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedDoctor !== "all" || 
    selectedService !== "all" || 
    dateFrom || 
    dateTo || 
    selectedTimeSlot !== "all";

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Scheduling
            </div>
            <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
              All appointments.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Every booking, across every doctor.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 space-y-3">
          {/* First row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search appointments..."
                className="pl-9"
              />
            </div>

            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All doctors</SelectItem>
                {doctors.map((doc) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="All services" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All services</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Second row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Date Range
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From date"
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-center text-muted-foreground sm:pt-6">
                <span className="text-sm">to</span>
              </div>
              <div className="flex-1 space-y-1.5 sm:pt-[22px]">
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To date"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:w-[200px]">
              <label className="text-xs font-medium text-muted-foreground">
                Time of Day
              </label>
              <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="All times" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All times</SelectItem>
                  {timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full sm:w-auto"
              >
                <X className="mr-1 h-4 w-4" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({appointments.filter((a) => a.status === "upcoming").length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({appointments.filter((a) => a.status === "past").length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({appointments.filter((a) => a.status === "cancelled").length})
          </TabsTrigger>
        </TabsList>

        {["all", "upcoming", "past", "cancelled"].map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {filterByStatus(status).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                <Filter className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No appointments found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try adjusting your search query."
                    : "No appointments match this filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead className="w-[80px]">Time</TableHead>
                        <TableHead>Patient</TableHead>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead className="w-[100px]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filterByStatus(status).map((apt) => (
                        <TableRow key={apt._id}>
                          <TableCell className="font-medium">
                            {format(parseISO(apt.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{apt.time}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {apt.patientId?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {apt.patientId?.email}
                              </div>
                            </div>
                          </TableCell>
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
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
