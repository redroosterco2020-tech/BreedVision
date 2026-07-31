import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "فلاک‌لاین — مدیریت اصلاح نژاد طیور",
        short_name: "فلاک‌لاین",
        description: "سامانه مدیریت مولدها، شجره‌نامه و اصلاح نژاد ژنتیکی طیور",
        theme_color: "#161F1A",
        background_color: "#161F1A",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        dir: "rtl",
        lang: "fa",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      }
    })
  ]
});
