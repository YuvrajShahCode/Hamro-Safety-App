import { localStore, StorageKeys } from "./localStore";
import { isOnline } from "@/utils/network";

export interface QueuedOperation {
  id: string;
  kind: "sync_emergency_event" | "notify_contact" | "sync_checkin";
  payload: unknown;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

/**
 * A simple persisted retry queue for operations that must reach the backend
 * but failed (e.g. because the device was offline). Nothing in this queue
 * should ever be reported to the user as "delivered" until it actually
 * succeeds against the server.
 */
export async function enqueue(op: Omit<QueuedOperation, "attempts">): Promise<void> {
  const queue = (await localStore.getJSON<QueuedOperation[]>(StorageKeys.RETRY_QUEUE)) || [];
  queue.push({ ...op, attempts: 0 });
  await localStore.setJSON(StorageKeys.RETRY_QUEUE, queue);
}

export async function getQueue(): Promise<QueuedOperation[]> {
  return (await localStore.getJSON<QueuedOperation[]>(StorageKeys.RETRY_QUEUE)) || [];
}

export async function removeFromQueue(id: string): Promise<void> {
  const queue = await getQueue();
  await localStore.setJSON(
    StorageKeys.RETRY_QUEUE,
    queue.filter((q) => q.id !== id)
  );
}

/**
 * Attempts to flush the retry queue. `processor` performs the actual network
 * call for a single queued operation and must return true only on confirmed
 * success. Call this from a network-status listener and on app foreground.
 */
export async function flushRetryQueue(
  processor: (op: QueuedOperation) => Promise<boolean>
): Promise<{ processed: number; remaining: number }> {
  const online = await isOnline();
  if (!online) {
    const queue = await getQueue();
    return { processed: 0, remaining: queue.length };
  }

  const queue = await getQueue();
  let processed = 0;
  const remaining: QueuedOperation[] = [];

  for (const op of queue) {
    try {
      const ok = await processor(op);
      if (ok) {
        processed += 1;
      } else {
        remaining.push({ ...op, attempts: op.attempts + 1 });
      }
    } catch (err) {
      remaining.push({
        ...op,
        attempts: op.attempts + 1,
        lastError: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  await localStore.setJSON(StorageKeys.RETRY_QUEUE, remaining);
  return { processed, remaining: remaining.length };
}
