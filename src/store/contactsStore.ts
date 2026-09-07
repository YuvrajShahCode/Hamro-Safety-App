import { create } from "zustand";
import { EmergencyContact } from "@/types";
import { contactService } from "@/services/contacts/contactService";

interface ContactsState {
  contacts: EmergencyContact[];
  isLoading: boolean;
  error: string | null;
  load: () => Promise<void>;
  add: (input: Omit<EmergencyContact, "id" | "createdAt">) => Promise<boolean>;
  update: (id: string, updates: Partial<EmergencyContact>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  setPrimary: (id: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  isLoading: true,
  error: null,

  load: async () => {
    set({ isLoading: true });
    const contacts = await contactService.list();
    set({ contacts, isLoading: false });
  },

  add: async (input) => {
    set({ error: null });
    const result = await contactService.add(input);
    if (result.success) {
      set({ contacts: [...get().contacts, result.data] });
      return true;
    }
    set({ error: result.error.message });
    return false;
  },

  update: async (id, updates) => {
    const result = await contactService.update(id, updates);
    if (result.success) {
      set({ contacts: get().contacts.map((c) => (c.id === id ? result.data : c)) });
      return true;
    }
    set({ error: result.error.message });
    return false;
  },

  remove: async (id) => {
    const result = await contactService.remove(id);
    if (result.success) {
      set({ contacts: get().contacts.filter((c) => c.id !== id) });
      return true;
    }
    set({ error: result.error.message });
    return false;
  },

  setPrimary: async (id) => {
    const result = await contactService.setPrimary(id);
    if (result.success) set({ contacts: result.data });
  },
}));
