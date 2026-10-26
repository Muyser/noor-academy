import { useState } from 'react';
import { ShieldCheck, Search, Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/useI18n';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CertificateVerify() {
  const { t } = useI18n();
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setResult(null);
    setSearched(false);
    try {
      const data = await base44.entities.Certificate.filter(
        { certificate_number: code.trim() },
        '-created_date',
        1
      );
      setResult(data[0] || null);
      setSearched(true);
    } catch {
      setResult(null);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  const infoCards = [
    { icon: ShieldCheck, title: t('certificate.officialVerification'), desc: t('certificate.officialDesc') },
    { icon: Search, title: t('certificate.quickVerification'), desc: t('certificate.quickDesc') },
    { icon: CheckCircle2, title: t('certificate.courseInfo'), desc: t('certificate.courseInfoDesc') },
  ];

  return (
    <div>
      <section className="bg-gradient-to-b from-brand-bg to-white py-16 sm:py-20">
        <div className="container-page text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal/10 mb-4 animate-fade-scale">
            <ShieldCheck className="w-8 h-8 text-brand-teal" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-brand-ink leading-tight animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('certificate.title')}
          </h1>
          <p className="mt-4 text-brand-muted text-lg animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('certificate.description')}
          </p>

          <form onSubmit={handleVerify} className="mt-8 flex gap-2 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Input
              type="text"
              placeholder={t('certificate.placeholder')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-12 bg-white border-brand-line text-center font-mono"
            />
            <Button type="submit" disabled={loading} className="h-12 bg-brand-teal hover:bg-brand-teal-dark text-white px-6 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? t('certificate.verifying') : t('certificate.verify')}
            </Button>
          </form>
        </div>
      </section>

      <section className="py-10 sm:py-14 bg-background">
        <div className="container-page max-w-3xl">
          {/* Info cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            {infoCards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl border border-brand-line p-5 shadow-soft text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-teal/10 flex items-center justify-center mx-auto mb-3">
                  <card.icon className="w-6 h-6 text-brand-teal" />
                </div>
                <h3 className="font-bold text-brand-ink text-sm mb-1">{card.title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Result */}
          {searched && !result && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center animate-fade-up">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-ink mb-1">{t('certificate.notFound')}</h3>
              <p className="text-brand-muted text-sm">{t('certificate.notFoundDesc')}</p>
            </div>
          )}

          {result && (
            <div className="bg-white rounded-2xl border border-brand-line shadow-card overflow-hidden animate-fade-up">
              <div className={cn(
                'p-5 flex items-center gap-3',
                result.status === 'valid' ? 'bg-green-50' : result.status === 'revoked' ? 'bg-orange-50' : 'bg-red-50'
              )}>
                {result.status === 'valid' ? <CheckCircle2 className="w-7 h-7 text-green-600" /> :
                 result.status === 'revoked' ? <AlertTriangle className="w-7 h-7 text-orange-500" /> :
                 <XCircle className="w-7 h-7 text-red-500" />}
                <div>
                  <div className="font-bold text-brand-ink text-lg">
                    {result.status === 'valid' ? t('certificate.valid') : result.status === 'revoked' ? t('certificate.revoked') : t('certificate.invalid')}
                  </div>
                  <div className="text-sm text-brand-muted">{t('certificate.certificateNumber')}: {result.certificate_number}</div>
                </div>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.studentName')}</div>
                  <div className="font-semibold text-brand-ink">{result.student_name}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.course')}</div>
                  <div className="font-semibold text-brand-ink">{result.course_title}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.level')}</div>
                  <div className="font-semibold text-brand-ink">{result.level}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.issueDate')}</div>
                  <div className="font-semibold text-brand-ink">{result.issue_date}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.completionDate')}</div>
                  <div className="font-semibold text-brand-ink">{result.completion_date}</div>
                </div>
                <div>
                  <div className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('certificate.status')}</div>
                  <div className="font-semibold text-brand-ink capitalize">{result.status}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}