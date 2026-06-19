/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Splash / brand gradient
        ink: "#0B0A1F",
        "ink-700": "#15123A",
        brand: {
          DEFAULT: "#6C5CE7",
          light: "#8B7CF6",
          dark: "#4D5FC4",
        },
        // Login card
        card: {
          DEFAULT: "#B3AEBC",
          input: "#E3E1E7",
        },
        // Profile (dark navy) screen
        navy: {
          DEFAULT: "#0E1120",
          card: "#10142A",
          border: "#1F2438",
        },
        rose: "#F472B6",
        mint: "#34D399",
      },
    },
  },
  plugins: [],
};
