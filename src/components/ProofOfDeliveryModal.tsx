import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  PanResponder,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { Consignment } from '../types';

interface ProofOfDeliveryModalProps {
  visible: boolean;
  consignment: Consignment | null;
  onClose: () => void;
  onSign: (trackingId: string, signeeName: string, signatureSvg: string) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({
  visible,
  consignment,
  onClose,
  onSign,
}) => {
  const [signeeName, setSigneeName] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath((prev) => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths((prev) => [...prev, currentPath]);
        setCurrentPath('');
      }
    },
  });

  if (!consignment) return null;

  const handleClearSignature = () => {
    setPaths([]);
    setCurrentPath('');
  };

  const handleConfirmSignature = () => {
    if (!signeeName.trim()) {
      setErrorMsg('Please enter the recipient / receiver name.');
      return;
    }
    if (paths.length === 0 && !currentPath) {
      setErrorMsg('Please provide a valid signature in the box.');
      return;
    }

    const fullSvg = [...paths, currentPath].filter(Boolean).join(' ');
    onSign(consignment.trackingId, signeeName.trim(), fullSvg);
    handleClearSignature();
    setSigneeName('');
    setErrorMsg('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="draw" size={24} color={COLORS.primaryLight} />
              <Text style={styles.title}>Proof of Delivery (POD)</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Consignment Info */}
          <View style={styles.consignmentInfo}>
            <Text style={styles.consignTracking}>Consignment #{consignment.trackingId}</Text>
            <Text style={styles.consignCargo}>{consignment.cargoDescription}</Text>
            <Text style={styles.consignRoute}>
              {consignment.origin} ➔ {consignment.destination}
            </Text>
          </View>

          {/* Signee Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Recipient / Store Manager Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Meme Hilma Petrus"
              placeholderTextColor={COLORS.textMuted}
              value={signeeName}
              onChangeText={(t) => {
                setSigneeName(t);
                setErrorMsg('');
              }}
            />
          </View>

          {/* Signature Canvas Pad */}
          <View style={styles.padHeader}>
            <Text style={styles.label}>Receiver Digital Signature</Text>
            <TouchableOpacity onPress={handleClearSignature}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
            <Svg style={StyleSheet.absoluteFill}>
              {paths.map((p, idx) => (
                <Path key={idx} d={p} stroke={COLORS.primaryLight} strokeWidth={3} fill="none" />
              ))}
              {currentPath ? (
                <Path d={currentPath} stroke={COLORS.primaryLight} strokeWidth={3} fill="none" />
              ) : null}
            </Svg>
            {paths.length === 0 && !currentPath && (
              <View style={styles.placeholderContainer} pointerEvents="none">
                <Feather name="edit-3" size={28} color={COLORS.textMuted + '66'} />
                <Text style={styles.placeholderText}>Sign with finger or stylus here</Text>
              </View>
            )}
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Confirmation Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSignature}>
              <Feather name="check-circle" size={18} color={COLORS.white} />
              <Text style={styles.confirmBtnText}>Verify & Mark Delivered</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  consignmentInfo: {
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    marginBottom: 12,
  },
  consignTracking: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accent,
  },
  consignCargo: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: 2,
  },
  consignRoute: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 44,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    paddingHorizontal: 12,
    color: COLORS.textLight,
    fontSize: 14,
  },
  padHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  clearText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  canvasWrapper: {
    height: 160,
    backgroundColor: '#070C15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    position: 'relative',
    overflow: 'hidden',
  },
  placeholderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: COLORS.textMuted + '88',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.dangerMuted,
    padding: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.surfaceDarkElevated,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: '700',
    fontSize: 13,
  },
  confirmBtn: {
    flex: 2,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
