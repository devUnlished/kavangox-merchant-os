import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  UserRole,
  PaymentMethod,
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
  Branch,
  LinkedProductContext,
  LinkedReceiptContext,
  LinkedDeliveryTrackerContext,
} from '../types';
import { AppStorage } from '../database/storage';
import { SEED_BRANCHES } from '../database/seedData';
import { enqueueAction, flushSyncQueue } from '../services/syncQueue';

// RBAC Matrix mapping as specified in Section 6 of BRD / FRD
const RBAC_MODULE_PERMISSIONS: Record<string, UserRole[]> = {
  Dashboard: [
    'Merchant Owner',
    'Executive',
    'Enterprise Administrator',
    'Store Manager',
    'Sales Clerk / Cashier',
    'Procurement Officer',
    'Warehouse Manager',
    'Driver',
    'Finance Officer',
  ],
  POS: [
    'Merchant Owner',
    'Executive',
    'Store Manager',
    'Sales Clerk / Cashier',
  ],
  Inventory: [
    'Merchant Owner',
    'Executive',
    'Store Manager',
    'Procurement Officer',
    'Warehouse Manager',
  ],
  Procurement: [
    'Merchant Owner',
    'Executive',
    'Store Manager',
    'Procurement Officer',
  ],
  Marketplace: [
    'Merchant Owner',
    'Store Manager',
    'Procurement Officer',
  ],
  Logistics: [
    'Merchant Owner',
    'Store Manager',
    'Warehouse Manager',
    'Driver',
  ],
  Finance: [
    'Merchant Owner',
    'Executive',
    'Finance Officer',
  ],
  Communications: [
    'Merchant Owner',
    'Store Manager',
    'Sales Clerk / Cashier',
  ],
  Enterprise: [
    'Merchant Owner',
    'Executive',
    'Enterprise Administrator',
    'Store Manager',
    'Sales Clerk / Cashier',
    'Procurement Officer',
    'Warehouse Manager',
    'Driver',
    'Finance Officer',
  ],
};

export interface CartItem {
  product: Product;
  quantity: number;
}

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  branch: Branch;
  setBranch: (branch: Branch) => void;
  branches: Branch[];
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  products: Product[];
  customers: Customer[];
  receipts: SalesReceipt[];
  transactions: CashTransaction[];
  syncQueue: SyncItem[];
  promotions: PromotionItem[];
  threads: ChatThread[];
  messages: Record<string, ChatMessage[]>;
  consignments: Consignment[];
  drivers: Driver[];
  notifications: AppNotification[];
  tickets: SupportTicket[];
  disputes: DisputeItem[];
  cart: CartItem[];
  isSyncing: boolean;
  canAccess: (module: string, role?: UserRole) => boolean;
  addToCart: (product: Product) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkoutSale: (
    paymentMethod: PaymentMethod,
    customerId?: string,
    discount?: number,
    cashTendered?: number
  ) => Promise<{ success: boolean; receipt?: SalesReceipt; error?: string }>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (product: Product) => Promise<void>;
  adjustStock: (productId: string, delta: number, reason: string, cost?: number) => Promise<void>;
  importCsvProducts: (csvText: string) => Promise<{ imported: number; errors: string[] }>;
  redeemPromotion: (promoId: string) => Promise<boolean>;
  sendChatMessage: (
    threadId: string,
    text: string,
    context?: {
      product?: LinkedProductContext;
      receipt?: LinkedReceiptContext;
      tracker?: LinkedDeliveryTrackerContext;
    }
  ) => Promise<void>;
  savePodSignature: (trackingId: string, signeeName: string, signature: string) => Promise<void>;
  updateConsignmentStatus: (trackingId: string, status: Consignment['status']) => Promise<void>;
  triggerManualSync: () => Promise<{ syncedCount: number }>;
  addCustomer: (cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'outstandingDebt' | 'totalPurchases'>) => Promise<Customer>;
  recordTabRepayment: (customerId: string, amount: number) => Promise<void>;
  createTicket: (ticket: Omit<SupportTicket, 'id' | 'timeCreated' | 'slaTimerMinutes'>) => Promise<void>;
  createDispute: (dispute: Omit<DisputeItem, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('Merchant Owner');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [branch, setBranch] = useState<Branch>(SEED_BRANCHES[0]);
  const [activeScreen, setActiveScreen] = useState<string>('Dashboard');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [receipts, setReceipts] = useState<SalesReceipt[]>([]);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [syncQueue, setSyncQueue] = useState<SyncItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [consignments, setConsignments] = useState<Consignment[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from local storage
  const loadData = async () => {
    await AppStorage.initializeDatabase();
    const [p, c, r, t, sq, pr, th, m, cs, d, n, tk, dp] = await Promise.all([
      AppStorage.getProducts(),
      AppStorage.getCustomers(),
      AppStorage.getReceipts(),
      AppStorage.getTransactions(),
      AppStorage.getSyncQueue(),
      AppStorage.getPromotions(),
      AppStorage.getThreads(),
      AppStorage.getMessages(),
      AppStorage.getConsignments(),
      AppStorage.getDrivers(),
      AppStorage.getNotifications(),
      AppStorage.getTickets(),
      AppStorage.getDisputes(),
    ]);

    setProducts(p);
    setCustomers(c);
    setReceipts(r);
    setTransactions(t);
    setSyncQueue(sq);
    setPromotions(pr);
    setThreads(th);
    setMessages(m);
    setConsignments(cs);
    setDrivers(d);
    setNotifications(n);
    setTickets(tk);
    setDisputes(dp);
  };

  useEffect(() => {
    loadData();
  }, []);

  const canAccess = (module: string, role?: UserRole): boolean => {
    const targetRole = role || userRole;
    const allowedRoles = RBAC_MODULE_PERMISSIONS[module];
    if (!allowedRoles) return true;
    return allowedRoles.includes(targetRole);
  };

  // Cart operations
  const addToCart = (product: Product): { success: boolean; message?: string } => {
    const currentInCart = cart.find((item) => item.product.id === product.id)?.quantity || 0;
    if (currentInCart + 1 > product.stockQty) {
      return { success: false, message: `Only ${product.stockQty} ${product.unit || 'units'} available in stock.` };
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQty = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && quantity > product.stockQty) {
      quantity = product.stockQty;
    }
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Atomic POS checkout
  const checkoutSale = async (
    paymentMethod: PaymentMethod,
    customerId?: string,
    discount = 0,
    cashTendered?: number
  ): Promise<{ success: boolean; receipt?: SalesReceipt; error?: string }> => {
    if (cart.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }

    // Check stock
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.product.id);
      if (!prod || prod.stockQty < item.quantity) {
        return {
          success: false,
          error: `Insufficient stock for ${item.product.name} (Available: ${prod?.stockQty || 0})`,
        };
      }
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
    const totalAmount = Math.max(0, subtotal - discount);

    let customer = customerId ? customers.find((c) => c.id === customerId) : undefined;

    // Check store credit limit if paying by store credit tab
    if (paymentMethod === 'STORE_CREDIT') {
      if (!customer) {
        return { success: false, error: 'Customer must be selected for Store Credit / Tab payment' };
      }
      if (customer.outstandingDebt + totalAmount > customer.creditLimit) {
        return {
          success: false,
          error: `Credit limit exceeded! Customer tab limit: N$${customer.creditLimit.toFixed(2)}, Current debt: N$${customer.outstandingDebt.toFixed(2)}`,
        };
      }
    }

    const receiptId = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const saleItems: SaleItem[] = cart.map((item, idx) => ({
      id: `${receiptId}-item-${idx + 1}`,
      receiptId,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.sellPrice,
      costPrice: item.product.costPrice,
    }));

    const newReceipt: SalesReceipt = {
      id: receiptId,
      customerId: customer?.id,
      customerName: customer?.name,
      sellerName: userRole,
      timeStamp: Date.now(),
      paymentMethod,
      totalAmount,
      discountAmount: discount,
      cashTendered: cashTendered || (paymentMethod === 'CASH' ? totalAmount : undefined),
      changeGiven:
        paymentMethod === 'CASH' && cashTendered && cashTendered > totalAmount
          ? cashTendered - totalAmount
          : 0,
      items: saleItems,
      isSynced: isOnline,
    };

    // 1. Deplete product stock in state and storage
    const updatedProducts = products.map((prod) => {
      const cartItem = cart.find((ci) => ci.product.id === prod.id);
      if (cartItem) {
        return { ...prod, stockQty: Math.max(0, prod.stockQty - cartItem.quantity) };
      }
      return prod;
    });

    // 2. Update customer loyalty points and debt
    let updatedCustomers = [...customers];
    if (customer) {
      const pointsEarned = Math.floor(totalAmount / 10);
      const debtIncrease = paymentMethod === 'STORE_CREDIT' ? totalAmount : 0;
      updatedCustomers = customers.map((c) =>
        c.id === customer.id
          ? {
              ...c,
              loyaltyPoints: c.loyaltyPoints + pointsEarned,
              outstandingDebt: c.outstandingDebt + debtIncrease,
              totalPurchases: c.totalPurchases + totalAmount,
            }
          : c
      );
    }

    // 3. Insert Cash Transaction entry
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      transactionType: 'INCOME',
      category: 'RETAIL_SALE',
      amount: totalAmount,
      description: `POS Sale ${receiptId} (${cart.length} SKUs - ${paymentMethod})`,
      timeStamp: Date.now(),
      referenceId: receiptId,
    };
    const updatedTxs = [newTx, ...transactions];

    // 4. Update receipts
    const updatedReceipts = [newReceipt, ...receipts];

    // 5. Offline Sync Queue handling
    let updatedSyncQueue = [...syncQueue];
    if (!isOnline) {
      const syncItem: SyncItem = {
        id: `sync-${Date.now()}`,
        actionType: 'SYNC_SALE',
        payloadJson: JSON.stringify(newReceipt),
        retryCount: 0,
        timeStamp: Date.now(),
      };
      updatedSyncQueue = [...updatedSyncQueue, syncItem];
      await enqueueAction('POS_SALE', {
        customer_name: customer?.name || 'Walk-in Shopper',
        payment_method: paymentMethod,
        items: saleItems.map((si) => ({
          product_id: si.productId,
          quantity: si.quantity,
          price: si.unitPrice,
        })),
        total: totalAmount,
        local_uuid: receiptId,
      });
    }

    // Check for low stock notification triggers
    const lowStockItems = updatedProducts.filter((p) => p.stockQty <= p.minStockAlert);
    let updatedNotifs = [...notifications];
    if (lowStockItems.length > 0) {
      const lowItem = lowStockItems[0];
      const hasExistingNotif = updatedNotifs.some(
        (n) => n.targetId === lowItem.id && Date.now() - n.timeStamp < 3600000
      );
      if (!hasExistingNotif) {
        const notif: AppNotification = {
          id: `notif-${Date.now()}`,
          title: `Low Stock Alert: ${lowItem.name}`,
          message: `${lowItem.name} has only ${lowItem.stockQty} units remaining (Threshold: ${lowItem.minStockAlert}). Tap to reorder.`,
          timeStamp: Date.now(),
          priority: 'HIGH',
          channel: 'IN_APP',
          isRead: false,
          targetScreen: 'Procurement',
          targetId: lowItem.id,
        };
        updatedNotifs = [notif, ...updatedNotifs];
      }
    }

    // Save all to persistent storage
    await Promise.all([
      AppStorage.saveProducts(updatedProducts),
      AppStorage.saveCustomers(updatedCustomers),
      AppStorage.saveTransactions(updatedTxs),
      AppStorage.saveReceipts(updatedReceipts),
      AppStorage.saveSyncQueue(updatedSyncQueue),
      AppStorage.saveNotifications(updatedNotifs),
    ]);

    setProducts(updatedProducts);
    setCustomers(updatedCustomers);
    setTransactions(updatedTxs);
    setReceipts(updatedReceipts);
    setSyncQueue(updatedSyncQueue);
    setNotifications(updatedNotifs);
    clearCart();

    return { success: true, receipt: newReceipt };
  };

  const addProduct = async (prodData: Omit<Product, 'id'>): Promise<Product> => {
    const newProd: Product = {
      ...prodData,
      id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
    };
    const updated = [newProd, ...products];
    await AppStorage.saveProducts(updated);
    setProducts(updated);

    // Auto-log initial stock purchase expense in cashbook
    if (newProd.stockQty > 0 && newProd.costPrice > 0) {
      const expenseAmount = newProd.stockQty * newProd.costPrice;
      const newTx: CashTransaction = {
        id: `tx-${Date.now()}`,
        transactionType: 'EXPENSE',
        category: 'STOCK_PURCHASE',
        amount: expenseAmount,
        description: `Initial Stock Purchase: ${newProd.name} (${newProd.stockQty} units @ N$${newProd.costPrice})`,
        timeStamp: Date.now(),
        referenceId: newProd.id,
      };
      const updatedTxs = [newTx, ...transactions];
      await AppStorage.saveTransactions(updatedTxs);
      setTransactions(updatedTxs);
    }
    return newProd;
  };

  const updateProduct = async (product: Product) => {
    const updated = products.map((p) => (p.id === product.id ? product : p));
    await AppStorage.saveProducts(updated);
    setProducts(updated);
  };

  const adjustStock = async (productId: string, delta: number, reason: string, cost?: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newQty = Math.max(0, prod.stockQty + delta);
    const updated = products.map((p) => (p.id === productId ? { ...p, stockQty: newQty } : p));
    await AppStorage.saveProducts(updated);
    setProducts(updated);

    if (delta > 0 && cost) {
      const expenseAmount = delta * cost;
      const newTx: CashTransaction = {
        id: `tx-${Date.now()}`,
        transactionType: 'EXPENSE',
        category: 'STOCK_PURCHASE',
        amount: expenseAmount,
        description: `Stock Restock: ${prod.name} (+${delta} units) - ${reason}`,
        timeStamp: Date.now(),
        referenceId: prod.id,
      };
      const updatedTxs = [newTx, ...transactions];
      await AppStorage.saveTransactions(updatedTxs);
      setTransactions(updatedTxs);
    }
  };

  const importCsvProducts = async (csvText: string): Promise<{ imported: number; errors: string[] }> => {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) {
      return { imported: 0, errors: ['CSV is empty or missing data rows.'] };
    }

    const newProducts: Product[] = [];
    const errors: string[] = [];
    let totalExpense = 0;

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length < 6) {
        errors.push(`Row ${i + 1}: Insufficient columns (expected: Name, Barcode, Category, CostPrice, SellPrice, StockQty, [MinAlert], [Supplier])`);
        continue;
      }

      const [name, barcode, category, costStr, sellStr, stockStr, minAlertStr, supplierName] = cols;
      const costPrice = parseFloat(costStr) || 0;
      const sellPrice = parseFloat(sellStr) || 0;
      const stockQty = parseInt(stockStr, 10) || 0;
      const minStockAlert = parseInt(minAlertStr, 10) || 10;

      if (!name || sellPrice <= 0) {
        errors.push(`Row ${i + 1}: Invalid product name or selling price`);
        continue;
      }

      const id = `PRD-CSV-${Date.now().toString().slice(-4)}-${i}`;
      newProducts.push({
        id,
        name,
        barcode: barcode || `600100${Math.floor(1000000 + Math.random() * 9000000)}`,
        category: category || 'General FMCG',
        costPrice,
        sellPrice,
        stockQty,
        minStockAlert,
        supplierId: 'sup-bulk',
        supplierName: supplierName || 'Wholesale Ingestion',
        unit: 'Unit',
      });

      if (stockQty > 0 && costPrice > 0) {
        totalExpense += stockQty * costPrice;
      }
    }

    if (newProducts.length > 0) {
      const mergedProducts = [...newProducts, ...products];
      await AppStorage.saveProducts(mergedProducts);
      setProducts(mergedProducts);

      if (totalExpense > 0) {
        const newTx: CashTransaction = {
          id: `tx-${Date.now()}`,
          transactionType: 'EXPENSE',
          category: 'STOCK_PURCHASE',
          amount: totalExpense,
          description: `Bulk CSV Stock Ingestion (${newProducts.length} items)`,
          timeStamp: Date.now(),
        };
        const updatedTxs = [newTx, ...transactions];
        await AppStorage.saveTransactions(updatedTxs);
        setTransactions(updatedTxs);
      }
    }

    return { imported: newProducts.length, errors };
  };

  const redeemPromotion = async (promoId: string): Promise<boolean> => {
    const promo = promotions.find((p) => p.id === promoId);
    if (!promo || promo.isRedeemed) return false;

    // 1. Mark promotion redeemed
    const updatedPromos = promotions.map((p) =>
      p.id === promoId ? { ...p, isRedeemed: true } : p
    );

    // 2. Add stock to inventory
    const updatedProducts = products.map((p) => {
      if (p.id === promo.productId) {
        return { ...p, stockQty: p.stockQty + promo.minOrderQty };
      }
      return p;
    });

    // 3. Log Expense in Cashbook
    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      transactionType: 'EXPENSE',
      category: 'STOCK_PURCHASE',
      amount: promo.promoPrice,
      description: `Redeemed Promotion: ${promo.title} from ${promo.supplierName}`,
      timeStamp: Date.now(),
      referenceId: promo.id,
    };

    // 4. Post message to supplier chat
    const threadKey = 'th-sup-nm';
    const newChatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: threadKey,
      senderId: 'me',
      senderName: `${userRole} (Procurement)`,
      messageText: `Claimed Promotion Deal: "${promo.title}" for N$${promo.promoPrice.toFixed(2)}. Please schedule dispatch.`,
      timeStamp: Date.now(),
      isRead: true,
      status: 'DELIVERED',
      linkedProduct: promo.productId
        ? {
            id: promo.productId,
            name: promo.title,
            sellPrice: promo.promoPrice,
            stockQty: promo.minOrderQty,
          }
        : undefined,
    };

    const threadMsgs = messages[threadKey] || [];
    const updatedMessages = {
      ...messages,
      [threadKey]: [...threadMsgs, newChatMsg],
    };

    // 5. Notification
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Wholesale Deal Ordered',
      message: `Successfully redeemed "${promo.title}". Inventory updated with +${promo.minOrderQty} units.`,
      timeStamp: Date.now(),
      priority: 'MEDIUM',
      channel: 'IN_APP',
      isRead: false,
      targetScreen: 'Inventory',
    };

    await Promise.all([
      AppStorage.savePromotions(updatedPromos),
      AppStorage.saveProducts(updatedProducts),
      AppStorage.saveTransactions([newTx, ...transactions]),
      AppStorage.saveMessages(updatedMessages),
      AppStorage.saveNotifications([notif, ...notifications]),
    ]);

    setPromotions(updatedPromos);
    setProducts(updatedProducts);
    setTransactions([newTx, ...transactions]);
    setMessages(updatedMessages);
    setNotifications([notif, ...notifications]);

    return true;
  };

  const sendChatMessage = async (
    threadId: string,
    text: string,
    context?: {
      product?: LinkedProductContext;
      receipt?: LinkedReceiptContext;
      tracker?: LinkedDeliveryTrackerContext;
    }
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId,
      senderId: 'me',
      senderName: userRole,
      messageText: text,
      timeStamp: Date.now(),
      isRead: true,
      status: isOnline ? 'DELIVERED' : 'QUEUED',
      linkedProduct: context?.product,
      linkedReceipt: context?.receipt,
      linkedDeliveryTracker: context?.tracker,
    };

    const threadMsgs = messages[threadId] || [];
    const updatedMessages = {
      ...messages,
      [threadId]: [...threadMsgs, newMsg],
    };

    const updatedThreads = threads.map((th) =>
      th.id === threadId ? { ...th, lastMessage: text, time: 'Just now' } : th
    );

    let updatedSyncQueue = [...syncQueue];
    if (!isOnline) {
      updatedSyncQueue.push({
        id: `sync-msg-${Date.now()}`,
        actionType: 'SYNC_MESSAGE',
        payloadJson: JSON.stringify(newMsg),
        retryCount: 0,
        timeStamp: Date.now(),
      });
    }

    await Promise.all([
      AppStorage.saveMessages(updatedMessages),
      AppStorage.saveThreads(updatedThreads),
      AppStorage.saveSyncQueue(updatedSyncQueue),
    ]);

    setMessages(updatedMessages);
    setThreads(updatedThreads);
    setSyncQueue(updatedSyncQueue);
  };

  const savePodSignature = async (trackingId: string, signeeName: string, signature: string) => {
    const updatedConsignments = consignments.map((c) =>
      c.trackingId === trackingId
        ? {
            ...c,
            status: 'DELIVERED' as const,
            podSignature: signature,
            podSigneeName: signeeName,
            podSignedAt: new Date().toLocaleTimeString(),
            waypoints: c.waypoints.map((w) => ({ ...w, status: 'COMPLETED' as const })),
          }
        : c
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: `Proof of Delivery Verified: ${trackingId}`,
      message: `Cargo received and signed off by ${signeeName}. Status marked DELIVERED.`,
      timeStamp: Date.now(),
      priority: 'HIGH',
      channel: 'IN_APP',
      isRead: false,
      targetScreen: 'Logistics',
      targetId: trackingId,
    };

    await Promise.all([
      AppStorage.saveConsignments(updatedConsignments),
      AppStorage.saveNotifications([notif, ...notifications]),
    ]);

    setConsignments(updatedConsignments);
    setNotifications([notif, ...notifications]);
  };

  const updateConsignmentStatus = async (trackingId: string, status: Consignment['status']) => {
    const updated = consignments.map((c) => (c.trackingId === trackingId ? { ...c, status } : c));
    await AppStorage.saveConsignments(updated);
    setConsignments(updated);
  };

  const triggerManualSync = async (): Promise<{ syncedCount: number }> => {
    setIsSyncing(true);
    const count = syncQueue.length;

    try {
      if (isOnline) {
        await flushSyncQueue();
      }
    } catch {
      // Handled in flushSyncQueue
    }

    const updatedReceipts = receipts.map((r) => ({ ...r, isSynced: true }));
    await Promise.all([
      AppStorage.saveReceipts(updatedReceipts),
      AppStorage.saveSyncQueue([]),
    ]);

    setReceipts(updatedReceipts);
    setSyncQueue([]);
    setIsSyncing(false);

    return { syncedCount: count };
  };

  const addCustomer = async (
    cust: Omit<Customer, 'id' | 'loyaltyPoints' | 'outstandingDebt' | 'totalPurchases'>
  ): Promise<Customer> => {
    const newCust: Customer = {
      ...cust,
      id: `c-${Math.floor(100 + Math.random() * 900)}`,
      loyaltyPoints: 0,
      outstandingDebt: 0,
      totalPurchases: 0,
    };
    const updated = [newCust, ...customers];
    await AppStorage.saveCustomers(updated);
    setCustomers(updated);
    return newCust;
  };

  const recordTabRepayment = async (customerId: string, amount: number) => {
    const customer = customers.find((c) => c.id === customerId);
    if (!customer) return;

    const newDebt = Math.max(0, customer.outstandingDebt - amount);
    const updatedCustomers = customers.map((c) =>
      c.id === customerId ? { ...c, outstandingDebt: newDebt } : c
    );

    const newTx: CashTransaction = {
      id: `tx-${Date.now()}`,
      transactionType: 'INCOME',
      category: 'RETAIL_SALE',
      amount,
      description: `Customer Credit Tab Repayment: ${customer.name}`,
      timeStamp: Date.now(),
      referenceId: customerId,
    };

    await Promise.all([
      AppStorage.saveCustomers(updatedCustomers),
      AppStorage.saveTransactions([newTx, ...transactions]),
    ]);

    setCustomers(updatedCustomers);
    setTransactions([newTx, ...transactions]);
  };

  const createTicket = async (ticket: Omit<SupportTicket, 'id' | 'timeCreated' | 'slaTimerMinutes'>) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      timeCreated: new Date().toLocaleString(),
      slaTimerMinutes: 60,
    };
    const updated = [newTicket, ...tickets];
    await AppStorage.saveTickets(updated);
    setTickets(updated);
  };

  const createDispute = async (dispute: Omit<DisputeItem, 'id' | 'createdAt'>) => {
    const newDispute: DisputeItem = {
      ...dispute,
      id: `DSP-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = [newDispute, ...disputes];
    await AppStorage.saveDisputes(updated);
    setDisputes(updated);
  };

  const markNotificationRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await AppStorage.saveNotifications(updated);
    setNotifications(updated);
  };

  const resetAllData = async () => {
    await AppStorage.resetAllData();
    await loadData();
    setCart([]);
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        isOnline,
        setIsOnline,
        branch,
        setBranch,
        branches: SEED_BRANCHES,
        activeScreen,
        setActiveScreen,
        products,
        customers,
        receipts,
        transactions,
        syncQueue,
        promotions,
        threads,
        messages,
        consignments,
        drivers,
        notifications,
        tickets,
        disputes,
        cart,
        isSyncing,
        canAccess,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        checkoutSale,
        addProduct,
        updateProduct,
        adjustStock,
        importCsvProducts,
        redeemPromotion,
        sendChatMessage,
        savePodSignature,
        updateConsignmentStatus,
        triggerManualSync,
        addCustomer,
        recordTabRepayment,
        createTicket,
        createDispute,
        markNotificationRead,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
