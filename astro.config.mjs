import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    markdown: {
        shikiConfig: {
          // Enable word wrap to prevent horizontal scrolling
          // wrap: true,
        },
      },
});
