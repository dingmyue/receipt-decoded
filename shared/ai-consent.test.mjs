import test from 'node:test';
import assert from 'node:assert/strict';
import { AI_CONSENT_VERSION, createConsentStore } from './ai-consent.mjs';

test('permission is persisted only after an explicit grant and remembered for this disclosure version', async () => {
  let disk = '';
  const storage = { read: async () => disk, write: async (value) => { disk = value; } };
  const consent = createConsentStore(storage);
  assert.equal(await consent.load(), false);
  assert.equal(consent.hasConsent(), false);
  assert.equal(await consent.allow(), true);
  assert.equal(await createConsentStore(storage).load(), true);
  await consent.revoke();
  assert.equal(consent.hasConsent(), false);
  assert.equal(await createConsentStore(storage).load(), false);
});
test('old, malformed or unreadable permission records require a fresh choice', async () => {
  for (const value of ['{', '{}', JSON.stringify({ version: AI_CONSENT_VERSION - 1, allowed: true, acceptedAt: new Date().toISOString() }), JSON.stringify({ version: AI_CONSENT_VERSION, allowed: 'true', acceptedAt: new Date().toISOString() }), JSON.stringify({ version: AI_CONSENT_VERSION, allowed: true }), JSON.stringify({ version: AI_CONSENT_VERSION, allowed: true, acceptedAt: 'invalid' })]) {
    assert.equal(await createConsentStore({ read: async () => value, write: async () => {} }).load(), false);
  }
  assert.equal(await createConsentStore({ read: async () => { throw Error('Unavailable'); }, write: async () => {} }).load(), false);
});
test('revocation removes the old grant if writing a revocation fails', async () => {
  let disk = JSON.stringify({ version: AI_CONSENT_VERSION, allowed: true, acceptedAt: new Date().toISOString() });
  const storage = { read: async () => disk, write: async () => { throw Error('Write failed'); }, remove: async () => { disk = ''; } };
  const consent = createConsentStore(storage);
  assert.equal(await consent.load(), true);
  await consent.revoke();
  assert.equal(consent.hasConsent(), false);
  assert.equal(await createConsentStore(storage).load(), false);
});
test('failed permission writes never enable an upload', async () => {
  const consent = createConsentStore({ read: async () => '{}', write: async () => { throw Error('Full disk'); } });
  await assert.rejects(consent.allow());
  assert.equal(consent.hasConsent(), false);
});
test('revocation invalidates an in-flight grant and is saved after it', async () => {
  let finish;
  const writes = [];
  const consent = createConsentStore({ read: async () => '{}', write: async (value) => { writes.push(JSON.parse(value)); if (writes.length === 1) await new Promise((resolve) => { finish = resolve; }); } });
  const grant = consent.allow();
  await Promise.resolve();
  const revoke = consent.revoke();
  finish();
  assert.equal(await grant, false);
  await revoke;
  assert.deepEqual(writes.map((value) => value.allowed), [true, false]);
  assert.equal(consent.hasConsent(), false);
});
