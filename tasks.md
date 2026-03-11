# Budgetinator 9000 — Task Breakdown

Tasks are ordered by dependency. Sub-tasks within a group can be parallelised.

---

## Epic 1 — Project Scaffold
> Foundation everything else depends on. Do this first.

**T-01** *(no dependencies — all parallel)*
- [ ] **T-01.1** Initialise monorepo — `npm init`, `.gitignore`, `tsconfig.json` at root
- [ ] **T-01.2** Scaffold CDK app under `infra/` (`cdk init app --language typescript`)
- [ ] **T-01.3** Create shared types package under `shared/` — `Transaction`, `UncategorizedTransaction`, `CategorizerResult`, Lambda input/output interfaces
- [ ] **T-01.4** Scaffold each Lambda directory under `lambdas/` with its own `package.json` and `tsconfig.json` (`cleaner`, `categorizer`, `recorder`, `report-maker`, `notifier`)

---

## Epic 2 — Core Infrastructure (CDK)
> Define AWS resources before wiring up Lambda code.

**T-02** *(depends on T-01)*
- [ ] **T-02.1** CDK stack: S3 bucket with prefix layout (`uploads/`, `quarantine/`, `processed/`) and lifecycle rules (90-day expiry on `quarantine/`)

**T-03** *(depends on T-02)*
- [ ] **T-03.1** CDK stack: DynamoDB table — partition key `userId`, sort key `transactionDate#id`

**T-04** *(depends on T-02, T-03)*
- [ ] **T-04.1** CDK stack: Step Function state machine skeleton — placeholder Pass states for each step, wired in sequence

**T-05** *(depends on T-04 — all parallel)*
- [ ] **T-05.1** CDK stack: S3 event notification → EventBridge rule → triggers Step Function on `uploads/` prefix
- [ ] **T-05.2** CDK stack: SES email identity resource + verified sender address
- [ ] **T-05.3** CDK stack: IAM roles and policies for each Lambda (scoped S3, DynamoDB, SES permissions)

---

## Epic 3 — Lambda Pipeline (happy path)
> Build each Lambda in pipeline order.

**T-06** *(depends on T-01, T-02)*
- [ ] **T-06.1** **Cleaner Lambda** — parse CSV, validate schema, normalise rows, return cleaned `Transaction[]`

**T-07** *(depends on T-01, T-06)*
- [ ] **T-07.1** **Categorizer Lambda** — string-match rules against transaction descriptions, return `{ categorized, uncategorized }`

**T-08** *(depends on T-01, T-03, T-07)*
- [ ] **T-08.1** **Recorder Lambda** — persist `categorized` and `uncategorized` arrays to DynamoDB (`category = "uncategorized"` for unmatched rows)

**T-09** *(depends on T-01, T-03, T-08)*
- [ ] **T-09.1** **Report Maker Lambda** — query DynamoDB for current month, aggregate by category, build report payload (include uncategorized section if any)

**T-10** *(depends on T-05.2, T-09)*
- [ ] **T-10.1** **Notifier Lambda** — send SES email; handle `type: 'report'` (monthly summary) and `type: 'error'` (failure alert) from a single handler

---

## Epic 4 — Error Handling
> Layer error handling on top of the working happy path.

**T-11** *(depends on T-06)*
- [ ] **T-11.1** Cleaner: add schema validation guard at the top; on failure move file to `quarantine/bad-format/YYYY-MM/` and throw `CsvSchemaError`

**T-12** *(depends on T-07)*
- [ ] **T-12.1** Categorizer: write `uncategorized` rows to `quarantine/uncategorized/YYYY-MM/` in S3

**T-13** *(depends on T-04, T-10, T-11)*
- [ ] **T-13.1** Step Function: add `Catch` on Cleaner for `CsvSchemaError` → `NotifyError` state → `ExecutionFailed`

**T-14** *(depends on T-13 — all parallel)*
- [ ] **T-14.1** Step Function: add `Retry` on all Lambda states for transient Lambda errors (`Lambda.ServiceException`, `Lambda.AWSLambdaException`, x2 with backoff)
- [ ] **T-14.2** Notifier: implement `type: 'error'` path — send failure alert email with error context from Step Function `$.Error` / `$.Cause`

---

## Epic 5 — Integration & Smoke Test
> Wire everything together and verify end-to-end.

**T-15** *(depends on T-05.3, T-10, T-14)*
- [ ] **T-15.1** Replace CDK Pass state placeholders with real Lambda function references

**T-16** *(depends on T-15)*
- [ ] **T-16.1** `cdk deploy` to a dev AWS account

**T-17** *(depends on T-16 — all parallel)*
- [ ] **T-17.1** Manual smoke test — upload a valid CSV, verify report email arrives
- [ ] **T-17.2** Manual smoke test — upload a malformed CSV, verify error email and quarantine file
- [ ] **T-17.3** Manual smoke test — upload a CSV with an unknown merchant, verify uncategorized warning in report

---

## Backlog (future)

- [ ] **B-01** Replace string-matching categorizer with scikit-learn ML model (Python Lambda layer)
- [ ] **B-02** Export `category = "uncategorized"` rows from DynamoDB for labelling / training data
- [ ] **B-03** Add a user-configurable category rules file (e.g. JSON in S3) so rules can be updated without a deploy
- [ ] **B-04** Multi-user support (partition data by user ID)
- [ ] **B-05** CI/CD pipeline (GitHub Actions → `cdk deploy`)
