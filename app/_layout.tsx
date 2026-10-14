import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";
import { ReceiptSessionProvider, useReceiptSession } from "@/lib/session";
import { AIConsentProvider, useAIConsent } from "@/lib/ai-consent";
void SplashScreen.preventAutoHideAsync().catch(() => {});
function Navigation() {
  const { ready, privateScreen } = useReceiptSession();
  const { ready: consentReady } = useAIConsent();
  useEffect(() => { if (ready && consentReady) void SplashScreen.hideAsync().catch(() => {}); }, [ready, consentReady]);
  if (!ready || !consentReady) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <View style={{ flex: 1 }}><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: "slide_from_right" }}><Stack.Screen name="consent" options={{ presentation: "formSheet", sheetAllowedDetents: [0.85, 1], sheetGrabberVisible: true }} /></Stack>
    {privateScreen && <View accessibilityElementsHidden style={styles.privacy}><Text style={{ color: colors.textPrimary, fontSize: 20 }}>Receipt Decoded</Text></View>}
  </View>;
}
export default function RootLayout() { return <SafeAreaProvider><AIConsentProvider><ReceiptSessionProvider><Navigation /></ReceiptSessionProvider></AIConsentProvider></SafeAreaProvider>; }
const styles = StyleSheet.create({ privacy: { ...StyleSheet.absoluteFill, zIndex: 1000, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" } });
