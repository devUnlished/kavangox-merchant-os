import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { Product } from '../types';
import { BulkCsvModal } from '../components/BulkCsvModal';

export const InventoryScreen: React.FC = () => {
  const { products, addProduct, updateProduct, adjustStock, importCsvProducts } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [csvModalVisible, setCsvModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // New Product Form State
  const [newName, setNewName] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newCategory, setNewCategory] = useState('Staples & Grains');
  const [newCostPrice, setNewCostPrice] = useState('');
  const [newSellPrice, setNewSellPrice] = useState('');
  const [newStockQty, setNewStockQty] = useState('');
  const [newMinAlert, setNewMinAlert] = useState('10');
  const [newUnit, setNewUnit] = useState('Unit');

  // Stock Adjustment State
  const [adjustDelta, setAdjustDelta] = useState('');
  const [adjustReason, setAdjustReason] = useState('Supplier Delivery Batch');
  const [adjustCost, setAdjustCost] = useState('');

  // Valuation computations memoized
  const { totalCostValuation, totalRetailValuation, lowStockCount } = useMemo(() => {
    let cost = 0;
    let retail = 0;
    let lowCount = 0;
    for (const p of products) {
      cost += p.stockQty * p.costPrice;
      retail += p.stockQty * p.sellPrice;
      if (p.stockQty <= p.minStockAlert) lowCount++;
    }
    return { totalCostValuation: cost, totalRetailValuation: retail, lowStockCount: lowCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      const matchLowStock = !filterLowStockOnly || p.stockQty <= p.minStockAlert;
      return matchQuery && matchLowStock;
    });
  }, [products, searchQuery, filterLowStockOnly]);

  const handleCreateProduct = async () => {
    if (!newName || !newSellPrice) {
      alert('Please fill out at least the Product Name and Selling Price.');
      return;
    }

    await addProduct({
      name: newName.trim(),
      barcode: newBarcode.trim() || `600100${Math.floor(1000000 + Math.random() * 9000000)}`,
      category: newCategory,
      costPrice: parseFloat(newCostPrice) || 0,
      sellPrice: parseFloat(newSellPrice) || 0,
      stockQty: parseInt(newStockQty, 10) || 0,
      minStockAlert: parseInt(newMinAlert, 10) || 10,
      supplierId: 'sup-local',
      supplierName: 'Regional Distributor',
      unit: newUnit || 'Unit',
    });

    setAddModalVisible(false);
    setNewName('');
    setNewBarcode('');
    setNewCostPrice('');
    setNewSellPrice('');
    setNewStockQty('');
  };

  const handleOpenAdjust = (prod: Product) => {
    setSelectedProduct(prod);
    setAdjustDelta('10');
    setAdjustCost(prod.costPrice.toString());
    setAdjustModalVisible(true);
  };

  const handleConfirmAdjust = async () => {
    if (!selectedProduct) return;
    const delta = parseInt(adjustDelta, 10) || 0;
    const cost = parseFloat(adjustCost) || selectedProduct.costPrice;

    await adjustStock(selectedProduct.id, delta, adjustReason, cost);
    setAdjustModalVisible(false);
    setSelectedProduct(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Top Valuation Metric Cards */}
        <View style={styles.valuationGrid}>
          <View style={styles.valCard}>
            <Text style={styles.valCardLabel}>Cost Valuation (FIFO)</Text>
            <Text style={styles.valCardAmount}>N${totalCostValuation.toFixed(2)}</Text>
            <Text style={styles.valCardSub}>Capital tied in stock</Text>
          </View>

          <View style={styles.valCard}>
            <Text style={styles.valCardLabel}>Retail Value</Text>
            <Text style={[styles.valCardAmount, { color: COLORS.primaryLight }]}>
              N${totalRetailValuation.toFixed(2)}
            </Text>
            <Text style={styles.valCardSub}>Expected sales turnover</Text>
          </View>

          <View style={styles.valCard}>
            <Text style={styles.valCardLabel}>Safety Thresholds</Text>
            <Text
              style={[
                styles.valCardAmount,
                { color: lowStockCount > 0 ? COLORS.warning : COLORS.primaryLight },
              ]}
            >
              {lowStockCount} Reorder Alerts
            </Text>
            <Text style={styles.valCardSub}>Stock at/below minimum</Text>
          </View>
        </View>

        {/* Search & Actions Bar */}
        <View style={styles.actionRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={15} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Filter SKUs by title or barcode..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <TouchableOpacity
            style={[styles.filterPill, filterLowStockOnly && styles.filterPillActive]}
            onPress={() => setFilterLowStockOnly(!filterLowStockOnly)}
          >
            <Feather
              name="alert-circle"
              size={13}
              color={filterLowStockOnly ? COLORS.warning : COLORS.textMuted}
            />
            <Text
              style={[
                styles.filterPillText,
                filterLowStockOnly && { color: COLORS.warning, fontWeight: '700' },
              ]}
            >
              Low Stock ({lowStockCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.csvBtn}
            onPress={() => setCsvModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="file-delimited-outline" size={16} color={COLORS.blueLight} />
            <Text style={styles.csvBtnText}>Bulk CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addSkuBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.7}
          >
            <Feather name="plus" size={15} color={COLORS.white} />
            <Text style={styles.addSkuBtnText}>New SKU</Text>
          </TouchableOpacity>
        </View>

        {/* Product Items List */}
        <View style={styles.itemsList}>
          {filteredProducts.map((prod) => {
            const isLowStock = prod.stockQty <= prod.minStockAlert;
            const isOutOfStock = prod.stockQty <= 0;
            const margin = prod.sellPrice > 0 ? ((prod.sellPrice - prod.costPrice) / prod.sellPrice) * 100 : 0;

            return (
              <View key={prod.id} style={styles.productRowCard}>
                <View style={styles.rowMainInfo}>
                  <View style={styles.rowTitleWrap}>
                    <Text style={styles.rowTitle}>{prod.name}</Text>
                    {isLowStock && (
                      <View style={styles.lowBadge}>
                        <Text style={styles.lowBadgeText}>LOW STOCK</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.rowSub}>
                    {prod.barcode} • {prod.category} • Supplier: {prod.supplierName || 'Distributor'}
                  </Text>
                </View>

                <View style={styles.rowPrices}>
                  <Text style={styles.rowSellPrice}>N${prod.sellPrice.toFixed(2)}</Text>
                  <Text style={styles.rowCostPrice}>Cost: N${prod.costPrice.toFixed(2)} ({margin.toFixed(0)}% Margin)</Text>
                </View>

                <View style={styles.rowStock}>
                  <Text
                    style={[
                      styles.stockQuantity,
                      isOutOfStock
                        ? { color: COLORS.danger }
                        : isLowStock
                        ? { color: COLORS.warning }
                        : { color: COLORS.primaryLight },
                    ]}
                  >
                    {prod.stockQty} {prod.unit}
                  </Text>
                  <Text style={styles.minThreshold}>Min: {prod.minStockAlert}</Text>
                </View>

                <TouchableOpacity
                  style={styles.restockBtn}
                  onPress={() => handleOpenAdjust(prod)}
                  activeOpacity={0.7}
                >
                  <Feather name="plus-circle" size={14} color={COLORS.textLight} />
                  <Text style={styles.restockBtnText}>Restock</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bulk CSV Modal */}
      <BulkCsvModal
        visible={csvModalVisible}
        onClose={() => setCsvModalVisible(false)}
        onImport={importCsvProducts}
      />

      {/* New SKU Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register New Product SKU</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Product Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Marathon Pure White Sugar 2kg"
                  placeholderTextColor={COLORS.textMuted}
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Barcode / EAN-13</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Leave empty to auto-generate"
                  placeholderTextColor={COLORS.textMuted}
                  value={newBarcode}
                  onChangeText={setNewBarcode}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>FIFO Cost (N$)</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    placeholder="28.50"
                    placeholderTextColor={COLORS.textMuted}
                    value={newCostPrice}
                    onChangeText={setNewCostPrice}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Sell Price (N$) *</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    placeholder="38.99"
                    placeholderTextColor={COLORS.textMuted}
                    value={newSellPrice}
                    onChangeText={setNewSellPrice}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Initial Stock Qty</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    placeholder="50"
                    placeholderTextColor={COLORS.textMuted}
                    value={newStockQty}
                    onChangeText={setNewStockQty}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Min Safety Threshold</Text>
                  <TextInput
                    style={styles.formInput}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={COLORS.textMuted}
                    value={newMinAlert}
                    onChangeText={setNewMinAlert}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleCreateProduct}>
                <Text style={styles.saveBtnText}>Save SKU</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Adjust Stock Modal */}
      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Restock / Stock Adjustment</Text>
              <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedProduct && (
              <View style={styles.adjustHeaderCard}>
                <Text style={styles.adjustName}>{selectedProduct.name}</Text>
                <Text style={styles.adjustMeta}>
                  Current Stock: {selectedProduct.stockQty} {selectedProduct.unit}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Units to Add (+)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={adjustDelta}
                onChangeText={setAdjustDelta}
                placeholder="+20"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Unit Cost Price (N$)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                value={adjustCost}
                onChangeText={setAdjustCost}
                placeholder="28.50"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setAdjustModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleConfirmAdjust}>
                <Text style={styles.saveBtnText}>Confirm Restock</Text>
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
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  pageInner: {
    width: '100%',
    maxWidth: 1040,
    gap: 10,
  },
  valuationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  valCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  valCardLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  valCardAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textLight,
    marginTop: 3,
  },
  valCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  searchBar: {
    flex: 1,
    minWidth: 160,
    height: 38,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 5,
  },
  filterPillActive: {
    backgroundColor: COLORS.warningMuted,
    borderColor: COLORS.warning,
  },
  filterPillText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  csvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderWidth: 1,
    borderColor: COLORS.blueLight,
    paddingHorizontal: 10,
    height: 38,
    borderRadius: 8,
    gap: 4,
  },
  csvBtnText: {
    color: COLORS.blueLight,
    fontSize: 11,
    fontWeight: '700',
  },
  addSkuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 8,
    gap: 4,
  },
  addSkuBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  itemsList: {
    gap: 6,
  },
  productRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  rowMainInfo: {
    flex: 2,
    marginRight: 8,
  },
  rowTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  lowBadge: {
    backgroundColor: COLORS.warningMuted,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  lowBadgeText: {
    color: COLORS.gold,
    fontSize: 8,
    fontWeight: '800',
  },
  rowSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rowPrices: {
    flex: 1.2,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  rowSellPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  rowCostPrice: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  rowStock: {
    flex: 1,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  stockQuantity: {
    fontSize: 13,
    fontWeight: '800',
  },
  minThreshold: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  restockBtn: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  restockBtnText: {
    color: COLORS.textLight,
    fontSize: 10,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  formGroup: {
    marginBottom: 8,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 3,
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
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 38,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 11,
  },
  saveBtn: {
    flex: 2,
    height: 38,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  adjustHeaderCard: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  adjustName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  adjustMeta: {
    fontSize: 10,
    color: COLORS.blueLight,
    marginTop: 2,
  },
});
