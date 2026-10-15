import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import { formatCents } from "@/lib/format";
import type { ReviewItem } from "../shared/results-presentation.mjs";
import { typography } from "./ui";
import type { ProductLookupState } from "@/lib/types";

function ReviewCheckbox({ name, checked, onPress }: { name: string; checked: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityLabel={checked ? `Move ${name} back to review` : `Mark ${name} as looks good`}
    accessibilityState={{ checked }} accessibilityHint={checked ? "Returns this item to the checklist." : "Moves this item to Reviewed. These charges look correct to you."}
    onPress={onPress} style={({ pressed }) => [styles.checkTarget, pressed && { opacity: 0.65 }]}>
    <View style={[styles.circle, checked && styles.checked]}>{checked && <Text allowFontScaling={false} style={styles.tick}>✓</Text>}</View>
  </Pressable>;
}

export function DuplicateCard({ item, currency, onReview, lookup, onLookup }: { item: ReviewItem; currency: string | null; onReview: () => void; lookup: ProductLookupState; onLookup: (retry?: boolean) => void }) {
  const [expanded, setExpanded] = useState(false);
  return <View style={[styles.card, !item.hasDetails && { paddingBottom: 16 }]}>
    <View style={styles.row}>
      <View style={styles.main}>
        <Text accessibilityRole="header" style={styles.name}>{item.name}</Text>
        {item.printed && <Text selectable style={styles.printed}>{item.printed}</Text>}
        <Text style={styles.amount}>{item.amount}</Text>
      </View>
      <ReviewCheckbox name={item.name} checked={false} onPress={onReview} />
    </View>
    {item.hasDetails && <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} accessibilityState={{ expanded }}
      onPress={() => { if (!expanded) onLookup(); setExpanded(value => !value); }} style={({ pressed }) => [styles.detailsTarget, pressed && { opacity: 0.65 }]}>
      <Text style={styles.detailsLabel}>{expanded ? "Hide details ⌃" : "Details ⌄"}</Text>
    </Pressable>}
    {expanded && <View style={styles.details}>
      <ProductIdentification state={lookup} onRetry={() => onLookup(true)} />
      {item.lines.length > 0 && <Text style={[typography.small, styles.detailTitle]}>Original printed lines</Text>}
      {item.lines.map(line => <View key={line.id} style={styles.charge}>
        <Text selectable style={[typography.small, styles.main]}>{line.lineType === "fee" ? "Related fee · " : line.lineType === "discount" ? "Discount · " : line.lineType === "reversal" ? "Correction · " : ""}{line.originalDescription}</Text>
        <Text style={[typography.small, styles.lineAmount]}>{formatCents(line.amountCents, currency)}</Text>
      </View>)}
      {!!item.explanation && <Text style={typography.small}>{item.explanation}</Text>}
    </View>}
  </View>;
}

function ProductIdentification({ state, onRetry }: { state: ProductLookupState; onRetry: () => void }) {
  const [linkFailed, setLinkFailed] = useState(false);
  return <View style={styles.identification} accessibilityLiveRegion="polite">
    {(state.status === "idle" || state.status === "loading") && <View style={styles.loading}>
      <ActivityIndicator size="small" color={colors.greenText} /><Text style={[typography.small, styles.main]}>Looking up this product...</Text>
    </View>}
    {(state.status === "matched" || state.status === "possible") && <>
      <Text style={[typography.small, styles.detailTitle]}>{state.status === "matched" ? "Likely product match" : "Possible product match"}</Text>
      <Text style={styles.productName}>{state.product.name}</Text>
      {!!(state.product.brand || state.product.size) && <Text style={typography.small}>{[state.product.brand, state.product.size].filter(Boolean).join(" · ")}</Text>}
      <Pressable accessibilityRole="link" accessibilityLabel={`${state.source.title}. View ${state.product.name} on ${state.source.domain}`} accessibilityHint="Opens the product source in your browser."
        onPress={() => { setLinkFailed(false); void Linking.openURL(state.source.url).catch(() => setLinkFailed(true)); }} style={styles.sourceTarget}>
        <Text style={styles.sourceLink}>{state.source.domain} · View product ↗</Text>
      </Pressable>
      {linkFailed && <Text style={typography.small}>Couldn't open this source right now.</Text>}
      <Text style={typography.small}>{state.status === "possible" ? "This may not be the exact product purchased." : state.matchReason}</Text>
    </>}
    {state.status === "not_found" && <>
      <Text style={[typography.small, styles.detailTitle]}>Product not identified online</Text>
      <Text style={typography.small}>We couldn't find a reliable match for this receipt description.</Text>
    </>}
    {state.status === "error" && <>
      <Text style={[typography.small, styles.detailTitle]}>Couldn't look up this product right now.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Try product lookup again" onPress={onRetry} style={styles.sourceTarget}><Text style={styles.sourceLink}>Try again</Text></Pressable>
    </>}
  </View>;
}

export function ReviewedItem({ item, onUndo }: { item: ReviewItem; onUndo: () => void }) {
  return <View style={styles.reviewedRow}>
    <ReviewCheckbox name={item.name} checked onPress={onUndo} />
    <View style={styles.main}><Text style={styles.reviewedName}>{item.name}</Text><Text style={typography.small}>{item.reviewedAmount}</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, borderRadius: 19, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, main: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, lineHeight: 23, fontWeight: "700", letterSpacing: -0.25, color: colors.textPrimary },
  printed: { marginTop: 5, fontSize: 12, lineHeight: 18, color: colors.textSecondary },
  amount: { marginTop: 7, fontSize: 14, lineHeight: 21, fontWeight: "600", color: colors.greenText },
  checkTarget: { width: 46, height: 46, flexShrink: 0, alignItems: "center", justifyContent: "center" },
  circle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#8A9A90", backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  checked: { backgroundColor: colors.greenText, borderColor: colors.greenText }, tick: { color: "white", fontSize: 19, lineHeight: 23, fontWeight: "700" },
  detailsTarget: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  detailsLabel: { fontSize: 13, lineHeight: 19, fontWeight: "600", color: colors.greenText },
  details: { backgroundColor: colors.background, borderRadius: 12, padding: 12, gap: 10, marginBottom: 12 },
  identification: { gap: 8, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  loading: { flexDirection: "row", alignItems: "center", gap: 8 },
  productName: { fontSize: 16, lineHeight: 23, fontWeight: "600", color: colors.textPrimary },
  sourceTarget: { minHeight: 44, justifyContent: "center" }, sourceLink: { fontSize: 13, lineHeight: 20, color: colors.greenText, textDecorationLine: "underline" },
  detailTitle: { fontWeight: "600", color: colors.textPrimary }, charge: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  lineAmount: { flexShrink: 1, textAlign: "right" },
  reviewedRow: { borderRadius: 13, backgroundColor: colors.greenBackground, paddingVertical: 8, paddingRight: 12, paddingLeft: 4, flexDirection: "row", alignItems: "center", gap: 6 },
  reviewedName: { fontSize: 14, lineHeight: 20, fontWeight: "600", color: colors.textPrimary },
});
