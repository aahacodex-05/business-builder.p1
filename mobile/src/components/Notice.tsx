import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";
import { Button } from "./Button";

type Props = { title?: string; message?: string; action?: { label: string; onPress: () => void } };

/** A centered full-screen message with the logo: loading, empty and error states. */
export function Notice({ title, message, action }: Props) {
  return (
    <View style={styles.notice}>
      <Image source={require("../../assets/logo.png")} style={styles.logo} accessibilityIgnoresInvertColors />
      {title ? <Text style={styles.title}>{title}</Text> : <ActivityIndicator color={colors.orangeInk} />}
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <Button label={action.label} onPress={action.onPress} />}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
    backgroundColor: colors.paper,
  },
  logo: { width: 112, height: 112 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink, textAlign: "center" },
  message: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 320,
  },
});
