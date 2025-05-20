"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemeProvider,
  useTheme as useNextTheme,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class" {...props}>
      {children}
    </NextThemeProvider>
  );
}

export const useTheme = useNextTheme;
