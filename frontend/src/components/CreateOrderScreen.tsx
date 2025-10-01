import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, borderRadius } from '../styles/spacing';
import { menuApi, ordersApi } from '../services/api';
import { MenuItem, SelectedItem } from '../types';

interface CreateOrderScreenProps {
  onOrderCreated: () => void;
}

const CreateOrderScreen: React.FC<CreateOrderScreenProps> = ({ onOrderCreated }) => {
  const [customerName, setCustomerName] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [paid, setPaid] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [loading, setLoading] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoadingMenu(true);
      const items = await menuApi.getAll();
      setMenuItems(items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load menu items');
      console.error('Error loading menu items:', error);
    } finally {
      setLoadingMenu(false);
    }
  };

  const toggleItem = (menuItem: MenuItem) => {
    const existingItem = selectedItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      // Remove item if already selected
      removeItem(menuItem.id);
    } else {
      // Add item with quantity 1
      setSelectedItems([...selectedItems, { menuItem, quantity: 1 }]);
    }
  };

  const isItemSelected = (menuItemId: number) => {
    return selectedItems.some(item => item.menuItem.id === menuItemId);
  };

  const updateQuantity = (menuItemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    
    setSelectedItems(selectedItems.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeItem = (menuItemId: number) => {
    setSelectedItems(selectedItems.filter(item => item.menuItem.id !== menuItemId));
  };

  const getTotalCost = () => {
    return selectedItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        customerName: customerName.trim(),
        items: selectedItems.map(item => ({
          menuItemId: item.menuItem.id,
          quantity: item.quantity,
        })),
        paid,
        paymentMode: paid ? paymentMode : undefined,
      };

      await ordersApi.create(orderData);
      
      // Reset form
      setCustomerName('');
      setSelectedItems([]);
      setPaid(false);
      setPaymentMode('cash');
      
      Alert.alert('Success', 'Order created successfully!');
      onOrderCreated();
    } catch (error) {
      Alert.alert('Error', 'Failed to create order');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMenu) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading menu...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Create New Order</Text>

      {/* Customer Name Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Name</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter customer name"
          placeholderTextColor={colors.input.placeholder}
        />
      </View>

      {/* Menu Items Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Items</Text>
        {menuItems.map((item) => (
          <View key={item.id} style={styles.menuItemRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleItem(item)}
            >
              <View style={[
                styles.checkbox,
                isItemSelected(item.id) && styles.checkboxSelected
              ]}>
                {isItemSelected(item.id) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                <Text style={styles.menuItemPrice}>₹{item.price.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
            
            {/* Quantity Controls - Show when item is selected */}
            {isItemSelected(item.id) && (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => {
                    const selectedItem = selectedItems.find(selected => selected.menuItem.id === item.id);
                    if (selectedItem) {
                      updateQuantity(item.id, selectedItem.quantity - 1);
                    }
                  }}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>
                  {selectedItems.find(selected => selected.menuItem.id === item.id)?.quantity || 1}
                </Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => {
                    const selectedItem = selectedItems.find(selected => selected.menuItem.id === item.id);
                    if (selectedItem) {
                      updateQuantity(item.id, selectedItem.quantity + 1);
                    }
                  }}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </View>


      {/* Total Cost */}
      {selectedItems.length > 0 && (
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Cost:</Text>
          <Text style={styles.totalAmount}>₹{getTotalCost().toFixed(2)}</Text>
        </View>
      )}

      {/* Paid Toggle */}
      <View style={styles.section}>
        <View style={styles.paidRow}>
          <Text style={styles.paidLabel}>Order Paid</Text>
          <Switch
            value={paid}
            onValueChange={setPaid}
            trackColor={{ false: colors.input.border, true: colors.primary }}
            thumbColor={paid ? colors.text : colors.textDisabled}
          />
        </View>
        
        {/* Payment Mode Radio Buttons - Only show when paid is true */}
        {paid && (
          <View style={styles.paymentModeSection}>
            <Text style={styles.sectionTitle}>Payment Mode</Text>
            <View style={styles.radioContainer}>
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setPaymentMode('cash')}
              >
                <View style={styles.radioButton}>
                  {paymentMode === 'cash' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>Cash</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.radioOption}
                onPress={() => setPaymentMode('upi')}
              >
                <View style={styles.radioButton}>
                  {paymentMode === 'upi' && <View style={styles.radioButtonSelected} />}
                </View>
                <Text style={styles.radioLabel}>UPI</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={styles.submitButtonText}>Create Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.input.background,
    borderColor: colors.input.border,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.input.text,
  },
  menuItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.input.border,
    backgroundColor: colors.input.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  menuItemPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: colors.button.secondary,
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  quantityButtonText: {
    ...typography.button,
    color: colors.text,
  },
  quantityText: {
    ...typography.body,
    color: colors.text,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    backgroundColor: colors.error,
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  removeButtonText: {
    ...typography.button,
    color: colors.text,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.text,
    fontWeight: 'bold',
  },
  paidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.card.border,
  },
  paidLabel: {
    ...typography.body,
    color: colors.text,
  },
  paymentModeSection: {
    marginTop: spacing.md,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.input.border,
    backgroundColor: colors.input.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    ...typography.body,
    color: colors.text,
  },
  submitButton: {
    backgroundColor: colors.button.primary,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    backgroundColor: colors.button.secondary,
  },
  submitButtonText: {
    ...typography.button,
    color: colors.text,
  },
});

export default CreateOrderScreen;
