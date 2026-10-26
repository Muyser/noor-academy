import { Monitor, MessageSquareText, TrendingUp, Check } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { useI18n } from '@/lib/useI18n';

export default function Experience() {
  const { t, lang } = useI18n();

  const cards = [
    {
      icon: Check,
      title: t('experience.card1Title') || 'دروس تفاعلية',
      desc: t('experience.card1Desc') || 'تدرب بدلاً من الاكتفاء بالمشاهدة.',
    },
    {
      icon: MessageSquareText,
      title: t('experience.card2Title') || 'مفردات من الحياة الواقعية',
      desc: t('experience.card2Desc') || 'تعلّم كلمات وتعبيرات يمكنك استخدامها فعلياً.',
    },
    {
      icon: TrendingUp,
      title: t('experience.card3Title') || 'تتبع التقدم',
      desc: t('experience.card3Desc') || 'اعرف أين وصلت وما الذي ينبغي أن تتعلمه بعد ذلك.',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-16 sm:py-24 dir-rtl">
      {/* Background Soft Glow Blobs matching other sections */}
      <div className="absolute top-1/4 -right-20 w-[450px] h-[450px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[450px] h-[450px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Side: Interactive Quiz Card Preview matching the screenshot */}
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="relative bg-[#0d1f1b] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#009688]/20 max-w-lg mx-auto overflow-hidden">
              {/* Subtle card internal glow */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#009688]/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <span className="text-xs font-bold text-gray-400">اختبار سريع في الإنجليزية</span>
                <span className="w-7 h-7 rounded-xl bg-white/10 text-white flex items-center justify-center text-xs">?</span>
              </div>

              <div className="text-center my-8">
                <p className="text-lg sm:text-xl font-bold text-white tracking-wide">
                  ".I have lived here <span className="underline decoration-[#009688] underline-offset-8 px-2">____</span> 2022"
                </p>
                <span className="block text-xs text-gray-400 mt-3">اختر الإجابة الصحيحة</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center text-white text-sm font-medium transition-all cursor-pointer">
                  since
                </div>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center text-white text-sm font-medium transition-all cursor-pointer">
                  for
                </div>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center text-white text-sm font-medium transition-all cursor-pointer">
                  from
                </div>
                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-center text-white text-sm font-medium transition-all cursor-pointer">
                  during
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Heading and Feature Cards matching the layout */}
          <div className="lg:col-span-6 order-1 lg:order-2 text-right">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009688]/10 text-[#009688] text-xs font-bold mb-4 border border-[#009688]/20">
              <span className="w-2 h-2 rounded-full bg-[#009688]" />
              {t('experience.eyebrow') || 'تجربة تعلّم ثرية'}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112d27] mb-3 leading-tight">
              {t('experience.heading') || 'يجب أن يكون التعلّم عمليًّا.'}
            </h2>

            <p className="text-sm sm:text-base text-gray-500 font-medium mb-8 leading-relaxed">
              {t('experience.description') || 'صُممت كل حصة لتحفيزك خطوة من التواصل الحقيقي.'}
            </p>

            <div className="space-y-4">
              {cards.map((card, i) => (
                <div
                  key={i}
                  className="group bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100/80 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#009688] text-white flex items-center justify-center shadow-sm shrink-0">
                      <card.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#112d27] text-base mb-0.5">{card.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}