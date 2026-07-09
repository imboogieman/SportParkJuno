import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  Phone,
  UserCheck,
  Target,
  ClipboardList,
  Home
} from 'lucide-react';
import { Navbar, Footer } from '../components/Landing';
import { Badge, Button, Card } from '../components/UI';
import { translations } from '../i18n';
import { collection, getDocs, onSnapshot, query, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ClassEventAgenda from '../components/ClassEventAgenda';

const localizations = {
  EN: {
    badge: "Academy Open Days",
    title: "Public Events",
    subtitle: "Join our open training sessions and games",
    noEvents: "No public events scheduled at the moment.",
    noEventsSub: "But we're always active! Click below to book a free personal trial class anytime.",
    bookTrialBtn: "Book Trial Class",
    dateLabel: "Date",
    timeLabel: "Time",
    locationLabel: "Location",
    byLabel: "Led by",
    registerEventBtn: "Register for Event",
    backHome: "Back to Home",
    modalTitle: "Join Event",
    modalSubtitle: "Submit your details to attend",
    parentName: "Parent Full Name",
    phoneNum: "Phone Number",
    studentName: "Student Name & Age",
    submitBtn: "Confirm Attendance",
    successTitle: "Registration Confirmed!",
    successSub: "We have saved your request. Our manager will call you to confirm event details."
  },
  RU: {
    badge: "Открытые мероприятия",
    title: "Публичные События",
    subtitle: "Присоединяйтесь к нашим открытым тренировкам и играм",
    noEvents: "На данный момент нет запланированных публичных событий.",
    noEventsSub: "Но мы всегда на поле! Нажмите кнопку ниже, чтобы записаться на бесплатную пробную тренировку.",
    bookTrialBtn: "Записаться на пробное",
    dateLabel: "Дата",
    timeLabel: "Время",
    locationLabel: "Локация",
    byLabel: "Тренер",
    registerEventBtn: "Записаться на событие",
    backHome: "На главную",
    modalTitle: "Запись на событие",
    modalSubtitle: "Введите ваши данные для участия",
    parentName: "ФИО Родителя",
    phoneNum: "Номер телефона",
    studentName: "Имя и возраст ученика",
    submitBtn: "Подтвердить участие",
    successTitle: "Вы успешно записаны!",
    successSub: "Мы зарезервировали место. Наш менеджер свяжется с вами для подтверждения деталей события."
  },
  GE: {
    badge: "აკადემიის ღონისძიებები",
    title: "საჯარო ღონისძიებები",
    subtitle: "შემოუერთდით ჩვენს ღია ვარჯიშებსა და თამაშებს",
    noEvents: "ამჟამად საჯარო ღონისძიებები არ არის დაგეგმილი.",
    noEventsSub: "მაგრამ ჩვენ მუდამ აქტიურები ვართ! დააწკაპუნეთ ქვემოთ უფასო საცდელ ვარჯიშზე ჩასაწერად.",
    bookTrialBtn: "საცდელი ვარჯიში",
    dateLabel: "თარიღი",
    timeLabel: "დრო",
    locationLabel: "ლოკაცია",
    byLabel: "მწვრთნელი",
    registerEventBtn: "ღონისძიებაზე რეგისტრაცია",
    backHome: "მთავარ გვერდზე",
    modalTitle: "ღონისძიებაზე ჩაწერა",
    modalSubtitle: "შეიყვანეთ ინფორმაცია მონაწილეობისთვის",
    parentName: "მშობლის სახელი და გვარი",
    phoneNum: "ტელეფონის ნომერი",
    studentName: "მოსწავლის სახელი და ასაკი",
    submitBtn: "მონაწილეობის დადასტურება",
    successTitle: "რეგისტრაცია წარმატებულია!",
    successSub: "ადგილი დაჯავშნილია. ჩვენი მენეჯერი მალე დაგიკავშირდებათ დეტალების დასაზუსტებლად."
  },
  TR: {
    badge: "Akademi Etkinlikleri",
    title: "Açık Etkinlikler",
    subtitle: "Açık antrenman seanslarımıza ve maçlarımıza katılın",
    noEvents: "Şu anda planlanmış açık etkinlik bulunmuyor.",
    noEventsSub: "Ancak her zaman sahadayız! İstediğiniz zaman ücretsiz deneme dersi randevusu alabilirsiniz.",
    bookTrialBtn: "Deneme Dersi Al",
    dateLabel: "Tarih",
    timeLabel: "Saat",
    locationLabel: "Lokasyon",
    byLabel: "Antrenör",
    registerEventBtn: "Etkinliğe Kaydol",
    backHome: "Ana Sayfaya Dön",
    modalTitle: "Etkinliğe Katıl",
    modalSubtitle: "Katılım için bilgilerinizi girin",
    parentName: "Veli Adı Soyadı",
    phoneNum: "Telefon Numarası",
    studentName: "Öğrenci Adı ve Yaşı",
    submitBtn: "Katılımı Onayla",
    successTitle: "Kayıt Onaylandı!",
    successSub: "Başvurunuz kaydedildi. Detaylar ve onay için yöneticimiz sizinle iletişime geçecektir."
  }
};

const PREVIEW_LOCALISATIONS = {
  EN: {
    previewLabel: "Demo Preview",
    previewBanner: "Live Schedule Empty — Showing Event Previews below",
    previewBannerSub: "There are currently no live events published on the registry. However, below we have provided a preview of typical upcoming academy open days. You can interact with them and register to try out our booking system."
  },
  RU: {
    previewLabel: "Демо-Превью",
    previewBanner: "Расписание пусто — Показ демонстрационных событий",
    previewBannerSub: "На данный момент главный тренер не опубликовал активных событий. Ниже вы можете изучить интерактивное превью будущих мероприятий программы и пройти бесплатную регистрацию."
  },
  GE: {
    previewLabel: "დემო ვერსია",
    previewBanner: "აქტიური განრიგი ცარიელია — ნაჩვენებია დემო ღონისძიებები",
    previewBannerSub: "ამჟამად საჯარო ღონისძიებები არ არის გამოქვეყნებული. ქვემოთ მოცემულია ილუსტრაციული დემო ვერსია. შეგიძლიათ გაიაროთ რეგისტრაცია და შეამოწმოთ სისტემა."
  },
  TR: {
    previewLabel: "Önizleme",
    previewBanner: "Aktif Etkinlik Yok — Gösteri Önizlemeleri aşağıdadır",
    previewBannerSub: "Şu anda yayında aktif bir akademi etkinliği bulunmamaktadır. Aşağıdaki interaktif önizleme kartlarını inceleyebilir ve kayıt sistemini canlı olarak test edebilirsiniz."
  }
};

const PRE_EVENTS = {
  EN: [
    {
      id: "preview-1",
      name: "Academy Showcase & Open Training Match",
      description: "Observe our unique holistic methodology in action. Parents can meet the technical director, watch the kids play a competitive match, and explore our skill grading metrics standard.",
      startTime: "10:00 - 12:00",
      location: "airport_runway",
      dateOffset: 4,
      coach: {
        fullName: "Roman Gorbunov",
        avatar: "/Images/tech_director_01.png",
        role: "Technical Director / Head Coach"
      },
      isDemo: true
    },
    {
      id: "preview-2",
      name: "Champions Football Masterclass",
      description: "A special high-intensity training session designed for speed, tactical awareness, and professional standard dribbling drills led by professional veterans.",
      startTime: "15:30 - 17:00",
      location: "metro_mall",
      dateOffset: 7,
      coach: {
        fullName: "Stefan Zhivozudsky",
        avatar: "/Images/football_coach_01.png",
        role: "Pro Football Coach"
      },
      isDemo: true
    }
  ],
  RU: [
    {
      id: "preview-1",
      name: "Открытый Матч и Презентация Программы",
      description: "Познакомьтесь с нашей уникальной холистической методикой на практике. Родители могут пообщаться с главным тренером, увидеть спортивное тестирование навыков и оценить прогресс детей.",
      startTime: "10:00 - 12:00",
      location: "airport_runway",
      dateOffset: 4,
      coach: {
        fullName: "Роман Горбунов",
        avatar: "/Images/tech_director_01.png",
        role: "Технический Директор / Главный Тренер"
      },
      isDemo: true
    },
    {
      id: "preview-2",
      name: "Мастер-класс \"Путь Чемпиона\"",
      description: "Интенсивная тренировка, направленная на развитие скорости принятия решений, футбольного интеллекта, дриблинга и тактических перемещений на поле.",
      startTime: "15:30 - 17:00",
      location: "metro_mall",
      dateOffset: 7,
      coach: {
        fullName: "Стефан Живозудский",
        avatar: "/Images/football_coach_01.png",
        role: "Профессиональный Тренер"
      },
      isDemo: true
    }
  ],
  GE: [
    {
      id: "preview-1",
      name: "აკადემიის საჩვენებელი მატჩი & ღია ვარჯიში",
      description: "გაეცანით ჩვენს ჰოლისტიკურ სპორტულ მეთოდოლოგიას. მშობლებს ექნებათ შესაძლებლობა გაესაუბრონ ტექნიკურ დირექტორს და თვალი ადევნონ ღია თამაშებს.",
      startTime: "10:00 - 12:00",
      location: "airport_runway",
      dateOffset: 4,
      coach: {
        fullName: "რომან გორბუნოვი",
        avatar: "/Images/tech_director_01.png",
        role: "ტექნიკური დირექტორი"
      },
      isDemo: true
    },
    {
      id: "preview-2",
      name: "ჩემპიონთა ფეხბურთის მასტერკლასი",
      description: "სპეციალური მაღალინტენსიური ვარჯიში, რომელიც მიმართულია სისწრაფის, ტაქტიკური აზროვნებისა და პროფესიონალური დრიბლინგის გაუმჯობესებაზე.",
      startTime: "15:30 - 17:00",
      location: "metro_mall",
      dateOffset: 7,
      coach: {
        fullName: "სტეფან ჟივოზუდსკი",
        avatar: "/Images/football_coach_01.png",
        role: "ფეხბურთის მწვრთნელი"
      },
      isDemo: true
    }
  ],
  TR: [
    {
      id: "preview-1",
      name: "Akademi Gösteri Maçı ve Açık Antrenman",
      description: "Eşsiz bütünsel metodolojimizi sahada gözlemleyin. Veliler teknik direktörle tanışabilir, çocukların gelişimini ve yetenek karnelerini yakından inceleyebilir.",
      startTime: "10:00 - 12:00",
      location: "airport_runway",
      dateOffset: 4,
      coach: {
        fullName: "Roman Gorbunov",
        avatar: "/Images/tech_director_01.png",
        role: "Teknik Direktör"
      },
      isDemo: true
    },
    {
      id: "preview-2",
      name: "Şampiyonlar Futbol Masterclass Sınıfı",
      description: "Hız, taktiksel farkındalık ve profesyonel standartlarda top sürme teknikleri üzerine kurgulanmış yüksek yoğunluklu bir gelişim antrenmanı.",
      startTime: "15:30 - 17:00",
      location: "metro_mall",
      dateOffset: 7,
      coach: {
        fullName: "Stefan Zhivozudsky",
        avatar: "/Images/football_coach_01.png",
        role: "Profesyonel Antrenör"
      },
      isDemo: true
    }
  ]
};

export default function PublicEvents({ lang = 'RU', setLang }: { lang?: 'EN' | 'GE' | 'RU' | 'TR', setLang: (l: any) => void }) {
  const navigate = useNavigate();
  const tGlobal = translations[lang as keyof typeof translations] || translations.RU;
  const t = localizations[lang as keyof typeof localizations] || localizations.RU;
  const preT = PREVIEW_LOCALISATIONS[lang as keyof typeof PREVIEW_LOCALISATIONS] || PREVIEW_LOCALISATIONS.RU;

  const [events, setEvents] = useState<any[]>([]);
  const [masters, setMasters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [athleteData, setAthleteData] = useState<any | null>(null);
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('athleteAccount');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAthleteData(parsed);

        const q = query(
          collection(db, 'invitations'),
          where('studentId', '==', parsed.id)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const invs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setInvitations(invs);
        }, (err) => {
          console.error("Error fetching student invitations:", err);
        });

        return unsubscribe;
      } catch (e) {
        console.error("Error tracking athlete account:", e);
      }
    }
  }, []);
  
  const hasLiveEvents = events.length > 0;
  const currentPre = PRE_EVENTS[lang as keyof typeof PRE_EVENTS] || PRE_EVENTS.RU;
  const listToRender = hasLiveEvents ? events : currentPre.map(pe => {
    const d = new Date();
    d.setDate(d.getDate() + pe.dateOffset);
    return {
      ...pe,
      date: d.toISOString()
    };
  });
  
  // Removed obsolete custom event modal states
  
  const LOCATIONS = [
    { id: 'airport_runway', label: tGlobal.locAirport || 'Location Airport' },
    { id: 'metro_mall', label: tGlobal.locMetroMall || 'Metro Mall' },
    { id: 'agmashenebeli', label: tGlobal.locAgmashenebeli || 'Agmashenebeli Av.' },
    { id: 'pirosmani_5', label: tGlobal.locPirosmani5 || 'Pirosmani 5' },
    { id: 'kaczynski_5', label: tGlobal.locKaczynski5 || 'Kaczynski 5' },
    { id: 'batumi_boulevard', label: tGlobal.locBatumiBoulevard || 'Batumi Boulevard' },
  ];

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Fetch Masters / Coaches for binding profiles
    const fetchMastersAndEvents = async () => {
      try {
        const mastersSnap = await getDocs(collection(db, 'masters'));
        const mastersMap: Record<string, any> = {};
        mastersSnap.forEach((doc) => {
          mastersMap[doc.id] = { id: doc.id, ...doc.data() };
        });
        setMasters(mastersMap);
      } catch (err) {
        console.error("Error fetching masters:", err);
      }

      // Fetch Events Realtime
      const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
        const publicList = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(e => e.isPublic === true)
          // Sort client-side by date ASC (soonest first)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setEvents(publicList);
        setLoading(false);
      }, (error) => {
        console.error("Events snapshot error:", error);
        setLoading(false);
      });

      return unsubscribe;
    };

    fetchMastersAndEvents();
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream relative overflow-hidden font-sans">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-brand-teal/5 blur-[200px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-brand-sunset/5 blur-[180px] rounded-full pointer-events-none" />

      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />

      <main className="container mx-auto px-6 pt-28 pb-32 relative z-10">
        {/* Header Back Button & Typography */}
        <div className="max-w-4xl mx-auto mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-brand-navy leading-none mb-3">
            {t.title}
          </h1>
          <p className="text-brand-navy/60 max-w-xl mx-auto font-medium italic text-xs md:text-sm leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32">
            <Loader2 className="w-12 h-12 text-brand-teal animate-spin mb-4" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic">
              {lang === 'RU' ? 'Загрузка событий...' : 'Loading events...'}
            </span>
          </div>
        ) : (
          <>
            {/* Events Grid layout */}
            <div className={athleteData ? "grid grid-cols-1 gap-6 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"}>
              {listToRender.map((event, index) => {
                const assignedCoach = event.isDemo ? event.coach : masters[event.masterId];
                const resolvedLoc = LOCATIONS.find(l => l.id === event.location)?.label || event.location;
                const d = new Date(event.date);
                const isTraining = event.type === 'training' || event.id?.includes('preview-2') || event.name.toLowerCase().includes('training') || event.name.toLowerCase().includes('тренировка') || event.name.toLowerCase().includes('masterclass') || event.name.toLowerCase().includes('мастер-класс');
                
                // If they are authorized: dashboard style card, more compact
                if (athleteData) {
                  const invitation = invitations.find((inv: any) => inv.eventId === event.id);
                  const eventStatus = invitation ? invitation.status : 'accepted';
                  const statusLabel = eventStatus === 'accepted' 
                    ? (lang === 'RU' ? 'Подтверждено' : 'Confirmed') 
                    : eventStatus === 'pending' 
                      ? (lang === 'RU' ? 'Приглашен' : 'Invited') 
                      : eventStatus === 'declined' 
                        ? (lang === 'RU' ? 'Отклонено' : 'Declined') 
                        : (lang === 'RU' ? 'Участник' : 'Attending');

                  return (
                    <motion.div
                      key={`authorized_evt_${event.id || 'evt'}_${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => {
                        localStorage.setItem('selectedEventIdInPortal', event.id);
                        localStorage.setItem('activeTab', 'event_details');
                        navigate('/portal');
                      }}
                      className={`p-6 md:p-8 rounded-[36px] border transition-all flex flex-col md:flex-row items-center gap-6 group cursor-pointer ${
                        isTraining 
                          ? 'glass-dark border-white/5 text-white hover:bg-brand-navy' 
                          : 'glass border-brand-sunset/20 text-brand-navy hover:bg-white'
                      }`}
                    >
                      {/* Left Circular/Square Date Badge */}
                      <div className={`w-20 h-20 rounded-[28px] flex flex-col items-center justify-center shrink-0 shadow-xl rotate-3 group-hover:rotate-0 transition-transform ${
                        isTraining ? 'bg-brand-teal text-white shadow-teal' : 'bg-brand-sunset text-white shadow-sunset'
                      }`}>
                        <span className="text-[9px] uppercase font-black leading-none opacity-60 mb-0.5">
                          {d.toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-3xl font-black leading-none italic tracking-tighter">
                          {d.getDate()}
                        </span>
                      </div>

                      {/* Middle Details Block */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-2">
                          <Badge color={isTraining ? 'teal' : 'sunset'} className="text-[8px] uppercase italic leading-none px-2 py-0.5 shrink-0">
                            {isTraining ? (lang === 'RU' ? 'ТРЕНИРОВКА' : 'TRAINING') : (lang === 'RU' ? 'СОБЫТИЕ' : 'EVENT')}
                          </Badge>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${isTraining ? 'text-white/40' : 'text-brand-navy/40'}`}>
                            {d.toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
                          </span>
                        </div>
                        <h4 className={`text-xl md:text-2xl font-black italic uppercase tracking-tight leading-snug mb-3 group-hover:text-brand-teal transition-colors duration-300 ${
                          isTraining ? 'text-white' : 'text-brand-navy'
                        }`}>
                          {event.name}
                        </h4>
                        <div className={`flex flex-wrap justify-center md:justify-start items-center gap-5 text-brand-navy/40 group-hover:text-brand-navy transition-colors ${isTraining ? 'text-white/40' : ''}`}>
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic">
                            <Clock className="w-3.5 h-3.5 text-brand-teal" />
                            <span className={isTraining ? 'text-white/40' : ''}>{event.startTime}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest italic">
                            <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                            <span className={isTraining ? 'text-white/40' : ''}>{resolvedLoc}</span>
                          </div>
                        </div>

                        {/* Program & HW pills exactly like the dashboard! */}
                        <div className={`mt-5 pt-3 border-t flex flex-wrap gap-2.5 justify-center md:justify-start ${
                          isTraining ? 'border-white/10' : 'border-brand-navy/5'
                        }`}>
                          <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider italic flex items-center gap-1.5 ${
                            isTraining ? 'bg-white/10 text-brand-teal' : 'bg-brand-navy/5 text-brand-navy/80'
                          }`}>
                            <ClipboardList className="w-3 h-3 text-brand-teal" />
                            <span>{lang === 'RU' ? 'Расписание и план тренировки' : 'Class Program Included'}</span>
                          </div>

                          {event.homeTask && (() => {
                            const listCompletedEvents = athleteData?.completedHomeTasks || [];
                            const isCompleted = listCompletedEvents.includes(event.id) || 
                              (event.homeTask.completedByAthleteIds && event.homeTask.completedByAthleteIds.includes(athleteData?.id));

                            return (
                              <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider italic flex items-center gap-1.5 ${isCompleted ? 'bg-brand-teal/15 text-brand-teal' : 'bg-brand-sunset/15 text-brand-sunset'}`}>
                                <Home className="w-3 h-3" />
                                <span>
                                  {lang === 'RU' ? `Домашка: ${event.homeTask.title}` : `Homework: ${event.homeTask.title}`}
                                </span>
                                {isCompleted && (
                                  <span className="text-[7px] font-black bg-brand-teal/20 text-brand-teal px-1 rounded">✓</span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="shrink-0 flex flex-col items-center md:items-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Badge 
                          color={eventStatus === 'accepted' || isTraining ? 'teal' : (eventStatus === 'declined' ? 'red' : 'navy')} 
                          className="uppercase italic px-4 py-1.5 rounded-xl shadow-md border-white/5 font-black tracking-widest text-[9px]"
                        >
                          {statusLabel}
                        </Badge>
                        <Button
                          onClick={() => {
                            localStorage.setItem('selectedEventIdInPortal', event.id);
                            localStorage.setItem('activeTab', 'event_details');
                            navigate('/portal');
                          }}
                          className={`h-9 px-4 !rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${
                            isTraining 
                              ? 'bg-brand-sunset hover:bg-brand-teal text-white' 
                              : 'bg-brand-navy hover:bg-brand-teal text-white'
                          }`}
                        >
                          <span>{lang === 'RU' ? 'ПОДРОБНЕЕ' : 'VIEW DETAILS'}</span>
                          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                        </Button>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={`${event.id || 'public_evt'}_${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card className={`h-full p-8 md:p-10 border rounded-[48px] shadow-3xl flex flex-col justify-between group transition-all duration-500 hover:scale-[1.02] relative overflow-hidden ${
                      isTraining 
                        ? 'glass-dark border-white/5 text-white hover:bg-brand-navy' 
                        : 'glass border-brand-sunset/20 text-brand-navy hover:bg-white'
                    }`}>
                      {event.isDemo && (
                        <div className="absolute top-0 right-0 z-20">
                          <span className={`text-[7px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-3xl border-l border-b italic ${
                            isTraining
                              ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/30'
                              : 'bg-brand-sunset/15 text-brand-sunset border-brand-sunset/30'
                          }`}>
                            {preT.previewLabel}
                          </span>
                        </div>
                      )}

                      <div>
                        {/* Date Header block */}
                        <div className="flex items-center justify-between mb-8">
                          <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-[22px] flex flex-col items-center justify-center text-white rotate-3 group-hover:rotate-0 transition-all duration-500 shrink-0 ${
                              isTraining ? 'bg-brand-teal shadow-teal' : 'bg-brand-sunset shadow-sunset'
                            }`}>
                              <span className="text-[8px] uppercase font-black leading-none opacity-60 mb-0.5">
                                {d.toLocaleDateString(lang === 'RU' ? 'ru' : 'en', { weekday: 'short' }).toUpperCase()}
                              </span>
                              <span className="text-2xl font-black leading-none italic tracking-tighter">
                                {d.getDate()}
                              </span>
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <Badge color={isTraining ? 'teal' : 'sunset'} className="text-[7.5px] uppercase italic tracking-[0.1em] px-2 py-0.5 font-black leading-none shrink-0">
                                  {isTraining ? (lang === 'RU' ? 'ТРЕНИРОВКА' : 'TRAINING') : (lang === 'RU' ? 'СОБЫТИЕ' : 'EVENT')}
                                </Badge>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${
                                  isTraining ? 'text-white/30' : 'text-brand-navy/30'
                                }`}>
                                  #{(index + 1).toString().padStart(2, '0')}
                                </span>
                              </div>
                              <span className={`text-[10px] font-black uppercase block leading-none italic ${
                                isTraining ? 'text-white/40' : 'text-brand-navy/40'
                              }`}>
                                {d.toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 text-xs font-black uppercase italic leading-none shrink-0 border px-3 py-1.5 rounded-xl ${
                            isTraining ? 'border-white/10 bg-white/5 text-brand-teal' : 'border-brand-navy/10 bg-brand-navy/5 text-brand-teal'
                          }`}>
                            <Clock className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                            <span>{event.startTime}</span>
                          </div>
                        </div>

                        {/* Event Details */}
                        <h3 className={`text-2xl font-black italic uppercase tracking-tighter leading-snug mb-3 group-hover:text-brand-teal transition-colors duration-400 ${
                          isTraining ? 'text-white' : 'text-brand-navy'
                        }`}>
                          {event.name}
                        </h3>
                        <p className={`text-[13px] font-medium leading-relaxed mb-6 block italic ${
                          isTraining ? 'text-white/70' : 'text-brand-navy/70'
                        }`}>
                          {event.description && event.description.includes('⚽ CLASS AGENDA PLAN')
                            ? (lang === 'RU' 
                              ? 'Интерактивная футбольная тренировка со специальной детальной программой по фазам.' 
                              : 'Structured academy training session with a custom step-by-step agenda phase plan.')
                            : event.description}
                        </p>

                        {/* Public card displays just the program preview */}
                        <div className={`mt-4 pt-4 border-t flex items-center justify-between p-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic ${
                          isTraining 
                            ? 'bg-white/5 border-white/10 text-brand-teal' 
                            : 'bg-brand-navy/5 border-brand-navy/5 text-brand-navy'
                        }`}>
                          <span className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-brand-sunset animate-pulse shrink-0" />
                            <span>{lang === 'RU' ? 'Программа тренировки добавлена' : 'Training Program Included'}</span>
                          </span>
                        </div>

                        {/* Location Badge */}
                        <div className={`flex items-center gap-3 p-3.5 rounded-2xl mt-4 mb-8 border ${
                          isTraining 
                            ? 'bg-white/5 border-white/10 text-white/80' 
                            : 'bg-brand-navy/5 border-brand-navy/5 text-brand-navy'
                        }`}>
                          <MapPin className="w-4 h-4 text-brand-teal shrink-0 animate-bounce" />
                          <span className="text-[10px] font-black uppercase italic tracking-widest truncate font-sans">
                            {resolvedLoc}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Coach details and Button */}
                      <div className={`pt-6 border-t space-y-6 ${
                        isTraining ? 'border-white/10' : 'border-brand-navy/5'
                      }`}>
                        {assignedCoach && (
                          <div className="flex items-center gap-3.5">
                            <img 
                              src={assignedCoach.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400'} 
                              alt={assignedCoach.fullName} 
                              className={`w-10 h-10 rounded-xl border object-cover ${
                                isTraining ? 'border-white/10' : 'border-brand-navy/10'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className={`text-[8px] font-black uppercase block leading-none mb-1 italic ${
                                isTraining ? 'text-white/40' : 'text-brand-navy/30'
                              }`}>
                                {t.byLabel}
                              </span>
                              <span className={`text-xs font-black uppercase italic leading-none ${
                                isTraining ? 'text-white' : 'text-brand-navy'
                              }`}>
                                {assignedCoach.fullName}
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-brand-teal block mt-0.5 leading-none">
                                {assignedCoach.role || assignedCoach.specialization}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2.5">
                          <Button 
                            onClick={() => {
                              navigate(`/events/${event.id}`);
                            }}
                            variant="outline"
                            className={`w-full h-12 !rounded-xl italic uppercase tracking-widest text-[9px] font-black transition-all shadow-sm flex items-center justify-center gap-2 ${
                              isTraining 
                                ? 'border-white/15 text-white hover:bg-white hover:text-brand-navy' 
                                : 'border-brand-navy/15 text-brand-navy hover:bg-brand-navy/95 hover:text-white'
                            }`}
                          >
                            <Calendar className="w-4 h-4 text-brand-teal shrink-0" />
                            {lang === 'RU' ? 'Программа и ДЗ' : lang === 'GE' ? 'პროგრამა და დზ' : lang === 'TR' ? 'Program ve Ödev' : 'Program & HW'}
                          </Button>

                          <Button 
                            onClick={() => {
                              navigate('/register');
                            }}
                            className={`w-full h-12 !rounded-xl italic uppercase tracking-widest text-[9px] font-black text-white hover:bg-brand-teal transition-all shadow-md flex items-center justify-center gap-2 border-none ${
                              isTraining
                                ? 'bg-brand-sunset hover:bg-brand-teal shadow-sunset'
                                : 'bg-brand-navy hover:bg-brand-teal shadow-sm shadow-black/10'
                            }`}
                          >
                            <UserCheck className="w-4 h-4 shrink-0" />
                            {t.registerEventBtn}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Floating actions */}
        <div className="mt-20 flex justify-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="h-14 px-8 !rounded-2xl italic uppercase tracking-widest text-[9px] font-black flex items-center gap-3 border-brand-navy/15 text-brand-navy hover:bg-brand-navy hover:text-white shadow-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backHome}
          </Button>
        </div>
      </main>

      <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
    </div>
  );
}
