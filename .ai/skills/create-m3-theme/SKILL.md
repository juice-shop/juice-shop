---
name: create-m3-theme
description: Instructions for creating and integrating a new Angular Material M3 theme into OWASP Juice Shop.
---

# Skill: Creating a new Angular Material M3 theme

This skill provides instructions for creating and integrating a new Angular Material M3 theme into OWASP Juice Shop.

## Repository Targets & Scope

- `frontend/src/styles/theme.scss` (M3 theme definition and base style inclusion)
- `frontend/src/styles.scss` (Component theme overrides and CSS variable declarations)
- `lib/config.schema.ts` (Enum list of supported themes in `ApplicationSchema`)
- `config/default.yml` (Documentation comments listing selectable theme names)
- `views/themes/themes.ts` (Server-side rendered / legacy color palette definition)

## Source-of-Truth & Data Handling Rules

- **Design System**: Angular Material M3 theming specification and system tokens (`--mat-sys-*`) are the source of truth for UI color definitions.
- **Theme Enum Registry**: `lib/config.schema.ts` is the authoritative source for valid application theme names accepted by configuration parsers.
- **SSR Palette Baseline**: `views/themes/themes.ts` is the canonical source for server-rendered fallback palettes.

## Change Boundaries

- **Allowed Changes**:
  - Adding the new theme definition in `frontend/src/styles/theme.scss`.
  - Adding class-scoped mixin invocations and variable overrides in `frontend/src/styles.scss`.
  - Adding the theme key to the `theme` enum in `lib/config.schema.ts`.
  - Adding the theme key to `# Options:` comment in `config/default.yml`.
  - Adding matching hex colors to the `themes` dictionary in `views/themes/themes.ts`.
- **Forbidden Changes**:
  - Modifying or renaming existing theme configurations.
  - Altering theme-switching services, navigation components, or local storage persistence logic.
  - Modifying Angular build configuration or dependencies.

## Ambiguity & Unmappable Source Handling

- **Non-Standard Palettes**: If requested colors do not align with standard Angular Material palettes (`mat.$<color>-palette`), use the complex theme pattern with manual CSS variable overrides (`--mat-sys-*`).
- **Naming Conventions**: Use lowercase kebab-case or single-word identifiers (e.g. `deepsea`, `bluegrey-lightgreen`) consistent with existing theme keys.

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
Add the new theme name to the `theme` enum in `ApplicationSchema` in `lib/config.schema.ts`.

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

## Verification Expectations

- **Code Style & Linting**: Run `npm run lint` to verify that all TypeScript and SCSS changes follow project style conventions.
- **Frontend Test Suite**: Run `npm run test:frontend` to ensure the new theme integration does not cause compilation failures or regression in Angular unit tests.
- **Identifier Consistency Check**: Verify that the exact theme name string matches across `theme.scss`, `styles.scss`, `lib/config.schema.ts`, `config/default.yml`, and `views/themes/themes.ts`.

## Note
This skill is specifically for the application's UI themes and is unrelated to the internal Chatbot's skills.
