import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice, type MenuItem } from "../../src/api";
import { useCart } from "../../src/cart";
import { useCatalog } from "../../src/catalog";
import { ItemArt } from "../../src/components/ItemArt";
import { colors, fonts, radius } from "../../src/theme";

const CHIP_BAR_HEIGHT = 60;

export default function MenuScreen() {
  const { categories, menu, popular } = useCatalog();
  const insets = useSafeAreaInsets();
  const scroll = useRef<ScrollView>(null);
  const offsets = useRef<Record<string, number>>({});
  const [active, setActive] = useState("popular");

  const sections = useMemo(
    () => [
      { id: "popular", label: "Popular", items: menu.filter((item) => popular.includes(item.id)) },
      ...categories.map(({ id, label }) => ({ id, label, items: menu.filter((item) => item.category === id) })),
    ],
    [categories, menu, popular],
  );

  const jumpTo = (id: string) => scroll.current?.scrollTo({ y: offsets.current[id] - CHIP_BAR_HEIGHT });

  const trackActive = (y: number) => {
    const current = sections.findLast(({ id }) => offsets.current[id] - CHIP_BAR_HEIGHT - 1 <= y);
    if (current && current.id !== active) setActive(current.id);
  };

  return (
    <ScrollView
      ref={scroll}
      stickyHeaderIndices={[1]}
      scrollEventThrottle={64}
      onScroll={(event) => trackActive(event.nativeEvent.contentOffset.y)}
      style={styles.screen}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.hero, { paddingTop: insets.top + 28 }]}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          accessibilityLabel="Mocha Express Coffee"
        />
        <Text style={styles.eyebrow}>Greater Portland, Oregon</Text>
        <Text style={styles.title}>
          Order ahead, <Text style={styles.accent}>then grab a seat.</Text>
        </Text>
        <Text style={styles.lead}>Pick up at any of our three shops. Paid in the app, made when you order.</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipBar}
        contentContainerStyle={styles.chips}
      >
        {sections.map(({ id, label }) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: id === active }}
            onPress={() => jumpTo(id)}
            style={[styles.chip, id === active && styles.chipActive]}
          >
            <Text style={[styles.chipLabel, id === active && styles.chipLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {sections.map(({ id, label, items }) => (
        <View key={id} style={styles.section} onLayout={(event) => (offsets.current[id] = event.nativeEvent.layout.y)}>
          <Text style={styles.sectionTitle}>{label}</Text>
          {items.map((item) => (
            <MenuRow key={item.id} item={item} />
          ))}
        </View>
      ))}

      <View style={styles.footer}>
        <Image source={require("../../assets/logo.png")} style={styles.footerLogo} accessibilityIgnoresInvertColors />
        <Text style={styles.footerName}>Mocha Express Coffee</Text>
        <Text style={styles.footerText}>Greater Portland, Oregon · © {new Date().getFullYear()}</Text>
        <Link href="/staff" style={styles.staffLink}>
          Staff
        </Link>
      </View>
    </ScrollView>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  const { add } = useCart();

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push({ pathname: "/item/[id]", params: { id: item.id } })}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <ItemArt kind={item.kind} size={72} />
      <View style={styles.rowText}>
        <Text style={styles.itemName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Add ${item.name} to bag`}
        hitSlop={8}
        onPress={() => add(item.id)}
        style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
      >
        <Ionicons name="add" size={22} color={colors.espresso} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingBottom: 16 },
  footer: { alignItems: "center", gap: 4, paddingTop: 32 },
  footerLogo: { width: 48, height: 48, marginBottom: 4 },
  footerName: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  footerText: { fontFamily: fonts.body, fontSize: 13, color: colors.muted },
  staffLink: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, opacity: 0.7, padding: 8 },
  hero: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 32, backgroundColor: colors.sky },
  logo: { width: 104, height: 104, marginBottom: 16 },
  eyebrow: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.7,
    textTransform: "uppercase",
    color: colors.orangeInk,
    marginBottom: 8,
  },
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, color: colors.ink, textAlign: "center" },
  accent: { fontFamily: fonts.accent, color: colors.orangeInk },
  lead: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: "center",
    marginTop: 12,
  },
  chipBar: {
    height: CHIP_BAR_HEIGHT,
    flexGrow: 0,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderColor: colors.latte,
  },
  chips: { alignItems: "center", gap: 8, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.latte },
  chipActive: { backgroundColor: colors.espresso },
  chipLabel: { fontFamily: fonts.bold, fontSize: 14, color: colors.roast },
  chipLabelActive: { color: colors.paper },
  section: { paddingHorizontal: 16, paddingTop: 28 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 12 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 12,
    marginBottom: 10,
    borderRadius: radius,
    backgroundColor: colors.white,
  },
  rowPressed: { backgroundColor: colors.mist },
  rowText: { flex: 1, gap: 2 },
  itemName: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  itemDescription: { fontFamily: fonts.body, fontSize: 14, lineHeight: 19, color: colors.muted },
  price: { fontFamily: fonts.bold, fontSize: 15, color: colors.orangeInk, marginTop: 2 },
  add: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.orange,
  },
  addPressed: { backgroundColor: colors.orangeDeep },
});
