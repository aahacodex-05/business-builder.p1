import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  variant?: "primary" | "quiet";
};

/** The site's orange pill button, pressed down a step when tapped. */
export function Button({ label, onPress, disabled, busy, variant = "primary" }: Props) {
  const quiet = variant === "quiet";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        quiet && styles.quiet,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {busy ? (
        <ActivityIndicator color={colors.espresso} />
      ) : (
        <Text style={[styles.label, quiet && styles.quietLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.orange,
    borderBottomWidth: 4,
    borderBottomColor: colors.orangeDeep,
  },
  quiet: { backgroundColor: colors.latte, borderBottomColor: "#d6c9b5" },
  disabled: { opacity: 0.45 },
  pressed: { borderBottomWidth: 1, transform: [{ translateY: 3 }] },
  label: { fontFamily: fonts.bold, fontSize: 17, color: colors.espresso },
  quietLabel: { color: colors.roast },
});
