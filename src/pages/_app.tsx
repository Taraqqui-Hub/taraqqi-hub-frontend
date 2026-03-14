import "@/styles/globals.css";
import "@/i18n";
import type { AppProps } from "next/app";

import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function AppContent({ Component, pageProps }: AppProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { i18n } = useTranslation();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Wait for i18n and initial translation bundle so we never show variable names (e.g. on slow network)
  useEffect(() => {
    const lng = i18n.language || (i18n.options.fallbackLng as string) || "en";
    const defaultNS =
      (Array.isArray(i18n.options.defaultNS)
        ? i18n.options.defaultNS[0]
        : i18n.options.defaultNS) || "translation";
    const hasBundle = i18n.hasResourceBundle(lng, defaultNS);

    if (hasBundle) {
      setI18nReady(true);
      return;
    }

    let cancelled = false;
    const done = () => {
      if (!cancelled) setI18nReady(true);
    };

    i18n.loadLanguages(lng).then(done).catch(done);
    const onLoaded = () => done();
    i18n.store.on("added", onLoaded);
    return () => {
      cancelled = true;
      i18n.store.off("added", onLoaded);
    };
  }, [i18n.language]);

  // Set document lang for accessibility and Hindi script
  useEffect(() => {
    const lang = i18n.language?.startsWith("hi") ? "hi" : "en";
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [i18n.language]);

  // Global loading state: show loading UI until translations are ready (avoids showing variable names)
  if (!i18nReady) {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900"
        role="status"
        aria-label="Loading"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary-600 dark:border-gray-600 dark:border-t-primary-400" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return <AppContent {...props} />;
}
