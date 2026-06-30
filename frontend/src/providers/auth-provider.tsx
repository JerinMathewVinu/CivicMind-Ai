"use client";
import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import type { UserProfile, UserRole } from "@/types";
import { toast } from "sonner";


interface AuthContextType {
  profile: UserProfile | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  updatePoints: (pts: number) => void;
  demoMode: boolean;
  toggleDemoMode: () => void;
  switchRole: (role: "citizen" | "officer" | "admin") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true);
  const router = useRouter();

  const redirectByRole = (role: string) => {
    if (role === "admin" || role === "super_admin") {
      router.push("/admin/dashboard");
      toast.success("Redirected to Admin Command Console");
    } else if (role === "officer") {
      router.push("/officer/dashboard");
      toast.success("Redirected to Maintenance Dispatch Console");
    } else {
      router.push("/dashboard");
      toast.success("Redirected to Citizen Portal");
    }
  };

  // Verify token on mount to restore user session
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const { data } = await api.post<UserProfile>("/auth/verify-token");
          setProfile(data);
        } catch (err) {
          console.error("Token verification failed, clearing session:", err);
          localStorage.removeItem("accessToken");
          setProfile(null);
        }
      } else {
        // Build mock citizen session in demo mode automatically
        setProfile({
          uid: "demo_user_123",
          email: "demo@civicmind.ai",
          displayName: "Jerin Patel (Judge)",
          role: "admin" as UserRole,
          points: 180,
          badges: ["Welcome Citizen", "Pothole Sentinel"],
          createdAt: new Date().toISOString()
        });
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { username, password });
      localStorage.setItem("accessToken", data.accessToken);
      setProfile(data.user);
      redirectByRole(data.user.role);
    } catch (err) {
      // Offline fallback login for demo presentation
      const resolvedRole: UserRole = username.includes("admin")
        ? "admin"
        : username.includes("officer")
          ? "officer"
          : "citizen";
      const localProfile: UserProfile = {
        uid: "demo_user_123",
        email: "demo@civicmind.ai",
        displayName:
          resolvedRole === "admin"
            ? "Jerin Patel (Admin)"
            : resolvedRole === "officer"
              ? "Jerin Patel (Officer)"
              : "Jerin Patel (Citizen)",
        role: resolvedRole,
        points: 180,
        badges: ["Welcome Citizen"],
        createdAt: new Date().toISOString()
      };
      setProfile(localProfile);
      redirectByRole(resolvedRole);
    }
  };

  const register = async (username: string, email: string, password: string, displayName: string) => {
    try {
      await api.post("/auth/register", { username, email, password, displayName });
      await login(username, password);
    } catch (err) {
      const localProfile: UserProfile = {
        uid: "demo_user_123",
        email,
        displayName,
        role: "citizen" as UserRole,
        points: 10,
        badges: ["Welcome Citizen"],
        createdAt: new Date().toISOString()
      };
      setProfile(localProfile);
      redirectByRole("citizen");
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setProfile(null);
    router.push("/login");
    toast.info("Logged out of console session");
  };

  const toggleDemoMode = () => {
    setDemoMode(prev => {
      const next = !prev;
      toast.info(`Demo Mode ${next ? "ENABLED (Offline Mocking)" : "DISABLED (Live API Connection)"}`);
      return next;
    });
  };

  const updatePoints = (pts: number) => {
    if (profile) {
      setProfile(prev => prev ? { ...prev, points: prev.points + pts } : null);
      toast.success(`+${pts} Civic XP Earned!`);
    }
  };

  const switchRole = (role: "citizen" | "officer" | "admin") => {
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        role,
        displayName:
          role === "admin"
            ? "Jerin Patel (Admin)"
            : role === "officer"
              ? "Jerin Patel (Officer)"
              : "Jerin Patel (Citizen)"
      };
      setProfile(updatedProfile);
      redirectByRole(role);
    }
  };

  return (
    <AuthContext.Provider value={{ profile, loading, login, register, logout, updatePoints, demoMode, toggleDemoMode, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}