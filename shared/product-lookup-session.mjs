import { validateProductLookupResult } from './product-lookup-contract.mjs';

// Receipt-session memory only. Cards/navigation/review can unmount without losing this cache.
export function createProductLookupSession(lookup, onChange = () => {}) {
  let generation = 0, states = {};
  const pending = new Map();
  const publish = (id, state) => { states = { ...states, [id]: state }; onChange(states); };
  return {
    snapshot: () => states,
    ensure(id, request, retry = false) {
      if (pending.has(id)) return pending.get(id).promise;
      const cached = Object.hasOwn(states, id) ? states[id] : undefined;
      if (cached && !(retry && cached.status === 'error')) return Promise.resolve(cached);
      const controller = new AbortController(), current = generation;
      publish(id, { status: 'loading' });
      const promise = Promise.resolve().then(() => {
        // React Native AbortSignal supports aborted/events, but not Node's throwIfAborted helper.
        if (controller.signal.aborted) throw new Error('Product lookup canceled.');
        return lookup(request, controller.signal);
      }).then(result => {
        const state = validateProductLookupResult(result);
        if (current === generation) publish(id, state);
        return state;
      }).catch(() => {
        const state = { status: 'error' };
        if (current === generation) publish(id, state);
        return state;
      }).finally(() => { if (current === generation) pending.delete(id); });
      pending.set(id, { controller, promise });
      return promise;
    },
    cancelPending() {
      generation++;
      for (const [id, { controller }] of pending) { controller.abort(); publish(id, { status: 'error' }); }
      pending.clear();
    },
    reset() {
      generation++;
      for (const { controller } of pending.values()) controller.abort();
      pending.clear(); states = {}; onChange(states);
    },
  };
}
