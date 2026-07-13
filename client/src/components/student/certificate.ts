// Generates a premium certificate as a standalone SVG that can be
// previewed inline or downloaded as a file.

export interface CertificateData {
  studentName: string;
  courseTitle: string;
  instructor?: string;
  earnedAt: string | Date;
}

export const certificateSvg = ({ studentName, courseTitle, instructor, earnedAt }: CertificateData): string => {
  const date = new Date(earnedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 850" font-family="Georgia, 'Times New Roman', serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b0b0e"/>
      <stop offset="1" stop-color="#17171c"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d4af6a"/>
      <stop offset="0.5" stop-color="#f3dfae"/>
      <stop offset="1" stop-color="#d4af6a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="850" fill="url(#bg)"/>
  <rect x="40" y="40" width="1120" height="770" fill="none" stroke="url(#gold)" stroke-width="2" rx="18"/>
  <rect x="52" y="52" width="1096" height="746" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1" rx="14"/>
  <text x="600" y="150" text-anchor="middle" fill="#f5f5f7" font-size="30" letter-spacing="14" font-family="Helvetica, Arial, sans-serif">GET EASE</text>
  <text x="600" y="235" text-anchor="middle" fill="url(#gold)" font-size="52" letter-spacing="4">Certificate of Completion</text>
  <text x="600" y="320" text-anchor="middle" fill="#a1a1aa" font-size="22" font-style="italic">This certificate is proudly presented to</text>
  <text x="600" y="410" text-anchor="middle" fill="#ffffff" font-size="58" font-weight="bold">${esc(studentName)}</text>
  <line x1="330" y1="440" x2="870" y2="440" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="600" y="495" text-anchor="middle" fill="#a1a1aa" font-size="22" font-style="italic">for successfully completing the course</text>
  <text x="600" y="560" text-anchor="middle" fill="#f5f5f7" font-size="34" font-weight="bold">${esc(courseTitle)}</text>
  <text x="270" y="700" text-anchor="middle" fill="#f5f5f7" font-size="20">${esc(instructor || 'GetEase Academy')}</text>
  <line x1="160" y1="715" x2="380" y2="715" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  <text x="270" y="740" text-anchor="middle" fill="#71717a" font-size="15" font-family="Helvetica, Arial, sans-serif">INSTRUCTOR</text>
  <text x="930" y="700" text-anchor="middle" fill="#f5f5f7" font-size="20">${esc(date)}</text>
  <line x1="820" y1="715" x2="1040" y2="715" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
  <text x="930" y="740" text-anchor="middle" fill="#71717a" font-size="15" font-family="Helvetica, Arial, sans-serif">DATE</text>
  <circle cx="600" cy="690" r="46" fill="none" stroke="url(#gold)" stroke-width="2"/>
  <text x="600" y="700" text-anchor="middle" fill="url(#gold)" font-size="26" font-weight="bold">GE</text>
</svg>`;
};

export const downloadCertificate = (data: CertificateData) => {
  const blob = new Blob([certificateSvg(data)], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GetEase-Certificate-${data.courseTitle.replace(/[^a-z0-9]+/gi, '-')}.svg`;
  a.click();
  URL.revokeObjectURL(url);
};
