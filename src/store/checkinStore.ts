import { create } from "zustand";
import { SafetyCheckIn } from "@/types";
import { checkInService } from "@/services/checkin/checkInService";

interface CheckInState {
  activeCheckIn: SafetyCheckIn | null;
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (input: { destination: string; expectedArrivalAt: string; notifyContactIds: string[] }) => Promise<boolean>;
  complete: () => Promise<void>;
  cancel: () => Promise<void>;
}

export const useCheckInStore = create<CheckInState>((set, get) => ({
  activeCheckIn: null,
  isLoading: false,
  error: null,

  load: async () => {
    set({ isLoading: true });
    const active = await checkInService.getActive();
    set({ activeCheckIn: active, isLoading: false });
  },

  create: async (input) => {
    set({ error: null });
    const result = await checkInService.create(input);
    if (result.success) {
      set({ activeCheckIn: result.data });
      return true;
    }
    set({ error: result.error.message });
    return false;
  },

  complete: async () => {
    const active = get().activeCheckIn;
    if (!active) return;
    await checkInService.complete(active.id);
    set({ activeCheckIn: null });
  },

  cancel: async () => {
    const active = get().activeCheckIn;
    if (!active) return;
    await checkInService.cancel(active.id);
    set({ activeCheckIn: null });
  },
}));
