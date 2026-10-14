import { createContext, useContext, useEffect, useRef, useState, useReducer, type ReactNode } from "react";
import { AppState } from "react-native";
import { analyzeReceipt, ReceiptError } from "./ai-client";
import { clearReceiptCache, deleteReceiptPhoto } from "./receipt-photo";
import type { ReceiptAnalysis, ReceiptPhoto } from "./types";
import { useAIConsent } from "./ai-consent";
import { createReceiptReviewState, receiptReviewReducer } from "../shared/results-presentation.mjs";

type Session = {
  ready: boolean; privateScreen: boolean; photo: ReceiptPhoto | null; analysis: ReceiptAnalysis | null;
  analyzing: boolean; reviewedIds: readonly string[];
  setPhoto: (photo: ReceiptPhoto) => void; reset: () => void; cancel: () => void;
  analyze: () => Promise<ReceiptAnalysis>; setReviewed: (id: string, reviewed: boolean) => void;
};
const Context = createContext<Session | null>(null);
export function ReceiptSessionProvider({ children }: { children: ReactNode }) {
  const consent = useAIConsent();
  const [ready, setReady] = useState(false), [privateScreen, setPrivateScreen] = useState(false);
  const [photo, setCurrentPhoto] = useState<ReceiptPhoto | null>(null);
  const [analysis, setAnalysis] = useState<ReceiptAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [review, dispatchReview] = useReducer(receiptReviewReducer, undefined, () => createReceiptReviewState());
  const initialized = useRef(false);
  const photoRef = useRef<ReceiptPhoto | null>(null), request = useRef<AbortController | null>(null), generation = useRef(0);
  const cancel = () => { generation.current++; request.current?.abort(); request.current = null; setAnalyzing(false); };
  const reset = () => { cancel(); deleteReceiptPhoto(photoRef.current); photoRef.current = null; setCurrentPhoto(null); setAnalysis(null); dispatchReview({ type: "reset" }); };
  useEffect(() => {
    if (!initialized.current) {
      try { clearReceiptCache(); } catch {} finally { initialized.current = true; setReady(true); }
    }
    const sub = AppState.addEventListener("change", (state) => {
      setPrivateScreen(state !== "active");
      if (state === "background") cancel();
    });
    return () => { sub.remove(); request.current?.abort(); };
  }, []);
  const setPhoto = (next: ReceiptPhoto) => {
    cancel(); deleteReceiptPhoto(photoRef.current); photoRef.current = next; setCurrentPhoto(next); setAnalysis(null); dispatchReview({ type: "reset" });
  };
  const analyze = async () => {
    if (!consent.ready || !consent.hasConsent()) throw new ReceiptError("CONSENT_REQUIRED", "Allow receipt sharing before checking this receipt.");
    if (!photoRef.current || request.current) throw new ReceiptError("INVALID_REQUEST", "Choose a receipt photo first.");
    const controller = new AbortController(), current = ++generation.current;
    request.current = controller; setAnalyzing(true);
    try {
      const result = await analyzeReceipt(photoRef.current, true, controller.signal);
      if (current !== generation.current) throw new ReceiptError("CANCELED", "Receipt check canceled.");
      setAnalysis(result); dispatchReview({ type: "reset", groups: result.duplicateGroups }); return result;
    } finally { if (current === generation.current) { request.current = null; setAnalyzing(false); } }
  };
  return <Context.Provider value={{ ready, privateScreen, photo, analysis, analyzing, reviewedIds: review.reviewedIds, setPhoto, reset, cancel, analyze,
    setReviewed: (id, reviewed) => dispatchReview({ type: "set-reviewed", id, reviewed }) }}>{children}</Context.Provider>;
}
export function useReceiptSession() { const session = useContext(Context); if (!session) throw new Error("Missing receipt session."); return session; }
