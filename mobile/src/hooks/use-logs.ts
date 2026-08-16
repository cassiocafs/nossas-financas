import { useSyncExternalStore } from 'react';

import { getLogs, subscribeLogs } from '@/lib/logStore';

export function useLogs() {
  return useSyncExternalStore(subscribeLogs, getLogs, getLogs);
}
