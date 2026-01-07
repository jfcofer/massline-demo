# SmartStock Mobile App — Comprehensive Design & Prototyping Guide

**Version:** 1.0  
**Purpose:** Complete specification for building a production-quality, navigable prototype  
**Target:** Claude Code and AI coding agents  
**Language:** English  

---

## Table of Contents

1. [Introduction & Objectives](#1-introduction--objectives)
2. [Mobile Architecture Overview](#2-mobile-architecture-overview)
3. [Data Model & Integration](#3-data-model--integration)
4. [Complete Functional Map](#4-complete-functional-map)
5. [UX/UI Design System](#5-uxui-design-system)
6. [Screen-by-Screen Specifications](#6-screen-by-screen-specifications)
7. [Navigation & Flow Diagrams](#7-navigation--flow-diagrams)
8. [Mock Data Schema](#8-mock-data-schema)
9. [Prototype Implementation Guide](#9-prototype-implementation-guide)
10. [Best Practices for Claude Code](#10-best-practices-for-claude-code)

---

## 1. Introduction & Objectives

### 1.1 What is SmartStock?

SmartStock is an integrated Warehouse Management System (WMS) designed for MASSLINE, an automotive parts company in Ecuador. It transforms inventory management from manual, error-prone processes into a digital, automated, traceable, and intelligent ecosystem.

### 1.2 Mobile App Purpose

The **SmartStock Mobile App** is the primary operational tool for warehouse personnel. It provides:

- **Real-time QR-based product tracking** — Every product and location has a unique QR code
- **Directed workflows** — System guides operators through receiving and dispatch operations
- **Instant inventory updates** — All scans immediately update the central database
- **Offline capability** — Transactions queue locally when connectivity is lost
- **Complete traceability** — "5W" logging (Who, What, When, Where, Why) for every movement

### 1.3 Problems Solved

| Problem | Solution |
|---------|----------|
| Product localization takes 20-30 minutes | Directed picking reduces to <5 minutes |
| 85% inventory accuracy | QR validation achieves 98-99% accuracy |
| Manual paper-based tracking | Digital real-time updates |
| Ambiguous product codes across departments | Unified Master Catalog with multi-code mapping |
| No traceability for discrepancies | Immutable transaction log with "5W" data |

### 1.4 Target Users

| Role | Permissions | Primary Functions |
|------|-------------|-------------------|
| **Operator** | Execute receiving/dispatch, query inventory, report discrepancies | Scanning, putaway, picking |
| **Supervisor** | All operator functions + approve adjustments, assign orders, view reports | Oversight, quality control |
| **Administrator** | Full access including catalog management, user management, system config | System administration |

---

## 2. Mobile Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (React Native)                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Receiving  │  │  Dispatch   │  │   Query     │  │  Profile   │ │
│  │   Module    │  │   Module    │  │   Module    │  │  Module    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │
│         │                │                │                │        │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐ │
│  │                    STATE MANAGEMENT (Redux)                    │ │
│  │            └── Offline-First with Local Persistence            │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│  ┌────────────────────────────┴───────────────────────────────────┐ │
│  │                      API SERVICE LAYER                         │ │
│  │    ├── REST API Client                                         │ │
│  │    ├── WebSocket (Real-time updates)                           │ │
│  │    └── Sync Queue (Offline transactions)                       │ │
│  └────────────────────────────┬───────────────────────────────────┘ │
└───────────────────────────────┼─────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js/Python)                      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Inventory  │  │ Transaction │  │  Putaway    │  │   Alert    │ │
│  │   Engine    │  │   Logger    │  │  Algorithm  │  │   Engine   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    INTEGRATION LAYER                            ││
│  │    ├── Legacy ERP Connector (Bidirectional)                     ││
│  │    ├── ETL for Catalog Sync                                     ││
│  │    └── External Services (Printing, Notifications)              ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                  │
├────────────────┬──────────────┬────────────────┬───────────────────┤
│   PostgreSQL   │    Redis     │   MongoDB      │   Elasticsearch   │
│   (Primary DB) │   (Cache)    │   (Logs/Docs)  │   (Full-text)     │
└────────────────┴──────────────┴────────────────┴───────────────────┘
```

### 2.2 Data Flow Patterns

#### Online Mode
```
User Action → Local State Update → API Call → Server Processing → 
→ Database Update → Response → State Confirmation → UI Update
```

#### Offline Mode
```
User Action → Local State Update → Queue Transaction → 
→ UI Shows "Pending Sync" → [Connectivity Restored] → 
→ Process Queue → Server Sync → Clear Queue → UI Confirmation
```

### 2.3 Sync Behavior

| Scenario | Behavior |
|----------|----------|
| **Online** | Immediate API calls, real-time updates |
| **Offline** | Transactions stored locally in Redux with AsyncStorage persistence |
| **Reconnection** | Queue processes FIFO, conflict resolution by timestamp |
| **Conflict** | Server wins for quantity conflicts; alerts user for manual review |

### 2.4 API Boundary Definitions

| Endpoint Category | Base Path | Auth | Rate Limit |
|-------------------|-----------|------|------------|
| Authentication | `/api/v1/auth` | None (login) / JWT (refresh) | 5/min |
| Products | `/api/v1/products` | JWT | 100/min |
| Locations | `/api/v1/locations` | JWT | 100/min |
| Transactions | `/api/v1/transactions` | JWT | 200/min |
| Orders | `/api/v1/orders` | JWT | 50/min |
| QR Generation | `/api/v1/qr` | JWT | 100/min |
| Reports | `/api/v1/reports` | JWT (Supervisor+) | 20/min |

---

## 3. Data Model & Integration

### 3.1 Core Entities

#### Product Entity
```typescript
interface Product {
  id: string;                    // UUID
  sku: string;                   // Internal SKU (primary identifier)
  codes: {
    internal: string;            // MASSLINE internal code
    vendor: string;              // Vendor/supplier code
    oem: string;                 // Original Equipment Manufacturer code
    barcode?: string;            // EAN/UPC if exists
  };
  name: string;
  description: string;
  category: {
    id: string;
    name: string;
    path: string[];              // Hierarchical path: ["Parts", "Brakes", "Pads"]
  };
  attributes: {
    weight: number;              // kg
    dimensions: {
      length: number;            // cm
      width: number;
      height: number;
    };
    requiresRefrigeration: boolean;
    isHazardous: boolean;
  };
  compatibility: {
    models: string[];            // ["Yamaha FZ150 2020-2024", "Honda CB125 2019-2024"]
    alternateProducts: string[]; // SKUs of alternatives
  };
  pricing: {
    cost: number;
    retail: number;
    currency: string;            // "USD"
  };
  inventory: {
    reorderPoint: number;
    safetyStock: number;
    maxQuantity: number;
    abcClass: "A" | "B" | "C";   // Rotation classification
  };
  media: {
    primaryImage: string;        // URL
    thumbnailImage: string;
    additionalImages: string[];
  };
  qrCode: string;                // Base64 or URL to QR image
  status: "active" | "inactive" | "discontinued";
  createdAt: string;             // ISO 8601
  updatedAt: string;
}
```

#### Location Entity (Hierarchical)
```typescript
interface WarehouseLocation {
  id: string;                    // UUID
  code: string;                  // Human-readable: "A-03-E2-N1"
  hierarchy: {
    warehouse: string;           // "Main Warehouse"
    zone: string;                // "A" (Zones A-D)
    aisle: string;               // "03"
    rack: string;                // "E2"
    level: string;               // "N1" (Level 1-5)
    bin?: string;                // Optional bin subdivision
  };
  type: "storage" | "receiving" | "dispatch" | "staging" | "returns";
  capacity: {
    maxUnits: number;
    maxWeight: number;           // kg
    maxVolume: number;           // cubic cm
    currentUtilization: number;  // 0.0 - 1.0
  };
  restrictions: {
    allowedCategories: string[]; // Product category IDs
    temperatureControlled: boolean;
    hazardousApproved: boolean;
  };
  coordinates: {
    x: number;                   // For map visualization
    y: number;
    floor: number;
  };
  qrCode: string;
  status: "active" | "maintenance" | "blocked";
}
```

#### Inventory Record
```typescript
interface InventoryRecord {
  id: string;
  productId: string;
  locationId: string;
  quantity: number;
  lot?: {
    number: string;
    manufactureDate?: string;
    expirationDate?: string;
    supplier: string;
    importDocument?: string;
  };
  condition: "new" | "damaged" | "returned" | "quarantine";
  lastMovement: string;          // ISO 8601
  lastCountedAt: string;
  lastCountedBy: string;         // User ID
}
```

#### Transaction Entity (Immutable)
```typescript
interface Transaction {
  id: string;                    // UUID
  type: "receiving" | "dispatch" | "adjustment" | "transfer" | "count";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  
  // 5W Traceability
  who: {
    userId: string;
    userName: string;
    role: string;
  };
  what: {
    productId: string;
    productSku: string;
    productName: string;
    quantity: number;
    previousQuantity?: number;
  };
  when: {
    createdAt: string;           // ISO 8601
    completedAt?: string;
    duration?: number;           // seconds
  };
  where: {
    fromLocation?: string;       // Location code
    toLocation?: string;
    warehouseId: string;
  };
  why: {
    orderReference?: string;     // PO number, dispatch order, etc.
    reason?: string;             // For adjustments
    notes?: string;
  };
  
  // Validation data
  validation: {
    locationQrScanned: boolean;
    productQrScanned: boolean;
    quantityConfirmed: boolean;
    photoAttached?: string;      // URL
  };
  
  // Related documents
  documents: {
    purchaseOrder?: string;
    dispatchOrder?: string;
    adjustmentApproval?: string;
  };
}
```

#### Order Entity (Picking/Dispatch)
```typescript
interface PickingOrder {
  id: string;
  orderNumber: string;           // "DP-2025-0145"
  type: "dispatch" | "transfer" | "internal_request";
  priority: "urgent" | "high" | "normal" | "low";
  status: "pending" | "assigned" | "in_progress" | "packed" | "dispatched" | "cancelled";
  
  requester: {
    id: string;
    name: string;
    department: string;          // "Tienda Centro", "Mantenimiento"
    contact: string;
  };
  
  destination: {
    name: string;
    address?: string;
    phone?: string;
  };
  
  items: PickingItem[];
  
  assignment: {
    operatorId?: string;
    operatorName?: string;
    assignedAt?: string;
    startedAt?: string;
    completedAt?: string;
  };
  
  route?: {
    sequence: number[];          // Optimized order of item indices
    estimatedDistance: number;   // meters
    estimatedTime: number;       // minutes
  };
  
  packaging: {
    packageCount: number;
    labelGenerated: boolean;
    labelQrCode?: string;
    photos: string[];
  };
  
  notes: string;
  createdAt: string;
  dueAt: string;
}

interface PickingItem {
  productId: string;
  productSku: string;
  productName: string;
  productImage: string;
  requestedQuantity: number;
  pickedQuantity: number;
  location: {
    code: string;
    zone: string;
    availableQuantity: number;
  };
  alternateLocations?: {
    code: string;
    quantity: number;
  }[];
  status: "pending" | "picked" | "partial" | "not_found" | "skipped";
  pickedAt?: string;
  discrepancy?: {
    type: "quantity_mismatch" | "not_found" | "damaged";
    reportedQuantity: number;
    reason: string;
  };
}
```

### 3.2 Integration Architecture

#### Legacy ERP Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEGACY ERP SYSTEM                            │
│              "MOTORCYCLE ASSEMBLY LINE OF ECUADOR S.A."         │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │  Accounting │  │  Purchasing │  │   Sales     │            │
│   │   Module    │  │    Module   │  │   Module    │            │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
└──────────┼────────────────┼────────────────┼────────────────────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                            ▼
           ┌────────────────────────────────┐
           │      INTEGRATION LAYER         │
           │  ┌──────────────────────────┐  │
           │  │   ETL Process (Nightly)  │  │   ← Catalog sync FROM Legacy
           │  │   - Product catalog      │  │
           │  │   - Purchase orders      │  │
           │  │   - Pricing updates      │  │
           │  └──────────────────────────┘  │
           │  ┌──────────────────────────┐  │
           │  │   API Sync (Real-time)   │  │   ← Stock updates TO Legacy
           │  │   - Inventory levels     │  │
           │  │   - Receiving confirms   │  │
           │  │   - Dispatch confirms    │  │
           │  └──────────────────────────┘  │
           └────────────────────────────────┘
                            │
                            ▼
           ┌────────────────────────────────┐
           │          SMARTSTOCK            │
           │    (System of Record for       │
           │     quantities & locations)    │
           └────────────────────────────────┘
```

#### Data Flow Direction

| Data Type | Direction | Frequency | Method |
|-----------|-----------|-----------|--------|
| Product Catalog | Legacy → SmartStock | Nightly ETL | Batch import |
| Purchase Orders | Legacy → SmartStock | Nightly ETL | Batch import |
| Pricing Updates | Legacy → SmartStock | Nightly ETL | Batch import |
| Stock Quantities | SmartStock → Legacy | Real-time | API webhook |
| Receiving Confirmations | SmartStock → Legacy | Real-time | API call |
| Dispatch Confirmations | SmartStock → Legacy | Real-time | API call |

### 3.3 Unified Master Catalog

The Master Catalog solves the problem of multiple coding systems:

```
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER CATALOG RECORD                        │
├─────────────────────────────────────────────────────────────────┤
│  SmartStock SKU: SS-FLT-OIL-00123 (Primary Key)                │
│                                                                 │
│  ┌─ Code Mappings ─────────────────────────────────────────┐   │
│  │  Internal Code:    FLT-A1234                            │   │
│  │  Vendor Code:      VEND-998877                          │   │
│  │  OEM Code:         OEM-XYZ-456                          │   │
│  │  Maintenance Code: MAINT-FILTER-OIL-A                   │   │
│  │  EAN:              7891234567890                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ Search Terms ──────────────────────────────────────────┐   │
│  │  "oil filter", "filtro aceite", "filter XYZ",           │   │
│  │  "Yamaha FZ150 oil filter", "FLT-A1234"                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ Compatibility ─────────────────────────────────────────┐   │
│  │  Yamaha FZ150 (2020-2024)                               │   │
│  │  Yamaha MT-15 (2019-2024)                               │   │
│  │  Honda CB125F (2021-2024)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3.4 Warehouse Hierarchy Structure

```
WAREHOUSE (Main Warehouse)
├── ZONE A (High-rotation products - Class A)
│   ├── AISLE 01
│   │   ├── RACK E1
│   │   │   ├── LEVEL N1 (ground) - Heavy items
│   │   │   ├── LEVEL N2 - Medium items
│   │   │   ├── LEVEL N3 - Light items
│   │   │   └── LEVEL N4 (top) - Reserve stock
│   │   └── RACK E2
│   │       └── ... (same structure)
│   ├── AISLE 02
│   │   └── ...
│   └── AISLE 03
│       └── ...
├── ZONE B (Medium-rotation - Class B)
│   └── ... (same hierarchy)
├── ZONE C (Low-rotation - Class C)
│   └── ... (same hierarchy)
├── ZONE D (Special storage)
│   ├── Temperature-controlled section
│   └── Hazardous materials section
├── RECEIVING AREA
│   ├── Unloading dock
│   ├── Inspection area
│   └── Staging area
└── DISPATCH AREA
    ├── Packing stations
    ├── Staging area
    └── Loading dock
```

Location Code Format: `{ZONE}-{AISLE}-{RACK}-{LEVEL}`  
Example: `A-03-E2-N1` = Zone A, Aisle 03, Rack E2, Level N1

---

## 4. Complete Functional Map

### 4.1 Module Overview

```
SmartStock Mobile App
│
├── 🔐 AUTHENTICATION MODULE
│   ├── Login Screen
│   ├── Session Management
│   └── Password Recovery
│
├── 🏠 HOME MODULE
│   ├── Dashboard
│   ├── Quick Actions
│   ├── Pending Tasks List
│   └── Notifications
│
├── 📦 RECEIVING MODULE
│   ├── M3: Start Reception
│   ├── M4: Product Scanning
│   ├── M5: Location Assignment (Directed Putaway)
│   └── M6: Confirmation & Summary
│
├── 📤 DISPATCH MODULE
│   ├── M7: Order List
│   ├── M8: Picking Process (Route-optimized)
│   ├── M9: Packing & Labeling
│   └── M10: Dispatch Confirmation
│
├── 🔍 QUERY MODULE
│   ├── M11: Product Search
│   │   ├── Text Search
│   │   ├── QR Scan
│   │   ├── Voice Search
│   │   └── Location Search
│   ├── Product Detail View
│   │   ├── Stock Tab
│   │   ├── Movements Tab
│   │   └── Compatibility Tab
│   └── Chatbot Integration
│
├── 👤 PROFILE MODULE
│   ├── M12: User Profile
│   ├── Statistics & Achievements
│   ├── Settings & Preferences
│   └── Help & Support
│
└── 🔔 NOTIFICATIONS
    ├── Push Notifications
    ├── In-App Alerts
    └── Notification History
```

### 4.2 Core WMS Logic

#### 4.2.1 Directed Putaway Algorithm

When a product is received, the system suggests optimal storage location based on:

```typescript
interface PutawayDecision {
  suggestedLocation: string;
  alternativeLocations: string[];
  reasoning: string;
  score: number;
}

function calculatePutawayLocation(product: Product, quantity: number): PutawayDecision {
  // Priority 1: Product-designated zone (if configured)
  // Priority 2: ABC rotation class zones
  //   - Class A → Zone A (most accessible)
  //   - Class B → Zone B
  //   - Class C → Zone C (least accessible)
  // Priority 3: Available bin capacity
  //   - Must have space for quantity
  //   - Prefer locations at 25-75% utilization
  // Priority 4: Product affinity
  //   - Place near related products
  //   - Place near frequently co-picked items
  // Priority 5: Ergonomics
  //   - Heavy items at lower levels (N1-N2)
  //   - Light items at higher levels (N3-N4)
}
```

**Algorithm Steps:**

1. **Filter by Zone Restrictions**
   - Check if product category has zone restrictions
   - Exclude incompatible zones (temperature, hazmat)

2. **Score by ABC Class**
   - Class A products: prioritize Zone A locations
   - Calculate distance from receiving to potential locations

3. **Score by Capacity**
   - Exclude locations at >90% capacity
   - Prefer locations at 40-70% capacity
   - Penalize empty locations (consolidation preference)

4. **Score by Affinity**
   - Boost locations near same-category products
   - Boost locations near frequently co-picked items

5. **Score by Ergonomics**
   - Weight > 5kg: penalize levels N3-N4
   - Fragile items: prefer middle levels

6. **Return Top 3 Locations**
   - Primary recommendation
   - Two alternatives with reasoning

#### 4.2.2 Route Optimization (TSP-Based)

For picking orders with multiple items, the system calculates an optimized route:

```typescript
interface PickingRoute {
  sequence: PickingItem[];
  totalDistance: number;       // meters
  estimatedTime: number;       // minutes
  zones: string[];             // Zone visit order
}

function optimizePickingRoute(items: PickingItem[]): PickingRoute {
  // Uses simplified TSP (Traveling Salesman Problem) approach:
  
  // 1. Group items by zone (reduce inter-zone travel)
  // 2. Within each zone, apply nearest-neighbor heuristic:
  //    - Start from current position (or receiving dock)
  //    - Always go to nearest unvisited location
  //    - Mark as visited, repeat
  // 3. Order zones by proximity to dispatch area
  // 4. Calculate total distance using location coordinates
  // 5. Estimate time: distance/speed + handling time per item
  
  // Output: Reordered items list with optimal sequence
}
```

**Route Display Logic:**
- Shows current item prominently
- Shows next 2-3 items as preview
- Updates distance/time remaining after each pick
- Provides navigation guidance (direction, distance)

#### 4.2.3 Double-Scan Validation

Every picking action requires two QR scans for validation:

```
SCAN 1: Location QR
├── Validates operator is at correct location
├── Confirms location status (active, not blocked)
└── Records location in transaction

SCAN 2: Product QR
├── Validates product matches order item
├── Confirms product exists at this location
├── Checks quantity available
└── Records product in transaction
```

**Validation States:**

| Location Scan | Product Scan | Result |
|---------------|--------------|--------|
| ✓ Correct | ✓ Correct | Proceed to quantity confirmation |
| ✓ Correct | ✗ Wrong product | Alert: "Wrong product scanned" |
| ✗ Wrong location | Any | Alert: "Wrong location - go to [correct]" |
| ✓ Correct | Product not at location | Suggest alternative locations |

#### 4.2.4 QR Code Generation

**QR Code Specifications:**

| Element | Format | Content | Size |
|---------|--------|---------|------|
| Product QR | QR Code (Version 4, ECC-M) | `SS:P:{SKU}:{LOT_ID}` | 3×3 cm |
| Location QR | QR Code (Version 2, ECC-H) | `SS:L:{LOCATION_CODE}` | 5×5 cm |
| Package QR | QR Code (Version 6, ECC-M) | `SS:D:{ORDER_ID}:{PKG_NUM}` | 6×6 cm |

**QR Content Schema:**
```
Product:  SS:P:SS-FLT-OIL-00123:LOT-2025-A1
Location: SS:L:A-03-E2-N1
Package:  SS:D:DP-2025-0145:1
```

**Technical Rationale for QR over RFID:**

| Factor | QR Code | RFID |
|--------|---------|------|
| Cost per tag | $0.001-0.01 | $0.15-1.00 |
| Implementation cost | Low | High |
| Smartphone compatibility | Native | Requires hardware |
| Information density | 4,296 characters | Variable |
| Durability | High | Medium |
| Scalability | Very High | Medium |

### 4.3 Predictive Analytics Logic

#### 4.3.1 Dynamic Reorder Point Calculation

```typescript
interface ReorderCalculation {
  productId: string;
  currentReorderPoint: number;
  calculatedReorderPoint: number;
  factors: {
    averageDailyDemand: number;
    demandVariance: number;
    leadTimeDays: number;
    leadTimeVariance: number;
    serviceLevel: number;          // Target (e.g., 0.95 for 95%)
    stockoutCostFactor: number;
  };
}

function calculateDynamicReorderPoint(product: Product): ReorderCalculation {
  // ROP = (Average Daily Demand × Lead Time) + Safety Stock
  
  // Safety Stock = Z × σ_d × √L
  // Where:
  //   Z = Service level factor (e.g., 1.65 for 95%)
  //   σ_d = Standard deviation of daily demand
  //   L = Lead time in days
  
  // Adjustments:
  //   - Higher stockout cost → higher safety stock
  //   - Higher demand variance → higher safety stock
  //   - Longer lead time → higher safety stock
}
```

#### 4.3.2 Demand Forecasting (30/60/90 Days)

```typescript
interface DemandForecast {
  productId: string;
  horizon: 30 | 60 | 90;
  predictions: {
    date: string;
    predictedDemand: number;
    confidenceLow: number;       // 95% confidence interval
    confidenceHigh: number;
  }[];
  method: "ARIMA" | "Prophet" | "Moving Average";
  accuracy: number;              // Historical MAPE
}
```

**Forecasting Methods:**
- **Moving Average:** Simple, for stable products
- **ARIMA:** For products with trend/seasonality
- **Prophet:** For products with complex patterns, holidays

#### 4.3.3 Anomaly Detection Rules

```typescript
interface AnomalyRule {
  type: "quantity" | "timing" | "pattern";
  condition: string;
  severity: "warning" | "critical";
  action: "alert" | "block" | "require_approval";
}

const ANOMALY_RULES: AnomalyRule[] = [
  {
    type: "quantity",
    condition: "Single transaction > 3× average transaction size",
    severity: "warning",
    action: "alert"
  },
  {
    type: "timing",
    condition: "Transaction outside business hours",
    severity: "warning", 
    action: "alert"
  },
  {
    type: "pattern",
    condition: "5+ adjustments on same product in 24 hours",
    severity: "critical",
    action: "require_approval"
  },
  {
    type: "quantity",
    condition: "Dispatch quantity > available stock",
    severity: "critical",
    action: "block"
  }
];
```

---

## 5. UX/UI Design System

### 5.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Industrial Usability** | Large touch targets (min 48×48dp), high contrast, glove-friendly |
| **Scanability First** | QR scanning is primary interaction; minimize typing |
| **Feedback Rich** | Haptic, visual, and audio feedback on all actions |
| **Error Prevention** | Validation at every step; clear error messages |
| **Offline Resilient** | Clear sync status; queued actions visible |

### 5.2 Design System Specifications

#### Color Palette

```css
/* Primary Colors */
--primary-50: #EFF6FF;     /* Lightest - backgrounds */
--primary-100: #DBEAFE;    /* Light - hover states */
--primary-500: #3B82F6;    /* Main - primary actions */
--primary-600: #2563EB;    /* Dark - pressed states */
--primary-700: #1D4ED8;    /* Darkest - text on light */

/* Secondary Colors */
--secondary-500: #10B981;  /* Success/Green */
--secondary-600: #059669;  /* Success pressed */

/* Semantic Colors */
--success: #10B981;        /* Confirmations, completed */
--warning: #F59E0B;        /* Caution, pending */
--error: #EF4444;          /* Errors, critical alerts */
--info: #3B82F6;           /* Information, tips */

/* Neutral Colors */
--gray-50: #F9FAFB;        /* Page backgrounds */
--gray-100: #F3F4F6;       /* Card backgrounds */
--gray-300: #D1D5DB;       /* Borders, dividers */
--gray-500: #6B7280;       /* Secondary text */
--gray-700: #374151;       /* Primary text */
--gray-900: #111827;       /* Headings */

/* Status Colors for Inventory */
--stock-ok: #10B981;       /* Normal stock */
--stock-low: #F59E0B;      /* Below reorder point */
--stock-critical: #EF4444; /* Critical/Out of stock */
--stock-excess: #8B5CF6;   /* Over max quantity */
```

#### Typography

```css
/* Mobile Typography Scale */
--font-family: "Inter", "SF Pro", "Roboto", system-ui;

/* Headings */
--h1: 32px / 1.2 / bold;        /* Page titles */
--h2: 24px / 1.3 / bold;        /* Section titles */
--h3: 20px / 1.4 / bold;        /* Card titles */
--h4: 18px / 1.4 / semibold;    /* Subsection titles */

/* Body Text */
--body: 16px / 1.5 / regular;   /* Default text */
--body-small: 14px / 1.4 / regular;  /* Secondary info */

/* Utility Text */
--caption: 12px / 1.3 / regular;    /* Labels, timestamps */
--button: 16px / 1.0 / bold;         /* Button text */
--code: 14px / 1.4 / monospace;      /* Codes, SKUs */
```

#### Spacing System (8pt Grid)

```css
--space-1: 4px;   /* Tight spacing */
--space-2: 8px;   /* Default small */
--space-3: 12px;  /* Medium small */
--space-4: 16px;  /* Default medium */
--space-5: 20px;  /* Medium large */
--space-6: 24px;  /* Large */
--space-8: 32px;  /* Extra large */
--space-10: 40px; /* Section spacing */
--space-12: 48px; /* Major sections */
```

### 5.3 Component Specifications

#### Buttons

| Variant | Height | Radius | Background | Text | Use Case |
|---------|--------|--------|------------|------|----------|
| **Primary** | 56px | 16px | primary-500 | White, Bold | Main actions |
| **Secondary** | 56px | 16px | transparent, 2px border | primary-500 | Alternative actions |
| **Ghost** | 48px | 8px | transparent | primary-500 | Tertiary actions |
| **Danger** | 56px | 16px | error | White, Bold | Destructive actions |

**States:**
- **Default**: Standard appearance
- **Pressed**: Scale 0.98, darker background
- **Disabled**: gray-300 background, gray-500 text
- **Loading**: Spinner icon, text visible

#### Input Fields

| State | Border | Shadow | Helper Text |
|-------|--------|--------|-------------|
| **Default** | 1px gray-300 | none | gray-500 |
| **Focus** | 2px primary-500 | 0 0 0 3px primary-100 | gray-500 |
| **Error** | 2px error | none | error color |
| **Success** | 2px success | none | success color |
| **Disabled** | 1px gray-200 | none | gray-400 |

**Specifications:**
- Height: 52px
- Border radius: 12px
- Padding: 12px 16px
- Font size: 16px
- Left icon: 20px, gray-500
- Right icon (action): 20px, interactive

#### Cards

| Type | Shadow | Border | Use Case |
|------|--------|--------|----------|
| **Standard** | elevation-2 | none | Default containers |
| **Elevated** | elevation-4 | none | Important content |
| **Interactive** | elevation-2 → elevation-4 on hover | none | Clickable items |
| **Selected** | elevation-2 | 2px primary-500 | Selected state |

**Common Properties:**
- Background: White
- Border radius: 16px
- Padding: 20px

### 5.4 Key Component Specifications

#### QR Scanner Overlay

```
┌────────────────────────────────────────┐
│ [✕ Close]              [💡 Flash]     │  ← Header (60px, rgba(0,0,0,0.8))
├────────────────────────────────────────┤
│                                        │
│    ┌──────────────────────────┐       │
│    │                          │       │
│    │   ┌──┐          ┌──┐    │       │  ← Viewfinder (250×250)
│    │   │  │          │  │    │       │     White corners
│    │                          │       │     Animated scan line
│    │   └──┘          └──┘    │       │
│    │                          │       │
│    └──────────────────────────┘       │
│                                        │  ← Darkened overlay
│    "Alinee el código dentro           │
│     del marco"                        │  ← Instructions
│                                        │
├────────────────────────────────────────┤
│ [📝 Ingreso manual]  [🖼️ Galería]    │  ← Footer (100px)
└────────────────────────────────────────┘
```

**Feedback:**
- Success: Green flash, haptic vibration, toast "✓ Código reconocido"
- Error: Red flash, shake animation, toast "✗ Código no reconocido"

#### Product Card (List View)

```
┌────────────────────────────────────────┐
│ ┌────┐  FILTRO DE ACEITE XYZ          │
│ │IMG │  REP-12345                      │
│ │48px│                                 │
│ └────┘  Stock: 45 unidades ✓ Normal   │
│         📍 3 ubicaciones              │
└────────────────────────────────────────┘
```

#### Picking Item Card

```
┌────────────────────────────────────────┐
│ █ ┌────┐  PASTILLA FRENO DELANT.      │  ← Left border (4px) = status
│ █ │IMG │  REP-98765                    │
│ █ │60px│                               │
│ █ └────┘  📍 B-01-E3-N2 (15m →)       │
│ █         ┌──────┐                     │
│ █         │  4   │  Cantidad           │  ← Quantity box
│ █         └──────┘                     │
└────────────────────────────────────────┘

Status colors:
- Pending: gray-300
- Current: primary-500
- Picked: success
- Partial: warning
- Not found: error
```

#### Location Suggestion Card

```
┌────────────────────────────────────────┐
│ 🎯 UBICACIÓN SUGERIDA                  │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐ │
│  │  ZONA A - PASILLO 3              │ │
│  │  ESTANTE 2 - NIVEL 1             │ │
│  │                                   │ │
│  │  ╔═══════════════════╗           │ │
│  │  ║   A-03-E2-N1      ║           │ │  ← Large code display
│  │  ╚═══════════════════╝           │ │
│  │                                   │ │
│  │  Razón: "Zona de alta rotación"  │ │
│  │  Espacio disponible: ████░░ 75%  │ │
│  └──────────────────────────────────┘ │
│                                        │
│  [📷 ESCANEAR QR UBICACIÓN]           │  ← Primary action
│                                        │
│  Alternativas:                         │
│  • A-03-E2-N2 (85% disponible)        │
│  • A-04-E1-N1 (90% disponible)        │
└────────────────────────────────────────┘
```

### 5.5 Navigation Patterns

#### Bottom Navigation Bar

```
┌────────────────────────────────────────┐
│  🏠      📋      📷      🔍      👤   │
│ Home   Tareas  Escanear Consultas Perfil │
└────────────────────────────────────────┘

- 5 items maximum
- Icons: 24px, labels below
- Active: primary-500 + top indicator
- Inactive: gray-500
- Height: 64px (+ safe area)
```

#### Header Navigation

```
┌────────────────────────────────────────┐
│ ←  Nueva Recepción           ?        │
└────────────────────────────────────────┘

- Back button: 48×48dp touch target
- Title: Centered, H3, Bold
- Help/Menu: 48×48dp, right side
- Height: 56px
- Background: White + subtle shadow
```

#### Stepper (Progress Indicator)

```
┌────○────────●────────○────────○────┐
│ Inicio   Escaneo   Ubicación Confirmar │
└────────────────────────────────────────┘

- Circles: 24px diameter
- Completed: primary-500 filled
- Current: primary-500 filled + larger
- Pending: gray-300 outlined
- Line: 2px, primary-500 (completed) / gray-300 (pending)
```

### 5.6 Animations & Feedback

| Action | Feedback Type | Details |
|--------|---------------|---------|
| QR Scan Success | Haptic + Visual + Audio | Vibration, green flash, "ding" |
| QR Scan Error | Haptic + Visual + Audio | Vibration, red flash, shake |
| Form Submission | Loading state | Button spinner, overlay for heavy ops |
| Task Complete | Celebration | Checkmark animation, optional confetti |
| Card Press | Scale | Scale to 0.98 on press |
| List Item Add | Slide | Slide in from right |
| Modal Open | Slide Up | 300ms ease-out |
| Error | Shake | 400ms, 10px amplitude |
| Pull to Refresh | Native | Platform-native indicator |


---

## 6. Screen-by-Screen Specifications

### 6.1 M1: Login Screen

**Purpose:** Secure authentication for operators, supervisors, and administrators

**Layout Structure:**
```
┌─────────────────────────────────────┐
│         [SmartStock Logo]           │  ← 20% - Header
│   "Sistema Integral de Gestión      │
│        de Inventarios"              │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │ 👤 Ingrese su usuario   │     │
│    └─────────────────────────┘     │
│                                     │
│    ┌─────────────────────────┐     │  ← 60% - Form
│    │ 🔒 Ingrese su contraseña │     │
│    └─────────────────────────┘     │
│                                     │
│    ☐ Recordar sesión                │
│              ¿Olvidó su contraseña? │
│                                     │
│    ┌─────────────────────────┐     │
│    │      INICIAR SESIÓN     │     │
│    └─────────────────────────┘     │
│                                     │
├─────────────────────────────────────┤
│    v1.0.0  |  ¿Necesita ayuda?     │  ← 20% - Footer
│          [MASSLINE Logo]            │
└─────────────────────────────────────┘
```

**Elements Specification:**

| Element | Specification |
|---------|---------------|
| Logo | SmartStock logo, 80px height, centered |
| Tagline | 14px, gray-500, below logo |
| Username Input | Icon: user, Placeholder: "Ingrese su usuario" |
| Password Input | Icon: lock, Toggle show/hide, Placeholder: "Ingrese su contraseña" |
| Remember checkbox | 16px checkbox, left aligned |
| Forgot password | Link text, right aligned, primary color |
| Login button | Primary, full width (minus 40px margins), 56px height |
| Version | 12px, gray-400, bottom left |
| Support link | 12px, primary color, bottom center |
| MASSLINE logo | 32px height, bottom right |

**States:**

| State | Behavior |
|-------|----------|
| Default | All fields empty, button disabled |
| Fields filled | Button enabled |
| Loading | Spinner on button, overlay on form |
| Error (invalid) | Red banner top, shake animation, clear password |
| Error (network) | Error toast, retry option |
| Success | Fade transition to Home |

**Validations:**
- Username: Required, min 3 characters
- Password: Required, min 6 characters
- Button enabled only when both valid

---

### 6.2 M2: Home / Dashboard

**Purpose:** Central hub, quick access to main functions, view pending tasks

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ [Logo]  🔔(3)              [Avatar] │  ← Sticky Header
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ¡Hola, Juan!                    ││  ← Welcome Card
│ │ Martes, 25 Nov 2025 • 09:45     ││
│ │ 📋 5 órdenes pendientes         ││
│ │ 📦 12 productos recibidos hoy   ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌──────────┐  ┌──────────┐        │
│ │ 📦       │  │ 📤       │        │  ← Action Grid (2x2)
│ │RECEPCIÓN │  │ DESPACHO │        │
│ └──────────┘  └──────────┘        │
│ ┌──────────┐  ┌──────────┐        │
│ │ 🔍       │  │ ⚠️       │        │
│ │CONSULTAR │  │ REPORTAR │        │
│ └──────────┘  └──────────┘        │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Tareas Asignadas           (5)  ││  ← Tasks Section
│ ├─────────────────────────────────┤│
│ │ 🔴 Orden #12345                 ││
│ │ Tienda Norte • 5 productos      ││
│ │ Hace 15 min           [Iniciar] ││
│ ├─────────────────────────────────┤│
│ │ Orden #12346                    ││
│ │ Mantenimiento • 3 productos     ││
│ │ Hace 35 min           [Iniciar] ││
│ └─────────────────────────────────┘│
│                              ┌────┐│
│                              │ 📷 ││  ← FAB (Scan)
│                              └────┘│
├─────────────────────────────────────┤
│ 🏠    📋    📷    🔍    👤        │  ← Bottom Nav
└─────────────────────────────────────┘
```

**Elements Specification:**

| Element | Specification |
|---------|---------------|
| Header | Logo 40px left, notification bell with badge, avatar 40px right |
| Welcome Card | Elevated card, greeting H2, date/time live update, stats with icons |
| Action Grid | 4 cards ~160×140dp, 20px border radius, icon 48px, label 16px bold |
| Tasks List | Scrollable, card per task with priority badge, timestamp, action button |
| FAB | 64px diameter, primary color, QR icon, fixed bottom-right |
| Bottom Nav | 5 items, 64px height + safe area |

**Navigation Actions:**

| Element | Action |
|---------|--------|
| Notification bell | Opens notification center |
| Avatar | Opens profile dropdown |
| RECEPCIÓN card | Navigate to M3 |
| DESPACHO card | Navigate to M7 |
| CONSULTAR card | Navigate to M11 |
| REPORTAR card | Opens report modal |
| Task item | Navigate to M8 with order pre-loaded |
| FAB | Opens camera scanner directly |

---

### 6.3 M3: Receiving - Start Reception

**Purpose:** Initialize receiving process, identify purchase order

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ←  Nueva Recepción              ?   │  ← Header
├─────────────────────────────────────┤
│ ○────────○────────○────────○        │  ← Stepper
│Inicio  Escaneo  Ubicación Confirmar │
├─────────────────────────────────────┤
│                                     │
│ ¿Tiene orden de compra?             │
│                                     │
│ ┌─────────┐  ┌─────────┐           │
│ │   SÍ    │  │   NO    │           │  ← Segmented Control
│ └─────────┘  └─────────┘           │
│                                     │
│ ┌─────────────────────────────────┐│
│ │                                 ││
│ │     📷 ESCANEAR QR DE ORDEN    ││  ← Main Action
│ │                                 ││
│ │     o ingrese manualmente       ││
│ └─────────────────────────────────┘│
│                                     │
│ ────────────── O ──────────────    │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Número de Orden de Compra       ││
│ │ OC-2025-001234            🔍   ││  ← Manual Input
│ └─────────────────────────────────┘│
│                                     │
│ Proveedor (opcional):               │
│ ┌─────────────────────────────────┐│
│ │ Seleccionar proveedor       ▼  ││
│ └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ [Cancelar]              [CONTINUAR] │  ← Footer Actions
└─────────────────────────────────────┘
```

**Conditional Content (when "NO" selected):**
```
│ ┌─────────────────────────────────┐│
│ │ ℹ️ Recepción sin orden previa   ││  ← Info Card (warning style)
│ │ Deberá identificar productos    ││
│ │ manualmente                     ││
│ └─────────────────────────────────┘│
│                                     │
│ Motivo de recepción:                │
│ ┌─────────────────────────────────┐│
│ │ Compra local sin OC          ▼ ││
│ └─────────────────────────────────┘│
│ Options:                            │
│ • Compra local sin OC               │
│ • Devolución de cliente             │
│ • Transferencia entre bodegas       │
│ • Ajuste de inventario              │
```

**States:**
- **QR Scan Success:** Auto-fills order number and supplier, transitions to M4
- **QR Scan Invalid:** Toast error "QR no reconocido"
- **Manual Search Success:** Shows order details, enables Continue
- **Order Not Found:** Option to "Crear recepción sin orden"

---

### 6.4 M4: Receiving - Product Scanning

**Purpose:** Scan and register received products, generate QR codes for unlabeled items

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Recepción - Orden #12345    ⋮    │  ← Header (with menu)
├─────────────────────────────────────┤
│ ●────────●────────○────────○        │  ← Stepper (Escaneo active)
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Productos Esperados (8)      ▼ ││  ← Collapsible Expected List
│ ├─────────────────────────────────┤│
│ │ ☐ [IMG] REP-12345 Filtro...   ││
│ │         50 unidades   Pendiente ││
│ │ ☑ [IMG] REP-12346 Bujía...    ││
│ │         100 unidades  ✓ Escaneado│
│ └─────────────────────────────────┘│
│                                     │
│ ╔═════════════════════════════════╗│
│ ║         📷 ESCANEAR QR          ║│  ← Main Scan Zone
│ ║                                 ║│
│ ║      [Camera icon 80px]         ║│
│ ║                                 ║│
│ ║   "Enfoque el código QR         ║│
│ ║    o código de barras"          ║│
│ ║                                 ║│
│ ║   ────────── o ──────────       ║│
│ ║   [Buscar manualmente]          ║│
│ ╚═════════════════════════════════╝│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Escaneados (2)               ▼ ││  ← Scanned Products
│ ├─────────────────────────────────┤│
│ │ [IMG] FILTRO DE ACEITE XYZ      ││
│ │ REP-12345 • ✓ Coincide          ││
│ │ Cant: [- 5 +] Lote: LOT-2025-A1 ││
│ │ Vto: 12/2027   [📷] [✏️] [🗑️]  ││
│ └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ 5 productos | 125 unidades          │
│ [Agregar más]    [CONTINUAR →]     │
└─────────────────────────────────────┘
```

**Scan Scenarios:**

| Scenario | Behavior |
|----------|----------|
| Product in expected list | Auto-add to scanned, show confirmation |
| Product NOT in expected list | Warning card "⚠️ Este producto no está en la orden", options to add anyway or search correct |
| Product without QR | Opens search modal, then generates new QR |
| Unreadable QR | Error feedback, option for manual entry |

**Product Search Modal (for unlabeled items):**
```
┌─────────────────────────────────────┐
│ ✕  Buscar Producto                  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ 🔍 Buscar por código o nombre   ││
│ └─────────────────────────────────┘│
│                                     │
│ Categoría: [Todas           ▼]     │
│                                     │
│ Resultados:                         │
│ ┌─────────────────────────────────┐│
│ │ [IMG] Filtro de Aceite XYZ      ││
│ │ REP-12345 • $25.99              ││
│ │ Stock: 45 und                   ││
│ ├─────────────────────────────────┤│
│ │ [IMG] Filtro de Aceite Premium  ││
│ │ REP-12346 • $32.99              ││
│ │ Stock: 28 und                   ││
│ └─────────────────────────────────┘│
│                                     │
│        [SELECCIONAR PRODUCTO]       │
└─────────────────────────────────────┘
```

**After Selection (QR Generation):**
```
┌─────────────────────────────────────┐
│ 🖨️ GENERAR E IMPRIMIR ETIQUETA QR  │
├─────────────────────────────────────┤
│                                     │
│     ╔═══════════════════════╗      │
│     ║  SMARTSTOCK           ║      │
│     ║  [QR CODE]            ║      │
│     ║  REP-12345            ║      │
│     ║  Filtro Aceite XYZ    ║      │
│     ╚═══════════════════════╝      │
│                                     │
│ Impresora: [Zebra ZQ220      ▼]    │
│ Cantidad:  [- 1 +]                  │
│                                     │
│ [Cancelar]        [🖨️ IMPRIMIR]    │
└─────────────────────────────────────┘
```

---

### 6.5 M5: Receiving - Location Assignment (Putaway)

**Purpose:** Assign storage locations using directed putaway algorithm

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Ubicación de Productos       ⋮   │
├─────────────────────────────────────┤
│ ●────────●────────●────────○        │  ← Stepper (Ubicación active)
├─────────────────────────────────────┤
│                                     │
│ PRODUCTO 1 de 5                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ┌────┐  FILTRO DE ACEITE XYZ   ││
│ │ │IMG │  REP-12345               ││
│ │ │60px│  Cantidad: 50 unidades   ││
│ │ └────┘                          ││
│ └─────────────────────────────────┘│
│                                     │
│ 📍 UBICACIÓN SUGERIDA:              │
│ ┌─────────────────────────────────┐│
│ │  🎯 ZONA A - PASILLO 3          ││
│ │     ESTANTE 2 - NIVEL 1         ││
│ │                                 ││
│ │     ╔═══════════════════╗       ││
│ │     ║   A-03-E2-N1      ║       ││
│ │     ╚═══════════════════╝       ││
│ │                                 ││
│ │  Razón: "Zona de alta rotación" ││
│ │  Espacio disponible: ████░ 75%  ││
│ │                                 ││
│ │  [🗺️ Ver en mapa]              ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │  📷 ESCANEAR QR UBICACIÓN       ││  ← Main Action
│ │       Estado: ⏳ Pendiente       ││
│ └─────────────────────────────────┘│
│                                     │
│ Alternativas (tap para expandir):   │
│ • A-03-E2-N2 (85% disponible)      │
│ • A-04-E1-N1 (90% disponible)      │
│                                     │
│ [🔍 Buscar otra ubicación]          │
│                                     │
├─────────────────────────────────────┤
│ 2/5 productos ubicados              │
│ [← Anterior]     [SIGUIENTE →]     │
└─────────────────────────────────────┘
```

**Scan Confirmation Flow:**
1. User taps "ESCANEAR QR UBICACIÓN"
2. Camera opens
3. User scans location QR
4. If correct location: ✓ Green animation, card updates to "Confirmado"
5. If wrong location: ✗ Red animation, shows correct location
6. Auto-advance to next product (or finish)

**Confirmed State:**
```
│ ┌─────────────────────────────────┐│
│ │  ✓ UBICACIÓN CONFIRMADA         ││  ← Green background
│ │     A-03-E2-N1                  ││
│ │     Almacenado exitosamente     ││
│ └─────────────────────────────────┘│
```

**Alternative Location Selection:**
- User can tap alternative or search for different location
- Must provide reason if overriding suggestion
- System records override for analytics

---

### 6.6 M6: Receiving - Confirmation

**Purpose:** Summary and completion of receiving process

**Layout Structure:**
```
┌─────────────────────────────────────┐
│     Resumen de Recepción            │
├─────────────────────────────────────┤
│ ●────────●────────●────────●        │  ← All steps complete
├─────────────────────────────────────┤
│                                     │
│         ╔═══════════════╗          │
│         ║      ✓        ║          │  ← Animated checkmark
│         ║               ║          │
│         ╚═══════════════╝          │
│                                     │
│    ✓ RECEPCIÓN COMPLETA            │
│    Orden #12345 procesada          │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Proveedor: XYZ Corp             ││
│ │ Fecha: 25-Nov-2025 09:45        ││  ← Details Card
│ │ Operador: Juan Pérez            ││
│ │ Duración: 15 minutos            ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 5 productos recibidos (125 und) ▼││  ← Collapsible Table
│ ├─────────────────────────────────┤│
│ │ Producto        │ Cant │ Ubic.  ││
│ │ Filtro Aceite   │  50  │A-03-E2 ││
│ │ Bujía NGK       │  20  │A-03-E3 ││
│ │ Pastilla Freno  │  10  │B-01-E1 ││
│ │ ...                             ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ⚠️ OBSERVACIONES                ││  ← If any warnings
│ │ • 2 productos no estaban en     ││
│ │   la orden original             ││
│ │ • 1 producto con lote próximo   ││
│ │   a vencer                      ││
│ └─────────────────────────────────┘│
│                                     │
│ [📧 Enviar resumen] [🖨️ Imprimir] │
│                                     │
├─────────────────────────────────────┤
│ [NUEVA RECEPCIÓN]    [IR AL HOME]  │
└─────────────────────────────────────┘
```

**Celebration:**
- Confetti animation on success
- Haptic feedback
- Optional sound effect

---

### 6.7 M7: Dispatch - Order List

**Purpose:** View and select pending dispatch orders

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Órdenes de Despacho          🔽  │  ← Filters button
├─────────────────────────────────────┤
│ [Todas(23)] [Urgentes(5)] [Mías(3)] │  ← Filter chips
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ 🔍 Buscar por # orden, tienda...││  ← Search bar
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🔴 URGENTE                      ││
│ │ ORDEN #DP-2025-0145             ││
│ │ Tienda Centro - Local 5         ││  ← Order Card (Urgent)
│ │                                 ││
│ │ 📦 7 productos │ 23 unidades    ││
│ │ ⏱️ Hace 35 minutos              ││
│ │ 👤 Sin asignar                  ││
│ │                                 ││
│ │ [Ver detalles]    [TOMAR ORDEN] ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ORDEN #DP-2025-0146             ││  ← Order Card (Normal)
│ │ Mantenimiento                   ││
│ │                                 ││
│ │ 📦 3 productos │ 8 unidades     ││
│ │ ⏱️ Hace 1 hora                  ││
│ │ 👤 María García (en proceso)    ││
│ │                                 ││
│ │ [Ver detalles]    [Ver progreso]││
│ └─────────────────────────────────┘│
│                                     │
│ (more orders...)                    │
│                                     │
│                              ┌────┐│
│                              │ +  ││  ← FAB (New order)
│                              └────┘│
├─────────────────────────────────────┤
│ 🏠    📋    📷    🔍    👤        │
└─────────────────────────────────────┘
```

**Order Card States:**

| State | Visual | Actions |
|-------|--------|---------|
| Pending | No assignment, gray icon | "Ver detalles", "TOMAR ORDEN" |
| Urgent | Red border (4px), "🔴 URGENTE" badge | Same as pending |
| In Progress (own) | Yellow badge, progress indicator | "Ver detalles", "CONTINUAR" |
| In Progress (other) | Shows operator name | "Ver detalles", "Ver progreso" |
| Paused | Orange badge, pause icon | "Ver detalles", "RETOMAR" |

**Empty State:**
```
│     [📋 Clipboard illustration]     │
│                                     │
│        ¡Todo al día!               │
│   No hay órdenes pendientes        │
│                                     │
│ [Actualizar]    [Ver historial]    │
```

---

### 6.8 M8: Dispatch - Picking Process

**Purpose:** Guide operator through optimized picking route

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← #DP-0145        [|||] 3/7   ⋮    │  ← Progress bar in header
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐│
│ │ Tienda Centro | 7 items      ▼ ││  ← Collapsible order info
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│                                     │
│ PRODUCTO 3 de 7                     │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ┌──────────────────────────┐   ││
│ │ │    [Imagen 250x250]      │   ││  ← Product image
│ │ └──────────────────────────┘   ││
│ │                                 ││
│ │ PASTILLA DE FRENO DELANTERA    ││
│ │ REP-98765                       ││
│ │                                 ││
│ │ Cantidad: ┌────────┐            ││
│ │           │   4    │            ││
│ │           └────────┘            ││
│ │                                 ││
│ │ 📍 UBICACIÓN:                   ││
│ │ ┌──────────────────────────┐   ││
│ │ │ 🎯 B-01-E3-N2             │   ││
│ │ │    ZONA B - PASILLO 1     │   ││
│ │ │                           │   ││
│ │ │ 🚶 15 metros (22 pasos)   │   ││
│ │ │ [Ver en mapa →]           │   ││
│ │ └──────────────────────────┘   ││
│ │                                 ││
│ │ Stock disponible: 25 unidades   ││
│ │                                 ││
│ │ [🗺️ VER MAPA]   [📷 ESCANEAR] ││
│ └─────────────────────────────────┘│
│                                     │
│ Próximos:                           │
│ 4. Filtro aceite (A-03-E2) →7m     │
│ 5. Bujía NGK (A-03-E3) →2m         │
│                                     │
├─────────────────────────────────────┤
│ 3/7 ✓ | 4 pendientes               │
│ [Ver todos]           [⏸️ Pausar]  │
└─────────────────────────────────────┘
```

**Double-Scan Flow:**

1. **Scan Location QR:**
```
┌─────────────────────────────────────┐
│         ESCANEAR UBICACIÓN          │
│                                     │
│     [Camera viewfinder]             │
│                                     │
│   Escanee el QR de ubicación        │
│         B-01-E3-N2                  │
└─────────────────────────────────────┘
```

2. **Location Confirmed → Scan Product:**
```
┌─────────────────────────────────────┐
│    ✓ Ubicación B-01-E3-N2           │
│                                     │
│     [Camera viewfinder]             │
│                                     │
│   Ahora escanee el producto         │
│      REP-98765                      │
└─────────────────────────────────────┘
```

3. **Product Confirmed → Enter Quantity:**
```
┌─────────────────────────────────────┐
│    ✓ Ubicación confirmada           │
│    ✓ Producto confirmado            │
│                                     │
│   ¿Cuántas unidades recolectó?      │
│                                     │
│     ⊖  ┌──────────┐  ⊕            │
│        │    4     │                 │
│        └──────────┘                 │
│                                     │
│   Sugerido: 4 │ Disponible: 25     │
│                                     │
│   ☐ Reportar discrepancia           │
│                                     │
│   [Cancelar]    [CONFIRMAR ✓]       │
└─────────────────────────────────────┘
```

**Error Scenarios:**

| Scenario | Response |
|----------|----------|
| Wrong location scanned | "Ubicación incorrecta. Diríjase a B-01-E3-N2" |
| Wrong product scanned | "Producto incorrecto. Busque REP-98765" |
| Insufficient quantity | Modal with options: take partial, search alternate location |
| Product not found | "No está en ubicación" button, search alternatives |

---

### 6.9 M9: Dispatch - Packing & Labeling

**Purpose:** Package products and generate dispatch label

**Layout Structure:**
```
┌─────────────────────────────────────┐
│     Empaque y Etiquetado            │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ✓ RECOLECCIÓN COMPLETA          ││
│ │                                 ││  ← Summary card
│ │ Orden #DP-0145                  ││
│ │ Tienda Centro - Local 5         ││
│ │                                 ││
│ │ 📦 7/7 productos recolectados   ││
│ │ ✓ 23/23 unidades                ││
│ │ ⏱️ Tiempo de picking: 12 min    ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 📋 INSTRUCCIONES                ││
│ │                                 ││  ← Instructions card
│ │ ⚠️ Notas especiales:            ││
│ │ "Empacar por separado las       ││
│ │  bujías"                        ││
│ │                                 ││
│ │ Paquetes sugeridos: 2           ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ Verificación:                   ││  ← Checklist
│ │ ☐ Productos empacados           ││
│ │ ☐ Cantidades verificadas        ││
│ │ ☐ Sin daños visibles            ││
│ └─────────────────────────────────┘│
│                                     │
│ 📸 Foto del empaque (opcional):    │
│ ┌────────┐                         │
│ │ [📷]   │  [Tomar foto]           │
│ └────────┘                         │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🖨️ GENERAR ETIQUETA DESPACHO   ││  ← Main action
│ └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│ [Guardar para después] [FINALIZAR] │
└─────────────────────────────────────┘
```

**Label Preview Modal:**
```
┌─────────────────────────────────────┐
│    ETIQUETA DE DESPACHO        ✕   │
├─────────────────────────────────────┤
│                                     │
│   ┌───────────────────────────┐    │
│   │      [SMARTSTOCK Logo]     │    │
│   │                            │    │
│   │    ╔════════════════╗     │    │
│   │    ║  [QR CODE]     ║     │    │
│   │    ║  200×200       ║     │    │
│   │    ╚════════════════╝     │    │
│   │                            │    │
│   │  ORDEN: #DP-2025-0145      │    │
│   │                            │    │
│   │  DESTINO:                  │    │
│   │  Tienda Centro - Local 5   │    │
│   │  Av. Principal #123        │    │
│   │  Tel: (02) 123-4567        │    │
│   │                            │    │
│   │  CONTENIDO:                │    │
│   │  7 productos | 23 unidades │    │
│   │                            │    │
│   │  FECHA: 25-Nov-2025 10:30  │    │
│   │  OPERADOR: Juan Pérez      │    │
│   │                            │    │
│   │  PRIORIDAD: ⬤ URGENTE      │    │
│   └───────────────────────────┘    │
│                                     │
│   Impresora: [HP Térmica     ▼]    │
│                                     │
│   [Cancelar]        [🖨️ IMPRIMIR] │
└─────────────────────────────────────┘
```

---

### 6.10 M10: Dispatch - Confirmation

**Purpose:** Final confirmation and dispatch completion

**Layout Structure:**
```
┌─────────────────────────────────────┐
│                                     │
│         ╔═══════════════╗          │
│         ║      ✓        ║          │  ← Animated checkmark
│         ║               ║          │
│         ╚═══════════════╝          │
│                                     │
│      ✓ DESPACHO COMPLETO           │
│      Orden #DP-2025-0145           │
│      procesada exitosamente        │
│                                     │
│ ─────────────────────────────────  │
│                                     │
│   📦 7 productos | 23 unidades     │
│   ⏱️ Tiempo total: 18 minutos      │
│   📍 Destino: Tienda Centro        │
│   🚚 Estado: Listo para envío      │
│   👤 Operador: Juan Pérez          │
│                                     │
│ ─────────────────────────────────  │
│                                     │
│   CÓDIGO DE RASTREO:               │
│   ┌───────────────────────────┐    │
│   │ DP-2025-0145              │    │
│   │ [QR CODE]                 │    │
│   │                           │    │
│   │ [📋 Copiar] [📤 Compartir]│    │
│   └───────────────────────────┘    │
│                                     │
│ ─────────────────────────────────  │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🏆 ¡BUEN TRABAJO!               ││
│ │                                 ││  ← Performance metrics
│ │ ⚡ Picking: 18 min (Excelente)  ││
│ │    vs. promedio 25 min          ││
│ │ ✓ Precisión: 100%               ││
│ │ 📈 Productividad hoy: +15%      ││
│ └─────────────────────────────────┘│
│                                     │
│   Hay 4 órdenes urgentes pendientes│
│   [VER ÓRDENES URGENTES]           │
│                                     │
├─────────────────────────────────────┤
│ [Ver detalle]         [IR AL HOME] │
└─────────────────────────────────────┘
```

---

### 6.11 M11: Query Module

**Purpose:** Quick product/inventory lookup via multiple methods

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Consultar Inventario         🕐  │  ← History button
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🔍 Buscar producto o ubicación  ││
│ │ [       search text        ] 🎤 ││  ← Search with voice
│ └─────────────────────────────────┘│
│                                     │
│ [🔤 Texto] [📷 Escanear] [📍 Ubic] │  ← Method tabs
│                                     │
├─────────────────────────────────────┤
│                                     │
│ Resultados:                         │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ┌────┐ FILTRO DE ACEITE XYZ     ││
│ │ │IMG │ REP-12345                ││
│ │ │60px│                          ││
│ │ └────┘ Stock total: 45 unidades ││
│ │        ✓ Disponible              ││  ← Result card
│ │                                 ││
│ │ 📍 Ubicaciones (3):             ││
│ │ • A-03-E2-N1: 25 unidades       ││
│ │ • A-03-E3-N1: 15 unidades       ││
│ │ • B-01-E1-N2: 5 unidades        ││
│ │                                 ││
│ │ [Ver movimientos] [Ver en mapa] ││
│ └─────────────────────────────────┘│
│                                     │
│ (more results...)                   │
│                              ┌────┐│
│                              │💬 ││  ← Chatbot FAB
│                              └────┘│
├─────────────────────────────────────┤
│ 🏠    📋    📷    🔍    👤        │
└─────────────────────────────────────┘
```

**Product Detail View (Modal):**

```
┌─────────────────────────────────────┐
│ ✕  FILTRO DE ACEITE XYZ             │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────────┐    │
│     │    [Product Image]       │    │
│     │       300×300            │    │
│     └─────────────────────────┘    │
│                                     │
│ [General] [Stock] [Movimientos] [Compat]│  ← Tabs
├─────────────────────────────────────┤
│                                     │
│ TAB: STOCK                          │
│                                     │
│ Stock Total: 45 unidades            │
│ Estado: ✓ Disponible                │
│                                     │
│ Distribución por ubicación:         │
│ ┌─────────────────────────────────┐│
│ │ A-03-E2-N1         ████░░ 55%  ││
│ │ 25 unidades        [Ver mapa]   ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ A-03-E3-N1         ███░░░ 33%  ││
│ │ 15 unidades        [Ver mapa]   ││
│ └─────────────────────────────────┘│
│ ┌─────────────────────────────────┐│
│ │ B-01-E1-N2         █░░░░░ 11%  ││
│ │ 5 unidades         [Ver mapa]   ││
│ └─────────────────────────────────┘│
│                                     │
│ Punto de reorden: 20 unidades       │
│ Stock seguridad: 10 unidades        │
│ Estado: ⚠️ Cerca del límite         │
│                                     │
│ TAB: MOVIMIENTOS                    │
│ ┌─────────────────────────────────┐│
│ │ ⬇️ 25-Nov 09:30 Despacho: -10   ││
│ │    Tienda Centro | Juan P.      ││
│ ├─────────────────────────────────┤│
│ │ ⬆️ 20-Nov 14:15 Recepción: +50  ││
│ │    OC-2025-0123 | María G.      ││
│ └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

---

### 6.12 M12: Profile & Settings

**Purpose:** User profile, statistics, and app settings

**Layout Structure:**
```
┌─────────────────────────────────────┐
│ ← Mi Perfil                         │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ┌─────┐  JUAN PÉREZ             ││
│ │ │PHOTO│  Operador de Bodega     ││  ← Profile card
│ │ │100px│  ID: OP-0045            ││
│ │ └─────┘  Bodega Principal       ││
│ │ [Editar]                        ││
│ │ Miembro desde: Enero 2024       ││
│ └─────────────────────────────────┘│
│                                     │
│ ┌─────────────────────────────────┐│
│ │ ESTADÍSTICAS DEL MES            ││
│ │                                 ││
│ │ ┌────────┐  ┌────────┐         ││
│ │ │  248   │  │  1,523 │         ││  ← Stats grid
│ │ │Recepc. │  │Despachos│         ││
│ │ └────────┘  └────────┘         ││
│ │ ┌────────┐  ┌────────┐         ││
│ │ │ 99.2%  │  │  +18%  │         ││
│ │ │Precisión│ │Product.│         ││
│ │ └────────┘  └────────┘         ││
│ │                                 ││
│ │ [Ver estadísticas completas →] ││
│ └─────────────────────────────────┘│
│                                     │
│ CUENTA                              │
│ ├─ 👤 Editar información           │
│ ├─ 🔒 Cambiar contraseña           │  ← Settings list
│ ├─ 🔔 Notificaciones               │
│ └─ 🌐 Idioma: Español              │
│                                     │
│ PREFERENCIAS                        │
│ ├─ 🎨 Tema: Claro                  │
│ ├─ 📳 Vibración: ON                │
│ ├─ 🔊 Sonidos: ON                  │
│ └─ ⚡ Modo ahorro: OFF             │
│                                     │
│ AYUDA                               │
│ ├─ 📚 Tutorial                     │
│ ├─ ❓ Preguntas frecuentes         │
│ ├─ 🆘 Reportar problema            │
│ └─ ℹ️ Acerca de v1.0.0             │
│                                     │
│ ┌─────────────────────────────────┐│
│ │ 🔄 Última sync: Hace 2 min      ││
│ │ [🚪 Cerrar sesión]              ││
│ └─────────────────────────────────┘│
├─────────────────────────────────────┤
│ 🏠    📋    📷    🔍    👤        │
└─────────────────────────────────────┘
```


---

## 7. Navigation & Flow Diagrams

### 7.1 Application Navigation Map

```
                           ┌─────────────┐
                           │   SPLASH    │
                           │   SCREEN    │
                           └──────┬──────┘
                                  │
                                  ▼
                           ┌─────────────┐
              ┌────────────│    LOGIN    │
              │            │     M1      │
              │            └──────┬──────┘
              │                   │ success
              │                   ▼
              │            ┌─────────────┐
              │            │    HOME     │◄────────────────────┐
              │            │     M2      │                     │
              │            └──────┬──────┘                     │
              │                   │                            │
              │    ┌──────────────┼──────────────┐            │
              │    │              │              │            │
              │    ▼              ▼              ▼            │
              │ ┌─────────┐ ┌─────────┐ ┌─────────────┐      │
              │ │RECEIVING│ │DISPATCH │ │   QUERY     │      │
              │ │  M3-M6  │ │  M7-M10 │ │    M11      │      │
              │ └────┬────┘ └────┬────┘ └──────┬──────┘      │
              │      │           │             │              │
              │      ▼           ▼             │              │
              │   ┌─────────────────────────┐  │              │
              │   │       COMPLETION        │──┘              │
              │   │     (Success Screen)    │─────────────────┘
              │   └─────────────────────────┘
              │                   
              │   ┌─────────────┐
              └──►│   PROFILE   │
                  │     M12     │
                  └─────────────┘
```

### 7.2 Receiving Module Flow

```
M3: Start Reception
│
├─► Has Purchase Order?
│   │
│   ├─► YES: Scan PO QR or Manual Entry
│   │   │
│   │   ├─► PO Found → Load Expected Products
│   │   └─► PO Not Found → Create without PO
│   │
│   └─► NO: Select Reason (Dropdown)
│       ├─ Local purchase without PO
│       ├─ Customer return
│       ├─ Inter-warehouse transfer
│       └─ Inventory adjustment
│
▼
M4: Product Scanning
│
├─► Scan Product QR
│   │
│   ├─► Product has QR → Validate against catalog
│   │   │
│   │   ├─► In expected list → Add to scanned
│   │   └─► NOT in expected → Warning + Options
│   │
│   └─► Product NO QR → Search manually
│       │
│       └─► Select from catalog → Generate QR → Print label
│
├─► For each product:
│   ├─ Enter quantity
│   ├─ Enter lot number (optional)
│   ├─ Enter expiration date (optional)
│   └─ Take photo (optional)
│
└─► Continue when all products scanned
│
▼
M5: Location Assignment (Putaway)
│
├─► For each product:
│   │
│   ├─► System suggests optimal location
│   │   │
│   │   ├─► Accept suggestion
│   │   │   └─► Scan location QR to confirm
│   │   │       │
│   │   │       ├─► Correct location → ✓ Confirmed
│   │   │       └─► Wrong location → Error + Guide
│   │   │
│   │   └─► Select alternative
│   │       └─► Provide reason → Scan to confirm
│   │
│   └─► Cannot find location?
│       └─► Report problem → Select new location
│
└─► All products located → Continue
│
▼
M6: Confirmation
│
├─► Show summary
├─► Show any warnings/observations
├─► Actions: Email, Print, Share
│
└─► Options:
    ├─ New Reception → M3
    └─ Go Home → M2
```

### 7.3 Dispatch Module Flow

```
M7: Order List
│
├─► Filter by: All / Urgent / Mine / Paused
├─► Search by order number, destination
│
├─► Select Order
│   │
│   ├─► Pending order → "TAKE ORDER"
│   │   └─► Assign to self → M8
│   │
│   ├─► Own order (in progress) → "CONTINUE"
│   │   └─► Resume → M8
│   │
│   ├─► Other's order → "VIEW PROGRESS"
│   │   └─► Read-only view
│   │
│   └─► Paused order → "RESUME"
│       └─► Continue → M8
│
▼
M8: Picking Process
│
├─► System calculates optimal route (TSP)
│
├─► For each item (in optimized sequence):
│   │
│   ├─► Display: Product, Location, Quantity, Image
│   │
│   ├─► Navigate to location
│   │   └─► Optional: View map
│   │
│   ├─► DOUBLE-SCAN VALIDATION:
│   │   │
│   │   ├─► 1. Scan Location QR
│   │   │   ├─► Correct → Proceed
│   │   │   └─► Wrong → Error + Guide
│   │   │
│   │   └─► 2. Scan Product QR
│   │       ├─► Correct → Enter quantity
│   │       └─► Wrong → Error + Guide
│   │
│   ├─► Enter picked quantity
│   │   │
│   │   ├─► Full quantity → ✓ Picked
│   │   │
│   │   ├─► Partial quantity
│   │   │   └─► Reason: Not enough stock
│   │   │       ├─ Take partial
│   │   │       ├─ Search alternate location
│   │   │       └─ Skip item
│   │   │
│   │   └─► Zero (not found)
│   │       └─► Report discrepancy
│   │           └─ Suggest alternatives
│   │
│   └─► [PAUSE] available at any time
│       └─► Save progress → Return to M7
│
└─► All items processed → Continue
│
▼
M9: Packing & Labeling
│
├─► Show picking summary
├─► Show packing instructions
├─► Verification checklist
│   ├─ ☐ Products packed correctly
│   ├─ ☐ Quantities match
│   ├─ ☐ No visible damage
│   └─ ☐ Adequate packaging
│
├─► Optional: Take packing photo
│
├─► Generate dispatch label
│   │
│   ├─► Preview label
│   ├─► Select printer
│   └─► Print
│
└─► Scan printed label to confirm → Continue
│
▼
M10: Confirmation
│
├─► Show completion summary
├─► Show tracking code with QR
├─► Show performance metrics
│   ├─ Time vs average
│   ├─ Accuracy
│   └─ Productivity
│
├─► Next step suggestions
│   └─► "4 urgent orders pending"
│
└─► Options:
    ├─ View urgent orders → M7 (filtered)
    └─ Go Home → M2
```

### 7.4 Navigation Transitions

| From | To | Trigger | Animation |
|------|-----|---------|-----------|
| Any | Home | Home tab tap | Slide |
| Login | Home | Success auth | Fade |
| Home | Module | Card tap | Slide right |
| Module | Home | Back / Complete | Slide left |
| List | Detail | Item tap | Slide up (modal) |
| Any | Scanner | Scan button | Fade (overlay) |
| Scanner | Previous | Close / Success | Fade out |
| Step N | Step N+1 | Continue | Slide left |
| Step N | Step N-1 | Back | Slide right |

---

## 8. Mock Data Schema

### 8.1 Sample Products

```typescript
const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    sku: "REP-12345",
    codes: {
      internal: "FLT-A1234",
      vendor: "VEND-998877",
      oem: "OEM-XYZ-456"
    },
    name: "Filtro de Aceite XYZ",
    description: "Filtro de aceite de alta calidad compatible con múltiples modelos",
    category: {
      id: "cat-lub",
      name: "Lubricación",
      path: ["Repuestos", "Lubricación", "Filtros"]
    },
    attributes: {
      weight: 0.5,
      dimensions: { length: 10, width: 10, height: 15 },
      requiresRefrigeration: false,
      isHazardous: false
    },
    compatibility: {
      models: ["Yamaha FZ150 2020-2024", "Honda CB125 2019-2024"],
      alternateProducts: ["REP-12346"]
    },
    pricing: {
      cost: 18.50,
      retail: 25.99,
      currency: "USD"
    },
    inventory: {
      reorderPoint: 20,
      safetyStock: 10,
      maxQuantity: 100,
      abcClass: "A"
    },
    media: {
      primaryImage: "/images/products/filter-oil-xyz.jpg",
      thumbnailImage: "/images/products/filter-oil-xyz-thumb.jpg",
      additionalImages: []
    },
    qrCode: "SS:P:REP-12345",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2025-11-20T14:30:00Z"
  },
  {
    id: "prod-002",
    sku: "REP-98765",
    codes: {
      internal: "BRK-P001",
      vendor: "VEND-112233",
      oem: "OEM-BRK-789"
    },
    name: "Pastilla de Freno Delantera",
    description: "Pastillas de freno de alto rendimiento para uso diario y deportivo",
    category: {
      id: "cat-brk",
      name: "Frenos",
      path: ["Repuestos", "Frenos", "Pastillas"]
    },
    attributes: {
      weight: 0.3,
      dimensions: { length: 8, width: 5, height: 2 },
      requiresRefrigeration: false,
      isHazardous: false
    },
    compatibility: {
      models: ["Yamaha MT-15 2019-2024", "Honda CBR150 2020-2024"],
      alternateProducts: []
    },
    pricing: {
      cost: 12.00,
      retail: 18.50,
      currency: "USD"
    },
    inventory: {
      reorderPoint: 15,
      safetyStock: 8,
      maxQuantity: 50,
      abcClass: "A"
    },
    media: {
      primaryImage: "/images/products/brake-pad-front.jpg",
      thumbnailImage: "/images/products/brake-pad-front-thumb.jpg",
      additionalImages: []
    },
    qrCode: "SS:P:REP-98765",
    status: "active",
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2025-11-22T11:15:00Z"
  },
  // Add 8-10 more sample products...
];
```

### 8.2 Sample Locations

```typescript
const MOCK_LOCATIONS: WarehouseLocation[] = [
  {
    id: "loc-001",
    code: "A-01-E1-N1",
    hierarchy: {
      warehouse: "Main Warehouse",
      zone: "A",
      aisle: "01",
      rack: "E1",
      level: "N1"
    },
    type: "storage",
    capacity: {
      maxUnits: 100,
      maxWeight: 50,
      maxVolume: 125000,
      currentUtilization: 0.65
    },
    restrictions: {
      allowedCategories: ["cat-lub", "cat-brk"],
      temperatureControlled: false,
      hazardousApproved: false
    },
    coordinates: { x: 100, y: 50, floor: 1 },
    qrCode: "SS:L:A-01-E1-N1",
    status: "active"
  },
  {
    id: "loc-002",
    code: "A-03-E2-N1",
    hierarchy: {
      warehouse: "Main Warehouse",
      zone: "A",
      aisle: "03",
      rack: "E2",
      level: "N1"
    },
    type: "storage",
    capacity: {
      maxUnits: 80,
      maxWeight: 40,
      maxVolume: 100000,
      currentUtilization: 0.45
    },
    restrictions: {
      allowedCategories: ["cat-lub"],
      temperatureControlled: false,
      hazardousApproved: false
    },
    coordinates: { x: 180, y: 50, floor: 1 },
    qrCode: "SS:L:A-03-E2-N1",
    status: "active"
  },
  // Add more locations for complete warehouse coverage...
];
```

### 8.3 Sample Orders

```typescript
const MOCK_ORDERS: PickingOrder[] = [
  {
    id: "ord-001",
    orderNumber: "DP-2025-0145",
    type: "dispatch",
    priority: "urgent",
    status: "pending",
    requester: {
      id: "req-001",
      name: "Carlos Mendoza",
      department: "Tienda Centro",
      contact: "(02) 123-4567"
    },
    destination: {
      name: "Tienda Centro - Local 5",
      address: "Av. Principal #123, Guayaquil",
      phone: "(02) 123-4567"
    },
    items: [
      {
        productId: "prod-001",
        productSku: "REP-12345",
        productName: "Filtro de Aceite XYZ",
        productImage: "/images/products/filter-oil-xyz-thumb.jpg",
        requestedQuantity: 5,
        pickedQuantity: 0,
        location: {
          code: "A-03-E2-N1",
          zone: "A",
          availableQuantity: 25
        },
        alternateLocations: [
          { code: "A-03-E3-N1", quantity: 15 }
        ],
        status: "pending"
      },
      {
        productId: "prod-002",
        productSku: "REP-98765",
        productName: "Pastilla de Freno Delantera",
        productImage: "/images/products/brake-pad-front-thumb.jpg",
        requestedQuantity: 4,
        pickedQuantity: 0,
        location: {
          code: "B-01-E3-N2",
          zone: "B",
          availableQuantity: 25
        },
        status: "pending"
      }
      // More items...
    ],
    notes: "Empacar por separado las bujías. Cliente VIP.",
    createdAt: "2025-11-25T08:30:00Z",
    dueAt: "2025-11-25T17:00:00Z"
  },
  // More orders...
];
```

### 8.4 Sample Users

```typescript
const MOCK_USERS = [
  {
    id: "user-001",
    username: "jperez",
    email: "juan.perez@massline.ec",
    name: "Juan Pérez",
    role: "operator",
    warehouse: "Main Warehouse",
    zones: ["A", "B"],
    avatar: "/images/avatars/jperez.jpg",
    stats: {
      receptions: 248,
      dispatches: 1523,
      accuracy: 99.2,
      productivityDelta: 18
    },
    memberSince: "2024-01-15"
  },
  {
    id: "user-002",
    username: "mgarcia",
    email: "maria.garcia@massline.ec",
    name: "María García",
    role: "supervisor",
    warehouse: "Main Warehouse",
    zones: ["A", "B", "C", "D"],
    avatar: "/images/avatars/mgarcia.jpg",
    stats: {
      receptions: 156,
      dispatches: 892,
      accuracy: 99.8,
      productivityDelta: 22
    },
    memberSince: "2023-06-01"
  }
];
```

### 8.5 Sample Transactions

```typescript
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-001",
    type: "dispatch",
    status: "completed",
    who: {
      userId: "user-001",
      userName: "Juan Pérez",
      role: "operator"
    },
    what: {
      productId: "prod-001",
      productSku: "REP-12345",
      productName: "Filtro de Aceite XYZ",
      quantity: 10,
      previousQuantity: 55
    },
    when: {
      createdAt: "2025-11-25T09:30:00Z",
      completedAt: "2025-11-25T09:32:15Z",
      duration: 135
    },
    where: {
      fromLocation: "A-03-E2-N1",
      warehouseId: "wh-001"
    },
    why: {
      orderReference: "DP-2025-0144",
      notes: "Regular dispatch"
    },
    validation: {
      locationQrScanned: true,
      productQrScanned: true,
      quantityConfirmed: true
    }
  }
  // More transactions...
];
```

---

## 9. Prototype Implementation Guide

### 9.1 Technology Stack for Prototype

```
RECOMMENDED STACK:
├── Framework: React Native (Expo)
│   └── Enables iOS/Android from single codebase
│
├── State Management: Zustand or Redux Toolkit
│   └── For global state, offline queue
│
├── Navigation: React Navigation v6
│   └── Stack + Tab navigation
│
├── UI Components: 
│   ├── React Native Paper (Material Design)
│   └── Custom components as needed
│
├── Camera/QR: expo-camera + expo-barcode-scanner
│   └── For scanning simulation
│
├── Styling: StyleSheet API + Design Tokens
│   └── Consistent with design system
│
└── Mock Data: JSON files + AsyncStorage
    └── Persistent mock data
```

### 9.2 Project Structure

```
smartstock-mobile/
├── src/
│   ├── app/                      # App entry, providers
│   │   ├── App.tsx
│   │   └── Navigation.tsx
│   │
│   ├── screens/                  # Screen components
│   │   ├── auth/
│   │   │   └── LoginScreen.tsx
│   │   ├── home/
│   │   │   └── HomeScreen.tsx
│   │   ├── receiving/
│   │   │   ├── StartReceptionScreen.tsx
│   │   │   ├── ProductScanningScreen.tsx
│   │   │   ├── LocationAssignmentScreen.tsx
│   │   │   └── ReceptionConfirmationScreen.tsx
│   │   ├── dispatch/
│   │   │   ├── OrderListScreen.tsx
│   │   │   ├── PickingProcessScreen.tsx
│   │   │   ├── PackingScreen.tsx
│   │   │   └── DispatchConfirmationScreen.tsx
│   │   ├── query/
│   │   │   └── InventoryQueryScreen.tsx
│   │   └── profile/
│   │       └── ProfileScreen.tsx
│   │
│   ├── components/               # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── scanner/
│   │   │   ├── QRScanner.tsx
│   │   │   └── ScannerOverlay.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductListItem.tsx
│   │   │   └── ProductDetailModal.tsx
│   │   ├── location/
│   │   │   ├── LocationCard.tsx
│   │   │   ├── LocationSuggestion.tsx
│   │   │   └── WarehouseMap.tsx
│   │   ├── picking/
│   │   │   ├── PickingListItem.tsx
│   │   │   ├── QuantitySelector.tsx
│   │   │   └── RoutePreview.tsx
│   │   └── navigation/
│   │       ├── BottomTabBar.tsx
│   │       ├── Header.tsx
│   │       └── Stepper.tsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useQRScanner.ts
│   │   ├── useInventory.ts
│   │   ├── useOrders.ts
│   │   └── useAuth.ts
│   │
│   ├── store/                    # State management
│   │   ├── index.ts
│   │   ├── authSlice.ts
│   │   ├── inventorySlice.ts
│   │   ├── ordersSlice.ts
│   │   └── transactionsSlice.ts
│   │
│   ├── services/                 # API/data services
│   │   ├── api.ts                # (Mock API)
│   │   ├── mockData.ts
│   │   └── storage.ts
│   │
│   ├── utils/                    # Utilities
│   │   ├── qrParser.ts
│   │   ├── routeOptimizer.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   │
│   ├── constants/                # Constants & config
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── config.ts
│   │
│   └── types/                    # TypeScript types
│       ├── product.ts
│       ├── location.ts
│       ├── order.ts
│       ├── transaction.ts
│       └── user.ts
│
├── assets/                       # Images, fonts
│   ├── images/
│   │   ├── logo.png
│   │   ├── products/
│   │   └── illustrations/
│   └── fonts/
│
└── package.json
```

### 9.3 Simulated Validations

Since this is a prototype without a real backend, implement these simulations:

```typescript
// services/mockValidations.ts

export const simulateQRScan = async (qrData: string): Promise<ScanResult> => {
  // Simulate network delay
  await delay(500);
  
  // Parse QR format: SS:{TYPE}:{ID}
  const parsed = parseQRCode(qrData);
  
  if (!parsed) {
    return { success: false, error: "Invalid QR format" };
  }
  
  switch (parsed.type) {
    case 'P': // Product
      const product = MOCK_PRODUCTS.find(p => p.sku === parsed.id);
      return product 
        ? { success: true, type: 'product', data: product }
        : { success: false, error: "Product not found" };
    
    case 'L': // Location
      const location = MOCK_LOCATIONS.find(l => l.code === parsed.id);
      return location
        ? { success: true, type: 'location', data: location }
        : { success: false, error: "Location not found" };
    
    case 'D': // Dispatch order
      const order = MOCK_ORDERS.find(o => o.orderNumber === parsed.id);
      return order
        ? { success: true, type: 'order', data: order }
        : { success: false, error: "Order not found" };
  }
};

export const simulateLogin = async (
  username: string, 
  password: string
): Promise<AuthResult> => {
  await delay(1000);
  
  const user = MOCK_USERS.find(u => u.username === username);
  
  if (user && password === 'demo123') {
    return { success: true, user, token: 'mock-jwt-token' };
  }
  
  return { success: false, error: "Invalid credentials" };
};

export const simulatePutawayRecommendation = (
  product: Product,
  quantity: number
): PutawayRecommendation => {
  // Simplified putaway algorithm for prototype
  const availableLocations = MOCK_LOCATIONS
    .filter(l => l.status === 'active')
    .filter(l => l.capacity.currentUtilization < 0.9)
    .filter(l => l.restrictions.allowedCategories.includes(product.category.id))
    .sort((a, b) => {
      // Score by ABC class match
      const zoneScore = product.inventory.abcClass === 'A' 
        ? (a.hierarchy.zone === 'A' ? 10 : 0) 
        : 0;
      // Score by utilization (prefer 40-70%)
      const utilScore = a.capacity.currentUtilization > 0.4 
        && a.capacity.currentUtilization < 0.7 ? 5 : 0;
      return (zoneScore + utilScore) - (zoneScore + utilScore);
    });
  
  return {
    primary: availableLocations[0],
    alternatives: availableLocations.slice(1, 3),
    reasoning: "Zona de alta rotación con espacio disponible"
  };
};

export const simulateRouteOptimization = (
  items: PickingItem[]
): OptimizedRoute => {
  // Simple nearest-neighbor for prototype
  const sorted = [...items].sort((a, b) => {
    const locA = MOCK_LOCATIONS.find(l => l.code === a.location.code);
    const locB = MOCK_LOCATIONS.find(l => l.code === b.location.code);
    
    if (!locA || !locB) return 0;
    
    // Sort by zone first, then by aisle
    if (locA.hierarchy.zone !== locB.hierarchy.zone) {
      return locA.hierarchy.zone.localeCompare(locB.hierarchy.zone);
    }
    return locA.hierarchy.aisle.localeCompare(locB.hierarchy.aisle);
  });
  
  return {
    items: sorted,
    totalDistance: sorted.length * 15, // 15m average per item
    estimatedTime: sorted.length * 3   // 3min average per item
  };
};
```

### 9.4 Scanner Simulation for Web/Emulator

```typescript
// components/scanner/MockScanner.tsx

const MockScanner: React.FC<{ onScan: (data: string) => void }> = ({ onScan }) => {
  const [showMockButtons, setShowMockButtons] = useState(true);
  
  // Predefined QR codes for testing
  const mockQRCodes = [
    { label: "Product: Filter", code: "SS:P:REP-12345" },
    { label: "Product: Brake Pad", code: "SS:P:REP-98765" },
    { label: "Location: A-03-E2-N1", code: "SS:L:A-03-E2-N1" },
    { label: "Location: B-01-E3-N2", code: "SS:L:B-01-E3-N2" },
    { label: "Order: DP-2025-0145", code: "SS:D:DP-2025-0145" },
    { label: "Invalid QR", code: "INVALID-CODE" },
  ];
  
  return (
    <View style={styles.container}>
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderText}>
          Camera Preview
        </Text>
        <Text style={styles.subText}>
          (Use buttons below to simulate scans)
        </Text>
      </View>
      
      <ScrollView style={styles.buttonContainer}>
        {mockQRCodes.map((mock, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mockButton}
            onPress={() => {
              // Simulate scan delay
              setTimeout(() => onScan(mock.code), 300);
            }}
          >
            <Text style={styles.buttonText}>{mock.label}</Text>
            <Text style={styles.codeText}>{mock.code}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
```

---

## 10. Best Practices for Claude Code

### 10.1 Component Structure

```typescript
// RECOMMENDED COMPONENT PATTERN

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/constants';

// Props interface with clear documentation
interface ProductCardProps {
  /** The product to display */
  product: Product;
  /** Called when card is pressed */
  onPress?: (product: Product) => void;
  /** Visual variant */
  variant?: 'compact' | 'detailed' | 'list';
  /** Whether the card is selected */
  selected?: boolean;
}

/**
 * ProductCard displays a product with image, name, code and stock info.
 * Use in product lists, search results, and picking screens.
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  variant = 'compact',
  selected = false,
}) => {
  // Component logic here
  
  return (
    <View style={[styles.container, selected && styles.selected]}>
      {/* Component JSX */}
    </View>
  );
};

// Styles at bottom using design system tokens
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.space4,
    padding: spacing.space4,
    ...shadows.card,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.primary500,
  },
});
```

### 10.2 Screen Implementation Pattern

```typescript
// RECOMMENDED SCREEN PATTERN

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header, LoadingSpinner, EmptyState, ErrorView } from '@/components';
import { useOrders } from '@/hooks';

type ScreenState = 'loading' | 'empty' | 'error' | 'ready';

export const OrderListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { orders, loading, error, refresh } = useOrders();
  
  // Determine screen state
  const screenState: ScreenState = loading ? 'loading' 
    : error ? 'error'
    : orders.length === 0 ? 'empty'
    : 'ready';
  
  // Handle navigation
  const handleOrderPress = (order: PickingOrder) => {
    navigation.navigate('PickingProcess', { orderId: order.id });
  };
  
  // Render based on state
  const renderContent = () => {
    switch (screenState) {
      case 'loading':
        return <LoadingSpinner message="Cargando órdenes..." />;
      case 'error':
        return <ErrorView error={error} onRetry={refresh} />;
      case 'empty':
        return <EmptyState type="no_orders" onAction={refresh} />;
      case 'ready':
        return (
          <ScrollView>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={handleOrderPress}
              />
            ))}
          </ScrollView>
        );
    }
  };
  
  return (
    <View style={styles.container}>
      <Header title="Órdenes de Despacho" />
      {renderContent()}
    </View>
  );
};
```

### 10.3 State Management for Prototype

```typescript
// store/ordersSlice.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_ORDERS } from '@/services/mockData';

interface OrdersState {
  orders: PickingOrder[];
  activeOrder: PickingOrder | null;
  
  // Actions
  setActiveOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateItemStatus: (orderId: string, itemIndex: number, status: ItemStatus) => void;
  recordPick: (orderId: string, itemIndex: number, pickedQty: number) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: MOCK_ORDERS,
      activeOrder: null,
      
      setActiveOrder: (orderId) => {
        const order = get().orders.find(o => o.id === orderId);
        set({ activeOrder: order || null });
      },
      
      updateOrderStatus: (orderId, status) => {
        set(state => ({
          orders: state.orders.map(o =>
            o.id === orderId ? { ...o, status } : o
          )
        }));
      },
      
      updateItemStatus: (orderId, itemIndex, status) => {
        set(state => ({
          orders: state.orders.map(o => {
            if (o.id !== orderId) return o;
            const items = [...o.items];
            items[itemIndex] = { ...items[itemIndex], status };
            return { ...o, items };
          })
        }));
      },
      
      recordPick: (orderId, itemIndex, pickedQty) => {
        set(state => ({
          orders: state.orders.map(o => {
            if (o.id !== orderId) return o;
            const items = [...o.items];
            items[itemIndex] = {
              ...items[itemIndex],
              pickedQuantity: pickedQty,
              status: pickedQty === items[itemIndex].requestedQuantity 
                ? 'picked' 
                : pickedQty > 0 ? 'partial' : 'not_found',
              pickedAt: new Date().toISOString(),
            };
            return { ...o, items };
          })
        }));
      },
    }),
    { name: 'smartstock-orders' }
  )
);
```

### 10.4 Navigation Setup

```typescript
// app/Navigation.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main tab navigator (after login)
const MainTabs = () => (
  <Tab.Navigator
    tabBar={props => <CustomBottomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Tasks" component={TasksScreen} />
    <Tab.Screen name="Scan" component={ScanPlaceholder} />
    <Tab.Screen name="Query" component={InventoryQueryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// Root navigator
export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            
            {/* Receiving Flow */}
            <Stack.Screen name="StartReception" component={StartReceptionScreen} />
            <Stack.Screen name="ProductScanning" component={ProductScanningScreen} />
            <Stack.Screen name="LocationAssignment" component={LocationAssignmentScreen} />
            <Stack.Screen name="ReceptionConfirmation" component={ReceptionConfirmationScreen} />
            
            {/* Dispatch Flow */}
            <Stack.Screen name="OrderList" component={OrderListScreen} />
            <Stack.Screen name="PickingProcess" component={PickingProcessScreen} />
            <Stack.Screen name="Packing" component={PackingScreen} />
            <Stack.Screen name="DispatchConfirmation" component={DispatchConfirmationScreen} />
            
            {/* Modal Screens */}
            <Stack.Group screenOptions={{ presentation: 'modal' }}>
              <Stack.Screen name="QRScanner" component={QRScannerScreen} />
              <Stack.Screen name="ProductDetail" component={ProductDetailModal} />
              <Stack.Screen name="LocationSearch" component={LocationSearchModal} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 10.5 Design Token Implementation

```typescript
// constants/colors.ts
export const colors = {
  // Primary
  primary50: '#EFF6FF',
  primary100: '#DBEAFE',
  primary500: '#3B82F6',
  primary600: '#2563EB',
  primary700: '#1D4ED8',
  
  // Secondary
  secondary500: '#10B981',
  secondary600: '#059669',
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Neutral
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  
  white: '#FFFFFF',
  black: '#000000',
} as const;

// constants/spacing.ts
export const spacing = {
  space1: 4,
  space2: 8,
  space3: 12,
  space4: 16,
  space5: 20,
  space6: 24,
  space8: 32,
  space10: 40,
  space12: 48,
} as const;

// constants/typography.ts
export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 'bold' as const,
  },
  h2: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: 'bold' as const,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: 'bold' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'normal' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'normal' as const,
  },
} as const;

// constants/shadows.ts
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;
```

### 10.6 Checklist for Complete Prototype

```markdown
## Pre-Implementation Checklist

### Setup
- [ ] Initialize React Native project (Expo recommended)
- [ ] Configure navigation (React Navigation)
- [ ] Set up state management (Zustand or Redux)
- [ ] Implement design tokens (colors, spacing, typography)
- [ ] Create base components (Button, Card, Input)

### Core Screens
- [ ] Login screen with validation
- [ ] Home dashboard with quick actions
- [ ] Receiving: Start reception
- [ ] Receiving: Product scanning
- [ ] Receiving: Location assignment
- [ ] Receiving: Confirmation
- [ ] Dispatch: Order list
- [ ] Dispatch: Picking process
- [ ] Dispatch: Packing
- [ ] Dispatch: Confirmation
- [ ] Query: Inventory search
- [ ] Profile: User settings

### Components
- [ ] QR Scanner (with mock simulation)
- [ ] Product Card (3 variants)
- [ ] Location Card
- [ ] Picking List Item
- [ ] Warehouse Map (simplified)
- [ ] Stepper/Progress indicator
- [ ] Bottom Tab Bar
- [ ] Header with back navigation
- [ ] Empty states
- [ ] Loading states
- [ ] Error states

### Mock Data
- [ ] 10+ sample products
- [ ] 20+ sample locations
- [ ] 5+ sample orders
- [ ] 3+ sample users
- [ ] Sample transactions

### Validations & Feedback
- [ ] Form validation (real-time)
- [ ] QR scan simulation
- [ ] Success/error animations
- [ ] Haptic feedback (on device)
- [ ] Loading indicators

### Navigation Flows
- [ ] Complete receiving flow (4 screens)
- [ ] Complete dispatch flow (4 screens)
- [ ] Modal presentations
- [ ] Tab navigation
- [ ] Back navigation always available

### Polish
- [ ] Consistent styling throughout
- [ ] Appropriate font sizes
- [ ] Touch target sizes (min 48dp)
- [ ] Color contrast (WCAG AA)
- [ ] State persistence
```

---

## Appendix A: Corrections & Clarifications

During analysis of the source documents, the following corrections were made for technical feasibility:

1. **Offline Mode Scope**: Original spec mentioned "robust offline mode" but didn't specify sync behavior. This guide defines queue-based sync with conflict resolution.

2. **Double-Scan Validation**: Original mentioned "mandatory validation" but order was unclear. This guide specifies: Location QR first, then Product QR.

3. **Route Optimization**: Original mentioned "TSP-based" without detail. This guide specifies nearest-neighbor heuristic as practical approximation for prototype.

4. **QR Code Format**: Original didn't specify QR content format. This guide defines: `SS:{TYPE}:{ID}` standard format.

5. **Putaway Algorithm**: Original listed 4 factors but didn't specify weights. This guide provides scoring priorities for prototype implementation.

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **ABC Classification** | Inventory categorization: A (high value/rotation), B (medium), C (low) |
| **Directed Putaway** | System suggests optimal storage location based on rules |
| **Double-Scan** | Validation requiring both location and product QR scans |
| **ETL** | Extract, Transform, Load — data migration process |
| **FIFO** | First-In-First-Out — queue processing order |
| **Picking** | Collecting products from storage to fulfill an order |
| **Putaway** | Storing received products in designated locations |
| **SKU** | Stock Keeping Unit — unique product identifier |
| **TSP** | Traveling Salesman Problem — route optimization algorithm |
| **WMS** | Warehouse Management System |
| **5W** | Who, What, When, Where, Why — traceability data |

---

*Document generated for SmartStock Mobile App Prototype Implementation*  
*Version 1.0 — November 2025*
