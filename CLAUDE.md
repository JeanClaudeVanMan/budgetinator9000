# Budgetinator 9000

A serverless app that ingests financial CSV uploads, categorizes transactions, and emails monthly reports.

## Stack

- Lambdas: Node.js Typescript
- Infrastructure: CDK (TypeScript)

## Code Style

- Use TypeScript for all CDK infra and Lambda handlers
- Prefer `async/await` over callbacks or raw Promises
- Infra: in one file `infra/lib/infra-stack.ts`, discover, reuse
- Keep Lambda handlers thin — business logic in separate modules
- Name Lambda: by their role: `cleaner`, `categorizer`, `recorder`, `report-maker`, `notifier`
- Lambda infra: add one comment explaining responsibility
- Lambda: only handles event validation, initialize SDK clients and database connections outside of the function handler, idempotent code
- Shared: Share any common logic in `/shared` prefer reuseable small helpers
- Step Functions: create a .md mermaid document near where step function logic is defined, maintain when changed

## Project Structure

```
/
├── infra/          # CDK stacks
├── lambdas/
│   ├── cleaner/
│   ├── categorizer/
│   ├── recorder/
│   ├── report-maker/
│   └── notifier/
└── shared/         # shared types/utils
```

## Key Decisions

- Prefer simplicity, brevity over features and details
- No tests unless asked

## Commands

- `npm run cdk deploy` — deploy all stacks
- `npm run cdk diff` — preview infra changes

## Do Not

- Do not skip CDK for any infra — no manual console changes
- Do not commit AWS credentials or `.env` files

## AWS Context

- Naming: follow this format `new s3.Bucket(this, `${appNamePrefix}TransactionsBucket`,...` where appNamePrefix includes `-`, no spacing
- Region: us-west-2


