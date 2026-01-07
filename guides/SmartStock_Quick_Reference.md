# SmartStock Mobile — Quick Reference Card

**For Claude Code & AI Coding Agents**

---

## 🎨 Design Tokens (Copy-Paste Ready)

### Colors
```typescript
export const colors = {
  primary50: '#EFF6FF',
  primary100: '#DBEAFE',
  primary500: '#3B82F6',
  primary600: '#2563EB',
  primary700: '#1D4ED8',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',
  
  white: '#FFFFFF',
};
```

### Spacing (8pt Grid)
```typescript
export const spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
};
```

### Typography
```typescript
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: 'bold' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 12, fontWeight: 'normal' },
};
```

---

## 📱 Screen List (12 Screens)

| ID | Screen | Purpose |
|----|--------|---------|
| M1 | Login | Authentication |
| M2 | Home | Dashboard + Quick Actions |
| M3 | Start Reception | Initialize receiving |
| M4 | Product Scanning | Scan/identify products |
| M5 | Location Assignment | Directed putaway |
| M6 | Reception Confirmation | Summary |
| M7 | Order List | View dispatch orders |
| M8 | Picking Process | Guided picking |
| M9 | Packing | Package + label |
| M10 | Dispatch Confirmation | Complete dispatch |
| M11 | Inventory Query | Search products |
| M12 | Profile | User settings |

---

## 🔄 Navigation Flows

### Receiving Flow
```
M3 → M4 → M5 → M6 → Home
```

### Dispatch Flow
```
M7 → M8 → M9 → M10 → Home
```

### Bottom Navigation
```
Home | Tasks | Scan | Query | Profile
```

---

## 📦 Key Components

### Button Variants
| Variant | Height | Background | Border |
|---------|--------|------------|--------|
| Primary | 56px | primary500 | none |
| Secondary | 56px | transparent | 2px primary500 |
| Ghost | 48px | transparent | none |
| Danger | 56px | error | none |

### Card Types
- **Standard**: white, radius 16px, shadow elevation-2
- **Interactive**: + hover lift effect
- **Selected**: + 2px primary border

### Input States
- **Default**: 1px gray300 border
- **Focus**: 2px primary500 + glow
- **Error**: 2px error border
- **Success**: 2px success + checkmark

---

## 🏷️ QR Code Format

```
Product:  SS:P:{SKU}
Location: SS:L:{LOCATION_CODE}
Order:    SS:D:{ORDER_NUMBER}

Examples:
SS:P:REP-12345
SS:L:A-03-E2-N1
SS:D:DP-2025-0145
```

---

## 📍 Location Code Format

```
{ZONE}-{AISLE}-{RACK}-{LEVEL}

Example: A-03-E2-N1
- Zone A (high rotation)
- Aisle 03
- Rack E2
- Level N1 (ground)
```

---

## ✅ Validation Rules

### Double-Scan (Picking)
1. Scan Location QR first
2. Scan Product QR second
3. Enter quantity
4. Both must match order

### Form Validation
- Real-time on blur
- Required fields marked
- Error messages below field
- Button disabled until valid

---

## 🎭 States to Implement

Every screen needs:
- [ ] **Loading**: Spinner/skeleton
- [ ] **Empty**: Illustration + message + action
- [ ] **Error**: Message + retry button
- [ ] **Success**: Checkmark + next action

---

## 📊 Mock Data Minimums

| Entity | Quantity |
|--------|----------|
| Products | 10+ |
| Locations | 20+ |
| Orders | 5+ |
| Users | 3+ |
| Transactions | 10+ |

---

## 🚀 Quick Start Commands

```bash
# Create Expo project
npx create-expo-app smartstock-mobile --template blank-typescript

# Install dependencies
npm install @react-navigation/native @react-navigation/native-stack
npm install @react-navigation/bottom-tabs
npm install zustand
npm install react-native-paper
npm install expo-camera expo-barcode-scanner

# Run
npx expo start
```

---

## 📁 Essential File Structure

```
src/
├── screens/          # 12 screen components
├── components/       # Reusable UI
│   ├── common/      # Button, Card, Input
│   ├── scanner/     # QRScanner
│   ├── product/     # ProductCard
│   └── picking/     # PickingListItem
├── store/           # Zustand stores
├── services/        # Mock API
├── constants/       # Design tokens
└── types/           # TypeScript interfaces
```

---

*Quick Reference v1.0 — SmartStock Mobile Prototype*
