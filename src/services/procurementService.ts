import { apiClient } from './api';

export interface CreateRfqPayload {
  title: string;
  description?: string;
  category_id?: string | number;
  registry_product_id?: string | number;
  quantity: number;
  budget?: number;
  uuid?: string;
}

export const procurementService = {
  async getRfqs() {
    const { data } = await apiClient.get('/procurement/rfqs');
    return data;
  },

  async createRfq(payload: CreateRfqPayload) {
    const { data } = await apiClient.post('/procurement/rfqs', payload);
    return data;
  },

  async getRecommendations(rfqId: string | number) {
    const { data } = await apiClient.get(`/procurement/rfqs/${rfqId}/recommendations`);
    return data;
  },
};
