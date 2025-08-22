import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true,
    // Enable SSG
    ssr: true,
    ssrManifest: true,
    // Configure build options
    rollupOptions: {
      input: {
        app: './index.html',
        home: './pages/Home.tsx',
        categories: './pages/Categories.tsx',
        businesses: './pages/BusinessProfile.tsx',
        products: './pages/ProductList.tsx'
      },
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'utils': ['./src/utils/analytics.ts'],
          'components': ['./src/components/OptimizedImage.tsx']
        }
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize assets
    assetsInlineLimit: 4096,
    // Configure CSS optimization
    cssCodeSplit: true,
    // Configure minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Configure preview options
  preview: {
    port: 3000,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  },
  // Configure optimization options
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
});
