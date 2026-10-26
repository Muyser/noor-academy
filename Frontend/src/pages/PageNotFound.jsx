import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  const { t } = useI18n();
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background">
      <div className="container-page text-center max-w-md">
        <div className="text-8xl font-bold text-brand-teal/20 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-ink mb-3">{t('notFound.heading')}</h1>
        <p className="text-brand-muted mb-8">{t('notFound.description')}</p>
        <Link to="/">
          <Button className="bg-brand-teal hover:bg-brand-teal-dark text-white gap-2">
            <Home className="w-4 h-4" />
            {t('notFound.backHome')}
          </Button>
        </Link>
      </div>
    </div>
  );
}