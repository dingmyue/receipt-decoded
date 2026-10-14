import { File, Paths } from "expo-file-system";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createConsentStore } from "../shared/ai-consent.mjs";

type Consent = { ready: boolean; allowed: boolean; hasConsent: () => boolean; allow: () => Promise<boolean>; revoke: () => Promise<void> };
const Context = createContext<Consent | null>(null);
export function AIConsentProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false), [allowed, setAllowed] = useState(false);
  const store = useRef(createConsentStore({
    read: async () => new File(Paths.document, "ai-consent.json").text(),
    write: async (value) => { const file = new File(Paths.document, "ai-consent.json"); if (!file.exists) file.create(); file.write(value); },
    remove: async () => { const file = new File(Paths.document, "ai-consent.json"); if (file.exists) file.delete(); },
  })).current;
  useEffect(() => { let mounted = true; void store.load().then((value) => { if (mounted) { setAllowed(value); setReady(true); } }); return () => { mounted = false; }; }, [store]);
  const allow = async () => { const value = await store.allow(); setAllowed(value); return value; };
  const revoke = async () => { setAllowed(false); await store.revoke(); };
  return <Context.Provider value={{ ready, allowed, hasConsent: store.hasConsent, allow, revoke }}>{children}</Context.Provider>;
}
export function useAIConsent() { const value = useContext(Context); if (!value) throw Error("Missing AI permission provider."); return value; }
