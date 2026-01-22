"use client";

import * as React from "react";

import {
  type ThemeProviderProps,
  useTheme as useNextTheme,
  ThemeProvider as NextThemeProvider,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" {...props}>
      {children}
    </NextThemeProvider>
  );
}

export const useTheme = useNextTheme;
