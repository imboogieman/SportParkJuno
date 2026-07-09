import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Clock, 
  Zap, 
  Trophy, 
  Dribbble, 
  Flame, 
  BookOpen, 
  Undo,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getStudentLevelInfo } from './Dashboard';

interface AIHomeTaskSchedulerProps {
  event: any;
  invitations: any[];
  studentsData: Record<string, any>;
  lang?: 'EN' | 'GE' | 'RU' | 'TR';
  onTaskSaved?: (savedTask: any) => void;
}

const REGIONAL_TEXTS = {
  EN: {
    title: "AI Home Task Assignment",
    generateBtn: "Recommend AI Home Task",
    generating: "AI Coach is Analysing & Generating...",
    recommendingSub: "Adapting session drills for the invited athlete's experience levels...",
    activeTaskTitle: "Assigned Home Task",
    selectBtn: "Select this Variant",
    rejectBtn: "Reject Variant",
    saveAndPublish: "Publish Task to Athletes",
    levelPrefix: "Experience Fit: ",
    skillsLabel: "Target Skills: ",
    durationLabel: "Workout Duration: ",
    repsLabel: "Repetitions: ",
    instructionsLabel: "Parent & Athlete Guidelines",
    noExercisesWarning: "Note: No specific tactical drills are selected in the agenda yet. AI will generate premium soccer fundamentals homework.",
    recreateBtn: "Draft New Homework / Re-generate",
    athletePromptText: "Audience level: ",
    whyMatch: "AI Coach Fit Comment: ",
    taskAssignedSuccess: "Home task assigned successfully! Athletes notified.",
    completedXpReward: "Practiced and completed at home! Earned +15 XP",
    alreadyCompleted: "Completed! Nice Job!",
    variantsTitle: "Suggested AI Home Task Variants",
    rejectedTag: "Rejected",
    restoreBtn: "Restore Target",
    allRejectedText: "All variants rejected. Click below to generate 3 new fresh variants.",
    exercisesIncluded: "Class exercises referenced: ",
    showMore: "Show full description",
    showLess: "Collapse"
  },
  RU: {
    title: "AI Домашние Задания",
    generateBtn: "Рекомендовать AI Домашнее Задание",
    generating: "ИИ-Тренер анализирует и создает...",
    recommendingSub: "Адаптируем упражнения под уровни подготовки приглашенных игроков...",
    activeTaskTitle: "Назначенное Домашнее Задание",
    selectBtn: "Выбрать этот вариант",
    rejectBtn: "Отклонить вариант",
    saveAndPublish: "Опубликовать Задание",
    levelPrefix: "Уровень подготовки: ",
    skillsLabel: "Навыки контроля: ",
    durationLabel: "Время тренировки: ",
    repsLabel: "Повторения и подходы: ",
    instructionsLabel: "Руководство для родителей и игроков",
    noExercisesWarning: "Внимание: план тренировки пуст. AI сгенерирует отличные базовые упражнения по контролю мяча дома.",
    recreateBtn: "Сбросить и создать заново",
    athletePromptText: "Аудитория игроков: ",
    whyMatch: "Почему это подходит: ",
    taskAssignedSuccess: "Домашнее задание успешно назначено! Ученики оповещены.",
    completedXpReward: "Выполнено дома! Начислено +15 XP",
    alreadyCompleted: "Выполнено! Отличная работа!",
    variantsTitle: "AI Варианты Домашнего Задания (3 шт.)",
    rejectedTag: "Отклонено",
    restoreBtn: "Вернуть",
    allRejectedText: "Все варианты отклонены. Нажмите кнопку ниже, чтобы сгенерировать 3 новых варианта.",
    exercisesIncluded: "Связанные упражнения с занятия: ",
    showMore: "Показать полностью",
    showLess: "Свернуть"
  },
  GE: {
    title: "AI საშინაო დავალება",
    generateBtn: "AI საშინაო დავალების რეკომენდაცია",
    generating: "AI მწვრთნელი აანალიზებს და ქმნის...",
    recommendingSub: "ვარჯიშების ადაპტირება მოთამაშეების გამოცდილების დონესთან...",
    activeTaskTitle: "დანიშნული საშინაო დავალება",
    selectBtn: "ამ ვარიანტის არჩევა",
    rejectBtn: "ვარიანტის უარყოფა",
    saveAndPublish: "გამოქვეყნება",
    levelPrefix: "გამოცდილების დონე: ",
    skillsLabel: "უნარები: ",
    durationLabel: "ვარჯიშის ხანგრძლივობა: ",
    repsLabel: "გამეორებები: ",
    instructionsLabel: "ინსტრუქცია მშობლებისა და მოთამაშეებისათვის",
    noExercisesWarning: "ყურადღება: სავარჯიშო გეგმა ცარიელია. AI შემოგთავაზებთ ფუნდამენტურ საშინაო დავალებას.",
    recreateBtn: "თავიდან გენერირება",
    athletePromptText: "მოთამაშეების დონე: ",
    whyMatch: "რატომ შეესაბამება: ",
    taskAssignedSuccess: "საშინაო დავალება წარმატებით დაინიშნა!",
    completedXpReward: "შესრულდა სახლში! დაგერიცხათ +15 XP",
    alreadyCompleted: "შესრულებულია!",
    variantsTitle: "შემოთავაზებული საშინაო დავალების ვარიანტები (3)",
    rejectedTag: "უარყოფილია",
    restoreBtn: "აღდგენა",
    allRejectedText: "ყველა ვარიანტი უარყოფილია. დააჭირეთ ახალი ვარიანტების გენერირებისთვის.",
    exercisesIncluded: "სავარჯიშოები: ",
    showMore: "სრულად ჩვენება",
    showLess: "აკეცვა"
  },
  TR: {
    title: "AI Ev Ödevi Atama",
    generateBtn: "AI Ev Ödevi Öner",
    generating: "AI Antrenörü Analiz Ediyor ve Üretiyor...",
    recommendingSub: "Ders egzersizlerini davetli sporcuların seviyelerine uyarlıyor...",
    activeTaskTitle: "Atanan Ev Ödevi",
    selectBtn: "Bu Seçeneği Seç",
    rejectBtn: "Geri Çevir",
    saveAndPublish: "Ödevi Yayınla",
    levelPrefix: "Deneyim Uyumu: ",
    skillsLabel: "Hedef Beceriler: ",
    durationLabel: "Çalışma Süresi: ",
    repsLabel: "Tekrarlar: ",
    instructionsLabel: "Veli & Sporcu Yönergeleri",
    noExercisesWarning: "Not: Derse özel egzersiz seçilmedi. AI en kaliteli temel futbol ev ödevini üretecektir.",
    recreateBtn: "Yeni Ev Ödevi Oluştur",
    athletePromptText: "Oyuncu seviyesi: ",
    whyMatch: "Uyum Değerlendirmesi: ",
    taskAssignedSuccess: "Ev ödevi atandı ve sporcular bilgilendirildi!",
    completedXpReward: "Evde uygulandı ve tamamlandı! +15 XP Kazanıldı",
    alreadyCompleted: "Tamamlandı! Tebrikler!",
    variantsTitle: "Önerilen AI Ev Ödevi Seçenekleri",
    rejectedTag: "Geri Çevrildi",
    restoreBtn: "Geri Al",
    allRejectedText: "Tüm seçenekler geri çevrildi. Yeni seçenekler oluşturmak için alta tıklayın.",
    exercisesIncluded: "İlişkili egzersizler: ",
    showMore: "Daha fazla göster",
    showLess: "Daha az göster"
  }
};

export default function AIHomeTaskScheduler({ 
  event, 
  invitations, 
  studentsData, 
  lang = 'RU',
  onTaskSaved 
}: AIHomeTaskSchedulerProps) {
  const t = REGIONAL_TEXTS[lang as keyof typeof REGIONAL_TEXTS] || REGIONAL_TEXTS.RU;

  const [localHomeTask, setLocalHomeTask] = useState<any>(event?.homeTask || null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  React.useEffect(() => {
    setLocalHomeTask(event?.homeTask || null);
    setShowResetConfirm(false);
  }, [event?.homeTask]);

  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState<any[]>([]);
  const [rejectedIndices, setRejectedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isActiveTaskExpanded, setIsActiveTaskExpanded] = useState(false);
  const [expandedVariantIdxs, setExpandedVariantIdxs] = useState<number[]>([]);

  // Extract exercises from the current class event config
  const classExercises = React.useMemo(() => {
    return [
      ...(event.p1Selected || []),
      ...(event.p2Selected || []),
      ...(event.p3Selected || []),
      ...(event.p4Selected || [])
    ];
  }, [event]);

  // Dynamically compute the representative level of the currently added students
  const athleteLevel = React.useMemo(() => {
    if (!invitations || invitations.length === 0) return "Rookie";
    const levelSet = new Set<string>();
    invitations.forEach((inv: any) => {
      const student = studentsData[inv.studentId];
      if (student) {
        const xp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
        const lvl = getStudentLevelInfo(xp);
        levelSet.add(lvl.title);
      }
    });
    return levelSet.size > 0 ? Array.from(levelSet).join(", ") : "Rookie";
  }, [invitations, studentsData]);

  const generateHomeTasks = async () => {
    setLoading(true);
    setError(null);
    setVariants([]);
    setRejectedIndices([]);

    try {
      const response = await fetch('/api/gemini/generate-home-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: classExercises.map(e => ({ name: e.name, description: e.description })),
          athleteLevel: athleteLevel,
          lang: lang
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error generating home task recommendations.');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.homeTasks)) {
        setVariants(data.homeTasks);
      } else {
        throw new Error('Invalid recommended home tasks payload format.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing AI model call.');
    } finally {
      setLoading(false);
    }
  };

  const selectVariant = async (task: any) => {
    try {
      const updatedTaskObj = {
        ...task,
        assignedAt: new Date().toISOString(),
        completedByAthleteIds: []
      };

      // 1. Save directly into Firestore Event document
      if (event.id && event.id !== 'new_draft') {
        await updateDoc(doc(db, 'events', event.id), {
          homeTask: updatedTaskObj
        });
      }

      // 2. Add beautiful custom in-app notifications for each invited student
      if (event.id && event.id !== 'new_draft') {
        for (const inv of invitations) {
          const studentId = inv.studentId;
          const student = studentsData[studentId];
          if (student) {
            const currentNotifs = student.notifications || [];
            const matchedNotifId = `hometask_${event.id}`;
            
            // Verify they don't have this task notified already
            if (!currentNotifs.some((n: any) => n.id === matchedNotifId)) {
              const newNotif = {
                id: matchedNotifId,
                title: lang === 'RU' ? `Домашнее задание: ${task.title}` : `Homework: ${task.title}`,
                message: lang === 'RU' 
                  ? `Тренер назначил домашнее задание к тренировке "${event.name}".`
                  : `Coach has recommended a home task: "${task.title}".`,
                createdAt: new Date().toISOString(),
                type: 'xp'
              };
              
              await updateDoc(doc(db, 'registrations', studentId), {
                notifications: [newNotif, ...currentNotifs]
              });
            }
          }
        }
      }

      setLocalHomeTask(updatedTaskObj);
      setSuccessMsg(t.taskAssignedSuccess);
      setVariants([]);
      setRejectedIndices([]);
      setTimeout(() => setSuccessMsg(null), 4000);

      if (onTaskSaved) {
        onTaskSaved(updatedTaskObj);
      }
    } catch (err) {
      console.error("Error saving assigned task in Firestore: ", err);
      setError("Failed to save selection to Firestore.");
    }
  };

  const handleReset = async () => {
    try {
      if (event.id && event.id !== 'new_draft') {
        await updateDoc(doc(db, 'events', event.id), {
          homeTask: null
        });
      }
      setLocalHomeTask(null);
      setShowResetConfirm(false);
      if (onTaskSaved) {
        onTaskSaved(null);
      }
    } catch (e) {
      console.error("Error setting homework to null: ", e);
    }
  };

  const rejectVariant = (idx: number) => {
    setRejectedIndices(prev => [...prev, idx]);
  };

  const restoreVariant = (idx: number) => {
    setRejectedIndices(prev => prev.filter(i => i !== idx));
  };

  const allRejected = variants.length > 0 && rejectedIndices.length === variants.length;

  return (
    <div className="mt-8 pt-8 border-t border-brand-navy/5 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-black italic uppercase tracking-tight text-brand-navy leading-none">
              {t.title}
            </h4>
            <p className="text-[9px] font-bold text-brand-navy/30 uppercase tracking-widest mt-1.5 flex flex-wrap gap-x-2">
              <span>{t.athletePromptText} <strong className="text-brand-sunset">{athleteLevel}</strong></span>
              {classExercises.length > 0 && (
                <span>• {t.exercisesIncluded} <strong className="text-brand-teal">{classExercises.length} drills</strong></span>
              )}
            </p>
          </div>
        </div>

        {localHomeTask && (
          <div className="flex items-center gap-2">
            {showResetConfirm ? (
              <div className="flex items-center gap-1.5 bg-brand-sunset/5 border border-brand-sunset/20 rounded-xl p-1 px-2.5 h-10 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[9px] font-black italic uppercase text-brand-sunset tracking-wider mr-1">
                  {lang === 'RU' ? 'Вы уверены?' : 'Are you sure?'}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="h-7 px-3 rounded-lg bg-brand-sunset hover:bg-brand-sunset/90 text-white font-black italic text-[9px] uppercase tracking-widest cursor-pointer transition-all shrink-0"
                >
                  {lang === 'RU' ? 'Да, сбросить' : 'Yes, reset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="h-7 px-2.5 rounded-lg border border-brand-navy/10 hover:bg-brand-navy/5 text-brand-navy font-black italic text-[9px] uppercase tracking-widest cursor-pointer transition-all shrink-0"
                >
                  {lang === 'RU' ? 'Отмена' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="h-10 px-4 rounded-xl border border-brand-sunset/30 hover:bg-brand-sunset/5 text-brand-sunset font-black italic text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                {t.recreateBtn}
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-2xl bg-brand-teal/10 border border-brand-teal text-brand-teal font-black italic uppercase tracking-wider text-xs flex items-center gap-2 mb-6"
          >
            <CheckCircle2 className="w-4 h-4 text-brand-teal" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* 1. If we have a finalized/assigned task saved on the event */}
        {localHomeTask && !variants.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-brand-navy text-white rounded-[32px] border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 text-brand-teal opacity-10">
              <Flame className="w-24 h-24 rotate-12" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 relative z-10">
              <Badge color="sunset" className="italic uppercase px-3 py-1 font-black text-[9px] tracking-widest">
                ⚽ {t.activeTaskTitle}
              </Badge>
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase font-black tracking-widest text-white/40">
                  {t.durationLabel}
                </span>
                <span className="shrink-0 bg-white/10 text-brand-teal text-[10px] font-black uppercase px-3 py-1 rounded-xl">
                  {localHomeTask.durationMins} mins
                </span>
              </div>
            </div>

            <h5 className="text-[22px] font-black italic uppercase tracking-tight text-white mb-2 leading-tight">
              {localHomeTask.title}
            </h5>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-[10px] font-semibold text-white/45 uppercase tracking-widest leading-none">
                {t.levelPrefix} <strong className="text-brand-teal">{localHomeTask.levelMatchExplanation ? "Adaptation verified ✔" : athleteLevel}</strong>
              </span>
            </div>

            <div className="space-y-6 pt-5 border-t border-white/5 font-sans">
              <div>
                <p className="text-[10px] font-black uppercase text-brand-teal tracking-[0.2em] mb-3 italic flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  {t.instructionsLabel}
                </p>
                <p className={`text-xs font-semibold leading-relaxed text-white/80 italic pl-1 transition-all duration-300 ${isActiveTaskExpanded ? '' : 'line-clamp-3'}`}>
                  {localHomeTask.description}
                </p>
                {localHomeTask.description && localHomeTask.description.length > 120 && (
                  <button
                     type="button"
                     onClick={() => setIsActiveTaskExpanded(!isActiveTaskExpanded)}
                     className="mt-2 text-brand-teal hover:text-brand-sunset text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {isActiveTaskExpanded ? (
                      <>
                        <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.showLess}</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.showMore}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">
                    {t.repsLabel}
                  </span>
                  <span className="text-xs font-bold italic text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-brand-teal" />
                    {localHomeTask.repetitions}
                  </span>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mb-1">
                    {t.skillsLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(localHomeTask.targetSkills || []).map((skill: string, index: number) => (
                      <span key={index} className="bg-brand-teal/15 text-brand-teal font-black text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-lg italic">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {localHomeTask.levelMatchExplanation && (
                <p className="text-[10px] text-white/40 font-bold italic border-l-2 border-brand-sunset pl-3 py-1 bg-white/[0.02] rounded-r-xl">
                  {t.whyMatch} {localHomeTask.levelMatchExplanation}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* 2. Generating Loading screen */}
        {loading && (
          <motion.div
            key="generating-loader"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-10 text-center glass rounded-[32px] border-white/60 shadow-xl flex flex-col items-center justify-center space-y-4"
          >
            <div className="relative">
              <Dribbble className="w-14 h-14 text-brand-teal animate-spin mb-4" />
              <Sparkles className="w-6 h-6 text-brand-sunset absolute -top-1 -right-1 animate-bounce" />
            </div>
            <h5 className="text-xl font-black italic uppercase text-brand-navy tracking-tight">{t.generating}</h5>
            <p className="text-xs font-semibold italic text-brand-navy/60 max-w-md">{t.recommendingSub}</p>
          </motion.div>
        )}

        {/* 3. Suggested Variants Showcase (Grid of 3 variants) */}
        {variants.length > 0 && !allRejected && (
          <motion.div
            key="variants-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-brand-sunset rounded-full" />
              <h5 className="text-[13px] font-black uppercase tracking-widest text-brand-navy/70 italic">
                {t.variantsTitle}
              </h5>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {variants.map((task, idx) => {
                const isRejected = rejectedIndices.includes(idx);

                return (
                  <motion.div
                    key={idx}
                    animate={{ opacity: isRejected ? 0.35 : 1, scale: isRejected ? 0.97 : 1 }}
                    className={`glass p-6 rounded-[32px] border flex flex-col justify-between shadow-lg relative overflow-hidden transition-all duration-300 ${isRejected ? 'border-brand-navy/10 bg-brand-navy/5 saturate-[0.15]' : 'border-white/60 hover:shadow-2xl'}`}
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Zap className="col-indigo text-indigo-500 w-16 h-16" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="bg-brand-navy/5 text-brand-navy/60 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg leading-none">
                          Variant {idx + 1}
                        </span>
                        
                        {isRejected ? (
                          <span className="bg-red-500/10 text-red-500 font-extrabold italic text-[9px] uppercase px-2 py-0.5 rounded-md tracking-wider">
                            {t.rejectedTag}
                          </span>
                        ) : (
                          <span className="shrink-0 text-brand-teal text-[9px] font-black bg-brand-teal/5 px-2.5 py-1 rounded-xl">
                            {task.durationMins} mins
                          </span>
                        )}
                      </div>

                      <div>
                        <h6 className="text-[16px] font-black italic uppercase text-brand-navy leading-tight mb-2">
                          {task.title}
                        </h6>
                        <p className={`text-[11px] font-semibold italic text-brand-navy/70 leading-relaxed transition-all duration-300 ${expandedVariantIdxs.includes(idx) ? '' : 'line-clamp-3'}`}>
                          {task.description}
                        </p>
                        {task.description && task.description.length > 120 && (
                          <button
                            type="button"
                            onClick={() => {
                              const isExpanded = expandedVariantIdxs.includes(idx);
                              setExpandedVariantIdxs(prev =>
                                isExpanded ? prev.filter(i => i !== idx) : [...prev, idx]
                              );
                            }}
                            className="mt-2 text-brand-teal hover:text-brand-sunset text-[10px] font-black uppercase tracking-widest italic flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {expandedVariantIdxs.includes(idx) ? (
                              <>
                                <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                                <span>{t.showLess}</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                                <span>{t.showMore}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="pt-4 border-t border-brand-navy/5 space-y-3">
                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-brand-navy/30 block mb-1">
                            {t.repsLabel}
                          </span>
                          <span className="text-[11px] font-extrabold italic text-brand-navy flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5 text-brand-sunset shrink-0" />
                            {task.repetitions}
                          </span>
                        </div>

                        <div>
                          <span className="text-[8px] font-black uppercase tracking-wider text-brand-navy/30 block mb-1">
                            {t.skillsLabel}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {(task.targetSkills || []).map((skill: string, index: number) => (
                              <span key={index} className="bg-brand-teal/5 text-brand-teal font-black text-[7.5px] uppercase tracking-wider px-2 py-0.5 rounded-md italic leading-none">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {task.levelMatchExplanation && (
                          <div className="p-2 px-3 bg-brand-cream/60 rounded-xl border border-brand-navy/5">
                            <p className="text-[9px] text-brand-navy/50 font-bold italic leading-tight">
                              💡 {task.levelMatchExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-brand-navy/5 flex gap-2 w-full">
                      {isRejected ? (
                        <button
                          type="button"
                          onClick={() => restoreVariant(idx)}
                          className="w-full h-10 rounded-xl border border-brand-teal text-brand-teal hover:bg-brand-teal/5 font-black italic text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Undo className="w-3.5 h-3.5" />
                          {t.restoreBtn}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => rejectVariant(idx)}
                            className="h-11 px-3 rounded-xl border border-red-200 hover:bg-red-50 text-red-500 hover:border-red-300 font-extrabold text-[9px] uppercase transition-all shrink-0 flex items-center justify-center"
                            title={t.rejectBtn}
                          >
                            <X className="w-4 h-4" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => selectVariant(task)}
                            className="flex-1 h-11 rounded-xl bg-brand-teal hover:bg-brand-navy text-white hover:text-white font-black italic text-[9px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
                          >
                            <Check className="w-4 h-4" />
                            {t.selectBtn}
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 4. If all variants were rejected */}
        {allRejected && (
          <motion.div
            key="all-rejected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-10 text-center glass rounded-[32px] border-red-100 flex flex-col items-center justify-center space-y-4"
          >
            <p className="text-xs font-black uppercase tracking-wider text-red-500 italic">
              {t.allRejectedText}
            </p>
            <button
              type="button"
              onClick={generateHomeTasks}
              className="h-12 px-6 rounded-2xl bg-brand-sunset text-white text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 shadow-sunset transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              {t.generateBtn}
            </button>
          </motion.div>
        )}

        {/* 5. Error state */}
        {error && (
          <motion.div
            key="error-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-extrabold text-xs mb-6 flex items-center gap-2"
          >
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* 6. Initial Welcome state (no assigned homework and no sugerences currently computed) */}
        {!localHomeTask && !variants.length && !loading && (
          <motion.div
            key="initial-cta"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 sm:p-12 text-center glass rounded-[28px] sm:rounded-[56px] border-white/60 bg-brand-navy/[0.01]"
          >
            <Sparkles className="w-10 h-10 text-brand-sunset animate-pulse mx-auto mb-4" />
            <p className="text-xs font-semibold leading-relaxed text-brand-navy/60 italic max-w-xl mx-auto mb-6">
              {lang === 'RU'
                ? "Повысьте вовлеченность группы! Создайте 3 уникальных домашних задания с искусственным интеллектом, которые спортсмены будут тренировать самостоятельно."
                : "Boost athlete engagement! Generate three custom AI-trained home workout options that players can practice in their backyard."}
            </p>

            {classExercises.length === 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-sunset max-w-lg mx-auto mb-6">
                ⚠️ {t.noExercisesWarning}
              </p>
            )}

            <button
              type="button"
              onClick={generateHomeTasks}
              className="relative overflow-hidden group h-14 px-8 rounded-2xl bg-brand-teal text-white italic uppercase tracking-widest text-[10px] font-black shadow-teal flex items-center gap-3 mx-auto cursor-pointer transition-all hover:bg-brand-navy active:scale-98"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t.generateBtn}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Inline badge utility strictly matching style
function Badge({ children, color, className = "" }: { children: React.ReactNode; color: string; className?: string }) {
  const styles: Record<string, string> = {
    teal: "bg-brand-teal/10 text-brand-teal border border-brand-teal/20",
    sunset: "bg-brand-sunset/10 text-brand-sunset border border-brand-sunset/20",
    navy: "bg-brand-navy/10 text-brand-navy border border-brand-navy/10",
    white: "bg-white/10 text-white border border-white/15"
  };
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${styles[color] || styles.navy} ${className}`}>
      {children}
    </span>
  );
}
