# Vendor skills

MOVES AWFUL keeps project-specific rules in `AGENTS.md` and `.agents/skills/`. Generic skills are installed on demand from reviewed upstream projects instead of copying their files into this repository.

The authoritative selection lives in `registry.yaml`. The versions reviewed by `looksawful.ru` are pinned below so an agent should not silently substitute `latest`:

- `MengTo/Skills` @ `321c769739b823de5eb94eb3a52aa1974fe783a2` — `agent-skills/codex/optimize-web-animations`;
- `addyosmani/web-quality-skills` @ `afa8da942115f2961fdbfa80807ea0b232ff6c00` — `skills/accessibility`;
- `lobehub/lobehub` @ `906b10e03029648655e0257bda4f785a9e0973f0` — `.agents/skills/typescript`.

## Install policy

Install only the skill needed by the current task into the agent's user-level skill directory or another environment-supported external skill directory. Do not commit installed vendor copies into MOVES AWFUL.

Repository-local rules always win over vendor guidance. In particular, vendor skills may not authorize visual changes, renderer migration, framework adoption, asset replacement, or shared-runtime extraction that the current MOVES AWFUL task did not request.

If an agent environment provides a skill catalog/installer, prefer installing by the `catalog_id` in `registry.yaml`. Otherwise use the upstream repository and pinned revision above. Record a different revision explicitly before using it; do not silently track a moving branch.

## Routing

- animation CPU/GPU, RAF, offscreen work, observers, cleanup, reduced motion → `optimize-web-animations`;
- keyboard, Canvas fallback, reduced motion, accessible names/state → `accessibility`;
- JS→TS port, public contracts, React-adapter types → `typescript`.

Do not install the full skill inventories from `looksawful.ru` or these upstream repositories. This project needs a small routing surface, not a second operating system.
