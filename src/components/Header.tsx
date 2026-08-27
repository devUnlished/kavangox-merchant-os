import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenAiConsultant?: () => void;
  onOpenNotifications?: () => void;
}

const ALL_ROLES: UserRole[] = [
  'Merchant Owner',
  'Executive',
  'Enterprise Administrator',
  'Store Manager',
  'Sales Clerk / Cashier',
  'Procurement Officer',
  'Warehouse Manager',
  'Driver',
  'Finance Officer',
];

export const Header: React.FC<HeaderProps> = ({ onOpenAiConsultant, onOpenNotifications }) => {
  const {
    userRole,
    setUserRole,
    isOnline,
    setIsOnline,
    branch,
    setBranch,
    branches,
    syncQueue,
    isSyncing,
    triggerManualSync,
    notifications,
  } = useApp();

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<'ROLE' | 'BRANCH'>('ROLE');

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  const handleSyncPress = async () => {
    if (!isSyncing && syncQueue.length > 0) {
      await triggerManualSync();
    }
  };

  return (
    <View style={styles.container}>
      {/* Left: Brand Identity & Current Store */}
      <View style={styles.leftBrand}>
        <View style={styles.brandIconBox}>
          <Text style={styles.brandIconText}>KX</Text>
        </View>

        <View style={styles.brandTextGroup}>
          <View style={styles.brandTitleRow}>
            <Text style={styles.brandTitle}>KavangoX</Text>
            <View style={styles.osBadge}>
              <Text style={styles.osBadgeText}>OS</Text>
            </View>
          </View>
          <Text style={styles.branchSubText} numberOfLines={1}>
            {branch.name.split(' ')[0]} Hub
          </Text>
        </View>
      </View>

      {/* Right: Clean, Uncluttered Action Bar */}
      <View style={styles.rightActions}>
        {/* Network & Sync Status Dot */}
        <TouchableOpacity
          style={[
            styles.networkBadge,
            isOnline ? styles.networkOnline : styles.networkOffline,
          ]}
          onPress={() => setIsOnline(!isOnline)}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.networkDot,
              { backgroundColor: isOnline ? COLORS.success : COLORS.danger },
            ]}
          />
          <Text
            style={[
              styles.networkText,
              { color: isOnline ? COLORS.success : COLORS.danger },
            ]}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </TouchableOpacity>

        {/* Sync Indicator (Shows when items pending) */}
        {syncQueue.length > 0 && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={handleSyncPress}
            disabled={isSyncing}
            activeOpacity={0.7}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={COLORS.primaryLight} />
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-sync" size={14} color={COLORS.blueLight} />
                <Text style={styles.syncBadgeCount}>{syncQueue.length}</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* AI Advisor Shortcut */}
        {onOpenAiConsultant && (
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={onOpenAiConsultant}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="creation" size={16} color={COLORS.primaryLight} />
          </TouchableOpacity>
        )}

        {/* Notification Bell */}
        {onOpenNotifications && (
          <TouchableOpacity
            style={styles.actionIconButton}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={16} color={COLORS.textSub} />
            {unreadNotifsCount > 0 && (
              <View style={styles.notifCountBadge}>
                <Text style={styles.notifCountText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Clean Profile & Role Menu Pill */}
        <TouchableOpacity
          style={styles.profileMenuPill}
          onPress={() => setSettingsModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {userRole.split(' ')[0].charAt(0)}
            </Text>
          </View>
          <Text style={styles.profileRoleText} numberOfLines={1}>
            {userRole.split(' ')[0]}
          </Text>
          <Feather name="chevron-down" size={12} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Unified Terminal Settings & Role Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            {/* Modal Top */}
            <View style={styles.modalTopHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialCommunityIcons name="cog-outline" size={20} color={COLORS.primaryLight} />
                <Text style={styles.modalMainTitle}>Terminal Controls</Text>
              </View>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Feather name="x" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Offline Simulator Switcher Inside Modal */}
            <View style={styles.modalNetworkCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalNetworkLabel}>Connectivity Mode</Text>
                <Text style={styles.modalNetworkSub}>
                  {isOnline
                    ? 'Connected to SADC Core Cloud • Sync Active'
                    : 'Offline Mode Simulated • Changes Queued Locally'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.modalToggleBtn,
                  isOnline ? styles.modalToggleOnline : styles.modalToggleOffline,
                ]}
                onPress={() => setIsOnline(!isOnline)}
              >
                <Text style={[styles.modalToggleText, { color: isOnline ? COLORS.success : COLORS.danger }]}>
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tabs for Role vs Branch */}
            <View style={styles.modalTabSwitcher}>
              <TouchableOpacity
                style={[styles.modalTabBtn, activeSettingsTab === 'ROLE' && styles.modalTabBtnActive]}
                onPress={() => setActiveSettingsTab('ROLE')}
              >
                <Text style={[styles.modalTabText, activeSettingsTab === 'ROLE' && styles.modalTabTextActive]}>
                  Switch Role ({userRole})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalTabBtn, activeSettingsTab === 'BRANCH' && styles.modalTabBtnActive]}
                onPress={() => setActiveSettingsTab('BRANCH')}
              >
                <Text style={[styles.modalTabText, activeSettingsTab === 'BRANCH' && styles.modalTabTextActive]}>
                  Switch Branch
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab 1: Roles List */}
            {activeSettingsTab === 'ROLE' && (
              <ScrollView style={styles.optionsScroll}>
                {ALL_ROLES.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.optionRow,
                      userRole === r && styles.optionRowSelected,
                    ]}
                    onPress={() => {
                      setUserRole(r);
                      setSettingsModalVisible(false);
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <MaterialCommunityIcons
                        name="shield-account-outline"
                        size={16}
                        color={userRole === r ? COLORS.blueLight : COLORS.textMuted}
                      />
                      <Text
                        style={[
                          styles.optionName,
                          userRole === r && styles.optionNameSelected,
                        ]}
                      >
                        {r}
                      </Text>
                    </View>
                    {userRole === r && (
                      <Feather name="check" size={16} color={COLORS.primaryLight} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Tab 2: Branches List */}
            {activeSettingsTab === 'BRANCH' && (
              <ScrollView style={styles.optionsScroll}>
                {branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.optionRow,
                      branch.id === b.id && styles.optionRowSelected,
                    ]}
                    onPress={() => {
                      setBranch(b);
                      setSettingsModalVisible(false);
                    }}
                  >
                    <View style={styles.optionLeft}>
                      <Ionicons
                        name="business-outline"
                        size={16}
                        color={branch.id === b.id ? COLORS.primaryLight : COLORS.textMuted}
                      />
                      <View style={{ marginLeft: 8 }}>
                        <Text
                          style={[
                            styles.optionName,
                            branch.id === b.id && styles.optionNameSelected,
                          ]}
                        >
                          {b.name}
                        </Text>
                        <Text style={styles.optionSub}>{b.region} Region • {b.code}</Text>
                      </View>
                    </View>
                    {branch.id === b.id && (
                      <Feather name="check" size={16} color={COLORS.primaryLight} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 52,
    backgroundColor: COLORS.surfaceDark,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  leftBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 8,
  },
  brandIconBox: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 13,
  },
  brandTextGroup: {
    justifyContent: 'center',
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    color: COLORS.textLight,
    fontWeight: '800',
    fontSize: 14,
  },
  osBadge: {
    backgroundColor: COLORS.blueMuted,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  osBadgeText: {
    color: COLORS.blueLight,
    fontSize: 8,
    fontWeight: '800',
  },
  branchSubText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  networkOnline: {
    backgroundColor: COLORS.successMuted,
    borderColor: COLORS.success + '44',
  },
  networkOffline: {
    backgroundColor: COLORS.dangerMuted,
    borderColor: COLORS.danger + '44',
  },
  networkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight + '44',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  syncBadgeCount: {
    color: COLORS.blueLight,
    fontSize: 9,
    fontWeight: '800',
  },
  actionIconButton: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceDarkElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    position: 'relative',
  },
  notifCountBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: COLORS.danger,
    borderRadius: 6,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  notifCountText: {
    color: COLORS.white,
    fontSize: 8,
    fontWeight: 'bold',
  },
  profileMenuPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    maxWidth: 130,
  },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileRoleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
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
    maxHeight: '80%',
  },
  modalTopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  modalMainTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  modalNetworkCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: 12,
  },
  modalNetworkLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  modalNetworkSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  modalToggleOnline: {
    backgroundColor: COLORS.successMuted,
    borderColor: COLORS.success,
  },
  modalToggleOffline: {
    backgroundColor: COLORS.dangerMuted,
    borderColor: COLORS.danger,
  },
  modalToggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modalTabSwitcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 2,
    marginBottom: 10,
    gap: 4,
  },
  modalTabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 5,
  },
  modalTabBtnActive: {
    backgroundColor: COLORS.surfaceDark,
  },
  modalTabText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  modalTabTextActive: {
    color: COLORS.textLight,
    fontWeight: '700',
  },
  optionsScroll: {
    maxHeight: 250,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  optionRowSelected: {
    borderColor: COLORS.blueLight,
    backgroundColor: COLORS.blueMuted,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  optionNameSelected: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
