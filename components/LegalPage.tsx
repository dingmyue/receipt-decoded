import { useRouter } from "expo-router";
import { useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import info from "../shared/app-info.json";
import legal from "../shared/legal-copy.json";
import { colors } from "@/lib/theme";
import { Button, ScreenHeader, TextAction, typography } from "./ui";
export function LegalPage({ kind }: { kind: "privacy" | "support" | "terms" }) {
  const router = useRouter(), page = legal[kind];
  const [expanded, setExpanded] = useState<string | null>(null);
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(info.supportEmail);
  const contact = () => { void Linking.openURL(`mailto:${info.supportEmail}?subject=Receipt%20Decoded%20Support`).catch(() => {}); };
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScreenHeader title={page.title} onBack={() => router.back()} /><ScrollView contentContainerStyle={{ padding: 24, gap: 24, paddingBottom: 40 }}>
    {kind === "support" ? <View style={{ gap: 12 }}><Text style={typography.cardTitle}>Need a hand?</Text><Text style={typography.body}>Tell us what happened and your app version. Avoid sharing payment or personal information.</Text>{validEmail ? <Button label="Contact support" onPress={contact} /> : <Text style={typography.body}>Support email: {info.supportEmail}</Text>}</View> : <Text style={typography.body}>{page.intro}</Text>}
    {page.sections.map((section) => <View key={section.title} style={{ gap: 8 }}>{kind === "support" ? <TextAction label={section.title} expanded={expanded === section.title} onPress={() => setExpanded((value) => value === section.title ? null : section.title)} /> : <Text accessibilityRole="header" style={typography.cardTitle}>{section.title}</Text>}{(kind !== "support" || expanded === section.title) && <Text style={typography.body}>{section.body}</Text>}</View>)}
    <View style={{ gap: 6, borderTopWidth: 1, borderColor: colors.border, paddingTop: 20 }}><Text style={typography.small}>Publisher: {info.publisherName}</Text><Text style={typography.small}>Contact: {info.supportEmail}</Text><Text style={typography.small}>Effective date: {info.effectiveDate}</Text></View>
    {validEmail && kind !== "support" && <Button label="Contact Support" secondary onPress={contact} />}
    {kind === "privacy" && <Button label="OpenAI Data Controls" secondary onPress={() => { void Linking.openURL("https://developers.openai.com/api/docs/guides/your-data"); }} />}
  </ScrollView></SafeAreaView>;
}
