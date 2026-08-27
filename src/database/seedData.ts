import {
  Product,
  Customer,
  CashTransaction,
  PromotionItem,
  ChatThread,
  ChatMessage,
  SupportTicket,
  DisputeItem,
  Driver,
  Consignment,
  Supplier,
  Branch,
  StaffMember,
  AppNotification
} from '../types';

export const SEED_BRANCHES: Branch[] = [
  { id: 'b-whk-1', name: 'Windhoek Central SuperStore', code: 'WHK-01', region: 'Khomas', isMain: true, address: 'Independence Ave & Post St Mall, Windhoek' },
  { id: 'b-osh-2', name: 'Oshakati Regional Hub', code: 'OSH-02', region: 'Oshana', isMain: false, address: 'Main Road, Oshakati CBD' },
  { id: 'b-run-3', name: 'Rundu River Depot', code: 'RUN-03', region: 'Kavango East', isMain: false, address: 'Kavango Commercial Center, Rundu' },
  { id: 'b-wvb-4', name: 'Walvis Bay Port Logistics Store', code: 'WVB-04', region: 'Erongo', isMain: false, address: '14th Road Industrial Area, Walvis Bay' },
];

export const SEED_STAFF: StaffMember[] = [
  { id: 'st-01', name: 'Tate Silas Amutenya', email: 'owner@kavangox.na', role: 'Merchant Owner', phone: '+264 81 234 5678', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-02', name: 'Meme Ndapewa Shilongo', email: 'manager@kavangox.na', role: 'Store Manager', phone: '+264 81 987 6543', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-03', name: 'Johannes Shikongo', email: 'cashier@kavangox.na', role: 'Sales Clerk / Cashier', phone: '+264 81 555 1234', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-04', name: 'Martha Hamukwaya', email: 'procure@kavangox.na', role: 'Procurement Officer', phone: '+264 81 444 8899', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-05', name: 'Festus Negumbo', email: 'warehouse@kavangox.na', role: 'Warehouse Manager', phone: '+264 81 333 7711', branchId: 'b-run-3', status: 'ACTIVE' },
  { id: 'st-06', name: 'Gabriel Alweendo', email: 'driver1@kavangox.na', role: 'Driver', phone: '+264 81 777 9900', branchId: 'b-wvb-4', status: 'ACTIVE' },
  { id: 'st-07', name: 'Elifas Kanyemba', email: 'finance@kavangox.na', role: 'Finance Officer', phone: '+264 81 222 3344', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-08', name: 'Helena Haingura', email: 'exec@kavangox.na', role: 'Executive', phone: '+264 81 111 2233', branchId: 'b-whk-1', status: 'ACTIVE' },
  { id: 'st-09', name: 'Petrus Angula', email: 'admin@kavangox.na', role: 'Enterprise Administrator', phone: '+264 81 999 8877', branchId: 'b-whk-1', status: 'ACTIVE' },
];

export const SEED_SUPPLIERS: Supplier[] = [
  { id: 'sup-nm', name: 'Namib Mills Distribution', code: 'SUP-NM', category: 'Grains & Baking', region: 'Windhoek & National', phone: '+264 61 290 1000', email: 'orders@namibmills.com.na', leadTimeDays: 2, minOrderValue: 2500, rating: 4.9, catalogCount: 48 },
  { id: 'sup-nbl', name: 'Namibia Breweries Ltd (NBL)', code: 'SUP-NBL', category: 'Beverages & Liquors', region: 'Windhoek Northern Ind.', phone: '+264 61 329 1111', email: 'trade@nbl.com.na', leadTimeDays: 1, minOrderValue: 4000, rating: 4.8, catalogCount: 35 },
  { id: 'sup-bok', name: 'Bokomo Namibia Ltd', code: 'SUP-BOK', category: 'Flour, Pasta & Cereals', region: 'Brakwater Depot', phone: '+264 61 261 371', email: 'sales@bokomo.com.na', leadTimeDays: 2, minOrderValue: 1800, rating: 4.7, catalogCount: 29 },
  { id: 'sup-meat', name: 'Meatco Namibia Cold Chain', code: 'SUP-MTC', category: 'Fresh Meats & Processed', region: 'Okapuka / Windhoek', phone: '+264 61 321 6400', email: 'wholesale@meatco.com.na', leadTimeDays: 1, minOrderValue: 3500, rating: 4.9, catalogCount: 22 },
  { id: 'sup-unil', name: 'Unilever SADC FMCG Depot', code: 'SUP-UNI', category: 'Household & Personal Care', region: 'Southern Africa Regional', phone: '+264 61 249 820', email: 'namibia.orders@unilever.com', leadTimeDays: 4, minOrderValue: 5000, rating: 4.6, catalogCount: 84 },
];

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'PRD-001',
    barcode: '6001001000012',
    name: 'Top Score Super Maize Meal 10kg',
    category: 'Staples & Grains',
    costPrice: 85.50,
    sellPrice: 119.99,
    stockQty: 42,
    minStockAlert: 15,
    supplierId: 'sup-nm',
    supplierName: 'Namib Mills Distribution',
    unit: '10kg Bag',
  },
  {
    id: 'PRD-002',
    barcode: '6001001000029',
    name: 'Bokomo Vetkoek Wheat Flour 5kg',
    category: 'Staples & Grains',
    costPrice: 62.00,
    sellPrice: 84.95,
    stockQty: 28,
    minStockAlert: 10,
    supplierId: 'sup-bok',
    supplierName: 'Bokomo Namibia Ltd',
    unit: '5kg Bag',
  },
  {
    id: 'PRD-003',
    barcode: '6001001000036',
    name: 'Windhoek Lager 330ml 6-Pack (Cans)',
    category: 'Beverages',
    costPrice: 68.00,
    sellPrice: 94.50,
    stockQty: 54,
    minStockAlert: 20,
    supplierId: 'sup-nbl',
    supplierName: 'Namibia Breweries Ltd',
    unit: '6-Pack',
  },
  {
    id: 'PRD-004',
    barcode: '6001001000043',
    name: 'Tafel Lager 500ml Can',
    category: 'Beverages',
    costPrice: 13.50,
    sellPrice: 19.90,
    stockQty: 9, // Low stock on purpose
    minStockAlert: 24,
    supplierId: 'sup-nbl',
    supplierName: 'Namibia Breweries Ltd',
    unit: '500ml Can',
  },
  {
    id: 'PRD-005',
    barcode: '6001001000050',
    name: 'Marathon Pure White Sugar 2kg',
    category: 'Staples & Grains',
    costPrice: 28.20,
    sellPrice: 38.99,
    stockQty: 65,
    minStockAlert: 20,
    supplierId: 'sup-nm',
    supplierName: 'Namib Mills Distribution',
    unit: '2kg Pack',
  },
  {
    id: 'PRD-006',
    barcode: '6001001000067',
    name: 'Meatco Choice Beef Stewing Cuts 1kg',
    category: 'Meat & Chilled',
    costPrice: 72.00,
    sellPrice: 98.00,
    stockQty: 18,
    minStockAlert: 10,
    supplierId: 'sup-meat',
    supplierName: 'Meatco Namibia Cold Chain',
    unit: '1kg Tray',
  },
  {
    id: 'PRD-007',
    barcode: '6001001000074',
    name: 'Clover Full Cream Fresh Milk 2L',
    category: 'Dairy & Eggs',
    costPrice: 26.50,
    sellPrice: 34.99,
    stockQty: 6, // Critical low stock
    minStockAlert: 12,
    supplierId: 'sup-unil',
    supplierName: 'Unilever SADC FMCG',
    unit: '2L Bottle',
  },
  {
    id: 'PRD-008',
    barcode: '6001001000081',
    name: 'Sunlight Dishwashing Liquid 750ml',
    category: 'Household',
    costPrice: 22.00,
    sellPrice: 31.50,
    stockQty: 34,
    minStockAlert: 12,
    supplierId: 'sup-unil',
    supplierName: 'Unilever SADC FMCG',
    unit: '750ml Bottle',
  },
  {
    id: 'PRD-009',
    barcode: '6001001000098',
    name: 'Nescafe Ricoffy Granules 250g',
    category: 'Beverages',
    costPrice: 33.00,
    sellPrice: 46.99,
    stockQty: 25,
    minStockAlert: 8,
    supplierId: 'sup-unil',
    supplierName: 'Unilever SADC FMCG',
    unit: '250g Tin',
  },
  {
    id: 'PRD-010',
    barcode: '6001001000104',
    name: 'Colgate Triple Action Toothpaste 100ml',
    category: 'Household',
    costPrice: 12.00,
    sellPrice: 17.50,
    stockQty: 48,
    minStockAlert: 15,
    supplierId: 'sup-unil',
    supplierName: 'Unilever SADC FMCG',
    unit: '100ml Tube',
  }
];

export const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c-101',
    name: 'Meme Hilma Petrus (Kavango Tuckshop)',
    phone: '+264 81 332 9911',
    email: 'hilma.tuck@gmail.com',
    loyaltyPoints: 340,
    outstandingDebt: 450.00, // Active informal credit tab
    creditLimit: 1500.00,
    totalPurchases: 6850.00,
  },
  {
    id: 'c-102',
    name: 'Tate David Nekongo (Ondangwa Spaza)',
    phone: '+264 81 776 5432',
    email: 'nekongo.stores@iway.na',
    loyaltyPoints: 580,
    outstandingDebt: 0.00,
    creditLimit: 2500.00,
    totalPurchases: 12400.00,
  },
  {
    id: 'c-103',
    name: 'Katutura Community Bakery',
    phone: '+264 81 441 2233',
    email: 'orders@katuturabakery.na',
    loyaltyPoints: 920,
    outstandingDebt: 820.00,
    creditLimit: 3000.00,
    totalPurchases: 18900.00,
  },
  {
    id: 'c-104',
    name: 'Walk-in Retail Shopper',
    phone: '+264 81 000 0000',
    loyaltyPoints: 15,
    outstandingDebt: 0.00,
    creditLimit: 0.00,
    totalPurchases: 320.00,
  }
];

export const SEED_TRANSACTIONS: CashTransaction[] = [
  { id: 'tx-001', transactionType: 'INCOME', category: 'RETAIL_SALE', amount: 840.50, description: 'POS Sale REC-10023 (Top Score & Marathon Sugar)', timeStamp: Date.now() - 3600000 * 24 * 3 },
  { id: 'tx-002', transactionType: 'EXPENSE', category: 'STOCK_PURCHASE', amount: 3200.00, description: 'Restock PO-991 Namib Mills Bulk Delivery', timeStamp: Date.now() - 3600000 * 24 * 2.5 },
  { id: 'tx-003', transactionType: 'INCOME', category: 'RETAIL_SALE', amount: 1450.00, description: 'POS Sale REC-10024 (Beverages & Dairy)', timeStamp: Date.now() - 3600000 * 24 * 2 },
  { id: 'tx-004', transactionType: 'EXPENSE', category: 'UTILITIES', amount: 650.00, description: 'City of Windhoek Electricity Prepaid Meter', timeStamp: Date.now() - 3600000 * 24 * 1.5 },
  { id: 'tx-005', transactionType: 'INCOME', category: 'RETAIL_SALE', amount: 2150.00, description: 'POS Sale REC-10025 (Wholesale Flour to Bakery)', timeStamp: Date.now() - 3600000 * 24 * 1 },
  { id: 'tx-006', transactionType: 'EXPENSE', category: 'LOGISTICS_FEE', amount: 350.00, description: 'NamPost Courier Freight Otjiwarongo Dispatch', timeStamp: Date.now() - 3600000 * 12 },
  { id: 'tx-007', transactionType: 'INCOME', category: 'RETAIL_SALE', amount: 980.00, description: 'POS Morning Cash Register Inflow', timeStamp: Date.now() - 3600000 * 3 },
];

export const SEED_PROMOTIONS: PromotionItem[] = [
  {
    id: 'prom-01',
    supplierName: 'Namib Mills Distribution',
    supplierLogo: '🌾',
    category: 'Wholesale',
    campaignType: 'Bulk Deals',
    location: 'Windhoek Central Depot',
    title: 'Top Score 10kg Pallet Special (50 Bags)',
    description: 'Procure 50+ units of Top Score 10kg at N$76.50/unit instead of N$85.50. Free regional drop-off in Khomas & Otjozondjupa.',
    originalPrice: 4275.00,
    promoPrice: 3825.00,
    validityPeriod: 'Expires in 3 days',
    isSaved: true,
    engagementLikes: 42,
    engagementViews: 310,
    isRedeemed: false,
    minOrderQty: 50,
    productId: 'PRD-001'
  },
  {
    id: 'prom-02',
    supplierName: 'Namibia Breweries Ltd (NBL)',
    supplierLogo: '🍺',
    campaignType: 'Flash Sales',
    category: 'Bulk',
    location: 'Northern Distribution Center (Oshakati)',
    title: 'Windhoek Lager 24-Can Case Flash Discount',
    description: 'Get 15% instant margin rebate on bulk orders of 20+ cases. Includes point-of-sale merchandise cooler display.',
    originalPrice: 360.00,
    promoPrice: 299.00,
    validityPeriod: '24 Hours Only',
    isSaved: false,
    engagementLikes: 88,
    engagementViews: 650,
    isRedeemed: false,
    minOrderQty: 10,
    productId: 'PRD-003'
  },
  {
    id: 'prom-03',
    supplierName: 'Bokomo Namibia Ltd',
    supplierLogo: '🥖',
    campaignType: 'Bundles',
    category: 'Wholesale',
    location: 'Brakwater Depot',
    title: 'Bakery Essential Kit: 10x Flour 5kg + 5x Sugar 2kg',
    description: 'Specially assembled for commercial tuckshops & bakeries with guaranteed 28% retail margin.',
    originalPrice: 760.00,
    promoPrice: 620.00,
    validityPeriod: 'Active this Week',
    isSaved: false,
    engagementLikes: 19,
    engagementViews: 140,
    isRedeemed: false,
    minOrderQty: 1,
    productId: 'PRD-002'
  }
];

export const SEED_THREADS: ChatThread[] = [
  {
    id: 'th-sup-nm',
    participantName: 'Namib Mills Supply Logistics',
    participantRole: 'Supplier',
    participantLogo: '🌾',
    lastMessage: 'Truck #N-848-WHK dispatched with 50 bags Top Score. ETA 14:30.',
    time: '11:15 AM',
    unreadCount: 1,
    phone: '+264 61 290 1000'
  },
  {
    id: 'th-drv-01',
    participantName: 'Gabriel Alweendo (Fleet Driver)',
    participantRole: 'Logistics',
    participantLogo: '🚚',
    lastMessage: 'Arrived at Okahandja waypoint. Refueling before Rundu leg.',
    time: '10:45 AM',
    unreadCount: 0,
    phone: '+264 81 777 9900'
  },
  {
    id: 'th-sup-nbl',
    participantName: 'NBL Trade Desk (Otjiwarongo)',
    participantRole: 'Supplier',
    participantLogo: '🍺',
    lastMessage: 'Your PO-993 for Tafel Lager has been acknowledged and booked.',
    time: 'Yesterday',
    unreadCount: 0,
    phone: '+264 61 329 1111'
  },
  {
    id: 'th-sup-help',
    participantName: 'KavangoX Tech & Payment Support',
    participantRole: 'Support',
    participantLogo: '🛡️',
    lastMessage: 'Ticket TCK-1092 resolved: Offline sync queue reconciled successfully.',
    time: '2 days ago',
    unreadCount: 0,
    phone: '+264 81 123 0000'
  }
];

export const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  'th-sup-nm': [
    {
      id: 'm-01',
      threadId: 'th-sup-nm',
      senderId: 'them',
      senderName: 'Namib Mills Supply Logistics',
      messageText: 'Good morning KavangoX store team. We have received your purchase order for Top Score 10kg.',
      timeStamp: Date.now() - 3600000 * 4,
      isRead: true,
      status: 'DELIVERED',
      linkedProduct: {
        id: 'PRD-001',
        name: 'Top Score Super Maize Meal 10kg',
        sellPrice: 119.99,
        stockQty: 42
      }
    },
    {
      id: 'm-02',
      threadId: 'th-sup-nm',
      senderId: 'me',
      senderName: 'Martha Hamukwaya (Procurement)',
      messageText: 'Confirmed. Please ensure the consignment includes invoice #REC-10023 for tax clearance.',
      timeStamp: Date.now() - 3600000 * 3,
      isRead: true,
      status: 'DELIVERED',
      linkedReceipt: {
        id: 'REC-10023',
        totalAmount: 840.50,
        timeStamp: Date.now() - 3600000 * 24 * 3,
        paymentMethod: 'BANK_TRANSFER'
      }
    },
    {
      id: 'm-03',
      threadId: 'th-sup-nm',
      senderId: 'them',
      senderName: 'Namib Mills Supply Logistics',
      messageText: 'Truck #N-848-WHK dispatched with 50 bags Top Score. ETA 14:30.',
      timeStamp: Date.now() - 3600000 * 1,
      isRead: false,
      status: 'DELIVERED',
      linkedDeliveryTracker: {
        trackingId: 'TRK-NA-9042',
        origin: 'Windhoek Mill Depot',
        destination: 'Rundu River Store Hub',
        status: 'IN_TRANSIT'
      }
    }
  ]
};

export const SEED_CONSIGNMENTS: Consignment[] = [
  {
    trackingId: 'TRK-NA-9042',
    origin: 'Windhoek Mill Depot (Khomas)',
    destination: 'Rundu River Store Hub (Kavango)',
    driverId: 'drv-01',
    driverName: 'Gabriel Alweendo',
    driverPhone: '+264 81 777 9900',
    vehiclePlate: 'N 848-912 W',
    cargoDescription: '50x Top Score 10kg Bags + 20x Bokomo Flour 5kg',
    status: 'IN_TRANSIT',
    eta: 'Today, 14:30',
    waypoints: [
      { name: 'Windhoek Main Dispatch', hub: 'Khomas Hub', status: 'COMPLETED', timestamp: '06:00 AM', latitude: -22.5609, longitude: 17.0658 },
      { name: 'Okahandja Logistics Toll', hub: 'Otjozondjupa Gate', status: 'COMPLETED', timestamp: '08:15 AM', latitude: -21.9833, longitude: 16.9167 },
      { name: 'Otjiwarongo Fuel & Audit Stop', hub: 'Central North Node', status: 'IN_TRANSIT', timestamp: '10:45 AM', latitude: -20.4637, longitude: 16.6558 },
      { name: 'Grootfontein Junction Depot', hub: 'Trans-Caprivi Gateway', status: 'PENDING', latitude: -19.5600, longitude: 18.1167 },
      { name: 'Rundu River Store Hub', hub: 'Kavango East Terminal', status: 'PENDING', latitude: -17.9333, longitude: 19.7667 }
    ]
  },
  {
    trackingId: 'TRK-NA-8810',
    origin: 'Walvis Bay Port Depot (Erongo)',
    destination: 'Windhoek Central Store',
    driverId: 'drv-02',
    driverName: 'Festus Negumbo',
    driverPhone: '+264 81 333 7711',
    vehiclePlate: 'N 102-441 WB',
    cargoDescription: '100x Unilever Household Detergent Bundles',
    status: 'OUT_FOR_DELIVERY',
    eta: 'Today, 12:00',
    waypoints: [
      { name: 'Walvis Bay Container Terminal', hub: 'Port Port 1', status: 'COMPLETED', timestamp: '04:00 AM', latitude: -22.9575, longitude: 14.5053 },
      { name: 'Swakopmund B2 Checkpoint', hub: 'Coastal Highway', status: 'COMPLETED', timestamp: '05:30 AM', latitude: -22.6842, longitude: 14.5333 },
      { name: 'Usakos Trans-Kalahari Pass', hub: 'Interior Node', status: 'COMPLETED', timestamp: '08:00 AM', latitude: -22.0000, longitude: 15.6000 },
      { name: 'Windhoek Central SuperStore', hub: 'Khomas Terminal', status: 'IN_TRANSIT', timestamp: '11:15 AM', latitude: -22.5609, longitude: 17.0658 }
    ]
  }
];

export const SEED_DRIVERS: Driver[] = [
  { id: 'drv-01', name: 'Gabriel Alweendo', phone: '+264 81 777 9900', vehiclePlate: 'N 848-912 W (Scania 8T)', status: 'ON_ROUTE', rating: 4.9, activeConsignmentId: 'TRK-NA-9042' },
  { id: 'drv-02', name: 'Festus Negumbo', phone: '+264 81 333 7711', vehiclePlate: 'N 102-441 WB (Isuzu 4T)', status: 'ON_ROUTE', rating: 4.8, activeConsignmentId: 'TRK-NA-8810' },
  { id: 'drv-03', name: 'Lukas Mbidi', phone: '+264 81 665 4422', vehiclePlate: 'N 450-991 O (Hino 5T)', status: 'AVAILABLE', rating: 4.7 }
];

export const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Low Stock Alert: Tafel Lager & Clover Milk',
    message: 'Tafel Lager (9 cans) and Clover 2L Milk (6 units) have dropped below safety thresholds. Tap to initiate RFQ.',
    timeStamp: Date.now() - 3600000 * 2,
    priority: 'HIGH',
    channel: 'IN_APP',
    isRead: false,
    targetScreen: 'Inventory'
  },
  {
    id: 'notif-2',
    title: 'New Supplier Promotion: Namib Mills',
    message: 'Top Score 10kg Pallet Deal active: N$3,825 for 50 bags (Save N$450).',
    timeStamp: Date.now() - 3600000 * 6,
    priority: 'MEDIUM',
    channel: 'IN_APP',
    isRead: false,
    targetScreen: 'Marketplace'
  },
  {
    id: 'notif-3',
    title: 'KYB Credit Score Upgrade',
    message: 'Your Merchant Trust Rating increased to 89/100. Pre-approved trade credit line upgraded to N$45,000.',
    timeStamp: Date.now() - 3600000 * 20,
    priority: 'CRITICAL',
    channel: 'SMS',
    isRead: true,
    targetScreen: 'Enterprise'
  }
];

export const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-1092',
    category: 'Technical',
    subject: 'Offline sync queue reconciliation on low bandwidth',
    description: 'Investigating if transactions queued while traversing Kalahari desert sync automatically upon 3G connection.',
    status: 'Resolved',
    priority: 'HIGH',
    assignedAgent: 'Support Team Alpha',
    timeCreated: '2026-08-23 09:15',
    slaTimerMinutes: 0
  },
  {
    id: 'TCK-1095',
    category: 'Delivery',
    subject: 'Delayed transit checkpoint due to road maintenance near Otjiwarongo',
    description: 'Driver Gabriel reporting 45 min delay on consignment TRK-NA-9042.',
    status: 'In Progress',
    priority: 'MEDIUM',
    assignedAgent: 'Logistics Desk',
    timeCreated: '2026-08-25 08:30',
    slaTimerMinutes: 35
  }
];

export const SEED_DISPUTES: DisputeItem[] = [
  {
    id: 'DSP-401',
    receiptId: 'REC-10020',
    category: 'Damage',
    subject: 'Crushed carton during freight offload',
    description: '2 units of Vetkoek flour packaging torn during offload at Oshakati depot.',
    amount: 169.90,
    status: 'Under Review',
    proposedOutcome: 'Credit Note',
    createdAt: '2026-08-24'
  }
];
