import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Eye, GraduationCap } from 'lucide-react';
import { GlassCard } from '@/components/ui/Card';
import { studentApi } from '@/lib/studentApi';
import { useAuthStore } from '@/store/useAuthStore';
import { formatDate } from '@/lib/learning';
import { EmptyState } from '@/components/student/ui';
import { certificateSvg, downloadCertificate } from '@/components/student/certificate';

export const CertificatesPage = () => {
  const { user } = useAuthStore();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<any>(null);

  useEffect(() => {
    studentApi.getDashboard()
      .then(({ data }) => data.success && setCerts(data.data.certificates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const certData = (cert: any) => ({
    studentName: user?.name || 'Student',
    courseTitle: cert.courseTitle,
    instructor: cert.instructor,
    earnedAt: cert.earnedAt,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary tracking-tight mb-1">Certificates</h1>
        <p className="text-secondary">Proof of everything you've mastered</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(2)].map((_, i) => <div key={i} className="h-56 glass-card animate-pulse" />)}
        </div>
      ) : certs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {certs.map((cert: any) => (
            <GlassCard key={cert.courseId} className="overflow-hidden group">
              <div
                className="aspect-[1200/850] cursor-pointer border-b border-white/[0.06] [&>svg]:w-full [&>svg]:h-full"
                onClick={() => setPreview(cert)}
                dangerouslySetInnerHTML={{ __html: certificateSvg(certData(cert)) }}
              />
              <div className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <Award className="w-4.5 h-4.5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-primary text-sm line-clamp-1">{cert.courseTitle}</h4>
                  <p className="text-xs text-secondary">Earned {formatDate(cert.earnedAt)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => setPreview(cert)}
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-secondary hover:text-primary transition-colors"
                    aria-label="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => downloadCertificate(certData(cert))}
                    className="w-9 h-9 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-secondary hover:text-primary transition-colors"
                    aria-label="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={GraduationCap}
          title="No certificates yet"
          message="Finish every lesson in a course and a certificate with your name on it will appear here — ready to preview, download and share."
          action={
            <Link to="/dashboard/my-learning" className="h-11 px-6 rounded-full bg-primary text-background text-sm font-semibold inline-flex items-center hover:bg-primary/90 transition-colors">
              Continue Learning
            </Link>
          }
        />
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative w-full max-w-3xl glass-panel p-4">
            <div
              className="w-full rounded-xl overflow-hidden [&>svg]:w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: certificateSvg(certData(preview)) }}
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setPreview(null)}
                className="h-10 px-5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium text-primary hover:bg-white/[0.1] transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => downloadCertificate(certData(preview))}
                className="h-10 px-5 rounded-full bg-primary text-background text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
