import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Dribbble, 
  Zap, 
  Trophy, 
  Play, 
  Sparkles,
  Award,
  ListCollapse
} from 'lucide-react';

interface DrillInstance {
  id?: string;
  instanceId?: string;
  name: string;
  duration: number | string;
  description: string;
}

interface ClassEventAgendaProps {
  event: {
    name: string;
    description: string;
    useAgendaBuilder?: boolean;
    p1Selected?: DrillInstance[];
    p2Selected?: DrillInstance[];
    p3Selected?: DrillInstance[];
    p4Selected?: DrillInstance[];
  };
  lang?: 'EN' | 'GE' | 'RU' | 'TR';
  isDark?: boolean;
}

const LOCALIZATION = {
  EN: {
    showAgenda: "See class agenda details",
    hideAgenda: "Hide class agenda details",
    phase1: "1st Phase: Warm Up",
    phase2: "2nd Phase: Skills & Fitness",
    phase3: "3rd Phase: Football Mastery",
    phase4: "4th Phase: Match & Cooldown",
    mins: "mins",
    noDrills: "No exercises in this block",
    agendaHeader: "Structured Agenda",
    drillNotes: "Drill notes"
  },
  RU: {
    showAgenda: "Посмотреть программу занятия",
    hideAgenda: "Скрыть программу занятия",
    phase1: "1. Активация",
    phase2: "2. Интенсив / Фитнес",
    phase3: "3. Мастерство футбола",
    phase4: "4. Практика, заминка",
    mins: "мин",
    noDrills: "В этом блоке нет упражнений",
    agendaHeader: "Программа занятия",
    drillNotes: "Инструкция"
  },
  GE: {
    showAgenda: "ვარჯიშის განრიგის ნახვა",
    hideAgenda: "განრიგის დამალვა",
    phase1: "I ფაზა: გახურება",
    phase2: "II ფაზა: უნარები და ფიტნესი",
    phase3: "III ფაზა: საფეხბურთო ოსტატობა",
    phase4: "IV ფაზა: თამაში და მოდუნება",
    mins: "წთ",
    noDrills: "სავარჯიშოები არ არის ამ ბლოკში",
    agendaHeader: "სავარჯიშო პროგრამა",
    drillNotes: "ინსტრუქცია"
  },
  TR: {
    showAgenda: "Ders programı detaylarını gör",
    hideAgenda: "Detayları gizle",
    phase1: "1. Aşama: Isınma",
    phase2: "2. Aşama: Beceriler & Fitness",
    phase3: "3. Aşama: Futbol Ustalığı",
    phase4: "4. Aşama: Maç & Soğuma",
    mins: "dk",
    noDrills: "Bu bölümde egzersiz bulunmamaktadır",
    agendaHeader: "Ders Programı",
    drillNotes: "Detaylar"
  }
};

export default function ClassEventAgenda({ event, lang = 'RU', isDark = false }: ClassEventAgendaProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = LOCALIZATION[lang as keyof typeof LOCALIZATION] || LOCALIZATION.RU;

  const p1 = event.p1Selected || [];
  const p2 = event.p2Selected || [];
  const p3 = event.p3Selected || [];
  const p4 = event.p4Selected || [];

  const hasStructuredData = p1.length > 0 || p2.length > 0 || p3.length > 0 || p4.length > 0;

  // Helper to check if a text line matches a phase header patterns
  const isPhaseHeaderLine = (line: string) => {
    const lLower = line.toLowerCase();
    return (
      lLower.includes('phase') ||
      lLower.includes('разминка') ||
      lLower.includes('активация') ||
      lLower.includes('интенсив') ||
      lLower.includes('мячом') ||
      lLower.includes('мастерство') ||
      lLower.includes('медитация') ||
      lLower.includes('практика') ||
      lLower.includes('заминка') ||
      lLower.includes('warm up') ||
      lLower.includes('skills & fitness') ||
      lLower.includes('football mastery') ||
      lLower.includes('match & cooldown') ||
      line.trim().startsWith('1.') ||
      line.trim().startsWith('2.') ||
      line.trim().startsWith('3.') ||
      line.trim().startsWith('4.')
    );
  };

  // Helper to format raw descriptions into beautiful sections if structured is missing
  const renderParsedDescriptionText = (descText: string) => {
    if (!descText) return null;
    const lines = descText.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('===') && !l.startsWith('---'));

    return (
      <div className="space-y-4 text-left">
        {lines.map((line, i) => {
          if (line.includes('CLASS AGENDA PLAN')) {
            return (
              <h5 key={i} className="text-xs font-black uppercase text-brand-teal tracking-[0.2em] italic mb-2 border-b border-brand-teal/10 pb-1 flex items-center gap-2">
                <ListCollapse className="w-4 h-4" />
                {line.replace('⚽', '').trim()}
              </h5>
            );
          }

          if (isPhaseHeaderLine(line)) {
            return (
              <div 
                key={i} 
                className={`text-xs font-black uppercase tracking-wider bg-brand-navy/5 px-4 py-2.5 rounded-xl border mt-4 mb-2 flex items-center justify-between ${
                  isDark ? 'text-white border-white/10 bg-white/5' : 'text-brand-navy border-brand-navy/10 bg-brand-navy/5'
                }`}
              >
                <span>{line}</span>
                <Sparkles className="w-3.5 h-3.5 text-brand-sunset" />
              </div>
            );
          }

          if (line.startsWith('•')) {
            // Strip the leading dot and format
            const cleanLine = line.substring(1).trim();
            const durationMatch = cleanLine.match(/\(([^)]+)\)/); // find like (10 mins) or (15 мин)
            let durationStr = '';
            let contentStr = cleanLine;

            if (durationMatch) {
              durationStr = durationMatch[1];
              contentStr = cleanLine.replace(durationMatch[0], '').trim();
            }

            // Split into Title and Desc if has " -" or " – " or ":"
            let title = contentStr;
            let description = '';
            const splitIndex = contentStr.indexOf(' - ') !== -1 ? contentStr.indexOf(' - ') : contentStr.indexOf(' – ');
            if (splitIndex !== -1) {
              title = contentStr.substring(0, splitIndex).trim();
              description = contentStr.substring(splitIndex + 3).trim();
            } else {
              const colonIndex = contentStr.indexOf(': ');
              if (colonIndex !== -1 && colonIndex < 40) {
                title = contentStr.substring(0, colonIndex).trim();
                description = contentStr.substring(colonIndex + 2).trim();
              }
            }

            return (
              <div key={i} className={`ml-2 pl-4 border-l-2 relative group hover:border-brand-teal transition-colors py-1.5 ${
                isDark ? 'border-white/15' : 'border-brand-teal/20'
              }`}>
                <div className={`absolute left-[-5px] top-[14px] w-2.5 h-2.5 rounded-full border-2 border-brand-teal ${
                  isDark ? 'bg-brand-navy' : 'bg-brand-cream'
                }`} />
                <div className="flex items-start md:items-center justify-between gap-4">
                  <h6 className={`text-[12px] font-black uppercase italic group-hover:text-brand-teal transition-colors leading-tight ${
                    isDark ? 'text-white' : 'text-brand-navy'
                  }`}>
                    {title}
                  </h6>
                  {durationStr && (
                    <span className="shrink-0 bg-brand-teal/15 text-brand-teal text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg">
                      {durationStr}
                    </span>
                  )}
                </div>
                {description && (
                  <p className={`text-[11px] font-medium italic mt-1 leading-normal ${
                    isDark ? 'text-white/60' : 'text-brand-navy/60'
                  }`}>
                    {description}
                  </p>
                )}
              </div>
            );
          }

          return (
            <p key={i} className={`text-[11px] font-medium leading-relaxed italic px-2 ${
              isDark ? 'text-white/60' : 'text-brand-navy/65'
            }`}>
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const phases = [
    { id: 1, title: t.phase1, list: p1, icon: Play, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { id: 2, title: t.phase2, list: p2, icon: Zap, color: 'bg-brand-teal/10 text-brand-teal border-brand-teal/20' },
    { id: 3, title: t.phase3, list: p3, icon: Dribbble, color: 'bg-brand-sunset/10 text-brand-sunset border-brand-sunset/30' },
    { id: 4, title: t.phase4, list: p4, icon: Award, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  ];

  return (
    <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-brand-navy/5'}`}>
      {/* Expanded Click Action Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3.5 border rounded-2xl transition-all duration-300 transform active:scale-[0.99] text-[10px] font-black uppercase tracking-widest hover:text-brand-teal italic ${
          isDark 
            ? 'bg-white/5 hover:bg-brand-teal/15 border-white/10 hover:border-brand-teal/30 text-white' 
            : 'bg-brand-navy/5 hover:bg-brand-teal/10 border-brand-navy/5 hover:border-brand-teal/25 text-brand-navy'
        }`}
      >
        <span className="flex items-center gap-2">
          <ListCollapse className="w-4 h-4 shrink-0" />
          <span>{isOpen ? t.hideAgenda : t.showAgenda}</span>
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.div>
      </button>

      {/* Collagen Animate Slide Height */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.05 }}
            className="overflow-hidden"
          >
            <div className="pt-5 pb-2">
              {hasStructuredData ? (
                <div className="space-y-6 text-left">
                  {phases.map((phase) => {
                    const PhaseIcon = phase.icon;
                    const items = phase.list;
                    const phaseTotalMinutes = items.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);

                    return (
                      <div key={phase.id} className="space-y-3">
                        {/* Header for Phase block */}
                        <div className={`p-3 px-4 rounded-xl border flex items-center justify-between gap-3 ${phase.color}`}>
                          <div className="flex items-center gap-2.5">
                            <PhaseIcon className="w-4.5 h-4.5" />
                            <span className="text-[11px] font-black uppercase tracking-wider italic">
                              {phase.title}
                            </span>
                          </div>
                          {phaseTotalMinutes > 0 && (
                            <span className="text-[9px] font-black uppercase tracking-widest ml-auto shrink-0 font-mono">
                              {phaseTotalMinutes} {t.mins}
                            </span>
                          )}
                        </div>

                        {/* List of Drills inside the Phase */}
                        <div className="space-y-2.5 pl-2.5">
                          {items.length === 0 ? (
                            <p className={`text-[10px] font-black uppercase tracking-widest italic pl-4 py-1 ${
                              isDark ? 'text-white/30' : 'text-brand-navy/20'
                            }`}>
                              • {t.noDrills}
                            </p>
                          ) : (
                            items.map((drill, index) => (
                              <div 
                                key={`${drill.instanceId || drill.id || 'drill'}_${index}`}
                                className={`p-4 border rounded-2xl flex items-start gap-4 transition-all duration-300 shadow-sm relative overflow-hidden group ${
                                  isDark 
                                    ? 'bg-brand-navy/50 border-white/5 hover:bg-brand-navy hover:border-brand-teal/30' 
                                    : 'bg-white/60 border-brand-navy/5 hover:bg-white hover:border-brand-teal/20'
                                }`}
                              >
                                {/* Timeline Side Highlight */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors ${
                                  isDark ? 'bg-white/5 group-hover:bg-brand-teal' : 'bg-brand-navy/5 group-hover:bg-brand-teal'
                                }`} />

                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 font-mono transition-all ${
                                  isDark 
                                    ? 'bg-white/5 group-hover:bg-brand-teal/15 text-white/40 group-hover:text-brand-teal' 
                                    : 'bg-brand-navy/5 group-hover:bg-brand-teal/10 text-brand-navy/35 group-hover:text-brand-teal'
                                }`}>
                                  {index + 1}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
                                    <h6 className={`text-[12px] font-black uppercase italic tracking-tight group-hover:text-brand-teal transition-colors leading-tight truncate ${
                                      isDark ? 'text-white' : 'text-brand-navy'
                                    }`}>
                                      {drill.name}
                                    </h6>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-brand-teal/65 bg-brand-teal/5 px-2 py-0.5 rounded-md shrink-0 font-sans leading-none">
                                      {drill.duration} {t.mins}
                                    </span>
                                  </div>
                                  <p className={`text-[11px] font-medium italic leading-relaxed ${
                                    isDark ? 'text-white/60' : 'text-brand-navy/60'
                                  }`}>
                                    {drill.description}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Textual parsed/fallback agenda details */
                <div className={`p-5 border rounded-3xl relative overflow-hidden shadow-sm ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/40 border-brand-navy/5'
                }`}>
                  {renderParsedDescriptionText(event.description)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
