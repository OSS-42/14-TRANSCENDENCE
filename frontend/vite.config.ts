import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig({
  // build: {
  //   outDir: "dist",
  //   rollupOptions: {
  //     input: "./src/main.tsx",
  //     output: {
  //       manualChunks: undefined, // Disable automatic chunk splitting
  //     },
  //   },
  // },
  plugins: [react()],
	appType: 'spa',
  server: {
    watch: {
      // usePolling: true,
    },
    host: true, // Here
    strictPort: true,
    port: 3000,
    hmr: {
      clientPort: 3000,
    },
  },
});
