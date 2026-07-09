import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  ClipboardList, 
  Loader2,
  Trash2,
  Home,
  AlertTriangle,
  AlertCircle,
  X,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { Badge, Button, Card } from './UI';
import { translations } from '../i18n';
import { db } from '../lib/firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, onSnapshot, updateDoc } from 'firebase/firestore';
import ClassEventAgenda from './ClassEventAgenda';
import AthleteHomeTaskView from './AthleteHomeTaskView';
import { MOCK_STUDENT, LOCATIONS } from '../constants';
import { getDummyEvents } from './Dashboard';

interface InAppEventDetailsViewProps {
  eventId: string;
  lang: string;
  athleteData: any;
  masterData: any;
  onBack: () => void;
}

const LOCALIZATION = {
  EN: {
    back: "Back to Portal",
    noEventFound: "Event Not Found",
    noEventSub: "We couldn't locate this specific event in the academy logs.",
    viewProgram: "Full Event Program",
    homeworkTitle: "Homework Practice",
    loadingEvent: "Retrieving Event Details...",
    eventPageTitle: "Selected Event Page",
    coachLabel: "Led by",
    statusLabel: "Status",
    completedLabel: "Completed",
    noHomework: "No home assignment matches this event type.",
    deleteEvent: "Delete Event",
    confirmDeletionTitle: "Confirm Deletion",
    confirmDeletionMsg: "Are you sure you want to permanently delete this event? This will also remove all associated athlete invitations and homework logs from the database.",
    cancelBtn: "Cancel",
    confirmDeleteBtn: "Confirm Delete",
    deletingEvent: "Deleting event..."
  },
  RU: {
    back: "Назад в портал",
    noEventFound: "Событие не найдено",
    noEventSub: "Мы не смогли найти это конкретное событие в логах академии.",
    viewProgram: "Полная программа занятия",
    homeworkTitle: "Домашнее задание",
    loadingEvent: "Получение деталей события...",
    eventPageTitle: "Страница выбранного события",
    coachLabel: "Тренер",
    statusLabel: "Статус",
    completedLabel: "Выполнено",
    noHomework: "Домашнее задание для этого типа события не предусмотрено.",
    deleteEvent: "Удалить событие",
    confirmDeletionTitle: "Подтверждение удаления",
    confirmDeletionMsg: "Вы уверены, что хотите навсегда удалить это событие? Это также удалит все связанные приглашения спортсменов и журналы домашних заданий из базы данных.",
    cancelBtn: "Отмена",
    confirmDeleteBtn: "Удалить",
    deletingEvent: "Удаление события..."
  },
  GE: {
    back: "პორტალზე დაბრუნება",
    noEventFound: "ღონისძიება ვერ მოიძებნა",
    noEventSub: "ჩვენ ვერ ვიპოვეთ ეს კონკრეტული ღონისძიება აკადემიის სისტემაში.",
    viewProgram: "ვარჯიშის სრული პროგრამა",
    homeworkTitle: "საშინაო ვარჯიში",
    loadingEvent: "ღონისძиების დეტალების ჩატვირთვა...",
    eventPageTitle: "არჩეული ღონისძიების გვერდი",
    coachLabel: "მწვრთნელი",
    statusLabel: "სტატუსი",
    completedLabel: "შესრულებულია",
    noHomework: "ამ ტიპის ღონისძიებისთვის საშინაო დავალება არ არის გათვალისწინებული.",
    deleteEvent: "ღონისძიების წაშლა",
    confirmDeletionTitle: "წაშლის დადასტურება",
    confirmDeletionMsg: "დარწმუნებული ხართ, რომ გსურთ ამ ღონისძიების სამუდამოდ წაშლა? ეს ასევე წაშლის ყველა დაკავშირებულ ათლეტთა მოწვევას და საშინაო დავალების ჩანაწერს მონაცემთა ბაზიდან.",
    cancelBtn: "გაუქმება",
    confirmDeleteBtn: "წაშლა",
    deletingEvent: "იშლება..."
  },
  TR: {
    back: "Portala Geri Dön",
    noEventFound: "Etkinlik Bulunamadı",
    noEventSub: "Akademi kayıtlarında bu etkinliği tespit edemedik.",
    viewProgram: "Tam Etkinlik Programı",
    homeworkTitle: "Ev Ödevi Çalışması",
    loadingEvent: "Etkinlik Bilgileri Alınıyor...",
    eventPageTitle: "Seçilen Etkinlik Sayfası",
    coachLabel: "Eğitmen",
    statusLabel: "Durum",
    completedLabel: "Tamamlandı",
    noHomework: "Bu etkinlik türü için ev ödevi eşleşmiyor.",
    deleteEvent: "Etkinliği Sil",
    confirmDeletionTitle: "Silmeyi Onayla",
    confirmDeletionMsg: "Bu etkinlikliği kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem, ilişkili tüm sporcu davetiyelerini ve ev ödevi kayıtlarını da veri tabanından silecektir.",
    cancelBtn: "İptal",
    confirmDeleteBtn: "Sil",
    deletingEvent: "Etkinlik siliniyor..."
  }
};

const PRE_EVENTS_FALLBACK = [
  {
    id: "preview-1",
    name: "Academy Showcase & Open Training Match",
    description: "Structure: ⚽ CLASS AGENDA PLAN\n• Phase 1: Dynamic Warmup drills\n• Phase 2: Skills execution\n• Phase 3: Match play drills",
    startTime: "10:00 - 12:00",
    location: "airport_runway",
    type: "training",
    homeTask: {
      title: "Elite Touch Master",
      durationMins: 15,
      repetitions: "4 series of 50 touches",
      skills: ["Control", "Agility"],
      completedByAthleteIds: []
    }
  },
  {
    id: "preview-2",
    name: "Champions Football Masterclass",
    description: "⚽ CLASS AGENDA PLAN\n• Phase 1: Quick feet drills\n• Phase 2: Agility drills\n• Phase 3: Defensive positioning",
    startTime: "15:30 - 17:00",
    location: "metro_mall",
    type: "training",
    homeTask: {
      title: "Reactive Agility",
      durationMins: 20,
      repetitions: "3 rounds of 2 minutes",
      skills: ["Speed", "Reaction"],
      completedByAthleteIds: []
    }
  }
];

export default function InAppEventDetailsView({ 
  eventId, 
  lang = 'RU', 
  athleteData, 
  masterData, 
  onBack 
}: InAppEventDetailsViewProps) {
  const t = LOCALIZATION[lang as keyof typeof LOCALIZATION] || LOCALIZATION.RU;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeAthlete = athleteData || MOCK_STUDENT;
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isMaster = !!masterData;
  const currentStudentId = athleteData?.id || (isMaster ? null : (activeAthlete?.id || 'mock-s-1'));

  const visiblePenalties = event ? (event.penalties || []).filter((pen: any) => {
    if (isMaster) return true;
    return pen.studentId === currentStudentId;
  }) : [];

  const visibleObservations = event ? (event.observations || []).filter((obs: any) => {
    if (isMaster) return true;
    return obs.studentId === currentStudentId;
  }) : [];

  const [removingObsId, setRemovingObsId] = useState<string | null>(null);

  const handleRemoveObservation = async (observationId: string, studentId: string) => {
    if (!event?.id || !studentId) return;

    if (event.id.startsWith('dummy-') || event.id.startsWith('preview-') || !event.id) {
      const updatedObservations = (event.observations || []).filter((o: any) => o.id !== observationId);
      setEvent({ ...event, observations: updatedObservations });
      return;
    }

    setRemovingObsId(observationId);
    try {
      // 1. Get student document
      const studentDocRef = doc(db, 'registrations', studentId);
      const studentSnap = await getDoc(studentDocRef);
      if (studentSnap.exists()) {
        const student = studentSnap.data();
        const currentObservations = student.observations || [];
        const updatedObservations = currentObservations.filter((o: any) => o.id !== observationId);

        // Filter notifications
        const currentNotifications = student.notifications || [];
        const updatedNotifications = currentNotifications.filter((n: any) => n.id !== `obs_${observationId}`);

        await updateDoc(studentDocRef, {
          observations: updatedObservations,
          notifications: updatedNotifications
        });
      }

      // 2. Remove from Event profile
      const currentEventObservations = event.observations || [];
      const updatedEventObservations = currentEventObservations.filter((o: any) => o.id !== observationId);
      await updateDoc(doc(db, 'events', event.id), {
        observations: updatedEventObservations
      });
    } catch (err) {
      console.error("Error removing trainer note:", err);
    } finally {
      setRemovingObsId(null);
    }
  };

  const handleRemoveWarning = async (penaltyId: string, studentId: string) => {
    if (!event?.id || !studentId) return;
    
    // For dummy/mock/preview events, update local state
    if (event.id.startsWith('dummy-') || event.id.startsWith('preview-') || !event.id) {
      const updatedPenalties = (event.penalties || []).filter((p: any) => p.id !== penaltyId);
      setEvent({ ...event, penalties: updatedPenalties });
      return;
    }

    setRemovingId(penaltyId);
    try {
      // 1. Get student document
      const studentDocRef = doc(db, 'registrations', studentId);
      const studentSnap = await getDoc(studentDocRef);
      if (studentSnap.exists()) {
        const student = studentSnap.data();
        const currentPenalties = student.penalties || [];
        const updatedPenalties = currentPenalties.filter((p: any) => p.id !== penaltyId);

        // Refund 1 XP
        const currentXp = student.xp !== undefined ? Number(student.xp) : 0;
        const newXp = currentXp + 1;

        // Filter notifications
        const currentNotifications = student.notifications || [];
        const updatedNotifications = currentNotifications.filter((n: any) => n.id !== `penalty_${penaltyId}`);

        await updateDoc(studentDocRef, {
          xp: newXp,
          penalties: updatedPenalties,
          notifications: updatedNotifications
        });
      }

      // 2. Remove from Event profile
      const currentEventPenalties = event.penalties || [];
      const updatedEventPenalties = currentEventPenalties.filter((p: any) => p.id !== penaltyId);
      await updateDoc(doc(db, 'events', event.id), {
        penalties: updatedEventPenalties
      });
    } catch (err) {
      console.error("Error removing warning:", err);
    } finally {
      setRemovingId(null);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const fetchEvent = async () => {
      if (!eventId) return;

      // 1. Check if it corresponds to a dummy event from Dashboard
      const dummyEvents = getDummyEvents(lang);
      const matchedDummy = dummyEvents.find(e => e.id === eventId) as any;
      if (matchedDummy) {
        if (!matchedDummy.homeTask) {
          matchedDummy.homeTask = {
            title: "Elite Touch Master",
            durationMins: 15,
            repetitions: "4 series of 50 touches",
            completedByAthleteIds: []
          };
        }
        // Add mock penalties to dummy event 1 for a high-fidelity visual experience
        if (eventId === 'dummy-event-1' && !matchedDummy.penalties) {
          matchedDummy.penalties = [
            {
              id: 'mock-p-1',
              studentId: 'mock-s-1',
              studentName: lang === 'RU' ? 'Никита Смирнов' : 'Nikita Smirnov',
              word: lang === 'RU' ? 'Отвлеклась/Отвлекся от упражнения' : 'Stay unfocused from an exercise',
              timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              xpDeducted: 1,
              issuedBy: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman',
              masterName: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman'
            },
            {
              id: 'mock-p-2',
              studentId: 'mock-s-2',
              studentName: lang === 'RU' ? 'Артем Иванов' : 'Artem Ivanov',
              word: lang === 'RU' ? 'Опоздание на тренировку' : 'Being late',
              timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
              xpDeducted: 1,
              issuedBy: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman',
              masterName: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman'
            }
          ];
        }
        setEvent(matchedDummy);
        setLoading(false);
        return;
      }

      // 2. Check if it matches pre-events fallback
      const matchedPre = PRE_EVENTS_FALLBACK.find(e => e.id === eventId);
      if (matchedPre) {
        setEvent(matchedPre);
        setLoading(false);
        return;
      }

      // 3. Fallback / Fetch from Firestore with real-time listener
      try {
        const docRef = doc(db, 'events', eventId);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const fetchedData = { id: docSnap.id, ...docSnap.data() } as any;
            if (!fetchedData.homeTask) {
              fetchedData.homeTask = {
                title: "Elite Touch Master",
                durationMins: 15,
                repetitions: "4 series of 50 touches for each leg",
                completedByAthleteIds: []
              };
            }
            setEvent(fetchedData);
          } else {
            // Absolute fallback
            const defaultEvent = PRE_EVENTS_FALLBACK[0];
            setEvent({
              ...defaultEvent,
              id: eventId,
              name: `${defaultEvent.name} [Demo]`
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Error in onSnapshot on events collection:", err);
          setLoading(false);
        });
      } catch (err) {
        console.error("Error reading event document with real-time listener:", err);
        setLoading(false);
      }
    };

    fetchEvent();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId, lang]);

  const handleConfirmDelete = async () => {
    if (!event?.id) return;
    setIsDeleting(true);
    try {
      const q = query(collection(db, 'invitations'), where('eventId', '==', event.id));
      const qSnap = await getDocs(q);
      const deletePromises = qSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'events', event.id));
      setShowDeleteConfirm(false);
      onBack();
    } catch (err) {
      console.error("Error during event deletion:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getFullLocationName = (locId: string) => {
    const matched = LOCATIONS.find(l => l.id === locId);
    if (!matched) return locId;
    if (lang === 'RU') return matched.nameRU;
    if (lang === 'GE') return matched.nameGE;
    if (lang === 'TR') return matched.nameTR;
    return matched.name;
  };

  return (
    <div className="space-y-8 animate-fade-in relative z-10 text-brand-navy">
      {/* Upper Navigation Action row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button 
          variant="outline"
          onClick={onBack}
          className="h-11 px-5 !rounded-xl italic uppercase tracking-widest text-[9px] font-black flex items-center gap-2 border-brand-navy/15 text-brand-navy hover:bg-brand-navy hover:text-white shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Button>

        {masterData && event && (
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-11 px-5 !rounded-xl bg-red-600 hover:bg-red-700 text-white italic uppercase tracking-widest text-[9px] font-black flex items-center gap-2 shadow-md transition-all border-none"
          >
            <Trash2 className="w-4 h-4" />
            {t.deleteEvent}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-32">
          <Loader2 className="w-12 h-12 text-brand-teal animate-spin mb-4" />
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic">
            {t.loadingEvent}
          </span>
        </div>
      ) : !event ? (
        <div className="text-center p-20 glass rounded-[48px] border-white max-w-2xl mx-auto shadow-2xl">
          <h2 className="text-3xl font-black italic uppercase text-brand-navy mb-4">{t.noEventFound}</h2>
          <p className="text-brand-navy/60 font-medium italic text-sm mb-6">{t.noEventSub}</p>
          <Button onClick={onBack}>{lang === 'RU' ? 'В портал' : 'To Portal'}</Button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Main Header Card - Sized and designed for Dashboard context */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12 rounded-[48px] bg-brand-navy text-white shadow-3xl relative overflow-hidden border border-white/10"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-teal/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Badge color={event.type === 'training' ? 'teal' : 'sunset'} className="uppercase text-[9px] font-black italic tracking-wider py-1 px-3">
                  {event.type === 'training' ? (lang === 'RU' ? 'ТРЕНИРОВКА' : 'TRAINING') : (lang === 'RU' ? 'СОБЫТИЕ' : 'EVENT')}
                </Badge>
                
                {event.date && (
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">
                    {new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-sm">
                {event.name}
              </h1>

              <p className="text-white/70 max-w-2xl font-medium italic text-xs sm:text-sm leading-relaxed">
                {event.description && event.description.includes('⚽ CLASS AGENDA PLAN')
                  ? (lang === 'RU' 
                    ? 'Интерактивная тренировочная сессия по футболу со специализированным пошаговым планом.' 
                    : 'Interactive soccer practice session featuring a specialized step-by-step agenda framework.')
                  : event.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal shrink-0 shadow-md">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-white/30 block leading-none mb-1 italic">
                      {lang === 'RU' ? 'Время' : 'Time'}
                    </span>
                    <span className="text-xs font-black uppercase italic text-white leading-none">
                      {event.startTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal shrink-0 shadow-md">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-white/30 block leading-none mb-1 italic">
                      {lang === 'RU' ? 'Локация' : 'Location'}
                    </span>
                    <span className="text-xs font-black uppercase italic text-white leading-none truncate block max-w-[200px]">
                      {getFullLocationName(event.location)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal shrink-0 shadow-md">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-white/30 block leading-none mb-1 italic">
                      {t.coachLabel}
                    </span>
                    <span className="text-xs font-black uppercase italic text-white leading-none">
                      {event.coach?.fullName || (lang === 'RU' ? 'Роман Горбунов' : 'Roman Gorbunov')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Core Content - Structured Side-by-side with Dashboard styling compatibility */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Part 1: Full Event Program (7 / 12 Cols) */}
            <div className="lg:col-span-12 xl:col-span-7 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-brand-teal rounded-full animate-pulse" />
                <h3 className="text-lg font-black uppercase tracking-widest italic">{t.viewProgram}</h3>
              </div>

              <Card className="p-6 sm:p-10 bg-white/80 border-white/60 shadow-2xl rounded-[38px] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-brand-teal opacity-5 pointer-events-none">
                  <ClipboardList className="w-32 h-32" />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge color="teal" className="text-[8px] uppercase italic font-black text-brand-teal tracking-widest">
                      {lang === 'RU' ? 'ОДОБРЕНО РУКОВОДСТВОМ' : 'TECHNICAL COMPLIANCE SIGNATURE'}
                    </Badge>
                  </div>
                  <ClassEventAgenda event={event} lang={lang as any} />
                </div>
              </Card>
            </div>

            {/* Part 2: Full Home Assignment Details (5 / 12 Cols) */}
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-brand-sunset rounded-full animate-pulse" />
                <h3 className="text-lg font-black uppercase tracking-widest italic">{t.homeworkTitle}</h3>
              </div>

              <div className="bg-brand-navy text-white rounded-[38px] shadow-2xl overflow-hidden p-1 border border-white/5">
                {event.homeTask ? (
                  <div className="p-4 sm:p-6">
                    <AthleteHomeTaskView 
                      event={event}
                      athleteData={activeAthlete}
                      lang={lang as any}
                    />
                  </div>
                ) : (
                  <div className="p-12 text-center text-white/30 italic text-xs font-sans">
                    {t.noHomework}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Part 3: Discipline Records & Warning Log (Full Width) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-widest italic">
                {lang === 'RU' ? 'История дисциплины' : lang === 'GE' ? 'დისციპლინის ისტორია' : lang === 'TR' ? 'Disiplin Geçmişi' : 'Discipline History'}
              </h3>
            </div>

            <Card className="p-6 sm:p-10 bg-white/80 border-white/60 shadow-2xl rounded-[38px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-brand-sunset opacity-5 pointer-events-none">
                <AlertTriangle className="w-32 h-32" />
              </div>

              {visiblePenalties && visiblePenalties.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-brand-navy/60 font-medium italic mb-4">
                    {lang === 'RU' 
                      ? 'Список предупреждений и взысканий, зарегистрированных тренером во время этого занятия:' 
                      : lang === 'GE' 
                        ? 'ამ ვარჯიშზე მწვრთნელის მიერ გაცემული გაფრთხილებებისა და ჯარიმების სია:' 
                        : lang === 'TR'
                          ? 'Bu seans sırasında eğitmen tarafından kaydedilen uyarıların listesi:'
                          : 'List of warning notices and penalties registered by the coach during this session:'}
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-navy/10 text-[9px] font-black uppercase tracking-widest text-brand-navy/40">
                          <th className="pb-3 pl-2">{lang === 'RU' ? 'Время' : lang === 'GE' ? 'დრო' : 'Time / Date'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Спортсмен' : lang === 'GE' ? 'ათლეტი' : 'Student Name'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Нарушение / Причина' : lang === 'GE' ? 'დარღვევა / მიზეზი' : 'Violation / Reason'}</th>
                          <th className="pb-3 text-center">{lang === 'RU' ? 'Взыскание' : lang === 'GE' ? 'ჯარიმა' : 'Penalty'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Мастер / Тренер' : lang === 'GE' ? 'მწვრთნელი' : 'Master Name'}</th>
                          {isMaster && <th className="pb-3 text-right pr-2">{lang === 'RU' ? 'Действие' : lang === 'GE' ? 'მოქმედება' : 'Action'}</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-navy/5">
                        {visiblePenalties.map((pen: any, idx: number) => (
                          <tr key={pen.id || idx} className="text-xs font-medium text-brand-navy hover:bg-brand-navy/5 transition-colors">
                            {/* Timestamp */}
                            <td className="py-4 pl-2 font-mono text-brand-navy/50">
                              {pen.timestamp ? (
                                <span className="flex flex-col">
                                  <span className="font-bold">
                                    {new Date(pen.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-[10px] opacity-75">
                                    {new Date(pen.timestamp).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </span>
                              ) : '—'}
                            </td>
                            {/* Student Name */}
                            <td className="py-4 font-black italic uppercase tracking-tight text-brand-navy">
                              {pen.studentName}
                            </td>
                            {/* Reason */}
                            <td className="py-4 italic text-brand-navy/70">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-pulse" />
                                {pen.word}
                              </span>
                            </td>
                            {/* Penalty applied */}
                            <td className="py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-brand-sunset/15 text-brand-sunset text-[10px] font-black italic uppercase tracking-wide font-mono">
                                -{pen.xpDeducted || 1} XP
                              </span>
                            </td>
                            {/* Master Name */}
                            <td className="py-4 italic font-black text-brand-navy/60">
                              {pen.masterName || pen.issuedBy || (lang === 'RU' ? 'Тренер Роман' : 'Coach Roman')}
                            </td>
                            {/* Action */}
                            {isMaster && (
                              <td className="py-4 text-right pr-2">
                                <Button
                                  variant="outline"
                                  disabled={removingId === pen.id}
                                  onClick={() => handleRemoveWarning(pen.id, pen.studentId)}
                                  className="h-8 !py-1 !px-3 !rounded-lg text-[9px] uppercase font-black border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm inline-flex items-center gap-1"
                                >
                                  {removingId === pen.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-2.5 h-2.5" />
                                      {lang === 'RU' ? 'Удалить' : lang === 'GE' ? 'წაშლა' : 'Delete'}
                                    </>
                                  )}
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-brand-navy/60 font-medium italic max-w-md">
                    {lang === 'RU'
                      ? 'Во время этого занятия нарушений дисциплины не зафиксировано. Отличная спортивная этика!'
                      : lang === 'GE'
                        ? 'ამ ვარჯიშზე დისციპლინის დარღვევა არ დაფიქსირებულა. შესანიშნავი ქცევაა!'
                        : lang === 'TR'
                          ? 'Bu seansta hiçbir disiplin ihlali kaydedilmedi. Harika sportmenlik!'
                          : 'No discipline incidents recorded during this session. Keep up the great sportsmanship!'}
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Part 4: Trainer Notes & Behavioral Observations (Full Width) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full animate-pulse" />
              <h3 className="text-lg font-black uppercase tracking-widest italic">
                {lang === 'RU' ? 'Заметки тренера' : lang === 'GE' ? 'მწვრთნელის შენიშვნები' : lang === 'TR' ? 'Eğitmen Notları' : 'Trainer Notes'}
              </h3>
            </div>

            <Card className="p-6 sm:p-10 bg-white/80 border-white/60 shadow-2xl rounded-[38px] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 text-indigo-500 opacity-5 pointer-events-none">
                <FileText className="w-32 h-32" />
              </div>

              {visibleObservations && visibleObservations.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-xs text-brand-navy/60 font-medium italic mb-4">
                    {lang === 'RU' 
                      ? 'Поведенческие наблюдения и отзывы от тренеров во время этого занятия (без влияния на XP):' 
                      : lang === 'GE' 
                        ? 'ქცევითი დაკვირვებები და გამოხმაურებები მწვრთნელებისგან (XP-ზე გავლენის გარეშე):' 
                        : 'Behavioral observations and feedback from coaches during this session (no XP impact):'}
                  </p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-brand-navy/10 text-[9px] font-black uppercase tracking-widest text-brand-navy/40">
                          <th className="pb-3 pl-2">{lang === 'RU' ? 'Время' : lang === 'GE' ? 'დრო' : 'Time / Date'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Спортсмен' : lang === 'GE' ? 'ათლეტი' : 'Student Name'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Наблюдение' : lang === 'GE' ? 'დაკვირვება' : 'Observation / Note'}</th>
                          <th className="pb-3">{lang === 'RU' ? 'Мастер' : lang === 'GE' ? 'მწვრთნელი' : 'Coach'}</th>
                          {isMaster && <th className="pb-3 text-right pr-2">{lang === 'RU' ? 'Действие' : lang === 'GE' ? 'მოქმედება' : 'Action'}</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-navy/5">
                        {visibleObservations.map((obs: any, idx: number) => (
                          <tr key={obs.id || idx} className="text-xs font-medium text-brand-navy hover:bg-brand-navy/5 transition-colors">
                            {/* Timestamp */}
                            <td className="py-4 pl-2 font-mono text-brand-navy/50">
                              {obs.timestamp ? (
                                <span className="flex flex-col">
                                  <span className="font-bold">
                                    {new Date(obs.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-[10px] opacity-75">
                                    {new Date(obs.timestamp).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </span>
                              ) : '—'}
                            </td>
                            {/* Student Name */}
                            <td className="py-4 font-black italic uppercase tracking-tight text-brand-navy">
                              {obs.studentName || (lang === 'RU' ? 'Спортсмен' : 'Student')}
                            </td>
                            {/* Text */}
                            <td className="py-4 italic text-brand-navy/70">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                {obs.text}
                              </span>
                            </td>
                            {/* Coach */}
                            <td className="py-4 italic font-black text-brand-navy/60">
                              {obs.masterName || obs.issuedBy || (lang === 'RU' ? 'Тренер Роман' : 'Coach Roman')}
                            </td>
                            {/* Action */}
                            {isMaster && (
                              <td className="py-4 text-right pr-2">
                                <Button
                                  variant="outline"
                                  disabled={removingObsId === obs.id}
                                  onClick={() => handleRemoveObservation(obs.id, obs.studentId)}
                                  className="h-8 !py-1 !px-3 !rounded-lg text-[9px] uppercase font-black border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm inline-flex items-center gap-1"
                                >
                                  {removingObsId === obs.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  ) : (
                                    <>
                                      <X className="w-2.5 h-2.5" />
                                      {lang === 'RU' ? 'Удалить' : lang === 'GE' ? 'წაშლა' : 'Delete'}
                                    </>
                                  )}
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-brand-navy/60 font-medium italic max-w-md">
                    {lang === 'RU'
                      ? 'Для этого занятия не найдено поведенческих наблюдений или заметок.'
                      : lang === 'GE'
                        ? 'ამ ვარჯიშისთვის ქცევითი დაკვირვებები ან შენიშვნები არ მოიძებნა.'
                        : 'No behavioral observations or notepad notes added for this event yet.'}
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[2100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-[32px] p-8 border border-brand-navy/10 shadow-2xl relative overflow-hidden"
            >
              <h3 className="text-2xl font-black italic uppercase tracking-tight mb-4 flex items-center gap-3 text-red-600">
                <Trash2 className="w-6 h-6 animate-bounce" />
                {t.confirmDeletionTitle}
              </h3>
              
              <p className="text-sm font-medium italic text-brand-navy/70 leading-relaxed mb-8">
                {t.confirmDeletionMsg}
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-wider border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5"
                >
                  {t.cancelBtn}
                </Button>
                <Button
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-wider bg-red-600 hover:bg-red-700 text-white border-none flex items-center justify-center gap-2 shadow-lg"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.deletingEvent}
                    </>
                  ) : (
                    t.confirmDeleteBtn
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
