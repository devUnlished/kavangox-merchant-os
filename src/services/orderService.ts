import { apiClient } from './api';

export interface CreateOrderPayload {
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  local_uuid?: string;
}

export const orderService = {
  async createOrder(payload: CreateOrderPayload) {
    const { data } = await apiClient.post('/orders', payload);
    return data;
  },

  async getVendorOrders(vendorId: string | number, status?: string) {
    const { data } = await apiClient.get(`/orders/vendor/${vendorId}`, {
      params: { status },
    });
    return data;
  },

  async updateOrderStatus(orderId: string | number, status: 'processing' | 'completed' | 'cancelled') {
    const { data } = await apiClient.patch(`/orders/${orderId}/status`, { status });
    return data;
  },

  async getVendorAnalytics(vendorId: string | number) {
    const { data } = await apiClient.get(`/orders/vendor/${vendorId}/analytics`);
    return data;
  },

  async generateInvoice(orderId: string | number) {
    const { data } = await apiClient.post(`/invoices/generate/${orderId}`);
    return data;
  },

  async markInvoicePaid(invoiceId: string | number) {
    const { data } = await apiClient.patch(`/invoices/${invoiceId}/mark-paid`);
    return data;
  },
};
