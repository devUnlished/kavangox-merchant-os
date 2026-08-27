import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
} from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';

export interface NavItem {
  key: string;
  label: string;
  shortLabel: string;
  iconName: string;
  iconType: 'mci' | 'ionicons' | 'feather';
  group: 'Commerce' | 'Supply Chain' | 'Finance & Admin';
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'Dashboard', label: 'Command Desk', shortLabel: 'Home', iconName: 'view-dashboard-outline', iconType: 'mci', group: 'Commerce' },
  { key: 'POS', label: 'Point of Sale', shortLabel: 'POS', iconName: 'cash-register', iconType: 'mci', group: 'Commerce' },
  { key: 'Inventory', label: 'Inventory Labs', shortLabel: 'Stock', iconName: 'cube-outline', iconType: 'mci', group: 'Supply Chain' },
  { key: 'Procurement', label: 'Smart Procurement', shortLabel: 'Suppliers', iconName: 'truck-fast-outline', iconType: 'mci', group: 'Supply Chain' },
  { key: 'Marketplace', label: 'Wholesale Deals', shortLabel: 'Market', iconName: 'storefront-outline', iconType: 'mci', group: 'Supply Chain' },
  { key: 'Logistics', label: 'Fleet & Logistics', shortLabel: 'Fleet', iconName: 'map-marker-path', iconType: 'mci', group: 'Supply Chain' },
  { key: 'Finance', label: 'Finance & Cashbook', shortLabel: 'Finance', iconName: 'book-outline', iconType: 'ionicons', group: 'Finance & Admin' },
  { key: 'Communications', label: 'Communications Hub', shortLabel: 'Comms', iconName: 'chatbubbles-outline', iconType: 'ionicons', group: 'Finance & Admin' },
  { key: 'Enterprise', label: 'Enterprise OS', shortLabel: 'Admin', iconName: 'shield-account-outline', iconType: 'mci', group: 'Finance & Admin' },
];

export const NavigationLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const { activeScreen, setActiveScreen, canAccess, userRole, notifications } = useApp();

  const unreadChatCount = notifications.filter((n) => !n.isRead && n.targetScreen === 'Communications').length;

  const handleNavPress = (key: string) => {
    if (!canAccess(key)) {
      alert(`Role Restricted: "${userRole}" is not authorized for ${key}. Switch your role in the top header to unlock.`);
      return;
    }
    setActiveScreen(key);
  };

  const renderIcon = (item: NavItem, isActive: boolean, isAllowed: boolean) => {
    const color = !isAllowed
      ? COLORS.textMuted + '55'
      : isActive
      ? COLORS.primaryLight
      : COLORS.textMuted;

    if (item.iconType === 'ionicons') {
      return <Ionicons name={item.iconName as any} size={18} color={color} />;
    }
    if (item.iconType === 'feather') {
      return <Feather name={item.iconName as any} size={18} color={color} />;
    }
    return <MaterialCommunityIcons name={item.iconName as any} size={18} color={color} />;
  };

  if (isDesktop) {
    // Desktop & Tablet Navigation Rail (Fixed width, never overflows)
    return (
      <View style={styles.desktopContainer}>
        <View style={styles.sidebar}>
          <View style={styles.sidebarNav}>
            <Text style={styles.sidebarSectionTitle}>NAVIGATION</Text>
            {NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.key;
              const isAllowed = canAccess(item.key);

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.sidebarItem,
                    isActive && styles.sidebarItemActive,
                    !isAllowed && styles.sidebarItemLocked,
                  ]}
                  onPress={() => handleNavPress(item.key)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sidebarIconWrap}>
                    {renderIcon(item, isActive, isAllowed)}
                    {!isAllowed && (
                      <View style={styles.lockBadge}>
                        <Feather name="lock" size={8} color={COLORS.danger} />
                      </View>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.sidebarItemText,
                      isActive && styles.sidebarItemTextActive,
                      !isAllowed && styles.sidebarItemTextLocked,
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>

                  {item.key === 'Communications' && unreadChatCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{unreadChatCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* User Role Card at Bottom of Sidebar */}
          <View style={styles.sidebarUserCard}>
            <View style={styles.userStatusDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.userRoleName} numberOfLines={1}>{userRole}</Text>
              <Text style={styles.userRoleStatus}>Active Terminal</Text>
            </View>
          </View>
        </View>

        {/* Desktop Main Content Shell */}
        <View style={styles.desktopContentWrapper}>
          {children}
        </View>
      </View>
    );
  }

  // Mobile Layout (Top Horizontal Tabs + Screen Content + Docked Bottom Bar)
  return (
    <View style={styles.mobileContainer}>
      {/* Top Horizontal Quick Nav */}
      <View style={styles.mobileTopTabs}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.mobileTopTabsScroll}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.key;
            const isAllowed = canAccess(item.key);
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.mobileTabPill,
                  isActive && styles.mobileTabPillActive,
                  !isAllowed && styles.mobileTabPillLocked,
                ]}
                onPress={() => handleNavPress(item.key)}
                activeOpacity={0.7}
              >
                {renderIcon(item, isActive, isAllowed)}
                <Text
                  style={[
                    styles.mobileTabPillText,
                    isActive && styles.mobileTabPillTextActive,
                  ]}
                >
                  {item.shortLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Screen Content */}
      <View style={styles.mobileContentWrapper}>
        {children}
      </View>

      {/* Fixed Bottom Dock Navigation */}
      <View style={styles.mobileBottomDock}>
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = activeScreen === item.key;
          const isAllowed = canAccess(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.bottomDockItem, isActive && styles.bottomDockItemActive]}
              onPress={() => handleNavPress(item.key)}
              activeOpacity={0.7}
            >
              {renderIcon(item, isActive, isAllowed)}
              <Text
                style={[
                  styles.bottomDockLabel,
                  isActive && styles.bottomDockLabelActive,
                ]}
                numberOfLines={1}
              >
                {item.shortLabel}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.bgCanvas,
    overflow: 'hidden',
  },
  sidebar: {
    width: 210,
    backgroundColor: COLORS.surfaceDark,
    borderRightWidth: 1,
    borderRightColor: COLORS.borderDark,
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sidebarNav: {
    gap: 3,
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
  },
  sidebarItemActive: {
    backgroundColor: COLORS.blueMuted,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primaryLight,
  },
  sidebarItemLocked: {
    opacity: 0.5,
  },
  sidebarIconWrap: {
    position: 'relative',
    width: 20,
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: -3,
    right: -5,
    backgroundColor: COLORS.dangerMuted,
    borderRadius: 4,
    padding: 1,
  },
  sidebarItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSub,
    flex: 1,
  },
  sidebarItemTextActive: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  sidebarItemTextLocked: {
    color: COLORS.textMuted,
  },
  countBadge: {
    backgroundColor: COLORS.blue,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  countBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: 'bold',
  },
  sidebarUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  userStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryLight,
  },
  userRoleName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  userRoleStatus: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  desktopContentWrapper: {
    flex: 1,
    backgroundColor: COLORS.bgCanvas,
  },
  mobileContainer: {
    flex: 1,
    backgroundColor: COLORS.bgCanvas,
    overflow: 'hidden',
  },
  mobileTopTabs: {
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    paddingVertical: 6,
  },
  mobileTopTabsScroll: {
    paddingHorizontal: 8,
    gap: 6,
  },
  mobileTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  mobileTabPillActive: {
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight,
  },
  mobileTabPillLocked: {
    opacity: 0.5,
  },
  mobileTabPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSub,
  },
  mobileTabPillTextActive: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  mobileContentWrapper: {
    flex: 1,
  },
  mobileBottomDock: {
    height: 52,
    backgroundColor: COLORS.surfaceDark,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomDockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 3,
  },
  bottomDockItemActive: {
    borderTopWidth: 2,
    borderTopColor: COLORS.primaryLight,
  },
  bottomDockLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bottomDockLabelActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
});
