"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  // Remove locale from pathname
  const pathWithoutLocale = pathname.replace(`/${locale}`, "");

  return (
    <div className="flex gap-2">
      <Link
        href={`/en${pathWithoutLocale}`}
        className={`px-3 py-1 rounded ${
          locale === "en"
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        EN
      </Link>
      <Link
        href={`/id${pathWithoutLocale}`}
        className={`px-3 py-1 rounded ${
          locale === "id"
            ? "bg-black text-white dark:bg-white dark:text-black"
            : "bg-gray-200 dark:bg-gray-700"
        }`}
      >
        ID
      </Link>
    </div>
  );
}
