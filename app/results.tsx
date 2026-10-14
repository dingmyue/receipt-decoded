import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScreenHeader, TextAction, typography } from "@/components/ui";
import { DuplicateCard } from "@/components/DuplicateCard";
import { colors } from "@/lib/theme";
import { formatCents, formatDate } from "@/lib/format";
import { useReceiptSession } from "@/lib/session";
import { presentReceiptResults } from "../shared/results-presentation.mjs";
export default function ResultsScreen() {
  const router = useRouter(), session = useReceiptSession(), result = session.analysis;
  const [notesExpanded, setNotesExpanded] = useState(false);
  useEffect(() => { if (!result || !session.photo) router.replace("/"); }, [result, session.photo]);
  if (!result || !session.photo) return null;
  const { receipt, duplicateGroups: groups, analysis } = result;
  const presentation = presentReceiptResults(result, session.quantities);
  const retryPhoto = () => router.replace("/preview");
  const viewReceipt = () => router.push("/receipt");
  const another = () => Alert.alert("Clear this receipt?", "Its photo copy, results and your answers will be removed from the app.", [{ text: "Keep reviewing", style: "cancel" }, { text: "Scan another", onPress: () => { session.reset(); router.replace("/"); } }]);
  return <SafeAreaView style={styles.screen}><ScreenHeader title="Receipt check" backLabel="Clear receipt and go home" onBack={another} /><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
    {presentation.showMetadata && <View style={{ gap: 4 }}><Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>{receipt.merchantName ?? "Your shopping receipt"}</Text>
      <View style={styles.metadata}>{receipt.purchaseDate && <Text style={typography.small}>{formatDate(receipt.purchaseDate)}</Text>}{receipt.totalCents !== null && <Text style={typography.small}>Total {formatCents(receipt.totalCents, receipt.currency)}</Text>}</View>
    </View>}
    <View accessibilityLiveRegion="polite" style={[styles.summary, { backgroundColor: presentation.tone === "green" ? colors.greenBackground : colors.amberBackground }]}>
      <Text accessibilityRole="header" style={[typography.cardTitle, { fontSize: 25, lineHeight: 32 }]}>{presentation.title}</Text>
      {presentation.body && <Text style={[typography.body, { marginTop: 8, color: colors.textPrimary }]}>{presentation.body}</Text>}
      {presentation.amountCents !== null && <View style={{ gap: 4, marginTop: 14 }}><Text style={typography.small}>{presentation.amountLabel}</Text><Text adjustsFontSizeToFit minimumFontScale={0.5} numberOfLines={1} style={styles.money}>{formatCents(presentation.amountCents, receipt.currency)}</Text><Text style={typography.small}>{presentation.amountQualifier}</Text></View>}
      {presentation.kind === "unreadable" ? <View style={{ marginTop: 16 }}><Button label="Try a clearer photo" onPress={retryPhoto} /><TextAction label="View receipt" onPress={viewReceipt} /></View> : presentation.showRetry && <View style={styles.recovery}><TextAction label="View receipt" onPress={viewReceipt} /><TextAction label="Try a clearer photo" onPress={retryPhoto} /></View>}
    </View>
    {presentation.showItems && groups.map((group) => <DuplicateCard key={group.id} group={group} currency={receipt.currency} lines={result.lineItems.filter((line) => group.relatedLineItemIds.includes(line.id))} quantity={session.quantities[group.id] ?? null} onConfirm={(quantity) => session.confirm(group.id, quantity)} />)}
    {presentation.showDetails && <View><TextAction label={presentation.kind === "uncertain" ? "Why this check is incomplete" : "Check notes"} expanded={notesExpanded} onPress={() => setNotesExpanded((value) => !value)} />{notesExpanded && <View style={{ gap: 12, paddingTop: 8 }}>{analysis.warnings.map((warning, index) => <Text key={index} style={typography.small}>{warning}</Text>)}{presentation.kind === "uncertain" && !receipt.currency && <Text style={typography.small}>The currency couldn't be established, so calculated extra charges aren't shown.</Text>}<Text style={typography.small}>Estimates include readable linked fees and discounts, not tax adjustments. Verify with the store.</Text></View>}</View>}
    {!presentation.showRetry && <TextAction label="View receipt" onPress={viewReceipt} />}
    {presentation.kind !== "unreadable" && <Button label="Scan another receipt" onPress={another} />}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: colors.background }, content: { padding: 24, gap: 16, paddingBottom: 36 }, metadata: { flexDirection: "row", flexWrap: "wrap", gap: 12 }, summary: { padding: 20, borderRadius: 24 }, money: { color: colors.textPrimary, fontSize: 40, lineHeight: 49, fontWeight: "600", letterSpacing: -0.8 }, recovery: { flexDirection: "row", flexWrap: "wrap", gap: 20, marginTop: 4 } });
