import { useState, useEffect } from 'react';
import { Check, X, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SectionHeading from '@/components/SectionHeading';
import { useI18n } from '@/lib/useI18n';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Default static fallback quiz questions
const DEFAULT_QUESTIONS = [
  {
    id: 'q1',
    question: '".I have lived here ____ 2022"',
    answers: ['since', 'for', 'from', 'during'],
    correct_answer: 'since',
    explanation: ' We use "since" with a specific point in time in the past (e.g., 2022).',
  },
  {
    id: 'q2',
    question: 'Choose the correct form: "She ____ to school every day."',
    answers: ['go', 'goes', 'going', 'went'],
    correct_answer: 'goes',
    explanation: ' Present simple tense for third-person singular (she/he/it) takes "-s/-es".',
  },
  {
    id: 'q3',
    question: 'Which word completes the sentence: "If I ____ more time, I would read more."',
    answers: ['have', 'had', 'have had', 'will have'],
    correct_answer: 'had',
    explanation: ' Second conditional uses "if + past simple" to express imaginary situations.',
  },
];

export default function EnglishCheck() {
  const { t, isRTL } = useI18n();
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    base44.entities.QuizQuestion.filter({ category: 'english_check' }, 'order', 10)
      .then((data) => {
        if (data && data.length > 0) {
          setQuestions(data);
        }
      })
      .catch(() => {
        // Fallback to default questions on error
      });
  }, []);

  const q = questions[current];

  const handleAnswer = (answer) => {
    if (answered) return;
    setSelected(answer);
    setAnswered(true);
  };

  const next = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCurrent(0);
      setSelected(null);
      setAnswered(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-16 sm:py-24 dir-rtl">
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page max-w-3xl relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={t('englishCheck.eyebrow') || 'اختبار تقييم المستوى'}
          heading={t('englishCheck.heading') || 'اختبر مستواك في اللغة الإنجليزية'}
          description={t('englishCheck.description') || 'أجب عن الأسئلة التالية لمعرفة مستواك الحقيقي وتحديد الدورة المناسبة لك.'}
        />

        <div className="mt-10 bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Soft Mint Ambient Glow inside container */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#e8f7f4] rounded-full blur-2xl pointer-events-none" />

          {loading || !q ? (
            <div className="h-48 rounded-2xl bg-[#f2faf8] animate-pulse" />
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-[#009688] uppercase tracking-wider">
                  {t('englishCheck.eyebrow') || 'سؤال'} {current + 1}/{questions.length}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {t('englishCheck.chooseAnswer') || 'اختر الإجابة الصحيحة'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-[#112d27] mb-6 leading-snug dir-ltr text-center sm:text-right">
                {q.question}
              </h3>

              <div className="grid sm:grid-cols-2 gap-3 dir-ltr">
                {q.answers.map((answer) => {
                  const isCorrect = answer === q.correct_answer;
                  const isSelected = answer === selected;
                  return (
                    <button
                      key={answer}
                      onClick={() => handleAnswer(answer)}
                      disabled={answered}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-xl border text-sm font-semibold transition-all text-start',
                        !answered && 'bg-white border-gray-200/80 text-gray-700 hover:border-[#009688] hover:bg-[#e3f6f3]/50',
                        answered && isCorrect && 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold',
                        answered && isSelected && !isCorrect && 'bg-rose-50 border-rose-500 text-rose-700 font-bold',
                        answered && !isCorrect && !isSelected && 'bg-white border-gray-100 opacity-50'
                      )}
                    >
                      <span>{answer}</span>
                      {answered && isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                      {answered && isSelected && !isCorrect && <X className="w-4 h-4 text-rose-600" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="mt-6 animate-fade-up">
                  <div
                    className={cn(
                      'p-4 rounded-xl text-sm font-medium border',
                      selected === q.correct_answer
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    )}
                  >
                    {selected === q.correct_answer ? (
                      t('englishCheck.correct') || 'إجابة صحيحة! أحسنت العمل.'
                    ) : (
                      <>
                        {t('englishCheck.incorrect') || 'إجابة خاطئة.'}
                        {q.explanation}
                      </>
                    )}
                  </div>
                  <Button
                    onClick={next}
                    className="mt-4 bg-[#009688] hover:bg-[#00796b] text-white px-6 py-5 rounded-xl font-bold gap-2 shadow-md shadow-[#009688]/20 transition-all duration-300"
                  >
                    {current < questions.length - 1
                      ? t('englishCheck.nextQuestion') || 'السؤال التالي'
                      : t('englishCheck.tryAgain') || 'إعادة الاختبار'}
                    <ArrowRight className={cn('w-4 h-4', isRTL && 'rotate-180')} />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}