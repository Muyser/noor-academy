import { useState } from 'react';
import { ChevronDown, Play, FileText, HelpCircle, Mic, Headphones, BookOpen, PenLine, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

const lessonTypeIcons = {
  video: Play,
  text: FileText,
  quiz: HelpCircle,
  vocabulary: BookOpen,
  speaking: Mic,
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  mixed: Layers,
};

export default function Curriculum({ modules, lessonsByModule }) {
  const [openModule, setOpenModule] = useState(0);

  return (
    <div className="space-y-3">
      {modules.map((mod, idx) => {
        const isOpen = openModule === idx;
        const modLessons = lessonsByModule[mod.id] || [];
        return (
          <div key={mod.id} className="bg-white rounded-2xl border border-brand-line overflow-hidden shadow-soft">
            <button
              onClick={() => setOpenModule(isOpen ? null : idx)}
              className="w-full flex items-center justify-between gap-4 p-5 text-start hover:bg-brand-bg/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="shrink-0 w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-sm font-bold text-brand-teal">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3 className="font-bold text-brand-ink text-base">{mod.title}</h3>
                  <div className="text-xs text-brand-muted mt-0.5">
                    {mod.lessons_count || modLessons.length} lessons · {mod.duration}
                  </div>
                </div>
              </div>
              <ChevronDown className={cn('w-5 h-5 text-brand-muted transition-transform duration-300', isOpen && 'rotate-180')} />
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-out"
              style={{ maxHeight: isOpen ? '800px' : '0', opacity: isOpen ? 1 : 0 }}
            >
              <div className="px-5 pb-3">
                {modLessons.length === 0 ? (
                  <div className="py-3 text-sm text-brand-muted">Lessons coming soon.</div>
                ) : (
                  modLessons.map((lesson, li) => {
                    const Icon = lessonTypeIcons[lesson.type] || Play;
                    return (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between gap-3 py-3 border-t border-brand-line/50 first:border-0"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-brand-bg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-brand-teal" />
                          </div>
                          <span className="text-sm text-brand-ink font-medium truncate">{lesson.title}</span>
                        </div>
                        <span className="shrink-0 text-xs text-brand-muted">{lesson.duration}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}