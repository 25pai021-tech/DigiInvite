import { supabase } from './supabaseClient';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const DEFAULT_STATUS = { is_premium: false, ai_generations_used: 0, free_limit: 5 };

// Reads the signed-in user's Premium status from the backend.
export async function fetchPremiumStatus() {
  try {
    const res = await fetch(`${API_URL}/me/premium`, { headers: await authHeaders() });
    if (!res.ok) return DEFAULT_STATUS;
    return await res.json();
  } catch {
    return DEFAULT_STATUS;
  }
}

// Runs the one-time Premium upgrade payment via Razorpay.
// Resolves true on a verified payment; rejects if cancelled or failed.
// Pays the one-time ₹99 fee to remove the watermark on a single premium
// template (for free users only). Premium subscribers never need this.
// Resolves true on a verified payment; rejects if cancelled or failed.
export async function payForTemplate(requestId) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };

  const orderRes = await fetch(`${API_URL}/createOrder`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ request_id: requestId }),
  });
  if (!orderRes.ok) throw new Error('Could not start the payment. Please sign in and try again.');
  const order = await orderRes.json();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Payment library not loaded. Please refresh and try again.'));
      return;
    }
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'DigiInvite',
      description: 'Remove watermark (this card)',
      order_id: order.order_id,
      theme: { color: '#7a1030' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch(`${API_URL}/verifyPayment`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              request_id: requestId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) resolve(true);
          else reject(new Error('Payment could not be verified.'));
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
    });
    rzp.open();
  });
}

// Runs the one-time Premium upgrade payment via Razorpay.
// Resolves true on a verified payment; rejects if cancelled or failed.
export async function upgradeToPremium() {
  const headers = { 'Content-Type': 'application/json', ...(await authHeaders()) };

  const orderRes = await fetch(`${API_URL}/createPremiumOrder`, { method: 'POST', headers });
  if (!orderRes.ok) throw new Error('Could not start the upgrade. Please sign in and try again.');
  const order = await orderRes.json();

  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error('Payment library not loaded. Please refresh and try again.'));
      return;
    }
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      name: 'DigiInvite Premium',
      description: 'One-time Premium upgrade',
      order_id: order.order_id,
      theme: { color: '#7a1030' },
      handler: async (response) => {
        try {
          const verifyRes = await fetch(`${API_URL}/verifyPremiumPayment`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) resolve(true);
          else reject(new Error('Payment could not be verified.'));
        } catch (e) {
          reject(e);
        }
      },
      modal: { ondismiss: () => reject(new Error('Upgrade cancelled.')) },
    });
    rzp.open();
  });
}