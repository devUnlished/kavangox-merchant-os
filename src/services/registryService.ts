import { apiClient } from './api';

export const registryService = {
  async getProducts(params?: { search?: string; category_id?: string | number; page?: number; per_page?: number }) {
    const { data } = await apiClient.get('/registry/products', { params });
    return data;
  },

  async matchBarcode(barcode: string, name?: string) {
    const { data } = await apiClient.post('/registry/match', { barcode, name });
    return data;
  },

  async batchImportProducts(vendorId: number | string, products: any[]) {
    const { data } = await apiClient.post('/onboard/import', {
      vendor_id: vendorId,
      products,
    });
    return data;
  },

  async syncRegistry(lastSyncTime?: string) {
    const { data } = await apiClient.get('/sync/registry', {
      params: { last_sync_time: lastSyncTime },
    });
    return data;
  },

  async getDepartments() {
    const { data } = await apiClient.get('/registry/departments');
    return data;
  },

  async getCategories() {
    const { data } = await apiClient.get('/registry/categories');
    return data;
  },

  async getBrands() {
    const { data } = await apiClient.get('/registry/brands');
    return data;
  },
};
