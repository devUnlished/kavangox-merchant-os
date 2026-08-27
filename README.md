# KavangoX Merchant OS (React Native Expo)

**Offline-First African Commerce Operating System** built with React Native Expo, TypeScript, Async Storage / SQLite persistence, and 9-tier RBAC security.

---

## 🚀 Key Features & Architectural Highlights

1. **Dashboard & Command Desk (FR-1):**
   - Real-time revenue aggregation and inflow/outflow balance.
   - High-performance **SVG / Canvas 7-Day Revenue Progression Chart** (Zero external charting library dependencies).
   - Business Health (94/100) & KYB Trust score tracking with pre-approved working capital limits.
   - Low-stock operational banners with 1-tap reorder routing.

2. **Point of Sale & Multi-Tender Checkout Engine (FR-2):**
   - Instant SKU catalog search and category filtering.
   - Barcode scanning simulator + hardware barcode scanner support.
   - Multi-method tender processing: **Cash** (with automated change computation), **Mobile Money / e-Wallets** (FNB eWallet, M-Pesa, BlueWallet), **Digital Wallets**, **Bank Transfer (EFT)**, and **Store Credit Tabs**.
   - Customer loyalty point accumulation (1 point per N$10 spent) and tab debt tracking.
   - Itemized Digital Tax Invoice Receipts with Namibian standard 15% VAT and simulated WhatsApp/SMS dispatch.

3. **Inventory Labs & Warehouse Tracking (FR-3):**
   - SKU lifecycle management with FIFO cost price, retail price, current stock, and safety alert thresholds.
   - **Bulk CSV Stock Ingestion** with template loader, live line parser, and batch ledger integration.
   - Automated Cashbook hook: stock adjustments and new batches automatically log `STOCK_PURCHASE` expenses.

4. **Smart Regional Procurement & Wholesale Marketplace (FR-4):**
   - Verified Regional FMCG Supplier Directory (Namib Mills, Namibia Breweries, Bokomo, Meatco, Unilever).
   - Automated Purchase Order (PO) pipeline with 1-tap approval and automatic inventory restock.
   - Real-time Promotional Feed with 1-tap deal redemption (Pallet specials, flash rebates, bakery kits).

5. **Logistics & Fleet Telematics (FR-5):**
   - Consignment waypoint tracking between regional hubs (Walvis Bay Port $\rightarrow$ Windhoek $\rightarrow$ Otjiwarongo $\rightarrow$ Rundu).
   - Fleet driver roster and route assignment.
   - In-app **Proof of Delivery (POD)** interactive signature canvas.

6. **Double-Entry Cashbook Ledger & Financial Intelligence (FR-6):**
   - Full double-entry transaction classification (`RETAIL_SALE`, `STOCK_PURCHASE`, `RENT`, `UTILITIES`, `SALARY`, `LOGISTICS_FEE`).
   - Real-time Gross Margin, Net Profit, and P&L analysis.
   - Customer informal store credit tab ledger with repayment logs.

7. **Communications Hub & Context Linking (FR-7):**
   - Multi-threaded real-time chat with suppliers, fleet drivers, and support agents.
   - **Rich Context Linking**: Embed active product SKUs, tax invoices/receipts, and freight waypoint trackers directly in messages.
   - Multi-channel notification center (In-App, SMS, Email) with priority filters (`CRITICAL`, `HIGH`, `MEDIUM`).
   - Dispute adjudication board & Support SLA timers.

8. **Embedded AI Business Advisor (Gemini 3.5 Flash) (FR-8):**
   - Context-injected AI consultant reading live stock levels, margin elasticity, low-stock warnings, and revenue metrics.
   - Presets for pricing elasticity, high-margin bundles, and stock turnover strategies.

9. **Adaptive 9-Tier Role-Based Access Control (RBAC) (FR-9):**
   - Merchant Owner, Executive, Enterprise Admin, Store Manager, Cashier, Procurement Officer, Warehouse Manager, Driver, Finance Officer.
   - Dynamic top-header role switcher and visual module gating.
   - Dual-pane tablet/desktop navigation rail and mobile bottom navigation bar.

---

## 🏃 Running the Application

### 1. Web
```bash
npm run web
```

### 2. Android
```bash
npm run android
```

### 3. iOS
```bash
npm run ios
```
