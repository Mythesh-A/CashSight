# 💰 CashSight

### Automated Finance Reconciliation & Cash Intelligence

CashSight is a finance-operations platform that automates reconciliation across merchant orders, payment gateway settlements, and bank transactions. It validates financial data, identifies matches, detects batched settlements, highlights missing or unlinked transactions, and provides an exception management workflow for investigating and resolving discrepancies. It also provides cash-position visibility by showing reconciled, pending, and expected cash.

Beyond reconciliation, CashSight analyzes gateway fees, GST, TDS, and settlement deductions, maintains a complete audit trail of important activities, and provides a 7-day cash-position forecast with conservative, central, and optimistic scenarios. Users can also generate and download PDF reports covering reconciliation results, forecasting, tax and fee analysis, or the complete financial workflow.

---

# 🎯 What Problem Does It Solve?

Finance teams often reconcile payment gateway settlements, merchant orders, and bank statements manually across spreadsheets.

This can make it difficult to quickly identify:

* 💸 Missing bank credits
* 🔗 Unlinked bank transactions
* 📦 Batched settlements
* ⚠️ Ambiguous matches
* 🧮 Settlement calculation discrepancies
* 💰 Gateway fees and deductions
* 📊 Outstanding cash exposure

CashSight brings these workflows into a single reconciliation and cash-intelligence system.

---

# ✨ Key Capabilities

| Capability                          | Description                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| 🔄 **3-Way Reconciliation**         | Matches merchant ledger, payment settlements, and bank transactions.                 |
| 📦 **Batched Settlement Detection** | Identifies settlements containing multiple orders.                                   |
| ⚠️ **Exception Management**         | Detects and organizes unresolved financial discrepancies.                            |
| 👤 **Human-in-the-Loop Resolution** | Allows users to investigate and resolve ambiguous cases.                             |
| 💰 **Cash Position**                | Shows reconciled cash, pending cash, and expected cash.                              |
| 📈 **7-Day Cash Forecast**          | Provides conservative, central, and optimistic cash-position scenarios.              |
| 🧾 **Tax & Fee Analysis**           | Analyzes gateway fees, GST, TDS, deductions, and settlement consistency.             |
| 📝 **Audit Trail**                  | Records important system activities and user resolutions.                            |
| 📄 **Financial Reports**            | Generates downloadable reconciliation, forecasting, tax & fee, and full PDF reports. |
| 🎯 **Accuracy Evaluation**          | Uses controlled ground-truth data to evaluate reconciliation performance.            |

---

# 🌐 Live Web App

**🚀 Hosted using Netlify (Frontend) + Render (Backend)**

### 👉 <u>[Open CashSight](https://cashsight-razorpay-buildathon.netlify.app/)</u>

> ⚠️ **Note:** The backend is hosted on Render's free tier. If the backend has been inactive, the first request may take approximately **50 seconds** to wake up. Please wait for the backend to initialize before uploading or processing data.

### 🚀 Quick Demo

CashSight includes a built-in **Use Sample Data** option.

Open the live application and select **Use Sample Data** to explore the reconciliation workflow immediately without downloading or uploading any files.

For testing the complete CSV upload workflow, you can use the provided datasets below.

---

# 📂 Demo Datasets

CashSight includes three manually prepared datasets for testing the CSV upload and reconciliation workflow at different scales.

| Dataset | Recommended Use            |
| ------- | -------------------------- |
| Small   | Quick demonstration        |
| Medium  | Realistic workflow testing |
| Large   | Higher-volume testing      |

Each dataset contains:

```text
ledger.csv
settlements.csv
bank_statement.csv
```

### 📥 Download Datasets

**GitHub Dataset Folder:**
👉 **[Download / View All CSV Datasets](https://github.com/Mythesh-A/CashSight/tree/main/.sample_csv_datas)**

**Google Drive:**
👉 **[Download All Dataset Files](https://drive.google.com/uc?export=download&id=10ztLrQ9h4z-I8KVjmwW4o2cmIk4Gyrxu)**

For the CSV workflow, download one complete dataset and upload all three files from the same dataset through the **CSV Upload** section.

> 💡 **Tip:** Start with the **Small** dataset for a quick walkthrough, then try the **Medium** or **Large** dataset to evaluate higher-volume reconciliation.

---

# 🛠️ How to Run Locally

### Prerequisites

* Python
* Node.js
* npm

### 1. Install Backend Requirements

From the project root:

```bash
cd CashSight
pip install -r requirements.txt
```

### 2. Start the Backend

```bash
cd backend
python app.py
```

The Flask backend will start locally.

### 3. Start the Frontend

Open another terminal:

```bash
cd CashSight/frontend
npm install
npm run dev
```

Open the local URL provided by Vite in your browser.

---

# 🏗️ Architecture

CashSight follows a modular architecture separating data ingestion, validation, reconciliation, exception handling, forecasting, tax analysis, reporting, and audit logging.

For the complete architecture, data flow, reconciliation logic, module structure, and design decisions:

👉 **[📖 View Architecture Documentation](architecture.md)**

---

# 🧩 What Broke & How I Solved It

One of the key challenges was handling cases where multiple combinations of ledger orders could produce the same settlement amount.

Instead of forcing the first possible match, CashSight detects the ambiguity and sends the case for human review. This prevents the system from silently creating potentially incorrect financial matches.

The project also handles different CSV column structures through schema detection and column mapping, allowing users to correct mappings before reconciliation.

---

# 🔮 Future Enhancements

* 🔌 Direct payment gateway and bank API integrations
* 🔄 Continuous reconciliation through APIs and webhooks
* 🤖 AI-assisted exception investigation
* 📈 Historical ML-based cash forecasting
* 🎯 Intelligent exception prioritization
* 🧠 Learning from human resolution feedback
* 🏦 Multi-gateway and multi-bank reconciliation
* 🚨 Proactive settlement and cash-flow alerts
* ☁️ Persistent production-grade storage and scheduled processing

---

# 💻 Tech Stack

* **Frontend:** React, Vite
* **Backend:** Python, Flask
* **Data Processing:** Python
* **Reports:** ReportLab
* **Deployment:** Netlify, Render
* **Version Control:** GitHub

---

# 🏆 Project

### **CashSight — Automated Finance Reconciliation & Cash Intelligence**

Built for the **Razorpay AI Buildathon — AI Finance Controller Track**.

> **Reconcile → Investigate → Understand → Forecast → Report**
