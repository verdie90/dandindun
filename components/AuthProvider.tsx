"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  User,
  AuthSession,
  LoginCredentials,
  RegisterCredentials,
} from "@/lib/types/auth";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserBySession,
} from "@/lib/auth-service";

interface AuthContextType {
  session: AuthSession;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_COOKIE_NAME = "auth_session_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Get session ID from cookie
  const getSessionId = (): string | null => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie
      .split(";")
      .map((cookie) => cookie.trim());
    const sessionCookie = cookies.find((cookie) =>
      cookie.startsWith(`${SESSION_COOKIE_NAME}=`)
    );
    return sessionCookie?.split("=")[1] || null;
  };

  // Set session cookie
  const setSessionCookie = (sessionId: string) => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days
    document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
  };

  // Clear session cookie
  const clearSessionCookie = () => {
    document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
  };

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const sessionId = getSessionId();
        if (sessionId) {
          const user = await getUserBySession(sessionId);
          if (user) {
            setSession({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            clearSessionCookie();
            setSession({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setSession({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        setSession({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Failed to initialize session",
        });
      }
    };

    initializeSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }));
      const result = await loginUser(credentials);
      const { sessionId, ...user } = result;
      
      setSessionCookie(sessionId);
      setSession({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setSession((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await registerUser(credentials);
      
      // Auto-login after registration
      const loginResult = await loginUser({
        email: credentials.email,
        password: credentials.password,
      });
      const { sessionId, ...userData } = loginResult;
      
      setSessionCookie(sessionId);
      setSession({
        user: userData,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const sessionId = getSessionId();
      if (sessionId) {
        await logoutUser(sessionId);
      }
      clearSessionCookie();
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Logout failed";
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      const sessionId = getSessionId();
      if (sessionId) {
        const user = await getUserBySession(sessionId);
        if (user) {
          setSession({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          clearSessionCookie();
          setSession({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh session";
      setSession({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
      <Toaster />
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
