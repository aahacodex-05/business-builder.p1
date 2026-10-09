import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts, radius } from "../theme";

/** A labeled text input for the staff forms. */
export function Field({ label, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        autoCorrect={false}
        style={styles.input}
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  input: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: colors.ink,
    padding: 14,
    borderRadius: radius,
    backgroundColor: colors.white,
  },
});
