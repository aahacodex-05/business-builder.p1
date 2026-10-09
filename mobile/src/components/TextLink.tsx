import { Link, type Href } from "expo-router";
import { StyleSheet } from "react-native";
import { colors, fonts } from "../theme";

export function TextLink({ href, label }: { href: Href; label: string }) {
  return (
    <Link href={href} style={styles.link}>
      {label}
    </Link>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: fonts.bold, fontSize: 15, color: colors.orangeInk, textAlign: "center", padding: 6 },
});
