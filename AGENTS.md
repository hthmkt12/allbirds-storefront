# Allbirds Agent Instructions

This file gives coding agents project-specific rules for `F:/Allbirds`. Follow `CLAUDE.md` as the primary project guide; this file repeats the rules that must stay visible to agent runners.

## Language

Respond in the same language as the user's prompt.

## Project Context

- Frontend storefront: React + Vite + TypeScript in `src/`.
- Payload CMS target: `F:/Allbirds/payload-cms` with SQLite.
- E2E target: `F:/Allbirds/e2e-tests`.
- Project source of truth: `PROJECT.md`, `ORIGINAL_REQUEST.md`, and `docs/`.
- If `README.md` exists, read it before planning or implementation.

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

- Analyze relevant skills before starting and use the ones needed for the task.
- Follow YAGNI, KISS, and DRY.
- Make surgical changes only. Every changed line must trace to the user's request.
- Do not improve adjacent code, comments, formatting, or architecture unless required.
- Do not create "enhanced" duplicate files. Update the existing file directly.
- Match existing style even if you would do it differently.
- If unrelated dead code is found, mention it; do not delete it.
- Clean up unused imports, variables, and functions created by your own changes.
- Keep code files under 200 lines where practical. Consider modularization only when it reduces real complexity.
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
