# MOVES AWFUL deep editorial flow audit — 2026-09-10

## Scope

Audit target: current MOVES AWFUL repository state after the explicit runtime-state contract merged in PR #11.

Method authority: `looksawful/looksawful-editorial` plus current MOVES project canon in Notion. Repository/CI evidence outranks stale project prose. Historical copy is evidence, not authority.

## Editorial flow matrix

| Flow | Applied | Decision |
|---|---:|---|
| Fact / claim extraction | yes | Separate merged behavior, CI evidence, plans and interpretation before wording changes. |
| Claims policy | yes | Do not call browser/deployment behavior verified when only Node/Vite evidence exists. |
| Site/corpus audit | yes | Audit README, AGENTS, verification skill, plans, dated audit, GitHub Issues and Notion current-state pages. |
| Design terminology | yes | Use `Moves Awful` for prose naming; use precise Canvas/runtime/library terms; keep code identifiers unchanged. |
| Editorial writer | yes | Rewrite only after current implementation and issue state are established. |
| Critic | yes | Review factual safety, specificity, role of evidence, redundancy, hierarchy and surface fit. |
| Plain English | yes | Remove vague project-management language and overbroad claims from English technical docs. |
| Infostyle RU | Notion only | Use for Russian project summaries; do not translate English source docs for stylistic consistency. |
| Nora Gal RU | Notion only | Remove bureaucratic/calcified Russian only where Russian prose is edited. |
| Translator | no | No translation task exists in this pass. |
| Behance / resume | no | Wrong surface. Applying them to engineering docs would reduce precision. |
| Image skills | deferred | Become relevant when browser screenshots are produced and evaluated. |

## Evidence snapshot

### Implemented and tested at Node/CI level

- Arc and Spiral expose explicit mount/dispose lifecycle.
- repeated mount replaces prior lifecycle ownership;
- stale asynchronous mounts cannot become active after a newer mount;
- resize, document visibility and reduced-motion behavior are covered by behavioral tests;
- reduced motion avoids a perpetual RAF loop and preserves static redraw;
- `IntersectionObserver` gates continuous RAF by viewport proximity with a `50% 0px` root margin;
- caller-provided portable item input `{ src, title? }[]` is supported while built-in demo datasets remain available;
- explicit `loading / ready / error` state is observable through `canvas.dataset.galleryState`;
- if no image is renderable, the mount reports `error` and does not start RAF;
- high-severity npm audit, syntax checks, Node tests and Vite production build are CI gates.

### Not yet proven by current repository evidence

- visual parity in a real browser across all responsive sizes;
- real dev-server HMR behavior as distinct from the tested remount/dispose invariants;
- screenshot regression evidence tied to source SHA;
- traceable source-to-`gh-pages` publication under issue #4;
- deliberate DPR cap behavior in the standalone library;
- Horizontal, Diagonal, Showcase Diagonal and Masonry as standalone public variants;
- TypeScript core and React adapter.

## Findings requiring correction

### BLOCKER — stale verification model

`README.md`, `AGENTS.md`, `.agents/skills/moves-verification/SKILL.md` and project Notion pages still contain statements that MOVES has no dedicated test suite. That is false after the lifecycle, viewport and state tests were added.

Correction: call them **Node behavioral tests**. Do not upgrade them to browser/E2E evidence.

### WARNING — publication wording

`README.md` calls the Pages URL the current public preview. Issue #4 still exists specifically because `master` → `gh-pages` traceability is not established.

Correction: use **GitHub Pages preview** or **published preview** and explicitly separate source build state from publication state.

### WARNING — stale roadmap

Issue #1 and several Notion roadmap passages still show #2 and #3 as pending. Both are closed with evidence.

Correction: mark the runtime foundation complete and move the active sequence to parity/browser evidence/publication, then typed adapters.

### WARNING — stale parity description

The earlier parity audit says portable items and viewport/state behavior are absent. They are now implemented.

Correction: preserve the dated audit as historical evidence but add a status update that identifies which findings were superseded by later commits.

### WARNING — evidence language around lifecycle

Older wording used `deterministic disposal and Vite HMR cleanup` before a lifecycle test suite existed. Lifecycle ownership is now behaviorally tested, but actual Vite dev-server HMR has not been browser-tested.

Correction: use **tested mount/dispose lifecycle with explicit Vite HMR cleanup hooks**. This says exactly what the evidence proves and no more.

### NOTE — project description

`reusable visual motion experiments` is broad. Current public scope is specifically animated Canvas gallery layouts.

Correction: lead with **Canvas 2D library for animated gallery layouts**. Keep broader “motion experiments” only as secondary project intent if needed.

## Changes intentionally not made in this documentation pass

- no visual parameters, titles or assets changed;
- no framework or TypeScript migration;
- no shared runtime extraction;
- no site Media Catalog IDs or CMS coupling;
- no extra variants copied from the production site without their own evidence;
- no claim that the GitHub Pages preview matches the current source head.

## Runtime follow-up decisions

The production site is useful evidence, not source authority. Its `devicePixelRatio` cap of `1.5`, explicit state, viewport gating and additional variants are candidates. Portable items, state and viewport gating are already backported. DPR should be evaluated next with a small TDD contract because uncapped DPR can multiply Canvas backing-store area substantially on dense displays. Browser evidence should follow before extra variants or typed API expansion.

## Critic pass

After the factual corrections above, the remaining narrative should satisfy:

- every verification claim names the class of evidence;
- completed work is not described as a plan;
- plans are not described as capabilities;
- publication state is not inferred from a source build;
- site integration is evidence for candidate behavior, not a dependency;
- terminology distinguishes Canvas renderer, gallery variant, runtime lifecycle, demo surface and publication state.
