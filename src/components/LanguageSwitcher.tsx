"use client";

import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";

type Locale = "en" | "hi";

const LOCALE_STORAGE_KEY = "taraqqi-locale";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLocale = (i18n.language?.startsWith("hi") ? "hi" : "en") as Locale;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const setLocale = (lng: Locale) => {
    i18n.changeLanguage(lng);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCALE_STORAGE_KEY, lng);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-medium"
        aria-label={t("language.switchTo")}
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">
          {currentLocale === "hi" ? t("language.labelHi") : t("language.labelEn")}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-slate-200 rounded-xl shadow-lg min-w-[180px] z-50">
          <button
            type="button"
            onClick={() => setLocale("en")}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
              currentLocale === "en" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="text-base" aria-hidden>🇬🇧</span>
            {t("language.labelEn")}
          </button>
          <button
            type="button"
            onClick={() => setLocale("hi")}
            className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${
              currentLocale === "hi" ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="text-base" aria-hidden>🇮🇳</span>
            {t("language.labelHi")}
          </button>
        </div>
      )}
    </div>
  );
}
