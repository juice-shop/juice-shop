describe('Search Result Accessibility', () => {
 beforeEach(() => {
    // 1. Set cookies to hide the banners automatically
    cy.setCookie('welcomebanner_status', 'dismiss');
    cy.setCookie('cookieconsent_status', 'dismiss');
    
    // 2. Visit the home page
    cy.visit('/');
  });
  it('allows opening product details via keyboard (Tab + Enter)', () => {
    // 1. Click the magnifying glass icon to open the search bar
    cy.get('mat-icon').contains('search').click();

    // 2. Type "Apple Juice" into the input box and press ENTER
    cy.get('#searchQuery').type('Apple Juice{enter}');

    // 3. Wait for "Apple Juice" to appear in the results
    cy.contains('mat-card', 'Apple Juice (1000ml)').as('targetProduct');

    // 4. Verify your fix (tabindex="0") is present
    cy.get('@targetProduct').find('.product').should('have.attr', 'tabindex', '0');
    cy.get('@targetProduct').find('.product').should('have.attr', 'role', 'button');

    // 5. Simulate pressing "Enter" on the product to open details
    cy.get('@targetProduct').find('.product').trigger('keydown', { key: 'Enter' });

    // 6. Verify the Product Details Dialog opened
    cy.get('mat-dialog-container').should('be.visible');
    cy.contains('mat-dialog-container', 'Apple Juice (1000ml)').should('be.visible');
  });

 
});