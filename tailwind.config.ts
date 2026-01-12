
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        poppins: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        paragraph: "hsl(var(--paragraph))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        "link-primary": "#2530f0",
        "public-card-bg-light": "#ffffff",
        "public-card-border-light": "rgba(37,48,240,0.2)",      
        "public-card-bg-dark": "rgba(255,255,255,0.03)",        
        "public-card-border-dark": "rgba(113,69,185,0.6)",   
        
        

        // tailwind.config.ts (inside theme.extend.colors)
        "input-focus": "#5f4bf6",
        "input-surface": "#F4F1FF",
        "input-surface-dark": "#2A2067",
        "input-placeholder": "#454545",
        "input-placeholder-dark": "#B9C2D5",
        "input-border-brand": "#2530F0",
        "input-border-dark": "#ffffff1a",
        "input-bg-dark": "#ffffff0f",


        // Select tokens
        "select-surface": "#F2EFFF",
        "select-surface-dark": "#191748",
        "select-focus-border": "#9370db",

        "select-pill-border": "rgba(37,48,240,0.10)",
        "select-pill-bg": "rgba(37,48,240,0.07)",
        "select-pill-border-dark": "rgba(255,255,255,0.20)",
        "select-pill-bg-dark": "rgba(255,255,255,0.04)",

        "select-item-focus-bg": "#e1dcf8",
        "select-item-focus-bg-dark": "#0d0b36",

        "text-heading": "#020816",
        "text-muted-dark": "#B9C2D5",
        "brand-magenta": "#A801BA",
        // Security tab tokens
        "border-white-08": "rgba(255,255,255,0.08)",
        "border-white-10": "rgba(255,255,255,0.10)",
        "surface-white-50": "rgba(255,255,255,0.50)",
        "surface-white-06": "rgba(255,255,255,0.06)",
        "brand-blue-07": "rgba(37,48,240,0.07)",
        "brand-blue-10": "rgba(37,48,240,0.10)",
        "surface-white-75": "rgba(255,255,255,0.75)",

      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        "public-card": "0 12px 48px rgba(37,48,240,0.1)",
      },

      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow:
              "0 0 20px rgba(14, 165, 233, 0.6), 0 0 30px rgba(14, 165, 233, 0.4)",
          },
          "50%": {
            opacity: "0.8",
            boxShadow:
              "0 0 40px rgba(14, 165, 233, 0.8), 0 0 50px rgba(14, 165, 233, 0.6)",
          },
        },
        "gradient-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "gradient-flow": "gradient-flow 5s ease infinite",
      },
      backgroundImage: {
        "hero-pattern":
          "radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15) 0%, rgba(10, 10, 35, 0) 50%)",
        "feature-gradient":
          "linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
        "input-glow": "linear-gradient(135deg,#8086F3,#4C55F8,#D971FF)",

      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
