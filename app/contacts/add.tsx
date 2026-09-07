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
import { useContactsStore } from "@/store/contactsStore";
import { contactSchema, ContactFormValues } from "@/utils/validation";

export default function AddContactScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { add, contacts, error } = useContactsStore();

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", relationship: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const ok = await add({
      ...values,
      userId: "current_user",
      priority: (Math.min(contacts.length + 1, 5) as 1 | 2 | 3 | 4 | 5),
      isPrimary: contacts.length === 0,
    });
    if (ok) router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Add Emergency Contact
        </Text>

        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
          <Input label="Phone number" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
        )} />
        <Controller control={control} name="relationship" render={({ field: { onChange, value } }) => (
          <Input label="Relationship" value={value} onChangeText={onChange} placeholder="e.g. Sister, Friend" error={errors.relationship?.message} />
        )} />

        {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button label="Save Contact" onPress={handleSubmit(onSubmit)} loading={isSubmitting} />
      </View>
    </SafeAreaView>
  );
}
