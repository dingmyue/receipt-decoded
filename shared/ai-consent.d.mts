export const AI_CONSENT_VERSION: number;
export function createConsentStore(storage: { read: () => Promise<string>; write: (value: string) => Promise<void>; remove?: () => Promise<void> }): {
  hasConsent: () => boolean;
  load: () => Promise<boolean>;
  allow: () => Promise<boolean>;
  revoke: () => Promise<void>;
};
