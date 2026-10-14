import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ScreenHeader, TextAction, typography } from "@/components/ui";
import { DuplicateCard, ReviewedItem } from "@/components/DuplicateCard";
import { colors } from "@/lib/theme";
import { useReceiptSession } from "@/lib/session";
import { presentReceiptResults } from "../shared/results-presentation.mjs";

export default function ResultsScreen() {
  const router = useRouter(), session = useReceiptSession(), result = session.analysis;
  const [notesExpanded, setNotesExpanded] = useState(false), [reviewedExpanded, setReviewedExpanded] = useState(false);
  useEffect(() => { if (!result || !session.photo) router.replace("/"); }, [result, session.photo, router]);
  useEffect(() => { setNotesExpanded(false); setReviewedExpanded(false); }, [result]);
  if (!result || !session.photo) return null;
  const presentation = presentReceiptResults(result, session.reviewedIds);
  const retryPhoto = () => router.replace("/preview");
  const viewReceipt = () => router.push("/receipt");
  const another = () => Alert.alert("Clear this receipt?", "Its photo copy, results and your review selections will be removed from the app.", [{ text: "Keep reviewing", style: "cancel" }, { text: "Scan another", onPress: () => { session.reset(); router.replace("/"); } }]);
  return <SafeAreaView style={styles.screen}>
    <ScreenHeader title="Receipt check" backLabel="Clear receipt and go home" onBack={another} />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{presentation.title}</Text>
        <Text style={styles.subtitle}>{presentation.body}</Text>
        <TextAction label="View receipt ›" accessibilityLabel="View receipt" onPress={viewReceipt} />
      </View>
      {presentation.kind === "unreadable" && <Button label="Try a clearer photo" onPress={retryPhoto} />}
      <View style={styles.list}>
        {presentation.active.map(item => <DuplicateCard key={item.id} item={item} currency={result.receipt.currency} onReview={() => { session.setReviewed(item.id, true); setReviewedExpanded(false); }} />)}
      </View>
      {presentation.reviewedCount > 0 && <View style={styles.section}>
        <Pressable accessibilityRole="button" accessibilityLabel={`Reviewed (${presentation.reviewedCount})`} accessibilityState={{ expanded: reviewedExpanded }}
          onPress={() => setReviewedExpanded(value => !value)} style={styles.sectionToggle}>
          <Text style={styles.sectionTitle}>✓  Reviewed ({presentation.reviewedCount})</Text><Text accessible={false} style={styles.caret}>{reviewedExpanded ? "⌃" : "⌄"}</Text>
        </Pressable>
        {reviewedExpanded && <View style={styles.reviewedList}>{presentation.reviewed.map(item => <ReviewedItem key={item.id} item={item} onUndo={() => session.setReviewed(item.id, false)} />)}</View>}
      </View>}
      {presentation.showNotice && <View style={styles.notice}>
        <Pressable accessibilityRole="button" accessibilityLabel={presentation.notice} accessibilityState={{ expanded: notesExpanded }}
          onPress={() => setNotesExpanded(value => !value)} style={styles.sectionToggle}>
          <Text style={styles.noticeTitle}>{presentation.notice}</Text><Text accessible={false} style={styles.caret}>{notesExpanded ? "⌃" : "⌄"}</Text>
        </Pressable>
        {notesExpanded && <View style={styles.notes}>
          {presentation.incomplete && <Text style={typography.small}>Some prices or adjustments may be hard to interpret. Repeated items are not proof of incorrect billing.</Text>}
          {presentation.warnings.map((warning, index) => <Text key={`${index}-${warning}`} style={typography.small}>{warning}</Text>)}
          {presentation.incomplete && <TextAction label="Try a clearer photo" onPress={retryPhoto} />}
        </View>}
      </View>}
    </ScrollView>
    <View style={styles.footer}><Button label="Scan another receipt" onPress={another} /></View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 28 },
  hero: { paddingBottom: 14 }, title: { fontSize: 32, lineHeight: 38, fontWeight: "700", letterSpacing: -1.1, color: colors.textPrimary },
  subtitle: { fontSize: 15, lineHeight: 23, color: colors.textSecondary, marginTop: 8 },
  list: { gap: 12 }, section: { marginTop: 18, borderTopWidth: 1, borderColor: colors.border, paddingTop: 10 },
  sectionToggle: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingVertical: 8, paddingHorizontal: 2 },
  sectionTitle: { flex: 1, fontSize: 15, lineHeight: 22, fontWeight: "700", color: colors.greenText }, caret: { fontSize: 18, color: colors.greenText },
  reviewedList: { gap: 8, paddingTop: 6 }, notice: { marginTop: 22, borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 },
  noticeTitle: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: "600", color: colors.greenText }, notes: { gap: 10, paddingHorizontal: 2, paddingTop: 4 },
  footer: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8 },
});
