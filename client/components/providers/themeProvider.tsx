"use client";
import { FC } from "react";
import { ThemeProvider } from "next-themes";
import { NextUIProvider } from "@nextui-org/react";

interface NextThemeProviderProps {
  children: React.ReactNode;
}

const NextThemeProvider: FC<NextThemeProviderProps> = ({ children }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <NextUIProvider>{children}</NextUIProvider>
    </ThemeProvider>
  );
};

export default NextThemeProvider;
