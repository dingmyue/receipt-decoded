import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScreenHeader, TextAction, typography } from "@/components/ui";
import { colors } from "@/lib/theme";
import { useReceiptSession } from "@/lib/session";
import { useAIConsent } from "@/lib/ai-consent";
export default function Settings() {
  const router = useRouter(), session = useReceiptSession(), consent = useAIConsent();
  const [revoking, setRevoking] = useState(false), [revokeError, setRevokeError] = useState(false);
  const revoke = async () => {
    session.cancel(); setRevoking(true);
    try { await consent.revoke(); setRevokeError(false); }
    catch { setRevokeError(true); }
    finally { setRevoking(false); }
  };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScreenHeader title="About & privacy" onBack={() => router.back()} /><ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 36 }}>
    <View style={{ gap: 6 }}><Text style={typography.cardTitle}>Receipt Decoded</Text><Text style={typography.small}>Version {Constants.expoConfig?.version ?? "1.0.0"}</Text></View>
    <View style={{ gap: 6 }}><Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>AI receipt checks</Text><Text accessibilityLiveRegion="polite" style={typography.body}>{consent.allowed ? "Allowed" : "Permission needed before your next check"}</Text>
      {(consent.allowed || revokeError) && <TextAction label={revoking ? "Turning off…" : revokeError ? "Retry turning off permission" : "Turn off permission"} disabled={revoking} onPress={() => { void revoke(); }} />}
      {revokeError && <Text accessibilityLiveRegion="assertive" style={[typography.small, { color: colors.errorText }]}>Permission is off for this session, but couldn't be saved. Retry before closing the app.</Text>}
    </View>
    <View style={{ backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 18 }}>{[{ label: "Privacy Policy", route: "/privacy" }, { label: "Support / Contact", route: "/support" }, { label: "Terms of Use", route: "/terms" }].map(({ label, route }) => <Pressable key={route} accessibilityRole="button" onPress={() => router.push(route as "/privacy" | "/support" | "/terms")} style={{ minHeight: 58, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, borderBottomWidth: route === "/terms" ? 0 : 1, borderColor: colors.border }}><Text style={[typography.body, { color: colors.textPrimary, flexShrink: 1 }]}>{label}</Text><Text allowFontScaling={false} style={{ fontSize: 24, color: colors.textSecondary }}>›</Text></Pressable>)}</View>
    <Text style={typography.small}>AI can misread charges. Verify possible errors with the store.</Text>
    {session.photo && <Button label="Clear current receipt" secondary onPress={() => Alert.alert("Clear current receipt?", "This removes the app's temporary photo copy, result and your quantity answers. Your Photos original is kept.", [{ text: "Cancel", style: "cancel" }, { text: "Clear Receipt", style: "destructive", onPress: () => { session.reset(); router.replace("/"); } }])} />}
  </ScrollView></SafeAreaView>;
}
