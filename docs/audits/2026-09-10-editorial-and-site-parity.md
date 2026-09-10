# Editorial and looksawful.ru parity audit — 2026-09-10

## Scope

Reviewed MOVES AWFUL repository documentation and runtime against `looksawful/looksawful-editorial` methodology and the richer `looksawful/looksawful.ru` AnimatedCanvasGallery integration.

The audit order was evidence first, then claim safety, terminology, clarity, visual/runtime boundaries and implementation. Site behavior is reference evidence, not authority to copy site-specific architecture into this standalone repository.

## Editorial method applied

Relevant local routes:

- Editorial source hierarchy and `policies/claims.md`;
- writer -> information/plain-language cleanup -> critic -> factual recheck;
- design terminology governance;
- image-skill orchestrator with the minimum relevant visual set: reference consistency, art direction, UI/web design and visual QA;
- MOVES-specific Canvas runtime and verification skills;
- reviewed vendor guidance for web-animation performance and accessibility.

ComfyUI, Blender, game-asset, advertising and generic image-generation routes were intentionally not applied because they do not own this Canvas-library task. The Editorial image orchestrator explicitly requires the minimum relevant set rather than loading every available skill.

## Direction lock

Preserve:

- Arc/Spiral visual geometry and timing;
- authored default datasets;
- Canvas 2D rendering;
- Vanilla/Vite consumption;
- reduced-motion and viewport behavior;
- explicit mount/dispose API.

Allowed to change:

- lifecycle correctness;
- observable runtime state;
- demo accessibility semantics and responsive shell;
- tests and CI wording;
- documentation accuracy;
- host-page side effects.

Do not backport:

- looksawful.ru Media Catalog identifiers or CMS ownership;
- `.project` selectors or browser-mockup presentation ownership;
- production-only masonry profile;
- React/TypeScript as incidental cleanup;
- a visual redesign hidden inside runtime work.

## Findings and resolution

### Repository claims

**Resolved:** the old README statement that there was no dedicated test suite was stale. The repository now has a dependency-free Node regression suite and CI runs it. README, `AGENTS.md` and verification guidance now describe the actual evidence boundary: modeled lifecycle/state behavior is tested; browser pixels are not.

**Resolved:** `Current public preview` was too strong because `gh-pages` is publication state separate from `master`. The README now says `Published GitHub Pages preview` and explicitly defers source-to-public traceability to #4.

**Resolved:** `reusable` is now materially supported beyond intent because Arc and Spiral accept caller-provided `{ src, title? }` data instead of requiring only module-owned demo media. This does not yet imply a packaged multi-framework component system.

**Resolved:** lifecycle wording is now backed by Node regression evidence for mount/dispose, remount ownership, stale asynchronous completion, invalid replacement mounts, visibility, reduced motion and viewport gating. Browser appearance remains a separate evidence class.

### Runtime correctness

**Resolved with RED -> GREEN evidence:** a newer mount attempt previously validated Canvas/context before claiming the animation key. If the new target was missing or had no 2D context, an older active lifecycle or pending asynchronous mount could survive. Arc and Spiral now claim/invalidate the key before target validation and abort their own pending token safely when the new target cannot start.

**Resolved with RED -> GREEN evidence:** Arc previously injected a global `:root` style element during library mount. The renderer now keeps its effective Inter / 500 / white defaults locally and continues to honor CSS-variable overrides without mutating the host document stylesheet.

**Resolved with RED -> GREEN evidence:** the standalone preview now reuses its existing Arc/Spiral headings as Canvas accessible names and fallback text. Its Arc/Spiral containers scale down responsively instead of forcing an oversized minimum width. This is a structural accessibility/responsive improvement, not a claim of WCAG conformance or visual-browser proof.

**Resolved:** the syntax gate no longer maintains a hand-written list of old test files. `scripts/check-tests.mjs` discovers every `tests/*.test.mjs` file and syntax-checks it; `npm test` remains the behavior gate.

## Portable production-site parity

### Now present in standalone MOVES AWFUL

- Arc and Spiral with caller-provided data;
- stale-mount ownership protection;
- visibility activity gating;
- `prefers-reduced-motion` static rendering without perpetual RAF work;
- `IntersectionObserver` viewport gating with fallback when unavailable;
- observable `loading` / `ready` / `error` state;
- partial-image placeholder behavior;
- dependency-free Node regression coverage for those modeled contracts;
- basic accessible naming/fallback and responsive behavior in the standalone demo.

### Still intentionally open / evidence-gated

- strict typed `MovesAnimatedCanvasGalleryData` / variant core: #6;
- Horizontal, Diagonal, Showcase Diagonal and Masonry as public standalone variants: #5;
- standalone DPR policy/cap: #5, requires browser quality/performance evidence before selecting a default;
- optional keyboard-operable variant tabs if the standalone demo actually needs a variant switcher: #5;
- real-browser smoke/E2E and screenshot evidence for public variants/states: #5;
- React adapter over the future typed core: #7;
- traceable `master` -> `gh-pages` publication path: #4.

The richer site integration remains useful evidence for these candidates, but its presence does not make them supported by the standalone repository until they are implemented and verified here.

## looksawful.ru copy notes

The earlier public-copy findings remain separate from this repository hardening pass:

- keep `Moves Awful` naming consistent;
- prefer the precise public definition `библиотека анимированных галерей` while the project scope remains gallery-focused;
- keep `Canvas` capitalization consistent;
- avoid repeating the same explanatory Moves paragraph across several nearby media entries when the presentation already supplies shared context.

No site copy was silently rewritten as part of this MOVES runtime PR.

## Evidence boundary

GitHub Actions currently proves clean install, high-severity dependency audit, source/test syntax gates, the dependency-free Node regression suite and Vite production build. It does not prove pixel-level browser appearance, real-device DPR quality, browser memory behavior or public Pages parity. Those claims remain unavailable until the corresponding browser/deployment evidence is run.
