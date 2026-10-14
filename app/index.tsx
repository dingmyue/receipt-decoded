import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ReceiptMark, typography } from "@/components/ui";
import { colors } from "@/lib/theme";
import { selectReceipt } from "@/lib/receipt-photo";
import { useReceiptSession } from "@/lib/session";
export default function HomeScreen() {
  const router = useRouter(), session = useReceiptSession();
  const [preparing, setPreparing] = useState(false), selecting = useRef(false);
  const choose = async (source: "camera" | "library") => {
    if (selecting.current) return; selecting.current = true; setPreparing(true);
    try { const photo = await selectReceipt(source); if (photo) { session.setPhoto(photo); router.push("/preview"); } }
    catch (error) { Alert.alert("Choose another photo", error instanceof Error ? error.message : "We couldn't open this photo. Try another image."); }
    finally { selecting.current = false; setPreparing(false); }
  };
  return <SafeAreaView style={styles.screen}><View style={styles.header}>
    <Text style={styles.brand}>Receipt Decoded</Text><Pressable accessibilityRole="button" accessibilityLabel="About & privacy" onPress={() => router.push("/settings")} style={styles.info}><Text allowFontScaling={false} style={styles.infoText}>i</Text></Pressable>
  </View><ScrollView contentContainerStyle={styles.content} bounces={false}>
    <View style={styles.hero}><View style={styles.mark}><ReceiptMark size={124} /></View>
      <Text accessibilityRole="header" style={[typography.title, styles.heading]}>Every charge,{"\n"}explained.</Text>
      <Text style={[typography.body, styles.supporting]}>Spot possible duplicate charges.</Text>
    </View>
    <View style={styles.actions}><Button label={preparing ? "Preparing photo…" : "Scan Receipt"} busy={preparing} onPress={() => { void choose("camera"); }} />
      <Button label="Choose from Photos" secondary disabled={preparing} onPress={() => { void choose("library"); }} />
      <Text style={[typography.small, styles.disclosure]}>Private by choice. Checked with OpenAI.</Text>
    </View></ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, header: { flexDirection: "row", paddingHorizontal: 24, paddingVertical: 8, alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { flexShrink: 1, color: colors.textPrimary, fontSize: 17, fontWeight: "600" }, info: { width: 44, height: 44, alignItems: "center", justifyContent: "center" }, infoText: { borderWidth: 1.5, borderColor: colors.textSecondary, borderRadius: 12, width: 24, height: 24, textAlign: "center", fontSize: 16, color: colors.textSecondary, fontWeight: "600" },
  content: { flexGrow: 1, padding: 24, justifyContent: "space-between", gap: 24 }, hero: { flexGrow: 1, justifyContent: "center", paddingVertical: 20 }, mark: { marginBottom: 24 },
  heading: { fontSize: 40, lineHeight: 47 }, supporting: { marginTop: 18 }, actions: { gap: 12 }, disclosure: { textAlign: "center", marginTop: 8, paddingHorizontal: 8 }
});
