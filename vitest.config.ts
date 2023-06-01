/// <reference types="vitest" />
import { defineConfig } from 'vite'
export default defineConfig({
  test: {
    includeSource: ['__tests__/**/*.ts'],
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
  },
})
