import React, { useState, useMemo } from 'react';
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
import { Customer } from '../types';

const TRANSACTION_CATEGORIES = [
  'All Entries',
  'RETAIL_SALE',
  'STOCK_PURCHASE',
  'RENT',
  'UTILITIES',
  'SALARY',
  'LOGISTICS_FEE',
];

export const FinanceScreen: React.FC = () => {
  const { transactions, customers, recordTabRepayment } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('All Entries');
  const [repayModalVisible, setRepayModalVisible] = useState(false);
  const [selectedCustomerForRepay, setSelectedCustomerForRepay] = useState<Customer | null>(null);
  const [repayAmount, setRepayAmount] = useState('');

  // Financial aggregates memoized
  const { totalIncome, totalExpense, netOperatingProfit, totalOutstandingCustomerDebt } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.transactionType === 'INCOME') income += t.amount;
      else if (t.transactionType === 'EXPENSE') expense += t.amount;
    }
    const debt = customers.reduce((sum, c) => sum + c.outstandingDebt, 0);
    return {
      totalIncome: income,
      totalExpense: expense,
      netOperatingProfit: income - expense,
      totalOutstandingCustomerDebt: debt,
    };
  }, [transactions, customers]);

  const filteredTransactions = useMemo(() => {
    if (selectedCategory === 'All Entries') return transactions;
    return transactions.filter((t) => t.category === selectedCategory);
  }, [transactions, selectedCategory]);

  const handleRepayTab = async () => {
    if (!selectedCustomerForRepay) return;
    const amt = parseFloat(repayAmount);
    if (!amt || amt <= 0) {
      alert('Please enter a valid repayment amount.');
      return;
    }
    await recordTabRepayment(selectedCustomerForRepay.id, amt);
    setRepayModalVisible(false);
    setSelectedCustomerForRepay(null);
    setRepayAmount('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Banner */}
        <View style={styles.headerCard}>
          <Text style={styles.headerSub}>DOUBLE-ENTRY CASHBOOK</Text>
          <Text style={styles.headerTitle}>Finance & Treasury Ledger</Text>
          <Text style={styles.headerDesc}>
            Real-time operating income, supplier outflows, and informal customer credit tabs.
          </Text>
        </View>

        {/* 4 Financial Aggregate Cards */}
        <View style={styles.summaryGrid}>
          <View style={[styles.kpiCard, styles.kpiGreen]}>
            <Text style={styles.kpiLabel}>Total Revenue Inflow</Text>
            <Text style={[styles.kpiAmount, { color: COLORS.primaryLight }]}>
              N${totalIncome.toFixed(2)}
            </Text>
            <Text style={styles.kpiSub}>Sales & repayments</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiRed]}>
            <Text style={styles.kpiLabel}>Total Operating Outflows</Text>
            <Text style={[styles.kpiAmount, { color: COLORS.danger }]}>
              N${totalExpense.toFixed(2)}
            </Text>
            <Text style={styles.kpiSub}>Stock, logistics & OPEX</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiBlue]}>
            <Text style={styles.kpiLabel}>Net Operating Profit</Text>
            <Text style={[styles.kpiAmount, { color: COLORS.blueLight }]}>
              N${netOperatingProfit.toFixed(2)}
            </Text>
            <Text style={styles.kpiSub}>
              P&L Margin: {totalIncome > 0 ? ((netOperatingProfit / totalIncome) * 100).toFixed(1) : 0}%
            </Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiAmber]}>
            <Text style={styles.kpiLabel}>Customer Tabs (Accounts Rec.)</Text>
            <Text style={[styles.kpiAmount, { color: COLORS.gold }]}>
              N${totalOutstandingCustomerDebt.toFixed(2)}
            </Text>
            <Text style={styles.kpiSub}>{customers.length} registered credit tabs</Text>
          </View>
        </View>

        {/* Customer Store Tabs Management */}
        <View style={styles.tabsSection}>
          <View style={styles.tabsHeaderRow}>
            <MaterialCommunityIcons name="book-account-outline" size={16} color={COLORS.gold} />
            <Text style={styles.tabsSectionTitle}>Customer Store Credit Accounts</Text>
          </View>

          {customers.map((c) => (
            <View key={c.id} style={styles.customerDebtCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.debtName}>{c.name}</Text>
                <Text style={styles.debtMeta}>
                  {c.phone} • Limit: N${c.creditLimit.toFixed(2)} • Loyalty: {c.loyaltyPoints} pts
                </Text>
              </View>

              <View style={styles.debtAmountCol}>
                <Text style={styles.debtValue}>N${c.outstandingDebt.toFixed(2)}</Text>
                <Text style={styles.debtLabel}>Current Debt</Text>
              </View>

              {c.outstandingDebt > 0 && (
                <TouchableOpacity
                  style={styles.repayBtn}
                  onPress={() => {
                    setSelectedCustomerForRepay(c);
                    setRepayAmount(c.outstandingDebt.toString());
                    setRepayModalVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.repayBtnText}>Settle Debt</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Cashbook Journal Entries */}
        <View style={styles.journalHeaderRow}>
          <Text style={styles.journalTitle}>TRANSACTION JOURNAL ENTRIES</Text>
        </View>

        {/* Filter Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {TRANSACTION_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextSelected,
                  ]}
                >
                  {cat.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Journal Entries List */}
        <View style={styles.journalList}>
          {filteredTransactions.map((tx) => {
            const isIncome = tx.transactionType === 'INCOME';

            return (
              <View key={tx.id} style={styles.txRow}>
                <View
                  style={[
                    styles.txIconBox,
                    isIncome ? styles.txIconIncome : styles.txIconExpense,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={isIncome ? 'arrow-down-left' : 'arrow-top-right'}
                    size={16}
                    color={isIncome ? COLORS.primaryLight : COLORS.danger}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text>
                  <Text style={styles.txMeta}>
                    {new Date(tx.timeStamp).toLocaleDateString()} • {tx.category.replace('_', ' ')}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.txAmount,
                    isIncome ? { color: COLORS.primaryLight } : { color: COLORS.danger },
                  ]}
                >
                  {isIncome ? '+' : '-'}N${tx.amount.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Settle Debt Modal */}
      <Modal
        visible={repayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRepayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settle Store Tab Debt</Text>
              <TouchableOpacity onPress={() => setRepayModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {selectedCustomerForRepay && (
              <View style={styles.repayInfoCard}>
                <Text style={styles.repayName}>{selectedCustomerForRepay.name}</Text>
                <Text style={styles.repayMeta}>
                  Outstanding Balance: N${selectedCustomerForRepay.outstandingDebt.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Repayment Amount (N$)</Text>
              <TextInput
                style={styles.formInput}
                keyboardType="numeric"
                placeholder="100.00"
                placeholderTextColor={COLORS.textMuted}
                value={repayAmount}
                onChangeText={setRepayAmount}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setRepayModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveRepayBtn} onPress={handleRepayTab}>
                <Text style={styles.saveRepayBtnText}>Confirm Settlement</Text>
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
    color: COLORS.primaryLight,
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  kpiGreen: {
    borderTopWidth: 3,
    borderTopColor: COLORS.primaryLight,
  },
  kpiRed: {
    borderTopWidth: 3,
    borderTopColor: COLORS.danger,
  },
  kpiBlue: {
    borderTopWidth: 3,
    borderTopColor: COLORS.blueLight,
  },
  kpiAmber: {
    borderTopWidth: 3,
    borderTopColor: COLORS.gold,
  },
  kpiLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  kpiAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabsSection: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 8,
  },
  tabsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tabsSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  customerDebtCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
    gap: 8,
  },
  debtName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  debtMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  debtAmountCol: {
    alignItems: 'flex-end',
  },
  debtValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gold,
  },
  debtLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  repayBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  repayBtnText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  journalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  journalTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  filterScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  filterChip: {
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  filterChipSelected: {
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight,
  },
  filterChipText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  journalList: {
    gap: 6,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  txIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txIconIncome: {
    backgroundColor: COLORS.primaryMuted,
  },
  txIconExpense: {
    backgroundColor: COLORS.dangerMuted,
  },
  txDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  txMeta: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  txAmount: {
    fontSize: 13,
    fontWeight: '800',
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textLight,
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
  repayInfoCard: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  repayName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  repayMeta: {
    fontSize: 10,
    color: COLORS.gold,
    marginTop: 1,
  },
  saveRepayBtn: {
    flex: 2,
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveRepayBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});
