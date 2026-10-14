import { useRef } from "react";
import { Image, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { colors } from "@/lib/theme";
import { typography } from "./ui";
import type { ReceiptPhoto } from "@/lib/types";
export function ReceiptImage({ photo, zoom = false }: { photo: ReceiptPhoto; zoom?: boolean }) {
  const { width, height } = useWindowDimensions(); const imageWidth = width - 40;
  const scroll = useRef<ScrollView>(null);
  if (!zoom) return <Image source={{ uri: photo.uri }} accessibilityLabel="Your selected receipt photo" style={{ width: "100%", height: 300, borderRadius: 16, backgroundColor: colors.surface }} resizeMode="contain" />;
  const zoomTo = (scale: number) => scroll.current?.scrollResponderZoomTo({ x: 0, y: 0, width: width / scale, height: Math.max(200, height - 220) / scale, animated: true });
  return <View style={{ flex: 1 }}><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 24, paddingHorizontal: 20 }}>
    <Pressable accessibilityRole="button" accessibilityLabel="Zoom into receipt" onPress={() => zoomTo(2)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.greenText, fontWeight: "600", fontSize: 15 }}>Zoom in</Text></Pressable>
    <Pressable accessibilityRole="button" accessibilityLabel="Reset receipt zoom" onPress={() => zoomTo(1)} style={{ minHeight: 44, justifyContent: "center" }}><Text style={{ color: colors.greenText, fontWeight: "600", fontSize: 15 }}>Reset zoom</Text></Pressable>
  </View><Text style={[typography.small, { textAlign: "center", paddingBottom: 12 }]}>Pinch to zoom · Scroll to read</Text>
    <ScrollView ref={scroll} minimumZoomScale={1} maximumZoomScale={4} bouncesZoom centerContent contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}>
      <Image source={{ uri: photo.uri }} accessibilityLabel="Original receipt photo" resizeMode="contain" style={{ width: imageWidth, height: imageWidth * photo.height / photo.width, backgroundColor: "white" }} />
    </ScrollView></View>;
}
