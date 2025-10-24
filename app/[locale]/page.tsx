"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Zap, Globe, Code } from "lucide-react";

export default function Home() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dandindun</h1>
            <p className="text-sm text-muted-foreground">{t("home.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t("home.welcome")}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("home.description")}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg">
              {t("home.deployNow")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              {t("home.documentation")}
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Multi-Language Card */}
            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>{t("nav.home")}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Multi-language support with seamless switching between Indonesian and English
                </CardDescription>
              </CardContent>
            </Card>

            {/* Dark/Light Theme Card */}
            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Dark/Light Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Beautiful dark and light themes with system preference detection
                </CardDescription>
              </CardContent>
            </Card>

            {/* shadcn UI Card */}
            <Card>
              <CardHeader>
                <Code className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>shadcn/ui</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Pre-built, accessible components to build your applications faster
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quick Start Section */}
        <section className="bg-card border border-border rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold mb-4">Quick Start</h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold">Switch Language</h4>
                <p className="text-sm text-muted-foreground">
                  Click the language switcher in the header to change between Indonesian and English
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold">Toggle Theme</h4>
                <p className="text-sm text-muted-foreground">
                  Use the theme switcher to toggle between light, dark, and system modes
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold">Start Building</h4>
                <p className="text-sm text-muted-foreground">
                  Use shadcn/ui components to build your application
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="text-center">
          <h3 className="text-2xl font-bold mb-4">Resources</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://nextjs.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Next.js Documentation
            </a>
            <a
              href="https://next-intl-docs.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              next-intl Docs
            </a>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              shadcn/ui Components
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
