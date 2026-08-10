import { useNetworkState as useExpoNetworkState } from 'expo-network';

/**
 * Expõe o estado de conectividade do dispositivo.
 *
 * Usa `expo-network`, que já faz parte do runtime do Expo Go (diferente de
 * `@react-native-community/netinfo`, que exige um development build custom).
 * Ver https://docs.expo.dev/versions/v57.0.0/sdk/network/
 */
export function useNetworkState() {
  const { isConnected, isInternetReachable, type } = useExpoNetworkState();

  // No iOS, `isInternetReachable` espelha `isConnected`. No Android, ele pode
  // demorar a popular (undefined) logo após o app abrir, então tratamos
  // `undefined` como "ainda não sabemos" e não como offline.
  const online = isConnected !== false && isInternetReachable !== false;

  return {
    isConnected: online,
    isInternetReachable,
    type,
  };
}
