import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { Header } from './src/components/Header';
import { NavigationLayout } from './src/components/NavigationLayout';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PosScreen } from './src/screens/PosScreen';
import { InventoryScreen } from './src/screens/InventoryScreen';
import { ProcurementScreen } from './src/screens/ProcurementScreen';
import { MarketplaceScreen } from './src/screens/MarketplaceScreen';
import { LogisticsScreen } from './src/screens/LogisticsScreen';
import { FinanceScreen } from './src/screens/FinanceScreen';
import { CommunicationsScreen } from './src/screens/CommunicationsScreen';
import { EnterpriseScreen } from './src/screens/EnterpriseScreen';
import { AiConsultantModal } from './src/components/AiConsultantModal';
import { COLORS } from './src/theme/colors';

const MainAppContent: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();
  const [aiModalVisible, setAiModalVisible] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Dashboard':
        return <DashboardScreen onOpenAiConsultant={() => setAiModalVisible(true)} />;
      case 'POS':
        return <PosScreen />;
      case 'Inventory':
        return <InventoryScreen />;
      case 'Procurement':
        return <ProcurementScreen />;
      case 'Marketplace':
        return <MarketplaceScreen />;
      case 'Logistics':
        return <LogisticsScreen />;
      case 'Finance':
        return <FinanceScreen />;
      case 'Communications':
        return <CommunicationsScreen />;
      case 'Enterprise':
        return <EnterpriseScreen />;
      default:
        return <DashboardScreen onOpenAiConsultant={() => setAiModalVisible(true)} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.surfaceDark} />
      <View style={styles.appShell}>
        <Header
          onOpenAiConsultant={() => setAiModalVisible(true)}
          onOpenNotifications={() => setActiveScreen('Communications')}
        />
        <NavigationLayout>{renderScreen()}</NavigationLayout>
      </View>
      <AiConsultantModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.surfaceDark,
  },
  appShell: {
    flex: 1,
    backgroundColor: COLORS.bgCanvas,
    overflow: 'hidden',
  },
});
