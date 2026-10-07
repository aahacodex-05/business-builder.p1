import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { formatPrice } from "../../src/api";
import { useCart } from "../../src/cart";
import { useCatalog, useItem } from "../../src/catalog";
import { Button } from "../../src/components/Button";
import { ItemArt } from "../../src/components/ItemArt";
import { Notice } from "../../src/components/Notice";
import { Stepper } from "../../src/components/Stepper";
import { colors, fonts } from "../../src/theme";

export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useItem(id);
  const { categories } = useCatalog();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <Notice
        title="Not on the menu"
        message="This item isn't on the menu anymore."
        action={{ label: "Back to the menu", onPress: router.back }}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.art}>
          <ItemArt kind={item.kind} size={260} />
        </View>
        <Text style={styles.eyebrow}>{categories.find((category) => category.id === item.category)?.label}</Text>
        <Text style={styles.name}>{item.name}</Text>
        {item.description && <Text style={styles.description}>{item.description}</Text>}
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Stepper value={quantity} onChange={setQuantity} min={1} />
        <View style={styles.cta}>
          <Button
            label={`Add to bag · ${formatPrice(item.price * quantity)}`}
            onPress={() => {
              add(item.id, quantity);
              router.back();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 24, paddingTop: 8 },
  art: { alignItems: "center", marginBottom: 24 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: colors.orangeInk,
    marginBottom: 6,
  },
  name: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, color: colors.ink },
  description: { fontFamily: fonts.body, fontSize: 17, lineHeight: 26, color: colors.muted, marginTop: 12 },
  price: { fontFamily: fonts.bold, fontSize: 20, color: colors.orangeInk, marginTop: 16 },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: colors.latte,
    backgroundColor: colors.paper,
  },
  cta: { flex: 1 },
});
