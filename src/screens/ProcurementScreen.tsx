import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { SEED_SUPPLIERS } from '../database/seedData';
import { Supplier, PurchaseOrder } from '../types';

export const ProcurementScreen: React.FC = () => {
  const { products, adjustStock, branch } = useApp();
  const [suppliers] = useState<Supplier[]>(SEED_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 'PO-991',
      supplierId: 'sup-nm',
      supplierName: 'Namib Mills Distribution',
      items: [
        { productId: 'PRD-001', productName: 'Top Score Super Maize Meal 10kg', quantity: 50, unitCost: 85.50 },
        { productId: 'PRD-005', productName: 'Marathon Pure White Sugar 2kg', quantity: 30, unitCost: 28.20 },
      ],
      totalAmount: 5121.00,
      status: 'APPROVED',
      createdAt: Date.now() - 3600000 * 24 * 2,
      expectedDelivery: 'Today (In Transit)',
      notes: 'Standard Khomas regional bulk supply delivery',
    },
    {
      id: 'PO-992',
      supplierId: 'sup-nbl',
      supplierName: 'Namibia Breweries Ltd (NBL)',
      items: [
        { productId: 'PRD-004', productName: 'Tafel Lager 500ml Can', quantity: 48, unitCost: 13.50 },
      ],
      totalAmount: 648.00,
      status: 'PENDING_APPROVAL',
      createdAt: Date.now() - 3600000 * 5,
      expectedDelivery: 'Tomorrow 10:00 AM',
      notes: 'Emergency low stock replenishment',
    }
  ]);

  const [poModalVisible, setPoModalVisible] = useState(false);
  const [orderQty, setOrderQty] = useState('25');
  const [selectedProductForPo, setSelectedProductForPo] = useState<string>('PRD-004');

  const handleOpenNewPo = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setPoModalVisible(true);
  };

  const handleCreatePo = () => {
    if (!selectedSupplier) return;
    const targetProd = products.find((p) => p.id === selectedProductForPo) || products[0];
    const qty = parseInt(orderQty, 10) || 10;
    const total = qty * targetProd.costPrice;

    const newPo: PurchaseOrder = {
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      items: [
        {
          productId: targetProd.id,
          productName: targetProd.name,
          quantity: qty,
          unitCost: targetProd.costPrice,
        },
      ],
      totalAmount: total,
      status: 'PENDING_APPROVAL',
      createdAt: Date.now(),
      expectedDelivery: `In ${selectedSupplier.leadTimeDays} days`,
      notes: `Restock delivery to ${branch.name}`,
    };

    setPurchaseOrders([newPo, ...purchaseOrders]);
    setPoModalVisible(false);
  };

  const handleApprovePo = async (po: PurchaseOrder) => {
    const updated = purchaseOrders.map((p) =>
      p.id === po.id ? { ...p, status: 'APPROVED' as const } : p
    );
    setPurchaseOrders(updated);

    for (const item of po.items) {
      await adjustStock(item.productId, item.quantity, `Approved Purchase Order ${po.id}`, item.unitCost);
    }
    alert(`Purchase Order ${po.id} approved! Restocked into inventory.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Banner */}
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>SUPPLIER DIRECTORY & ORDERS</Text>
            <Text style={styles.headerTitle}>Smart Regional Procurement</Text>
            <Text style={styles.headerDesc}>
              Connect directly with verified FMCG manufacturers across Southern Africa.
            </Text>
          </View>
        </View>

        {/* Suppliers Grid */}
        <Text style={styles.sectionLabel}>VERIFIED MANUFACTURERS</Text>
        <View style={styles.supplierGrid}>
          {suppliers.map((sup) => (
            <View key={sup.id} style={styles.supplierCard}>
              <View style={styles.supHeaderRow}>
                <View style={styles.supAvatar}>
                  <Text style={styles.supAvatarText}>{sup.code.slice(-2)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.supTitle}>{sup.name}</Text>
                  <Text style={styles.supCategory}>{sup.category} • {sup.region}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={11} color={COLORS.gold} />
                  <Text style={styles.ratingText}>{sup.rating}</Text>
                </View>
              </View>

              <View style={styles.supStatsRow}>
                <View style={styles.supStat}>
                  <Text style={styles.statLabel}>Lead Time</Text>
                  <Text style={styles.statValue}>{sup.leadTimeDays} Days</Text>
                </View>
                <View style={styles.supStat}>
                  <Text style={styles.statLabel}>Min Order</Text>
                  <Text style={styles.statValue}>N${sup.minOrderValue.toLocaleString()}</Text>
                </View>
                <View style={styles.supStat}>
                  <Text style={styles.statLabel}>Direct Line</Text>
                  <Text style={styles.statValue}>{sup.phone}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.newPoBtn}
                onPress={() => handleOpenNewPo(sup)}
                activeOpacity={0.7}
              >
                <Feather name="plus-circle" size={14} color={COLORS.white} />
                <Text style={styles.newPoBtnText}>Create Purchase Order</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Active Purchase Orders */}
        <Text style={[styles.sectionLabel, { marginTop: 10 }]}>ACTIVE PURCHASE ORDERS</Text>
        <View style={styles.poList}>
          {purchaseOrders.map((po) => (
            <View key={po.id} style={styles.poCard}>
              <View style={styles.poTopRow}>
                <View>
                  <Text style={styles.poId}>{po.id}</Text>
                  <Text style={styles.poSupplierName}>{po.supplierName}</Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    po.status === 'APPROVED' ? styles.statusApproved : styles.statusPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      po.status === 'APPROVED' ? { color: COLORS.primaryLight } : { color: COLORS.gold },
                    ]}
                  >
                    {po.status}
                  </Text>
                </View>
              </View>

              <View style={styles.poItemsBox}>
                {po.items.map((it, idx) => (
                  <Text key={idx} style={styles.poItemText}>
                    • {it.quantity}x {it.productName} (@ N${it.unitCost.toFixed(2)}) = N$
                    {(it.quantity * it.unitCost).toFixed(2)}
                  </Text>
                ))}
              </View>

              <View style={styles.poFooterRow}>
                <View>
                  <Text style={styles.poTotalLabel}>Order Amount:</Text>
                  <Text style={styles.poTotalAmount}>N${po.totalAmount.toFixed(2)}</Text>
                </View>

                {po.status === 'PENDING_APPROVAL' && (
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApprovePo(po)}
                    activeOpacity={0.7}
                  >
                    <Feather name="check" size={14} color={COLORS.white} />
                    <Text style={styles.approveBtnText}>Approve & Restock</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* New PO Modal */}
      <Modal
        visible={poModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Purchase Order</Text>
              <TouchableOpacity onPress={() => setPoModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedSupplier && (
              <View style={styles.supplierBrief}>
                <Text style={styles.briefName}>{selectedSupplier.name}</Text>
                <Text style={styles.briefMeta}>Lead Time: {selectedSupplier.leadTimeDays} days • Min: N${selectedSupplier.minOrderValue}</Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Select Product SKU</Text>
              <ScrollView style={{ maxHeight: 140 }}>
                {products.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[
                      styles.productOption,
                      selectedProductForPo === p.id && styles.productOptionActive,
                    ]}
                    onPress={() => setSelectedProductForPo(p.id)}
                  >
                    <Text style={styles.optionTitle}>{p.name}</Text>
                    <Text style={styles.optionPrice}>N${p.costPrice.toFixed(2)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Order Quantity (Units)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={orderQty}
                onChangeText={setOrderQty}
                placeholder="25"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPoModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitPoBtn} onPress={handleCreatePo}>
                <Text style={styles.submitPoBtnText}>Dispatch PO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCanvas,
  },
  content: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pageInner: {
    width: '100%',
    maxWidth: 1040,
    gap: 12,
  },
  headerCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blueLight,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: 2,
  },
  headerDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  supplierGrid: {
    gap: 8,
  },
  supplierCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  supHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supAvatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supAvatarText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 11,
  },
  supTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  supCategory: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  ratingText: {
    color: COLORS.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  supStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  supStat: {},
  statLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 1,
  },
  newPoBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 6,
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  newPoBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
  },
  poList: {
    gap: 8,
  },
  poCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  poTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  poId: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.blueLight,
  },
  poSupplierName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: COLORS.primaryMuted,
  },
  statusPending: {
    backgroundColor: COLORS.goldMuted,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  poItemsBox: {
    marginVertical: 6,
    paddingLeft: 4,
  },
  poItemText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginVertical: 1,
  },
  poFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 6,
  },
  poTotalLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  poTotalAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  approveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  approveBtnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  supplierBrief: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  briefName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.blueLight,
  },
  briefMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  formGroup: {
    marginBottom: 8,
  },
  formLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  productOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 7,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    marginBottom: 4,
  },
  productOptionActive: {
    borderColor: COLORS.blueLight,
    borderWidth: 1,
    backgroundColor: COLORS.blueMuted,
  },
  optionTitle: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  optionPrice: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  formInput: {
    height: 36,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 8,
    color: COLORS.textLight,
    fontSize: 12,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 36,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  submitPoBtn: {
    flex: 2,
    height: 36,
    backgroundColor: COLORS.blue,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitPoBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
