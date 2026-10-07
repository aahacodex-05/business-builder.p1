import { Fraunces_600SemiBold_Italic, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import { InstrumentSans_400Regular, InstrumentSans_600SemiBold } from "@expo-google-fonts/instrument-sans";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { CartProvider } from "../src/cart";
import { CatalogProvider, useCatalogStatus } from "../src/catalog";
import { Notice } from "../src/components/Notice";
import { colors, fonts } from "../src/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fraunces_700Bold,
    Fraunces_600SemiBold_Italic,
    InstrumentSans_400Regular,
    InstrumentSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <CatalogProvider>
      <StatusBar style="dark" />
      <App />
    </CatalogProvider>
  );
}

function App() {
  const { catalog, error, refresh } = useCatalogStatus();

  if (!catalog) {
    return error ? (
      <Notice title="Can't reach Mocha Express" message={error} action={{ label: "Try again", onPress: refresh }} />
    ) : (
      <Notice />
    );
  }

  return (
    <CartProvider>
      <Stack
        screenOptions={{
          headerTintColor: colors.espresso,
          headerTitleStyle: { fontFamily: fonts.display },
          headerStyle: { backgroundColor: colors.paper },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: "", presentation: "modal" }} />
        <Stack.Screen name="order" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </CartProvider>
  );
}
