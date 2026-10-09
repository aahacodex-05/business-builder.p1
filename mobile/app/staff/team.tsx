import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { addEmployee, formatDate, formatNumber, getEmployees, removeEmployee, type Employee } from "../../src/api";
import { useCatalog } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { Notice } from "../../src/components/Notice";
import { useStaff } from "../../src/staff";
import { colors, fonts, radius } from "../../src/theme";

/** The owner's team page: issue employee numbers, cancel them, and remove access. */
export default function TeamScreen() {
  const { locations } = useCatalog();
  const { session, handleError } = useStaff();
  const [employees, setEmployees] = useState<Employee[]>();
  const [shop, setShop] = useState(locations[0].id);
  const [issued, setIssued] = useState<Employee>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const token = session?.token;
  const load = useCallback(async () => {
    if (!token) return;
    try {
      setEmployees(await getEmployees(token));
    } catch (err) {
      setError(handleError(err));
    }
  }, [token, handleError]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const isOwner = session?.staff.role === "owner";
  useEffect(() => {
    if (session !== undefined && !isOwner) router.dismissTo("/staff");
  }, [session, isOwner]);

  if (!session || !isOwner) return <Notice />;
  if (!employees) return error ? <Notice title="Can't load your team" message={error} /> : <Notice />;

  const shopName = (id: string) => locations.find((location) => location.id === id)?.name ?? id;

  const issue = async () => {
    setBusy(true);
    setError(undefined);
    try {
      setIssued(await addEmployee(session.token, shop));
      await load();
    } catch (err) {
      setError(handleError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (employee: Employee) => {
    try {
      await removeEmployee(session.token, employee.id);
      if (issued?.id === employee.id) setIssued(undefined);
      await load();
    } catch (err) {
      setError(handleError(err));
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Team</Text>

      <View style={styles.panel}>
        <Text style={styles.heading}>Add an employee</Text>
        <Text style={styles.lead}>Pick their shop, then give them the number. It works once, for 14 days.</Text>
        <View style={styles.chips}>
          {locations.map((location) => (
            <Pressable
              key={location.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: location.id === shop }}
              onPress={() => setShop(location.id)}
              style={[styles.chip, location.id === shop && styles.chipChosen]}
            >
              <Text style={[styles.chipLabel, location.id === shop && styles.chipLabelChosen]}>{location.name}</Text>
            </Pressable>
          ))}
        </View>
        <Button label="Make an employee number" onPress={issue} busy={busy} />
        {issued && (
          <View style={styles.issued}>
            <Text style={styles.issuedNumber}>{formatNumber(issued.number)}</Text>
            <Text style={styles.issuedText}>
              Give this to the new hire at {shopName(issued.shop)}. They sign up with it from the Staff screen.
            </Text>
          </View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={styles.heading}>Everyone</Text>
      {employees.length === 0 && <Text style={styles.lead}>No one yet. Make a number above to add someone.</Text>}
      {employees.map((employee) => (
        <Member
          key={employee.id}
          employee={employee}
          shopName={shopName(employee.shop)}
          onRemove={() => remove(employee)}
        />
      ))}
    </ScrollView>
  );
}

const STATUS = {
  active: { label: "Active", style: { backgroundColor: colors.fir, color: colors.paper } },
  pending: { label: "Waiting for sign-up", style: { backgroundColor: colors.orange, color: colors.espresso } },
  expired: { label: "Expired", style: { backgroundColor: colors.latte, color: colors.muted } },
};

type MemberProps = { employee: Employee; shopName: string; onRemove: () => void };

function Member({ employee, shopName, onRemove }: MemberProps) {
  // Removing ends someone's access at once, so it takes a second tap.
  const [confirming, setConfirming] = useState(false);
  const status = STATUS[employee.status];
  const action = employee.status === "active" ? "Remove access" : "Cancel number";

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.name}>{employee.name ?? formatNumber(employee.number)}</Text>
        <Text style={[styles.status, status.style]}>{status.label}</Text>
      </View>
      <Text style={styles.meta}>
        {shopName} · {employee.name && `${formatNumber(employee.number)} · `}
        {employee.signedUpAt
          ? `joined ${formatDate(employee.signedUpAt)}`
          : `${employee.status === "expired" ? "expired" : "expires"} ${formatDate(employee.expiresAt)}`}
      </Text>
      <Button
        label={confirming ? `Tap again to ${action.toLowerCase()}` : action}
        variant="quiet"
        onPress={() => (confirming ? onRemove() : setConfirming(true))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  panel: { gap: 12, padding: 16, borderRadius: radius, backgroundColor: colors.white },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.latte },
  chipChosen: { backgroundColor: colors.espresso },
  chipLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.roast },
  chipLabelChosen: { color: colors.paper },
  issued: { gap: 4, padding: 14, borderRadius: radius, backgroundColor: colors.mist },
  issuedNumber: { fontFamily: fonts.display, fontSize: 32, color: colors.ink, letterSpacing: 1 },
  issuedText: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  error: { fontFamily: fonts.bold, fontSize: 15, color: "#b3261e" },
  card: { gap: 8, padding: 16, borderRadius: radius, backgroundColor: colors.white },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  name: { flex: 1, fontFamily: fonts.display, fontSize: 20, color: colors.ink },
  status: {
    fontFamily: fonts.bold,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  meta: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
});
