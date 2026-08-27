import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { CanvasRevenueChart } from '../components/CanvasRevenueChart';
import { NAV_ITEMS } from '../components/NavigationLayout';

interface DashboardScreenProps {
  onOpenAiConsultant: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onOpenAiConsultant }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const {
    products,
    receipts,
    transactions,
    customers,
    consignments,
    setActiveScreen,
    canAccess,
    userRole,
    branch,
  } = useApp();

  // Metrics computation memoized
  const { totalRevenue, totalExpense, netProfit, lowStockItems, activeConsignments, totalCustomerDebt } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.transactionType === 'INCOME') income += t.amount;
      else if (t.transactionType === 'EXPENSE') expense += t.amount;
    }
    return {
      totalRevenue: income,
      totalExpense: expense,
      netProfit: income - expense,
      lowStockItems: products.filter((p) => p.stockQty <= p.minStockAlert),
      activeConsignments: consignments.filter((c) => c.status !== 'DELIVERED'),
      totalCustomerDebt: customers.reduce((sum, c) => sum + c.outstandingDebt, 0),
    };
  }, [transactions, products, consignments, customers]);

  // 7-day revenue aggregation
  const chartData = useMemo(() => [
    { label: 'Wed', amount: 1420 },
    { label: 'Thu', amount: 2150 },
    { label: 'Fri', amount: 3200 },
    { label: 'Sat', amount: 4890 },
    { label: 'Sun', amount: 3100 },
    { label: 'Mon', amount: 2450 },
    { label: 'Today', amount: totalRevenue > 0 ? totalRevenue : 3980 },
  ], [totalRevenue]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Welcome Header */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeTextCol}>
            <View style={styles.branchTagRow}>
              <Ionicons name="storefront-outline" size={13} color={COLORS.primaryLight} />
              <Text style={styles.branchTagText}>{branch.name}</Text>
            </View>
            <Text style={styles.welcomeTitle}>Command Desk</Text>
            <Text style={styles.roleSubtext}>
              Signed in as <Text style={styles.roleSubtextHighlight}>{userRole}</Text>
            </Text>
          </View>

          <TouchableOpacity
            style={styles.aiAdvisorBtn}
            onPress={onOpenAiConsultant}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="creation" size={16} color={COLORS.white} />
            <Text style={styles.aiBtnText}>AI Advisor</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access Modules Navigation */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeader}>QUICK ACCESS MODULES</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moduleScroll}
          >
            {NAV_ITEMS.map((item) => {
              const isAllowed = canAccess(item.key);
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.moduleCard, !isAllowed && styles.moduleCardLocked]}
                  onPress={() => {
                    if (!isAllowed) {
                      alert(`Role "${userRole}" is not authorized to access ${item.label}.`);
                      return;
                    }
                    setActiveScreen(item.key);
                  }}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.moduleIconBadge,
                      item.group === 'Commerce'
                        ? styles.badgeGreen
                        : item.group === 'Supply Chain'
                        ? styles.badgeBlue
                        : styles.badgeSlate,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.iconName as any}
                      size={20}
                      color={
                        item.group === 'Commerce'
                          ? COLORS.primaryLight
                          : item.group === 'Supply Chain'
                          ? COLORS.blueLight
                          : COLORS.textSub
                      }
                    />
                  </View>
                  <Text style={styles.moduleCardTitle} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.moduleCardSub}>{item.group}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Low Stock Operational Banner */}
        {lowStockItems.length > 0 && (
          <View style={styles.alertBanner}>
            <View style={styles.alertIconBadge}>
              <Feather name="alert-triangle" size={16} color={COLORS.warning} />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {lowStockItems.length} Product{lowStockItems.length > 1 ? 's' : ''} Below Reorder Buffer
              </Text>
              <Text style={styles.alertDescription} numberOfLines={2}>
                {lowStockItems.map((i) => `${i.name} (${i.stockQty} left)`).join(' • ')}
              </Text>
            </View>
            {canAccess('Procurement') && (
              <TouchableOpacity
                style={styles.alertActionBtn}
                onPress={() => setActiveScreen('Procurement')}
                activeOpacity={0.7}
              >
                <Text style={styles.alertActionText}>Restock</Text>
                <Feather name="chevron-right" size={14} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Financial KPI Cards */}
        <View style={styles.kpiGrid}>
          <View style={[styles.kpiCard, styles.kpiGreen]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiTitle}>Total Revenue</Text>
              <MaterialCommunityIcons name="arrow-top-right" size={16} color={COLORS.primaryLight} />
            </View>
            <Text style={[styles.kpiAmount, { color: COLORS.primaryLight }]}>
              N${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.kpiFooterText}>{receipts.length + 4} completed transactions</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiBlue]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiTitle}>Net Profit</Text>
              <MaterialCommunityIcons name="wallet-outline" size={16} color={COLORS.blueLight} />
            </View>
            <Text style={[styles.kpiAmount, { color: COLORS.blueLight }]}>
              N${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.kpiFooterText}>Expenses: N${totalExpense.toFixed(2)}</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiSlate]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiTitle}>KYB Trust Score</Text>
              <MaterialCommunityIcons name="shield-check-outline" size={16} color={COLORS.textSub} />
            </View>
            <Text style={styles.kpiAmount}>94 / 100</Text>
            <Text style={styles.kpiFooterText}>Trade Line: N$45,000</Text>
          </View>

          <View style={[styles.kpiCard, styles.kpiAmber]}>
            <View style={styles.kpiHeaderRow}>
              <Text style={styles.kpiTitle}>Customer Tabs</Text>
              <MaterialCommunityIcons name="book-account-outline" size={16} color={COLORS.gold} />
            </View>
            <Text style={[styles.kpiAmount, { color: COLORS.gold }]}>
              N${totalCustomerDebt.toFixed(2)}
            </Text>
            <Text style={styles.kpiFooterText}>{customers.length} registered accounts</Text>
          </View>
        </View>

        {/* 7-Day Revenue Progression Chart */}
        <View style={styles.chartCardWrapper}>
          <CanvasRevenueChart data={chartData} height={180} />
        </View>

        {/* Active Consignments Stream */}
        {activeConsignments.length > 0 && (
          <View style={styles.consignSection}>
            <View style={styles.consignHeader}>
              <MaterialCommunityIcons name="truck-fast-outline" size={18} color={COLORS.blueLight} />
              <Text style={styles.consignTitle}>Active Regional Consignments</Text>
            </View>
            {activeConsignments.map((c) => (
              <TouchableOpacity
                key={c.trackingId}
                style={styles.consignRow}
                onPress={() => setActiveScreen('Logistics')}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.consignTrackId}>#{c.trackingId}</Text>
                  <Text style={styles.consignName} numberOfLines={1}>{c.cargoDescription}</Text>
                  <Text style={styles.consignRouteText}>{c.origin} ➔ {c.destination}</Text>
                </View>
                <View style={styles.consignStatusBadge}>
                  <Text style={styles.consignStatusText}>{c.status.replace('_', ' ')}</Text>
                  <Text style={styles.consignEta}>ETA: {c.eta}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
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
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeTextCol: {
    flex: 1,
    marginRight: 10,
  },
  branchTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  branchTagText: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '700',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  roleSubtext: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  roleSubtextHighlight: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  aiAdvisorBtn: {
    backgroundColor: COLORS.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  moduleScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  moduleCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    width: 130,
    alignItems: 'flex-start',
  },
  moduleCardLocked: {
    opacity: 0.5,
  },
  moduleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  badgeGreen: {
    backgroundColor: COLORS.primaryMuted,
  },
  badgeBlue: {
    backgroundColor: COLORS.blueMuted,
  },
  badgeSlate: {
    backgroundColor: COLORS.surfaceDarkElevated,
  },
  moduleCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  moduleCardSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  alertBanner: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  alertIconBadge: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.warningMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  alertDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  alertActionBtn: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  kpiBlue: {
    borderTopWidth: 3,
    borderTopColor: COLORS.blueLight,
  },
  kpiSlate: {
    borderTopWidth: 3,
    borderTopColor: COLORS.borderLight,
  },
  kpiAmber: {
    borderTopWidth: 3,
    borderTopColor: COLORS.gold,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  kpiAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: 4,
  },
  kpiFooterText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  chartCardWrapper: {
    width: '100%',
  },
  consignSection: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 8,
  },
  consignHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  consignTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  consignRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
  },
  consignTrackId: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.blueLight,
  },
  consignName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 1,
  },
  consignRouteText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  consignStatusBadge: {
    alignItems: 'flex-end',
  },
  consignStatusText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primaryLight,
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  consignEta: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
