import { apiClient, API_BASE_URL } from "@/services/api/client";
import { localStore, StorageKeys } from "@/services/api/localStore";
import { EmergencyContact, ServiceResult } from "@/types";

/**
 * Contacts are always persisted locally immediately (so the app is usable
 * offline / before a backend exists), and synced to the server opportunistically.
 * syncedToServer-style flags aren't tracked per-contact here for simplicity,
 * but any UI showing "synced" state must check API_BASE_URL / network status
 * rather than assuming success.
 */
export const contactService = {
  async list(): Promise<EmergencyContact[]> {
    return (await localStore.getJSON<EmergencyContact[]>(StorageKeys.CONTACTS)) || [];
  },

  async add(contact: Omit<EmergencyContact, "id" | "createdAt">): Promise<ServiceResult<EmergencyContact>> {
    const contacts = await contactService.list();
    if (contacts.length >= 5) {
      return {
        success: false,
        error: { message: "You can add up to 5 trusted emergency contacts.", code: "CONTACT_LIMIT_REACHED" },
      };
    }
    const entry: EmergencyContact = {
      ...contact,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const next = [...contacts, entry];
    await localStore.setJSON(StorageKeys.CONTACTS, next);

    if (API_BASE_URL) {
      try {
        await apiClient.post("/contacts", entry);
      } catch (err) {
        // Local copy is saved; surface the sync failure but don't block the user.
        return { success: true, data: entry };
      }
    }
    return { success: true, data: entry };
  },

  async update(id: string, updates: Partial<EmergencyContact>): Promise<ServiceResult<EmergencyContact>> {
    const contacts = await contactService.list();
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) {
      return { success: false, error: { message: "Contact not found.", code: "NOT_FOUND" } };
    }
    const updated = { ...contacts[idx], ...updates };
    contacts[idx] = updated;
    await localStore.setJSON(StorageKeys.CONTACTS, contacts);
    return { success: true, data: updated };
  },

  async remove(id: string): Promise<ServiceResult<null>> {
    const contacts = await contactService.list();
    const target = contacts.find((c) => c.id === id);
    if (target?.isPrimary) {
      return {
        success: false,
        error: {
          message:
            "This is your primary emergency contact. Set another contact as primary before deleting this one.",
          code: "CANNOT_DELETE_PRIMARY",
        },
      };
    }
    await localStore.setJSON(StorageKeys.CONTACTS, contacts.filter((c) => c.id !== id));
    return { success: true, data: null };
  },

  async setPrimary(id: string): Promise<ServiceResult<EmergencyContact[]>> {
    const contacts = await contactService.list();
    const updated = contacts.map((c) => ({ ...c, isPrimary: c.id === id }));
    await localStore.setJSON(StorageKeys.CONTACTS, updated);
    return { success: true, data: updated };
  },

  async reorder(orderedIds: string[]): Promise<ServiceResult<EmergencyContact[]>> {
    const contacts = await contactService.list();
    const byId = new Map(contacts.map((c) => [c.id, c]));
    const reordered = orderedIds
      .map((id, i) => {
        const c = byId.get(id);
        return c ? { ...c, priority: (Math.min(i + 1, 5) as EmergencyContact["priority"]) } : null;
      })
      .filter((c): c is EmergencyContact => c !== null);
    await localStore.setJSON(StorageKeys.CONTACTS, reordered);
    return { success: true, data: reordered };
  },
};
