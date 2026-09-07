import React, { useMemo } from "react";
import { Alert, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography } from "@/constants/theme";
import { useContactsStore } from "@/store/contactsStore";
import { contactSchema, ContactFormValues } from "@/utils/validation";

export default function EditContactScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { contacts, update, remove, setPrimary, error } = useContactsStore();
  const contact = useMemo(() => contacts.find((c) => c.id === id), [contacts, id]);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: contact?.name || "",
      phone: contact?.phone || "",
      relationship: contact?.relationship || "",
    },
  });

  if (!contact) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, padding: spacing.lg }}>
        <Text style={{ color: theme.textSecondary }}>Contact not found.</Text>
      </SafeAreaView>
    );
  }

  const onSubmit = async (values: ContactFormValues) => {
    const ok = await update(contact.id, values);
    if (ok) router.back();
  };

  const confirmDelete = () => {
    if (contact.isPrimary) {
      Alert.alert(
        "This is your primary contact",
        "Set another contact as primary before deleting this one."
      );
      return;
    }
    Alert.alert("Delete contact", `Remove ${contact.name} from your emergency contacts?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => { await remove(contact.id); router.back(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.lg }}>
          Edit Contact
        </Text>

        <Controller control={control} name="name" render={({ field: { onChange, value } }) => (
          <Input label="Name" value={value} onChangeText={onChange} error={errors.name?.message} />
        )} />
        <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
          <Input label="Phone number" value={value} onChangeText={onChange} keyboardType="phone-pad" error={errors.phone?.message} />
        )} />
        <Controller control={control} name="relationship" render={({ field: { onChange, value } }) => (
          <Input label="Relationship" value={value} onChangeText={onChange} error={errors.relationship?.message} />
        )} />

        {error ? <Text style={{ color: theme.emergency, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button label="Save Changes" onPress={handleSubmit(onSubmit)} loading={isSubmitting} style={{ marginBottom: spacing.sm }} />
        {!contact.isPrimary ? (
          <Button label="Make Primary Contact" variant="secondary" onPress={() => setPrimary(contact.id)} style={{ marginBottom: spacing.sm }} />
        ) : null}
        <Button label="Delete Contact" variant="ghost" onPress={confirmDelete} />
      </View>
    </SafeAreaView>
  );
}
