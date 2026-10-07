import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme";

const MAX_QUANTITY = 20;

/** Quantity picker; the minimum is 0 in the bag (removes the line) and 1 on an item page. */
type Props = { value: number; onChange: (value: number) => void; min?: number };

export function Stepper({ value, onChange, min = 0 }: Props) {
  return (
    <View style={styles.stepper}>
      <Step
        icon={value === 1 && min === 0 ? "trash-outline" : "remove"}
        label={value === 1 && min === 0 ? "Remove" : "Fewer"}
        disabled={value <= min}
        onPress={() => onChange(value - 1)}
      />
      <Text style={styles.value}>{value}</Text>
      <Step icon="add" label="More" disabled={value >= MAX_QUANTITY} onPress={() => onChange(value + 1)} />
    </View>
  );
}

type StepProps = { icon: keyof typeof Ionicons.glyphMap; label: string; disabled: boolean; onPress: () => void };

function Step({ icon, label, disabled, onPress }: StepProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={[styles.step, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={18} color={colors.espresso} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  step: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.latte,
  },
  disabled: { opacity: 0.35 },
  value: { minWidth: 22, textAlign: "center", fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
});
