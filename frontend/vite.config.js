import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://bds-wxc4.onrender.com",
        changeOrigin: true,
      },
    },
  },
});
