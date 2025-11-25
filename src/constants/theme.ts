/**
 * SmartStock Design System
 * Complete design tokens matching the specification
 */

// Colors from SmartStock_Quick_Reference.md
export const colors = {
  // Primary Colors
  primary50: '#EFF6FF',
  primary100: '#DBEAFE',
  primary500: '#3B82F6',
  primary600: '#2563EB',
  primary700: '#1D4ED8',

  // Semantic Colors
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  // Neutral Colors
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',

  // Status Colors for Inventory
  stockOk: '#10B981',
  stockLow: '#F59E0B',
  stockCritical: '#EF4444',
  stockExcess: '#8B5CF6',
} as const;

// Spacing (8pt Grid)
export const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 48,  // 48px
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const;

// Typography
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 1.2 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 1.3 },
  h3: { fontSize: 20, fontWeight: 'bold', lineHeight: 1.4 },
  h4: { fontSize: 18, fontWeight: '600', lineHeight: 1.4 },
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 1.5 },
  bodySmall: { fontSize: 14, fontWeight: 'normal', lineHeight: 1.4 },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 1.3 },
  button: { fontSize: 16, fontWeight: 'bold', lineHeight: 1.0 },
  code: { fontSize: 14, fontWeight: 'normal', lineHeight: 1.4, fontFamily: 'monospace' },
} as const;

// Border Radius
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

// Shadows (Elevation)
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  '2xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
} as const;

// Animation Durations
export const animations = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const;

// Component Sizes
export const componentSizes = {
  button: {
    sm: { height: 48, px: 16 },
    md: { height: 56, px: 24 },
    lg: { height: 64, px: 32 },
  },
  input: {
    height: 52,
    px: 16,
  },
  touchTarget: {
    min: 48, // Minimum touch target size
  },
} as const;

// QR Code Formats
export const qrFormats = {
  product: (sku: string) => `SS:P:${sku}`,
  location: (code: string) => `SS:L:${code}`,
  order: (orderNumber: string) => `SS:D:${orderNumber}`,
  parseQR: (qr: string) => {
    const [prefix, type, value] = qr.split(':');
    if (prefix !== 'SS') return null;
    return { type, value };
  },
} as const;

// Location Code Format
export const locationFormat = {
  format: (zone: string, aisle: string, rack: string, level: string) =>
    `${zone}-${aisle}-${rack}-${level}`,
  parse: (code: string) => {
    const [zone, aisle, rack, level] = code.split('-');
    return { zone, aisle, rack, level };
  },
} as const;

// Status Colors Mapping
export const statusColors = {
  ok: colors.success,
  low: colors.warning,
  critical: colors.error,
  pending: colors.gray300,
  current: colors.primary500,
  picked: colors.success,
  partial: colors.warning,
  not_found: colors.error,
} as const;

// Export type helpers
export type Color = typeof colors[keyof typeof colors];
export type Spacing = typeof spacing[keyof typeof spacing];
export type BorderRadius = typeof borderRadius[keyof typeof borderRadius];
