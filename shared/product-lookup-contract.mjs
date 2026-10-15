const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max && !/[\u0000-\u001f\u007f]/u.test(value);
const fail = () => { throw new Error('Invalid product lookup.'); };
export function safeProductUrl(value) {
  if (!text(value, 2048) || /[\s\\]|%(?:00|0a|0d)/i.test(value) || !value.startsWith('https://')) return null;
  try {
    const url = new URL(value), host = url.hostname.toLowerCase();
    decodeURI(url.href); // Reject invalid percent escapes rather than passing them to the browser.
    if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') || !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(host)
      || /(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/.test(host) || /(?:^|\.)example\.(?:com|org|net)$/.test(host)) return null;
    return { url: url.href, domain: host.replace(/^www\./, '') };
  } catch { return null; }
}
export function validateProductLookupRequest(value) {
  const limits = { merchantName: 100, productCode: 60, originalDescription: 200, interpretedName: 120 };
  if (!object(value) || Object.keys(value).length !== 4 || Object.keys(value).some(key => !(key in limits))) fail();
  for (const [key, max] of Object.entries(limits)) {
    if (value[key] === null && key !== 'originalDescription') continue;
    if (!text(value[key], max)) fail();
    // Product identifiers only: exclude URLs, payment/membership fields and long account numbers.
    if (/https?:|www\.|@|(?:member(?:ship)?|loyalty|account|payment|visa|mastercard|amex|credit\s*card)\s*(?:#|no\b|number\b|id\b|:|\d)|\d{12,}|ignore (?:all |previous )?instructions|system prompt/i.test(value[key]) || /\d{12,}/.test(value[key].replace(/[ -]/g, ''))) fail();
  }
  if (value.productCode !== null && !/^[a-z0-9][a-z0-9 ._-]*$/i.test(value.productCode)) fail();
  return Object.fromEntries(Object.keys(limits).map(key => [key, value[key]?.trim() ?? null]));
}
export function validateProductLookupResult(value) {
  if (!object(value)) fail();
  if (value.status === 'not_found') { if (Object.keys(value).length !== 1) fail(); return { status: 'not_found' }; }
  if (!['matched', 'possible'].includes(value.status) || !object(value.product) || !object(value.source) || Object.keys(value).length !== 4) fail();
  const { product, source } = value;
  if (!text(product.name, 240) || ![product.brand, product.size].every(v => v === null || text(v, 120)) || !text(source.title, 240) || !text(value.matchReason, 300)) fail();
  const safe = safeProductUrl(source.url);
  if (!safe || source.domain !== safe.domain) fail();
  return { status: value.status, product: { name: product.name, brand: product.brand, size: product.size }, source: { title: source.title, ...safe }, matchReason: value.matchReason };
}
