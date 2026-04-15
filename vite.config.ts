import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Determine which app to build based on APP environment variable
  const app = process.env.APP || "main";
  const isDisplay = app === "display";
  const isControl = app === "control";
  const isMain = app === "main" || !app;

  // Configuration for dev server
  let serverConfig: any = {
    host: "::",
    middlewareMode: false,
  };

  // Determine entry point and root
  let root: string = ".";
  let input: string = "index.html";

  // CRITICAL: Completely isolate each app in development
  if (command === "serve") {
    if (isDisplay) {
      serverConfig.port = 3001; // Display screen on port 3001
      input = "display.html";

      // Create a temporary index override for display-only
      const displayRoot = path.resolve(__dirname);
      root = displayRoot;
    } else if (isControl) {
      serverConfig.port = 3003; // Control screen on port 3003
      input = "control.html";

      // Create a temporary index override for control-only
      const controlRoot = path.resolve(__dirname);
      root = controlRoot;
    } else {
      serverConfig.port = 5173;
      input = "index.html";
      root = ".";
    }
  } else {
    // Production build
    if (isDisplay) {
      input = "display.html";
    } else if (isControl) {
      input = "control.html";
    } else {
      input = "index.html";
    }
  }

  return {
    root,
    server: {
      ...serverConfig,
      // Middleware to isolate each app
      middlewareMode: false,
      hmr: {
        protocol: "ws",
        host: "localhost",
        port: isDisplay ? 3001 : isControl ? 3003 : 5173,
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // For production: build all three separately
      rollupOptions: {
        input:
          command === "serve"
            ? path.resolve(__dirname, input)
            : {
              main: path.resolve(__dirname, "index.html"),
              display: path.resolve(__dirname, "display.html"),
              control: path.resolve(__dirname, "control.html"),
            },
        output: {
          dir: "dist",
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name].[hash].js",
          assetFileNames: "assets/[name].[hash][extname]",
        },
      },
    },
  };
});
