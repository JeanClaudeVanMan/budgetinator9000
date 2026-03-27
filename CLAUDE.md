# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Budgetinator 9000

A serverless app that ingests financial CSV uploads, categorizes transactions, and emails monthly reports.

## Stack

- Lambdas: Node.js TypeScript
- Infrastructure: CDK (TypeScript)
- Storage: S3 (uploads/quarantine/processed), DynamoDB (transactions)
- Notifications: SES

## Commands

- `npm run build` — compile all workspaces (root `tsc --build`)
- `npm run cdk deploy` — deploy all stacks
- `npm run cdk diff` — preview infra changes

## Architecture

CSV uploaded to S3 → EventBridge → Step Function → `cleaner` → `categorizer` → `recorder` → `report-maker` → `notifier` (SES email). On `CsvSchemaError` from cleaner, Step Function catches and routes to `notifier` with `type: 'error'`.

### S3 layout

```
uploads/                          ← user drops CSV files here
quarantine/bad-format/YYYY-MM/    ← invalid CSV (90-day expiry)
quarantine/uncategorized/YYYY-MM/ ← unmatched rows as JSON (90-day expiry)
processed/YYYY-MM/                ← successfully processed files
```

### Lambda pipeline contracts

All Lambda input/output types are defined in `shared/src/index.ts`. Each Lambda receives the previous Lambda's output as its input (`CleanerOutput` → `CategorizerInput`, etc.). The `notifier` accepts a `NotifierInput` with `type: 'report' | 'error'`.

## Code Style

- Use TypeScript for all CDK infra and Lambda handlers
- Prefer `async/await` over callbacks or raw Promises
- All infra in one file: `infra/lib/infra-stack.ts`
- Keep Lambda handlers thin — business logic in separate modules
- Lambda handlers: only event validation; initialize SDK clients and DB connections outside the handler; keep code idempotent
- Share common logic in `/shared` — prefer small reusable helpers
- Step Functions: maintain a `.md` mermaid diagram alongside the state machine definition; update when changed

## Infra Conventions

- All resources use `appNamePrefix` (`BG9k-`) from `infra/constants.ts`
- Use the `BudgetinatorFunction` construct (`infra/lib/constructs/BudgetinatorFunction.ts`) for all Lambda definitions — it auto-applies the naming convention
- Region: `us-west-2`
- No manual console changes — all infra via CDK

## Key Decisions

- Prefer simplicity and brevity over features
- No tests unless asked
- `quarantine/uncategorized/` accumulates unmatched rows as future ML training data; the categorizer's `{ categorized, uncategorized }` contract is stable by design

## Workflow

- Once completed, check off relevant tasks in `tasks.md`
