/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-lighter": "#595959",
        "bg-medium": "#424242",
        "bg-dark": "#2b2b2b",
        "bg-darkest": "#212121",
        "text-light": "#d4d4d4",
        "text-highlight": "#9e0000"
      },
    },
  },
  // these are for graph/tooltip colors because the tooltip
  // dynamically colors text
  safelist: [
    'text-[#82acca]',
    'text-[#82ca9d]',
    'text-[#8884d8]',
    'text-[#ffc658]',
    'text-[#ca8282]',
  ],
  plugins: [],
}

