# App icon

Selected October 13, 2026. The owner supplied Smart Receipt Scanner Icon.png. The built-in image generation tool adapted only its outer presentation for a full-square iOS asset.

- Original supplied artwork: user-icon-original.png
- Previous icon backup: previous-icon.png
- Edited master: ../../assets/icon-master.png
- App-configured export: ../../assets/icon.png (1024×1024, opaque sRGB PNG)
- Regenerate: pnpm assets:generate. The script uses the selected master and preserves the existing splash design.
- The background fills all four square corners; iOS supplies the system mask.
- Changes appear in the next native build. Expo Go is not a home-screen icon verification build.

## Edit prompt

Use case: precise-object-edit. Asset type: final iOS app icon bitmap, square 1024 x 1024. Image 1 is the edit target, not just a style reference. Change only the icon's outer presentation: remove the entire off-white outside margin, outer drop shadow and baked-in rounded-square silhouette. Make the dark teal textured gradient background fill the complete square edge to edge, including all four sharp 90-degree canvas corners. Reframe the existing dark tile to fill the canvas while preserving its centered cream receipt with golden folded upper-right corner, four text bars (two golden middle bars), four mint scanner brackets, their proportions, positions, soft 3D lighting and colors as faithfully as possible. Preserve safe spacing around the scanner brackets so iOS masking will not clip them. No rounded outer border, no surrounding white/off-white canvas, no inset tile, no transparent pixels, no extra badge, no added checkmark, no text, no redesign. The deliverable is the flat full-bleed square artwork itself, not a phone mockup; Apple will apply its own icon mask.

