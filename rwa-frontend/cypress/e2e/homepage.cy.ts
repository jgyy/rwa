describe('Homepage E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('displays the homepage', () => {
    cy.contains('Welcome').should('be.visible')
  })

  it('connects wallet when button is clicked', () => {
    // Mock wallet connection
    cy.window().then((win) => {
      win.ethereum = {
        request: cy.stub().resolves(['0x1234567890123456789012345678901234567890']),
        on: cy.stub(),
        removeListener: cy.stub(),
      }
    })

    cy.get('button').contains(/Connect Wallet/i).click()
    
    // Should show connected state
    cy.contains('0x1234...7890').should('be.visible')
  })

  it('navigates to marketplace', () => {
    cy.get('a[href="/marketplace"]').click()
    cy.url().should('include', '/marketplace')
  })

  it('handles responsive menu on mobile', () => {
    cy.viewport('iphone-x')
    
    // Mobile menu should be hidden initially
    cy.get('nav').should('not.be.visible')
    
    // Click hamburger menu
    cy.get('[data-testid="mobile-menu-button"]').click()
    
    // Menu should be visible
    cy.get('nav').should('be.visible')
  })
})