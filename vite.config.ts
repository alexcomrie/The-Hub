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
      "scheduler": path.resolve(import.meta.dirname, "node_modules", "scheduler"),
      "wouter": path.resolve(import.meta.dirname, "node_modules", "wouter"),
      "regexparam": path.resolve(import.meta.dirname, "node_modules", "regexparam"),
      "react": path.resolve(import.meta.dirname, "node_modules", "react"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules", "react-dom"),
      "react-router-dom": path.resolve(import.meta.dirname, "node_modules", "react-router-dom"),
      "@emotion/react": path.resolve(import.meta.dirname, "node_modules", "@emotion/react"),
      "@emotion/styled": path.resolve(import.meta.dirname, "node_modules", "@emotion/styled"),
      "@mui/material": path.resolve(import.meta.dirname, "node_modules", "@mui/material"),
      "framer-motion": path.resolve(import.meta.dirname, "node_modules", "framer-motion"),
      "react-helmet": path.resolve(import.meta.dirname, "node_modules", "react-helmet"),
      "zod": path.resolve(import.meta.dirname, "node_modules", "zod"),
      "use-sync-external-store/shim/index.js": path.resolve(import.meta.dirname, "node_modules", "use-sync-external-store", "shim", "index.js"),
      "use-sync-external-store/shim": path.resolve(import.meta.dirname, "node_modules", "use-sync-external-store", "shim"),
      "use-sync-external-store": path.resolve(import.meta.dirname, "node_modules", "use-sync-external-store")
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'scheduler', 
      'wouter', 
      'regexparam',
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      'framer-motion',
      'react-helmet',
      'zod',
      'use-sync-external-store',
      'use-sync-external-store/shim',
      'use-sync-external-store/shim/index.js'
    ]
  },
  root: path.resolve(import.meta.dirname, "client"),
  ssr: {
    noExternal: ['react', 'react-dom', 'react/jsx-runtime', 'use-sync-external-store', 'use-sync-external-store/shim', 'use-sync-external-store/shim/index.js']
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/client"),
    emptyOutDir: true,
    // Disable SSR to resolve bare module specifier errors
    ssr: false,
    // Configure build options
    rollupOptions: {
      input: {
        app: path.resolve(import.meta.dirname, 'client/index.html'),
        home: path.resolve(import.meta.dirname, 'lib/pages/Home.tsx'),
        categories: path.resolve(import.meta.dirname, 'lib/pages/Categories.tsx'),
        businesses: path.resolve(import.meta.dirname, 'lib/pages/BusinessProfile.tsx'),
        products: path.resolve(import.meta.dirname, 'lib/pages/ProductList.tsx')
      },
      output: {
        manualChunks: {
          'utils': ['./lib/utils/analytics.ts'],
          'components': ['./lib/components/OptimizedImage.tsx']
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
  
});
