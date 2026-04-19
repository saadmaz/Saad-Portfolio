import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // FIX: Changed from "./" to "/" to support deep linking/sub-routes
  base: "/", 
  server: {
    host: "::",
    port: 8080,
    // No proxy needed - all data fetching goes directly to Firebase SDK.
    // The only HTTP call (/api/contact) is handled by the Vercel serverless
    // function in frontend/api/contact.ts. During local dev, run
    // `vercel dev` from the frontend/ folder to emulate the function locally.
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
