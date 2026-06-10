# Allbirds Storefront

Interactive Allbirds-style e-commerce storefront built with React, Vite, and TypeScript. The project is intended to integrate with a local Payload CMS backed by SQLite for dynamic content.

## Language

Always respond in the same language as the user's prompt. If the user writes in Vietnamese, respond in Vietnamese. If in English, respond in English.

## Tech Stack

**Frontend:** React 19, Vite 7, TypeScript, lucide-react.

**CMS target:** Local Payload CMS under `F:/Allbirds/payload-cms`, SQLite database at `F:/Allbirds/payload-cms/payload.db`.

**Tests target:** E2E tests under `F:/Allbirds/e2e-tests`.

## Project Structure

```text
src/                  Frontend source
public/               Static assets
dist/                 Build output
docs/                 Project documentation and recurring bug notes
plans/                Planning artifacts
PROJECT.md            Project architecture, milestones, and API contracts
ORIGINAL_REQUEST.md   Original product requirements and acceptance criteria
package.json          Vite scripts and dependencies
```

## Running

```bash
npm run dev
npm run build
npm run preview
```

## Bug Fix Protocol

Before fixing any bug, always check `docs/common-issues.md` first to see whether the symptom, root cause, or known workaround is already documented.

After every bug fix, append an entry to `docs/common-issues.md` with this exact structure:

```markdown
## YYYY-MM-DD - Short issue title

### Symptoms
- Observed behavior.

### Root Cause
- Actual defect.

### Common Triggers
- Conditions that reproduce the issue.

### Solutions
- Fix applied.

### Verification
- Tests, build commands, or manual checks.
```

## Development Rules

- Follow YAGNI, KISS, and DRY.
- Make surgical changes only. Do not refactor adjacent code unless required by the task.
- Match the existing project style.
- Do not create "enhanced" duplicate files. Update the existing file directly.
- Keep code files under 200 lines where practical; if a file grows past that, consider a focused module split.
- For UI work, build the usable screen first, not a marketing placeholder.
- For user-facing strings or behavior, verify with the app or tests when feasible.
- After modifying code, run `npm run build` unless the user explicitly asks for documentation-only work.

## Karpathy Coding Principles

Four guardrails against the most common LLM coding failures (source: Andrej Karpathy).

### 1. Think Before Coding

- State assumptions explicitly before writing code.
- When multiple interpretations exist, present them; never pick silently.
- Push back if a simpler approach exists.
- If something is unclear, stop and ask before proceeding.

### 2. Simplicity First

- No features beyond what was explicitly asked.
- No abstractions for single-use code.
- No flexibility or configurability not requested.
- No error handling for impossible scenarios.
- Self-test: "Would a senior engineer say this is overcomplicated?" If yes, rewrite.
- If 200 lines could be 50, rewrite it.

### 3. Surgical Changes

- Do not improve adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style even if you would do it differently.
- If you notice unrelated dead code, mention it; do not delete it.
- When your changes create orphans such as unused imports, variables, or functions, clean those up.
- Litmus test: every changed line must trace directly to the user's request.

### 4. Goal-Driven Execution

- Transform tasks into verifiable goals with success criteria.
- "Add validation" means write tests for invalid inputs, then make them pass.
- "Fix the bug" means write a test that reproduces it, then make it pass.
- "Refactor X" means ensure tests pass before and after.
- Multi-step plans must have explicit verify conditions per step.
