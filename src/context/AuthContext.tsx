"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  connectionError: string | null;
  retryConnection: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkDatabaseConnection = useCallback(async () => {
    try {
      // Light check to see if database can be reached
      const { error } = await supabase
        .from("tournaments")
        .select("count", { count: "exact", head: true })
        .limit(0);

      // PGRST301 is okay (RLS block, but server responded). 
      // Network fetch failures will throw or have specific message containing "fetch"
      if (error && error.message?.includes("fetch")) {
        setConnectionError(error.message);
        return false;
      }
      setConnectionError(null);
      return true;
    } catch (err: any) {
      if (err.message?.includes("fetch") || err.toString().includes("fetch")) {
        setConnectionError(err.message || "Failed to fetch");
        return false;
      }
      return true;
    }
  }, []);

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setRole(data.role);
      }
    } catch (err) {
      console.error("Fetch user role error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const initAuth = useCallback(async () => {
    setLoading(true);
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
    } catch (err: any) {
      console.error("Auth session fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [checkDatabaseConnection, fetchUserRole]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [initAuth, fetchUserRole]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const retryConnection = () => {
    initAuth();
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut, connectionError, retryConnection }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

