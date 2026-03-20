---
name: accessibility
description: WCAG 2.2 checklist for accessible markup. Always-active rules for every generated interface.
user-invocable: false
---

# WCAG 2.2 Accessibility — Blade/Sage + Tailwind 4

Generated markup MUST be accessible. These rules apply **always**, even during prototyping.

## Layout and units of measurement
- Use relative units (`rem`, `em`, `%`) for spacing, text, and containers — NEVER hardcoded `px`
- Do not add `user-scalable="no"` or `maximum-scale="1"` to the meta viewport
- Layout must work from 320px to 1280px (ensured by mobile-first responsive design)
- Support both portrait and landscape orientation

## Semantic structure
- Use headings (`h1`-`h6`) with **logical hierarchy**: only one `h1` per page, then `h2` for sections, `h3` for sub-sections. Never skip levels
- **Parametric heading level**: in reusable components, use `$headingTag` with a reasonable default for the context
- Use `<ul>`/`<ol>` + `<li>` for lists, `<blockquote>` for quotes
- Use semantic landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`, `<article>`
- Label repeated landmarks with `aria-label` (e.g., `<nav aria-label="Main menu">`)
- Every page has a descriptive `<title>` (managed by WordPress `title-tag`)
- `lang="it"` on `<html>` (managed by `language_attributes()`)
- If a block is in another language: add `lang="en"` on the container element

## Forms
- **Every field MUST have a label** with `for` pointing to the field's `id`
- Required fields: `required` and/or `aria-required="true"`
- Use `autocomplete` for personal data (`name`, `email`, `tel`, `street-address`)
- Group related fields with `<fieldset>` + `<legend>` (e.g., radio group, address)
- Help text associated with `aria-describedby`
- Error messages: associated with the field via `aria-describedby`, use `aria-invalid="true"` on the field

Blade field example:
```blade
<div class="{{PREFIX}}:flex {{PREFIX}}:flex-col {{PREFIX}}:gap-1">
  <label for="email" class="{{PREFIX}}-body-sm {{PREFIX}}:font-medium {{PREFIX}}-content-01">
    {{ __('Email', '{{TEXT_DOMAIN}}') }} <span class="{{PREFIX}}:text-error">*</span>
  </label>
  <input
    id="email"
    type="email"
    required
    autocomplete="email"
    aria-describedby="email-help"
    class="{{PREFIX}}-input"
  />
  <p id="email-help" class="{{PREFIX}}-body-xs {{PREFIX}}-content-03">
    {{ __('Useremo questa email per risponderti.', '{{TEXT_DOMAIN}}') }}
  </p>
</div>
```

Field with error example:
```blade
<input
  id="email"
  type="email"
  required
  aria-invalid="true"
  aria-describedby="email-error"
  class="{{PREFIX}}-input {{PREFIX}}-border-error"
/>
<p id="email-error" role="alert" class="{{PREFIX}}-body-xs {{PREFIX}}:text-error">
  {{ __('Inserisci un indirizzo email valido.', '{{TEXT_DOMAIN}}') }}
</p>
```

## Images and icons
- Informative images: `<img alt="Meaningful description">`
- Decorative images: `<img alt="">` (empty alt, not omitted)
- **Decorative SVGs** (icons in buttons with text): `aria-hidden="true" focusable="false"`
- **Informative SVGs** (standalone icons): `role="img" aria-label="Description"`
- Icon fonts: `aria-hidden="true"` on the icon element
- Visual separators (`vertical-divider`, etc.): ALWAYS `alt=""` — they are decorative

## Tables
- Use `<table>`, `<thead>`, `<th>`, `<tbody>`, `<td>` for tabular data — NEVER for layout
- `<th>` with `scope="col"` or `scope="row"`
- `<caption>` or `aria-labelledby` for the caption (can be hidden with `{{PREFIX}}:sr-only`)

## Keyboard and focus
- **NEVER remove the focus outline** without a visible alternative
- Focus ring: use `--color-focusring` (`#025ecc`)
- Use native elements: `<button>`, `<a>`, `<input>`, `<select>` — NEVER `<div onclick>`
- Tab order must follow the visual order (do not use positive `tabindex` values)
- Only `tabindex="0"` (tabbable) or `tabindex="-1"` (focusable via JS)
- Overlays (modal, dropdown, tooltip): dismissible with Escape
- Focus trap only in modal dialogs
- Component with focus must be at least partially visible
- For interaction patterns: follow [ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/)

## Links
- **Never `<a role="button">`** — use `<a>` for navigation, `<button>` for actions
- If `target="_blank"`: add `<span class="{{PREFIX}}:sr-only">{{ __('(si apre in una nuova finestra)', '{{TEXT_DOMAIN}}') }}</span>`
- Active links/current page: use `aria-current="page"` (not just CSS classes)

## Dynamic content
- Tooltips and popovers: dismissible with Escape, hoverable, persistent
- Status messages (success, loading): `role="status"`
- Urgent alerts (errors, alerts): `role="alert"`
- Interactive components: `aria-expanded`, `aria-controls`, `aria-haspopup` where appropriate

## Colors and contrast
- Do not convey information through color alone — always add a textual or iconographic indicator
- Verify minimum contrast of 4.5:1 for normal text, 3:1 for large text

## Page navigation
- Skip link present in layout (`app.blade.php` — implemented)
- `<iframe>`: always with a descriptive `title` attribute

## Summary rule
- **Interactive** -> focusable, labeled, keyboard-operable
- **Informative** -> described with alternative text or label
- **Decorative** -> hidden from assistive technologies (`aria-hidden="true"`)

## References
- Full checklist: `a11y-checklist.md` (in this skill's directory)
- Known project issues: `docs/a11y-known-issues.md`
