import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/useI18n';
import { Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Instructors() {
  const { lang } = useI18n();
  const isAr = lang === 'ar';

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch public instructors strictly from backend API
  useEffect(() => {
    fetch(`${API_URL}/api/instructors`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setInstructors(data);
        }
      })
      .catch((err) => {
        console.error('Failed to load instructors', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#f2faf8] via-[#f7fcfb] to-[#eaf7f4] py-16 sm:py-24 ${isAr ? 'dir-rtl' : 'dir-ltr'}`}>
      {/* Background Soft Glow Blobs */}
      <div className="absolute top-1/4 -left-20 w-[450px] h-[450px] bg-[#009688]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[450px] h-[450px] bg-[#009688]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container-page relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Tag / Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009688]/10 text-[#009688] text-xs font-bold mb-4 border border-[#009688]/20">
            <span className="w-2 h-2 rounded-full bg-[#009688]" />
            {isAr ? 'تعرّف على مدربينا' : 'MEET THE TEAM'}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#112d27] mb-3">
            {isAr ? 'تعلّم على يد مدربين ذوي خبرة' : 'Learn With Expert Instructors'}
          </h2>

          <p className="text-sm sm:text-base text-gray-500 font-medium">
            {isAr ? 'تعرّف على الأشخاص الذين يقفون خلف رحلتك التعليمية.' : 'A team of instructors specialized in practical teaching and communication.'}
          </p>
        </div>

        {/* Content Section / Loader / Dynamic Grid */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#009688]" />
          </div>
        ) : instructors.length === 0 ? (
          <div className="text-center py-16 text-gray-400 font-semibold text-sm">
            {isAr ? 'لا يوجد مدربون حالياً.' : 'No instructors available at the moment.'}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {instructors.map((ins, i) => {
              const name = ins.name || ins.full_name;
              const role = isAr ? ins.role || ins.role_ar : ins.role_en || ins.role;
              const description = isAr ? ins.description_ar || ins.description : ins.description_en || ins.description;
              const avatarUrl = ins.avatar || ins.image;

              return (
                <div
                  key={ins.id || ins._id || i}
                  className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-3xl border border-gray-100/80 p-6 flex flex-col items-center text-center shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  {/* Soft Mint Corner Blob inside card */}
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#e8f7f4] rounded-full blur-2xl pointer-events-none" />

                  {/* Circular Avatar Container with soft halo gradient */}
                  <div className="relative mb-5 p-1 rounded-full bg-gradient-to-tr from-[#009688]/20 via-[#e3f6f3] to-white">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 flex items-center justify-center">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-2xl font-black text-[#009688]">
                          {name ? name.charAt(0) : 'I'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Instructor Name */}
                  <h3 className="text-xl font-extrabold text-[#112d27] mb-1">
                    {name}
                  </h3>

                  {/* Role Title */}
                  <div className="text-xs font-bold text-[#009688] mb-3">
                    {role}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs">
                    {description}
                  </p>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}