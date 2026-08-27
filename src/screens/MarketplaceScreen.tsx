import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { PromotionItem } from '../types';

const CAMPAIGN_TABS = ['All Deals', 'Bulk Deals', 'Flash Sales', 'Bundles'];

export const MarketplaceScreen: React.FC = () => {
  const { promotions, redeemPromotion } = useApp();
  const [selectedTab, setSelectedTab] = useState('All Deals');
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  const filteredPromos = promotions.filter((p) => {
    if (selectedTab === 'All Deals') return true;
    return p.campaignType === selectedTab;
  });

  const handleRedeem = async (promo: PromotionItem) => {
    setRedeemingId(promo.id);
    const success = await redeemPromotion(promo.id);
    setRedeemingId(null);
    if (success) {
      alert(`Deal "${promo.title}" claimed!\n\n• +${promo.minOrderQty} units added to Inventory\n• N$${promo.promoPrice.toFixed(2)} logged in Cashbook\n• Supplier notified in Comms Hub.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Banner */}
        <View style={styles.headerCard}>
          <Text style={styles.headerSub}>WHOLESALE LIQUIDITY</Text>
          <Text style={styles.headerTitle}>Wholesale Promotions Feed</Text>
          <Text style={styles.headerDesc}>
            Manufacturer bulk specials, flash margin rebates, and bundled orders.
          </Text>
        </View>

        {/* Campaign Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {CAMPAIGN_TABS.map((tab) => {
            const isSelected = selectedTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabPill, isSelected && styles.tabPillSelected]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    isSelected && styles.tabPillTextSelected,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Deals Cards */}
        <View style={styles.dealsList}>
          {filteredPromos.map((promo) => {
            const discountPct = Math.round(
              ((promo.originalPrice - promo.promoPrice) / promo.originalPrice) * 100
            );
            const isRedeeming = redeemingId === promo.id;

            return (
              <View key={promo.id} style={styles.dealCard}>
                <View style={styles.dealTopRow}>
                  <View style={styles.supplierWrap}>
                    <Text style={styles.supplierEmoji}>{promo.supplierLogo}</Text>
                    <View style={{ marginLeft: 6 }}>
                      <Text style={styles.supplierName}>{promo.supplierName}</Text>
                      <Text style={styles.locationText}>{promo.location} • {promo.validityPeriod}</Text>
                    </View>
                  </View>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discountPct}% OFF</Text>
                  </View>
                </View>

                <Text style={styles.dealTitle}>{promo.title}</Text>
                <Text style={styles.dealDesc}>{promo.description}</Text>

                <View style={styles.priceRow}>
                  <View>
                    <Text style={styles.origPrice}>Regular: N${promo.originalPrice.toFixed(2)}</Text>
                    <Text style={styles.dealPrice}>N${promo.promoPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.minQtyBadge}>
                    <Text style={styles.minQtyText}>Min: {promo.minOrderQty} units</Text>
                  </View>
                </View>

                <View style={styles.dealFooter}>
                  <View style={styles.likesRow}>
                    <Ionicons name="heart" size={13} color={COLORS.danger} />
                    <Text style={styles.likesText}>{promo.engagementLikes}</Text>
                    <Ionicons name="eye" size={13} color={COLORS.textMuted} style={{ marginLeft: 6 }} />
                    <Text style={styles.likesText}>{promo.engagementViews}</Text>
                  </View>

                  {promo.isRedeemed ? (
                    <View style={styles.claimedBadge}>
                      <Feather name="check" size={12} color={COLORS.primaryLight} />
                      <Text style={styles.claimedBadgeText}>Redeemed</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.claimBtn}
                      onPress={() => handleRedeem(promo)}
                      disabled={isRedeeming}
                      activeOpacity={0.8}
                    >
                      {isRedeeming ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                      ) : (
                        <Text style={styles.claimBtnText}>Claim Deal</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
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
  tabScroll: {
    gap: 6,
    paddingBottom: 2,
  },
  tabPill: {
    backgroundColor: COLORS.surfaceDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  tabPillSelected: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primaryLight,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabPillTextSelected: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  dealsList: {
    gap: 10,
  },
  dealCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  dealTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  supplierWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  supplierEmoji: {
    fontSize: 18,
  },
  supplierName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  discountBadge: {
    backgroundColor: COLORS.dangerMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 10,
  },
  dealTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 8,
  },
  dealDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
    marginVertical: 8,
  },
  origPrice: {
    fontSize: 10,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  dealPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight,
    marginTop: 1,
  },
  minQtyBadge: {
    backgroundColor: COLORS.blueMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  minQtyText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blueLight,
  },
  dealFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 8,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  likesText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  claimedBadgeText: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '700',
  },
  claimBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  claimBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
  },
});
