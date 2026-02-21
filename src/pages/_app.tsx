import "@/styles/globals.css";
import "@/i18n";
import type { AppProps } from "next/app";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

function AppContent({ Component, pageProps }: AppProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { i18n } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Set document lang for accessibility and Hindi script
  useEffect(() => {
    const lang = i18n.language?.startsWith("hi") ? "hi" : "en";
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [i18n.language]);

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return <AppContent {...props} />;
}
