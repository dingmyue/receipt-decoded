import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScreenHeader, TextAction, typography } from "@/components/ui";
import { ReceiptImage } from "@/components/ReceiptImage";
import { colors } from "@/lib/theme";
import { useReceiptSession } from "@/lib/session";
import { useAIConsent } from "@/lib/ai-consent";
import { selectReceipt } from "@/lib/receipt-photo";
import { ReceiptError } from "@/lib/ai-client";
export default function PreviewScreen() {
  const router = useRouter(), session = useReceiptSession(), consent = useAIConsent(), { check } = useLocalSearchParams<{ check?: string }>();
  const [error, setError] = useState<string | null>(null), [replacing, setReplacing] = useState(false);
  const [message, setMessage] = useState(0), selecting = useRef(false), starting = useRef(false), askingConsent = useRef(false);
  useFocusEffect(useCallback(() => { askingConsent.current = false; }, []));
  useEffect(() => { if (!session.photo) router.replace("/"); }, [session.photo]);
  useEffect(() => { if (!session.analyzing) { setMessage(0); return; } const timer = setInterval(() => setMessage((m) => Math.min(2, m + 1)), 4000); return () => clearInterval(timer); }, [session.analyzing]);
  const close = () => { session.reset(); router.replace("/"); };
  const replace = async (source: "camera" | "library") => {
    if (selecting.current || session.analyzing) return; selecting.current = true; setReplacing(true);
    try { const photo = await selectReceipt(source); if (photo) { session.setPhoto(photo); setError(null); } }
    catch (e) { setError(e instanceof Error ? e.message : "Choose another photo."); } finally { selecting.current = false; setReplacing(false); }
  };
  const changePhoto = () => ActionSheetIOS.showActionSheetWithOptions({ options: ["Cancel", "Camera", "Photos"], cancelButtonIndex: 0 }, (index) => { if (index === 1 || index === 2) void replace(index === 1 ? "camera" : "library"); });
  const analyze = async () => {
    if (starting.current || session.analyzing || selecting.current) return;
    if (!consent.hasConsent()) { if (!askingConsent.current) { askingConsent.current = true; router.push("/consent"); } return; }
    starting.current = true; setError(null);
    try { await session.analyze(); router.replace("/results"); }
    catch (e) { if (!(e instanceof ReceiptError && e.code === "CANCELED")) setError(e instanceof Error ? e.message : "This receipt couldn't be checked. Please try again."); }
    finally { starting.current = false; }
  };
  useEffect(() => { if (check === "1") { router.setParams({ check: undefined }); void analyze(); } }, [check]);
  if (!session.photo) return null;
  if (session.analyzing) return <SafeAreaView style={styles.screen}><ScreenHeader title="Checking receipt" backLabel="Cancel receipt check" onBack={session.cancel} />
    <ScrollView contentContainerStyle={styles.loading}><ActivityIndicator size="large" color={colors.textPrimary} /><Text accessibilityLiveRegion="polite" accessibilityRole="header" style={[typography.cardTitle, { textAlign: "center", marginTop: 24 }]}>{["Reading your receipt…", "Looking for duplicate charges…", "Checking your results…"][message]}</Text></ScrollView>
    <View style={styles.footer}><Button label="Cancel check" secondary onPress={session.cancel} /></View></SafeAreaView>;
  return <SafeAreaView style={styles.screen}><ScreenHeader title="Review receipt" onBack={close} backLabel="Discard receipt and go home" />
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={typography.body}>Make sure the whole receipt and prices are clear.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="View and zoom receipt photo" onPress={() => router.push("/receipt")}><ReceiptImage photo={session.photo} /><Text style={[typography.small, { textAlign: "center", marginTop: 8 }]}>Tap to zoom</Text></Pressable>
      <View style={{ alignItems: "center" }}><TextAction label={replacing ? "Preparing photo…" : "Change photo"} disabled={replacing} onPress={changePhoto} /></View>
      {error && <View accessibilityLiveRegion="assertive" style={styles.error}><Text style={[typography.body, { color: colors.errorText }]}>{error}</Text></View>}
    </ScrollView>
    <View style={styles.footer}><Button label={error ? "Try again" : "Check receipt"} disabled={replacing || !consent.ready} onPress={() => { void analyze(); }} />
      <View style={styles.processing}><Text style={typography.small}>Checked with OpenAI · </Text><TextAction label="Privacy" onPress={() => router.push("/privacy")} /></View>
    </View></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 24, gap: 16, paddingBottom: 12 }, loading: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 32 }, footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, borderTopWidth: 1, borderColor: colors.border }, processing: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "center" }, error: { padding: 16, borderRadius: 16, backgroundColor: colors.errorBackground } });
