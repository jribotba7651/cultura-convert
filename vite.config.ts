import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Forzar hashes únicos para todos los assets
    rollupOptions: {
      output: {
        // Code splitting estratégico para mejor cache
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-select',
          ],
          'supabase': ['@supabase/supabase-js'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
        // Asegurar nombres únicos con hash
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Generar manifest para tracking de versiones
    manifest: true,
    // Forzar que todos los assets tengan hash (no inline)
    assetsInlineLimit: 0,
  },
}));
