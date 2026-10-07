import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useCatalog } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { Notice } from "../../src/components/Notice";
import { useStaff } from "../../src/staff";
import { colors, fonts, radius } from "../../src/theme";

/** Staff sign-in, then a shop picker; the app's version of the site's /orders. */
export default function StaffScreen() {
  const { passcode, signOut } = useStaff();
  const { locations } = useCatalog();

  if (passcode === undefined) return <Notice />;
  if (!passcode) return <SignIn />;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Which shop is this?</Text>
      {locations.map((location) => (
        <Pressable
          key={location.id}
          accessibilityRole="link"
          onPress={() => router.push({ pathname: "/staff/[shop]", params: { shop: location.id } })}
          style={({ pressed }) => [styles.shop, pressed && styles.shopPressed]}
        >
          <Text style={styles.shopName}>{location.name}</Text>
          <Text style={styles.shopStreet}>{location.street}</Text>
        </Pressable>
      ))}
      <Button label="Sign out" variant="quiet" onPress={signOut} />
    </ScrollView>
  );
}

function SignIn() {
  const { signIn } = useStaff();
  const [attempt, setAttempt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await signIn(attempt);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Staff orders</Text>
      <Text style={styles.lead}>Enter the shop passcode to see pickup orders.</Text>
      <TextInput
        value={attempt}
        onChangeText={setAttempt}
        onSubmitEditing={submit}
        placeholder="Passcode"
        placeholderTextColor={colors.muted}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="go"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Sign in" onPress={submit} disabled={!attempt} busy={busy} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.muted },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    padding: 14,
    borderRadius: radius,
    backgroundColor: colors.white,
  },
  error: { fontFamily: fonts.bold, fontSize: 15, color: "#b3261e" },
  shop: { padding: 18, borderRadius: radius, backgroundColor: colors.fir },
  shopPressed: { backgroundColor: "#2c4d3d" },
  shopName: { fontFamily: fonts.display, fontSize: 22, color: colors.paper },
  shopStreet: { fontFamily: fonts.body, fontSize: 15, color: colors.sky, marginTop: 2 },
});
