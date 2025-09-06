/// <reference types="cypress" />

// Custom commands for RWA platform testing

// Command to connect wallet
Cypress.Commands.add('connectWallet', (address = '0x1234567890123456789012345678901234567890') => {
  cy.window().then((win) => {
    win.ethereum = {
      request: cy.stub().as('ethereumRequest').resolves([address]),
      on: cy.stub(),
      removeListener: cy.stub(),
      isMetaMask: true,
    }
  })
  cy.get('button').contains(/Connect Wallet/i).click()
})

// Command to login
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
  cy.url().should('not.include', '/login')
})

// Command to mock API responses
Cypress.Commands.add('mockAPI', (endpoint: string, response: any) => {
  cy.intercept('GET', `**/api/${endpoint}`, response).as(`get${endpoint}`)
  cy.intercept('POST', `**/api/${endpoint}`, response).as(`post${endpoint}`)
})

// TypeScript declarations
declare global {
  namespace Cypress {
    interface Chainable {
      connectWallet(address?: string): Chainable<void>
      login(email?: string, password?: string): Chainable<void>
      mockAPI(endpoint: string, response: any): Chainable<void>
    }
  }
}

export {}