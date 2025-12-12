// vite.react.config.ts
import { defineConfig } from "file:///home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/node_modules/.pnpm/vite@5.4.21_@types+node@20.19.25_lightningcss@1.30.2_terser@5.44.1/node_modules/vite/dist/node/index.js";
import react from "file:///home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_@types+node@20.19.25_lightningcss@1.30.2_terser@5.44.1_/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/node_modules/.pnpm/@tailwindcss+vite@4.1.17_vite@5.4.21_@types+node@20.19.25_lightningcss@1.30.2_terser@5.44.1_/node_modules/@tailwindcss/vite/dist/index.mjs";
import { resolve } from "path";
import dts from "file:///home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.19.25_rollup@4.53.3_typescript@5.9.3_vite@5.4.21_@types+_pvkwyf3rltwp7nwloqsnaui2qm/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/home/arsenal/code/error-mock-test/.worktrees/ui-refactor-tab-structure/packages/ui";
var vite_react_config_default = defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      insertTypesEntry: true,
      include: ["src/react/**/*"],
      outDir: "dist/react"
    })
  ],
  define: {
    "process.env.NODE_ENV": JSON.stringify("production")
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "./src/react")
    }
  },
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/react/index.ts"),
      name: "ErrorMockUIReact",
      formats: ["es"],
      fileName: () => "index.js"
    },
    outDir: "dist/react",
    rollupOptions: {
      // For testing: bundle everything including React
      // For production: uncomment external to reduce bundle size
      // external: ['react', 'react-dom', '@error-mock/core'],
      external: ["@error-mock/core"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    },
    emptyOutDir: false
  }
});
export {
  vite_react_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5yZWFjdC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9hcnNlbmFsL2NvZGUvZXJyb3ItbW9jay10ZXN0Ly53b3JrdHJlZXMvdWktcmVmYWN0b3ItdGFiLXN0cnVjdHVyZS9wYWNrYWdlcy91aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvYXJzZW5hbC9jb2RlL2Vycm9yLW1vY2stdGVzdC8ud29ya3RyZWVzL3VpLXJlZmFjdG9yLXRhYi1zdHJ1Y3R1cmUvcGFja2FnZXMvdWkvdml0ZS5yZWFjdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvYXJzZW5hbC9jb2RlL2Vycm9yLW1vY2stdGVzdC8ud29ya3RyZWVzL3VpLXJlZmFjdG9yLXRhYi1zdHJ1Y3R1cmUvcGFja2FnZXMvdWkvdml0ZS5yZWFjdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAnQHRhaWx3aW5kY3NzL3ZpdGUnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIGR0cyh7XG4gICAgICBpbnNlcnRUeXBlc0VudHJ5OiB0cnVlLFxuICAgICAgaW5jbHVkZTogWydzcmMvcmVhY3QvKiovKiddLFxuICAgICAgb3V0RGlyOiAnZGlzdC9yZWFjdCcsXG4gICAgfSksXG4gIF0sXG4gIGRlZmluZToge1xuICAgICdwcm9jZXNzLmVudi5OT0RFX0VOVic6IEpTT04uc3RyaW5naWZ5KCdwcm9kdWN0aW9uJyksXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3JlYWN0JyksXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9yZWFjdC9pbmRleC50cycpLFxuICAgICAgbmFtZTogJ0Vycm9yTW9ja1VJUmVhY3QnLFxuICAgICAgZm9ybWF0czogWydlcyddLFxuICAgICAgZmlsZU5hbWU6ICgpID0+ICdpbmRleC5qcycsXG4gICAgfSxcbiAgICBvdXREaXI6ICdkaXN0L3JlYWN0JyxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAvLyBGb3IgdGVzdGluZzogYnVuZGxlIGV2ZXJ5dGhpbmcgaW5jbHVkaW5nIFJlYWN0XG4gICAgICAvLyBGb3IgcHJvZHVjdGlvbjogdW5jb21tZW50IGV4dGVybmFsIHRvIHJlZHVjZSBidW5kbGUgc2l6ZVxuICAgICAgLy8gZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ0BlcnJvci1tb2NrL2NvcmUnXSxcbiAgICAgIGV4dGVybmFsOiBbJ0BlcnJvci1tb2NrL2NvcmUnXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6ICdSZWFjdCcsXG4gICAgICAgICAgJ3JlYWN0LWRvbSc6ICdSZWFjdERPTScsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZW1wdHlPdXREaXI6IGZhbHNlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXViLFNBQVMsb0JBQW9CO0FBQ3BkLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGVBQWU7QUFDeEIsT0FBTyxTQUFTO0FBSmhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sNEJBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLElBQUk7QUFBQSxNQUNGLGtCQUFrQjtBQUFBLE1BQ2xCLFNBQVMsQ0FBQyxnQkFBZ0I7QUFBQSxNQUMxQixRQUFRO0FBQUEsSUFDVixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sd0JBQXdCLEtBQUssVUFBVSxZQUFZO0FBQUEsRUFDckQ7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQUEsSUFDdkM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxLQUFLO0FBQUEsTUFDSCxPQUFPLFFBQVEsa0NBQVcsb0JBQW9CO0FBQUEsTUFDOUMsTUFBTTtBQUFBLE1BQ04sU0FBUyxDQUFDLElBQUk7QUFBQSxNQUNkLFVBQVUsTUFBTTtBQUFBLElBQ2xCO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJYixVQUFVLENBQUMsa0JBQWtCO0FBQUEsTUFDN0IsUUFBUTtBQUFBLFFBQ04sU0FBUztBQUFBLFVBQ1AsT0FBTztBQUFBLFVBQ1AsYUFBYTtBQUFBLFFBQ2Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsYUFBYTtBQUFBLEVBQ2Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
