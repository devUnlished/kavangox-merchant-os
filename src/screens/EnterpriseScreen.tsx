import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { UserRole } from '../types';
import { SEED_STAFF } from '../database/seedData';

const ROLES_ORDER: UserRole[] = [
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

const MODULE_COLUMNS = [
  { key: 'Dashboard', label: 'Dash' },
  { key: 'POS', label: 'POS' },
  { key: 'Inventory', label: 'Stock' },
  { key: 'Procurement', label: 'Procure' },
  { key: 'Marketplace', label: 'Market' },
  { key: 'Logistics', label: 'Fleet' },
  { key: 'Finance', label: 'Finance' },
  { key: 'Communications', label: 'Comms' },
  { key: 'Enterprise', label: 'Admin' },
];

export const EnterpriseScreen: React.FC = () => {
  const { userRole, setUserRole, branch, setBranch, branches, canAccess } = useApp();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerSub}>GOVERNANCE & TRUST OS</Text>
          <Text style={styles.headerTitle}>Enterprise Directory & RBAC Matrix</Text>
          <Text style={styles.headerDesc}>
            9-Tier Role-Based Access Control matrix and multi-branch infrastructure.
          </Text>
        </View>

        {/* Current Role Switcher Pill Bar */}
        <View style={styles.roleCard}>
          <Text style={styles.sectionLabel}>ACTIVE TERMINAL ROLE</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roleScroll}
          >
            {ROLES_ORDER.map((r) => {
              const isSelected = userRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.rolePill, isSelected && styles.rolePillActive]}
                  onPress={() => setUserRole(r)}
                >
                  <Text style={[styles.rolePillText, isSelected && styles.rolePillTextActive]}>
                    {r}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 9-Tier RBAC Authorization Matrix */}
        <View style={styles.matrixCard}>
          <Text style={styles.sectionLabel}>RBAC ACCESS MATRIX</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header Row */}
              <View style={styles.matrixHeaderRow}>
                <Text style={[styles.matrixHeaderCell, { width: 140 }]}>Role</Text>
                {MODULE_COLUMNS.map((m) => (
                  <Text key={m.key} style={[styles.matrixHeaderCell, { width: 55 }]}>
                    {m.label}
                  </Text>
                ))}
              </View>

              {/* Rows */}
              {ROLES_ORDER.map((role) => {
                const isCurrent = userRole === role;

                return (
                  <View key={role} style={[styles.matrixRow, isCurrent && styles.matrixRowCurrent]}>
                    <Text
                      style={[styles.matrixRoleCell, isCurrent && { color: COLORS.blueLight, fontWeight: '700' }]}
                      numberOfLines={1}
                    >
                      {role}
                    </Text>

                    {MODULE_COLUMNS.map((col) => {
                      const hasAccess = canAccess(col.key, role);
                      return (
                        <View key={col.key} style={styles.matrixCell}>
                          <Feather
                            name={hasAccess ? 'check' : 'x'}
                            size={12}
                            color={hasAccess ? COLORS.primaryLight : COLORS.textMuted + '44'}
                          />
                        </View>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Branch Operations Network */}
        <View style={styles.branchCard}>
          <Text style={styles.sectionLabel}>REGIONAL STORE NETWORK</Text>
          <View style={styles.branchGrid}>
            {branches.map((b) => {
              const isSelected = branch.id === b.id;

              return (
                <TouchableOpacity
                  key={b.id}
                  style={[styles.branchItem, isSelected && styles.branchItemActive]}
                  onPress={() => setBranch(b)}
                  activeOpacity={0.7}
                >
                  <View style={styles.branchIconBox}>
                    <Ionicons
                      name="business"
                      size={16}
                      color={isSelected ? COLORS.primaryLight : COLORS.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.branchTitle}>{b.name}</Text>
                    <Text style={styles.branchSub}>{b.region} Region • {b.code}</Text>
                  </View>
                  {isSelected && <Feather name="check" size={14} color={COLORS.primaryLight} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Staff Team Directory */}
        <View style={styles.staffCard}>
          <Text style={styles.sectionLabel}>STORE STAFF ROSTER</Text>
          <View style={styles.staffList}>
            {SEED_STAFF.map((s) => (
              <View key={s.id} style={styles.staffItem}>
                <View style={styles.staffAvatar}>
                  <Text style={styles.staffAvatarText}>{s.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.staffName}>{s.name}</Text>
                  <Text style={styles.staffRole}>{s.role} • {s.branchId}</Text>
                </View>
                <Text style={styles.staffPhone}>{s.phone}</Text>
              </View>
            ))}
          </View>
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
    marginBottom: 6,
  },
  roleCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  roleScroll: {
    gap: 6,
  },
  rolePill: {
    backgroundColor: COLORS.surfaceDarkElevated,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  rolePillActive: {
    backgroundColor: COLORS.blueMuted,
    borderColor: COLORS.blueLight,
  },
  rolePillText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  rolePillTextActive: {
    color: COLORS.blueLight,
    fontWeight: '700',
  },
  matrixCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  matrixHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark,
    paddingBottom: 6,
    marginBottom: 4,
  },
  matrixHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDark + '33',
  },
  matrixRowCurrent: {
    backgroundColor: COLORS.blueMuted,
    borderRadius: 4,
  },
  matrixRoleCell: {
    width: 140,
    fontSize: 11,
    color: COLORS.textLight,
    paddingHorizontal: 4,
  },
  matrixCell: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  branchGrid: {
    gap: 6,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  branchItemActive: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryMuted,
  },
  branchIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: COLORS.bgDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  branchSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  staffCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  staffList: {
    gap: 6,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 8,
    padding: 8,
  },
  staffAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 11,
  },
  staffName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  staffRole: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  staffPhone: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
});
