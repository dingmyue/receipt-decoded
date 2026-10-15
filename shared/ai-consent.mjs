// Bump this version whenever the disclosed recipient, purpose or handling changes.
export const AI_CONSENT_VERSION = 2;

export function createConsentStore(storage) {
  let granted = false;
  let revision = 0;
  let queue = Promise.resolve();
  const record = (allowed) => JSON.stringify({ version: AI_CONSENT_VERSION, allowed, acceptedAt: allowed ? new Date().toISOString() : null });
  const save = (allowed) => {
    const operation = queue.then(() => storage.write(record(allowed)));
    queue = operation.catch(() => {});
    return operation;
  };
  return {
    hasConsent: () => granted,
    async load() {
      const current = ++revision;
      granted = false;
      try {
        const value = JSON.parse(await storage.read());
        if (current === revision) granted = value?.version === AI_CONSENT_VERSION && value?.allowed === true && typeof value.acceptedAt === 'string' && Number.isFinite(Date.parse(value.acceptedAt));
      } catch { /* Missing, unreadable or old records always require permission. */ }
      return granted;
    },
    async allow() {
      const current = ++revision;
      granted = false;
      await save(true);
      if (current === revision) granted = true;
      return granted;
    },
    async revoke() {
      ++revision;
      granted = false;
      try { await save(false); }
      catch (error) { if (storage.remove) await storage.remove(); else throw error; }
    },
  };
}
