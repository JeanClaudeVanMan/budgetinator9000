# Budgetinator 9000

A serverless app that ingests financial CSV uploads, categorizes transactions, and emails monthly reports.

## Stack

- Lambdas: Node.js Typescript
- Infrastructure: CDK (TypeScript)

## Code Style

- Use TypeScript for all CDK infra and Lambda handlers
- Prefer `async/await` over callbacks or raw Promises
- Keep Lambda handlers thin — business logic in separate modules
- Name Lambda functions by their Step Function role: `cleaner`, `categorizer`, `recorder`, `report-maker`, `notifier`

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
