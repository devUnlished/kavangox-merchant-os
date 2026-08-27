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
import Svg, { Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { Consignment, Driver } from '../types';
import { ProofOfDeliveryModal } from '../components/ProofOfDeliveryModal';

export const LogisticsScreen: React.FC = () => {
  const { consignments, drivers, savePodSignature } = useApp();
  const [selectedConsignment, setSelectedConsignment] = useState<Consignment>(consignments[0]);
  const [podModalVisible, setPodModalVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageInner}>
        {/* Banner */}
        <View style={styles.headerCard}>
          <Text style={styles.headerSub}>SADC CORRIDOR DISPATCH</Text>
          <Text style={styles.headerTitle}>Fleet & Cargo Logistics</Text>
          <Text style={styles.headerDesc}>
            Track cross-regional freight from Walvis Bay Port to Northern distribution hubs.
          </Text>
        </View>

        {/* Consignment Selection Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.consignScroll}
        >
          {consignments.map((c) => {
            const isSelected = selectedConsignment?.trackingId === c.trackingId;
            const isDelivered = c.status === 'DELIVERED';
            return (
              <TouchableOpacity
                key={c.trackingId}
                style={[styles.consignTab, isSelected && styles.consignTabSelected]}
                onPress={() => setSelectedConsignment(c)}
              >
                <View style={styles.consignTabTop}>
                  <Text style={[styles.consignTabId, isSelected && { color: COLORS.blueLight }]}>
                    #{c.trackingId}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      isDelivered ? styles.statusDelivered : styles.statusTransit,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isDelivered ? { color: COLORS.primaryLight } : { color: COLORS.blueLight },
                      ]}
                    >
                      {c.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <Text style={styles.consignTabDesc} numberOfLines={1}>
                  {c.cargoDescription}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Consignment Detail & Live Waypoints */}
        {selectedConsignment && (
          <View style={styles.detailCard}>
            <View style={styles.detailTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailTitle}>{selectedConsignment.cargoDescription}</Text>
                <Text style={styles.detailRoute}>{selectedConsignment.origin} ➔ {selectedConsignment.destination}</Text>
              </View>
              <View style={styles.etaBadge}>
                <Text style={styles.etaLabel}>ETA</Text>
                <Text style={styles.etaVal}>{selectedConsignment.eta}</Text>
              </View>
            </View>

            {/* Assigned Driver Box */}
            <View style={styles.driverBox}>
              <MaterialCommunityIcons name="steering" size={18} color={COLORS.blueLight} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.driverName}>{selectedConsignment.driverName}</Text>
                <Text style={styles.driverPlate}>Plate: {selectedConsignment.vehiclePlate} • {selectedConsignment.driverPhone}</Text>
              </View>
            </View>

            {/* Waypoints Timeline */}
            <Text style={styles.timelineHeader}>GPS Waypoint Route Progression</Text>
            <View style={styles.timelineList}>
              {selectedConsignment.waypoints.map((wp, idx) => {
                const isLast = idx === selectedConsignment.waypoints.length - 1;
                const isDone = wp.status === 'COMPLETED';
                const isInTransit = wp.status === 'IN_TRANSIT';

                return (
                  <View key={idx} style={styles.timelineRow}>
                    <View style={styles.markerColumn}>
                      <View
                        style={[
                          styles.markerCircle,
                          isDone
                            ? styles.markerDone
                            : isInTransit
                            ? styles.markerTransit
                            : styles.markerPending,
                        ]}
                      >
                        {isDone && <Feather name="check" size={8} color={COLORS.white} />}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.timelineBar,
                            isDone ? styles.barDone : styles.barPending,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.wpTitleRow}>
                        <Text
                          style={[
                            styles.wpName,
                            isInTransit && { color: COLORS.blueLight, fontWeight: '800' },
                          ]}
                        >
                          {wp.name}
                        </Text>
                        {wp.timestamp && (
                          <Text style={styles.wpTime}>{wp.timestamp}</Text>
                        )}
                      </View>
                      <Text style={styles.wpHub}>{wp.hub}</Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Proof of Delivery (POD) Area */}
            <View style={styles.podContainer}>
              <Text style={styles.podTitle}>Proof of Delivery (POD)</Text>
              {selectedConsignment.status === 'DELIVERED' && selectedConsignment.podSignature ? (
                <View style={styles.podDoneBox}>
                  <View style={styles.podDoneHeader}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryLight} />
                    <Text style={styles.podDoneTitle}>Delivery Verified & Signed</Text>
                  </View>
                  <Text style={styles.podDoneSub}>
                    Signed by {selectedConsignment.podSigneeName || 'Store Manager'} at {selectedConsignment.podSignedAt || '12:00 PM'}
                  </Text>
                  <View style={styles.sigBox}>
                    <Svg width="100%" height={60} viewBox="0 0 300 60">
                      <Path
                        d={selectedConsignment.podSignature}
                        stroke={COLORS.primaryLight}
                        strokeWidth={2.5}
                        fill="none"
                      />
                    </Svg>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.signPodBtn}
                  onPress={() => setPodModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="draw" size={16} color={COLORS.white} />
                  <Text style={styles.signPodBtnText}>Sign Proof of Delivery</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Drivers Directory */}
        <Text style={[styles.sectionLabel, { marginTop: 10 }]}>FLEET PERSONNEL</Text>
        <View style={styles.driversList}>
          {drivers.map((drv) => (
            <View key={drv.id} style={styles.driverCard}>
              <View style={styles.drvRowTop}>
                <View>
                  <Text style={styles.drvNameText}>{drv.name}</Text>
                  <Text style={styles.drvVehicleText}>{drv.vehiclePlate}</Text>
                </View>
                <View
                  style={[
                    styles.drvPill,
                    drv.status === 'ON_ROUTE' ? styles.drvPillRoute : styles.drvPillReady,
                  ]}
                >
                  <Text
                    style={[
                      styles.drvPillText,
                      drv.status === 'ON_ROUTE' ? { color: COLORS.blueLight } : { color: COLORS.primaryLight },
                    ]}
                  >
                    {drv.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <View style={styles.drvRowBottom}>
                <Text style={styles.drvPhoneText}>{drv.phone}</Text>
                <View style={styles.drvRate}>
                  <Ionicons name="star" size={11} color={COLORS.gold} />
                  <Text style={styles.drvRateText}>{drv.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Proof of Delivery Interactive Modal */}
      <ProofOfDeliveryModal
        visible={podModalVisible}
        consignment={selectedConsignment}
        onClose={() => setPodModalVisible(false)}
        onSign={savePodSignature}
      />
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
  consignScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  consignTab: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    width: 200,
  },
  consignTabSelected: {
    borderColor: COLORS.blueLight,
    backgroundColor: COLORS.surfaceDarkElevated,
  },
  consignTabTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  consignTabId: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  statusPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusTransit: {
    backgroundColor: COLORS.blueMuted,
  },
  statusDelivered: {
    backgroundColor: COLORS.primaryMuted,
  },
  statusPillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  consignTabDesc: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  detailCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    gap: 8,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  detailRoute: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  etaBadge: {
    backgroundColor: COLORS.surfaceDarkElevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  etaVal: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.blueLight,
  },
  driverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
  },
  driverName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  driverPlate: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  timelineHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  timelineList: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 38,
  },
  markerColumn: {
    alignItems: 'center',
    width: 20,
    marginRight: 8,
  },
  markerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDone: {
    backgroundColor: COLORS.primary,
  },
  markerTransit: {
    backgroundColor: COLORS.blue,
  },
  markerPending: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  timelineBar: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  barDone: {
    backgroundColor: COLORS.primary,
  },
  barPending: {
    backgroundColor: COLORS.borderDark,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 6,
  },
  wpTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wpName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  wpTime: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  wpHub: {
    fontSize: 9,
    color: COLORS.textMuted,
  },
  podContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 8,
  },
  podTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 6,
  },
  podDoneBox: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 6,
    padding: 8,
  },
  podDoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  podDoneTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  podDoneSub: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sigBox: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 4,
    padding: 4,
    marginTop: 6,
  },
  signPodBtn: {
    backgroundColor: COLORS.blue,
    borderRadius: 6,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  signPodBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },
  driversList: {
    gap: 6,
  },
  driverCard: {
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  drvRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drvNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  drvVehicleText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  drvPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  drvPillRoute: {
    backgroundColor: COLORS.blueMuted,
  },
  drvPillReady: {
    backgroundColor: COLORS.primaryMuted,
  },
  drvPillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  drvRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderDark,
    paddingTop: 4,
  },
  drvPhoneText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  drvRate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  drvRateText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.gold,
  },
});
