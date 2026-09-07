import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

/** Entry redirect: sends the user to the right place based on auth status. */
export default function Index() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/(tabs)");
    } else if (status === "unauthenticated") {
      router.replace("/(auth)/welcome");
    }
  }, [status]);

  return null;
}
