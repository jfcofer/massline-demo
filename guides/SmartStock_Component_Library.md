# SmartStock — Component Library Specification

**Ready-to-implement component templates for Claude Code**

---

## 1. Button Component

```tsx
// components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const colors = {
  primary500: '#3B82F6',
  primary700: '#1D4ED8',
  error: '#EF4444',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  white: '#FFFFFF',
};

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}) => {
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: { backgroundColor: disabled ? colors.gray300 : colors.primary500 },
          text: { color: colors.white },
        };
      case 'secondary':
        return {
          container: { 
            backgroundColor: 'transparent', 
            borderWidth: 2, 
            borderColor: disabled ? colors.gray300 : colors.primary500 
          },
          text: { color: disabled ? colors.gray500 : colors.primary500 },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: disabled ? colors.gray500 : colors.primary500 },
        };
      case 'danger':
        return {
          container: { backgroundColor: disabled ? colors.gray300 : colors.error },
          text: { color: colors.white },
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.container,
        variantStyles.container,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} />
      ) : (
        <Text style={[styles.text, variantStyles.text]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 120,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

---

## 2. Input Field Component

```tsx
// components/common/Input.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type InputState = 'default' | 'focus' | 'error' | 'success';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
}

const colors = {
  primary500: '#3B82F6',
  primary100: '#DBEAFE',
  success: '#10B981',
  error: '#EF4444',
  gray300: '#D1D5DB',
  gray500: '#6B7280',
  gray700: '#374151',
  white: '#FFFFFF',
};

export const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const getState = (): InputState => {
    if (error) return 'error';
    if (success) return 'success';
    if (isFocused) return 'focus';
    return 'default';
  };

  const state = getState();

  const getBorderColor = () => {
    switch (state) {
      case 'error': return colors.error;
      case 'success': return colors.success;
      case 'focus': return colors.primary500;
      default: return colors.gray300;
    }
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.container,
        { borderColor: getBorderColor() },
        state === 'focus' && styles.focusShadow,
      ]}>
        {leftIcon && (
          <Ionicons name={leftIcon} size={20} color={colors.gray500} style={styles.leftIcon} />
        )}
        <TextInput
          {...textInputProps}
          style={styles.input}
          placeholderTextColor={colors.gray500}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={20} color={colors.gray500} />
          </TouchableOpacity>
        )}
        {success && !rightIcon && (
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 6,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  focusShadow: {
    borderWidth: 2,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray700,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
  },
});
```

---

## 3. Card Component

```tsx
// components/common/Card.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'standard' | 'elevated' | 'interactive' | 'selected';
  onPress?: () => void;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'standard',
  onPress,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.base,
        variant === 'elevated' && styles.elevated,
        variant === 'selected' && styles.selected,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  elevated: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  selected: {
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
});
```

---

## 4. Product Card Component

```tsx
// components/product/ProductCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  sku: string;
  name: string;
  thumbnailImage: string;
  totalStock: number;
  locationCount: number;
  status: 'ok' | 'low' | 'critical';
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  variant?: 'compact' | 'detailed';
}

const statusColors = {
  ok: '#10B981',
  low: '#F59E0B',
  critical: '#EF4444',
};

const statusLabels = {
  ok: 'Disponible',
  low: 'Stock bajo',
  critical: 'Crítico',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  variant = 'compact',
}) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <Image source={{ uri: product.thumbnailImage }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.sku}>{product.sku}</Text>
        
        <View style={styles.footer}>
          <View style={styles.stockContainer}>
            <Text style={styles.stockLabel}>Stock: </Text>
            <Text style={styles.stockValue}>{product.totalStock} unidades</Text>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColors[product.status] + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[product.status] }]} />
            <Text style={[styles.statusText, { color: statusColors[product.status] }]}>
              {statusLabels[product.status]}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.locationText}>{product.locationCount} ubicaciones</Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  image: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sku: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  stockContainer: {
    flexDirection: 'row',
  },
  stockLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
```

---

## 5. Picking List Item Component

```tsx
// components/picking/PickingListItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ItemStatus = 'pending' | 'current' | 'picked' | 'partial' | 'not_found';

interface PickingItem {
  productName: string;
  productSku: string;
  productImage: string;
  requestedQuantity: number;
  pickedQuantity: number;
  locationCode: string;
  distance?: number;
  status: ItemStatus;
}

interface PickingListItemProps {
  item: PickingItem;
  index: number;
  onPress?: () => void;
}

const statusConfig: Record<ItemStatus, { color: string; icon: string; label: string }> = {
  pending: { color: '#D1D5DB', icon: 'ellipse-outline', label: 'Pendiente' },
  current: { color: '#3B82F6', icon: 'arrow-forward-circle', label: 'Actual' },
  picked: { color: '#10B981', icon: 'checkmark-circle', label: 'Completado' },
  partial: { color: '#F59E0B', icon: 'alert-circle', label: 'Parcial' },
  not_found: { color: '#EF4444', icon: 'close-circle', label: 'No encontrado' },
};

export const PickingListItem: React.FC<PickingListItemProps> = ({
  item,
  index,
  onPress,
}) => {
  const config = statusConfig[item.status];

  return (
    <View style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={styles.indexContainer}>
        <Text style={[styles.index, { color: config.color }]}>{index + 1}</Text>
      </View>
      
      <Image source={{ uri: item.productImage }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.productSku}>{item.productSku}</Text>
        
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#3B82F6" />
          <Text style={styles.locationCode}>{item.locationCode}</Text>
          {item.distance && (
            <Text style={styles.distance}>({item.distance}m)</Text>
          )}
        </View>
      </View>
      
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityValue}>{item.requestedQuantity}</Text>
        <Text style={styles.quantityLabel}>unid.</Text>
      </View>
      
      <Ionicons 
        name={config.icon as any} 
        size={24} 
        color={config.color} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  indexContainer: {
    width: 24,
    alignItems: 'center',
  },
  index: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productSku: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 4,
    fontFamily: 'monospace',
  },
  distance: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  quantityContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  quantityLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
});
```

---

## 6. Location Suggestion Card

```tsx
// components/location/LocationSuggestion.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationSuggestionProps {
  locationCode: string;
  zone: string;
  aisle: string;
  rack: string;
  level: string;
  reason: string;
  utilization: number;
  isConfirmed?: boolean;
  onScanPress: () => void;
  onMapPress?: () => void;
}

export const LocationSuggestion: React.FC<LocationSuggestionProps> = ({
  locationCode,
  zone,
  aisle,
  rack,
  level,
  reason,
  utilization,
  isConfirmed = false,
  onScanPress,
  onMapPress,
}) => {
  if (isConfirmed) {
    return (
      <View style={styles.confirmedContainer}>
        <Ionicons name="checkmark-circle" size={32} color="#10B981" />
        <Text style={styles.confirmedText}>UBICACIÓN CONFIRMADA</Text>
        <Text style={styles.confirmedCode}>{locationCode}</Text>
        <Text style={styles.confirmedSubtext}>Almacenado exitosamente</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="navigate" size={20} color="#3B82F6" />
        <Text style={styles.headerText}>UBICACIÓN SUGERIDA</Text>
      </View>
      
      <View style={styles.locationInfo}>
        <Text style={styles.zoneText}>
          ZONA {zone} - PASILLO {aisle}
        </Text>
        <Text style={styles.rackText}>
          ESTANTE {rack} - NIVEL {level}
        </Text>
        
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{locationCode}</Text>
        </View>
        
        <Text style={styles.reasonText}>{reason}</Text>
        
        <View style={styles.utilizationRow}>
          <Text style={styles.utilizationLabel}>Espacio disponible:</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${100 - utilization}%` }]} />
          </View>
          <Text style={styles.utilizationPercent}>{100 - utilization}%</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {onMapPress && (
          <TouchableOpacity style={styles.mapButton} onPress={onMapPress}>
            <Ionicons name="map-outline" size={18} color="#3B82F6" />
            <Text style={styles.mapButtonText}>Ver en mapa</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity style={styles.scanButton} onPress={onScanPress}>
        <Ionicons name="qr-code-outline" size={24} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>ESCANEAR QR UBICACIÓN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginLeft: 6,
  },
  locationInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  zoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rackText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 2,
  },
  codeBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#111827',
  },
  reasonText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
  utilizationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  utilizationLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  utilizationPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 4,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  confirmedContainer: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#10B981',
    padding: 24,
    alignItems: 'center',
  },
  confirmedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
  },
  confirmedCode: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    color: '#111827',
    marginTop: 4,
  },
  confirmedSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
```

---

## 7. Empty State Component

```tsx
// components/common/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

type EmptyStateType = 'no_orders' | 'no_results' | 'no_stock' | 'offline';

interface EmptyStateConfig {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
}

const configs: Record<EmptyStateType, EmptyStateConfig> = {
  no_orders: {
    icon: 'clipboard-outline',
    title: '¡Todo al día!',
    description: 'No hay órdenes pendientes',
    actionLabel: 'Actualizar',
  },
  no_results: {
    icon: 'search-outline',
    title: 'Sin resultados',
    description: 'No se encontraron productos para tu búsqueda',
    actionLabel: 'Limpiar búsqueda',
  },
  no_stock: {
    icon: 'cube-outline',
    title: 'Sin stock',
    description: 'Este producto no está disponible actualmente',
    actionLabel: 'Notificarme',
  },
  offline: {
    icon: 'cloud-offline-outline',
    title: 'Sin conexión',
    description: 'Trabajando en modo offline. Los cambios se sincronizarán al reconectar.',
    actionLabel: 'Reintentar',
  },
};

interface EmptyStateProps {
  type: EmptyStateType;
  customTitle?: string;
  customDescription?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  customTitle,
  customDescription,
  onAction,
}) => {
  const config = configs[type];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={64} color="#D1D5DB" />
      </View>
      
      <Text style={styles.title}>{customTitle || config.title}</Text>
      <Text style={styles.description}>{customDescription || config.description}</Text>
      
      {config.actionLabel && onAction && (
        <Button
          title={config.actionLabel}
          onPress={onAction}
          variant="secondary"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  button: {
    marginTop: 24,
  },
});
```

---

## 8. Stepper Component

```tsx
// components/navigation/Stepper.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={index}>
            <View style={styles.stepContainer}>
              <View style={[
                styles.circle,
                isCompleted && styles.circleCompleted,
                isCurrent && styles.circleCurrent,
              ]}>
                {isCompleted && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.label,
                (isCompleted || isCurrent) && styles.labelActive,
              ]}>
                {step.label}
              </Text>
            </View>
            
            {!isLast && (
              <View style={[
                styles.line,
                isCompleted && styles.lineCompleted,
              ]} />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  stepContainer: {
    alignItems: 'center',
    width: 70,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  circleCurrent: {
    borderColor: '#3B82F6',
    borderWidth: 3,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  labelActive: {
    color: '#374151',
    fontWeight: '600',
  },
  line: {
    flex: 1,
    height: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 11,
    marginHorizontal: -4,
  },
  lineCompleted: {
    backgroundColor: '#3B82F6',
  },
});
```

---

## 9. QR Scanner Simulator

```tsx
// components/scanner/MockQRScanner.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MockQRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  expectedType?: 'product' | 'location' | 'order';
}

const mockCodes = {
  product: [
    { label: 'Filtro de Aceite XYZ', code: 'SS:P:REP-12345' },
    { label: 'Pastilla de Freno', code: 'SS:P:REP-98765' },
    { label: 'Bujía NGK', code: 'SS:P:REP-55555' },
  ],
  location: [
    { label: 'A-03-E2-N1', code: 'SS:L:A-03-E2-N1' },
    { label: 'B-01-E3-N2', code: 'SS:L:B-01-E3-N2' },
    { label: 'A-01-E1-N1', code: 'SS:L:A-01-E1-N1' },
  ],
  order: [
    { label: 'Orden DP-2025-0145', code: 'SS:D:DP-2025-0145' },
    { label: 'Orden DP-2025-0146', code: 'SS:D:DP-2025-0146' },
  ],
};

export const MockQRScanner: React.FC<MockQRScannerProps> = ({
  onScan,
  onClose,
  expectedType,
}) => {
  const codes = expectedType ? mockCodes[expectedType] : [
    ...mockCodes.product,
    ...mockCodes.location,
    ...mockCodes.order,
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Simular Escaneo QR</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.cameraPlaceholder}>
        <Ionicons name="camera" size={64} color="#6B7280" />
        <Text style={styles.placeholderText}>Vista de cámara</Text>
        <Text style={styles.subText}>Selecciona un código abajo para simular</Text>
      </View>

      <ScrollView style={styles.buttonContainer}>
        <Text style={styles.sectionTitle}>Códigos de prueba:</Text>
        
        {codes.map((mock, index) => (
          <TouchableOpacity
            key={index}
            style={styles.mockButton}
            onPress={() => {
              setTimeout(() => onScan(mock.code), 300);
            }}
          >
            <View>
              <Text style={styles.buttonLabel}>{mock.label}</Text>
              <Text style={styles.buttonCode}>{mock.code}</Text>
            </View>
            <Ionicons name="qr-code" size={24} color="#3B82F6" />
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={[styles.mockButton, styles.errorButton]}
          onPress={() => onScan('INVALID-QR-CODE')}
        >
          <View>
            <Text style={styles.buttonLabel}>Código Inválido</Text>
            <Text style={styles.buttonCode}>INVALID-QR-CODE</Text>
          </View>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cameraPlaceholder: {
    height: 250,
    backgroundColor: '#1F2937',
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 8,
  },
  subText: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  mockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonCode: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 2,
  },
});
```

---

*Component Library v1.0 — SmartStock Mobile Prototype*
