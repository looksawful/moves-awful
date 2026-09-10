# Editorial and looksawful.ru parity audit — 2026-09-10

## Scope

Reviewed MOVES AWFUL repository documentation, current project Notion wording, and the production/integration implementation in `looksawful/looksawful.ru` using the looksawful-editorial source hierarchy: facts/evidence first, then terminology, clarity, compression, and claims safety.

## Editorial findings

### Repository README

1. `deterministic disposal and Vite HMR cleanup` is stronger than current evidence. The repository has explicit disposal/HMR code, but no browser/runtime regression suite yet. Prefer `explicit disposal and Vite HMR cleanup` until #3 proves deterministic lifecycle behavior.
2. `Current public preview` can imply parity with current `master`, which is not established while `gh-pages` is separately published. Prefer `GitHub Pages preview` or `published preview`; only call it current after #4 traces deployment to a source SHA.
3. `reusable visual motion experiments` / `reusable` is acceptable as design intent, but portability is currently limited by hard-coded Arc/Spiral assets. Once external item data is supported, the claim becomes materially stronger.

### Notion project docs

1. `ready for the next small development stage` is a project judgement, not a test result. Keep the distinction visible: build-clean baseline, runtime robustness still pending #2/#3/#4.
2. Do not let `clean baseline` imply production-grade Canvas lifecycle evidence. The current verified layer is install + syntax + Vite build.
3. Historical site/copy pages must remain non-authoritative for engineering state; this is already documented correctly.

### looksawful.ru public/project copy

1. Three Jestei landing media catalog entries use the exact same title and description. If these captions are surfaced together, the repetition adds no information. Keep a shared reusable description only when UI intentionally de-duplicates it; otherwise give each media use a specific observation or suppress repeated captions at the presentation layer.
2. Keep `Canvas` capitalization consistent. The current Moves project paragraph uses `Canvas-анимации`; retain that form in related media descriptions and future copy.
3. Normalize project naming. Use `Moves Awful` for the project/library name. Avoid switching between generic `библиотека анимаций` and the more precise public definition `библиотека анимированных галерей` unless the broader term is intentionally required.
4. `Для анимаций использовали мою библиотеку Moves Awful` is ownership-safe but vague. Where the surface can support one more clause, name what the library provides: Canvas gallery layouts/variants rather than repeating that it is used “for animations”.
5. The public summary `Библиотека анимированных галерей для лендингов.` is concise and materially more precise than generic “animation library”; use it as the terminology anchor unless project scope expands beyond galleries.

## Site implementation worth bringing back to MOVES AWFUL

The `looksawful.ru` integration has capabilities absent from the standalone repository:

- typed `MovesAnimatedCanvasGalleryData` / `MovesCanvasGalleryVariant` boundary;
- six variants: Arc, Spiral, Horizontal, Diagonal, Showcase Diagonal, Masonry;
- data-driven items rather than animation-local hard-coded media ownership;
- viewport gating with IntersectionObserver;
- reduced-motion activity gating that stops RAF and performs a static redraw;
- explicit loading/ready/error state;
- DPR cap in the integrated runtime;
- keyboard-operable variant tabs with roving tab index;
- autoplay gating tied to viewport/visibility/reduced motion;
- smoke/E2E coverage for gallery presence and Canvas initialization;
- screenshot-evidence contract tied to variant/state/viewport/source SHA.

Do not backport site-specific Media Catalog IDs, browser mockup chrome, global project selectors, or the separate production masonry profile into the standalone library core.

## External sandbox status

- Replit app creation was attempted and rejected by Replit with `requires_active_subscription`; no Replit app was created.
- No CodePen connector/app is available in the current ChatGPT plugin directory, so an authenticated Pen could not be created from this session.
- These are external integration blockers, not MOVES AWFUL build failures.
