import React from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useAuthStore } from "@/store/authStore";
import { registerSchema, RegisterFormValues } from "@/utils/validation";

export default function RegisterScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", phone: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const ok = await register(values);
    if (ok) router.replace("/onboarding");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Create your account
        </Text>

        <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
          <Input label="Full name" value={value} onChangeText={onChange} error={errors.fullName?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
          <Input label="Phone number" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
        )} />
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => (
          <Input label="Email" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />
        )} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => (
          <Input label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />
        )} />
        <Controller control={control} name="confirmPassword" render={({ field: { onChange, value } }) => (
          <Input label="Confirm password" value={value} onChangeText={onChange} secureTextEntry error={errors.confirmPassword?.message} />
        )} />

        {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button label="Create Account" onPress={handleSubmit(onSubmit)} loading={status === "loading"} />

        <Text
          onPress={() => router.replace("/(auth)/login")}
          accessibilityRole="link"
          style={{ color: theme.textPrimary, textAlign: "center", marginTop: spacing.md, fontWeight: "600" }}
        >
          Already have an account? Login
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
