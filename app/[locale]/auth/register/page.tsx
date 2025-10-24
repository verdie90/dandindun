"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { session } = useAuth();
  const t = useTranslations();

  // Redirect if already authenticated
  useEffect(() => {
    if (session.isAuthenticated && !session.isLoading) {
      router.push("/dashboard");
    }
  }, [session.isAuthenticated, session.isLoading, router]);

  if (session.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Dandindun</h1>
          <p className="text-muted-foreground">{t("home.subtitle")}</p>
        </div>

        <div className="flex justify-center mb-8">
          <RegisterForm
            onSuccess={() => {
              router.push("/dashboard");
            }}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
