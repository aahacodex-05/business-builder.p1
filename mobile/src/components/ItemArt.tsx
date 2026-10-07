import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import type { MenuItem } from "../api";
import { colors } from "../theme";

/** The site's stand-in artwork for a menu item until real product photos are added. */
export function ItemArt({ kind, size }: { kind: MenuItem["kind"]; size: number }) {
  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: size * 0.07 + 6 }]}>
      <Svg viewBox="0 0 400 400" width={size} height={size}>
        <Circle cx={200} cy={200} r={140} fill={colors.orange} />
        {kind === "drink" ? (
          <G>
            <Path
              d="M170 140c-10-14 10-22 0-38M200 140c-10-14 10-22 0-38M230 140c-10-14 10-22 0-38"
              fill="none"
              stroke={colors.paper}
              strokeOpacity={0.7}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <Ellipse cx={200} cy={300} rx={104} ry={14} fill={colors.paper} />
            <Path d="M128 158h144v86a50 50 0 0 1-50 50h-44a50 50 0 0 1-50-50Z" fill={colors.paper} />
            <Path d="M272 182h14a28 28 0 0 1 0 56h-14" fill="none" stroke={colors.paper} strokeWidth={16} />
            <Circle cx={200} cy={226} r={28} fill={colors.espresso} />
            <Circle cx={200} cy={226} r={17} fill={colors.orange} />
          </G>
        ) : (
          <G>
            <Path d="M126 150h148l14 158H112Z" fill="#c89b6d" />
            <Path d="M126 150h148v26H126Z" fill="#b0835a" />
            <Circle cx={200} cy={242} r={34} fill={colors.espresso} />
            <Circle cx={200} cy={242} r={21} fill={colors.orange} />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { backgroundColor: colors.fir, overflow: "hidden" },
});
