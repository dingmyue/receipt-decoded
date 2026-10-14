import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, TextAction, typography } from "@/components/ui";
import { useAIConsent } from "@/lib/ai-consent";
import { colors } from "@/lib/theme";
export default function ConsentSheet() {
  const router = useRouter(), consent = useAIConsent();
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null), saving = useRef(false);
  const allow = async () => {
    if (saving.current) return;
    saving.current = true; setBusy(true); setError(null);
    try { if (await consent.allow()) router.dismissTo({ pathname: "/preview", params: { check: "1" } }); }
    catch { setError("Permission couldn't be saved. No photo was sent. Please try again."); }
    finally { saving.current = false; setBusy(false); }
  };
  return <SafeAreaView edges={["bottom"]} style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text accessibilityRole="header" style={[typography.title, { fontSize: 28, lineHeight: 35 }]}>Allow receipt checks with OpenAI?</Text>
      <Text style={typography.body}>To find possible duplicate charges, we send your full receipt photo through our service to OpenAI. It may contain personal or payment details.</Text>
      <Text style={typography.body}>OpenAI may retain content for abuse monitoring. We don't save receipt history.</Text>
      <Text style={typography.body}>Your choice applies to future receipt checks on this device. You can turn it off in About &amp; privacy.</Text>
      <TextAction label="Privacy Policy" onPress={() => router.push("/privacy")} disabled={busy} />
      {error && <Text accessibilityLiveRegion="assertive" style={[typography.body, { color: colors.errorText }]}>{error}</Text>}
    </ScrollView>
    <View style={styles.footer}><Button label="Allow and check receipt" busy={busy} onPress={() => { void allow(); }} /><TextAction label="Not now" disabled={busy} onPress={() => router.back()} /></View>
  </SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 24, paddingTop: 32, gap: 18 }, footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12, gap: 4, borderTopWidth: 1, borderColor: colors.border } });
