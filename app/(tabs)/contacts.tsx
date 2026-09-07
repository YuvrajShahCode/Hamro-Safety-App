import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SkeletonListRow } from "@/components/ui/Skeleton";
import { useAppTheme } from "@/hooks/useAppTheme";
import { spacing, typography, radii } from "@/constants/theme";
import { useContactsStore } from "@/store/contactsStore";
import { emergencyCallService } from "@/services/emergency/emergencyCallService";
import { EmergencyContact } from "@/types";

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const theme = useAppTheme();
  const router = useRouter();

  return (
    <Card style={{ marginBottom: spacing.md, flexDirection: "row", alignItems: "center" }}>
      <View
        style={{
          width: 48, height: 48, borderRadius: radii.full,
          backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center", marginRight: spacing.md,
        }}
      >
        <Text style={{ fontWeight: "700", color: theme.textPrimary }}>{contact.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={{ fontWeight: "700", color: theme.textPrimary }}>{contact.name}</Text>
          {contact.isPrimary ? (
            <View style={{ marginLeft: spacing.xs, backgroundColor: theme.safeSurface, borderRadius: radii.sm, paddingHorizontal: 6 }}>
              <Text style={{ color: theme.safe, fontSize: 11, fontWeight: "700" }}>PRIMARY</Text>
            </View>
          ) : null}
        </View>
        <Text style={{ color: theme.textSecondary }}>{contact.relationship} · {contact.phone}</Text>
      </View>
      <Button label="Call" variant="secondary" onPress={() => emergencyCallService.call(contact.phone)} style={{ marginRight: spacing.xs, paddingHorizontal: spacing.md }} />
      <Button label="Edit" variant="ghost" onPress={() => router.push({ pathname: "/contacts/[id]/edit", params: { id: contact.id } })} style={{ paddingHorizontal: spacing.md }} />
    </Card>
  );
}

export default function ContactsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { contacts, load, isLoading } = useContactsStore();

  useEffect(() => {
    load();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ padding: spacing.lg, flex: 1 }}>
        <Text style={{ fontSize: typography.h2.fontSize, fontWeight: typography.h2.fontWeight, color: theme.textPrimary, marginBottom: spacing.md }}>
          Emergency Contacts
        </Text>

        {isLoading && contacts.length === 0 ? (
          <View>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ marginBottom: spacing.md }}>
                <SkeletonListRow />
              </Card>
            ))}
          </View>
        ) : contacts.length === 0 ? (
          <Card style={{ alignItems: "center", padding: spacing.xl }}>
            <Text style={{ fontWeight: "700", color: theme.textPrimary, marginBottom: spacing.xs, textAlign: "center" }}>
              No emergency contacts yet
            </Text>
            <Text style={{ color: theme.textSecondary, textAlign: "center" }}>
              Add trusted people who should be contacted during an emergency.
            </Text>
          </Card>
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => <ContactCard contact={item} />}
          />
        )}
      </View>
      <View style={{ padding: spacing.lg }}>
        <Button label="+ Add Emergency Contact" onPress={() => router.push("/contacts/add")} disabled={contacts.length >= 5} />
      </View>
    </SafeAreaView>
  );
}
