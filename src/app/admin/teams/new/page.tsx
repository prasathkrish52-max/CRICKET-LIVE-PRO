"use client";

import React, { useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/storage";
import { useRouter } from "next/navigation";

export default function NewTeamPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    owner_name: "",
    owner_contact: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let logo_url = "";
      let photo_url = "";

      if (logo) {
        try {
          logo_url = await uploadImage(logo, "teams", "logos");
        } catch (storageErr: any) {
          if (storageErr.message === "Bucket not found") {
            const proceed = confirm("CRITICAL: The 'teams' storage bucket is missing in your Supabase project.\n\nTeam will be created WITHOUT a logo.\n\nTo fix this: Go to Supabase Dashboard -> Storage and create a PUBLIC bucket named 'teams'.\n\nDo you want to proceed without a logo?");
            if (!proceed) {
              setLoading(false);
              return;
            }
          } else {
            throw storageErr;
          }
        }
      }
      if (photo) {
        try {
          photo_url = await uploadImage(photo, "teams", "photos");
        } catch (storageErr: any) {
          if (storageErr.message !== "Bucket not found") {
            throw storageErr;
          }
          // If bucket not found, we already warned the user for logo, so we just skip photo
        }
      }

      const { error } = await supabase.from("teams").insert([
        {
          name: formData.name,
          logo_url,
          photo_url,
          owner_details: {
            name: formData.owner_name,
            contact: formData.owner_contact,
          },
        },
      ]);

      if (error) throw error;
      router.push("/admin/teams");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight uppercase">Register New Team</h1>
        <p className="text-slate-400 mt-1 font-medium">Add a new professional team to the Cricket Live Pro ecosystem.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card isGlass className="border-white/5">
          <CardBody className="space-y-6 p-8">
            {/* Team Info */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Name</label>
              <input
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none transition-all"
                placeholder="e.g. Mumbai Mavericks"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {/* Logo & Photo */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Logo</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setLogo(e.target.files?.[0] || null)}
                  />
                  <div className="border-2 border-dashed border-white/10 group-hover:border-stadium-gold/30 rounded-xl p-6 text-center transition-all bg-white/5">
                    <span className="text-sm text-slate-400">{logo ? logo.name : "Select Logo"}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Team Banner/Photo</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                  <div className="border-2 border-dashed border-white/10 group-hover:border-stadium-gold/30 rounded-xl p-6 text-center transition-all bg-white/5">
                    <span className="text-sm text-slate-400">{photo ? photo.name : "Select Photo"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Details */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-sm font-bold text-stadium-gold uppercase mb-4">Owner Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Owner Name</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none transition-all"
                    placeholder="Full Name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Contact Info</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-stadium-gold outline-none transition-all"
                    placeholder="Phone or Email"
                    value={formData.owner_contact}
                    onChange={(e) => setFormData({ ...formData, owner_contact: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="flex gap-4">
          <Button variant="ghost" type="button" onClick={() => router.back()} className="flex-grow">Back</Button>
          <Button variant="gold" type="submit" disabled={loading} className="flex-grow py-4 h-auto text-lg">
            {loading ? "Registering..." : "Create Team"}
          </Button>
        </div>
      </form>
    </div>
  );
}
