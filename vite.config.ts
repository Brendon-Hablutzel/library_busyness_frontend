import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: "/library_busyness_frontend",
    plugins: [react()],
    define: {
      "process.env.REACT_APP_API_URL": JSON.stringify(env.REACT_APP_API_URL),
    },
    css: {
      postcss: {
        plugins: [tailwindcss()],
      },
    },
  };
});
