import { Directory, File, Paths } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";
import type { ReceiptPhoto } from "./types";

const directory = () => new Directory(Paths.cache, "receipt-decoded");
export function clearReceiptCache() {
  const dir = directory();
  if (dir.exists) dir.delete();
}
export function deleteReceiptPhoto(photo: ReceiptPhoto | null) {
  if (!photo || !photo.uri.startsWith(directory().uri.replace(/\/+$/, "") + "/")) return;
  try { const file = new File(photo.uri); if (file.exists) file.delete(); } catch { /* Cleared again at next launch. */ }
}
export async function selectReceipt(source: "camera" | "library"): Promise<ReceiptPhoto | null> {
  if (source === "camera") {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera access", "Allow camera access in iOS Settings, or choose a receipt from Photos.", [
        { text: "Not now", style: "cancel" }, { text: "Open Settings", onPress: () => { void Linking.openSettings(); } }
      ]); return null;
    }
  }
  // PHPicker shares only the selected image; do not ask for full-library access.
  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], allowsEditing: false, quality: 1, exif: false, allowsMultipleSelection: false };
  let selection: ImagePicker.ImagePickerResult;
  try { selection = source === "camera" ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options); }
  catch { throw new Error(source === "camera" ? "The camera couldn’t open. Try choosing a receipt from Photos." : "Photos couldn’t open. Please try again."); }
  if (selection.canceled) return null;
  const asset = selection.assets[0];
  if (!asset.width || !asset.height || asset.width * asset.height > 50_000_000) {
    if (asset.uri.startsWith(Paths.cache.uri) && asset.uri.includes("/ImagePicker/")) { try { new File(asset.uri).delete(); } catch {} }
    throw new Error("Choose a smaller, clear photo of the whole receipt.");
  }
  const scale = Math.min(1, 2400 / asset.width, 12000 / asset.height, Math.sqrt(18_000_000 / (asset.width * asset.height)));
  const context = ImageManipulator.manipulate(asset.uri);
  if (scale < 1) context.resize({ width: Math.max(1, Math.round(asset.width * scale)) });
  let saved: { uri: string; width: number; height: number } | null = null;
  try {
    const image = await context.renderAsync();
    try { saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.92 }); }
    finally { image.release(); }
    const dir = directory(); dir.create({ intermediates: true, idempotent: true });
    const file = new File(saved.uri);
    if (!file.size || file.size > 7.5 * 1024 * 1024) throw new Error("This photo is too large. Try a smaller image that keeps the receipt text clear.");
    const destination = new File(dir, `receipt-${Date.now()}.jpg`);
    await file.move(destination);
    return { uri: destination.uri, mimeType: "image/jpeg", width: saved.width, height: saved.height, size: destination.size };
  } finally {
    context.release();
    if (saved) { try { const file = new File(saved.uri); if (file.exists) file.delete(); } catch {} }
    // ImagePicker returns its own cache copy, not the user's Photos original.
    if (asset.uri.startsWith(Paths.cache.uri) && asset.uri.includes("/ImagePicker/")) {
      try { const file = new File(asset.uri); if (file.exists) file.delete(); } catch {}
    }
  }
}
