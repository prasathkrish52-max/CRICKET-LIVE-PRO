"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { teamService } from "@/lib/services/teamService";
import { uploadImage } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

interface TeamFormProps {
  onSuccess: (message?: string) => void;
  onCancel: () => void;
}

export function TeamForm({ onSuccess, onCancel }: TeamFormProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);

  // Check if storage bucket exists on mount
  useEffect(() => {
    const checkBucket = async () => {
      const { data, error } = await supabase.storage.getBucket('teams');
      setBucketExists(!error && !!data);
    };
    checkBucket();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      // 1. Validation: Size (5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFormError("Logo file is too large (Max 5MB)");
        return;
      }

      // 2. Validation: Type
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(selectedFile.type)) {
        setFormError("Only PNG, JPG, or WEBP images are supported");
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    try {
      let logoUrl = "";
      if (file) {
        try {
          logoUrl = await uploadImage(file, "teams", "logos");
        } catch (storageError: any) {
          console.warn("Storage upload failed, creating team without logo:", storageError);
          // Non-blocking: If storage fails, we still create the team
          if (storageError.message === "Bucket not found") {
            logoUrl = "";
          } else {
            throw storageError;
          }
        }
      }

      await teamService.createTeam({ name, logo_url: logoUrl || undefined });
      onSuccess(`Team "${name}" registered successfully!`);
    } catch (error: any) {
      setFormError(error.message || "Failed to create team. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass-card p-8 border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stadium-gold via-stadium-emerald to-stadium-gold opacity-50" />
      
      <div>
        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">New Team</h2>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Register a new franchise in the system</p>
      </div>

      {formError && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-shake">
          <span className="text-red-400 text-sm">⚠️</span>
          <p className="text-red-400 text-[11px] font-bold uppercase tracking-tight">{formError}</p>
        </div>
      )}

      {/* Storage Warning (If bucket missing) */}
      {bucketExists === false && !formError && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <p className="text-amber-400 text-[10px] font-black uppercase tracking-[0.15em] mb-1">Storage Bucket Missing</p>
          <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
            Team logos won't be saved until the 'teams' bucket is created in Supabase. You can still create teams without logos.
          </p>
        </div>
      )}

      {/* Logo Upload Section */}
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="relative group">
          <div className={`w-32 h-32 rounded-3xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden
            ${preview ? "border-stadium-gold ring-4 ring-stadium-gold/10" : "border-white/10 hover:border-white/30 bg-white/5"}`}>
            
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover animate-fade-in" />
            ) : (
              <div className="text-center p-4">
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2 text-xl">🛡️</div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Team Logo</p>
              </div>
            )}

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={loading}
            />
          </div>

          {preview && !loading && (
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-20"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em]">PNG, JPG or WEBP (Max 5MB)</p>
      </div>

      {/* Team Name Input */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
          Official Team Name
        </label>
        <input
          required
          type="text"
          className="w-full bg-pitch/50 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold tracking-tight focus:outline-none focus:border-stadium-gold transition-all placeholder:text-slate-700"
          placeholder="e.g. Chennai Champions"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          variant="gold"
          className="flex-grow shadow-2xl"
          isLoading={loading}
        >
          {preview ? "Upload & Register" : "Register Team"}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel} 
          disabled={loading}
          className="px-8"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
