export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)", 
        secondary: "rgb(var(--color-secondary) / <alpha-value>)", 
        accent: "rgb(var(--color-accent) / <alpha-value>)", 
        "pixel-blue": "rgb(var(--color-pixel-blue) / <alpha-value>)",
        "background-light": "rgb(var(--color-bg-base) / <alpha-value>)", 
        "background-dark": "rgb(var(--color-bg-base) / <alpha-value>)", 
        "card-light": "rgb(var(--color-bg-surface) / <alpha-value>)", 
        "card-dark": "rgb(var(--color-bg-surface) / <alpha-value>)",
        theme: {
          bgBase: "rgb(var(--color-bg-base) / <alpha-value>)",
          bgSurface: "rgb(var(--color-bg-surface) / <alpha-value>)",
          textMain: "rgb(var(--color-text-main) / <alpha-value>)",
        }
      },
      fontFamily: {
        pixel: ["var(--font-family-pixel)", "monospace"],
      },
      boxShadow: {
        pixel: "4px 4px 0px 0px #000000",
        "pixel-sm": "2px 2px 0px 0px #000000",
        "pixel-lg": "6px 6px 0px 0px #000000",
        "pixel-active": "0px 0px 0px 0px #000000",
      },
      borderWidth: {
        3: "3px",
      },
      backgroundImage: {
        dither: "radial-gradient(#000000 1px, transparent 1px)",
        "dither-white": "radial-gradient(#ffffff 1px, transparent 1px)",
      },
      backgroundSize: {
        dither: "4px 4px",
      },
    },
  },
  plugins: [],
};
