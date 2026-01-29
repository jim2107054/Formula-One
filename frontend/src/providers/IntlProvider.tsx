"use client";

import { IntlProvider as ReactIntlProvider } from "react-intl";
import { ReactNode } from "react";
import en from "@/i18n/messages/en.json";
import de from "@/i18n/messages/de.json";
import es from "@/i18n/messages/es.json";
import ro from "@/i18n/messages/ro.json";
import { useLocaleStore } from "@/zustand/stores/locale";

const messages: Record<string, Record<string, string>> = {
  en: en as Record<string, string>,
  de: de as Record<string, string>,
  es: es as Record<string, string>,
  ro: ro as Record<string, string>,
};

export type Locale = "en" | "de" | "es" | "ro";

export const IntlProvider = ({ children }: { children: ReactNode }) => {
  const { locale } = useLocaleStore();

  return (
    <ReactIntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </ReactIntlProvider>
  );
};
