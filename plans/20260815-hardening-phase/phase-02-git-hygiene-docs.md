---
phase: 2
title: Git Hygiene & Docs
status: pending
priority: P1
effort: 30m
dependencies:
  - 1
---

# Phase 2 — Git Hygiene & Docs

## Context / Problem

- `git status` shows ~597 untracked files: `.agents/` (agent-teamwork artifacts) and `.claude/` (local skills/config). These are local tooling, not project source.
- `release-manifest.json` is being rewritten by tooling (644-line diff) — should not be committed as churn; leave file, do not commit.
- `docs/` only contains `common-issues.md`; AGENTS.md/CLAUDE.md point at a fuller docs set (code-standards, system-architecture, roadmap). Docs are root-owned; keep this repo's docs honest rather than inventing exhaustive ones.

## Tasks

1. **`.gitignore` additions** (`F:\Allbirds\.gitignore`)
   - Add `.agents/`
   - Add `.claude/`
   - Keep existing entries (node_modules, dist, test-results, payload.db, logs, etc.)
   - Do NOT ignore `docs/`, `plans/`, `src/`, `e2e-tests/`, `payload-cms/src/`.

2. **Verify status** — `git status --short` should no longer list `.agents/` / `.claude/` files after the ignore is applied. (`git status` reads .gitignore live; no commit needed.)

3. **Docs check (light touch)**
   - Confirm `README.md` / `PROJECT.md` still accurate post-F7/F8 (accounts, payment). Update only if a statement is now wrong (e.g. milestone table, collection list). No new marketing docs.

## Verification

- `git status --short` clean of `.agents/`/`.claude/`.
- `README.md`/`PROJECT.md` claims match current feature set.

## Risks / Rollback

- `.claude/` at repo root is untracked already, so ignoring it changes nothing about tracked files; low risk.
