# KavangoX Merchant OS — Complete System Architecture

An enterprise-grade, offline-first operating system designed for Southern African (SADC) merchants, informal traders, and regional supply chain distributors.

---

## 1. High-Level System Architecture Diagram

```mermaid
graph TD
    subgraph Client Layer ["📱 Multi-Platform Client Layer (React Native Expo)"]
        UI_Phone["Mobile Client (iOS / Android)"]
        UI_Tablet["Tablet POS Terminal (POS Rail)"]
        UI_Web["Desktop / Web Portal (1080p Responsive Shell)"]
    end

    subgraph StateAndAuth ["🛡️ State Management & Security Layer"]
        AppContext["Global App Context (State Hub)"]
        RBAC["9-Tier RBAC Engine (Section 6 Auth Matrix)"]
        EventBus["Ledger Event Bus (Atomic Cross-Module Hooks)"]
    end

    subgraph OfflineSync ["🔄 Offline-First Persistence & Sync Engine"]
        AsyncStorage["AsyncStorage / SQLite Local DB"]
        SyncQueue["Local FIFO Sync Queue (sync_queue)"]
        SyncWorker["Background Auto-Sync Worker"]
        ConflictResolver["LWW (Last-Write-Wins) + CRDT Conflict Resolver"]
    end

    subgraph BusinessEngines ["⚙️ Core Domain Business Engines"]
        POS_Engine["POS & Multi-Tender Engine (Cash, eWallet, Tabs)"]
        Inv_Engine["Inventory Labs & FIFO Cost Valuation"]
        Procure_Engine["Smart Regional Procurement & PO Pipeline"]
        Logistics_Engine["Fleet Telematics & Proof of Delivery (POD)"]
        Finance_Engine["Double-Entry Cashbook Ledger & P&L"]
        Comms_Engine["Comms Hub with Context Linking"]
        AI_Engine["Gemini 3.5 Flash Business Advisor"]
    end

    subgraph ExternalServices ["🌐 External Gateways & SADC Cloud"]
        CloudLedger["KavangoX SADC Core Cloud"]
        WhatsAppGateway["SMS / WhatsApp Tax Invoice Dispatch"]
        SupplierAPIs["Regional Manufacturer EDI (Namib Mills, NBL, Meatco)"]
        BankEFT["Bank / Mobile Money Switch (FNB, M-Pesa)"]
    end

    ClientLayer --> StateAndAuth
    StateAndAuth --> BusinessEngines
    BusinessEngines --> OfflineSync
    OfflineSync --> ExternalServices
```

---

## 2. Multi-Tier Layered Architecture

### Tier 1: Client & Presentation Layer (React Native Expo 57)
- **Cross-Platform Compilation:** Shared TypeScript codebase compiled for Web (`react-native-web`), Android, and iOS.
- **Adaptive Responsive Layout (`NavigationLayout.tsx`):**
  - **Desktop / Tablet ( $\ge 768\text{px}$ ):** 210px fixed sidebar navigation rail with unread counter badges and status indicators.
  - **Mobile ( $< 768\text{px}$ ):** Sticky horizontal top category scroller + fixed bottom navigation dock.
  - **Centered App Container:** Max width bounded to $1040\text{px}$ to prevent stretching across ultrawide monitors.
- **Design System:** Palette composed of **Emerald Mint Green (`#059669` / `#10B981`)** for commerce and revenue, **Sapphire Blue (`#2563EB` / `#3B82F6`)** for logistics and trust, on Slate surfaces (`#1E293B`, `#0F172A`).

---

### Tier 2: State Management & 9-Tier RBAC Security Engine

```mermaid
classDiagram
    class UserRole {
        <<enumeration>>
        Merchant_Owner
        Executive
        Enterprise_Admin
        Store_Manager
        Cashier
        Procurement_Officer
        Warehouse_Manager
        Driver
        Finance_Officer
    }

    class AppContext {
        +UserRole userRole
        +Branch branch
        +boolean isOnline
        +canAccess(module, role) boolean
        +checkoutSale(...) Promise
        +adjustStock(...) Promise
        +recordTabRepayment(...) Promise
        +redeemPromotion(...) Promise
    }

    class RBACMatrix {
        +Dashboard: All 9 Roles
        +POS: Owner, Exec, Manager, Cashier
        +Inventory: Owner, Exec, Manager, Procurement, Warehouse
        +Procurement: Owner, Exec, Manager, Procurement
        +Marketplace: Owner, Manager, Procurement
        +Logistics: Owner, Manager, Warehouse, Driver
        +Finance: Owner, Exec, Finance
        +Communications: Owner, Manager, Cashier
        +Enterprise: All Roles
    }

    AppContext --> UserRole
    AppContext --> RBACMatrix
```

---

### Tier 3: Offline-First Persistence & Sync Engine

```mermaid
sequenceDiagram
    autonumber
    actor Cashier
    participant POS as POS Screen
    participant Context as AppContext / State
    participant LocalDB as AsyncStorage / SQLite
    participant Queue as Local sync_queue
    participant Cloud as SADC Core Cloud

    Cashier->>POS: Tap "Pay N$149.95" (Cash / Store Tab / eWallet)
    POS->>Context: checkoutSale(payMethod, customerId, discount)
    Context->>Context: Deduct SKU stockQty in memory
    Context->>Context: Increment Customer Loyalty (+1 pt per N$10)
    alt Is Store Credit Tab
        Context->>Context: Increment customer.outstandingDebt
    end
    Context->>Context: Append CashTransaction (INCOME: RETAIL_SALE)
    Context->>LocalDB: Commit SalesReceipt + Product + CashTransaction
    Context->>Queue: Push SyncItem (action: "SYNC_SALE", isSynced: false)
    
    alt Device is Online
        Context->>Cloud: POST /api/v1/sync (Batch payload)
        Cloud-->>Context: HTTP 200 OK (Acknowledge)
        Context->>LocalDB: Update SyncItem (isSynced = true)
        Context->>Queue: Remove / Flush item
    else Device is Offline
        Note over Context,Queue: Sale immediately confirmed locally; UI operates normally
    end
```

---

## 3. Entity-Relationship Data Model (ERD)

```mermaid
erDiagram
    PRODUCT ||--o{ SALE_ITEM : "contains"
    SALES_RECEIPT ||--|{ SALE_ITEM : "itemizes"
    CUSTOMER ||--o{ SALES_RECEIPT : "makes"
    CUSTOMER ||--o{ CASH_TRANSACTION : "repays_tab"
    SUPPLIER ||--o{ PURCHASE_ORDER : "supplies"
    PURCHASE_ORDER ||--|{ PO_ITEM : "specifies"
    PRODUCT ||--o{ PO_ITEM : "ordered_in"
    CONSIGNMENT ||--|{ WAYPOINT : "traverses"
    DRIVER ||--o{ CONSIGNMENT : "operates"
    BRANCH ||--o{ STAFF_MEMBER : "employs"
    CHAT_THREAD ||--|{ CHAT_MESSAGE : "contains"

    PRODUCT {
        string id PK
        string barcode UK
        string name
        string category
        float costPrice
        float sellPrice
        int stockQty
        int minStockAlert
        string supplierId FK
        string unit
    }

    SALES_RECEIPT {
        string id PK
        string customerId FK
        string sellerName
        int timeStamp
        string paymentMethod
        float totalAmount
        float discountAmount
        float cashTendered
        float changeGiven
        boolean isSynced
    }

    CUSTOMER {
        string id PK
        string name
        string phone UK
        int loyaltyPoints
        float outstandingDebt
        float creditLimit
        float totalPurchases
    }

    CASH_TRANSACTION {
        string id PK
        string transactionType "INCOME | EXPENSE"
        string category "RETAIL_SALE | STOCK_PURCHASE | RENT | UTILITIES | SALARY | LOGISTICS_FEE"
        float amount
        string description
        int timeStamp
        string referenceId
    }

    CONSIGNMENT {
        string trackingId PK
        string origin
        string destination
        string driverId FK
        string vehiclePlate
        string cargoDescription
        string status "ORDER_PLACED | DISPATCHED | IN_TRANSIT | DELIVERED"
        string eta
        string podSignature
        string podSigneeName
    }

    CHAT_MESSAGE {
        string id PK
        string threadId FK
        string senderId
        string messageText
        int timeStamp
        json linkedProduct
        json linkedDeliveryTracker
    }
```

---

## 4. Cross-Module Atomic Ledger Event Bus

Every domain action in KavangoX Merchant OS logs corresponding entries across multiple modules:

| User Action | Inventory Effect | Double-Entry Cashbook Effect | Customer / CRM Effect | Comms / Alert Effect |
| :--- | :--- | :--- | :--- | :--- |
| **POS Retail Sale** | `stockQty -= quantity` | `+amount` as `INCOME: RETAIL_SALE` | `+loyaltyPoints`; if Store Tab, `+outstandingDebt` | If stock $\le$ buffer, triggers Low-Stock alert |
| **Store Tab Repayment** | None | `+amount` as `INCOME: TAB_REPAYMENT` | `-outstandingDebt` | Customer debt receipt logged |
| **Restock / PO Approval** | `stockQty += quantity` | `-amount` as `EXPENSE: STOCK_PURCHASE` | None | Supplier notified in Comms Hub |
| **Marketplace Deal Claim** | `stockQty += minOrderQty` | `-promoPrice` as `EXPENSE: STOCK_PURCHASE` | None | Deal redemption thread in Chat |
| **POD Signature** | Freight Status $\rightarrow$ `DELIVERED` | None | None | Delivery completed event broadcast |

---

## 5. Embedded AI Business Advisor (Gemini 3.5 Flash Engine)

- **Context-Injected Advisor (`AiConsultantModal.tsx`):**
  - Live metric injection: Current Realized Revenue, Inventory FIFO Valuation, Gross Margin %, Safety Threshold Alerts, and Total Informal Debt.
  - Generates actionable commercial advice tailored to the Southern African retail environment (pricing elasticity between beverages and staples, bulk FMCG consolidation, and 50% deposit policies for informal store credit tabs).

---

## 6. Directory Structure & Technology Stack

```
kavangox merchant os/
├── App.tsx                          # Root App Shell & Viewport Manager
├── index.ts                         # Expo Application Entry Point
├── server.js                        # Zero-dependency High-Performance Static Web Server
├── package.json                     # Expo SDK 57 & React Native 0.86 Dependencies
├── SYSTEM_ARCHITECTURE.md           # Complete Architecture Specification
├── src/
│   ├── types/index.ts               # Complete TypeScript Definitions & Domain Models
│   ├── theme/colors.ts              # Emerald Green & Sapphire Blue Color Palette
│   ├── database/
│   │   ├── seedData.ts              # Authentic Namibian Seed Dataset (SKUs, Suppliers, Freight)
│   │   └── storage.ts               # Offline-First AsyncStorage / SQLite Repository
│   ├── context/
│   │   └── AppContext.tsx           # Global State, 9-Tier RBAC, & Transaction Action Bus
│   ├── components/
│   │   ├── Header.tsx               # Minimalist Header & Unified Settings Modal
│   │   ├── NavigationLayout.tsx     # Adaptive Desktop Sidebar & Docked Mobile Navigation
│   │   ├── CanvasRevenueChart.tsx   # Pure SVG Canvas 7-Day Revenue Progression Chart
│   │   ├── BarcodeScannerModal.tsx  # Viewfinder Simulator & Hardware Barcode Gun Input
│   │   ├── DigitalReceiptModal.tsx  # Tax Invoice Layout (15% VAT & WhatsApp Share)
│   │   ├── ProofOfDeliveryModal.tsx # Interactive SVG Signature Canvas Pad
│   │   ├── BulkCsvModal.tsx         # Bulk CSV Parser & Ledger Integrator
│   │   └── AiConsultantModal.tsx    # Context-Injected Gemini 3.5 Flash Advisor
│   └── screens/
│       ├── DashboardScreen.tsx      # Command Desk (KPIs & Transit Streams)
│       ├── PosScreen.tsx            # POS Catalog & Multi-Tender Checkout Register
│       ├── InventoryScreen.tsx      # Inventory Labs & FIFO Valuation
│       ├── ProcurementScreen.tsx    # Regional Supplier Directory & PO Approval
│       ├── MarketplaceScreen.tsx    # Wholesale Feed & 1-Tap Promo Redemption
│       ├── LogisticsScreen.tsx      # Freight Waypoints & Fleet POD
│       ├── FinanceScreen.tsx        # Double-Entry Cashbook & Customer Debt Ledger
│       ├── CommunicationsScreen.tsx # Multi-party Chat with Context Linking
│       └── EnterpriseScreen.tsx     # 9-Tier RBAC Matrix & Multi-Branch Network
```
