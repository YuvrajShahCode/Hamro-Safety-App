import { useColorScheme } from "react-native";
import { useSettingsStore } from "@/store/settingsStore";
import { lightTheme, darkTheme, AppTheme } from "@/constants/theme";

/**
 * Resolves the active theme based on user preference (light/dark/system)
 * combined with the OS color scheme.
 */
export function useAppTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore((s) => s.themePreference);

  const resolved =
    preference === "system" ? systemScheme ?? "light" : preference;

  return resolved === "dark" ? darkTheme : lightTheme;
}
