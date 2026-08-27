export type UserRole =
  | 'Merchant Owner'
  | 'Executive'
  | 'Enterprise Administrator'
  | 'Store Manager'
  | 'Sales Clerk / Cashier'
  | 'Procurement Officer'
  | 'Warehouse Manager'
  | 'Driver'
  | 'Finance Officer';

export type PaymentMethod =
  | 'CASH'
  | 'WALLET'
  | 'BANK_TRANSFER'
  | 'MOBILE_MONEY'
  | 'STORE_CREDIT';

export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'RETAIL_SALE'
  | 'STOCK_PURCHASE'
  | 'RENT'
  | 'UTILITIES'
  | 'SALARY'
  | 'LOGISTICS_FEE'
  | 'OTHER';

export type SyncActionType =
  | 'SYNC_SALE'
  | 'SYNC_STOCK_ADJUSTMENT'
  | 'SYNC_NEW_CUSTOMER'
  | 'SYNC_PAYMENT'
  | 'SYNC_POD'
  | 'SYNC_MESSAGE';

export type PromotionCategory = 'Wholesale' | 'Retail' | 'Bulk';
export type CampaignType = 'Flash Sales' | 'Bulk Deals' | 'Bundles' | 'Special Offers';

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  sellPrice: number;
  stockQty: number;
  minStockAlert: number;
  expiryTimeStamp?: number;
  supplierId: string;
  supplierName?: string;
  imageUrl?: string;
  unit: string;
}

export interface SaleItem {
  id: string;
  receiptId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface SalesReceipt {
  id: string;
  customerId?: string;
  customerName?: string;
  sellerName: string;
  timeStamp: number;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  cashTendered?: number;
  changeGiven?: number;
  items: SaleItem[];
  isSynced: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  outstandingDebt: number;
  creditLimit: number;
  totalPurchases: number;
}

export interface CashTransaction {
  id: string;
  transactionType: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  timeStamp: number;
  referenceId?: string;
}

export interface SyncItem {
  id: string;
  actionType: SyncActionType;
  payloadJson: string;
  retryCount: number;
  timeStamp: number;
}

export interface PromotionItem {
  id: string;
  supplierName: string;
  supplierLogo: string;
  category: PromotionCategory;
  campaignType: CampaignType;
  location: string;
  title: string;
  description: string;
  originalPrice: number;
  promoPrice: number;
  validityPeriod: string;
  isSaved: boolean;
  engagementLikes: number;
  engagementViews: number;
  isRedeemed: boolean;
  minOrderQty: number;
  productId?: string;
}

export interface LinkedProductContext {
  id: string;
  name: string;
  sellPrice: number;
  stockQty: number;
}

export interface LinkedReceiptContext {
  id: string;
  totalAmount: number;
  timeStamp: number;
  paymentMethod: string;
}

export interface LinkedDeliveryTrackerContext {
  trackingId: string;
  origin: string;
  destination: string;
  status: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: 'me' | 'them' | 'system';
  senderName: string;
  messageText: string;
  timeStamp: number;
  isRead: boolean;
  status: 'SENT' | 'QUEUED' | 'DELIVERED';
  linkedProduct?: LinkedProductContext;
  linkedReceipt?: LinkedReceiptContext;
  linkedDeliveryTracker?: LinkedDeliveryTrackerContext;
}

export interface ChatThread {
  id: string;
  participantName: string;
  participantRole: 'Supplier' | 'Logistics' | 'Support' | 'Vendor' | 'Customer';
  participantLogo: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  phone?: string;
}

export interface SupportTicket {
  id: string;
  category: 'Order' | 'Delivery' | 'Payment' | 'Technical' | 'General';
  subject: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedAgent: string;
  timeCreated: string;
  slaTimerMinutes: number;
}

export interface DisputeItem {
  id: string;
  receiptId?: string;
  category: 'Payment' | 'Delivery Failure' | 'Damage' | 'Refund' | 'Shortage';
  subject: string;
  description: string;
  amount: number;
  status: 'Open' | 'Under Review' | 'Resolved';
  proposedOutcome: 'Refund' | 'Redelivery' | 'Credit Note' | 'Denial';
  actualOutcome?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timeStamp: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channel: 'IN_APP' | 'SMS' | 'EMAIL';
  isRead: boolean;
  targetScreen?: string;
  targetId?: string;
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: string;
  region: string;
  phone: string;
  email: string;
  leadTimeDays: number;
  minOrderValue: number;
  rating: number;
  catalogCount: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';
  createdAt: number;
  expectedDelivery: string;
  notes?: string;
}

export interface Waypoint {
  name: string;
  hub: string;
  status: 'COMPLETED' | 'IN_TRANSIT' | 'PENDING';
  timestamp?: string;
  latitude: number;
  longitude: number;
}

export interface Consignment {
  trackingId: string;
  origin: string;
  destination: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  cargoDescription: string;
  status: 'ORDER_PLACED' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  eta: string;
  waypoints: Waypoint[];
  podSignature?: string;
  podSigneeName?: string;
  podSignedAt?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehiclePlate: string;
  status: 'AVAILABLE' | 'ON_ROUTE' | 'RESTING';
  rating: number;
  activeConsignmentId?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  region: string;
  isMain: boolean;
  address: string;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  branchId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface AppState {
  currentRole: UserRole;
  currentBranch: Branch;
  isOnline: boolean;
  activeScreen: string;
  searchQuery: string;
}
