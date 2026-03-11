// ── Core domain types ────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;         // ISO 8601, e.g. "2026-03-05"
  description: string;
  amount: number;       // positive = credit, negative = debit
  category: string;     // e.g. "shopping", "utilities", "uncategorized"
  sourceFile: string;   // S3 key of the original upload
}

export interface UncategorizedTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  sourceFile: string;
}

// ── Categorizer contract ─────────────────────────────────────────────────────

export interface CategorizerResult {
  categorized: Transaction[];
  uncategorized: UncategorizedTransaction[];
}

// ── Lambda Step Function payloads ────────────────────────────────────────────

export interface CleanerInput {
  bucketName: string;
  objectKey: string;    // e.g. "uploads/2026-03/myfile.csv"
}

export interface CleanerOutput {
  bucketName: string;
  objectKey: string;
  transactions: Omit<Transaction, 'category'>[];
}

export interface CategorizerInput extends CleanerOutput {}

export interface CategorizerOutput {
  bucketName: string;
  objectKey: string;
  categorized: Transaction[];
  uncategorized: UncategorizedTransaction[];
}

export interface RecorderInput extends CategorizerOutput {}

export interface RecorderOutput {
  bucketName: string;
  objectKey: string;
  recordedCount: number;
  uncategorizedCount: number;
  month: string;        // e.g. "2026-03"
}

export interface ReportMakerInput extends RecorderOutput {}

export interface ReportMakerOutput {
  bucketName: string;
  objectKey: string;
  month: string;
  report: MonthlyReport;
  hasUncategorized: boolean;
}

export interface NotifierInput {
  type: 'report' | 'error';
  month?: string;
  report?: MonthlyReport;
  hasUncategorized?: boolean;
  error?: {
    name: string;
    cause: string;
    objectKey: string;
  };
}

// ── Report shape ─────────────────────────────────────────────────────────────

export interface MonthlyReport {
  month: string;
  totalSpend: number;
  totalIncome: number;
  byCategory: Record<string, number>;
  uncategorizedTransactions: UncategorizedTransaction[];
}
