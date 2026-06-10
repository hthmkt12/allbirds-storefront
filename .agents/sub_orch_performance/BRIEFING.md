# BRIEFING — 2026-06-10T03:35:00Z

## Mission
Oversee asset optimization, WebP/AVIF format conversion, responsive image loading, sprite sheet removal, E2E test verification, and audit passing.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: F:/Allbirds/.agents/sub_orch_performance
- Original parent: main agent
- Original parent conversation ID: 42ddec97-9a83-47fb-96a0-cf7e9b41d82c

## 🔒 My Workflow
- **Pattern**: Project Pattern (Sub-orchestrator)
- **Scope document**: F:/Allbirds/.agents/sub_orch_performance/SCOPE.md
1. **Decompose**: Decompose task into milestones corresponding to exploration, asset conversion, code implementation (responsive images & crop removal), validation (build, tests, page performance), and auditing.
2. **Dispatch & Execute**:
   - **Direct (iteration loop)**: Explorer → Worker → Reviewer → Gate
   - **Delegate (sub-orchestrator)**: None (we are already a sub-orchestrator, we will run iteration loops using Explorer, Worker, Reviewer, and Forensic Auditor subagents).
3. **On failure** (in this order):
   - Retry: nudge stuck agent or re-send task
   - Replace: spawn fresh agent with partial progress
   - Skip: proceed without (only if non-critical)
   - Redistribute: split stuck agent's remaining work
   - Redesign: re-partition decomposition
   - Escalate: report to parent (sub-orchestrators only, last resort)
4. **Succession**: Self-succeed at 16 spawns.
- **Work items**:
  1. Codebase and Asset Exploration [done]
  2. WebP/AVIF Image Conversion [done]
  3. Responsive Image implementation & Sprite sheet crop removal [done]
  4. Local build and performance verification [done]
  5. E2E Test validation [done]
  6. Forensic Audit [in-progress]
- **Current phase**: 4
- **Current focus**: Forensic Audit (Auditor running)

## 🔒 Key Constraints
- Never write code directly; spawn workers/reviewers/auditors to do so.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- cumulative sub-agent spawn count threshold is 16.
- Run builds/tests using workers, never ourselves.
- Binary veto by Forensic Auditor must fail iteration.

## Current Parent
- Conversation ID: 42ddec97-9a83-47fb-96a0-cf7e9b41d82c
- Updated: not yet

## Key Decisions Made
- None yet.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| Explorer 1 | teamwork_preview_explorer | Asset Exploration | completed | a4860da7-b3e8-4415-b55f-a580fb3f9f17 |
| Explorer 2 | teamwork_preview_explorer | Sprite Sheet Exploration | completed | 04769666-ddb6-456f-95f2-04eb79bafd20 |
| Explorer 3 | teamwork_preview_explorer | Responsive Image Exploration | completed | decd2309-9b1e-4beb-82e4-025eed2ab2f7 |
| Worker 1 | teamwork_preview_worker | Performance Implementation | completed | 04f878e1-9a50-454a-844b-62bd6a4f89ce |
| Reviewer 1 | teamwork_preview_reviewer | Performance Review 1 | completed | fd1d8e1b-1411-4acc-94ca-3258c37bb785 |
| Reviewer 2 | teamwork_preview_reviewer | Performance Review 2 | completed | d1ee0f74-891f-47f8-928b-d528702dc752 |
| Auditor 1 | teamwork_preview_auditor | Forensic Audit | completed (fail) | ebbf327e-0cba-4ef8-88e8-32e2ce6eabe0 |
| Auditor 2 | teamwork_preview_auditor | Forensic Audit | failed (429) | eac736ad-28d4-422e-9583-62757f787395 |
| Worker 2 | teamwork_preview_worker | Remediation & Layout Fixes | failed (429) | af0c9d61-15c8-4aa1-b1ca-c022afa0a890 |
| Worker 3 | teamwork_preview_worker | Remediation & Layout Fixes | completed | 707ffe97-fc02-4322-bef0-1456c3f680e0 |
| Auditor 3 | teamwork_preview_auditor | Forensic Audit 3 | failed (429) | 867a8060-b71b-4255-a2e1-b71ce6e7423b |
| Reviewer 3 | teamwork_preview_reviewer | Performance Review 3 | pending | 41259b52-2970-4edc-aeab-c3eb54b4249b |
| Auditor 4 | teamwork_preview_auditor | Forensic Audit 4 | pending | d9770727-48b2-4364-b3e6-311ffb935702 |

## Succession Status
- Succession required: no
- Spawn count: 13 / 16
- Pending subagents: 41259b52-2970-4edc-aeab-c3eb54b4249b, d9770727-48b2-4364-b3e6-311ffb935702
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: ccea9e1b-446c-4851-a9bc-a6064603699a/task-11
- Safety timer: none
- On succession: kill all timers before spawning successor
- On context truncation: run `manage_task(Action="list")` — re-create if missing

## Artifact Index
- F:/Allbirds/.agents/sub_orch_performance/progress.md — Heartbeat and step-by-step progress tracking
- F:/Allbirds/.agents/sub_orch_performance/SCOPE.md — Living document tracking milestone status
