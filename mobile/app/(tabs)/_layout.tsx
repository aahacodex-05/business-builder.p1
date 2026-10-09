import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../src/cart";
import { colors, fonts } from "../../src/theme";

export default function TabsLayout() {
  const { count } = useCart();
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.orangeInk,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 12 },
        // Taller than the default bar so the labels' font fits.
        tabBarStyle: {
          height: 64 + bottom,
          paddingTop: 4,
          paddingBottom: bottom + 4,
          backgroundColor: colors.paper,
          borderTopColor: colors.latte,
        },
        headerStyle: { backgroundColor: colors.paper },
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 22, color: colors.espresso },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.paper },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Menu",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="cafe-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shops"
        options={{
          title: "Shops",
          headerTitle: "Our shops",
          tabBarIcon: ({ color, size }) => <Ionicons name="location-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: "Bag",
          tabBarBadge: count || undefined,
          tabBarBadgeStyle: { backgroundColor: colors.orange, color: colors.espresso, fontFamily: fonts.bold },
          tabBarIcon: ({ color, size }) => <Ionicons name="bag-handle-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
