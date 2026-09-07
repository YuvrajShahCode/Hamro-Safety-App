import NetInfo from "@react-native-community/netinfo";

/** Returns true only when there is an active, internet-reachable connection. */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

/** Subscribe to connectivity changes. Returns an unsubscribe function. */
export function subscribeToNetworkStatus(
  callback: (online: boolean) => void
): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    callback(Boolean(state.isConnected && state.isInternetReachable !== false));
  });
  return unsubscribe;
}
