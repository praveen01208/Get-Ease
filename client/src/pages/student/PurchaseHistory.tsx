import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Receipt, FileText } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { studentApi } from '@/lib/studentApi';
import { formatDate } from '@/lib/learning';
import { EmptyState } from '@/components/student/ui';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/utils/cn';

const statusStyle: Record<string, string> = {
  SUCCESS: 'bg-green-500/10 border-green-500/20 text-green-400',
  PENDING: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
  FAILED: 'bg-red-500/10 border-red-500/20 text-red-400',
};

const downloadInvoice = (payment: any, userName: string) => {
  const lines = [
    'GETEASE — TAX INVOICE',
    '======================================',
    `Invoice ID:   INV-${payment.id.slice(0, 8).toUpperCase()}`,
    `Date:         ${formatDate(payment.createdAt)}`,
    `Billed to:    ${userName}`,
    '',
    `Course:       ${payment.course?.title || payment.courseId}`,
    `Amount:       ₹${payment.amount.toFixed(2)} ${payment.currency}`,
    `Status:       ${payment.status}`,
    `Order ID:     ${payment.razorpayOrderId || '—'}`,
    `Payment ID:   ${payment.razorpayPaymentId || '—'}`,
    '',
    'Thank you for learning with GetEase!',
  ].join('\n');
  const blob = new Blob([lines], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GetEase-Invoice-${payment.id.slice(0, 8)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export const PurchaseHistory = () => {
  const { user } = useAuthStore();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getPurchases()
      .then(({ data }) => data.success && setPayments(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">Purchase History</h1>
        <p className="text-secondary">All your orders and invoices</p>
      </div>

      {loading ? (
        <div className="h-64 glass-card animate-pulse" />
      ) : payments.length > 0 ? (
        <GlassCard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-secondary">
                  <th className="px-6 py-4 font-semibold">Course</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {payments.map((p: any) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/courses/${p.course?.slug || ''}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={p.course?.thumbnail || ''}
                          alt=""
                          className="w-14 h-9 rounded-lg object-cover bg-surface border border-white/[0.06]"
                        />
                        <span className="font-medium text-primary group-hover:underline line-clamp-1">
                          {p.course?.title || 'Course'}
                        </span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary whitespace-nowrap">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-secondary whitespace-nowrap">{formatDate(p.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border',
                        statusStyle[p.status] || statusStyle.PENDING
                      )}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => downloadInvoice(p, user?.name || 'Student')}
                        className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors font-medium"
                      >
                        <FileText className="w-4 h-4" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      ) : (
        <EmptyState
          icon={Receipt}
          title="No purchases yet"
          message="When you buy a course, your order and invoice will show up here."
          action={
            <Link to="/courses" className="h-11 px-6 rounded-full bg-primary text-background text-sm font-semibold inline-flex items-center hover:bg-primary/90 transition-colors">
              Browse Courses
            </Link>
          }
        />
      )}
    </div>
  );
};
