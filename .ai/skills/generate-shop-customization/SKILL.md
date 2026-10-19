---
name: generate-shop-customization
description: Instructions for generating a new Juice Shop customization YAML config in /config from one or more public product-source URLs plus business/branding context (shop name, social handles, favicon, etc.), minimizing the need for manual fine-tuning afterward.
---

# Skill: Generating a Juice Shop Customization Config

This skill produces a ready-to-run customization file in `/config/<name>.yml` that re-skins OWASP Juice Shop as a fictional/branded shop, sourcing product data (names, descriptions, prices, images) by crawling one or more user-supplied public URLs, and applying the business context (name, domain, social handles, contact emails, favicon, avatars) the user provides.

## Repository Targets & Scope

- **Primary Target**: A new `config/<name>.yml` file (name derived from the shop/company name, kebab-case or short handle, e.g. `kn.yml`).
- **Reference Sources (read-only)**: `config/default.yml` (canonical defaults, all required special products/memories, schema comments), `lib/config.schema.ts` (`ApplicationSchema`, `ProductSchema`, `MemorySchema`, `ValidationSchema` — the authoritative field list/types), `lib/startup/validateConfig.ts` (authoritative rules for which special products/memories are mandatory and mutually exclusive).
- **Do not modify**: application source code, other existing `config/*.yml` files, i18n files, or `lib/config.schema.ts` itself.

## Source-of-Truth & Data Handling Rules

- **Schema is law**: Only emit keys that exist in `ApplicationSchema`/`ProductSchema`/`MemorySchema` in `lib/config.schema.ts`. Never invent new keys.
- **Pure Server-Side URLs (Non-Browser Client Compatibility)**: All URLs for images, downloadable resources, and other referenced assets across the entire customization (`application.logo`, `application.favicon`, `chatBot.avatar`, `hackingInstructor.avatarImage`, product `image`, memory `image`, `recyclePage.topProductImage`, `recyclePage.bottomProductImage`, and challenge-related URLs) must be pure server-side URLs directly resolvable over HTTP/HTTPS by non-browser clients (e.g. backend scrapers, `curl`, Node.js request libraries).
  - Never use URLs containing fragment identifiers (`#`) or client-side routing/anchor hashes (e.g. `https://example.com/assets#logo.png` or SPA routes), because non-browser clients do not evaluate client-side fragments and such requests will fail or return incorrect resources.
  - Every resource and image URL must point directly to the pure server-side asset endpoint without requiring client-side JavaScript execution or anchor navigation.
- **Product data**: Crawl the user-provided URL(s) (product catalog, brochure, wiki, etc.) for real product names, short descriptions, and prices. Never fabricate prices or descriptions not derivable from the source — if a price is missing, pick a plausible one only after telling the user you did so, or ask.
- **Business context**: Name, domain, social handles, contact email, favicon, logo, avatar, chatbot persona, and challenge product overrides must come from what the user explicitly supplies. Do not invent social handles, emails, or domains.
- **default.yml is the fallback library**: For every "special" product/memory the schema requires (see below), if the crawled source has no equivalent, reuse the exact `default.yml` entry for that special role rather than inventing new copy.

## Non-Negotiable Validity Rules (avoids `npm run lint:config` failures)

`lib/startup/validateConfig.ts` enforces these — get them right the first time:

1. **≥ 4 products, ≥ 2 memories** total.
2. Exactly **one** product must carry each of these keys (all four are mandatory, none may be duplicated or combined on the same product):
   - `useForChristmasSpecialChallenge: true`
   - `urlForProductTamperingChallenge: '<url>'`
   - `fileForRetrieveBlueprintChallenge: '<file>'` **and** `exifForBlueprintChallenge: [<hint>]` (both required together)
   - `keywordsForPastebinDataLeakChallenge: [<keyword>, ...]`
   - A single product must never combine two of these special keys.
3. Exactly **one** memory must carry `geoStalkingMetaSecurityQuestion` + `geoStalkingMetaSecurityAnswer`, and exactly one other memory must carry `geoStalkingVisualSecurityQuestion` + `geoStalkingVisualSecurityAnswer`. Neither of these two memories may have a `user` field set (or if set, it must be `john`/`emma` respectively — simplest is to omit `user` entirely on these two).
4. If `challenges.restrictToTutorialsFirst: true`, then `hackingInstructor.isEnabled` must not be `false`.
5. If `ctf.showFlagsInNotifications: true` is set, `challenges.showSolvedNotifications` must not be `false`; if `ctf.showCountryDetailsInNotifications` is `name`/`flag`/`both`, `ctf.showFlagsInNotifications` must be `true`.

**Simplest safe approach**: Rebrand the four `default.yml` special products in place (same special key, new name/description/image/price) rather than dropping them, and keep the two geo-stalking `default.yml` memories verbatim (or reskinned without a `user` field). This guarantees challenge-solvability without needing to hunt for real-world equivalents of "Christmas box" or "pastebin leak" products.

## Image Rules (this is where most manual fine-tuning was previously needed — get it right up front)

- **Pure server-side URLs**: Every image and downloadable asset URL (`logo`, `favicon`, `avatar`, product images, memory images, recycle page images) must be a pure server-side URL with no `#` fragments or client-side anchor identifiers, guaranteeing that non-browser clients can download and process the asset directly.
- **Mandatory External Image URLs for Custom Catalog Products**:
  - Every custom product in the catalog MUST have a real, publicly resolvable HTTP/HTTPS image URL (e.g. hosted on the target brand's CDN or public media storage).
  - **NEVER** use local asset filenames (such as `orange_juice.jpg`, `fruit_press.jpg`, `banana_sub.jpg`, `apple_juice.jpg`, or `undefined.jpg`) for new/custom products.
  - **NEVER** invent or guess nonexistent local image filenames.
  - Local asset filenames (e.g., `3d_keychain.jpg`, `undefined.jpg`) are ONLY permissible for the specific built-in challenge special products (`useForChristmasSpecialChallenge`, `fileForRetrieveBlueprintChallenge`, `keywordsForPastebinDataLeakChallenge`, `urlForProductTamperingChallenge`) when retaining default challenge artifacts.
- **`recyclePage.topProductImage` and `bottomProductImage`**: Must also use real public HTTP/HTTPS URLs from the crawled source catalog (e.g., equipment, presses, juicers, packaging, or raw produce photos) rather than default local filenames like `fruit_press.jpg` or `apple_pressings.jpg`.
- **Square-only assets**: `application.logo`, `chatBot.avatar`, and `hackingInstructor.avatarImage` are rendered **circular** (`border-radius: 50%`) in the UI (navbar, chat widget, hacking-instructor tutorials, score-board challenge cards). Any non-square source image will look cropped/distorted.
  - Before selecting a logo/avatar URL, check the image's actual aspect ratio (fetch and inspect dimensions, or infer from context, e.g. `og:image`, favicon, square brand mark, profile picture). Prefer a square brand mark, app icon, or profile photo over a wide horizontal logo lockup.
  - If only a non-square logo is available, prefer a square crop/icon variant of the same brand (e.g. a favicon, app icon, or square social profile image) over the wide logo — do not just reuse the wide logo for `chatBot.avatar`/`hackingInstructor.avatarImage`.
  - `application.favicon` must be a `.ico` file or a URL to one; if the company only has a `.png`/`.svg` icon, say so and ask the user to confirm, or fall back to Juice Shop's default favicon rather than guessing. Prefer direct CDN or static media storage URLs (e.g. `https://cdn.example.com/favicon.ico`) rather than apex root domain URLs if the root domain has bot/WAF protections that return HTTP 403 Forbidden to automated downloaders.
- **Wikimedia Commons Thumbnail URLs**: When using thumbnail image URLs from Wikimedia Commons, always use standard supported thumbnail pixel sizes (e.g. `500px-*.png` or `800px-*.png`). Non-standard widths (like `512px`) will be rejected by Wikimedia servers with HTTP 400.
- **Product image aspect ratios**: No strict shape constraint, but prefer images the source site already displays as product photos (consistent aspect ratio across the catalog looks best on the product grid).

## Fictional-Reviewer Homage Convention

`default.yml` seeds several product reviews with authors that are subtle references to `jim` (Star Trek's Captain James T. Kirk) and `bender` (Futurama's Bender Bending Rodríguez) — e.g. `{ text: 'Fresh out of a replicator.', author: jim }`, `{ text: 'Fry liked it too.', author: bender }`. Preserve this homage in every generated customization:

- Give at least **one product a review with `author: jim`** and at least **one product a review with `author: bender`** (can be the same product or different ones; using 2 different products is preferable).
- Write the review **text** to thematically fit the shop's product/brand context while still subtly nodding to the character's origin (sci-fi/space references for `jim`, robot/futuristic-slacker references for `bender`) — don't just copy the `default.yml` wording verbatim, adapt it to the new product. See `kn.yml` for an applied example (`author: jim` review on a pilot jacket referencing "away mission" and "class-M planet"; `author: bender` review on a cap referencing an "antenna").
- Do not explain the reference in the review text itself — keep it subtle, as in the originals.

## Steps

1. **Gather inputs**: shop/company name, domain (for generated user emails), theme color pick (from `lib/config.schema.ts` theme enum), social handles/URLs, contact email(s), favicon source, logo source, chatbot persona name + sample questions, and the one-or-more product-source URL(s).
2. **Crawl product source(s)**: Fetch each URL, extract a product catalog: name, short description, price, and a direct, publicly downloadable HTTP/HTTPS image URL for each item (hosted on the site's CDN/media store, ensuring all URLs are pure server-side URLs without `#` or client-side fragments). Aim for enough real products to make the shop feel populated (default.yml ships ~30); at minimum meet the 4-product floor plus the mandatory specials.
3. **Rebrand mandatory specials**: Take the 4 special products from `default.yml` and reskin name/description/image/price to fit the shop's theme while preserving their special key (and required extra keys) verbatim. Same for the 2 geo-stalking memories (reskin caption/image, keep question/answer keys, drop or keep-neutral the `user` field).
4. **Select square images** for `application.logo`, `chatBot.avatar`, `hackingInstructor.avatarImage` per the Image Rules above, verifying that all selected URLs are direct, pure server-side URLs without `#` fragments.
5. **Fill `application` section**: `domain`, `name`, `logo`, `favicon`, `theme`, `altcoinName`, `privacyContactEmail`, `customMetricsPrefix` (lowercase single word), `chatBot`, `social` (only set handles the user actually provided; use `~` for the rest, matching `default.yml`'s null-able fields), `recyclePage` (using valid external HTTP/HTTPS image URLs), `welcomeBanner` (optional), `cookieConsent`, `securityTxt`.
5b. **`challenges.overwriteUrlForProductTamperingChallenge`**: point at a real, brand-relevant URL (e.g. company's GitHub org, careers page) if the user wants deeper theming; otherwise omit. Ensure any specified challenge URL is a pure server-side URL without `#` fragments.
6. **Assemble `products:`** — real catalog items first with external HTTP/HTTPS image URLs, rebranded specials mixed in naturally (don't cluster them all at the bottom, but do preserve at least the "Required by ... challenge" comment style used in `default.yml` for traceability). Include the `jim`/`bender` homage reviews per the convention above.
7. **Assemble `memories:`** — a few real/plausible photo-wall entries (with `user` if desired) plus the two rebranded geo-stalking entries (no `user`, or a neutral one not used elsewhere).
8. **Write `config/<name>.yml`**, matching `default.yml`'s YAML formatting/quoting conventions (single-quoted strings with special chars, `~` for null, inline `{ text: ..., author: ... }` for reviews).

## Ambiguity & Unmappable Source Handling

- Missing price/description on the source page: ask the user rather than guessing a number that could mislead a training audience.
- No usable square image for logo/avatar found anywhere: tell the user explicitly which asset needs a manual square crop, instead of silently using a stretched wide logo.
- Source asset URL contains `#` or requires client-side routing/scripts: locate or construct the underlying direct server-side static asset URL, or select an alternative direct asset URL rather than using a URL with `#` fragments.
- Source URL yields fewer than 4 usable products: supplement with default.yml's generic products (further rebranded, or left as-is) rather than inventing products with no real source backing.
- Unclear which product should map to which mandatory special (Christmas box, tampering, blueprint, pastebin leak): pick the best thematic fit (e.g., a "limited/holiday" item for Christmas, a "security/tooling" item for Product Tampering) and state the mapping choice to the user.

## Verification Expectations

- Run `npm run lint:config` (validates all `config/*.yml`, including the new file, against `ValidationSchema`) and fix any reported schema errors.
- Manually re-check: exactly one product per special key, exactly one memory per geo-stalking pair, ≥4 products, ≥2 memories.
- Confirm all custom products and `recyclePage` entries have valid, downloadable external HTTP/HTTPS image URLs (never local filenames or made-up filenames).
- Confirm at least one product review uses `author: jim` and at least one uses `author: bender` (Star Trek / Futurama homage).
- Confirm logo/chatBot.avatar/hackingInstructor.avatarImage are square images (or explicitly flag to the user which ones are not and why).
- Confirm all image, resource, and challenge URLs are pure server-side URLs (no `#` or client-side fragments) so that non-browser clients and automated scripts will not experience fetch or parsing errors.
- Start the shop with `NODE_ENV=<name> npm start` (or point the user to this command) to visually confirm branding, then leave further visual polish to the user.
- No frontend/server test suites need to run for a config-only change; skip `npm test` unless application code was also touched.
