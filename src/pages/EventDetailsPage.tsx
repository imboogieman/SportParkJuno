import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  User, 
  ClipboardList, 
  Home as HomeIcon,
  Loader2,
  Lock,
  Trophy,
  Zap,
  Star,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { Navbar, Footer } from '../components/Landing';
import { Badge, Button, Card } from '../components/UI';
import { translations } from '../i18n';
import { db } from '../lib/firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ClassEventAgenda from '../components/ClassEventAgenda';
import AthleteHomeTaskView from '../components/AthleteHomeTaskView';
import { MOCK_STUDENT, LOCATIONS } from '../constants';
import { getDummyEvents } from '../components/Dashboard';

interface EventDetailsPageProps {
  lang: 'EN' | 'GE' | 'RU' | 'TR';
  setLang: (l: 'EN' | 'GE' | 'RU' | 'TR') => void;
}

const LOCALIZATION = {
  EN: {
    back: "Back",
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
    back: "Назад",
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
    confirmDeletionMsg: "Вы уверены, что хотите навсегда удалить это событие? Это также удалит все связанные приглашения спортсменов и записи о домашних заданиях из базы данных.",
    cancelBtn: "Отмена",
    confirmDeleteBtn: "Подтвердить удаление",
    deletingEvent: "Удаление события..."
  },
  GE: {
    back: "უკან",
    noEventFound: "ღონისძიება ვერ მოიძებნა",
    noEventSub: "ჩვენ ვერ ვიპოვეთ ეს კონკრეტული ღონისძიება აკადემიის სისტემაში.",
    viewProgram: "ვარჯიშის სრული პროგრამა",
    homeworkTitle: "საშინაო ვარჯიში",
    loadingEvent: "ღონისძიების დეტალების ჩატვირთვა...",
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
    back: "Geri",
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

export default function EventDetailsPage({ lang = 'RU', setLang }: EventDetailsPageProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const tGlobal = translations[lang as keyof typeof translations] || translations.RU;
  const t = LOCALIZATION[lang as keyof typeof LOCALIZATION] || LOCALIZATION.RU;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [athleteData, setAthleteData] = useState<any>(null);
  const [masterData, setMasterData] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Load registered athlete data if available
    const storedAthlete = localStorage.getItem('athleteAccount');
    if (storedAthlete) {
      try {
        setAthleteData(JSON.parse(storedAthlete));
      } catch (_) {
        setAthleteData(null);
      }
    }

    // Load master coach account if available
    const storedMaster = localStorage.getItem('masterAccount');
    if (storedMaster) {
      try {
        setMasterData(JSON.parse(storedMaster));
      } catch (_) {
        setMasterData(null);
      }
    }
  }, []);

  useEffect(() => {
    if (athleteData && eventId) {
      localStorage.setItem('selectedEventIdInPortal', eventId);
      localStorage.setItem('activeTab', 'event_details');
      navigate('/portal', { replace: true });
    }
  }, [athleteData, eventId, navigate]);

  const handleConfirmDelete = async () => {
    if (!event?.id) return;
    setIsDeleting(true);
    try {
      // 1. Delete associated invitations from Firestore
      const q = query(collection(db, 'invitations'), where('eventId', '==', event.id));
      const qSnap = await getDocs(q);
      const deletePromises = qSnap.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      // 2. Delete the actual event document
      await deleteDoc(doc(db, 'events', event.id));

      // 3. Close confirm modal and redirect
      setShowDeleteConfirm(false);
      navigate('/events');
    } catch (err) {
      console.error("Error during event deletion:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      // 1. Check if it corresponds to a dummy event from Dashboard
      const dummyEvents = getDummyEvents(lang);
      const matchedDummy = dummyEvents.find(e => e.id === eventId) as any;
      if (matchedDummy) {
        // Enforce a homeTask if missing so full details can always be viewed
        if (!matchedDummy.homeTask) {
          matchedDummy.homeTask = {
            title: "Elite Touch Master",
            durationMins: 15,
            repetitions: "4 series of 50 touches",
            completedByAthleteIds: []
          };
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

      // 3. Fallback / Fetch from Firestore
      try {
        const docRef = doc(db, 'events', eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = { id: docSnap.id, ...docSnap.data() } as any;
          // Dynamically enforce a beautiful homeTask draft if empty
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
          // If not found in primary documents, check for a subcollection or invite
          // Look up in PRE_EVENTS_FALLBACK as absolute default
          const defaultEvent = PRE_EVENTS_FALLBACK[0];
          setEvent({
            ...defaultEvent,
            id: eventId,
            name: `${defaultEvent.name} [Demo]`
          });
        }
      } catch (err) {
        console.error("Error reading event document:", err);
        // Fallback gracefully on query failures
        setEvent(PRE_EVENTS_FALLBACK[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, lang]);

  const getFullLocationName = (locId: string) => {
    const matched = LOCATIONS.find(l => l.id === locId);
    if (!matched) return locId;
    if (lang === 'RU') return matched.nameRU;
    if (lang === 'GE') return matched.nameGE;
    if (lang === 'TR') return matched.nameTR;
    return matched.name;
  };

  const activeAthlete = athleteData || MOCK_STUDENT;

  // Track if this event is completed
  const listCompletedEvents = activeAthlete.completedHomeTasks || [];
  const isCompletedEvent = event && (
    listCompletedEvents.includes(event.id) || 
    (event.homeTask && event.homeTask.completedByAthleteIds && event.homeTask.completedByAthleteIds.includes(activeAthlete.id))
  );

  const isUnauthorizedForPrivateEvent = event && 
    event.isPublic !== true && 
    !eventId?.startsWith('dummy-') && 
    !eventId?.startsWith('preview-') &&
    !masterData && 
    !athleteData;

  if (isUnauthorizedForPrivateEvent) {
    return (
      <div className="min-h-screen bg-brand-cream relative overflow-hidden font-sans pb-32 flex flex-col justify-between">
        <Navbar 
          onPortalClick={() => navigate('/portal')} 
          currentLang={lang} 
          onLangChange={setLang} 
        />
        <main className="container mx-auto px-6 pt-36 pb-12 max-w-lg relative z-10 text-center flex-1 flex items-center justify-center">
          <div className="glass p-10 sm:p-14 rounded-[38px] border-white/60 shadow-2xl space-y-8 w-full">
            <div className="w-20 h-20 rounded-full bg-brand-sunset/10 flex items-center justify-center mx-auto text-brand-sunset">
              <Lock className="w-10 h-10" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black italic uppercase text-brand-navy tracking-tight">
                {lang === 'RU' ? 'Доступ ограничен' : 'Access Restricted'}
              </h2>
              <p className="text-brand-navy/60 font-medium italic text-sm leading-relaxed">
                {lang === 'RU' 
                  ? 'Это событие не опубликовано и доступно только авторизованным пользователям академии. Пожалуйста, войдите в свой аккаунт.' 
                  : 'This event is not published and is only accessible to authorized academy members. Please log in to your account.'}
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={() => navigate('/portal')}
                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest italic bg-brand-navy text-white hover:bg-brand-teal"
              >
                {lang === 'RU' ? 'Войти в личный кабинет' : 'Log In to Portal'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest italic border-brand-navy/15 text-brand-navy hover:bg-white"
              >
                {lang === 'RU' ? 'На главную страницу' : 'Back to Home'}
              </Button>
            </div>
          </div>
        </main>
        <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream relative overflow-hidden font-sans pb-32">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-brand-teal/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-sunset/5 blur-[180px] rounded-full pointer-events-none" />

      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />

      <main className="container mx-auto px-6 pt-28 max-w-5xl relative z-10">
        {/* Back navigation */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <Button 
            variant="outline"
            onClick={() => {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/portal');
              }
            }}
            className="h-11 px-5 !rounded-xl italic uppercase tracking-widest text-[9px] font-black flex items-center gap-2 border-brand-navy/15 text-brand-navy hover:bg-brand-navy hover:text-white shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Button>

          {masterData && event && (
            <Button
              id="delete-event-page-btn"
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
            <Button onClick={() => navigate('/portal')}>{lang === 'RU' ? 'В портал' : 'To Portal'}</Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Main Header Card */}
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
                  
                  <span className="text-[10px] font-black uppercase text-white/40 tracking-widest italic">
                    {new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
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

            {/* TWO PARTS DETAILED HIGHLIGHT - Agenda Program & Home Assignment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Part 1: Full Event Program (7 / 12 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-1.5 h-6 bg-brand-teal rounded-full animate-pulse" />
                  <h3 className="text-lg font-black uppercase tracking-widest italic text-brand-navy">{t.viewProgram}</h3>
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
                    <ClassEventAgenda event={event} lang={lang} />
                  </div>
                </Card>
              </div>

              {/* Part 2: Full Home Assignment Details (5 / 12 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-1.5 h-6 bg-brand-sunset rounded-full animate-pulse" />
                  <h3 className="text-lg font-black uppercase tracking-widest italic text-brand-navy">{t.homeworkTitle}</h3>
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
          </div>
        )}
      </main>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm z-[2100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white rounded-[32px] p-8 border border-brand-navy/10 shadow-2xl relative overflow-hidden text-brand-navy"
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
                  id="cancel-deletion-btn"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-wider border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5"
                >
                  {t.cancelBtn}
                </Button>
                <Button
                  id="confirm-deletion-btn"
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

      <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
    </div>
  );
}
