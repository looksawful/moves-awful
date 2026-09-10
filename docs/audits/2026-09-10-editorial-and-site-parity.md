# Editorial and looksawful.ru parity audit — 2026-09-10

## Status update

This document began as a point-in-time audit before the later runtime backports on the same date. Preserve the original findings as historical evidence, but read them with the status below.

Resolved after the original audit:

- portable caller items `{ src, title? }` were implemented;
- lifecycle/remount/stale-async behavior received Node behavioral coverage;
- reduced-motion continuous RAF was stopped while preserving static redraw;
- `IntersectionObserver` viewport-proximity gating was implemented with a `50% 0px` root margin and no-observer fallback;
- explicit `loading` / `ready` / `error` state was implemented;
- the README/publication wording and verification model are corrected in the 2026-09-10 editorial deep pass.

Still open:

- deliberate standalone DPR cap/policy;
- real-browser smoke and screenshot evidence;
- selected additional gallery variants, if accepted for the standalone library;
- optional keyboard-accessible demo controls/fallback contract;
- traceable `master` → `gh-pages` publication under issue #4;
- strict TypeScript core and React adapter tracks.

The current deep-pass decision record is `docs/audits/2026-09-10-editorial-deep-pass.md`.

## Scope

Reviewed MOVES AWFUL repository documentation, current project Notion wording, and the production/integration implementation in `looksawful/looksawful.ru` using the looksawful-editorial source hierarchy: facts/evidence first, then terminology, clarity, compression, and claims safety.

## Editorial findings

### Repository README

1. **Resolved.** `deterministic disposal and Vite HMR cleanup` was stronger than the evidence available at the time. Lifecycle ownership is now covered by Node behavioral tests; actual Vite dev-server HMR remains a separate browser evidence layer. Current wording distinguishes those claims.
2. **Resolved.** `Current public preview` was replaced by evidence-safe GitHub Pages/publication wording. Issue #4 still owns source-to-publication traceability.
3. **Resolved in part.** `reusable visual motion experiments` was broad while input was hard-coded. Portable caller items are now implemented, and the README now leads with the narrower `Canvas 2D library for animated gallery layouts` definition.

### Notion project docs

1. **Resolved by deep pass.** `ready for the next small development stage` remains a planning judgement rather than a test result; current Notion state is being reconciled with merged behavioral evidence.
2. **Resolved by deep pass.** `clean baseline` no longer stands in for the current verification model. Current evidence includes high-severity npm audit, syntax, Node behavioral tests and Vite build, while browser/visual proof remains separate.
3. Historical site/copy pages remain non-authoritative for engineering state. This principle is unchanged.

### looksawful.ru public/project copy

1. Three Jestei landing media catalog entries use the exact same title and description. If these captions are surfaced together, the repetition adds no information. Keep a shared reusable description only when UI intentionally de-duplicates it; otherwise give each media use a specific observation or suppress repeated captions at the presentation layer.
2. Keep `Canvas` capitalization consistent. The current Moves project paragraph uses `Canvas-анимации`; retain that form in related media descriptions and future copy.
3. Normalize project naming. Use `Moves Awful` for the project/library name. Avoid switching between generic `библиотека анимаций` and the more precise public definition `библиотека анимированных галерей` unless the broader term is intentionally required.
4. `Для анимаций использовали мою библиотеку Moves Awful` is ownership-safe but vague. Where the surface can support one more clause, name what the library provides: Canvas gallery layouts/variants rather than repeating that it is used “for animations”.
5. The public summary `Библиотека анимированных галерей для лендингов.` is concise and materially more precise than generic “animation library”; use it as the terminology anchor unless project scope expands beyond galleries.

## Site implementation worth bringing back to MOVES AWFUL

The `looksawful.ru` integration demonstrated the following candidate capabilities. Status in the standalone repository is shown inline:

- typed `MovesAnimatedCanvasGalleryData` / `MovesCanvasGalleryVariant` boundary — **not backported; planned typed-core work**;
- six variants: Arc, Spiral, Horizontal, Diagonal, Showcase Diagonal, Masonry — **Arc/Spiral only in standalone; extra variants undecided**;
- data-driven items rather than animation-local hard-coded media ownership — **backported**;
- viewport gating with IntersectionObserver — **backported**;
- reduced-motion activity gating that stops RAF and performs a static redraw — **backported**;
- explicit loading/ready/error state — **backported**;
- DPR cap in the integrated runtime — **not yet backported; requires standalone evidence**;
- keyboard-operable variant tabs with roving tab index — **not yet part of the standalone demo contract**;
- autoplay gating tied to viewport/visibility/reduced motion — **standalone runtime now gates animation activity; demo-tab autoplay is not applicable yet**;
- smoke/E2E coverage for gallery presence and Canvas initialization — **not yet present as real-browser automation in standalone**;
- screenshot-evidence contract tied to variant/state/viewport/source SHA — **not yet present in standalone**.

Do not backport site-specific Media Catalog IDs, browser mockup chrome, global project selectors, CMS/page-copy ownership, or the separate production masonry profile into the standalone library core.

## Evidence boundary

Current standalone Node tests model browser APIs and provide behavioral evidence for lifecycle/state contracts. They do not prove real browser rendering, visual parity, actual dev-server HMR, dense-DPR quality or GitHub Pages freshness. Those remain separate gates.

## External sandbox status

- Replit app creation was attempted and rejected by Replit with `requires_active_subscription`; no Replit app was created.
- No CodePen connector/app is available in the current ChatGPT plugin directory, so an authenticated Pen could not be created from this session.
- These are external integration blockers, not MOVES AWFUL build failures.
