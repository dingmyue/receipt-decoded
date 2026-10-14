import type { ConfigContext, ExpoConfig } from 'expo/config';
import info from './shared/app-info.json';
// Only a confirmed Apple team identifier is added. No backend secrets are read here.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Receipt Decoded',
  slug: config.slug ?? 'receipt-decoded',
  ios: { ...config.ios, ...(/^[A-Z0-9]{10}$/.test(info.appleTeamId) ? { appleTeamId: info.appleTeamId } : {}) }
});
