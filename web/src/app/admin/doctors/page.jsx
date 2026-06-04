"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RefreshCw, Search, UserPlus, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    specialty: "",
    experience: "",
    bio: "",
    price: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  // Fetch doctors
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/doctors");
      setDoctors(res.data);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
      toast.error("Could not load doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setEditForm({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: doctor.experience,
      bio: doctor.bio || "",
      price: doctor.price,
      isActive: doctor.isActive,
    });
  };

  const handleSave = async () => {
    if (!editForm.name.trim() || !editForm.specialty.trim()) {
      toast.error("Name and specialty are required");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/doctors/${editingDoctor._id}`, editForm);
      
      // Update local state
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === editingDoctor._id ? { ...d, ...editForm } : d
        )
      );
      
      setEditingDoctor(null);
      toast.success("Doctor updated successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update doctor");
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (doctor) => {
    try {
      const newStatus = !doctor.isActive;
      await api.put(`/api/doctors/${doctor._id}`, { isActive: newStatus });
      
      // Update local state
      setDoctors((prev) =>
        prev.map((d) =>
          d._id === doctor._id ? { ...d, isActive: newStatus } : d
        )
      );
      
      toast.success(`Doctor ${newStatus ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const filteredDoctors = doctors.filter((d) =>
    searchQuery
      ? d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

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
            Team
          </div>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl lg:text-5xl">
            Doctors.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage profiles, specialties, and availability.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search doctors..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No doctors found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query."
              : "No doctors in the system yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => {
            const accentColor = `hsl(${Math.abs(doctor.name.charCodeAt(0) * 137) % 360}, 70%, 60%)`;
            return (
              <div
                key={doctor._id}
                className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <span
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold"
                    style={{
                      background: `color-mix(in oklab, ${accentColor} 25%, transparent)`,
                      color: accentColor,
                    }}
                  >
                    {getInitials(doctor.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{doctor.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {doctor.specialty}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      doctor.isActive
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {doctor.isActive ? "Active" : "Off"}
                  </span>
                </div>

                {/* Bio */}
                <p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
                  {doctor.bio || "Experienced healthcare professional."}
                </p>

                {/* Stats */}
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{doctor.experience} yrs experience</span>
                  <span className="font-semibold">ETB {doctor.price}</span>
                </div>

                {/* Actions */}
                <div className="mt-5 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(doctor)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleAvailability(doctor)}
                    className={
                      doctor.isActive
                        ? "text-red-600 hover:text-red-600"
                        : "text-green-600 hover:text-green-600"
                    }
                  >
                    {doctor.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDoctor} onOpenChange={() => setEditingDoctor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
            <DialogDescription>
              Update doctor information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Dr. John Doe"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Input
                value={editForm.specialty}
                onChange={(e) =>
                  setEditForm({ ...editForm, specialty: e.target.value })
                }
                placeholder="Cardiologist"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={editForm.experience}
                  onChange={(e) =>
                    setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Price (ETB)</Label>
                <Input
                  type="number"
                  value={editForm.price}
                  onChange={(e) =>
                    setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })
                  }
                  placeholder="1000"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Bio</Label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Short bio about the doctor..."
                className="min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingDoctor(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
