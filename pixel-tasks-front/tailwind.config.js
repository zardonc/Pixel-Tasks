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
        primary: "#FFD028", // Retro Yellow
        secondary: "#4ADE80", // Retro Green
        accent: "#EF4444", // Retro Red
        "pixel-blue": "#3B82F6",
        "background-light": "#FFF9F0", // Cream
        "background-dark": "#1a1a1a", // Dark Grey
        "card-light": "#FFFFFF",
        "card-dark": "#2d2d2d",
      },
      fontFamily: {
        pixel: ['"VT323"', "monospace"],
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
