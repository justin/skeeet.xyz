/// <reference types="vitest" />
import { defineConfig } from 'vite'
export default defineConfig({
  test: {
    includeSource: ['__tests__/index.test.ts'],
  },
})
