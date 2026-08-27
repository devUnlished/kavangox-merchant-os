import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../context/AppContext';
import { COLORS } from '../theme/colors';
import { Product } from '../types';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScan: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  visible,
  onClose,
  onScan,
}) => {
  const { products } = useApp();
  const [manualBarcode, setManualBarcode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleBarcodeSubmit = (codeToSearch?: string) => {
    const code = (codeToSearch || manualBarcode).trim();
    if (!code) return;

    const matched = products.find(
      (p) => p.barcode.toLowerCase() === code.toLowerCase() || p.id.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      setErrorMsg('');
      setManualBarcode('');
      onScan(matched);
      onClose();
    } else {
      setErrorMsg(`No SKU matched barcode: "${code}"`);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="barcode-scan" size={24} color={COLORS.primaryLight} />
              <Text style={styles.title}>SKU Barcode Scanner</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Scanner Viewfinder Simulation */}
          <View style={styles.viewfinderContainer}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.laserLine} />
              <MaterialCommunityIcons name="camera-iris" size={32} color={COLORS.primaryLight + '88'} />
              <Text style={styles.viewfinderHint}>Align barcode within the crosshairs</Text>
            </View>
          </View>

          {/* Error Message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="warning-outline" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Hardware Scanner / Manual Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Hardware Scanner / Manual Barcode</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 6001001000012 or scan gun..."
                placeholderTextColor={COLORS.textMuted}
                value={manualBarcode}
                onChangeText={(t) => {
                  setManualBarcode(t);
                  setErrorMsg('');
                }}
                onSubmitEditing={() => handleBarcodeSubmit()}
                autoFocus
              />
              <TouchableOpacity
                style={styles.scanBtn}
                onPress={() => handleBarcodeSubmit()}
                activeOpacity={0.7}
              >
                <Feather name="check" size={18} color={COLORS.white} />
                <Text style={styles.scanBtnText}>Lookup</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Simulation Barcodes */}
          <Text style={styles.quickLabel}>1-Tap Simulated Hardware Scan:</Text>
          <ScrollView style={styles.presetList} showsVerticalScrollIndicator={false}>
            {products.slice(0, 5).map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.presetItem}
                onPress={() => handleBarcodeSubmit(prod.barcode)}
                activeOpacity={0.7}
              >
                <View style={styles.presetInfo}>
                  <Text style={styles.presetName} numberOfLines={1}>
                    {prod.name}
                  </Text>
                  <Text style={styles.presetBarcode}>
                    {prod.barcode} • Stock: {prod.stockQty} {prod.unit}
                  </Text>
                </View>
                <View style={styles.presetPriceBadge}>
                  <Text style={styles.presetPrice}>N${prod.sellPrice.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  closeBtn: {
    padding: 4,
  },
  viewfinderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  viewfinder: {
    width: '100%',
    height: 140,
    backgroundColor: '#070C15',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  laserLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: COLORS.danger,
    opacity: 0.8,
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
  },
  viewfinderHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: COLORS.primaryLight,
  },
  cornerTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
  errorBox: {
    backgroundColor: COLORS.dangerMuted,
    borderWidth: 1,
    borderColor: COLORS.danger,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  inputSection: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  scanBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  quickLabel: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetList: {
    maxHeight: 150,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  presetInfo: {
    flex: 1,
    marginRight: 8,
  },
  presetName: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  presetBarcode: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  presetPriceBadge: {
    backgroundColor: COLORS.primaryMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  presetPrice: {
    color: COLORS.primaryLight,
    fontWeight: '800',
    fontSize: 12,
  },
});
