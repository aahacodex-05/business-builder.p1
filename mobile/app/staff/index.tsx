import { Redirect, router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { signIn } from "../../src/api";
import { useCatalog } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { Field } from "../../src/components/Field";
import { Form } from "../../src/components/Form";
import { Notice } from "../../src/components/Notice";
import { TextLink } from "../../src/components/TextLink";
import { useStaff } from "../../src/staff";
import { colors, fonts, radius } from "../../src/theme";

/** Where the Staff link lands: sign-in, an employee's own orders, or the owner's home. */
export default function StaffScreen() {
  const { session } = useStaff();

  if (session === undefined) return <Notice />;
  if (!session) return <SignIn />;
  if (session.staff.role === "employee") return <Redirect href="/staff/orders" />;
  return <OwnerHome />;
}

function SignIn() {
  const { start } = useStaff();
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");

  return (
    <Form
      title="Staff sign-in"
      lead="Use your employee number and password to see your shop's pickup orders."
      submitLabel="Sign in"
      canSubmit={Boolean(number && password)}
      onSubmit={async () => start(await signIn(number, password))}
      footer={
        <>
          <TextLink href="/staff/signup" label="New employee? Sign up" />
          <TextLink href="/staff/owner" label="Owner sign-in" />
        </>
      }
    >
      <Field
        label="Employee number"
        value={number}
        onChangeText={setNumber}
        placeholder="1234 5678"
        keyboardType="number-pad"
        autoComplete="username"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
      />
    </Form>
  );
}

function OwnerHome() {
  const { locations } = useCatalog();
  const { signOut } = useStaff();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Owner</Text>
      <Button label="Team and employee numbers" onPress={() => router.push("/staff/team")} />
      <Text style={styles.heading}>Shop orders</Text>
      {locations.map((location) => (
        <Pressable
          key={location.id}
          accessibilityRole="link"
          onPress={() => router.push({ pathname: "/staff/orders", params: { shop: location.id } })}
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

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 12 },
  shop: { padding: 18, borderRadius: radius, backgroundColor: colors.fir },
  shopPressed: { backgroundColor: "#2c4d3d" },
  shopName: { fontFamily: fonts.display, fontSize: 22, color: colors.paper },
  shopStreet: { fontFamily: fonts.body, fontSize: 15, color: colors.sky, marginTop: 2 },
});
