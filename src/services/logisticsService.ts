import { apiClient } from './api';

export interface TelemetryPoint {
  vehicle_id: string | number;
  latitude: number;
  longitude: number;
  speed_kph: number;
  odometer_reading_km: number;
  timestamp: string;
}

export const logisticsService = {
  async syncTelemetry(telemetry: TelemetryPoint[]) {
    const { data } = await apiClient.post('/logistics/telemetry', { telemetry });
    return data;
  },

  async submitProofOfDelivery(shipmentId: string | number, payload: {
    signee_name: string;
    signature_svg: string;
    photo_url?: string;
  }) {
    const { data } = await apiClient.post(`/logistics/shipments/${shipmentId}/pod`, payload);
    return data;
  },
};
