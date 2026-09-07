import React, { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { authService } from "@/services/auth/authService";

export default function ForgotPasswordScreen() {
  const theme = useAppTheme();
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setStatus("loading");
    const result = await authService.requestPasswordReset(identifier);
    if (result.success) {
      setStatus("sent");
    } else {
      setStatus("error");
      setError(result.error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          Reset your password
        </Text>
        {status === "sent" ? (
          <Text style={{ color: theme.safe }}>
            If an account exists for that phone/email, password reset instructions have been sent.
          </Text>
        ) : (
          <>
            <Input label="Phone or email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" />
            {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}
            <Button label="Send reset instructions" onPress={onSubmit} loading={status === "loading"} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
