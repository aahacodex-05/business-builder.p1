import { useState, type ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { colors, fonts } from "../theme";
import { Button } from "./Button";

type Props = {
  title: string;
  lead?: string;
  submitLabel: string;
  canSubmit: boolean;
  /** Throws to show its message under the form. */
  onSubmit: () => Promise<void>;
  children: ReactNode;
  footer?: ReactNode;
};

/** The staff sign-in and sign-up screens: fields, an error line and one button. */
export function Form({ title, lead, submitLabel, canSubmit, onSubmit, children, footer }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {lead && <Text style={styles.lead}>{lead}</Text>}
        {children}
        {error && <Text style={styles.error}>{error}</Text>}
        <Button label={submitLabel} onPress={submit} disabled={!canSubmit} busy={busy} />
        {footer}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, gap: 14 },
  title: { fontFamily: fonts.display, fontSize: 30, color: colors.ink },
  lead: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, color: colors.muted },
  error: { fontFamily: fonts.bold, fontSize: 15, color: "#b3261e" },
});
