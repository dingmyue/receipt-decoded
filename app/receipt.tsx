import { useRouter } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "@/components/ui";
import { ReceiptImage } from "@/components/ReceiptImage";
import { useReceiptSession } from "@/lib/session";
import { colors } from "@/lib/theme";
export default function OriginalReceipt() {
  const router = useRouter(), { photo } = useReceiptSession();
  useEffect(() => { if (!photo) router.replace("/"); }, [photo]);
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><ScreenHeader title="Your Receipt" onBack={() => router.back()} />{photo && <ReceiptImage photo={photo} zoom />}</SafeAreaView>;
}
