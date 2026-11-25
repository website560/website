// POST /api/checkout { items:[{slug,qty}] } -> { url }  (Stripe Checkout, prices taken from the CMS, never from the browser)
// GET  /api/checkout?session_id=cs_...      -> { paid, amount, email }  (for the thank-you page)
// Needs STRIPE_SECRET_KEY in Vercel. Until it's set, the shop shows a WhatsApp fallback.
const { sb, readBody, send, wrap } = require('./_lib');

const STRIPE = process.env.STRIPE_SECRET_KEY || '';

async function stripe(path, params, method = 'POST') {
  const body = params ? new URLSearchParams(params).toString() : undefined;
  const r = await fetch('https://api.stripe.com/v1/' + path + (method === 'GET' && body ? '?' + body : ''), {
    method, headers: { Authorization: 'Bearer ' + STRIPE, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: method === 'GET' ? undefined : body
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || 'Stripe error');
  return j;
}

module.exports = wrap(async (req, res) => {
  if (!STRIPE) return send(res, 503, { error: 'Online checkout is being set up.' });
  const origin = (req.headers['x-forwarded-proto'] || 'https') + '://' + (req.headers['x-forwarded-host'] || req.headers.host);

  if (req.method === 'GET') {
    const id = new URL(req.url, 'http://x').searchParams.get('session_id') || '';
    if (!/^cs_[\w]+$/.test(id)) return send(res, 400, { error: 'Bad session' });
    const s = await stripe('checkout/sessions/' + id, null, 'GET');
    return send(res, 200, { paid: s.payment_status === 'paid', amount: (s.amount_total || 0) / 100, email: (s.customer_details && s.customer_details.email) || '' });
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const { items } = await readBody(req);
  if (!Array.isArray(items) || !items.length || items.length > 30) return send(res, 400, { error: 'Your cart is empty.' });
  const rows = await sb('/rest/v1/sections?select=data&key=eq.products');
  const catalogue = (rows[0] && rows[0].data || []).filter(p => p.active !== false);

  const params = {
    mode: 'payment',
    success_url: origin + '/order?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: origin + '/shop',
    'shipping_address_collection[allowed_countries][0]': 'SG',
    'phone_number_collection[enabled]': 'true',
    billing_address_collection: 'auto'
  };
  let n = 0;
  for (const it of items) {
    const p = catalogue.find(x => x.slug === it.slug);
    const qty = Math.floor(Number(it.qty));
    const price = Math.round(Number(p && p.price) * 100);
    if (!p || !(qty >= 1 && qty <= 20) || !(price > 0)) return send(res, 400, { error: 'An item in your cart is no longer available. Please refresh the page.' });
    const pre = `line_items[${n}]`;
    params[pre + '[quantity]'] = String(qty);
    params[pre + '[price_data][currency]'] = 'sgd';
    params[pre + '[price_data][unit_amount]'] = String(price);
    params[pre + '[price_data][product_data][name]'] = p.name;
    if (p.finish) params[pre + '[price_data][product_data][description]'] = p.finish;
    const im = p.images && p.images[0] && (p.images[0].src || p.images[0]);
    if (im) params[pre + '[price_data][product_data][images][0]'] = /^https?:/.test(im) ? im : origin + '/' + im.replace(/^\//, '');
    n++;
  }
  const s = await stripe('checkout/sessions', params);
  send(res, 200, { url: s.url });
});
