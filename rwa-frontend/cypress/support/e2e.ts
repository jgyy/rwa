// ***********************************************************
// This file is processed and loaded automatically before test files.
// You can change the location of this file or turn off processing it by setting
// the "supportFile" to false.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add custom commands and overrides here
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevent Cypress from failing tests on uncaught exceptions
  // from the application (e.g., third-party scripts)
  return false
})