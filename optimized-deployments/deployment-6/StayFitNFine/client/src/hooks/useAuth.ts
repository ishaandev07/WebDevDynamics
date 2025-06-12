import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean | null;
  emailVerified: boolean | null;
  profileImage: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export function useAuth() {
  const [sessionToken, setSessionToken] = useState<string | null>(
    () => localStorage.getItem("sessionToken")
  );

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      if (!sessionToken) throw new Error("No session token");
      
      const response = await fetch("/api/auth/me", {
        headers: {
          "Authorization": `Bearer ${sessionToken}`,
          "Content-Type": "application/json"
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("sessionToken");
          setSessionToken(null);
        }
        throw new Error("Authentication failed");
      }
      
      return response.json();
    },
    enabled: !!sessionToken,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const token = localStorage.getItem("sessionToken");
    setSessionToken(token);
  }, []);

  const login = (token: string) => {
    localStorage.setItem("sessionToken", token);
    setSessionToken(token);
  };

  const logout = async () => {
    try {
      if (sessionToken) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sessionToken}`,
            "Content-Type": "application/json"
          }
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("sessionToken");
      setSessionToken(null);
    }
  };

  return {
    user: user as User | undefined,
    isLoading: isLoading && !!sessionToken,
    isAuthenticated: !!user && !!sessionToken,
    isAdmin: user?.role === "admin",
    sessionToken,
    login,
    logout,
    error
  };
}