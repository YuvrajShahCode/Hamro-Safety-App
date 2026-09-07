import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { loginSchema, LoginFormValues } from "@/utils/validation";

export default function LoginScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const ok = await login(values);
    if (ok) router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Welcome back
        </Text>

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, value } }) => (
            <Input label="Phone or email" value={value} onChangeText={onChange} autoCapitalize="none" error={errors.identifier?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
          )}
        />

        {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button label="Login" onPress={handleSubmit(onSubmit)} loading={status === "loading"} />

        <Text
          onPress={() => router.push("/(auth)/forgot-password")}
          accessibilityRole="link"
          style={{ color: theme.textSecondary, textAlign: "center", marginTop: spacing.md }}
        >
          Forgot password?
        </Text>
        <Text
          onPress={() => router.replace("/(auth)/register")}
          accessibilityRole="link"
          style={{ color: theme.textPrimary, textAlign: "center", marginTop: spacing.sm, fontWeight: "600" }}
        >
          Don't have an account? Create one
        </Text>
      </View>
    </SafeAreaView>
  );
}
