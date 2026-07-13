import React, { useState } from 'react';
import { X, Check, PlayCircle, Shield, Award } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { studentApi } from '@/lib/studentApi';
import { useAuthStore } from '@/store/useAuthStore';
import { loadRazorpay, openRazorpayCheckout } from '@/lib/razorpay';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onSuccess: () => void;
}

export const PurchaseModal = ({ isOpen, onClose, course, onSuccess }: PurchaseModalProps) => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !course) return null;

  const verify = async (
    courseId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) => {
    const { data: verifyData } = await studentApi.verifyPayment({
      courseId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    if (verifyData.success) {
      onSuccess();
    } else {
      throw new Error(verifyData.message || 'Payment verification failed');
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Ask the server for an order
      const { data: orderData } = await studentApi.createPaymentOrder(course.id);
      if (!orderData.success) throw new Error(orderData.message);
      const order = orderData.data;

      // 2. Real Razorpay if a key is configured; otherwise the mock flow
      if (order.provider === 'razorpay' && order.key) {
        await loadRazorpay();
        openRazorpayCheckout({
          key: order.key,
          amount: Math.round(course.price * 100),
          currency: order.currency || 'INR',
          name: 'GetEase',
          description: course.title,
          order_id: order.orderId,
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: '#f5f5f7' },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError('Payment cancelled');
            },
          },
          handler: async (resp) => {
            try {
              await verify(
                course.id,
                resp.razorpay_order_id,
                resp.razorpay_payment_id,
                resp.razorpay_signature
              );
            } catch (err: any) {
              setError(err.message || 'Verification failed');
              setLoading(false);
            }
          },
        });
        return;
      }

      // Mock fallback for local dev without Razorpay credentials
      await verify(
        course.id,
        order.orderId,
        `pay_mock_${Date.now()}`,
        'mock_signature'
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment failed. Please try again.');
      setLoading(false);
      return;
    }

    // Real Razorpay closes the button state itself; for mock, reset here too
    if (!loading) return;
  };

  const originalPrice = (course.price * 1.5).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl animate-in fade-in zoom-in-95 duration-200">
        <GlassCard className="overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-brand-500/10 border-white/10">

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Course Info */}
          <div className="w-full md:w-3/5 bg-surface p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-primary mb-2 leading-tight">
                {course.title}
              </h2>
              <p className="text-secondary mb-6">by {course.instructor?.name || 'Expert Instructor'}</p>

              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8 shadow-xl shadow-black/50 border border-white/5 relative">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop'}
                  alt="Course Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <PlayCircle className="w-16 h-16 text-white opacity-80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <PlayCircle className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary">Lessons</div>
                    <div className="font-semibold text-primary">{course._count?.lessons || 0} Total</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Check className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary">Access</div>
                    <div className="font-semibold text-primary">Lifetime</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Award className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary">Certificate</div>
                    <div className="font-semibold text-primary">Included</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="text-sm text-secondary">Guarantee</div>
                    <div className="font-semibold text-primary">7-Day Money Back</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing & CTA */}
          <div className="w-full md:w-2/5 p-8 flex flex-col justify-center border-l border-white/5 bg-gradient-to-br from-black/40 to-black/80">
            <div className="text-center mb-8">
              <div className="text-sm font-medium text-brand-400 uppercase tracking-wider mb-2">Special Offer</div>
              <div className="flex items-end justify-center gap-3 mb-2">
                <span className="text-5xl font-bold text-white">₹{course.price}</span>
                <span className="text-xl text-secondary line-through mb-1">₹{originalPrice}</span>
              </div>
              <div className="text-sm text-success">You save 33% today!</div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
            <p className="text-xs text-center text-secondary mt-4 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Secure payment powered by Razorpay
            </p>
          </div>

        </GlassCard>
      </div>
    </div>
  );
};
