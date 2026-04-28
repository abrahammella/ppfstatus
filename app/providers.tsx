"use client";

import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { I18nProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

const mantineTheme = createTheme({
  fontFamily: "var(--font-sans)",
  primaryColor: "blue",
  defaultRadius: "md",
});

export function Providers({ children }: { children: React.ReactNode }) {
  // Bridge HeroUI/react-aria's Link/Router behavior with Next's router so that
  // navigation through HeroUI components uses client-side routing.
  useRouter();

  return (
    <I18nProvider locale="es-DO">
      <MantineProvider theme={mantineTheme} defaultColorScheme="light">
        <Notifications position="top-right" />
        {children}
      </MantineProvider>
    </I18nProvider>
  );
}
