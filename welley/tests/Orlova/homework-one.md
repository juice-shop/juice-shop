1. 
 - class="mdc-button mat-mdc-button-base close-dialog mdc-button--raised mat-mdc-raised-button mat-primary" //unique element with this class
 - button[aria-label="Close Welcome Banner"] // element with attribute value
 - .button-footer>[aria-label="Close Welcome Banner"]
2. 
 - class="mdc-icon-button mat-mdc-icon-button mat-mdc-button-base search-toggle mat-unthemed" //unique element with this class
 - button[aria-label="Open search"]
 - app-mat-search-bar>button
3. 
 - img[alt="Banana Juice (1000ml)"]
 - div[style*="banana"]
4. 
 - class="mat-expansion-panel mat-elevation-z0 mat-expansion-panel-animations-enabled" //unique element with this class
 - mat-expansion-panel[aria-label="Expand for Reviews"]
 - .container>.mat-expansion-panel
5. 
 - a[routerlink="/about"]
 - mat-nav-list>[routerlink="/about"]
6. 
 - .fi-ua
 - .products-grid>app-product:last-child>mat-card>article>aside.ribbon