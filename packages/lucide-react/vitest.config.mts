import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { vitestWebContainers } from "@webcontainer/test/plugin";

export default defineConfig({
  plugins: [react(), vitestWebContainers()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setupVitest.js',
    browser: {
      enabled: true,
    },
  },
});
