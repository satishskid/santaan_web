# Agent Instructions

## Package Manager
- Use **npm**: `npm install`, `npm run dev`, `npm run lint`

## Skill Routing
- At task start, select and invoke relevant skills from the available catalog
- If unsure which applies, invoke `skill-router` before coding
- For multi-layer features (design+frontend+backend), start with an orchestration skill

## File-Scoped Commands
| Task | Command |
|------|---------|
| Lint file | `npx eslint path/to/file.ts` |
| Test file (Playwright) | `npx playwright test tests/path.spec.ts` |

## Key Conventions
- App Router lives in `src/app`
- Shared UI in `src/components`
- Data access in `src/db` (Drizzle) and schema/migrations in `drizzle/`
- Server/client helpers in `src/lib` and `src/services`
- Content and static data in `src/content` and `src/data`

## Commit Attribution
- AI commits MUST include:
```
Co-Authored-By: <model name> <noreply@example.com>
```
