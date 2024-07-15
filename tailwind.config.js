/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-lighter": "#595959",
        "bg-medium": "#424242",
        "bg-dark": "#2b2b2b",
        "bg-darkest": "#212121",
        "text-light": "#d4d4d4",
        "text-highlight": "#9e0000",
      },
    },
  },
  // these are for graph/tooltip colors because the tooltip
  // dynamically applies colors to text, so tailwind doesn't know about
  // them at build time
  safelist: [
    "text-[#589dd6]",
    "text-[#87CEEB]",
    "text-[#1E90FF]",
    "text-[#1ca9d9]",
    "text-[#e3a02d]",
  ],
  plugins: [],
};
