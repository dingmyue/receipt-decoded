import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { colors } from "@/lib/theme";
export function Button({ label, onPress, secondary = false, disabled = false, busy = false, style }: {
  label: string; onPress: () => void; secondary?: boolean; disabled?: boolean; busy?: boolean; style?: StyleProp<ViewStyle>;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled: disabled || busy, busy }}
    disabled={disabled || busy} onPress={onPress} style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || busy) && styles.disabled, pressed && { opacity: 0.8 }, style]}>
    {busy ? <ActivityIndicator color={secondary ? colors.textPrimary : "white"} /> : <Text style={[styles.buttonText, secondary && { color: colors.textPrimary }]}>{label}</Text>}
  </Pressable>;
}
export function ScreenHeader({ title, onBack, backLabel = "Back" }: { title: string; onBack: () => void; backLabel?: string }) {
  return <View style={styles.header}><Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={backLabel} hitSlop={6} style={styles.back}><Text allowFontScaling={false} style={styles.backText}>‹</Text></Pressable><Text accessibilityRole="header" style={styles.headerTitle}>{title}</Text><View style={{ width: 44 }} /></View>;
}
export function TextAction({ label, onPress, disabled = false, expanded, selected, accessibilityLabel }: { label: string; onPress: () => void; disabled?: boolean; expanded?: boolean; selected?: boolean; accessibilityLabel?: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled, expanded, selected }} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, paddingVertical: 10, justifyContent: "center", opacity: disabled ? 0.45 : pressed ? 0.7 : 1 })}><Text style={{ color: colors.greenText, fontSize: 15, lineHeight: 22, fontWeight: "500" }}>{label}</Text></Pressable>;
}
export function ReceiptMark({ size = 100 }: { size?: number }) {
  return <View accessible={false} style={{ width: size, height: size * 1.15, alignItems: "center", justifyContent: "center" }}>
    <View style={{ width: size * 0.7, height: size, borderRadius: size * 0.1, backgroundColor: "white", borderColor: colors.border, borderWidth: 1.5, padding: size * 0.13, gap: size * 0.08, transform: [{ rotate: "-5deg" }] }}>
      {[0, 1, 2, 3].map((i) => <View key={i} style={{ height: size * 0.07, borderRadius: 3, width: i === 3 ? "65%" : "100%", backgroundColor: i === 1 || i === 2 ? colors.accent : colors.border }} />)}
    </View>
  </View>;
}
export const typography = StyleSheet.create({
  title: { fontSize: 34, lineHeight: 41, fontWeight: "600", color: colors.textPrimary, letterSpacing: -0.6 },
  body: { fontSize: 16, lineHeight: 24, color: colors.textSecondary },
  label: { fontSize: 12, lineHeight: 18, letterSpacing: 1.4, fontWeight: "600", color: colors.textSecondary },
  cardTitle: { fontSize: 20, lineHeight: 27, fontWeight: "600", color: colors.textPrimary },
  small: { fontSize: 13, lineHeight: 20, color: colors.textSecondary }
});
const styles = StyleSheet.create({
  button: { minHeight: 56, borderRadius: 16, backgroundColor: colors.textPrimary, padding: 16, alignItems: "center", justifyContent: "center" },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border }, disabled: { opacity: 0.45 },
  buttonText: { fontSize: 17, fontWeight: "600", color: "white", textAlign: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  back: { width: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }, backText: { fontSize: 36, color: colors.textPrimary, lineHeight: 40 },
  headerTitle: { flexShrink: 1, textAlign: "center", fontSize: 17, fontWeight: "600", color: colors.textPrimary }
});
