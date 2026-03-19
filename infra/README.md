# Infra

CDK stack for Budgetinator 9000. Provisions the S3 transactions bucket (`BG9k-TransactionsBucket`).

## Prerequisites

Node.js is required. Install via Homebrew: `brew install node`

## Commands

```bash
# Preview changes
npm run cdk diff

# Deploy all stacks
npm run cdk deploy

# Bootstrap (first time only, per account/region)
npx cdk bootstrap
```
