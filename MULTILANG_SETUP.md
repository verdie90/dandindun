# Dandindun - Multi-Language Next.js App

A modern Next.js application with built-in internationalization support for **Indonesian** and **English** using `next-intl`.

## 🌍 Features

- ✅ **Multi-language Support**: Indonesian (id) and English (en)
- ✅ **Dynamic Routing**: Language-based URL routing with `[locale]` dynamic segment
- ✅ **Language Switcher**: Easy language switching component
- ✅ **Automatic Redirects**: Root path redirects to `/en` by default
- ✅ **TypeScript**: Full type safety with TypeScript
- ✅ **Tailwind CSS**: Responsive styling with Tailwind CSS

## 📁 Project Structure

```
dandindun/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale-aware root layout
│   │   ├── page.tsx            # Home page with translations
│   │   └── globals.css
│   └── layout.tsx              # Root layout (redirects to /en)
├── components/
│   └── LanguageSwitcher.tsx    # Language switching component
├── i18n/
│   └── request.ts             # i18n configuration
├── messages/
│   ├── en.json                # English translations
│   └── id.json                # Indonesian translations
├── next.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app will redirect you to `/en` by default.

### Building

```bash
npm run build
npm start
```

## 🌐 Using Translations

### In Components

For **client components**, use the `useTranslations` hook:

```tsx
"use client";

import { useTranslations } from "next-intl";

export default function MyComponent() {
  const t = useTranslations();
  
  return <h1>{t("home.title")}</h1>;
}
```

For **server components**, use `getTranslations`:

```tsx
import { getTranslations } from "next-intl/server";

export default async function MyServerComponent() {
  const t = await getTranslations();
  
  return <h1>{t("home.title")}</h1>;
}
```

### Adding New Translations

1. Add new keys to `messages/en.json`:
```json
{
  "nav": {
    "home": "Home",
    "about": "About"
  }
}
```

2. Add the same keys to `messages/id.json`:
```json
{
  "nav": {
    "home": "Beranda",
    "about": "Tentang"
  }
}
```

3. Use in components:
```tsx
const t = useTranslations();
t("nav.home") // Returns "Home" or "Beranda" based on current locale
```

## 🔄 Language Switching

The `LanguageSwitcher` component allows users to switch between languages:

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  return (
    <div>
      <LanguageSwitcher />
      {/* page content */}
    </div>
  );
}
```

## 📚 Available Languages

- **English** (`en`) - `/en` and `/en/*` routes
- **Indonesian** (`id`) - `/id` and `/id/*` routes

Default redirect: `/en`

To change the default locale, modify `app/layout.tsx`:

```tsx
export default function RootLayout() {
  redirect("/id"); // Change to Indonesian as default
}
```

## 🔧 Configuration

### Adding a New Language

1. Create a new translation file: `messages/es.json` (for Spanish)
2. Add the new locale to `generateStaticParams` in `app/[locale]/layout.tsx`:

```tsx
export function generateStaticParams() {
  return [
    { locale: "en" },
    { locale: "id" },
    { locale: "es" } // New language
  ];
}
```

3. Update the `LanguageSwitcher` component to include the new language

### i18n Configuration

The i18n configuration is in `i18n/request.ts`. It automatically loads the appropriate translation file based on the current locale.

## 📦 Dependencies

- **next-intl**: Internationalization library for Next.js
- **next**: React framework
- **tailwindcss**: Utility-first CSS framework
- **typescript**: Type safety

## 🎨 Styling

The app uses **Tailwind CSS** with dark mode support. Check `app/globals.css` for custom styles.

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [next-intl Documentation](https://next-intl-docs.vercel.app)
- [Tailwind CSS Documentation](https://tailwindcss.com)

## 📝 License

This project is open source and available under the MIT License.
