import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, Vibration, View } from "react-native";
import { formatPrice, formatTime, getShopOrders, markPickedUp, type StaffOrder } from "../../src/api";
import { useCatalog } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { Notice } from "../../src/components/Notice";
import { useStaff } from "../../src/staff";
import { colors, fonts, radius } from "../../src/theme";

const REFRESH_MS = 15_000;

/** Today's paid pickup orders for one shop, like the site's tablet screen. */
export default function ShopOrdersScreen() {
  const { shop } = useLocalSearchParams<{ shop: string }>();
  const location = useCatalog().locations.find(({ id }) => id === shop);
  const { passcode, signOut } = useStaff();
  const [orders, setOrders] = useState<StaffOrder[]>();
  const [error, setError] = useState<string>();
  const seen = useRef<Set<string>>(undefined);

  const load = useCallback(async () => {
    if (!passcode) return;
    try {
      const latest = await getShopOrders(passcode, shop);
      // Buzz when an order arrives after the screen first loaded.
      if (seen.current && latest.some(({ id }) => !seen.current!.has(id))) Vibration.vibrate();
      seen.current = new Set(latest.map(({ id }) => id));
      setOrders(latest);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [passcode, shop]);

  useFocusEffect(
    useCallback(() => {
      load();
      const timer = setInterval(load, REFRESH_MS);
      return () => clearInterval(timer);
    }, [load]),
  );

  if (!passcode || !location) {
    return (
      <Notice
        title="Staff only"
        message="Sign in to see orders."
        action={{ label: "Sign in", onPress: () => router.replace("/staff") }}
      />
    );
  }
  if (!orders) {
    return error ? (
      <Notice title="Can't load orders" message={error} action={{ label: "Sign out", onPress: signOut }} />
    ) : (
      <Notice />
    );
  }

  const waiting = orders.filter((order) => !order.pickedUp);
  const pickedUp = orders.filter((order) => order.pickedUp).reverse();
  const pickUp = async (order: StaffOrder) => {
    await markPickedUp(passcode, shop, order.paymentIntentId).catch((err: Error) => setError(err.message));
    load();
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>{location.name} orders</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {waiting.length === 0 ? (
        <Text style={styles.empty}>No orders waiting. New ones show up here on their own.</Text>
      ) : (
        waiting.map((order) => <OrderCard key={order.id} order={order} onPickUp={() => pickUp(order)} />)
      )}

      {pickedUp.length > 0 && <Text style={styles.heading}>Picked up today</Text>}
      {pickedUp.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </ScrollView>
  );
}

function OrderCard({ order, onPickUp }: { order: StaffOrder; onPickUp?: () => void }) {
  return (
    <View style={[styles.card, order.pickedUp && styles.cardDone]}>
      <View style={styles.cardHead}>
        <Text style={styles.name}>{order.name}</Text>
        <Text style={styles.time}>{formatTime(order.placedAt)}</Text>
      </View>
      {order.items.map(({ name, quantity }) => (
        <Text key={name} style={styles.item}>
          <Text style={styles.quantity}>{quantity} ×</Text> {name}
        </Text>
      ))}
      <Text style={styles.meta}>
        {formatPrice(order.total)} paid{order.phone ? ` · ${order.phone}` : ""}
      </Text>
      {onPickUp && <Button label="Picked up" onPress={onPickUp} />}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 12 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 12 },
  empty: { fontFamily: fonts.body, fontSize: 16, color: colors.muted },
  error: { fontFamily: fonts.bold, fontSize: 15, color: "#b3261e" },
  card: { gap: 6, padding: 16, borderRadius: radius, backgroundColor: colors.white },
  cardDone: { opacity: 0.6 },
  cardHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  name: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  time: { fontFamily: fonts.bold, fontSize: 15, color: colors.orangeInk },
  item: { fontFamily: fonts.body, fontSize: 17, color: colors.ink },
  quantity: { fontFamily: fonts.bold },
  meta: { fontFamily: fonts.body, fontSize: 14, color: colors.muted, marginBottom: 6 },
});
