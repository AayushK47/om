import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import { spacing, borderRadius } from '../styles/spacing';
import { ordersApi } from '../services/api';
import { Order } from '../types';

interface OrderListScreenProps {
  navigation?: any;
}

const OrderListScreen: React.FC<OrderListScreenProps> = ({ navigation }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [tempPaymentMode, setTempPaymentMode] = useState<'cash' | 'upi'>('cash');
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const ordersData = await ordersApi.getAll();
      setOrders(ordersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load orders');
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Refresh orders when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadOrders();
    });
    return unsubscribe;
  }, [navigation, loadOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const markOrderAsCompleted = async (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      Alert.alert('Error', 'Order not found');
      return;
    }

    // Check if payment mode is required but not selected
    if (!order.paymentMode) {
      // Show payment modal instead of alert
      openPaymentModal(orderId);
      return;
    }

    try {
      setUpdatingStatus(orderId);
      await ordersApi.updateStatus(orderId, 'completed');
      
      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId
          ? { ...order, status: 'completed' }
          : order
      ));
      
      Alert.alert('Success', 'Order marked as completed');
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const openPaymentModal = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      setTempPaymentMode(order.paymentMode || 'cash');
      setPaymentModalVisible(true);
    }
  };

  const closePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedOrderId(null);
    setTempPaymentMode('cash');
  };

  const updatePaymentInfo = async () => {
    if (!selectedOrderId) return;

    try {
      setUpdatingPayment(true);
      
      // Update payment information and mark as completed in one go
      await ordersApi.updatePayment(selectedOrderId, true, tempPaymentMode);
      await ordersApi.updateStatus(selectedOrderId, 'completed');
      
      // Update local state
      setOrders(orders.map(order =>
        order.id === selectedOrderId
          ? { 
              ...order, 
              paid: true,
              paymentMode: tempPaymentMode,
              status: 'completed'
            }
          : order
      ));
      
      Alert.alert('Success', 'Order completed successfully');
      closePaymentModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to complete order');
      console.error('Error completing order:', error);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusColor = (status: string) => {
    return status === 'completed' ? colors.success : colors.warning;
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation?.navigate('CreateOrder')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>Create your first order to get started!</Text>
        </View>
        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation?.navigate('CreateOrder')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <Text style={styles.title}>Orders</Text>
        
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={styles.orderMeta}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                </View>
                <View style={[styles.paidBadge, { backgroundColor: order.paid ? colors.success : colors.error }]}>
                  <Text style={styles.paidText}>
                    {order.paid ? (order.paymentMode ? `${order.paymentMode.toUpperCase()}` : 'Paid') : 'Unpaid'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.itemsSection}>
              <Text style={styles.itemsTitle}>Items:</Text>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={styles.itemName}>
                    {item.quantity}x {item.menuItem.name}
                  </Text>
                  <Text style={styles.itemSubtotal}>
                    ₹{item.subtotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Order Total */}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>₹{order.totalCost.toFixed(2)}</Text>
            </View>

            {/* Status Button */}
            {order.status === 'pending' ? (
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  { backgroundColor: getStatusColor(order.status) }
                ]}
                onPress={() => markOrderAsCompleted(order.id)}
                disabled={updatingStatus === order.id || updatingPayment}
              >
                {updatingStatus === order.id || updatingPayment ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.statusButtonText}>
                    Mark as Completed
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.statusButton,
                  styles.completedButton,
                  { backgroundColor: colors.textDisabled }
                ]}
              >
                <Text style={[styles.statusButtonText, styles.completedButtonText]}>
                  Order Completed
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation?.navigate('CreateOrder')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Payment Mode Modal */}
      <Modal
        visible={paymentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closePaymentModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Mode</Text>
            
            <View style={styles.modalSection}>
              <View style={styles.paymentModeSection}>
                <Text style={styles.sectionTitle}>Payment Mode</Text>
                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setTempPaymentMode('cash')}
                  >
                    <View style={styles.radioButton}>
                      {tempPaymentMode === 'cash' && <View style={styles.radioButtonSelected} />}
                    </View>
                    <Text style={styles.radioLabel}>Cash</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() => setTempPaymentMode('upi')}
                  >
                    <View style={styles.radioButton}>
                      {tempPaymentMode === 'upi' && <View style={styles.radioButtonSelected} />}
                    </View>
                    <Text style={styles.radioLabel}>UPI</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closePaymentModal}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={updatePaymentInfo}
                disabled={updatingPayment}
              >
                {updatingPayment ? (
                  <ActivityIndicator color={colors.text} size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xxl, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.card.border,
    shadowColor: colors.card.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  orderDate: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  statusText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  paidBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  paidText: {
    ...typography.labelSmall,
    color: colors.text,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: spacing.md,
  },
  itemsTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  itemName: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
  itemSubtotal: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h4,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h4,
    color: colors.text,
    fontWeight: 'bold',
  },
  statusButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  statusButtonText: {
    ...typography.button,
    color: colors.text,
  },
  completedButton: {
    opacity: 0.7,
  },
  completedButtonText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  paymentModeSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  radioContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
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
    borderColor: colors.border,
    backgroundColor: colors.background,
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
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.textDisabled,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButtonText: {
    ...typography.button,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.card.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    ...typography.h2,
    color: colors.text,
    fontSize: 24,
  },
});

export default OrderListScreen;
