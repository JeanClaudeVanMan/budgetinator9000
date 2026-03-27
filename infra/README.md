# Infra

CDK stack for Budgetinator 9000. Provisions the S3 transactions bucket (`BG9k-TransactionsBucket`).

## Prerequisites

Node.js is required. Install via Homebrew: `brew install node`

## Commands

```bash
# Login to AWS
aws login

# Verify profile, should show 
aws login bg9k-baseinfrastack-

# Preview changes
npm run cdk diff

# Deploy all stacks
npm run cdk deploy

# Bootstrap (first time only, per account/region)
npx cdk bootstrap
```

## Workflow
- Start with tasks.md + see git state. Which branch? commits? staged?
- Use skill with `/checklist where did we leave off` to orient self where we are
- Kick off planning step with next epic