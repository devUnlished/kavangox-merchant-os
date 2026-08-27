import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface BulkCsvModalProps {
  visible: boolean;
  onClose: () => void;
  onImport: (csvText: string) => Promise<{ imported: number; errors: string[] }>;
}

const SAMPLE_CSV = `Name,Barcode,Category,CostPrice,SellPrice,StockQty,MinAlert,Supplier
Bakpro White Bread Flour 10kg,6001002000019,Staples & Grains,95.00,129.95,30,10,Bokomo Namibia Ltd
Tafel Radler 330ml 6-Pack,6001002000026,Beverages,58.00,79.99,24,12,Namibia Breweries Ltd
Real Good Chicken Frozen 1.5kg,6001002000033,Meat & Chilled,64.00,88.50,18,8,Meatco Namibia
Ellis Brown Coffee Creamer 500g,6001002000040,Beverages,36.50,49.99,40,15,Unilever SADC
Geisha Beauty Soap 175g,6001002000057,Household,8.50,12.50,60,20,Unilever SADC`;

export const BulkCsvModal: React.FC<BulkCsvModalProps> = ({ visible, onClose, onImport }) => {
  const [csvContent, setCsvContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLoadSample = () => {
    setCsvContent(SAMPLE_CSV);
    setResultMsg(null);
  };

  const handleExecuteImport = async () => {
    if (!csvContent.trim()) {
      setResultMsg({ type: 'error', text: 'Please paste or type CSV lines first.' });
      return;
    }

    setIsProcessing(true);
    setResultMsg(null);
    try {
      const res = await onImport(csvContent);
      if (res.imported > 0) {
        setResultMsg({
          type: 'success',
          text: `Successfully ingested ${res.imported} new products into inventory and logged stock expenses in Cashbook.`,
        });
        setTimeout(() => {
          onClose();
          setCsvContent('');
          setResultMsg(null);
        }, 1800);
      } else {
        setResultMsg({
          type: 'error',
          text: res.errors.join('\n') || 'Failed to parse CSV format.',
        });
      }
    } catch {
      setResultMsg({ type: 'error', text: 'An error occurred during ingestion.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <MaterialCommunityIcons name="file-delimited-outline" size={24} color={COLORS.primaryLight} />
              <Text style={styles.title}>Bulk CSV Stock Ingestion</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.desc}>
            Quickly bulk-import product catalogs and initial batches via comma-separated values.
          </Text>

          <View style={styles.sampleBar}>
            <Text style={styles.formatGuide}>
              Format: Name, Barcode, Category, Cost, Sell, Stock, MinAlert, Supplier
            </Text>
            <TouchableOpacity style={styles.sampleBtn} onPress={handleLoadSample}>
              <Feather name="download" size={13} color={COLORS.accent} />
              <Text style={styles.sampleBtnText}>Load Sample CSV</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={10}
            placeholder="Paste CSV contents here..."
            placeholderTextColor={COLORS.textMuted}
            value={csvContent}
            onChangeText={(t) => {
              setCsvContent(t);
              setResultMsg(null);
            }}
          />

          {resultMsg ? (
            <View
              style={[
                styles.resultBox,
                resultMsg.type === 'success' ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Ionicons
                name={resultMsg.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                size={18}
                color={resultMsg.type === 'success' ? COLORS.success : COLORS.danger}
              />
              <Text
                style={[
                  styles.resultText,
                  { color: resultMsg.type === 'success' ? COLORS.success : COLORS.danger },
                ]}
              >
                {resultMsg.text}
              </Text>
            </View>
          ) : null}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.importBtn}
              onPress={handleExecuteImport}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <MaterialCommunityIcons name="database-import" size={18} color={COLORS.white} />
                  <Text style={styles.importBtnText}>Ingest & Post to Ledger</Text>
                </>
              )}
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
    maxWidth: 520,
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
    marginBottom: 8,
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
  desc: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  sampleBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceDarkElevated,
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
  },
  formatGuide: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 6,
  },
  sampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.accentMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sampleBtnText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  textArea: {
    height: 180,
    backgroundColor: '#070C15',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDark,
    padding: 12,
    color: COLORS.textLight,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlignVertical: 'top',
  },
  resultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
  },
  resultSuccess: {
    backgroundColor: COLORS.successMuted,
    borderColor: COLORS.success,
  },
  resultError: {
    backgroundColor: COLORS.dangerMuted,
    borderColor: COLORS.danger,
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
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
  importBtn: {
    flex: 2,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  importBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13,
  },
});
