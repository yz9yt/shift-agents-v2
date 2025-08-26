// modified by Albert.C Date 2025-08-22 Version 0.01

import { defineConfig } from "@caido-community/dev";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "tailwindcss";
// @ts-expect-error no declared types at this time
import tailwindPrimeui from "tailwindcss-primeui";
import tailwindCaido from "@caido/tailwindcss";
import path from "path";
import prefixwrap from "postcss-prefixwrap";
// @ts-expect-error no types
import tailwindConfig from "./packages/frontend/tailwind.config.js";

const id = "shift-agents-v2";
export default defineConfig({
  id,
  name: "Shift Agents v2",
  description: "Shift Agents v2: Delegate your work to a new generation of Shift Agents",
  version: "2.0.0",
  author: {
    name: "Caido Labs·Reimagined @yz9yt",
    email: "dev@caido.io",
    url: "https://caido.io",
  },
  plugins: [
    {
      kind: "frontend",
      id: "frontend",
      root: "packages/frontend",
      vite: {
        plugins: [vue()],
        build: {
          rollupOptions: {
            external: [
              "@caido/frontend-sdk",
              "@codemirror/state",
              "@codemirror/view",
              "@codemirror/autocomplete",
              "@codemirror/commands",
              "@codemirror/lint",
              "@codemirror/search",
              "@codemirror/language",
              "@lezer/common",
              "@lezer/highlight",
              "@lezer/lr",
            ],
          },
        },
        resolve: {
          alias: [
            {
              find: "@",
              replacement: path.resolve(__dirname, "packages/frontend/src"),
            },
          ],
        },
        css: {
          postcss: {
            plugins: [
              prefixwrap(`#plugin--${id}`),
              tailwindcss({
                ...tailwindConfig,
                corePlugins: {
                  ...tailwindConfig.corePlugins,
                  preflight: false,
                },
                content: [
                  ...tailwindConfig.content,
                  "./packages/frontend/src/**/*.{vue,ts}",
                  "./node_modules/@caido/primevue/dist/primevue.mjs",
                ],
                plugins: [
                  ...(tailwindConfig.plugins || []),
                  tailwindPrimeui,
                  tailwindCaido,
                ],
              }),
            ],
          },
        },
      },
    },
  ],
});
