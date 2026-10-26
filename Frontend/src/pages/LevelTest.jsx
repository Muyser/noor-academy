import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight, RotateCcw, Trophy, Target, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const levelThresholds = [
  { level: 'A1', min: 0, max: 20 },
  { level: 'A2', min: 21, max: 40 },
  { level: 'B1', min: 41, max: 60 },
  { level: 'B2', min: 61, max: 80 },
  { level: 'C1', min: 81, max: 95 },
  { level: 'C2', min: 96, max: 100 },
];

export default function LevelTest() {
  const { t, isRTL } = useI18n();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState('intro'); // intro | test | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.LevelQuestion.list('order', 20)
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const q = questions[current];
  const progress = questions.length > 0 ? ((current) / questions.length) * 100 : 0;

  const handleAnswer = (answer) => {
    setSelected(answer);
    const newAnswers = [...answers, { question: q, selected: answer, correct: answer === q.correct_answer, level: q.level }];
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setPhase('result');
      }
    }, 600);
  };

  const correctCount = answers.filter((a) => a.correct).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
  const resultLevel = levelThresholds.find((l) => score >= l.min && score <= l.max) || levelThresholds[0];

  const levelStats = {};
  answers.forEach((a) => {
    if (!levelStats[a.level]) levelStats[a.level] = { correct: 0, total: 0 };
    levelStats[a.level].total++;
    if (a.correct) levelStats[a.level].correct++;
  });
  const strengths = Object.entries(levelStats).filter(([, v]) => v.correct / v.total >= 0.5).map(([k]) => k);
  const weaknesses = Object.entries(levelStats).filter(([, v]) => v.correct / v.total < 0.5).map(([k]) => k);

  const retake = () => {
    setPhase('intro');
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
  };

  if (loading) {
    return <div className="container-page py-20"><div className="h-96 rounded-2xl bg-brand-bg animate-pulse" /></div>;
  }

  return (
    <div className="bg-background min-h-[60vh]">
      <div className="container-page max-w-3xl py-10 sm:py-16">
        {/* Intro */}
        {phase === 'intro' && (
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-teal/10 mb-5">
              <Trophy className="w-8 h-8 text-brand-teal" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-brand-ink mb-3">{t('levelTest.title')}</h1>
            <p className="text-brand-muted text-lg max-w-xl mx-auto mb-8">{t('levelTest.description')}</p>
            <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-6 max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between text-sm text-brand-muted mb-4">
                <span>{questions.length} {t('levelTest.totalQuestions').toLowerCase()}</span>
                <span>~5 min</span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                  <span key={l} className="px-3 py-1 rounded-full bg-brand-bg text-xs font-semibold text-brand-teal">{l}</span>
                ))}
              </div>
            </div>
            <Button onClick={() => setPhase('test')} size="lg" className="bg-brand-orange hover:bg-brand-orange-dark text-white gap-2">
              {t('levelTest.start')}
              <ArrowRight className={cn('w-5 h-5', isRTL && 'rotate-180')} />
            </Button>
          </div>
        )}

        {/* Test */}
        {phase === 'test' && q && (
          <div>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-brand-muted mb-2">
                <span className="font-semibold">{t('levelTest.question')} {current + 1} {t('levelTest.of')} {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-brand-bg overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-6 sm:p-8 animate-fade-up">
              <div className="text-xs font-semibold text-brand-orange uppercase tracking-wider mb-3">{q.type}</div>
              <h2 className="text-xl sm:text-2xl font-bold text-brand-ink mb-6 leading-snug">{q.question}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {q.answers.map((answer) => {
                  const isCorrect = answer === q.correct_answer;
                  const isSelected = answer === selected;
                  const showResult = selected !== null;
                  return (
                    <button
                      key={answer}
                      onClick={() => handleAnswer(answer)}
                      disabled={showResult}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-start',
                        !showResult && 'bg-white border-brand-line hover:border-brand-teal hover:bg-brand-teal/5',
                        showResult && isCorrect && 'bg-green-50 border-green-500 text-green-700',
                        showResult && isSelected && !isCorrect && 'bg-red-50 border-red-500 text-red-700',
                        showResult && !isCorrect && !isSelected && 'bg-white border-brand-line opacity-50'
                      )}
                    >
                      <span>{answer}</span>
                      {showResult && isCorrect && <Check className="w-4 h-4" />}
                      {showResult && isSelected && !isCorrect && <X className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-teal to-brand-teal-dark mb-4">
                <span className="text-3xl font-bold text-white">{resultLevel.level}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-brand-ink mb-2">{t('levelTest.yourLevel')}</h1>
              <p className="text-brand-muted">{t('levelTest.resultsDesc')}</p>
            </div>

            {/* Score cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-5 text-center">
                <div className="text-3xl font-bold text-brand-teal">{score}%</div>
                <div className="text-sm text-brand-muted mt-1">{t('levelTest.score')}</div>
              </div>
              <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-5 text-center">
                <div className="text-3xl font-bold text-brand-teal">{correctCount}/{questions.length}</div>
                <div className="text-sm text-brand-muted mt-1">{t('levelTest.correctAnswers')}</div>
              </div>
              <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-5 text-center">
                <div className="text-3xl font-bold text-brand-teal">{questions.length}</div>
                <div className="text-sm text-brand-muted mt-1">{t('levelTest.totalQuestions')}</div>
              </div>
            </div>

            {/* Strengths & weaknesses */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-brand-ink">{t('levelTest.strengths')}</h3>
                </div>
                {strengths.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-green-50 text-sm font-medium text-green-700">{s}</span>)}
                  </div>
                ) : <p className="text-sm text-brand-muted">—</p>}
              </div>
              <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-5">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-bold text-brand-ink">{t('levelTest.areasToImprove')}</h3>
                </div>
                {weaknesses.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {weaknesses.map((s) => <span key={s} className="px-3 py-1 rounded-full bg-orange-50 text-sm font-medium text-orange-700">{s}</span>)}
                  </div>
                ) : <p className="text-sm text-brand-muted">—</p>}
              </div>
            </div>

            {/* Recommended */}
            <div className="bg-white rounded-2xl border border-brand-line shadow-soft p-6 mb-8">
              <h3 className="font-bold text-brand-ink mb-4">{t('levelTest.recommendedCourses')}</h3>
              <p className="text-sm text-brand-muted mb-4">Start with courses at your level or one step above to keep growing.</p>
              <Button onClick={() => navigate('/courses')} className="bg-brand-teal hover:bg-brand-teal-dark text-white gap-2">
                {t('levelTest.startLearning')}
                <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
              </Button>
            </div>

            <div className="text-center">
              <Button onClick={retake} variant="outline" className="border-brand-line text-brand-ink hover:bg-brand-bg gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('levelTest.retake')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}