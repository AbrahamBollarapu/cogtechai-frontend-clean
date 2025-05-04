import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '05e9135b-b0fa-4d28-b49e-47f5540478c3', 
     // ← add this line
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // you can hook into events here
    },
  },
});
