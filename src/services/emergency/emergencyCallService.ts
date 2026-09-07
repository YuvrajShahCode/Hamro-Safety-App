import { Linking, Platform } from "react-native";
import type { ServiceResult } from "@/types";

/**
 * Reusable emergency-calling service. Never places a call silently - the
 * UI must always show the number and require explicit user confirmation
 * before invoking this. iOS does not allow programmatically dialing without
 * a user tap on the resulting system dialog; Android CALL_PHONE permission
 * enables a more direct dial but this implementation defaults to the
 * cross-platform tel: URL approach, which always shows a confirmation UI.
 */
export const emergencyCallService = {
  async call(phoneNumber: string): Promise<ServiceResult<null>> {
    const url = `tel:${phoneNumber}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        return {
          success: false,
          error: {
            message: "This device cannot place phone calls.",
            code: "CALLING_UNSUPPORTED",
          },
        };
      }
      await Linking.openURL(url);
      return { success: true, data: null };
    } catch (err) {
      return {
        success: false,
        error: { message: "Could not start the phone call. Please dial manually.", code: "CALL_FAILED" },
      };
    }
  },
};

/** Local emergency service numbers - extend per-country as the app expands. */
export const LOCAL_EMERGENCY_NUMBER = Platform.select({ ios: "112", android: "112", default: "112" });
