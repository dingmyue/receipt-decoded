import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "@/lib/theme";
import { formatCents } from "@/lib/format";
import { potentialExtraCents } from "../shared/receipt-math.mjs";
import type { DuplicateGroup, ReceiptLineItem } from "@/lib/types";
import { Button, TextAction, typography } from "./ui";
export function DuplicateCard({ group, lines, currency, quantity, onConfirm }: {
  group: DuplicateGroup; lines: ReceiptLineItem[]; currency: string | null; quantity: number | null; onConfirm: (quantity: number | null) => void;
}) {
  const [expanded, setExpanded] = useState(false), [custom, setCustom] = useState("");
  const n = group.recordedQuantity;
  const expected = quantity !== null && n !== null && quantity >= n;
  const amount = expected ? 0 : potentialExtraCents(group.units, quantity ?? 1);
  const amountKnown = amount !== null && currency !== null;
  const options = n && n <= 5 ? Array.from({ length: n }, (_, i) => i + 1) : [];
  return <View style={styles.card}>
    <Text style={[styles.status, { color: expected ? colors.greenText : colors.amberText }]}>{expected ? "Likely expected" : quantity !== null ? "Possible mistake" : "Needs your check"}</Text>
    <View style={{ gap: 4 }}><Text style={typography.cardTitle}>{group.productName}</Text><Text style={typography.small}>{n !== null ? `${n} recorded on receipt` : "Quantity unclear"}</Text>
      {group.originalDescription !== group.productName && <Text selectable style={styles.description}>Printed: {group.originalDescription}</Text>}
    </View>
    <View style={{ gap: 4 }}>{expected || amountKnown ? <><Text adjustsFontSizeToFit={!expected} minimumFontScale={0.5} numberOfLines={expected ? undefined : 1} style={[styles.amount, expected && { color: colors.greenText }]}>{expected ? "Charges appear expected" : `Potential extra ${formatCents(amount, currency)}`}</Text><Text style={typography.small}>{quantity !== null ? `Based on ${quantity} purchased.` : "If you bought one."}</Text></> : <Text style={typography.small}>Extra charge couldn't be estimated.</Text>}</View>
    {n !== null && <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>How many did you buy?</Text>}
    {options.length > 0 && <View style={styles.choices}>{options.map((value) => <Pressable key={value} accessibilityRole="button" accessibilityLabel={value === n ? `${value} or more purchased` : `${value} purchased`} accessibilityState={{ selected: quantity === value }} onPress={() => onConfirm(value)} style={[styles.choice, quantity === value && styles.selected]}><Text style={{ color: quantity === value ? "white" : colors.textPrimary, fontSize: 15, fontWeight: "500" }}>{value === n ? `${value} or more` : value}</Text></Pressable>)}<Pressable accessibilityRole="button" accessibilityLabel="Not sure about purchased quantity" accessibilityState={{ selected: quantity === null }} onPress={() => { setCustom(""); onConfirm(null); }} style={[styles.choice, quantity === null && styles.unsureSelected]}><Text style={{ color: colors.textPrimary, fontSize: 15 }}>Not sure</Text></Pressable></View>}
    {n !== null && !options.length && <View style={{ gap: 10 }}><TextInput accessibilityLabel="Actual purchased quantity" value={custom} onChangeText={(v) => setCustom(v.replace(/[^0-9]/g, "").slice(0, 3))} keyboardType="number-pad" placeholder="Enter quantity" placeholderTextColor={colors.textSecondary} style={styles.input} /><Button label="Confirm quantity" secondary disabled={!custom || Number(custom) < 1 || Number(custom) > 500} onPress={() => onConfirm(Number(custom))} /><TextAction label="Not sure" selected={quantity === null} onPress={() => { setCustom(""); onConfirm(null); }} /></View>}
    {n === null && <Text style={typography.small}>Quantity couldn't be read. View receipt to check.</Text>}
    <TextAction label={expanded ? "Hide charge details" : "Show charge details"} expanded={expanded} onPress={() => setExpanded((value) => !value)} />
    {expanded && <View style={styles.details}>
      <Text style={typography.small}>Original description{group.productCode ? ` · Item #${group.productCode}` : ""}</Text><Text selectable style={styles.description}>{group.originalDescription}</Text>
      {lines.map((line) => <View key={line.id} style={styles.charge}><Text style={[typography.small, { flex: 1, color: colors.textPrimary }]}>{line.lineType === "fee" ? "Related fee · " : line.lineType === "discount" ? "Discount · " : line.lineType === "reversal" ? "Correction · " : ""}{line.originalDescription}</Text><Text style={[typography.small, { color: colors.textPrimary, textAlign: "right", flexShrink: 1 }]}>{formatCents(line.amountCents, currency)}</Text></View>)}
      <Text style={typography.small}>{group.explanation}</Text><Text style={typography.small}>Estimate includes readable linked fees and discounts, not tax adjustments. Verify with the store.</Text>
    </View>}
  </View>;
}
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: colors.border, gap: 12 }, status: { fontSize: 13, lineHeight: 20, fontWeight: "600" }, description: { fontSize: 13, lineHeight: 20, color: colors.textSecondary, fontFamily: "Menlo" }, amount: { color: colors.textPrimary, fontSize: 21, lineHeight: 28, fontWeight: "600" }, charge: { flexDirection: "row", alignItems: "flex-start", gap: 12 }, choices: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, choice: { minHeight: 46, minWidth: 56, paddingHorizontal: 14, paddingVertical: 12, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border }, selected: { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }, unsureSelected: { borderColor: colors.textSecondary }, details: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, gap: 12 }, input: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.textPrimary, minHeight: 48 } });
