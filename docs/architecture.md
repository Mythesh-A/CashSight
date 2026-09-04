# CashSight — Architecture

> **Automated Finance Reconciliation & Cash Intelligence**

CashSight is a finance operations platform that automates the reconciliation of merchant orders, payment gateway settlements, and bank transactions. It identifies genuine matches, preserves ambiguous cases for human review, analyzes settlement deductions, calculates current cash position, generates a 7-day cash-position scenario forecast, maintains an audit trail, and produces downloadable financial reports.

---

## 1. System Overview

CashSight follows a pipeline-based architecture:

```text
Merchant Financial CSVs
        │
        ▼
┌─────────────────────────┐
│ CSV Upload & Parsing    │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Column Mapping          │
│ & Normalization         │
└────────────┬────────────┘
             ▼
┌─────────────────────────┐
│ Data Quality Validation │
└────────────┬────────────┘
             ▼
┌─────────────────────────────────────────────┐
│          RECONCILIATION ENGINE              │
│                                             │
│ Bank Matcher                                │
│ Subset-Sum Matcher                          │
│ Ambiguity Resolver                          │
│ Orphan Checker                              │
└────────────┬────────────────────────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
    Matches     Exceptions
       │           │
       └─────┬─────┘
             ▼
┌─────────────────────────────────────────────┐
│              FINANCE INTELLIGENCE           │
│                                             │
│ Cash Position                               │
│ Tax & Fee Analysis                          │
│ 7-Day Cash Forecast                         │
│ Exception Management                        │
└────────────┬────────────────────────────────┘
             ▼
┌─────────────────────────────────────────────┐
│               OUTPUT LAYER                  │
│                                             │
│ Dashboard | Audit Log | PDF Reports         │
└─────────────────────────────────────────────┘
```

The architecture separates the presentation layer, API layer, business logic, and data processing so that reconciliation logic can evolve independently from the user interface.

---

# 2. Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* JavaScript
* Axios
* Context-based state management

### Backend

* Python
* Flask
* Flask-CORS
* ReportLab

### Processing

* Python-based reconciliation algorithms
* CSV parsing and normalization
* `itertools.combinations` for subset-sum matching

### Deployment

* Frontend: Netlify
* Backend: Render
* Source code: GitHub

---

# 3. Input Data Architecture

CashSight works with three independent financial sources.

### Merchant Order Ledger

```text
order_id
order_date
gross_amount
customer_id
status
```

### Gateway Settlement Report

```text
settlement_id
utr
settlement_date
gross_amount
razorpay_fee
gst_on_fee
tds_deducted
net_amount
```

### Bank Statement

```text
txn_id
value_date
utr
credited_amount
narration
```

The system does not assume that every CSV uses exactly the same column names.

Instead, the upload flow first detects the available headers and allows the user to map them to the expected schema.

---

# 4. Upload & Column Mapping Flow

```text
CSV File
   │
   ▼
CSVUploader
   │
   ├── File type validation
   ├── File size validation
   ├── Empty file detection
   └── CSV parsing
   │
   ▼
ColumnMapper
   │
   ├── Header detection
   ├── Automatic mapping suggestions
   └── Manual mapping correction
   │
   ▼
DataQualityReport
   │
   ├── Missing columns
   ├── Invalid dates
   ├── Duplicate records
   └── Data summary
   │
   ▼
Reconciliation Pipeline
```

### Why column mapping exists

Different financial systems may export similar information under different names.

For example:

```text
Order ID       → order_id
Order Date     → order_date
Amount         → gross_amount
UTR Number     → utr
```

CashSight separates the external schema from the internal schema so the reconciliation engine can operate on a consistent data structure.

---

# 5. Data Validation

Before reconciliation, CashSight validates:

* Required fields
* Column mappings
* Empty files
* Numeric values
* Dates
* Duplicate records
* Missing values
* Financial calculation consistency

Duplicates are identified and reported rather than silently removed.

This prevents the system from modifying the source data without the user's knowledge.

---

# 6. Reconciliation Engine

The reconciliation engine is the core of CashSight.

It performs three-way reconciliation between:

```text
Merchant Orders
       ↕
Gateway Settlements
       ↕
Bank Transactions
```

The pipeline is coordinated by `pipeline.py`.

```text
Settlement
     │
     ▼
Bank Matcher
     │
     ├── Matched
     │
     └── Missing Bank Credit
             │
             ▼
      Subset-Sum Matcher
             │
       ┌─────┼─────┐
       ▼     ▼     ▼
      0      1     2+
     match  match  matches
       │     │       │
       ▼     ▼       ▼
 Unresolved Matched Ambiguous
                       │
                       ▼
                  Human Review

Bank Transactions
       │
       ▼
Orphan Checker
       │
       ▼
Unlinked Credits
```

---

# 7. Bank Matching

For each settlement, CashSight attempts to locate the corresponding bank transaction.

The matching conditions are:

```text
UTR matches
        AND
Settlement Net Amount ≈ Bank Credited Amount
        AND
Bank Value Date is within ±3 days
```

The amount tolerance is:

```text
₹0.01
```

If all conditions are satisfied, the settlement is linked to the bank transaction.

If no corresponding bank transaction is found:

```text
missing_bank_credit
```

is created.

---

# 8. Batched Settlement Matching

A gateway settlement may represent multiple merchant orders rather than a single order.

For example:

```text
Order A = ₹500
Order B = ₹300
Order C = ₹200

Settlement Gross = ₹1,000
```

The system must recognize:

```text
₹500 + ₹300 + ₹200 = ₹1,000
```

instead of incorrectly assuming the settlement belongs to one order.

CashSight therefore searches combinations of up to three orders.

### Search window

Orders are considered within:

```text
Settlement Date - 7 days
        →
Settlement Date
```

### Matching tolerance

The combination must match the settlement gross amount within:

```text
₹1
```

---

# 9. Ambiguity Resolution

The system deliberately does not force uncertain matches.

The result depends on the number of valid combinations:

```text
0 combinations
       ↓
UNRESOLVED_BATCH

1 combination
       ↓
MATCHED

2+ combinations
       ↓
AMBIGUOUS_BATCH
```

For ambiguous batches, CashSight displays the candidate combinations and asks the user to make the final decision.

This creates a **human-in-the-loop control** rather than allowing automation to silently create potentially incorrect financial matches.

---

# 10. Orphan Bank Credits

CashSight also analyzes the bank statement independently.

If a bank transaction has a UTR that does not exist in the settlement data, it is classified as:

```text
UNLINKED_CREDIT
```

This catches money that arrived in the bank but cannot currently be explained by the gateway settlement data.

---

# 11. Exception Management

CashSight maintains an explicit exception taxonomy.

| Exception              | Meaning                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `missing_bank_credit`  | Settlement exists but corresponding bank credit was not found |
| `unlinked_credit`      | Bank credit has no corresponding settlement                   |
| `ambiguous_batch`      | Multiple valid order combinations exist                       |
| `unresolved_batch`     | No valid order combination was found                          |
| `calculation_mismatch` | Settlement arithmetic does not reconcile                      |
| `negative_value`       | Invalid negative financial value                              |

The Exception Center allows users to:

* Filter exceptions
* Inspect settlement details
* View candidate combinations
* Resolve an exception
* Reject an incorrect candidate
* Mark an issue for investigation

Every important resolution is recorded in the audit trail.

---

# 12. Human-in-the-Loop Resolution

CashSight follows a simple principle:

> **Automate high-confidence decisions and escalate uncertain decisions to humans.**

For example:

```text
1 valid match
     ↓
Automatically accepted

2+ valid matches
     ↓
Human review required

0 valid matches
     ↓
Exception created
```

When the user resolves an exception, the system updates the reconciliation result and records the resolution.

This reduces the risk of false-positive financial reconciliation.

---

# 13. Tax & Fee Analyzer

The Tax & Fee Analyzer validates the arithmetic of each settlement.

For every settlement:

```text
Calculated Net
=
Gross Amount
- Gateway Fee
- GST
- TDS
```

The calculated value is compared against the reported settlement `net_amount`.

If the difference exceeds:

```text
₹0.01
```

the settlement is flagged as a calculation mismatch.

### Aggregated metrics

CashSight calculates:

* Total gross amount
* Total gateway fees
* Total GST
* Total TDS
* Total deductions
* Total net amount
* Effective deduction rate
* Fee rate
* GST-to-gross rate
* TDS-to-gross rate

The system also provides monthly and settlement-level breakdowns.

> **Note:** The analyzer validates the supplied settlement data and its arithmetic. It is not intended to replace a tax professional or act as a tax filing calculator.

---

# 14. Cash Position

CashSight calculates the current cash position using reconciled bank credits.

The dashboard separates:

```text
Current Reconciled Cash
+
Pending Settlement Amount
=
Expected Cash
```

This gives the user a distinction between:

* Cash that has already been reconciled
* Cash that is still pending
* Expected future cash

This distinction is important because pending settlement amounts should not be treated as already available cash.

---

# 15. 7-Day Cash Forecast

### Current implementation

The current forecast is intentionally implemented as a **deterministic synthetic scenario model**, not as a trained ML model.

The forecast uses:

```text
Current Reconciled Cash
+
Pending Settlement Amount
        ↓
Synthetic Daily Inflow
        ↓
Scenario Variation
        ↓
Cumulative Cash Position
        ↓
P5 | P50 | P95
```

Predefined daily weights distribute pending cash across seven days.

The system then generates three scenarios:

```text
P5  → Conservative scenario
P50 → Central / expected scenario
P95 → Optimistic scenario
```

The displayed values represent **cumulative end-of-day cash position**, not daily incoming cash.

For example:

```text
Starting Cash = ₹18,492.20

Day 1 → cumulative cash position
Day 2 → cumulative cash position
...
Day 7 → cumulative cash position
```

### Important limitation

The P5/P50/P95 values are **scenario ranges**, not statistically calibrated probability percentiles.

There is currently:

* No trained ML model
* No historical model training
* No Monte Carlo simulation
* No statistically validated probability distribution

The architecture intentionally keeps this layer separate so it can later be replaced with a historical-data-driven forecasting model.

---

# 16. Reporting Architecture

CashSight generates downloadable PDF reports using ReportLab.

### Reconciliation Report

Contains:

* Executive summary
* Match statistics
* Matched settlements
* Exceptions
* Findings
* Recommendations

### Forecast Report

Contains:

* Starting cash
* Pending cash
* 7-day P5/P50/P95 scenario table
* Interpretation
* Forecast disclaimer

### Tax & Fee Report

Contains:

* Gross
* Gateway fee
* GST
* TDS
* Deductions
* Net amount
* Effective rates
* Monthly analysis
* Settlement-level details
* Validation results

### Full Report

Combines:

```text
Reconciliation
+
Tax & Fee Analysis
+
Cash Forecast
+
Findings
+
Recommendations
```

---

# 17. Audit Trail

CashSight records important system and user actions.

Examples include:

```text
CSV upload
Data processing
Reconciliation
Exception resolution
User decisions
Report generation
```

The audit trail provides traceability for financial operations and makes human decisions distinguishable from automated decisions.

---

# 18. API Architecture

The frontend communicates with the Flask backend through REST APIs.

| Method | Endpoint                 | Purpose                                      |
| ------ | ------------------------ | -------------------------------------------- |
| POST   | `/api/validate-data`     | Validate and process uploaded financial data |
| GET    | `/api/reconcile`         | Retrieve reconciliation results              |
| POST   | `/api/load-sample`       | Load sample demonstration data               |
| GET    | `/api/cash-position`     | Retrieve current and pending cash            |
| GET    | `/api/forecast`          | Retrieve 7-day synthetic forecast            |
| GET    | `/api/score`             | Retrieve reconciliation evaluation metrics   |
| GET    | `/api/exceptions`        | Retrieve exceptions                          |
| POST   | `/api/resolve-exception` | Resolve an exception                         |
| POST   | `/api/explain`           | Generate exception explanation               |
| GET    | `/api/tax-analyzer`      | Retrieve tax and fee analysis                |
| GET    | `/api/audit`             | Retrieve audit history                       |
| POST   | `/api/reports/*`         | Generate financial reports                   |

The API layer handles request validation and error responses while business logic remains inside dedicated backend modules.

---

# 19. Backend Module Architecture

```text
backend/
│
├── routes.py
│
├── reconciliation/
│   ├── pipeline.py
│   ├── bank_matcher.py
│   ├── subset_sum_matcher.py
│   ├── ambiguity_resolver.py
│   ├── orphan_checker.py
│   └── scoring.py
│
├── tax_analyzer/
│   ├── analyzer.py
│   └── routes.py
│
├── reports/
│   ├── generator.py
│   ├── reconciliation_report.py
│   ├── forecast_report.py
│   ├── tax_fee_report.py
│   └── full_report.py
│
└── audit/
```

The main design principle is separation of concerns.

For example:

```text
routes.py
    ↓
pipeline.py
    ↓
bank_matcher.py
subset_sum_matcher.py
ambiguity_resolver.py
orphan_checker.py
```

The Flask route does not contain the complete reconciliation algorithm.

---

# 20. Frontend Architecture

The React application is organized around independent functional modules.

```text
Frontend
│
├── Upload Flow
│   ├── CSVUploader
│   ├── ColumnMapper
│   └── DataQualityReport
│
├── Dashboard
│
├── Exception Center
│   ├── ExceptionInbox
│   └── ExceptionDetails
│
├── Tax & Fee Analyzer
│
├── Reports
│   ├── ReportsPage
│   └── ReportCard
│
├── Audit Log
│
└── Shared Components
```

Application-level state is managed through React contexts such as:

```text
AppContext
DataContext
ThemeContext
```

---

# 21. Data Flow

The complete data flow is:

```text
                 ┌──────────────┐
                 │ Ledger CSV   │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │ Settlement   │
                 │ CSV          │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │ Bank CSV     │
                 └──────┬───────┘
                        │
                        ▼
              Upload & Column Mapping
                        │
                        ▼
                Data Validation
                        │
                        ▼
             Reconciliation Pipeline
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
           Matches            Exceptions
              │                   │
              └─────────┬─────────┘
                        ▼
               Finance Analytics
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Cash Position  Tax/Fee      Forecast
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                  Reports + Audit
```

---

# 22. Current Data Storage

The current prototype uses an in-memory `UPLOAD_CACHE`.

Conceptually:

```text
UPLOAD_CACHE
│
├── data_source
├── settlements
├── ledger
├── bank
├── matches
└── exceptions
```

This was chosen to keep the build lightweight and demonstrate the complete finance-operations workflow without introducing unnecessary database infrastructure for the prototype.

### Production evolution

A production implementation would replace the in-memory cache with persistent storage and transactional processing.

---

# 23. Error Handling

CashSight handles failures at both frontend and backend levels.

### Upload errors

```text
Invalid file type
Empty file
File exceeds 10 MB
Missing required columns
```

### Data errors

```text
Invalid dates
Invalid numeric values
Duplicates
Missing required fields
Calculation mismatches
Negative financial values
```

### API errors

```text
400 → Invalid request/data
404 → Endpoint/resource not found
500 → Internal processing failure
```

### Network failures

The frontend provides connection and retry feedback.

API requests use a timeout of:

```text
180 seconds / 3 minutes
```

Long-running reconciliation requests therefore fail gracefully instead of leaving the interface in an indefinite loading state.

---

# 24. Accuracy & Ground Truth

For controlled synthetic datasets, CashSight can use known expected reconciliation outcomes as ground truth.

Example:

```text
Settlement S001
      │
      ├── Expected Bank Transaction: B001
      │
      └── Expected Orders:
            O101 + O102
```

The engine's predicted results can then be compared against the known correct results.

Evaluation metrics include:

```text
Precision
Recall
F1 Score
Match Rate
Exception Rate
False-positive financial value
False-negative financial value
```

This allows reconciliation quality to be measured rather than relying only on visual inspection.

---

# 25. Automation Philosophy

CashSight is designed around **explainable financial automation**.

The automated workflow is:

```text
Upload
  ↓
Schema Detection
  ↓
Validation
  ↓
3-Way Reconciliation
  ↓
Exception Classification
  ↓
Tax/Fee Calculation
  ↓
Cash Position
  ↓
Scenario Forecast
  ↓
Report Generation
  ↓
Audit Trail
```

The key principle is:

> **Automate high-confidence operations while preserving uncertain cases for human review.**

This is particularly important for financial data, where an incorrect automatic match can be more harmful than an explicit exception.

---

# 26. What Makes the Architecture AI-Ready

The current prototype does not use a trained AI/ML model or LLM.

Instead, the current architecture establishes a structured and explainable financial control layer.

```text
                 Current System
                       │
                       ▼
             Trusted Financial Signals
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Reconciliation   Exceptions    Cash History
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                 Future AI Layer
```

Future AI/ML capabilities can consume structured outputs from the existing reconciliation engine rather than operating directly on unvalidated raw financial data.

Potential future capabilities include:

* Historical-data-driven cash forecasting
* Probabilistic forecasting
* Learned anomaly detection
* Intelligent exception prioritization
* AI-assisted exception explanations
* Continuous reconciliation
* Cash-risk prediction

This keeps the deterministic financial control layer as the source of trusted signals while allowing intelligence to be added progressively.

---

# 27. Current Limitations

CashSight is currently a working prototype, and several areas would need to evolve for production scale.

### Storage

Current:

```text
In-memory upload cache
```

Future:

```text
Persistent transactional database
```

### Forecasting

Current:

```text
Deterministic synthetic scenario generation
```

Future:

```text
Historical-data-driven probabilistic forecasting
```

### Scale

Current:

```text
Python in-process reconciliation
```

Future:

```text
Background jobs
Persistent processing
Scalable workers
```

### Data sources

Current:

```text
CSV-based financial data
```

Future:

```text
Payment gateway APIs
Bank APIs
ERP/accounting integrations
Scheduled ingestion
```

---

# 28. Future Architecture

The long-term architecture can evolve toward:

```text
Payment Gateway APIs ─────┐
                          │
Bank APIs ────────────────┤
                          ▼
ERP / Ledger APIs ───► Data Ingestion Layer
                          │
                          ▼
                   Data Validation
                          │
                          ▼
              Reconciliation Engine
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        Matches      Exceptions    Financial Data
             │            │            │
             └────────────┼────────────┘
                          ▼
                    Intelligence
             ┌────────────┼────────────┐
             ▼            ▼            ▼
          ML Forecast  Anomaly AI   AI Explanation
             │            │            │
             └────────────┼────────────┘
                          ▼
                  Finance Controller
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
        Alerts        Dashboard      Reports
```

The objective is to move from periodic manual reconciliation toward continuous finance operations intelligence.

---

# 29. Design Principles

CashSight follows five core principles:

### 1. Reconcile before forecasting

Forecasting should be grounded in the best available financial state rather than raw, potentially inconsistent data.

### 2. Explain rather than silently decide

Every automated financial classification should have an understandable reason.

### 3. Preserve ambiguity

When multiple matches are possible, the system should expose the ambiguity instead of forcing a match.

### 4. Measure accuracy

Reconciliation quality should be evaluated using ground truth and financial-impact metrics.

### 5. Keep humans in control

High-confidence cases can be automated, while uncertain financial decisions remain reviewable by the user.

---

# 30. Summary

CashSight transforms fragmented merchant financial records into a structured finance-operations workflow:

```text
Fragmented Financial Data
          ↓
Data Quality
          ↓
3-Way Reconciliation
          ↓
Matches + Honest Exceptions
          ↓
Human Resolution
          ↓
Tax & Fee Intelligence
          ↓
Current Cash Position
          ↓
7-Day Scenario Forecast
          ↓
Audit Trail
          ↓
Financial Reports
```

The current implementation prioritizes **deterministic, explainable and auditable automation**. The architecture is intentionally designed so that future AI/ML capabilities can be introduced on top of trusted reconciliation outputs rather than replacing the underlying financial controls.

---

## Project

**CashSight — Automated Finance Reconciliation & Cash Intelligence**

**Track:** Track 04 — AI Finance Controller

**Core idea:** Close the finance-operations loop from fragmented transaction data to reconciliation, exception handling, cash visibility and actionable financial reporting.
