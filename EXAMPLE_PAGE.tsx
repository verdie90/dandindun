// File: app/[locale]/about/page.tsx
// Contoh halaman "About" dengan multi-bahasa

"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function About() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            {t("nav.about")}
          </h1>
          <LanguageSwitcher />
        </div>

        {/* Content */}
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
            {/* Contoh: t("about.description") */}
            Add your about page content here with translations.
          </p>

          {/* Sections */}
          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
              {/* Contoh: t("about.mission") */}
              Our Mission
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {/* Contoh: t("about.missionText") */}
              Your mission statement here.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold text-black dark:text-white mb-4">
              {/* Contoh: t("about.vision") */}
              Our Vision
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {/* Contoh: t("about.visionText") */}
              Your vision statement here.
            </p>
          </section>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex gap-4">
          <a
            href="/en"
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded hover:opacity-80 transition"
          >
            {t("common.back")}
          </a>
        </div>
      </div>
    </div>
  );
}
