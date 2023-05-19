/// <reference types="vitest" />
import { defineConfig } from 'vite'
export default defineConfig({
  test: {
    includeSource: ['__tests__/**/*.ts'],
    coverage: {
      // you can include other reporters, but 'json-summary' is required, json is recommended
      reporter: ['text', 'json-summary', 'json'],
    },
  },
})
