import { contactService } from "@/services/contacts/contactService";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@/services/api/client", () => ({
  apiClient: { post: jest.fn(() => Promise.resolve({ data: {} })) },
  toApiError: () => ({ message: "error" }),
  API_BASE_URL: "",
}));

describe("contactService", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("adds and lists contacts", async () => {
    const result = await contactService.add({
      userId: "u1", name: "Sita", phone: "9800000000", relationship: "Mother", priority: 1, isPrimary: true,
    });
    expect(result.success).toBe(true);
    const list = await contactService.list();
    expect(list).toHaveLength(1);
  });

  it("enforces a maximum of 5 contacts", async () => {
    for (let i = 0; i < 5; i++) {
      await contactService.add({
        userId: "u1", name: `C${i}`, phone: "9800000000", relationship: "Friend", priority: 1, isPrimary: i === 0,
      });
    }
    const result = await contactService.add({
      userId: "u1", name: "Extra", phone: "9800000000", relationship: "Friend", priority: 1, isPrimary: false,
    });
    expect(result.success).toBe(false);
  });

  it("prevents deleting the primary contact", async () => {
    const added = await contactService.add({
      userId: "u1", name: "Primary", phone: "9800000000", relationship: "Mother", priority: 1, isPrimary: true,
    });
    if (!added.success) throw new Error("setup failed");
    const result = await contactService.remove(added.data.id);
    expect(result.success).toBe(false);
  });
});
