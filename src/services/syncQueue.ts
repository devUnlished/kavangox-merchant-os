import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import * as Crypto from 'expo-crypto';

export interface SyncItem {
  id: string;
  type: 'POS_SALE' | 'STOCK_ADJUSTMENT' | 'PROCUREMENT_RFQ' | 'CUSTOMER_TAB';
  payload: any;
  createdAt: string;
}

const SYNC_KEY = '@kavango_sync_queue';

export const enqueueAction = async (type: SyncItem['type'], payload: any) => {
  const item: SyncItem = {
    id: Crypto.randomUUID(),
    type,
    payload: { ...payload, local_uuid: payload.local_uuid || Crypto.randomUUID() },
    createdAt: new Date().toISOString(),
  };

  const queueData = await AsyncStorage.getItem(SYNC_KEY);
  const queue: SyncItem[] = queueData ? JSON.parse(queueData) : [];
  queue.push(item);
  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(queue));
  return item;
};

export const flushSyncQueue = async () => {
  const queueData = await AsyncStorage.getItem(SYNC_KEY);
  if (!queueData) return { processed: 0, failed: 0 };

  const queue: SyncItem[] = JSON.parse(queueData);
  const remaining: SyncItem[] = [];
  let processed = 0;

  for (const item of queue) {
    try {
      if (item.type === 'POS_SALE') {
        await apiClient.post('/orders', item.payload);
      } else if (item.type === 'PROCUREMENT_RFQ') {
        await apiClient.post('/sync/rfq', {
          data: item.payload,
          correlation_id: item.payload.local_uuid,
        });
      }
      processed++;
    } catch (err: any) {
      // Retain in queue if network offline or 5xx server error
      if (!err.response || err.response.status >= 500) {
        remaining.push(item);
      }
    }
  }

  await AsyncStorage.setItem(SYNC_KEY, JSON.stringify(remaining));
  return { processed, failed: remaining.length };
};
