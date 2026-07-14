// Pure functions that build the QR-payload string given a structured
// {kind, ...fields} object. Used by GenerateTab to compute what's encoded
// inside the QR pixels.
//
// Returns a plain string. Empty fields produce a minimal but valid payload
// where possible; throws on malformed JSON.

function escapeWifi(value) {
  if (value == null) return '';
  // Escape special chars per WIFI: spec.
  return String(value).replace(/([\\;,":])/g, '\\$1');
}

function buildVCard({ name, phone, email, org, title, url }) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (name) lines.push(`FN:${name}`);
  if (org) lines.push(`ORG:${org}`);
  if (title) lines.push(`TITLE:${title}`);
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (url) lines.push(`URL:${url}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function buildWifi({ ssid, password, encryption, hidden }) {
  const enc = (encryption || 'WPA').toUpperCase();
  const hid = hidden ? 'true' : 'false';
  return `WIFI:T:${enc};S:${escapeWifi(ssid)};P:${escapeWifi(password || '')};H:${hid};;`;
}

function buildUpi({ vpa, name, amount, note }) {
  if (!vpa) return '';
  const params = new URLSearchParams();
  params.set('pa', vpa);
  if (name) params.set('pn', name);
  if (amount) params.set('am', String(amount));
  params.set('cu', 'INR');
  if (note) params.set('tn', note);
  return `upi://pay?${params.toString()}`;
}

export function buildQrPayloadString(payload) {
  if (!payload || typeof payload !== 'object') return '';
  const kind = payload.kind || 'text';
  const v = payload.value || {};
  switch (kind) {
    case 'text':
      return v.text || '';
    case 'url':
      return v.url || '';
    case 'vcard':
      return buildVCard(v);
    case 'wifi':
      return buildWifi(v);
    case 'upi':
      return buildUpi(v);
    case 'json':
      // Validate JSON; if invalid, return raw text so the QR still renders.
      try {
        const parsed = typeof v.json === 'string' ? JSON.parse(v.json) : v.json;
        return JSON.stringify(parsed);
      } catch (_e) {
        return v.json || '';
      }
    default:
      return '';
  }
}

// Empty default payload for each kind — used to seed form fields.
export function defaultPayload(kind) {
  switch (kind) {
    case 'text':  return { kind, value: { text: '' } };
    case 'url':   return { kind, value: { url: '' } };
    case 'vcard': return { kind, value: { name: '', phone: '', email: '', org: '', title: '', url: '' } };
    case 'wifi':  return { kind, value: { ssid: '', password: '', encryption: 'WPA', hidden: false } };
    case 'upi':   return { kind, value: { vpa: '', name: '', amount: '', note: '' } };
    case 'json':  return { kind, value: { json: '{}' } };
    default:      return { kind: 'text', value: { text: '' } };
  }
}
