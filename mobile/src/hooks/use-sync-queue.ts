import { useSyncExternalStore } from 'react';

import { getEstado, subscribeFila } from '@/lib/syncQueue';

/** Estado reativo da fila de sincronização offline (pendências, status, última sincronização). */
export function useSyncQueue() {
  return useSyncExternalStore(subscribeFila, getEstado, getEstado);
}
