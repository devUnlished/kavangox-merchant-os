import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Product,
  Customer,
  SalesReceipt,
  SaleItem,
  CashTransaction,
  SyncItem,
  PromotionItem,
  ChatThread,
  ChatMessage,
  SupportTicket,
  DisputeItem,
  Consignment,
  Driver,
  AppNotification,
  PaymentMethod,
} from '../types';
import {
  SEED_PRODUCTS,
  SEED_CUSTOMERS,
  SEED_TRANSACTIONS,
  SEED_PROMOTIONS,
  SEED_THREADS,
  SEED_MESSAGES,
  SEED_CONSIGNMENTS,
  SEED_DRIVERS,
  SEED_NOTIFICATIONS,
  SEED_TICKETS,
  SEED_DISPUTES,
} from './seedData';

const KEYS = {
  PRODUCTS: '@kavangox_products',
  RECEIPTS: '@kavangox_receipts',
  CUSTOMERS: '@kavangox_customers',
  TRANSACTIONS: '@kavangox_transactions',
  SYNC_QUEUE: '@kavangox_sync_queue',
  PROMOTIONS: '@kavangox_promotions',
  THREADS: '@kavangox_threads',
  MESSAGES: '@kavangox_messages',
  CONSIGNMENTS: '@kavangox_consignments',
  DRIVERS: '@kavangox_drivers',
  NOTIFICATIONS: '@kavangox_notifications',
  TICKETS: '@kavangox_tickets',
  DISPUTES: '@kavangox_disputes',
  INITIALIZED: '@kavangox_initialized_v1',
};

export class AppStorage {
  static async initializeDatabase(): Promise<void> {
    try {
      const isInit = await AsyncStorage.getItem(KEYS.INITIALIZED);
      if (!isInit) {
        await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
        await AsyncStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
        await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(SEED_TRANSACTIONS));
        await AsyncStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(SEED_PROMOTIONS));
        await AsyncStorage.setItem(KEYS.THREADS, JSON.stringify(SEED_THREADS));
        await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
        await AsyncStorage.setItem(KEYS.CONSIGNMENTS, JSON.stringify(SEED_CONSIGNMENTS));
        await AsyncStorage.setItem(KEYS.DRIVERS, JSON.stringify(SEED_DRIVERS));
        await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
        await AsyncStorage.setItem(KEYS.TICKETS, JSON.stringify(SEED_TICKETS));
        await AsyncStorage.setItem(KEYS.DISPUTES, JSON.stringify(SEED_DISPUTES));
        await AsyncStorage.setItem(KEYS.RECEIPTS, JSON.stringify([]));
        await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify([]));
        await AsyncStorage.setItem(KEYS.INITIALIZED, 'true');
      }
    } catch (e) {
      console.error('Failed to initialize local storage', e);
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PRODUCTS);
      return data ? JSON.parse(data) : SEED_PRODUCTS;
    } catch {
      return SEED_PRODUCTS;
    }
  }

  static async saveProducts(products: Product[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products', e);
    }
  }

  static async getCustomers(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : SEED_CUSTOMERS;
    } catch {
      return SEED_CUSTOMERS;
    }
  }

  static async saveCustomers(customers: Customer[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }

  static async getReceipts(): Promise<SalesReceipt[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.RECEIPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async saveReceipts(receipts: SalesReceipt[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.RECEIPTS, JSON.stringify(receipts));
    } catch (e) {
      console.error('Failed to save receipts', e);
    }
  }

  static async getTransactions(): Promise<CashTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : SEED_TRANSACTIONS;
    } catch {
      return SEED_TRANSACTIONS;
    }
  }

  static async saveTransactions(txs: CashTransaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }

  static async getSyncQueue(): Promise<SyncItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SYNC_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async saveSyncQueue(queue: SyncItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SYNC_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save sync queue', e);
    }
  }

  static async getPromotions(): Promise<PromotionItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.PROMOTIONS);
      return data ? JSON.parse(data) : SEED_PROMOTIONS;
    } catch {
      return SEED_PROMOTIONS;
    }
  }

  static async savePromotions(promos: PromotionItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.PROMOTIONS, JSON.stringify(promos));
    } catch (e) {
      console.error('Failed to save promotions', e);
    }
  }

  static async getThreads(): Promise<ChatThread[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.THREADS);
      return data ? JSON.parse(data) : SEED_THREADS;
    } catch {
      return SEED_THREADS;
    }
  }

  static async saveThreads(threads: ChatThread[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.THREADS, JSON.stringify(threads));
    } catch (e) {
      console.error('Failed to save chat threads', e);
    }
  }

  static async getMessages(): Promise<Record<string, ChatMessage[]>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MESSAGES);
      return data ? JSON.parse(data) : SEED_MESSAGES;
    } catch {
      return SEED_MESSAGES;
    }
  }

  static async saveMessages(messages: Record<string, ChatMessage[]>): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages', e);
    }
  }

  static async getConsignments(): Promise<Consignment[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONSIGNMENTS);
      return data ? JSON.parse(data) : SEED_CONSIGNMENTS;
    } catch {
      return SEED_CONSIGNMENTS;
    }
  }

  static async saveConsignments(consignments: Consignment[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CONSIGNMENTS, JSON.stringify(consignments));
    } catch (e) {
      console.error('Failed to save consignments', e);
    }
  }

  static async getDrivers(): Promise<Driver[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DRIVERS);
      return data ? JSON.parse(data) : SEED_DRIVERS;
    } catch {
      return SEED_DRIVERS;
    }
  }

  static async saveDrivers(drivers: Driver[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.DRIVERS, JSON.stringify(drivers));
    } catch (e) {
      console.error('Failed to save drivers', e);
    }
  }

  static async getNotifications(): Promise<AppNotification[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : SEED_NOTIFICATIONS;
    } catch {
      return SEED_NOTIFICATIONS;
    }
  }

  static async saveNotifications(notifs: AppNotification[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }

  static async getTickets(): Promise<SupportTicket[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TICKETS);
      return data ? JSON.parse(data) : SEED_TICKETS;
    } catch {
      return SEED_TICKETS;
    }
  }

  static async saveTickets(tickets: SupportTicket[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error('Failed to save tickets', e);
    }
  }

  static async getDisputes(): Promise<DisputeItem[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.DISPUTES);
      return data ? JSON.parse(data) : SEED_DISPUTES;
    } catch {
      return SEED_DISPUTES;
    }
  }

  static async saveDisputes(disputes: DisputeItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.DISPUTES, JSON.stringify(disputes));
    } catch (e) {
      console.error('Failed to save disputes', e);
    }
  }

  static async resetAllData(): Promise<void> {
    await AsyncStorage.clear();
    await this.initializeDatabase();
  }
}
