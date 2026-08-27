import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Platform,
} from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../theme/colors';
import { SalesReceipt } from '../types';
import { useApp } from '../context/AppContext';

interface DigitalReceiptModalProps {
  visible: boolean;
  receipt: SalesReceipt | null;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  visible,
  receipt,
  onClose,
}) => {
  const { branch, customers } = useApp();
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  if (!receipt) return null;

  const customer = receipt.customerId
    ? customers.find((c) => c.id === receipt.customerId)
    : undefined;

  // 15% VAT calculation (Namibia Inland Revenue standard: VAT = Total * 15/115)
  const vatAmount = receipt.totalAmount * (15 / 115);
  const subtotalBeforeVat = receipt.totalAmount - vatAmount;

  const handleShareReceipt = async () => {
    const text = `
-----------------------------------------
      KAVANGOX MERCHANT OS
      ${branch.name.toUpperCase()}
      TAX INVOICE / RECEIPT
-----------------------------------------
Receipt No: ${receipt.id}
Date: ${new Date(receipt.timeStamp).toLocaleString()}
Cashier: ${receipt.sellerName}
Payment Method: ${receipt.paymentMethod}
-----------------------------------------
ITEMS:
${receipt.items.map((it) => `${it.quantity}x ${it.productName} @ N$${it.unitPrice.toFixed(2)} = N$${(it.quantity * it.unitPrice).toFixed(2)}`).join('\n')}
-----------------------------------------
Subtotal (Excl. VAT): N$${subtotalBeforeVat.toFixed(2)}
VAT (15% Inland Revenue): N$${vatAmount.toFixed(2)}
Discount: N$${receipt.discountAmount.toFixed(2)}
TOTAL PAID: N$${receipt.totalAmount.toFixed(2)}
${receipt.cashTendered ? `Cash Tendered: N$${receipt.cashTendered.toFixed(2)}` : ''}
${receipt.changeGiven ? `Change: N$${receipt.changeGiven.toFixed(2)}` : ''}
-----------------------------------------
Customer: ${customer ? customer.name : 'Walk-in Retail Shopper'}
${customer ? `Loyalty Points: +${Math.floor(receipt.totalAmount / 10)} pts` : ''}
${customer && receipt.paymentMethod === 'STORE_CREDIT' ? `Current Tab Debt: N$${customer.outstandingDebt.toFixed(2)}` : ''}
-----------------------------------------
Thank you for supporting local commerce!
Powered by KavangoX Merchant OS
    `.trim();

    try {
      if (Platform.OS === 'web') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(text);
          setDispatchStatus('Receipt copied to clipboard! (Simulated WhatsApp/SMS Dispatch)');
          setTimeout(() => setDispatchStatus(null), 3000);
        } else {
          alert('Receipt details:\n\n' + text);
        }
      } else {
        await Share.share({ message: text, title: `Receipt ${receipt.id}` });
      }
    } catch {
      // Ignored
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Receipt Notch / Design */}
          <View style={styles.topNotch} />

          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>KX</Text>
            </View>
            <Text style={styles.brandTitle}>KAVANGOX RETAIL OS</Text>
            <Text style={styles.branchName}>{branch.name}</Text>
            <Text style={styles.branchAddress}>{branch.address}</Text>
            <View style={styles.invoiceBadge}>
              <Text style={styles.invoiceBadgeText}>OFFICIAL TAX INVOICE</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Meta Details */}
            <View style={styles.metaBox}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Receipt No:</Text>
                <Text style={styles.metaValue}>{receipt.id}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Date & Time:</Text>
                <Text style={styles.metaValue}>
                  {new Date(receipt.timeStamp).toLocaleDateString()}{' '}
                  {new Date(receipt.timeStamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Staff / Role:</Text>
                <Text style={styles.metaValue}>{receipt.sellerName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Mode:</Text>
                <View style={styles.payMethodPill}>
                  <Text style={styles.payMethodText}>{receipt.paymentMethod}</Text>
                </View>
              </View>
              {customer && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Customer:</Text>
                  <Text style={styles.metaValue}>{customer.name}</Text>
                </View>
              )}
            </View>

            <View style={styles.divider} />

            {/* Line Items */}
            <View style={styles.itemsHeader}>
              <Text style={[styles.itemColHeader, { flex: 2 }]}>SKU / Description</Text>
              <Text style={[styles.itemColHeader, { flex: 1, textAlign: 'center' }]}>Qty</Text>
              <Text style={[styles.itemColHeader, { flex: 1.2, textAlign: 'right' }]}>Total</Text>
            </View>

            {receipt.items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemUnitPrice}>@ N${item.unitPrice.toFixed(2)}</Text>
                </View>
                <Text style={[styles.itemQty, { flex: 1, textAlign: 'center' }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.itemTotal, { flex: 1.2, textAlign: 'right' }]}>
                  N${(item.quantity * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            {/* Financial Summary Breakdown */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal (Excl. VAT):</Text>
                <Text style={styles.summaryValue}>N${subtotalBeforeVat.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>VAT (15% Inland Revenue):</Text>
                <Text style={styles.summaryValue}>N${vatAmount.toFixed(2)}</Text>
              </View>
              {receipt.discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.discountLabel}>Discount Applied:</Text>
                  <Text style={styles.discountValue}>-N${receipt.discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>TOTAL PAYABLE</Text>
                <Text style={styles.totalValue}>N${receipt.totalAmount.toFixed(2)}</Text>
              </View>

              {receipt.cashTendered !== undefined && (
                <View style={styles.tenderBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Cash Tendered:</Text>
                    <Text style={styles.summaryValue}>N${receipt.cashTendered.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.changeLabel}>Change Returned:</Text>
                    <Text style={styles.changeValue}>N${(receipt.changeGiven || 0).toFixed(2)}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Customer Tab & Loyalty Rewards */}
            {customer && (
              <View style={styles.loyaltyBox}>
                <View style={styles.loyaltyRow}>
                  <MaterialCommunityIcons name="star-circle" size={16} color={COLORS.accent} />
                  <Text style={styles.loyaltyText}>
                    Earned +{Math.floor(receipt.totalAmount / 10)} Loyalty Points (Total: {customer.loyaltyPoints + Math.floor(receipt.totalAmount / 10)})
                  </Text>
                </View>
                {receipt.paymentMethod === 'STORE_CREDIT' && (
                  <View style={[styles.loyaltyRow, { marginTop: 4 }]}>
                    <Ionicons name="receipt-outline" size={16} color={COLORS.warning} />
                    <Text style={[styles.loyaltyText, { color: COLORS.warning }]}>
                      Added to Tab Debt. Current Balance: N${customer.outstandingDebt.toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Sync State */}
            <View style={styles.syncStateRow}>
              <View
                style={[
                  styles.syncDot,
                  { backgroundColor: receipt.isSynced ? COLORS.success : COLORS.accent },
                ]}
              />
              <Text style={styles.syncStateText}>
                {receipt.isSynced ? 'Synced to Cloud Ledger' : 'Stored in Local Offline SQLite Queue'}
              </Text>
            </View>

            {dispatchStatus && (
              <View style={styles.dispatchToast}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.dispatchToastText}>{dispatchStatus}</Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footerActions}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={handleShareReceipt}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons name="whatsapp" size={18} color={COLORS.white} />
              <Text style={styles.shareBtnText}>SMS / WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.doneBtnText}>New Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  topNotch: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    marginBottom: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandBadgeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 14,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  branchName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 2,
  },
  branchAddress: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },
  invoiceBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 6,
  },
  invoiceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#334155',
    letterSpacing: 0.5,
  },
  scrollArea: {
    maxHeight: 380,
  },
  metaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '700',
  },
  payMethodPill: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  payMethodText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  itemsHeader: {
    flexDirection: 'row',
    paddingBottom: 4,
  },
  itemColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemUnitPrice: {
    fontSize: 10,
    color: '#64748B',
  },
  itemQty: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  itemTotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  discountLabel: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 11,
    color: COLORS.danger,
    fontWeight: '700',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#CBD5E1',
    paddingTop: 6,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  tenderBox: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 4,
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
  },
  changeValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.success,
  },
  loyaltyBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  loyaltyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loyaltyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  syncStateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncStateText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dispatchToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  dispatchToastText: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  shareBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#25D366', // WhatsApp Brand Green
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  doneBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
