import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    // Set brand colors as CSS variables
    root.style.setProperty('--brand-gold', '#FFD700')
    root.style.setProperty('--brand-black', '#000000')
    root.style.setProperty('--brand-white', '#FFFFFF')
    
    // Set additional theme variables
    root.style.setProperty('--brand-gray-100', '#F5F5F5')
    root.style.setProperty('--brand-gray-200', '#E5E5E5')
    root.style.setProperty('--brand-gray-300', '#D4D4D4')
    root.style.setProperty('--brand-gray-400', '#A3A3A3')
    root.style.setProperty('--brand-gray-500', '#737373')
    root.style.setProperty('--brand-gray-600', '#525252')
    root.style.setProperty('--brand-gray-700', '#404040')
    root.style.setProperty('--brand-gray-800', '#262626')
    root.style.setProperty('--brand-gray-900', '#171717')

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      // Set theme-specific colors
      if (systemTheme === "dark") {
        root.style.setProperty('--background', 'var(--brand-black)')
        root.style.setProperty('--foreground', 'var(--brand-gray-100)')
        root.style.setProperty('--primary', 'var(--brand-gold)')
        root.style.setProperty('--muted', 'var(--brand-gray-800)')
        root.style.setProperty('--muted-foreground', 'var(--brand-gray-400)')
        root.style.setProperty('--accent', 'var(--brand-gold)')
        root.style.setProperty('--accent-foreground', 'var(--brand-black)')
      } else {
        root.style.setProperty('--background', 'var(--brand-white)')
        root.style.setProperty('--foreground', 'var(--brand-black)')
        root.style.setProperty('--primary', 'var(--brand-gold)')
        root.style.setProperty('--muted', 'var(--brand-gray-100)')
        root.style.setProperty('--muted-foreground', 'var(--brand-gray-600)')
        root.style.setProperty('--accent', 'var(--brand-gold)')
        root.style.setProperty('--accent-foreground', 'var(--brand-black)')
      }
      return
    }

    root.classList.add(theme)
    // Set theme-specific colors
    if (theme === "dark") {
      root.style.setProperty('--background', 'var(--brand-black)')
      root.style.setProperty('--foreground', 'var(--brand-gray-100)')
      root.style.setProperty('--primary', 'var(--brand-gold)')
      root.style.setProperty('--muted', 'var(--brand-gray-800)')
      root.style.setProperty('--muted-foreground', 'var(--brand-gray-400)')
      root.style.setProperty('--accent', 'var(--brand-gold)')
      root.style.setProperty('--accent-foreground', 'var(--brand-black)')
      root.style.setProperty('--border', 'var(--brand-gray-800)')
      root.style.setProperty('--input', 'var(--brand-gray-900)')
    } else {
      root.style.setProperty('--background', 'var(--brand-white)')
      root.style.setProperty('--foreground', 'var(--brand-black)')
      root.style.setProperty('--primary', 'var(--brand-gold)')
      root.style.setProperty('--muted', 'var(--brand-gray-100)')
      root.style.setProperty('--muted-foreground', 'var(--brand-gray-600)')
      root.style.setProperty('--accent', 'var(--brand-gold)')
      root.style.setProperty('--accent-foreground', 'var(--brand-black)')
      root.style.setProperty('--border', 'var(--brand-gray-200)')
      root.style.setProperty('--input', 'var(--brand-white)')
    }
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
