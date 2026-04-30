"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hotelName: string;
  plan: "starter" | "growth" | "enterprise";
  usageThisMonth: number;
  signUp: (email: string, password: string, hotelName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hotelName, setHotelName] = useState("");
  const [plan, setPlan] = useState<"starter" | "growth" | "enterprise">("starter");
  const [usageThisMonth, setUsageThisMonth] = useState(0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          loadUserProfile(session.user);
        } else {
          setHotelName("");
          setPlan("starter");
          setUsageThisMonth(0);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = (user: User) => {
    // For MVP, read hotel name from user metadata
    const metadata = user.user_metadata;
    setHotelName(metadata?.hotel_name || "My Hotel");
    setPlan(metadata?.plan || "starter");
    // Mock usage count — in production this would come from a DB query
    setUsageThisMonth(metadata?.usage_this_month || 3);
  };

  const signUp = async (email: string, password: string, hotel: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          hotel_name: hotel,
          plan: "starter",
          usage_this_month: 0,
        },
      },
    });
    return { error: error?.message || null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHotelName("");
    setPlan("starter");
    setUsageThisMonth(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        hotelName,
        plan,
        usageThisMonth,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
