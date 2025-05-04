// cypress/e2e/submit_quote.cy.ts

describe('Freelancer quote flow', () => {
  beforeEach(() => {
    cy.visit('/login'); // Uses baseUrl from your cypress.config.ts
  });

  it('logs in, gets AI suggestion, sees win %, and submits quote', () => {
    // 1) Log in
    cy.get('input[name=email]').type('freelancer@example.com');
    cy.get('input[name=password]').type('password123');
    cy.get('button[type=submit]').click();
    cy.url().should('include', '/sourcing');

    // 2) Navigate to the first sourcing need
    cy.get('a[href^="/sourcing/"]').first().click();
    cy.url().should('match', /\/sourcing\/[^/]+$/);

    // 3) Open the quote form
    cy.contains('Submit Quote').click();
    cy.url().should('match', /\/sourcing\/[^/]+\/quote$/);

    // 4) Request AI suggestion and win probability
    cy.contains('Get AI Suggestion').click();
    cy.contains('Thinking…').should('exist');
    cy.get('input[type=number]')
      .invoke('val')
      .should('match', /^\d+(\.\d+)?$/);
    cy.contains('Chance to win:').should('exist');

    // 5) Fill notes and submit
    cy.get('textarea').type('Looking forward to working on this.');
    cy.contains('Submit Quote').click();
    cy.url().should('include', '/sourcing');
  });
});
