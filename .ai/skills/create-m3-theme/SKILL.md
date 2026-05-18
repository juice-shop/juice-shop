---
name: create-m3-theme
description: Instructions for creating and integrating a new Angular Material M3 theme into OWASP Juice Shop.
---

# Skill: Creating a new Angular Material M3 theme

This skill provides instructions for creating and integrating a new Angular Material M3 theme into OWASP Juice Shop.

## Steps

### 1. Define the M3 Theme in SCSS
Add the new theme definition to `frontend/src/styles/theme.scss` and include it in `frontend/src/styles.scss` to apply essential overrides and customizations.

- **Simple Themes**: Use standard Material palettes for primary and tertiary colors.
  
  **In `frontend/src/styles/theme.scss`**:
  ```scss
  $mytheme-config: (
    color: (
      theme-type: light, // or dark
      primary: mat.$violet-palette,
      tertiary: mat.$purple-palette,
    )
  );
  $mytheme-theme: mat.define-theme($mytheme-config);
  .mytheme-theme {
    @include mat.theme($mytheme-config);
    color: var(--mat-sys-on-surface);
    background-color: var(--mat-sys-surface);
  }
  ```

  **In `frontend/src/styles.scss`**: Use the `theme-overrides` mixin for standard colors.
  ```scss
  .mytheme-theme {
    @include custom-components-theme($mytheme-theme);
    @include css-vars($mytheme-theme);
    @include theme-overrides(#navColor, #bgColor, #primLight, #textColor);
  }
  ```

- **Complex/Customized Themes**: Use manual overrides in `frontend/src/styles.scss` to achieve a more unique look (e.g., `bluegrey-lightgreen`).
  
  **In `frontend/src/styles/theme.scss`**: Define the basic theme config and class similarly to simple themes.
  
  **In `frontend/src/styles.scss`**: Provide manual CSS variable and component-specific overrides instead of using the `theme-overrides` mixin.
  Example:
  ```scss
  .my-complex-theme {
    @include custom-components-theme($my-complex-theme);
    @include css-vars($my-complex-theme);

    // Manual overrides for background, text, and Material system tokens
    --theme-background: #3e3e3e;
    --mat-sys-surface: #333638;
    --mat-sys-on-surface: #e8ecef;
    ...

    // Component-specific alignment
    .mat-mdc-toolbar, mat-toolbar { ... }
    .mat-mdc-card, .mat-expansion-panel { ... }
    ...
  }
  ```

### 2. Update Configuration Schema
Add the new theme name to the `enum` of the `application.theme` property in `config.schema.yml`.

### 3. Update Default Configuration
Mention the new theme in the `# Options:` comment for `application.theme` in `config/default.yml`.

### 4. Add Legacy Version
Add a corresponding entry to the `themes` object in `views/themes/themes.ts`. These colors are used for server-side rendered pages and legacy UI elements. Choose hex colors that closely match the new M3 theme's primary and surface colors.

- **bgColor**: Background color of the page.
- **textColor**: Main text color.
- **navColor**: Color for the navigation bar.
- **primLight**: A lighter shade of the primary color.
- **primDark**: A darker shade of the primary color.

Example:
```typescript
'mytheme': {
  bgColor: '#FAFAFA',
  textColor: '#000000',
  navColor: '#7B1FA2',
  primLight: '#9C27B0',
  primDark: '#4A148C'
}
```

## Note
This skill is specifically for the application's UI themes and is unrelated to the internal Chatbot's skills.
