---
name: checklist
description: Review tasks.md and report which tasks are complete, in progress, or pending. Use when asked about task status or progress.
---

# Checklist

Read `tasks.md` and produce a status summary:
0. If infra changes involved, run `cd infra && cdk diff`
1. List completed tasks (`[x]`) grouped by epic
2. List pending tasks (`[ ]`) grouped by epic
3. Call out any tasks that appear to be in progress (partial completion within an epic)
4. Reread `requirements.md`, call-out any misses within the checklist.
5. Read `CLAUDE.md` and `infra/lib/constructs/pipeline/state-machine.md` and update architecture/docs as necessary. Minimal. Prefer edit, over adding detail.
6. End with a one-line overall progress summary (e.g. "3 of 12 tasks complete")

Keep output concise. Use checkmarks (x) for done, dashes (–) for pending.