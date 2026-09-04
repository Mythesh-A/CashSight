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

# 19. Backend Architecture & Module Structure

The CashSight backend is implemented using Python and Flask. The backend is organized into domain-specific modules so that CSV ingestion, validation, reconciliation, forecasting, tax analysis, reporting, and human review remain separated and maintainable.

```text
backend/
├── audit/
│   ├── __init__.py
│   ├── logger.py
│   └── trail.py
│
├── forecasting/
│   ├── __init__.py
│   └── forecast_pipeline.py
│
├── human_loop/
│   ├── __init__.py
│   ├── exception_resolver.py
│   └── verified_matches.py
│
├── import_schema/
│   ├── __init__.py
│   ├── column_mapper.py
│   ├── csv_analyzer.py
│   └── schema_matcher.py
│
├── reconciliation/
│   ├── __init__.py
│   ├── ambiguity_resolver.py
│   ├── bank_matcher.py
│   ├── orphan_checker.py
│   ├── pipeline.py
│   └── subset_sum_matcher.py
│
├── reports/
│   ├── __init__.py
│   ├── forecast_report.py
│   ├── full_report.py
│   ├── generator.py
│   ├── reconciliation_report.py
│   ├── routes.py
│   └── tax_fee_report.py
│
├── tax_analyzer/
│   ├── __init__.py
│   ├── analyzer.py
│   └── routes.py
│
├── validation/
│   ├── __init__.py
│   ├── data_validator.py
│   └── quality_report.py
│
├── __init__.py
├── app.py
├── config.py
├── explain.py
├── models.py
├── routes.py
└── score.py
```

## Backend Module Responsibilities

| Module                  | Responsibility                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `import_schema/`        | Analyzes uploaded CSV files, detects schemas, suggests column mappings, and normalizes input structure.                    |
| `validation/`           | Validates required fields, data types, dates, numeric values, duplicates, and financial consistency before reconciliation. |
| `reconciliation/`       | Implements the core three-way reconciliation between ledger, settlements, and bank transactions.                           |
| `subset_sum_matcher.py` | Searches for combinations of ledger orders that explain a settlement's gross amount.                                       |
| `bank_matcher.py`       | Matches settlements with bank credits using UTR, amount tolerance, and date-window rules.                                  |
| `ambiguity_resolver.py` | Detects cases where multiple valid ledger combinations exist instead of forcing an incorrect match.                        |
| `orphan_checker.py`     | Identifies bank credits that cannot be linked to a settlement.                                                             |
| `human_loop/`           | Handles manual investigation and confirmation/rejection of unresolved or ambiguous exceptions.                             |
| `forecasting/`          | Generates the current 7-day cash-position scenario forecast from reconciled and pending amounts.                           |
| `tax_analyzer/`         | Analyzes gateway fees, GST, TDS, deductions, and settlement-level financial consistency.                                   |
| `reports/`              | Generates reconciliation, forecasting, tax & fee, and full PDF reports.                                                    |
| `audit/`                | Records important system actions and maintains an auditable activity trail.                                                |
| `explain.py`            | Provides explanations for reconciliation results and exceptions.                                                           |
| `score.py`              | Calculates evaluation metrics such as precision, recall, F1, match rate, and monetary error metrics.                       |
| `models.py`             | Contains shared backend data structures and application models.                                                            |
| `routes.py`             | Defines the main Flask API routes used by the frontend.                                                                    |
| `app.py`                | Initializes and configures the Flask application.                                                                          |
| `config.py`             | Stores application-level configuration.                                                                                    |

The backend follows a pipeline-oriented architecture:

```text
CSV Upload
    ↓
Schema Detection & Column Mapping
    ↓
Data Validation
    ↓
Reconciliation Pipeline
    ├── Settlement ↔ Bank Matching
    ├── Settlement ↔ Ledger Matching
    ├── Ambiguity Resolution
    └── Orphan Detection
    ↓
Exception Classification
    ↓
Human Review When Required
    ↓
Cash Position
    ↓
Forecasting / Tax Analysis / Reporting / Audit
```

This separation allows each financial operation to be independently tested and extended without tightly coupling the entire reconciliation workflow.

---

# 20. Frontend Architecture & Component Structure

The CashSight frontend is built using React with Vite. The frontend is organized into feature-based components, reusable hooks, shared state, API services, and utility modules.

```text
frontend/
├── src/
│   ├── api/
│   │   ├── endpoints.js
│   │   ├── index.js
│   │   └── services.js
│   │
│   ├── components/
│   │   ├── audit/
│   │   │   ├── AuditDetails.jsx
│   │   │   ├── AuditPage.jsx
│   │   │   ├── AuditTrail.jsx
│   │   │   ├── constants.js
│   │   │   ├── index.js
│   │   │   └── styles.js
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── constants.js
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── index.js
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── typography.js
│   │   │
│   │   ├── dashboard/
│   │   │   ├── CashPositionCard.jsx
│   │   │   ├── constants.js
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ExceptionSummaryCard.jsx
│   │   │   ├── index.js
│   │   │   ├── MatchSummaryCard.jsx
│   │   │   ├── MetricsPanel.jsx
│   │   │   └── styles.js
│   │   │
│   │   ├── exceptions/
│   │   │   ├── constants.js
│   │   │   ├── ExceptionDetails.jsx
│   │   │   ├── ExceptionFilters.jsx
│   │   │   ├── ExceptionInbox.jsx
│   │   │   ├── ExceptionResolver.jsx
│   │   │   ├── ExceptionTable.jsx
│   │   │   ├── index.js
│   │   │   ├── ResolutionGuide.jsx
│   │   │   └── styles.js
│   │   │
│   │   ├── forecast/
│   │   │   ├── CashFlowProjection.jsx
│   │   │   ├── constants.js
│   │   │   ├── ForecastChart.jsx
│   │   │   ├── ForecastSummary.jsx
│   │   │   ├── index.js
│   │   │   └── styles.js
│   │   │
│   │   ├── layout/
│   │   │   ├── index.js
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── matches/
│   │   │   ├── index.js
│   │   │   ├── MatchDetails.jsx
│   │   │   ├── MatchInbox.jsx
│   │   │   └── MatchTable.jsx
│   │   │
│   │   ├── reports/
│   │   │   ├── index.js
│   │   │   ├── ReportCard.jsx
│   │   │   └── ReportsPage.jsx
│   │   │
│   │   ├── tax/
│   │   │   ├── index.js
│   │   │   ├── TaxAnalyzer.jsx
│   │   │   ├── TaxDetails.jsx
│   │   │   ├── TaxMonthly.jsx
│   │   │   ├── TaxSummary.jsx
│   │   │   └── TaxTable.jsx
│   │   │
│   │   └── upload/
│   │       ├── ColumnMapper.jsx
│   │       ├── constants.js
│   │       ├── CSVUploader.jsx
│   │       ├── DataQualityReport.jsx
│   │       ├── FileDropZone.jsx
│   │       ├── index.js
│   │       └── styles.js
│   │
│   ├── context/
│   │   ├── AppContext.jsx
│   │   ├── constants.js
│   │   ├── DataContext.jsx
│   │   ├── index.js
│   │   └── ThemeContext.jsx
│   │
│   ├── hooks/
│   │   ├── constants.js
│   │   ├── index.js
│   │   ├── useCashPosition.js
│   │   ├── useDebounce.js
│   │   ├── useExceptions.js
│   │   ├── useFileUpload.js
│   │   ├── useForecast.js
│   │   ├── useInterval.js
│   │   ├── useLocalStorage.js
│   │   ├── useNotification.js
│   │   ├── usePrevious.js
│   │   ├── useReconciliation.js
│   │   └── useWindowSize.js
│   │
│   ├── styles/
│   │   ├── components.css
│   │   ├── index.css
│   │   └── variables.css
│   │
│   ├── types/
│   │   └── index.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── helpers.js
│   │   ├── index.js
│   │   └── validators.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
│
├── .eslintrc.cjs
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Frontend Module Responsibilities

| Module                   | Responsibility                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/`                   | Centralizes backend endpoints and API service calls.                                                                                        |
| `components/upload/`     | Handles CSV upload, drag-and-drop, column mapping, file processing, and data-quality presentation.                                          |
| `components/dashboard/`  | Displays cash position, reconciliation metrics, matched amounts, and exception summaries.                                                   |
| `components/exceptions/` | Provides exception inbox, filtering, investigation, candidate matches, and resolution workflows.                                            |
| `components/matches/`    | Displays reconciled matches and their supporting details.                                                                                   |
| `components/forecast/`   | Presents the 7-day cash-position forecast and forecast summaries.                                                                           |
| `components/tax/`        | Displays tax, fee, GST, TDS, deduction, and monthly analysis.                                                                               |
| `components/reports/`    | Provides report selection and report download functionality.                                                                                |
| `components/audit/`      | Displays audit history, actions, and detailed audit information.                                                                            |
| `components/common/`     | Contains reusable UI components, loading states, status indicators, and error handling.                                                     |
| `components/layout/`     | Provides application navigation and sidebar layout.                                                                                         |
| `context/`               | Manages shared application, data, and theme state.                                                                                          |
| `hooks/`                 | Contains reusable frontend logic for uploads, reconciliation, exceptions, forecasting, cash position, notifications, and other UI behavior. |
| `utils/`                 | Provides formatting, validation, constants, and general helper functions.                                                                   |
| `styles/`                | Contains global and component-level styling.                                                                                                |
| `types/`                 | Defines shared frontend data structures.                                                                                                    |
| `routes.jsx`             | Defines frontend application routes.                                                                                                        |
| `App.jsx`                | Root React application component.                                                                                                           |
| `main.jsx`               | Frontend entry point.                                                                                                                       |

### Frontend-to-Backend Interaction

The frontend communicates with the Flask backend through the centralized API layer:

```text
React UI
   ↓
Feature Components
   ↓
Custom Hooks / Context
   ↓
API Services
   ↓
Flask REST API
   ↓
Backend Processing Modules
   ↓
JSON Response
   ↓
React State Update
   ↓
UI / Dashboard / Reports
```

This architecture keeps presentation logic separate from financial processing logic. The frontend is responsible for interaction, visualization, workflow management, and user feedback, while the backend remains responsible for validation, reconciliation, financial analysis, forecasting logic, exception processing, audit logging, and report generation.

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

# 28. Future Enhancements

CashSight is currently focused on deterministic, explainable reconciliation using structured CSV data. The following enhancements would extend the system toward a production-grade payment and finance-operations platform.

### 28.1 Payment Gateway & API Integrations

The current CSV-based ingestion can be extended to direct integrations with payment gateways such as Razorpay and other payment providers, as well as banks and accounting systems.

Future capabilities could include:

* Automatic settlement and transaction ingestion through APIs and webhooks
* Scheduled or near real-time reconciliation
* Support for multiple payment gateways and bank accounts
* Automatic detection of newly generated settlements and bank credits
* Unified reconciliation across multiple payment sources

This would reduce dependency on manual file uploads and allow finance teams to continuously monitor their payment flows.

### 28.2 AI-Assisted Exception Investigation

An AI layer can be introduced on top of the existing deterministic reconciliation engine.

The AI system could:

* Explain why a transaction failed to reconcile
* Summarize supporting transaction evidence
* Suggest likely candidate matches
* Recommend possible resolutions
* Generate investigation summaries for finance teams
* Answer natural-language questions about reconciliation results

The deterministic engine would remain responsible for financial calculations and matching, while AI would assist with investigation and decision support.

### 28.3 Historical ML-Based Cash Forecasting

The current forecast uses deterministic scenarios because the prototype does not contain sufficient historical data for reliable statistical forecasting.

With sufficient production history, CashSight could introduce machine-learning models using:

* Payment and order volumes
* Settlement timing patterns
* Historical cash inflows
* Refunds and reversals
* Fees and deductions
* Day-of-week and seasonal patterns
* Merchant-specific payment behavior

This could evolve the current scenario forecast into a statistically calibrated cash-flow prediction system.

### 28.4 Intelligent Exception Prioritization

As transaction volumes increase, finance teams may receive thousands of exceptions. Future versions could automatically rank exceptions based on business impact.

Prioritization could consider:

* Transaction value
* Exception age
* Financial exposure
* Historical recurrence
* Probability of being a genuine mismatch
* Merchant or payment-source impact

This would allow finance teams to focus on the most important reconciliation issues first.

### 28.5 Learning from Human Resolutions

The existing human-in-the-loop workflow can become a feedback mechanism.

Confirmed and rejected resolutions could be stored as structured feedback and later used to:

* Improve matching suggestions
* Identify recurring reconciliation patterns
* Reduce repeated false positives
* Improve exception classification
* Train future machine-learning models

This creates a continuous improvement loop where every verified financial decision can make future automation more accurate.

### 28.6 Proactive Settlement & Cash Alerts

Instead of only identifying problems after reconciliation, CashSight could proactively detect potential cash-flow risks.

Examples include:

* Settlement not received within the expected settlement window
* Unusual reduction in payment inflows
* Unexpected increase in gateway fees or deductions
* Large unresolved reconciliation exposure
* Forecasted cash falling below a configured threshold
* Repeated failures associated with a particular payment source

This would help finance teams identify operational issues before they become significant cash-flow problems.

### 28.7 Multi-Gateway & Multi-Bank Reconciliation

Businesses frequently operate across multiple payment channels and bank accounts.

Future versions could provide a unified reconciliation layer for:

* Multiple payment gateways
* Multiple bank accounts
* Different settlement formats
* Provider-specific fee structures
* Different currencies and payment methods
* Cross-account transaction tracking

This would provide a single financial view instead of requiring separate reconciliation workflows for each provider.

### 28.8 Automated Finance Operations

CashSight could eventually move beyond analysis toward controlled workflow automation.

Potential capabilities include:

* Scheduled reconciliation jobs
* Automatic report generation
* Automated exception notifications
* Daily cash-position summaries
* Configurable finance rules
* Webhook-triggered processing
* Automated escalation of high-value exceptions

Human approval would remain part of workflows involving ambiguous or financially sensitive decisions.

### 28.9 Production-Grade Data & Security Infrastructure

The current prototype uses in-memory processing. A production deployment would require persistent and scalable infrastructure.

Future improvements include:

* PostgreSQL-based persistent storage
* Object storage for uploaded files and reports
* Role-based access control
* Merchant and account-level permissions
* Immutable audit records
* Encryption and secure credential management
* Data retention and archival policies
* Background job processing

### 28.10 Long-Term Product Direction

The long-term vision is to evolve CashSight from a CSV-based reconciliation application into an intelligent finance-operations control layer connecting payment gateways, banks, and business systems.

```text
Payment Gateways + Banks + ERP Systems
                ↓
       API / Webhook Ingestion
                ↓
        Data Quality & Validation
                ↓
       Deterministic Reconciliation
                ↓
       Exception Detection
                ↓
     ┌──────────┴──────────┐
     ↓                     ↓
AI-Assisted Review     ML Cash Forecasting
     ↓                     ↓
Human Verification     Risk & Alerts
     └──────────┬──────────┘
                ↓
       Finance Control Layer
                ↓
     Reports + Audit + Automation
```

The core principle is to keep financial calculations and reconciliation decisions explainable and deterministic, while progressively introducing AI and machine learning for investigation, prioritization, prediction, and workflow automation.

---

# 29. Future Architecture

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

# 30. Design Principles

CashSight follows five core principles:

### I. Reconcile before forecasting

Forecasting should be grounded in the best available financial state rather than raw, potentially inconsistent data.

### II. Explain rather than silently decide

Every automated financial classification should have an understandable reason.

### III. Preserve ambiguity

When multiple matches are possible, the system should expose the ambiguity instead of forcing a match.

### IV. Measure accuracy

Reconciliation quality should be evaluated using ground truth and financial-impact metrics.

### V. Keep humans in control

High-confidence cases can be automated, while uncertain financial decisions remain reviewable by the user.

---

# 31. Summary

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
