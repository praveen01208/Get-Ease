// Loads Razorpay's checkout script exactly once and returns a promise that
// resolves when window.Razorpay is available.
const RZP_SRC = 'https://checkout.razorpay.com/v1/checkout.js';
let loadPromise: Promise<void> | null = null;

export const loadRazorpay = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if ((window as any).Razorpay) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RZP_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = RZP_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay script failed to load'));
    document.head.appendChild(script);
  });
  return loadPromise;
};

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // paise
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
}

export const openRazorpayCheckout = (options: RazorpayCheckoutOptions) => {
  const Rzp = (window as any).Razorpay;
  if (!Rzp) throw new Error('Razorpay not loaded');
  const rzp = new Rzp(options);
  rzp.on('payment.failed', (resp: any) => {
    console.error('Razorpay payment.failed', resp?.error);
  });
  rzp.open();
  return rzp;
};
