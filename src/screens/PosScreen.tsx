import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { Product, Customer, PaymentMethod, SalesReceipt } from '../types';
import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { DigitalReceiptModal } from '../components/DigitalReceiptModal';

const CATEGORIES = [
  'All Items',
  'Staples & Grains',
  'Beverages',
  'Meat & Chilled',
  'Dairy & Eggs',
  'Household',
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'CASH', label: 'Cash Tender', icon: 'cash', desc: 'Exact cash tendered & change calculation' },
  { id: 'MOBILE_MONEY', label: 'Mobile / e-Wallet', icon: 'cellphone-nfc', desc: 'FNB eWallet, M-Pesa, BlueWallet' },
  { id: 'WALLET', label: 'Digital Wallet', icon: 'wallet-outline', desc: 'KavangoX Merchant Pay' },
  { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: 'bank', desc: 'Instant EFT' },
  { id: 'STORE_CREDIT', label: 'Store Credit Tab', icon: 'book-account-outline', desc: 'Informal customer monthly credit' },
];

export const PosScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const {
    products,
    customers,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    checkoutSale,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Items');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState<string>('0');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [selectedPayMethod, setSelectedPayMethod] = useState<PaymentMethod>('CASH');

  const [scannerVisible, setScannerVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<SalesReceipt | null>(null);
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered product catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'All Items' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery);
      return matchCat && matchQuery;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.sellPrice * item.quantity,
    0
  );
  const discountVal = parseFloat(discount) || 0;
  const cartTotal = Math.max(0, cartSubtotal - discountVal);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tenderedAmount = parseFloat(cashTendered) || cartTotal;
  const changeAmount = Math.max(0, tenderedAmount - cartTotal);

  const handleProductTap = (product: Product) => {
    const res = addToCart(product);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const handleBarcodeScanned = (product: Product) => {
    const res = addToCart(product);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashTendered(cartTotal.toFixed(2));
    setCheckoutError(null);
    setCheckoutModalVisible(true);
  };

  const handleConfirmCheckout = async () => {
    setIsProcessing(true);
    setCheckoutError(null);

    const res = await checkoutSale(
      selectedPayMethod,
      selectedCustomer?.id,
      discountVal,
      selectedPayMethod === 'CASH' ? tenderedAmount : undefined
    );

    setIsProcessing(false);

    if (res.success && res.receipt) {
      setCheckoutModalVisible(false);
      setCompletedReceipt(res.receipt);
      setReceiptModalVisible(true);
      setSelectedCustomer(null);
      setDiscount('0');
      setCashTendered('');
    } else {
      setCheckoutError(res.error || 'Failed to finalize transaction');
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
        {/* Left Side: Product Catalog */}
        <View style={styles.catalogColumn}>
          {/* Search Bar & Barcode Scanner Button */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Feather name="search" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products or scan barcode..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x-circle" size={15} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.scannerBtn}
              onPress={() => setScannerVisible(true)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="barcode-scan" size={18} color={COLORS.white} />
              <Text style={styles.scannerBtnText}>Scan</Text>
            </TouchableOpacity>
          </View>

          {/* Category Filter Chips */}
          <View style={styles.categoryWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.categoryPill, isSelected && styles.categoryPillSelected]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        isSelected && styles.categoryPillTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Products Grid */}
          <ScrollView contentContainerStyle={styles.productsGrid} showsVerticalScrollIndicator={false}>
            {filteredProducts.map((prod) => {
              const cartItem = cart.find((c) => c.product.id === prod.id);
              const inCartQty = cartItem ? cartItem.quantity : 0;
              const isLowStock = prod.stockQty <= prod.minStockAlert;
              const isOutOfStock = prod.stockQty <= 0;

              return (
                <TouchableOpacity
                  key={prod.id}
                  style={[
                    styles.productCard,
                    inCartQty > 0 && styles.productCardInCart,
                    isOutOfStock && styles.productCardDisabled,
                  ]}
                  onPress={() => handleProductTap(prod)}
                  disabled={isOutOfStock}
                  activeOpacity={0.7}
                >
                  <View style={styles.productCardHeader}>
                    <Text style={styles.productCategory}>{prod.category.split(' ')[0]}</Text>
                    {inCartQty > 0 && (
                      <View style={styles.qtyBadge}>
                        <Text style={styles.qtyBadgeText}>{inCartQty}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.productTitle} numberOfLines={2}>{prod.name}</Text>

                  <View style={styles.productPriceRow}>
                    <Text style={styles.productPrice}>N${prod.sellPrice.toFixed(2)}</Text>
                    <Text style={styles.productUnit}>/{prod.unit}</Text>
                  </View>

                  <View style={styles.productStockRow}>
                    <View
                      style={[
                        styles.stockIndicator,
                        {
                          backgroundColor: isOutOfStock
                            ? COLORS.danger
                            : isLowStock
                            ? COLORS.warning
                            : COLORS.primaryLight,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.stockLabel,
                        isLowStock && { color: COLORS.warning },
                        isOutOfStock && { color: COLORS.danger },
                      ]}
                    >
                      {isOutOfStock ? 'Out of stock' : `${prod.stockQty} in stock`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Side: Active Cart & Multi-Payment Register */}
        <View style={styles.cartColumn}>
          <View style={styles.cartHeader}>
            <View style={styles.cartTitleRow}>
              <MaterialCommunityIcons name="cart-outline" size={18} color={COLORS.primaryLight} />
              <Text style={styles.cartHeaderTitle}>Register</Text>
              <View style={styles.cartCountPill}>
                <Text style={styles.cartCountPillText}>{totalItemsCount} items</Text>
              </View>
            </View>

            {cart.length > 0 && (
              <TouchableOpacity onPress={clearCart}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Customer Attachment Pill */}
          <TouchableOpacity
            style={styles.customerAttachBar}
            onPress={() => setCustomerModalVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={selectedCustomer ? COLORS.blueLight : COLORS.textMuted}
            />
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text style={styles.customerAttachTitle} numberOfLines={1}>
                {selectedCustomer ? selectedCustomer.name : 'Attach Customer Profile'}
              </Text>
              {selectedCustomer && (
                <Text style={styles.customerAttachSub}>
                  Pts: {selectedCustomer.loyaltyPoints} • Tab Debt: N${selectedCustomer.outstandingDebt.toFixed(2)}
                </Text>
              )}
            </View>
            <Feather name="chevron-down" size={13} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <View style={styles.emptyCartBox}>
              <MaterialCommunityIcons name="cart-variant" size={32} color={COLORS.textMuted + '55'} />
              <Text style={styles.emptyCartText}>No items added yet</Text>
              <Text style={styles.emptyCartSub}>Tap items on the left to add to sale</Text>
            </View>
          ) : (
            <ScrollView style={styles.cartItemsScroll} showsVerticalScrollIndicator={false}>
              {cart.map((item) => (
                <View key={item.product.id} style={styles.cartItemRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.cartItemTitle} numberOfLines={1}>{item.product.name}</Text>
                    <Text style={styles.cartItemPriceText}>
                      N${item.product.sellPrice.toFixed(2)} × {item.quantity} = N$
                      {(item.product.sellPrice * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.stepperWrap}>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateCartQty(item.product.id, item.quantity - 1)}
                    >
                      <Feather name="minus" size={13} color={COLORS.textLight} />
                    </TouchableOpacity>
                    <Text style={styles.stepperCount}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.stepperBtn}
                      onPress={() => updateCartQty(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stockQty}
                    >
                      <Feather name="plus" size={13} color={COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Cart Summary Footer */}
          <View style={styles.cartBottomSection}>
            <View style={styles.discountInputRow}>
              <Text style={styles.discountLabelText}>Discount (N$):</Text>
              <TextInput
                style={styles.discountInputField}
                keyboardType="numeric"
                value={discount}
                onChangeText={setDiscount}
                placeholder="0.00"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalValue}>N${cartTotal.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={[styles.paySubmitBtn, cart.length === 0 && styles.paySubmitBtnDisabled]}
              onPress={handleOpenCheckout}
              disabled={cart.length === 0}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="cash-check" size={18} color={COLORS.white} />
              <Text style={styles.paySubmitText}>Pay N${cartTotal.toFixed(2)}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Floating Quick Checkout Bar on Mobile */}
      {!isDesktop && cart.length > 0 && (
        <View style={styles.floatingCartBar}>
          <View style={styles.floatingCartInfo}>
            <View style={styles.floatingCartBadge}>
              <Text style={styles.floatingCartBadgeText}>{totalItemsCount}</Text>
            </View>
            <View>
              <Text style={styles.floatingCartTotal}>N${cartTotal.toFixed(2)}</Text>
              <Text style={styles.floatingCartSub} numberOfLines={1}>
                {selectedCustomer ? selectedCustomer.name : 'Tap to Charge'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.floatingChargeBtn}
            onPress={handleOpenCheckout}
            activeOpacity={0.8}
          >
            <Text style={styles.floatingChargeText}>Charge</Text>
            <Feather name="arrow-right" size={14} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScan={handleBarcodeScanned}
      />

      {/* Digital Receipt Modal */}
      <DigitalReceiptModal
        visible={receiptModalVisible}
        receipt={completedReceipt}
        onClose={() => setReceiptModalVisible(false)}
      />

      {/* Customer Modal */}
      <Modal
        visible={customerModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCustomerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCustomerModalVisible(false)}
        >
          <View style={styles.customerModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Attach Customer / Store Tab</Text>
              <TouchableOpacity onPress={() => setCustomerModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              <TouchableOpacity
                style={[
                  styles.customerOptionItem,
                  selectedCustomer === null && styles.customerOptionSelected,
                ]}
                onPress={() => {
                  setSelectedCustomer(null);
                  setCustomerModalVisible(false);
                }}
              >
                <Text style={styles.customerOptionName}>Walk-in Retail Shopper (No Tab)</Text>
              </TouchableOpacity>

              {customers.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.customerOptionItem,
                    selectedCustomer?.id === c.id && styles.customerOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedCustomer(c);
                    setCustomerModalVisible(false);
                  }}
                >
                  <Text style={styles.customerOptionName}>{c.name}</Text>
                  <Text style={styles.customerOptionSub}>
                    {c.phone} • Points: {c.loyaltyPoints} • Tab Debt: N${c.outstandingDebt.toFixed(2)} (Limit: N${c.creditLimit.toFixed(2)})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment Processing Tender Modal */}
      <Modal
        visible={checkoutModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.checkoutModalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Select Payment Method</Text>
              <TouchableOpacity onPress={() => setCheckoutModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.totalDueBanner}>
              <Text style={styles.totalDueLabel}>AMOUNT PAYABLE</Text>
              <Text style={styles.totalDueAmount}>N${cartTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.payMethodsGrid}>
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = selectedPayMethod === pm.id;
                return (
                  <TouchableOpacity
                    key={pm.id}
                    style={[styles.payMethodItem, isSelected && styles.payMethodItemSelected]}
                    onPress={() => setSelectedPayMethod(pm.id)}
                  >
                    <MaterialCommunityIcons
                      name={pm.icon as any}
                      size={18}
                      color={isSelected ? COLORS.primaryLight : COLORS.textMuted}
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[styles.payMethodLabel, isSelected && { color: COLORS.textLight, fontWeight: '700' }]}>
                        {pm.label}
                      </Text>
                      <Text style={styles.payMethodDesc}>{pm.desc}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedPayMethod === 'CASH' && (
              <View style={styles.cashBox}>
                <Text style={styles.cashInputLabel}>Cash Tendered by Customer (N$):</Text>
                <TextInput
                  style={styles.cashInputField}
                  keyboardType="numeric"
                  value={cashTendered}
                  onChangeText={setCashTendered}
                  placeholder={cartTotal.toFixed(2)}
                  placeholderTextColor={COLORS.textMuted}
                />
                <View style={styles.changeDisplayRow}>
                  <Text style={styles.changeLabel}>Change to return:</Text>
                  <Text style={styles.changeValueText}>N${changeAmount.toFixed(2)}</Text>
                </View>
              </View>
            )}

            {selectedPayMethod === 'STORE_CREDIT' && (
              <View style={styles.tabInfoBanner}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.gold} />
                <Text style={styles.tabInfoText}>
                  {selectedCustomer
                    ? `Charges to ${selectedCustomer.name}'s informal credit tab. Available Limit: N$${(selectedCustomer.creditLimit - selectedCustomer.outstandingDebt).toFixed(2)}`
                    : '⚠️ Please select a customer profile to charge to a Store Credit Tab.'}
                </Text>
              </View>
            )}

            {checkoutError ? (
              <View style={styles.checkoutErrorBanner}>
                <Text style={styles.checkoutErrorText}>{checkoutError}</Text>
              </View>
            ) : null}

            <View style={styles.checkoutBtnRow}>
              <TouchableOpacity
                style={styles.cancelCheckoutBtn}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Text style={styles.cancelCheckoutText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmCheckoutBtn}
                onPress={handleConfirmCheckout}
                disabled={isProcessing}
              >
                <Text style={styles.confirmCheckoutText}>
                  {isProcessing ? 'Processing...' : 'Complete Transaction'}
                </Text>
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
    backgroundColor: COLORS.bgCanvas,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'column',
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
  },
  catalogColumn: {
    flex: 3,
    padding: 12,
  },
  cartColumn: {
    flex: 2,
    backgroundColor: COLORS.surfaceDark,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.borderDark,
    padding: 12,
    justifyContent: 'space-between',
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  searchBox: {
    flex: 1,
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
  scannerBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  scannerBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  categoryWrap: {
    marginBottom: 8,
  },
  categoryScroll: {
    gap: 6,
  },
  categoryPill: {
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  categoryPillSelected: {
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  categoryPillTextSelected: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 20,
  },
  productCard: {
    width: '48%',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    justifyContent: 'space-between',
    minHeight: 110,
  },
  productCardInCart: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryMuted,
  },
  productCardDisabled: {
    opacity: 0.5,
  },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  qtyBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  qtyBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    lineHeight: 15,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 6,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  productUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  productStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  stockIndicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  stockLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  cartCountPill: {
    backgroundColor: COLORS.blueMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cartCountPillText: {
    fontSize: 10,
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  clearBtnText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '700',
  },
  customerAttachBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: 8,
  },
  customerAttachTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  customerAttachSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  emptyCartBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  emptyCartText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSub,
  },
  emptyCartSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cartItemsScroll: {
    flex: 1,
    maxHeight: 240,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  cartItemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  cartItemPriceText: {
    fontSize: 10,
    color: COLORS.primaryLight,
    marginTop: 2,
    fontWeight: '600',
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
    borderRadius: 6,
    gap: 2,
  },
  stepperBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.textLight,
    paddingHorizontal: 4,
  },
  cartBottomSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 8,
  },
  discountInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  discountLabelText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  discountInputField: {
    width: 65,
    height: 28,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    color: COLORS.textLight,
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  paySubmitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  paySubmitBtnDisabled: {
    opacity: 0.5,
  },
  paySubmitText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  customerModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  customerOptionItem: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  customerOptionSelected: {
    borderColor: COLORS.blueLight,
    backgroundColor: COLORS.blueMuted,
  },
  customerOptionName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  customerOptionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkoutModalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  totalDueBanner: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  totalDueLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  totalDueAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  payMethodsGrid: {
    gap: 6,
    marginBottom: 10,
  },
  payMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  payMethodItemSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryMuted,
  },
  payMethodLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSub,
  },
  payMethodDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  cashBox: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  cashInputLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  cashInputField: {
    height: 36,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: 'bold',
  },
  changeDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  changeLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  changeValueText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.success,
  },
  tabInfoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.warningMuted,
    padding: 8,
    borderRadius: 6,
    gap: 6,
    marginBottom: 8,
  },
  tabInfoText: {
    fontSize: 10,
    color: COLORS.gold,
    flex: 1,
  },
  checkoutErrorBanner: {
    backgroundColor: COLORS.dangerMuted,
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  checkoutErrorText: {
    color: COLORS.danger,
    fontSize: 11,
    fontWeight: '600',
  },
  checkoutBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  cancelCheckoutBtn: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelCheckoutText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 12,
  },
  confirmCheckoutBtn: {
    flex: 2,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCheckoutText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
  floatingCartBar: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingCartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  floatingCartBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingCartBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '900',
  },
  floatingCartTotal: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  floatingCartSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  floatingChargeBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingChargeText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 12,
  },
});
