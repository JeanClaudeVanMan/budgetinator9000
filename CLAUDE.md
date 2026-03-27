# Budgetinator 9000

A serverless app that ingests financial CSV uploads, categorizes transactions, and emails monthly reports.

## Stack

- Lambdas: Node.js TypeScript
- Infrastructure: CDK (TypeScript)
- Storage: S3 (uploads/quarantine/processed), DynamoDB (transactions)
- Notifications: SES

## Commands

- `npm run build` — compile all workspaces (root `tsc --build`)
- `npm run cdk diff` — preview infra changes
- never deploy.

## Repository Layout

```
infra/
  bin/infra.ts                         ← CDK entrypoint
  lib/infra-stack.ts                   ← ALL infra defined here (one file)
  lib/constructs/BudgetinatorFunction.ts ← use for every Lambda definition
  constants.ts                         ← appNamePrefix = "BG9k-"
lambdas/
  cleaner/src/index.ts
  categorizer/src/index.ts
  recorder/src/index.ts
  report-maker/src/index.ts
  notifier/src/index.ts
shared/src/interfaces/index.ts         ← canonical catalog of all pipeline interfaces and helpers
tasks.md                               ← check off completed tasks here
```

## Architecture

S3 upload → EventBridge → Step Function → `cleaner` → `categorizer` → `recorder` → `report-maker` → `notifier` (SES email).

On `CsvSchemaError` from `cleaner`, Step Function catches and routes directly to `notifier` with `type: 'error'`.

### S3 Layout

```
uploads/                          ← user drops CSV files here
quarantine/bad-format/YYYY-MM/    ← invalid CSV (90-day expiry)
quarantine/uncategorized/YYYY-MM/ ← unmatched rows as JSON (90-day expiry)
processed/YYYY-MM/                ← successfully processed files
```

### Step Function I/O Chain

Each Lambda receives the previous Lambda's output as its input. All types live in `shared/src/index.ts`.

```
CleanerInput         → cleaner        → CleanerOutput
CleanerOutput        → categorizer    → CategorizerOutput
CategorizerOutput    → recorder       → RecorderOutput
RecorderOutput       → report-maker   → ReportMakerOutput
ReportMakerOutput    → notifier       (type: 'report')

{ type: 'error', error: { name, cause, objectKey } } → notifier  (error path)
```

Key field: `NotifierInput.type: 'report' | 'error'` — controls notifier behaviour.

`quarantine/uncategorized/` accumulates unmatched rows as future ML training data; the `{ categorized, uncategorized }` contract from `categorizer` is stable by design.

## Code Rules

- Before adding or modifying any types, read `shared/src/index.ts` first — it is the canonical catalog. Never define pipeline types locally in a Lambda; extend `shared/src/index.ts` instead.
- TypeScript everywhere (infra and Lambdas)
- `async/await` only — no callbacks or raw Promise chains
- Lambda handlers: validate event, then delegate to modules. Initialize SDK clients and DB connections **outside** the handler. Keep handlers idempotent.
- Business logic goes in modules alongside the handler, not in the handler itself
- Shared helpers go in `shared/src/index.ts`
- Minimal comments — only where logic is non-obvious. No obvious code explanations, no ref numbers, no vague labels.
- No tests unless explicitly asked

## Infra Rules

- All infra in `infra/lib/infra-stack.ts` — never split across files
- Every Lambda must use `BudgetinatorFunction` construct — it enforces the `BG9k-` naming prefix
- All resource names derive from `appNamePrefix` in `infra/constants.ts`
- Region: `us-west-2`
- No manual AWS console changes — CDK only
- Step Functions: keep a `.md` mermaid diagram alongside the state machine definition; update it when the definition changes. Do not use `\n` in mermaid diagrams.

## Key Decisions

- Prefer simplicity and brevity — don't add features beyond what's asked
- Don't add error handling, validation, or fallbacks for scenarios that can't happen
- Don't create abstractions for one-off operations

## Workflow

- Once completed, check off relevant tasks in `tasks.md`