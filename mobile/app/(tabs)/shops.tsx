import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Location } from "../../src/api";
import { useCart } from "../../src/cart";
import { Button } from "../../src/components/Button";
import { useCatalog } from "../../src/catalog";
import { colors, fonts, radius } from "../../src/theme";

export default function ShopsScreen() {
  const { locations } = useCatalog();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {locations.map((location) => (
        <Shop key={location.id} location={location} />
      ))}
    </ScrollView>
  );
}

function Shop({ location }: { location: Location }) {
  const { setLocationId } = useCart();

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.name}>{location.name}</Text>
        <Text style={[styles.status, location.open ? styles.open : styles.closed]}>
          {location.open ? "Open now" : "Closed now"}
        </Text>
      </View>
      <Text style={styles.services}>{location.services.join(" · ")}</Text>
      <Text style={styles.address}>
        {location.street}
        {"\n"}
        {location.city}, OR {location.zip}
      </Text>

      <View style={styles.hours}>
        {location.hours.map(({ days, time }) => (
          <View key={days} style={styles.hoursRow}>
            <Text style={styles.days}>{days}</Text>
            <Text style={styles.time}>{time}</Text>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Action icon="call-outline" label={location.phone} url={location.phoneUrl} />
        <Action icon="navigate-outline" label="Directions" url={location.directionsUrl} />
      </View>

      <View style={styles.order}>
        <Button
          label={location.open ? "Order here" : "Closed now"}
          disabled={!location.open}
          onPress={() => {
            setLocationId(location.id);
            router.navigate("/");
          }}
        />
      </View>
    </View>
  );
}

type ActionProps = { icon: keyof typeof Ionicons.glyphMap; label: string; url: string };

function Action({ icon, label, url }: ActionProps) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
    >
      <Ionicons name={icon} size={18} color={colors.orange} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, gap: 16 },
  card: { padding: 20, borderRadius: radius, backgroundColor: colors.fir },
  cardHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  name: { fontFamily: fonts.display, fontSize: 26, color: colors.paper },
  status: {
    fontFamily: fonts.bold,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  open: { backgroundColor: colors.orange, color: colors.espresso },
  closed: { backgroundColor: "rgba(247,244,238,0.15)", color: colors.paper },
  services: { fontFamily: fonts.bold, fontSize: 13, color: colors.orange, marginTop: 4 },
  address: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23, color: colors.paper, marginTop: 12 },
  hours: { marginTop: 14, gap: 4 },
  hoursRow: { flexDirection: "row", justifyContent: "space-between" },
  days: { fontFamily: fonts.body, fontSize: 15, color: colors.sky },
  time: { fontFamily: fonts.bold, fontSize: 15, color: colors.paper },
  actions: { flexDirection: "row", gap: 10, marginTop: 18 },
  action: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "rgba(247,244,238,0.1)",
  },
  actionPressed: { backgroundColor: "rgba(247,244,238,0.2)" },
  order: { marginTop: 12 },
  actionLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.paper },
});
