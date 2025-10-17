/**
 * Zentrale Stildefinitionen für die AREMOS-Anwendung
 */

// Farben
export const COLORS = {
  primary: "#121A4C",
  secondary: "#4176A4",
  accent: "#6FA9D2",
  light: "#ECF7FB",
  white: "#FFFFFF",
  success: "#22C55E",
  error: "#EF4444",
  warning: "#F59E0B",
}

// Gemeinsame Komponenten-Styles
export const STYLES = {
  // Hintergrund
  appBackground: {
    backgroundImage: "url(/images/app-background.png)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  },

  // Header-Links
  menuLink: {
    color: COLORS.primary,
  },

  // Buttons
  button: {
    primary: {
      backgroundColor: COLORS.primary,
      color: COLORS.light,
      borderColor: COLORS.primary,
    },
    secondary: {
      backgroundColor: COLORS.secondary,
      color: COLORS.light,
      borderColor: COLORS.secondary,
    },
    accent: {
      backgroundColor: COLORS.accent,
      color: COLORS.light,
      borderColor: COLORS.accent,
    },
  },

  // Container
  container: {
    card: {
      backgroundColor: COLORS.white,
      borderColor: COLORS.primary,
      borderWidth: "2px",
      borderRadius: "0.5rem",
    },
    modal: {
      backgroundColor: COLORS.secondary,
      borderColor: COLORS.primary,
      borderWidth: "4px",
    },
  },

  // Sortier-Button Styles
  sortButton: (active: boolean, focused: boolean) => ({
    backgroundColor: active && !focused ? COLORS.accent : COLORS.primary,
    color: COLORS.light,
    borderColor: COLORS.primary,
  }),

  // Suchfeld Styles
  searchInput: (focused: boolean, hasValue: boolean) => ({
    backgroundColor: focused || hasValue ? COLORS.accent : COLORS.primary,
    color: COLORS.light,
    borderColor: COLORS.primary,
  }),
}

// Utility-Klassen als Strings
export const CLASSES = {
  heading: "font-bold text-4xl mb-8",
  subheading: "font-bold text-2xl mb-4",
  paragraph: "text-base mb-4",
  button: "font-bold px-4 py-2 rounded transition-colors",
  link: "font-bold text-lg transition-colors hover:opacity-80",
  container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  card: "bg-white rounded-lg shadow-md p-6",
  input: "px-4 py-2 rounded border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50",
  gridContainer: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6",
}
