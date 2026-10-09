/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
// import { libInjectCss } from "vite-plugin-lib-inject-css";
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      include: ['src/index.ts', 'src/components'],
      outDir: 'dist',
      insertTypesEntry: true,
      tsconfigPath: path.join(dirname, 'tsconfig.app.json'),
    }),
    visualizer(),
  ],
  build: {
    copyPublicDir: false,
    cssCodeSplit: true,
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      name: 'litmossForm',
      fileName: 'index',
    },
    outDir: 'dist',
    rollupOptions: {
      external: [
        'cyndi/dist/getPrefixNs',
        'classnames',
        'exception-boundary',
        'litmoss-hooks/dist/enum',
        'react',
        'react-dom',
        'react/jsx-runtime',
      ],
      output: [
        {
          manualChunks: (id: string) => {
            if (id.includes('node_modules')) {
              console.log(id);
              return 'vender';
            }
          },
          format: 'es',
          chunkFileNames: 'chunks/[name].[hash].js',
          assetFileNames: 'assets/[name][extname]',
          entryFileNames: '[name].js',
        },
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html', 'clover', 'json-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/stories',
        'src/**/*.test.{ts,tsx}',
        'src/test/**/*.{ts,tsx}',
        'src/**/*.types.ts',
        'src/*.ts',
        'src/pockets',
      ],
      thresholds: {
        statements: 100,
        functions: 100,
        branches: 100,
      },
    },
  },
});
