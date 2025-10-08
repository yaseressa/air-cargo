import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  return {
    preview: {
      host: "fms-web.onrender.com",
      allowedHosts: ["fms-web-latest.onrender.com"],
    },
    define: {
      global: "window",
    },
    optimizeDeps: {
      include: ["sockjs-client"],
    },
    server: {
      port: 80,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@assets": path.resolve(__dirname, "./src/assets"),
        "@components": path.resolve(__dirname, "./src/components"),
      },
    },
    plugins: [react()],
  };
});
