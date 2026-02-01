import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <Component {...pageProps} />;
}
