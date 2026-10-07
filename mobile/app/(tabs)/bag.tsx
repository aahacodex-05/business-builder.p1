import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { formatPrice, getOrder, startCheckout } from "../../src/api";
import { useCart } from "../../src/cart";
import { useCatalog, useCatalogStatus } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { ItemArt } from "../../src/components/ItemArt";
import { Notice } from "../../src/components/Notice";
import { Stepper } from "../../src/components/Stepper";
import { colors, fonts, radius } from "../../src/theme";

export default function BagScreen() {
  const { menu, locations } = useCatalog();
  const { refresh } = useCatalogStatus();
  const { lines, count, subtotal, setQuantity } = useCart();
  const [locationId, setLocationId] = useState<string>();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  // Shops open and close while the app sits in the background.
  useFocusEffect(useCallback(() => void refresh(), [refresh]));

  if (count === 0) {
    return (
      <Notice
        title="Your bag is empty"
        message="Add a drink or a bite from the menu."
        action={{ label: "Browse the menu", onPress: () => router.navigate("/") }}
      />
    );
  }

  const location = locations.find(({ id }) => id === locationId);
  const ready = location?.open && name.trim();

  const checkout = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const { url, id } = await startCheckout({ lines, locationId: locationId!, name });
      // Stripe's secure checkout page opens in the browser and hands back to the app when done.
      await WebBrowser.openAuthSessionAsync(url, Linking.createURL("/"));
      const order = await getOrder(id);
      if (order.paid) router.navigate({ pathname: "/order", params: { id } });
      else setError("Payment wasn't finished. Your bag is saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {Object.entries(lines).map(([id, quantity]) => {
          const item = menu.find((entry) => entry.id === id)!;
          return (
            <View key={id} style={styles.line}>
              <ItemArt kind={item.kind} size={52} />
              <View style={styles.lineText}>
                <Text style={styles.lineName}>{item.name}</Text>
                <Text style={styles.linePrice}>{formatPrice(item.price * quantity)}</Text>
              </View>
              <Stepper value={quantity} onChange={(value) => setQuantity(id, value)} />
            </View>
          );
        })}

        <Text style={styles.heading}>Pick up at</Text>
        {locations.map((shop) => (
          <Pressable
            key={shop.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: shop.id === locationId, disabled: !shop.open }}
            disabled={!shop.open}
            onPress={() => setLocationId(shop.id)}
            style={[styles.shop, shop.id === locationId && styles.shopChosen, !shop.open && styles.shopClosed]}
          >
            <View style={[styles.radio, shop.id === locationId && styles.radioChosen]} />
            <View style={styles.lineText}>
              <Text style={styles.lineName}>{shop.name}</Text>
              <Text style={styles.shopDetail}>{shop.open ? shop.street : "Closed now"}</Text>
            </View>
          </Pressable>
        ))}

        <Text style={styles.heading}>Name for the order</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Who's it for?"
          placeholderTextColor={colors.muted}
          autoComplete="given-name"
          maxLength={80}
          returnKeyType="done"
          style={styles.input}
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
        </View>
        <Button label="Pay and place order" onPress={checkout} disabled={!ready} busy={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 16, gap: 10 },
  line: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: radius,
    backgroundColor: colors.white,
  },
  lineText: { flex: 1, gap: 2 },
  lineName: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  linePrice: { fontFamily: fonts.body, fontSize: 14, color: colors.orangeInk },
  heading: { fontFamily: fonts.display, fontSize: 22, color: colors.ink, marginTop: 18 },
  shop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: radius,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: colors.white,
  },
  shopChosen: { borderColor: colors.orange },
  shopClosed: { opacity: 0.5 },
  shopDetail: { fontFamily: fonts.body, fontSize: 14, color: colors.muted },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.muted },
  radioChosen: { borderWidth: 7, borderColor: colors.orange },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    padding: 14,
    borderRadius: radius,
    backgroundColor: colors.white,
  },
  error: { fontFamily: fonts.bold, fontSize: 15, color: "#b3261e", marginTop: 8 },
  footer: { gap: 12, padding: 16, borderTopWidth: 1, borderColor: colors.latte, backgroundColor: colors.paper },
  total: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontFamily: fonts.body, fontSize: 17, color: colors.muted },
  totalValue: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
});
