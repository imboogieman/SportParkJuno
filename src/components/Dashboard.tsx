import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Input } from './UI';
import { MOCK_STUDENT, LOCATIONS } from '../constants';
import { BarChart3, Clock, MapPin, Trophy, Users, Zap, LayoutGrid, Settings, LogOut, ChevronRight, Activity, Bell, Star, Target, CheckCircle2, User, Phone, Search, Loader2, X, UserPlus, Dribbble, Mail, Check, Edit, Home, Lock, Trash2, Copy } from 'lucide-react';
import { translations } from '../i18n';
import { collection, query, where, limit, getDocs, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, processRegistrationStatus } from '../lib/firebase';
import { PatternFormat } from 'react-number-format';
import { signOut } from 'firebase/auth';
import { ClipboardList, Plus, ChevronUp, ChevronDown, GripVertical, Calendar, Award, History, ChevronLeft, FileText, CreditCard, PlusSquare, Minus, AlertTriangle, AlertCircle, ShieldCheck, ExternalLink } from 'lucide-react';
import AthleteParametersDashboard from './AthleteParametersDashboard';
import MasterExercisesView from './MasterExercisesView';
import ClassEventAgenda from './ClassEventAgenda';
import AIHomeTaskScheduler from './AIHomeTaskScheduler';
import AthleteHomeTaskView from './AthleteHomeTaskView';
import ProfileView from './ProfileView';
import InAppEventDetailsView from './InAppEventDetailsView';
import { getLocalizedDefaults, getExerciseCategory } from '../exercisesData';

export function getDummyEvents(lang: string) {
  return [
    {
      id: 'dummy-event-1',
      name: lang === 'RU' ? 'Холистическая футбольная тренировка' : lang === 'GE' ? 'ჰოლისტიკური საფეხბურთო ვარჯიში' : 'Holistic Football Training',
      type: 'training',
      date: '2026-06-18',
      startTime: '17:00 - 18:30',
      location: 'pirosmani_5',
      status: 'accepted',
      homeTask: {
        title: "Elite Touch Master",
        durationMins: 15,
        completedByAthleteIds: []
      }
    },
    {
      id: 'dummy-event-2',
      name: lang === 'RU' ? 'Мастер-класс по скорости и ловкости' : lang === 'GE' ? 'სისწრაფისა და სიმკვირცხლის მასტერკლასი' : 'Speed & Agility Masterclass',
      type: 'training',
      date: '2026-06-20',
      startTime: '16:30 - 18:00',
      location: 'metro_mall',
      status: 'pending'
    },
    {
      id: 'dummy-event-3',
      name: lang === 'RU' ? 'Турнир: Летний кубок Juno 2026' : lang === 'GE' ? 'ტურნირი: Juno-ს ზაფხულის თასი 2026' : 'Tournament: Juno Summer Cup 2026',
      type: 'event',
      date: '2026-06-25',
      startTime: '10:00 - 14:00',
      location: 'airport_runway',
      status: 'accepted',
      homeTask: {
        title: "Reactive Agility",
        durationMins: 20,
        completedByAthleteIds: []
      }
    }
  ];
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null, // No auth being used for this search form
      email: null,
      emailVerified: null,
      isAnonymous: null,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface LevelDetails {
  tier: string;
  title: string;
  minXp: number;
  maxXp: number;
  nextXpNeeded: number;
  progressPercent: number;
}

export function getStudentLevelInfo(xp: number): LevelDetails {
  if (xp < 100) {
    return {
      tier: "Level 1",
      title: "nookie",
      minXp: 0,
      maxXp: 100,
      nextXpNeeded: 100 - xp,
      progressPercent: Math.max(0, Math.min(100, (xp / 100) * 100))
    };
  } else if (xp < 300) {
    return {
      tier: "Level 1",
      title: "player",
      minXp: 100,
      maxXp: 300,
      nextXpNeeded: 300 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 100) / 200) * 100))
    };
  } else if (xp < 500) {
    return {
      tier: "Level 1",
      title: "baller",
      minXp: 300,
      maxXp: 500,
      nextXpNeeded: 500 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 300) / 200) * 100))
    };
  } else if (xp < 1000) {
    return {
      tier: "Level 2",
      title: "Advanced",
      minXp: 500,
      maxXp: 1000,
      nextXpNeeded: 1000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 500) / 500) * 100))
    };
  } else if (xp < 5000) {
    return {
      tier: "Level 2",
      title: "Pro",
      minXp: 1000,
      maxXp: 5000,
      nextXpNeeded: 5000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 1000) / 4000) * 100))
    };
  } else if (xp < 10000) {
    return {
      tier: "Level 2",
      title: "Star",
      minXp: 5000,
      maxXp: 10000,
      nextXpNeeded: 10000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 5000) / 5000) * 100))
    };
  } else {
    return {
      tier: "Level 2 Max",
      title: "Star",
      minXp: 10000,
      maxXp: 10000,
      nextXpNeeded: 0,
      progressPercent: 100
    };
  }
}

export function Dashboard({ onBack, lang = 'EN' }: { onBack: () => void, lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const navigate = useNavigate();
  
  const [activeTab, setActiveTabState] = React.useState<string>(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('activeTab', tab);
  };

  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(() => {
    return localStorage.getItem('selectedEventIdInPortal');
  });
  const [previousTab, setPreviousTab] = React.useState<string>(() => {
    return localStorage.getItem('previousTab') || 'dashboard';
  });

  const handleViewEventDetails = (eventId: string) => {
    setSelectedEventId(eventId);
    localStorage.setItem('selectedEventIdInPortal', eventId);
    setPreviousTab(activeTab);
    localStorage.setItem('previousTab', activeTab);
    setActiveTab('event_details');
  };

  const handleBackFromEventDetails = () => {
    localStorage.removeItem('selectedEventIdInPortal');
    setSelectedEventId(null);
    setActiveTab(previousTab || 'schedule');
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showLogin, setShowLogin] = React.useState(false);
  const [firestoreQuotaExceeded, setFirestoreQuotaExceeded] = React.useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('firestoreQuotaExceeded') === 'true';
    }
    return false;
  });

  React.useEffect(() => {
    if (firestoreQuotaExceeded && typeof window !== 'undefined') {
      (window as any).__firestoreQuotaExceeded = true;
    }
  }, [firestoreQuotaExceeded]);

  React.useEffect(() => {
    const handleQuotaExceeded = () => {
      setFirestoreQuotaExceeded(true);
    };
    window.addEventListener('firestore-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('firestore-quota-exceeded', handleQuotaExceeded);
    };
  }, []);
  const [loginStep, setLoginStep] = React.useState<'role' | 'phone' | 'code' | 'select'>('role');
  const [loginRole, setLoginRole] = React.useState<'parent' | 'master' | null>(null);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [userInputCode, setUserInputCode] = React.useState('');
  const [tempAthleteData, setTempAthleteData] = React.useState<any>(null); // This will hold the array of athletes
  const [athleteList, setAthleteList] = React.useState<any[]>([]);
  const [showSwitchDropdown, setShowSwitchDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Login form state
  const [loginPhone, setLoginPhone] = React.useState('');

  // Load registered athlete data if available
  const [athleteData, setAthleteData] = React.useState<any>(null);
  const [masterData, setMasterData] = React.useState<any>(null);
  const [invitationsCount, setInvitationsCount] = React.useState(0);
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [lastInvitationId, setLastInvitationId] = React.useState<string | null>(localStorage.getItem('lastInvitationId'));
  const [newInvitationToast, setNewInvitationToast] = React.useState<string | null>(null);
  const [showRegSuccess, setShowRegSuccess] = React.useState(false);

  const [selectedAthleteForReview, setSelectedAthleteForReviewState] = React.useState<any>(() => {
    const saved = localStorage.getItem('selectedAthleteForReview');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });

  const setSelectedAthleteForReview = (athlete: any) => {
    setSelectedAthleteForReviewState(athlete);
    if (athlete) {
      localStorage.setItem('selectedAthleteForReview', JSON.stringify(athlete));
    } else {
      localStorage.removeItem('selectedAthleteForReview');
    }
  };

  const [reviewAthleteInvitations, setReviewAthleteInvitations] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!selectedAthleteForReview?.id) {
      setReviewAthleteInvitations([]);
      return;
    }

    const q = query(
      collection(db, 'invitations'),
      where('studentId', '==', selectedAthleteForReview.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviewAthleteInvitations(docs);
    }, (err) => {
      console.error("Error loading review athlete invitations:", err);
    });

    return unsubscribe;
  }, [selectedAthleteForReview?.id]);

  const [reviewSubTab, setReviewSubTab] = React.useState<'dossier' | 'balance' | 'parameters'>('parameters');

  const [showReportModal, setShowReportModal] = React.useState(false);
  const [notificationFilter, setNotificationFilter] = React.useState<'all' | 'invitations' | 'achievements' | 'updates' | 'tasks'>('all');
  const [masterRegistrations, setMasterRegistrations] = React.useState<any[]>([]);
  const [allInvitations, setAllInvitations] = React.useState<any[]>([]);

  // Weekly Goal and Reward Customizable States
  const [weeklyGoalType, setWeeklyGoalType] = React.useState<'xp' | 'sessions' | 'badges'>(() => {
    return (localStorage.getItem('juno_weeklyGoalType') as any) || 'xp';
  });
  const [weeklyGoalValue, setWeeklyGoalValue] = React.useState<number>(() => {
    const val = localStorage.getItem('juno_weeklyGoalValue');
    return val ? Number(val) : 150;
  });
  const [weeklyRewardPrize, setWeeklyRewardPrize] = React.useState<string>(() => {
    return localStorage.getItem('juno_weeklyRewardPrize') || '14 JUNO Tokens';
  });
  const [weeklyXpProgress, setWeeklyXpProgress] = React.useState<number>(() => {
    const val = localStorage.getItem('juno_weeklyXpProgress');
    return val ? Number(val) : 105;
  });
  const [weeklySessionsProgress, setWeeklySessionsProgress] = React.useState<number>(() => {
    const val = localStorage.getItem('juno_weeklySessionsProgress');
    return val ? Number(val) : 1;
  });
  const [isChangingReward, setIsChangingReward] = React.useState(false);
  const [rewardClaimed, setRewardClaimed] = React.useState<boolean>(() => {
    return localStorage.getItem('juno_rewardClaimed') === 'true';
  });
  const [showClaimAnimation, setShowClaimAnimation] = React.useState(false);

  const isDemo = !athleteData && !masterData;
  const isMaster = !!masterData;
  const isRestricted = !isMaster && athleteData?.status === 'declined';

  const [activeHomeTaskModalEvent, setActiveHomeTaskModalEvent] = React.useState<any>(null);

  React.useEffect(() => {
    if (isRestricted && activeTab !== 'dashboard' && activeTab !== 'notifications') {
      setActiveTab('dashboard');
    }
  }, [isRestricted, activeTab]);

  React.useEffect(() => {
    const dId = localStorage.getItem('selectedEventIdInPortal');
    if (dId) {
      setSelectedEventId(dId);
      setActiveTabState('event_details');
    }
  }, []);

  const allRawProfileNotifications = React.useMemo(() => {
    const list: any[] = [];
    const currentLang = lang || 'RU';

    if (isMaster) {
      masterRegistrations.forEach((reg) => {
        const isPending = !reg.status || reg.status === 'pending';
        const regDate = reg?.createdAt 
          ? (reg.createdAt.seconds 
              ? new Date(reg.createdAt.seconds * 1000) 
              : new Date(reg.createdAt))
          : new Date();

        const title = isPending 
          ? (currentLang === 'RU' ? 'Новая регистрация атлета' : currentLang === 'GE' ? 'ახალი ათლეტის რეგისტრაცია' : 'New Athlete Registration')
          : reg.status === 'approved' 
            ? (currentLang === 'RU' ? 'Профиль подтвержден' : currentLang === 'GE' ? 'პროფილი დადასტურდა' : 'Profile Approved')
            : (currentLang === 'RU' ? 'Регистрация отклонена' : currentLang === 'GE' ? 'რეგისტრაცია უარყოფილია' : 'Registration Declined');

        const message = isPending 
          ? (currentLang === 'RU' 
              ? `Атлет ${reg.studentName} ожидает проверки профиля.` 
              : `Athlete ${reg.studentName} is pending profile validation.`)
          : reg.status === 'approved'
            ? (currentLang === 'RU' 
                ? `Профиль атлета ${reg.studentName} успешно подтвержден.` 
                : `Athlete profile ${reg.studentName} successfully validated.`)
            : (currentLang === 'RU' 
                ? `Профиль атлета ${reg.studentName} был отклонен.` 
                : `Athlete profile ${reg.studentName} was declined.`);

        list.push({
          id: `master_reg_notif_${reg.id}`,
          type: 'registration',
          category: 'updates',
          title,
          message,
          createdAt: regDate.toISOString(),
          unread: isPending,
          icon: UserPlus,
          color: isPending ? 'sunset' : reg.status === 'approved' ? 'teal' : 'navy',
          actionTab: 'master_registrations'
        });

        const studentInvitations = allInvitations.filter((inv: any) => inv.studentId === reg.id && inv.visitConfirmed === true);
        const actualConfirmedVisits = studentInvitations.length;
        const usedPaid = Math.max(Number(reg.usedPaidClasses || 0), actualConfirmedVisits);

        const isPendingReport = (reg.reportTaskPending === true || (
          usedPaid >= 10
        )) && reg.reportTaskDeleted !== true;

        if (isPendingReport) {
          list.push({
            id: `report_task_notif_${reg.id}`,
            type: 'report_task',
            category: 'tasks',
            title: currentLang === 'RU' ? 'Задание: Написать отзыв' : 'Task: Provide Feedback',
            message: currentLang === 'RU' 
              ? `Премиум-атлет ${reg.studentName} посетил ${usedPaid} занятий из ${reg.totalPaidClasses || 12}. Требуется ваш отзыв.` 
              : `Premium athlete ${reg.studentName} attended ${usedPaid}/${reg.totalPaidClasses || 12} classes. Progress report required.`,
            createdAt: new Date().toISOString(),
            unread: true,
            icon: FileText,
            color: 'sunset',
            actionTab: 'master_registrations',
            onClick: () => {
              setSelectedAthleteForReview(reg);
              setReviewSubTab('dossier');
              setActiveTab('master_registrations');
              localStorage.setItem(`openFeedbackForm_${reg.id}`, 'true');
            }
          });
        }
      });

      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const athlete = athleteData || MOCK_STUDENT;

    if (athlete?.status === 'declined') {
      list.push({
        id: 'notif_declined_restricted',
        type: 'registration',
        category: 'updates',
        title: currentLang === 'RU' ? 'Доступ ограничен' : currentLang === 'GE' ? 'წვდომა შეზღუდულია' : 'Account Restricted',
        message: "We failed to contact you. As our process requires registration request validation, your account is restricted. You can get access to all the app features after validation. Pls contact via +995 551 53 02 72.",
        createdAt: new Date().toISOString(),
        unread: true,
        icon: X,
        color: 'sunset',
        actionTab: 'dashboard'
      });
    }

    // 1. Start of profile registration
    const regDate = athlete?.createdAt 
      ? (athlete.createdAt.seconds 
          ? new Date(athlete.createdAt.seconds * 1000) 
          : new Date(athlete.createdAt))
      : new Date('2026-05-15T12:00:00Z');

    list.push({
      id: 'notif_reg',
      type: 'registration',
      category: 'updates',
      title: currentLang === 'RU' ? 'Профиль зарегистрирован' : currentLang === 'GE' ? 'პროფილი დარეგისტრირდა' : 'Profile Registered',
      message: currentLang === 'RU' 
        ? `Добро пожаловать, ${athlete.studentName || 'Лука'}! Ваш спортивный паспорт Juno активирован. Посещайте тренировки и получайте XP.`
        : currentLang === 'GE'
        ? `მოგესალმებით, ${athlete.studentName || 'ლუკა'}! თქვენი Juno სპორტული პასპორტი გააქტიურებულია.`
        : `Welcome, ${athlete.studentName || 'Luka'}! Your Juno sport passport is officially active. Progress in drills, attend sessions, and earn XP.`,
      createdAt: regDate.toISOString(),
      unread: false,
      icon: CheckCircle2,
      color: 'teal',
      actionTab: 'profile'
    });

    // 2. Events/Invitations
    if (invitations && invitations.length > 0) {
      invitations.forEach((inv, index) => {
        const isPending = inv.status === 'pending';
        const eventDateStr = new Date(inv.date).toLocaleDateString(currentLang === 'RU' ? 'ru-RU' : 'en-US', {
          month: 'short',
          day: 'numeric'
        });

        list.push({
          id: `notif_inv_${inv.invitationId || inv.id}`,
          type: 'invitation',
          category: 'invitations',
          title: currentLang === 'RU' ? 'Приглашение на тренировку' : currentLang === 'GE' ? 'მოწვევა ვარჯიშზე' : 'Training Invitation',
          message: currentLang === 'RU'
            ? `Вы приглашены на занятие "${inv.name || 'Холистическая тренировка'}" (${eventDateStr} в ${inv.startTime || '16:00'}). Статус: ${isPending ? 'Ожидает решения' : 'Принято'}.`
            : currentLang === 'GE'
            ? `მოწვეული ხართ ვარჯიშზე "${inv.name || 'ვარჯიში'}" (${eventDateStr} - ${inv.startTime || '16:00'}). სტატუსი: ${isPending ? 'ელოდება პასუხს' : 'მიღებულია'}.`
            : `You are invited to "${inv.name || 'Holistic Session'}" (${eventDateStr} at ${inv.startTime || '16:00'}). Status: ${isPending ? 'Action Required' : 'Accepted'}.`,
          createdAt: new Date(inv.date).toISOString(),
          unread: isPending,
          icon: isPending ? Mail : CheckCircle2,
          color: isPending ? 'sunset' : 'teal',
          actionTab: 'schedule'
        });

        // 5. Training Updates (Rescheduling) - if the training is in the future, let's create a "rescheduled" announcement notification
        if (index === 0) {
          list.push({
            id: `notif_resched_${inv.id}`,
            type: 'reschedule',
            category: 'updates',
            title: currentLang === 'RU' ? 'Перенос времени занятия' : currentLang === 'GE' ? 'ვარჯიშის დროის ცვლილება' : 'Session Schedule Update',
            message: currentLang === 'RU'
              ? `Внимание! Тренировка "${inv.name}" перенесена на ${inv.startTime || '16:00'} (Стадион: ${LOCATIONS.find(l => l.id === inv.location)?.nameRU || inv.location}). Пожалуйста, подтвердите присутствие.`
              : currentLang === 'GE'
              ? `ყურადღება! ვარჯიში "${inv.name}" გადატანილ იქნა ${inv.startTime || '16:00'}-ზე. მდებარეობა: ${LOCATIONS.find(l => l.id === inv.location)?.nameGE || inv.location}.`
              : `Schedule updated: "${inv.name}" is set to ${inv.startTime || '16:00'} at ${LOCATIONS.find(l => l.id === inv.location)?.name || inv.location}. Please verify your availability.`,
            createdAt: new Date(new Date(inv.date).getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day before
            unread: true,
            icon: Clock,
            color: 'sunset',
            actionTab: 'schedule'
          });
        }
      });
    } else if (isDemo) {
      // Demo mode: standard mock rescheduling & invitation
      list.push({
        id: 'notif_demo_inv_1',
        type: 'invitation',
        category: 'invitations',
        title: currentLang === 'RU' ? 'Приглашение на товарищеский матч' : currentLang === 'GE' ? 'მოწვევა ამხანაგურ მატჩზე' : 'Friendly Match Invitation',
        message: currentLang === 'RU'
          ? 'Вы приглашены на субботний товарищеский матч и демонстрацию навыков на нашей центральной арене.'
          : currentLang === 'GE'
          ? 'მოწვეული ხართ შაბათის ამხანაგურ მატჩზე და უნარების ჩვენებაზე.'
          : 'You are invited to join Saturday’s friendly match and skill showcase at our Main Arena Hub.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        unread: true,
        icon: Mail,
        color: 'sunset',
        actionTab: 'schedule'
      });

      list.push({
        id: 'notif_demo_resched_1',
        type: 'reschedule',
        category: 'updates',
        title: currentLang === 'RU' ? 'Изменение в расписании' : currentLang === 'GE' ? 'განრიგის ცვლილება' : 'Schedule Updated',
        message: currentLang === 'RU'
          ? 'Тренировка в Парке Героев перенесена с 15:00 на 16:30 ради более комфортных погодных условий.'
          : currentLang === 'GE'
          ? 'ვარჯიში გმირთა პარკში გადაიტანეს 15:00-დან 16:30-ზე უკეთესი ამინდის პირობების გამო.'
          : 'Training session at Heroes Park has been rescheduled from 15:00 to 16:30 for highly optimized playing conditions.',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
        unread: true,
        icon: Clock,
        color: 'sunset',
        actionTab: 'schedule'
      });

      list.push({
        id: 'notif_demo_task_1',
        type: 'hometask',
        category: 'tasks',
        title: currentLang === 'RU' ? 'Домашнее задание: Контроль мяча' : currentLang === 'GE' ? 'საშინაო დავალება: ბურთის კონტროლი' : 'Homework: Ball Control',
        message: currentLang === 'RU'
          ? 'Тренер назначил домашнее задание: выполните 50 чеканок мяча обеими ногами.'
          : currentLang === 'GE'
          ? 'მწვრთნელმა დაგინიშნათ დავალება: შეასრულეთ 50 ჟონგლირება ორივე ფეხით.'
          : 'Coach recommended a home practice task: perform 50 soccer jugglings using both feet.',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
        unread: true,
        icon: ClipboardList,
        color: 'sunset',
        actionTab: 'schedule'
      });
    }

    // 3. XP received (from confirmations or training milestone) & other notifications
    if (!isDemo && athleteData?.notifications) {
      athleteData.notifications.forEach((n: any) => {
        if (n.id && n.id.startsWith('hometask_')) {
          list.push({
            id: n.id,
            type: 'hometask',
            category: 'tasks',
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            unread: n.unread !== undefined ? n.unread : true,
            icon: ClipboardList,
            color: 'sunset',
            actionTab: 'schedule'
          });
        } else if (n.type === 'xp') {
          list.push({
            id: n.id,
            type: 'xp',
            category: 'achievements',
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            unread: false,
            icon: Zap,
            color: 'teal',
            actionTab: 'dashboard'
          });
        } else if (n.type === 'penalty') {
          list.push({
            id: n.id,
            type: 'penalty',
            category: 'updates',
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            unread: n.unread !== undefined ? n.unread : true,
            icon: AlertTriangle,
            color: 'sunset',
            actionTab: 'dashboard'
          });
        } else if (n.type === 'observation') {
          list.push({
            id: n.id,
            type: 'observation',
            category: 'updates',
            title: n.title,
            message: n.message,
            createdAt: n.createdAt,
            unread: n.unread !== undefined ? n.unread : true,
            icon: FileText,
            color: 'teal',
            actionTab: 'dashboard'
          });
        } else {
          // Fallback for any other type
          list.push({
            id: n.id || `notif_other_${Math.random()}`,
            type: n.type || 'other',
            category: n.category || 'updates',
            title: n.title,
            message: n.message,
            createdAt: n.createdAt || new Date().toISOString(),
            unread: n.unread !== undefined ? n.unread : false,
            icon: Bell,
            color: 'navy',
            actionTab: 'dashboard'
          });
        }
      });
    }

    // Classic XP logs
    list.push({
      id: 'notif_xp_initial',
      type: 'xp',
      category: 'achievements',
      title: currentLang === 'RU' ? 'Дисциплина оценена' : currentLang === 'GE' ? 'დისციპლინა შეფასდა' : 'Discipline XP Granted',
      message: currentLang === 'RU'
        ? '+100 XP начислено за вашу высокую посещаемость тренировок на уровне 98%!'
        : currentLang === 'GE'
        ? '+100 XP დაგერიცხათ მაღალი დასწრების მაჩვენებლის გამო (98%)!'
        : '+100 XP added to your sport passport for outstanding training attendance compliance of 98%!',
      createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString(), // 2 days ago
      unread: false,
      icon: Activity,
      color: 'teal',
      actionTab: 'dashboard'
    });

    list.push({
      id: 'notif_xp_session_1',
      type: 'xp',
      category: 'achievements',
      title: currentLang === 'RU' ? 'Бонус за DRILLS' : currentLang === 'GE' ? 'ბონუსი DRILLS' : 'Drills Practice XP',
      message: currentLang === 'RU'
        ? 'Получено +15 XP за успешное выполнение упражнений на дриблинг и контроль мяча дома.'
        : currentLang === 'GE'
        ? 'მიიღეთ +15 XP დრიბლინგისა და ბურთის კონტროლის საშინაო აქტივობის დასრულებისთვის.'
        : 'Earned +15 XP for practicing home dribbling controls and reaction-rate practice routines.',
      createdAt: new Date(Date.now() - 4 * 24 * 3600000).toISOString(),
      unread: false,
      icon: Zap,
      color: 'teal',
      actionTab: 'dashboard'
    });

    // 4. Badges opened / Achievements
    const badges = athlete?.badges || MOCK_STUDENT.badges;
    if (badges && badges.length > 0) {
      badges.forEach((b: any, index) => {
        const title = b.title || b.titleEN || 'Goal Hunter';
        list.push({
          id: `notif_badge_${index}_${title.replace(/\s+/g, '_')}`,
          type: 'badge',
          category: 'achievements',
          title: currentLang === 'RU' ? 'Разблокирован значок!' : currentLang === 'GE' ? 'მიღწევა გახსნილია!' : 'Achievement Badge Unlocked!',
          message: currentLang === 'RU'
            ? `Поздравляем! Ваш спортсмен разблокировал специальный значок "${title}"!`
            : currentLang === 'GE'
            ? `გილოცავთ! თქვენმა სპორტსმენმა გახსნა ნიშანი "${title}"!`
            : `Great job! Your student has unlocked the "${title}" skill badge category!`,
          createdAt: new Date(Date.now() - (index + 1) * 3 * 24 * 3600000).toISOString(),
          unread: false,
          icon: Star,
          color: 'teal',
          actionTab: 'achievements'
        });
      });
    }

    // Sort list by date descending (newest at top)
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [athleteData, invitations, lang, masterRegistrations, isMaster, allInvitations]);

  const profileNotifications = React.useMemo(() => {
    if (notificationFilter === 'all') return allRawProfileNotifications;
    return allRawProfileNotifications.filter(n => n.category === notificationFilter);
  }, [allRawProfileNotifications, notificationFilter]);

  const latestThreeNotifications = React.useMemo(() => {
    return allRawProfileNotifications.slice(0, 3);
  }, [allRawProfileNotifications]);

  const relevantInvitation = React.useMemo(() => {
    if (!invitations || invitations.length === 0) return null;
    
    // Set start of today (local time) to allow today's events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter for upcoming/ongoing events (date is today or in the future)
    const upcoming = invitations.filter(inv => {
      const eventDate = new Date(inv.date);
    });

    if (upcoming.length > 0) {
      // Sort upcoming ascending: closest upcoming event first
      return upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    }

    // If no upcoming event, find the most recent past event
    const past = [...invitations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return past[0];
  }, [invitations]);

  React.useEffect(() => {
    setSelectedAthleteForReview(null);
  }, [activeTab]);

  const currentStudentXp = React.useMemo(() => {
    if (isDemo || !athleteData) {
      return MOCK_STUDENT.xp + 50;
    }
    if (athleteData.studentName?.toLowerCase().includes('luka')) {
      return 1300;
    }
    return athleteData.xp !== undefined ? Number(athleteData.xp) : 0;
  }, [athleteData, isDemo]);

  const levelInfo = React.useMemo(() => {
    return getStudentLevelInfo(currentStudentXp);
  }, [currentStudentXp]);

  const studentRewards = React.useMemo(() => {
    const currentLang = lang || 'EN';
    
    const baseBadges = [
      { id: 'iron_athlete', title: currentLang === 'RU' ? 'Железный атлет' : currentLang === 'GE' ? 'რკინის ათლეტი' : 'Iron Athlete', desc: currentLang === 'RU' ? '5 тренировок без пропусков' : currentLang === 'GE' ? '5 ვარჯიში გაცდენის გარეშე' : '5 sessions without miss', icon: Activity, date: 'Jun 2026' },
      { id: 'sniper', title: currentLang === 'RU' ? 'Снайпер' : currentLang === 'GE' ? 'სნაიპერი' : 'Sniper', desc: currentLang === 'RU' ? '10 голов в упражнениях' : currentLang === 'GE' ? '10 გოლი სავარჯიშოებში' : '10 goals in drills', icon: Zap, date: 'Jun 2026' },
      { id: 'captain', title: currentLang === 'RU' ? 'Капитан' : currentLang === 'GE' ? 'კაპიტანი' : 'Captain', desc: currentLang === 'RU' ? 'Лидерство в команде' : currentLang === 'GE' ? 'გუნდის ლიდერობა' : 'Team leadership', icon: Star, date: 'Jul 2026' },
    ];

    const dbBadges = ((athleteData || MOCK_STUDENT)?.badges || []).map((b: any, index: number) => {
      const bTitle = (b.titleRU || b.titleEN || b.title || '').toLowerCase().trim();
      const bId = (b.id || bTitle).trim();
      const isFirstStep = bId === 'first_step' || bId === 'first_training' || bTitle.includes('first step') || bTitle.includes('первый шаг') || bTitle.includes('первая тренировка') || bTitle.includes('პირველი ნაბიჯი') || bTitle.includes('ilk adım') || bTitle.includes('first training');

      if (isFirstStep) {
        return {
          id: 'first_step',
          title: currentLang === 'RU' ? 'Первый шаг' : currentLang === 'GE' ? 'პირველი ნაბიჯი' : 'First Step',
          desc: currentLang === 'RU' ? 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.' : currentLang === 'GE' ? 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.' : 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
          icon: Dribbble,
          date: b.date || 'Jun 2026'
        };
      }

      let IconComponent = Target;
      if (b.icon === 'Dribbble' || b.icon === 'DribbbleIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('dribble'))) {
        IconComponent = Dribbble;
      } else if (b.icon === 'Users' || b.icon === 'UsersIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('user'))) {
        IconComponent = Users;
      } else if (b.icon === 'Clock' || b.icon === 'ClockIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('clock'))) {
        IconComponent = Clock;
      } else if (b.icon === 'Activity' || b.icon === 'ActivityIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('activity'))) {
        IconComponent = Activity;
      } else if (b.icon === 'Zap' || b.icon === 'ZapIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('zap'))) {
        IconComponent = Zap;
      } else if (b.icon === 'Star' || b.icon === 'StarIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('star'))) {
        IconComponent = Star;
      } else if (b.icon === 'Trophy' || b.icon === 'TrophyIcon' || (typeof b.icon === 'string' && b.icon.toLowerCase().includes('trophy'))) {
        IconComponent = Trophy;
      }
      return {
        id: b.id || `db_badge_${index}`,
        title: currentLang === 'RU' ? (b.titleRU || b.title) : currentLang === 'GE' ? (b.titleGE || b.title) : (b.titleEN || b.title),
        desc: currentLang === 'RU' ? (b.descRU || b.desc) : currentLang === 'GE' ? (b.descGE || b.desc) : (b.descEN || b.desc),
        icon: IconComponent,
        date: b.date || 'Jun 2026'
      };
    });

    if (isDemo && dbBadges.length === 0) {
      dbBadges.push({
        id: 'first_step',
        title: currentLang === 'RU' ? 'Первый шаг' : currentLang === 'GE' ? 'პირველი ნაბიჯი' : 'First Step',
        desc: currentLang === 'RU' ? 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.' : currentLang === 'GE' ? 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.' : 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
        icon: Target,
        date: 'Jun 2026'
      });
    }

    const map = new Map<string, any>();
    [...baseBadges, ...dbBadges].forEach(b => {
      const key = (b.id || b.title).toString().toLowerCase();
      map.set(key, b);
    });
    return Array.from(map.values());
  }, [athleteData, isDemo, lang]);

  const currentWeeklyProgress = React.useMemo(() => {
    if (weeklyGoalType === 'xp') {
      return weeklyXpProgress;
    } else if (weeklyGoalType === 'sessions') {
      return weeklySessionsProgress;
    } else if (weeklyGoalType === 'badges') {
      return studentRewards.length;
    }
    return 0;
  }, [weeklyGoalType, weeklyXpProgress, weeklySessionsProgress, studentRewards]);

  const isGoalAchieved = currentWeeklyProgress >= weeklyGoalValue;
  
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSwitchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    const storedAthlete = localStorage.getItem('athleteAccount');
    const storedMaster = localStorage.getItem('masterAccount');
    const justRegistered = localStorage.getItem('justRegistered');

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'true') {
      setLoginStep('role');
      setShowLogin(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (justRegistered === 'true') {
      setShowRegSuccess(true);
      localStorage.removeItem('justRegistered');
      setTimeout(() => setShowRegSuccess(false), 8000);
    }

    if (storedMaster) {
      setMasterData(JSON.parse(storedMaster));
    } else if (storedAthlete) {
      const data = JSON.parse(storedAthlete);
      setAthleteData(data);
      
      // Also fetch all athletes for this phone to enable switching
      if (data.parentPhone) {
        const phone = data.parentPhone.replace('+995', '').replace(/\s/g, '');
        const q = query(
          collection(db, 'registrations'),
          where('parentPhone', '==', `+995${phone}`)
        );
        getDocs(q).then(snapshot => {
          if (!snapshot.empty) {
            setAthleteList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }
        });
      }
    }
  }, []);

  // Invitation listeners for student/parent
  React.useEffect(() => {
    if (!athleteData?.parentPhone || isMaster) return;

    const q = query(
      collection(db, 'invitations'),
      where('studentId', '==', athleteData.id)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const pendingCount = snapshot.docs.filter(d => d.data().status === 'pending').length;
      setInvitationsCount(pendingCount);

      const invts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      const eventDetails: any[] = [];
      for (const inv of invts) {
        const qEvent = query(collection(db, 'events'), where('__name__', '==', inv.eventId));
        const eventSnap = await getDocs(qEvent);
        if (!eventSnap.empty) {
          eventDetails.push({
            ...eventSnap.docs[0].data(),
            id: eventSnap.docs[0].id,
            invitationId: inv.id,
            status: inv.status,
            visitConfirmed: inv.visitConfirmed,
            attended: inv.attended
          });
        }
      }
      setInvitations(eventDetails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));

      if (pendingCount > 0) {
        const latestDoc = snapshot.docs.find(d => d.data().status === 'pending');
        if (latestDoc) {
          const latestId = latestDoc.id;
          if (latestId !== lastInvitationId) {
            setLastInvitationId(latestId);
            localStorage.setItem('lastInvitationId', latestId);
            setNewInvitationToast(lang === 'RU' ? 'У вас новое приглашение на занятие!' : 'You have a new class invitation!');
            setTimeout(() => setNewInvitationToast(null), 10000);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [athleteData, isMaster, lastInvitationId]);

  // Set demo invitations if offline / no registered athlete
  React.useEffect(() => {
    if ((!athleteData || !athleteData.parentPhone) && !isMaster) {
      setInvitations(getDummyEvents(lang));
    }
  }, [athleteData, isMaster, lang]);

  // Real-time student profile sync for XP & Level updates
  const athleteDataRef = React.useRef(athleteData);
  const syncedRegistrationsRef = React.useRef<Set<string>>(new Set());
  React.useEffect(() => {
    athleteDataRef.current = athleteData;
  }, [athleteData]);

  React.useEffect(() => {
    if (!athleteData?.id || isMaster) return;

    const unsubProfile = onSnapshot(doc(db, 'registrations', athleteData.id), (snapshot) => {
      if (snapshot.exists()) {
        const updatedData = { id: snapshot.id, ...snapshot.data() };
        // Check if anything actually changed to prevent loops
        if (JSON.stringify(updatedData) !== JSON.stringify(athleteDataRef.current)) {
          setAthleteData(updatedData);
          localStorage.setItem('athleteAccount', JSON.stringify(updatedData));
        }
      }
    }, (error: any) => {
      console.warn("Error syncing student profile (likely quota or network):", error);
      if (error?.code === 'resource-exhausted' || error?.message?.toLowerCase().includes('quota')) {
        setFirestoreQuotaExceeded(true);
      }
    });

    return () => unsubProfile();
  }, [athleteData?.id, isMaster]);

  // Set initial tab if master
  React.useEffect(() => {
    if (isMaster && activeTab === 'dashboard') {
      setActiveTab('master_dashboard');
    }
  }, [isMaster, activeTab]);

  // Real-time synchronization of all registrations for the Coach (Master)
  React.useEffect(() => {
    if (!isMaster) return;

    const q = query(
      collection(db, 'registrations'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setMasterRegistrations(list);
    }, (error: any) => {
      console.error("Error setting up real-time registrations sync for master:", error);
      if (error?.code === 'resource-exhausted' || error?.message?.toLowerCase().includes('quota')) {
        setFirestoreQuotaExceeded(true);
      }
    });

    return () => unsubscribe();
  }, [isMaster]);

  // Real-time synchronization of all invitations for the Coach (Master)
  React.useEffect(() => {
    if (!isMaster) return;

    const q = query(
      collection(db, 'invitations')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setAllInvitations(list);
    }, (error: any) => {
      console.error("Error setting up real-time invitations sync for master:", error);
      if (error?.code === 'resource-exhausted' || error?.message?.toLowerCase().includes('quota')) {
        setFirestoreQuotaExceeded(true);
      }
    });

    return () => unsubscribe();
  }, [isMaster]);

  // Self-healing database sync for usedPaidClasses and reportTaskPending
  React.useEffect(() => {
    if (!isMaster || masterRegistrations.length === 0 || allInvitations.length === 0) return;

    masterRegistrations.forEach(async (reg) => {
      const studentInvitations = allInvitations.filter(inv => inv.studentId === reg.id && inv.visitConfirmed === true);
      const actualConfirmedVisits = studentInvitations.length;
      const expectedUsedPaidClasses = Math.max(0, actualConfirmedVisits - 1);
      
      const needsUsedSync = expectedUsedPaidClasses > Number(reg.usedPaidClasses || 0);
      const needsPendingSync = expectedUsedPaidClasses >= 10 && reg.reportTaskPending !== true && reg.reportTaskDeleted !== true;

      if (needsUsedSync || needsPendingSync) {
        const syncKey = `${reg.id}_${expectedUsedPaidClasses}_pending_${needsPendingSync}`;
        if (syncedRegistrationsRef.current.has(syncKey)) return;
        syncedRegistrationsRef.current.add(syncKey);

        if (needsUsedSync) {
          try {
            const updates: any = {
              usedPaidClasses: expectedUsedPaidClasses
            };
            if (expectedUsedPaidClasses >= 10 && reg.reportTaskPending !== true && reg.reportTaskDeleted !== true) {
              updates.reportTaskPending = true;
            }
            await updateDoc(doc(db, 'registrations', reg.id), updates);
            console.log(`Self-healed registrations doc for ${reg.studentName}:`, updates);
          } catch (err) {
            console.warn(`Error self-healing registration for ${reg.studentName} (likely quota):`, err);
          }
        } else if (needsPendingSync) {
          // Even if usedPaidClasses matches but reportTaskPending is missing
          try {
            await updateDoc(doc(db, 'registrations', reg.id), {
              reportTaskPending: true
            });
            console.log(`Self-healed reportTaskPending for ${reg.studentName}`);
          } catch (err) {
            console.warn(`Error self-healing reportTaskPending for ${reg.studentName} (likely quota):`, err);
          }
        }
      }
    });
  }, [isMaster, masterRegistrations, allInvitations]);

  const handleStartLogin = async (e: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoadingProfile(true);
    setError('');

    const phoneToSearch = (loginPhone || athleteData?.parentPhone?.replace('+995', '') || '').replace(/\s/g, '');
    const fullPhone = `+995${phoneToSearch}`;

    try {
      if (loginRole === 'master') {
        // 1. Check if it's a MASTER
        const masterQuery = query(
          collection(db, 'masters'),
          where('phone', '==', fullPhone)
        );
        const masterSnapshot = await getDocs(masterQuery);

        if (!masterSnapshot.empty) {
          const master = { id: masterSnapshot.docs[0].id, ...masterSnapshot.docs[0].data() };
          // Masters also get a code for security
          setTempAthleteData(null); 
          setAthleteList([]);
          setMasterData(master); 
          
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          setVerificationCode(code);
          setLoginStep('code');
          setLoadingProfile(false);
          return;
        } else {
          setError(lang === 'RU' ? 'Профиль мастера не найден' : 'Master profile not found');
        }
      } else {
        // 2. Check registrations (Parent role)
        const q = query(
          collection(db, 'registrations'),
          where('parentPhone', '==', fullPhone)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const athletes = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          setAthleteList(athletes);
          setMasterData(null); 
          
          if (showLogin && loginStep === 'select') {
            setLoadingProfile(false);
            return;
          }

          const code = Math.floor(1000 + Math.random() * 9000).toString();
          setVerificationCode(code);
          setLoginStep('code');
        } else {
          setError(t.loginError || 'Profile not found. Please check your details.');
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      handleFirestoreError(err, OperationType.LIST, 'registrations');
      setError('An error occurred. Please try again.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInputCode === verificationCode) {
      if (masterData) {
        // Log in as master
        localStorage.setItem('masterAccount', JSON.stringify(masterData));
        localStorage.removeItem('athleteAccount');
        localStorage.removeItem('selectedAthleteForReview');
        localStorage.removeItem('activeTab');
        setAthleteData(null);
        setShowLogin(false);
        setLoginStep('phone');
        setVerificationCode('');
        setUserInputCode('');
      } else if (athleteList.length === 1) {
        const singleAthlete = athleteList[0];
        setAthleteData(singleAthlete);
        localStorage.setItem('athleteAccount', JSON.stringify(singleAthlete));
        localStorage.removeItem('masterAccount');
        localStorage.removeItem('selectedAthleteForReview');
        localStorage.removeItem('activeTab');
        setMasterData(null);
        setShowLogin(false);
        setLoginStep('phone');
        setVerificationCode('');
        setUserInputCode('');
      } else {
        setLoginStep('select');
      }
    } else {
      setError(t.loginOTPError || 'Invalid verification code');
    }
  };

  const handleSelectAthlete = (athlete: any) => {
    setAthleteData(athlete);
    localStorage.setItem('athleteAccount', JSON.stringify(athlete));
    localStorage.removeItem('selectedAthleteForReview');
    localStorage.removeItem('activeTab');
    setShowLogin(false);
    setLoginStep('phone');
    setVerificationCode('');
    setUserInputCode('');
  };

  const handleDeleteNotification = async (notifId: string) => {
    if (notifId.startsWith('report_task_notif_')) {
      const regId = notifId.replace('report_task_notif_', '');
      try {
        await updateDoc(doc(db, 'registrations', regId), {
          reportTaskDeleted: true,
          reportTaskPending: false
        });
      } catch (err) {
        console.error("Error deleting report task notification:", err);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('athleteAccount');
    localStorage.removeItem('masterAccount');
    localStorage.removeItem('lastRegisteredAthlete');
    localStorage.removeItem('justRegistered');
    localStorage.removeItem('selectedAthleteForReview');
    localStorage.removeItem('activeTab');
    signOut(auth);
    window.location.href = '/portal?auth=true';
  };

  const resetLoginStep = () => {
    setShowLogin(false);
    setLoginStep('role');
    setLoginRole(null);
    setError('');
    setUserInputCode('');
    if (!athleteData) {
      setAthleteList([]);
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-brand-cream text-brand-navy flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 font-sans relative overflow-hidden">
        {/* Background Decor */}
        <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full relative z-10"
        >
          <div className="text-center mb-6 sm:mb-10">
            <Badge color="teal" className="mb-4 sm:mb-6">
              {loginStep === 'role' ? (lang === 'RU' ? 'Выберите роль' : 'Choose Role') : loginStep === 'phone' ? t.loginTitle : loginStep === 'code' ? t.loginOTPTitle : t.loginSelectTitle}
            </Badge>
            <p className="text-brand-navy/40 font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] italic text-[10px] sm:text-xs text-balance px-2 max-w-md mx-auto">
              {loginStep === 'role' ? (lang === 'RU' ? 'Доступ к соответствующей панели управления' : 'Access relevant control panel') : loginStep === 'phone' ? t.loginSub : loginStep === 'code' ? t.loginOTPSub : t.loginSelectSub}
            </p>
          </div>

          <Card className="p-4 sm:p-8 md:p-12 glass border-white shadow-3xl rounded-[24px] sm:rounded-[48px] md:rounded-[64px] relative overflow-hidden">
            <button 
              onClick={resetLoginStep}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-brand-navy/10 flex items-center justify-center text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-all z-20"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <AnimatePresence mode="wait">
              {loginStep === 'role' ? (
                <motion.div
                  key="role-step"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  className="space-y-4 sm:space-y-6 pt-2 sm:pt-4"
                >
                  <button 
                    onClick={() => {
                      setLoginRole('parent');
                      setLoginStep('phone');
                    }}
                    className="w-full glass-dark p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] md:rounded-[38px] border border-white/5 hover:bg-brand-teal group transition-all text-left flex items-center gap-4 sm:gap-6"
                  >
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white transition-all shadow-xl shrink-0">
                      <User className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-white group-hover:text-brand-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg md:text-xl font-black uppercase italic text-white leading-none mb-1 sm:mb-2 truncate">{lang === 'RU' ? 'АТЛЕТ' : 'ATHLETE'}</h4>
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-white/30 italic group-hover:text-white/60 tracking-widest truncate">{lang === 'RU' ? 'ЛИЧНЫЙ КАБИНЕТ АТЛЕТА' : 'ATHLETE PORTAL'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all shrink-0" />
                  </button>

                  <div className="relative flex items-center py-2 sm:py-4">
                    <div className="flex-1 border-t border-brand-navy/5"></div>
                    <span className="px-4 text-[9px] font-black text-brand-navy/20 italic uppercase tracking-widest">or</span>
                    <div className="flex-1 border-t border-brand-navy/5"></div>
                  </div>

                  <button 
                    onClick={() => {
                      setLoginRole('master');
                      setLoginStep('phone');
                    }}
                    className="w-full glass-dark p-4 sm:p-6 md:p-8 rounded-[20px] sm:rounded-[32px] md:rounded-[38px] border border-white/5 hover:bg-brand-sunset group transition-all text-left flex items-center gap-4 sm:gap-6"
                  >
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white transition-all shadow-xl shrink-0">
                      <Zap className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-white group-hover:text-brand-sunset" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg md:text-xl font-black uppercase italic text-white leading-none mb-1 sm:mb-2 truncate">{lang === 'RU' ? 'МАСТЕР' : 'MASTER'}</h4>
                      <p className="text-[9px] sm:text-[10px] uppercase font-bold text-white/30 italic group-hover:text-white/60 tracking-widest truncate">{lang === 'RU' ? 'ПАНЕЛЬ УПРАВЛЕНИЯ' : 'CONTROL PANEL'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all shrink-0" />
                  </button>
                  
                  <button 
                    type="button"
                    onClick={resetLoginStep}
                    className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy/30 hover:text-brand-teal transition-colors py-2 sm:py-4 mt-2 sm:mt-4"
                  >
                    {lang === 'RU' ? 'ОТМЕНА' : 'CANCEL'}
                  </button>
                </motion.div>
              ) : loginStep === 'phone' ? (
                <motion.form 
                  key="phone-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleStartLogin} 
                  className="space-y-6 sm:space-y-10"
                >
                  <div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0 mb-3 px-2">
                       <label className="text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 italic">{t.loginParentPhone}</label>
                       <button 
                        type="button"
                        onClick={() => setLoginStep('role')}
                        className="text-[9px] font-black text-brand-teal uppercase italic border-b border-brand-teal/20 text-left"
                       >
                         {lang === 'RU' ? 'Сменить роль' : 'Change Role'}
                       </button>
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20 z-10" />
                      <PatternFormat 
                        format="### ### ###"
                        value={loginPhone}
                        onValueChange={(values) => setLoginPhone(values.value)}
                        className={`w-full h-14 sm:h-18 pl-[115px] pr-6 bg-white/40 border-2 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-lg shadow-sm ${error ? 'border-red-500' : 'border-brand-navy/5'}`} 
                        placeholder="5__ ___ ___"
                        required
                        type="tel"
                        allowEmptyFormatting
                      />
                      <span className="absolute left-14 top-1/2 -translate-y-1/2 font-black text-brand-navy/60 italic text-lg z-10 select-none pointer-events-none">+995</span>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-4 sm:p-6 bg-red-50 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </div>
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      disabled={loadingProfile || !loginPhone || loginPhone.length < 9}
                      className="w-full h-14 sm:h-18 md:h-20 !rounded-[28px] bg-brand-sunset hover:bg-brand-sunset/90 text-white font-black italic uppercase tracking-widest transition-all shadow-xl shadow-sunset/15 flex items-center justify-center gap-3 border-none"
                    >
                      {loadingProfile ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Zap className="w-5 h-5 fill-current" />
                          {t.loginBtn}
                        </>
                      )}
                    </Button>
                    
                    <button 
                      type="button"
                      onClick={resetLoginStep}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy/30 hover:text-brand-teal transition-colors py-2"
                    >
                      {lang === 'RU' ? 'ВЕРНУТЬСЯ К ПРЕДПРОСМОТРУ' : 'BACK TO PREVIEW'}
                    </button>
                  </div>
                </motion.form>
              ) : loginStep === 'code' ? (
                <motion.form 
                  key="code-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyCode} 
                  className="space-y-6 sm:space-y-10"
                >
                  <div className="p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] bg-brand-teal/5 border border-brand-teal/10 text-center mb-4 sm:mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-teal">
                      {t.loginOTPSimulated.replace('{code}', verificationCode)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.loginOTPLabel}</label>
                    <div className="relative">
                      <Target className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20 z-10" />
                      <PatternFormat 
                        format="# # # #"
                        value={userInputCode}
                        onValueChange={(values) => {
                          setUserInputCode(values.value);
                          if (error) setError('');
                        }}
                        className={`w-full h-14 sm:h-18 px-14 bg-white/40 border-2 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-[1em] text-2xl sm:text-3xl shadow-sm text-center ${error ? 'border-red-500' : 'border-brand-navy/5'}`} 
                        placeholder="0 0 0 0"
                        required
                        allowEmptyFormatting
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                       initial={{ opacity: 0, y: -10 }}
                       animate={{ opacity: 1, y: 0 }}
                       className="p-4 sm:p-6 bg-red-50 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100 flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <X className="w-3.5 h-3.5" />
                      </div>
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      disabled={userInputCode.length < 4}
                      className="w-full h-14 sm:h-18 md:h-20 !rounded-[28px] bg-brand-sunset hover:bg-brand-sunset/90 text-white font-black italic uppercase tracking-widest transition-all shadow-xl shadow-sunset/15 flex items-center justify-center gap-3 border-none"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      {t.loginOTPBtn}
                    </Button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setLoginStep('phone');
                        setError('');
                        setUserInputCode('');
                      }}
                      className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy/30 hover:text-brand-teal transition-colors py-2"
                    >
                      {t.regPrev}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.div 
                  key="select-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid gap-4">
                    {athleteList.map((athlete, idx) => (
                      <button
                        key={`${athlete.id || 'athlete'}_${idx}`}
                        onClick={() => handleSelectAthlete(athlete)}
                        className="w-full glass-dark p-4 sm:p-6 rounded-[20px] sm:rounded-[28px] border border-white/5 hover:bg-brand-teal group transition-all text-left flex items-center gap-4 sm:gap-6"
                      >
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/20 group-hover:border-white transition-all shadow-xl shrink-0">
                          <img src={athlete.studentProfileImage || MOCK_STUDENT.avatar} alt={athlete.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-lg font-black uppercase italic text-white group-hover:scale-[1.03] transition-transform origin-left truncate">{athlete.studentName}</h4>
                          <p className="text-[9px] sm:text-[10px] uppercase font-bold text-white/30 italic group-hover:text-white/60 truncate">{athlete.studentLocation}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>

                  <button 
                    type="button"
                    onClick={() => setLoginStep('phone')}
                    className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-navy/30 hover:text-brand-teal transition-colors py-4 mt-4"
                  >
                    {lang === 'RU' ? 'ИСПОЛЬЗОВАТЬ ДРУГОЙ НОМЕР' : 'USE DIFFERENT NUMBER'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    );
  }

  const getScheduleLabel = (id: string) => {
    const slots: any = {
      'mon_wed_fri_16': lang === 'RU' ? 'ПН / СР / ПТ — 16:00' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — 16:00' : 'Mon / Wed / Fri — 16:00',
      'mon_wed_fri_18': lang === 'RU' ? 'ПН / СР / ПТ — 18:00' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — 18:00' : 'Mon / Wed / Fri — 18:00',
      'tue_thu_sat_16': lang === 'RU' ? 'ВТ / ЧТ / СБ — 16:00' : lang === 'GE' ? 'სამშ / ხუთშ / შაბ — 16:00' : 'Tue / Thu / Sat — 16:00',
      'tue_thu_sat_18': lang === 'RU' ? 'ВТ / ЧТ / СБ — 18:00' : lang === 'GE' ? 'სამშ / ხუთშ / შაბ — 18:00' : 'Tue / Thu / Sat — 18:00',
      
      'tue_thu_sun_10': lang === 'RU' ? 'ВТ / ЧТ / ВС — 10:00 am' : lang === 'GE' ? 'სამშ / ხუთშ / კვირა — 10:00 am' : 'Tue, Thursday, Sunday - 10:00 am',
      'tue_thu_sun_18': lang === 'RU' ? 'ВТ / ЧТ / ВС — 18:00 pm' : lang === 'GE' ? 'სამშ / ხუთშ / კვირა — 18:00 pm' : 'Tue, Thursday, Sunday - 18:00 pm',
      'mon_wed_fri_10': lang === 'RU' ? 'ПН / СР / ПТ — 10:00 am' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — 10:00 am' : 'Mon, Wednesday, Friday - 10:00 am',
      'mon_wed_fri_18_pm': lang === 'RU' ? 'ПН / СР / ПТ — 18:00 pm' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — 18:00 pm' : 'Mon, Wednesday, Friday - 18:00 pm',
      
      'mon_wed_fri_morning': lang === 'RU' ? 'ПН / СР / ПТ — утро' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — დილა' : 'Mon, Wednesday, Friday - morning',
      'mon_wed_fri_evening': lang === 'RU' ? 'ПН / СР / ПТ — вечер' : lang === 'GE' ? 'ორშ / ოთხშ / პარ — საღამო' : 'Mon, Wednesday, Friday - evening',
      'tue_thu_sun_morning': lang === 'RU' ? 'ВТ / ЧТ / ВС — утро' : lang === 'GE' ? 'სამშ / ხუთშ / კვირა — დილა' : 'Tue, Thursday, Sunday - morning',
      'tue_thu_sun_evening': lang === 'RU' ? 'ВТ / ЧТ / ВС — вечер' : lang === 'GE' ? 'სამშ / ხუთშ / კვირა — საღამო' : 'Tue, Thursday, Sunday - evening',
    };
    return slots[id] || id;
  };

  const getRegDay = (id: string) => {
    if (id?.toLowerCase().startsWith('mon')) {
      return lang === 'RU' ? 'ПН / СР / ПТ' : lang === 'GE' ? 'ორშ / ოთხშ / პარ' : 'MON, WED, FRI';
    }
    if (id?.toLowerCase().startsWith('tue')) {
      return lang === 'RU' ? 'ВТ / ЧТ / ВС' : lang === 'GE' ? 'სამშ / ხუთშ / კვირ' : 'TUE, THU, SUN';
    }
    return lang === 'RU' ? 'СБ' : lang === 'GE' ? 'შაბ' : 'SAT';
  };

  const getRegTime = (id: string) => {
    if (id?.endsWith('10')) return '10:00 am';
    if (id?.endsWith('18') || id?.endsWith('18_pm')) return '18:00 pm';
    if (id?.endsWith('16')) return '16:00';
    if (id?.endsWith('morning')) return lang === 'RU' ? 'утро' : lang === 'GE' ? 'დილა' : 'morning';
    if (id?.endsWith('evening')) return lang === 'RU' ? 'вечер' : lang === 'GE' ? 'საღამო' : 'evening';
    return '17:00';
  };

  const getFullLocation = (id: string) => {
    const locs: any = {
      'airport_runway': t.locAirport,
      'metro_mall': t.locMetroMall,
      'agmashenebeli': t.locAgmashenebeli,
      'pirosmani_5': t.locPirosmani5,
      'kaczynski_5': t.locKaczynski5,
      'batumi_boulevard': t.locBatumiBoulevard,
      'heroes_park': t.locHeroesPark,
    };
    return locs[id] || id;
  };

  const menuItems = isMaster ? [
    { id: 'master_dashboard', icon: LayoutGrid, label: t.navDash },
    { id: 'master_schedule', icon: Clock, label: t.masterMenuSchedule },
    { id: 'master_attendance', icon: CheckCircle2, label: t.masterMenuAttendance },
    { id: 'master_registrations', icon: Users, label: t.masterMenuRegistrations },
    { id: 'master_exercises', icon: ClipboardList, label: lang === 'RU' ? 'Упражнения' : 'Exercises' },
  ] : [
    { id: 'dashboard', icon: LayoutGrid, label: t.navDash },
    { 
      id: 'schedule', 
      icon: Clock, 
      label: t.navSchedule,
      badge: invitationsCount > 0 ? invitationsCount : null,
      disabled: isRestricted
    },
    { id: 'performance', icon: BarChart3, label: t.navPerformance, disabled: isRestricted },
    { id: 'achievements', icon: Trophy, label: t.navAchievements, disabled: isRestricted },
    { id: 'profile', icon: Users, label: t.navProfile, disabled: isRestricted },
  ];

  const studentName = isMaster ? masterData.fullName : (athleteData?.studentName || (lang === 'RU' ? MOCK_STUDENT.nameRU : lang === 'GE' ? MOCK_STUDENT.nameGE : MOCK_STUDENT.name));
  const studentAvatar = isMaster ? (masterData.avatar || MOCK_STUDENT.avatar) : (athleteData?.studentProfileImage || MOCK_STUDENT.avatar);
  const studentLocation = isMaster ? (masterData.specialization || 'Head Coach') : (athleteData?.studentLocation || 'Hero Park Batumi');

  return (
    <div className="min-h-screen bg-brand-cream text-brand-navy flex font-sans overflow-x-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-brand-navy/5 z-[100] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-teal">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-black italic uppercase tracking-tighter text-lg leading-none">Sport Park Juno</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-12 h-12 rounded-xl bg-brand-navy/10 flex items-center justify-center text-brand-navy"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 bg-brand-cream z-[90] pt-28 px-6 flex flex-col"
          >
            <div className="space-y-3 mb-auto overflow-y-auto max-h-[calc(100vh-210px)] pr-1 no-scrollbar">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    if (item.disabled) return;
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full h-18 rounded-3xl flex items-center gap-4 px-8 transition-all font-black uppercase italic tracking-widest text-xs ${
                    item.disabled
                    ? 'opacity-30 cursor-not-allowed filter grayscale pointer-events-none'
                    : activeTab === item.id 
                    ? 'bg-brand-navy text-white shadow-2xl' 
                    : 'bg-white/50 border border-brand-navy/5 text-brand-navy/40 hover:bg-white/80'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.disabled ? 'text-brand-navy/10' : activeTab === item.id ? 'text-brand-teal' : 'text-brand-navy/20'}`} />
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {item.disabled && <Lock className="w-3.5 h-3.5 text-brand-navy/30" />}
                  </span>
                  {activeTab === item.id && !item.disabled && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>

            <div className="pb-10 pt-6 border-t border-brand-navy/5 space-y-3">
               <button
                  onClick={onBack}
                  className="w-full h-18 rounded-3xl flex items-center gap-4 px-8 bg-brand-teal/10 text-brand-teal font-black uppercase italic tracking-widest text-[10px] border border-brand-teal/20 hover:bg-brand-teal/20 transition-all cursor-pointer"
               >
                  <Home className="w-5 h-5 text-brand-teal shrink-0" />
                  {lang === 'RU' ? 'Вернуться на главную' : lang === 'GE' ? 'მთავარზე დაბრუნება' : lang === 'TR' ? 'Ana Sayfaya Dön' : 'Back to Website'}
               </button>
               {isDemo ? (
                  <button
                     onClick={() => { setIsMobileMenuOpen(false); setLoginStep('role'); setShowLogin(true); }}
                     className="w-full h-18 rounded-3xl flex items-center justify-center gap-4 px-8 bg-brand-sunset text-white font-black uppercase italic tracking-widest text-xs shadow-lg shadow-sunset/15 hover:bg-brand-sunset/90 transition-all cursor-pointer"
                  >
                     <User className="w-5 h-5 fill-current text-white shrink-0" />
                     <span>{lang === 'RU' ? 'Авторизоваться' : (lang === 'GE' ? 'ავტორიზაცია' : 'Authorize')}</span>
                  </button>
               ) : (
                  <button
                     onClick={() => { setIsMobileMenuOpen(false); setActiveTab('account'); }}
                     className="w-full p-4 rounded-3xl flex items-center gap-4 bg-brand-navy/5 border border-brand-navy/10 hover:bg-brand-navy/10 transition-all text-left cursor-pointer"
                  >
                     <div className="w-12 h-12 rounded-2xl overflow-hidden bg-brand-teal flex items-center justify-center shrink-0 shadow-lg border border-brand-navy/5">
                        <img src={studentAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest text-brand-navy truncate">{studentName}</p>
                        <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-brand-teal italic mt-0.5">
                           <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                           {lang === 'RU' ? 'Авторизован' : (lang === 'GE' ? 'ავტორიზებული' : 'Authorized')}
                        </span>
                     </div>
                     <ChevronRight className="w-5 h-5 text-brand-navy/30 shrink-0" />
                  </button>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-80 flex-col bg-brand-navy border-r border-white/5 p-10 fixed top-0 bottom-0 left-0 z-50 overflow-y-auto shrink-0">
        <div className="flex items-center gap-3 mb-16 px-4">
          <div className="w-12 h-12 bg-brand-teal rounded-[18px] flex items-center justify-center neon-glow-teal rotate-12 shadow-teal">
            <Activity className="text-white w-7 h-7" />
          </div>
          <span className="font-display font-black text-2xl uppercase italic text-white tracking-tighter">
            JUNO <span className="text-brand-teal">APP</span>
          </span>
        </div>

        <nav className="flex-1 space-y-4">
          {menuItems.map((item) => (
            <NavItem 
              key={item.id} 
              icon={item.icon} 
              label={item.label} 
              active={activeTab === item.id} 
              onClick={() => {
                if (item.disabled) return;
                setActiveTab(item.id);
              }}
              badge={item.badge}
              disabled={item.disabled}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <NavItem 
            icon={Home} 
            label={lang === 'RU' ? 'Вернуться на главную' : lang === 'GE' ? 'მთავარზე დაბრუნება' : lang === 'TR' ? 'Ana Sayfaya Dön' : 'Back to Website'} 
            onClick={onBack}
          />
          
          {isDemo ? (
            <button
              onClick={() => { setLoginStep('role'); setShowLogin(true); }}
              className="w-full h-16 rounded-[28px] flex items-center justify-center gap-4 bg-brand-sunset hover:bg-brand-sunset/90 transition-all text-[11px] font-black uppercase tracking-[0.15em] italic text-white cursor-pointer shadow-lg shadow-sunset/20 active:scale-95 animate-pulse"
            >
              <User className="w-5 h-5 fill-current text-white shrink-0" />
              <span>{lang === 'RU' ? 'Авторизоваться' : (lang === 'GE' ? 'ავტორიზაცია' : 'Authorize')}</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full p-4 rounded-[28px] flex items-center gap-4 border text-left transition-all hover:scale-[1.02] cursor-pointer ${
                activeTab === 'account'
                  ? 'border-brand-teal bg-white/10 text-white shadow-2xl'
                  : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl overflow-hidden bg-brand-teal/20 border border-white/20 flex items-center justify-center shrink-0">
                <img src={studentAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-black uppercase tracking-wider truncate leading-tight text-white">{studentName}</p>
                <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-widest text-brand-teal italic mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                  {lang === 'RU' ? 'Авторизован' : (lang === 'GE' ? 'ავტორიზებული' : 'Authorized')}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 md:p-12 lg:p-20 relative pt-28 lg:pt-20 lg:ml-80">
        <AnimatePresence>
          {showRegSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -40, x: '-50%', scale: 0.8 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: -40, x: '-50%', scale: 0.8 }}
              className="fixed top-8 left-1/2 z-[4000] p-6 bg-brand-teal text-white rounded-[32px] flex items-center gap-4 shadow-[0_20px_50px_rgba(45,185,183,0.4)] font-black italic uppercase tracking-widest text-xs border border-white/20"
            >
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="leading-tight">{lang === 'RU' ? 'Регистрация завершена!' : 'Registration Complete!'}</p>
                <p className="text-[9px] opacity-60 mt-1">{lang === 'RU' ? 'Добро пожаловать в Sport Park Juno' : 'Welcome to Sport Park Juno'}</p>
              </div>
              <button onClick={() => setShowRegSuccess(false)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {newInvitationToast && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              onClick={() => {
                setActiveTab('schedule');
                setNewInvitationToast(null);
              }}
              className="fixed top-8 left-1/2 z-[3000] p-6 bg-brand-sunset text-white rounded-[32px] flex items-center gap-4 shadow-sunset font-black italic uppercase tracking-widest text-xs cursor-pointer hover:scale-105 transition-transform"
            >
              <Bell className="w-6 h-6 animate-bounce" />
              {newInvitationToast}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Background Decor */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-teal/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        {firestoreQuotaExceeded && (
          <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] text-brand-navy flex flex-col md:flex-row items-start md:items-center gap-4 shadow-xl relative z-40">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black uppercase italic tracking-widest text-xs text-amber-800 mb-1">
                {lang === 'RU' ? 'Превышена бесплатная квота базы данных' : 'Database Free Quota Exceeded'}
              </h3>
              <p className="text-[11px] leading-relaxed text-brand-navy/60">
                {lang === 'RU' 
                  ? 'Достигнут суточный лимит бесплатных записей в Cloud Firestore. Приложение продолжает работать, но некоторые данные не синхронизируются до перезапуска квоты завтра. Вы можете увеличить лимит, перейдя по ссылке:' 
                  : 'Daily free write limit for Cloud Firestore has been reached. The app remains functional, but some changes may not sync to the cloud until the quota resets tomorrow. To increase the limit, visit:'}
              </p>
              <a 
                href="https://console.firebase.google.com/project/boris-boarman-finmodels/firestore/databases/ai-studio-2e1aad4f-ff29-4c7e-8181-046496793006/data?openUpgradeDialog=true"
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-700 hover:text-amber-800 hover:underline mt-2"
              >
                {lang === 'RU' ? 'Открыть панель Firestore и обновить тариф' : 'Open Firestore Console & Upgrade'}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <button 
              onClick={() => {
                setFirestoreQuotaExceeded(false);
                if (typeof localStorage !== 'undefined') {
                  localStorage.removeItem('firestoreQuotaExceeded');
                }
                if (typeof window !== 'undefined') {
                  (window as any).__firestoreQuotaExceeded = false;
                }
              }}
              className="p-2 hover:bg-black/5 rounded-xl text-brand-navy/40 hover:text-brand-navy transition-all shrink-0 md:self-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-6 relative z-30">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tight leading-none mb-2">
              {activeTab === 'schedule' ? t.navSchedule : t.dashTitle}
            </h1>
            <p className="text-xs sm:text-sm text-brand-navy/40 font-semibold italic">
              {activeTab === 'schedule' 
                ? (lang === 'RU' ? 'Ваше расписание тренировок и событий' : 'Your training and event schedule')
                : t.dashSub.replace('{name}', studentName.split(' ')[0])}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-6">
            {isDemo && (
              <div className="px-4 py-1.5 bg-brand-teal/10 border border-brand-teal/20 rounded-full">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-teal italic">{t.demoBadge}</span>
              </div>
            )}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[24px] glass border-white/60 flex items-center justify-center relative hover:bg-white hover:scale-105 transition-all shadow-xl"
            >
              <Bell className="w-5.5 h-5.5 text-brand-navy/40" />
              <div className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-brand-sunset rounded-full shadow-sunset animate-pulse" />
            </button>
            <div 
              ref={dropdownRef}
              onClick={() => !isMaster && !isDemo && setShowSwitchDropdown(!showSwitchDropdown)}
              className="flex items-center gap-3 sm:gap-5 glass-dark p-1.5 sm:p-2 pr-4 sm:pr-8 rounded-[20px] sm:rounded-[28px] border-white/10 shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer relative group/profile z-[100]"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[14px] sm:rounded-[20px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-teal shrink-0">
                <img src={studentAvatar} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="relative z-10 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-white leading-none mb-1 truncate max-w-[120px] sm:max-w-none">{studentName}</p>
                  {!isMaster && !isDemo && <ChevronRight className={`w-3 h-3 text-white/40 transition-transform duration-300 shrink-0 ${showSwitchDropdown ? '-rotate-90' : 'rotate-90'}`} />}
                </div>
                <p className="text-[9px] sm:text-[10px] text-white/30 uppercase font-bold tracking-tighter italic">{t.dashGuardian}</p>
              </div>

              {/* Dropdown for quick switch */}
              <AnimatePresence>
                {!isDemo && !isMaster && showSwitchDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-4 w-64 glass-dark border border-white/10 rounded-3xl p-4 transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden"
                  >
                     {athleteList.length > 1 && (
                       <>
                         <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-4 px-2 italic">{t.loginSelectTitle}</p>
                         <div className="space-y-2 mb-4">
                            {athleteList.filter(a => a.id !== athleteData.id).map((athlete, idx) => (
                              <button 
                                key={`${athlete.id || 'sw_athlete'}_${idx}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectAthlete(athlete);
                                  setShowSwitchDropdown(false);
                                }}
                                className="w-full text-left p-3 rounded-2xl hover:bg-white/10 flex items-center gap-4 group/item"
                              >
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 group-hover/item:border-brand-teal transition-colors">
                                  <img src={athlete.studentProfileImage || MOCK_STUDENT.avatar} alt={athlete.studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight text-white/60 group-hover/item:text-white transition-colors truncate">{athlete.studentName}</span>
                              </button>
                            ))}
                         </div>
                       </>
                     )}
                     <button 
                       onClick={(e) => {
                         e.stopPropagation();
                         navigate('/register?add_athlete=true');
                       }}
                       className="w-full flex items-center justify-center gap-3 p-3 rounded-2xl bg-brand-teal text-white font-black uppercase italic text-[10px] tracking-widest shadow-teal hover:scale-105 transition-all text-center border-none cursor-pointer"
                     >
                       <UserPlus className="w-4 h-4" />
                       {lang === 'RU' ? 'Добавить ученика' : 'Add Student'}
                     </button>
                  </motion.div>
                )}
               </AnimatePresence>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' || activeTab === 'master_dashboard' ? (
          isMaster ? (
            <MasterDashboard 
              master={masterData} 
              t={t} 
              registrations={masterRegistrations} 
              allInvitations={allInvitations}
              onNavigate={(tab: string) => setActiveTab(tab)} 
              onSelectAthlete={(reg: any) => {
                setSelectedAthleteForReview(reg);
                setReviewSubTab('dossier');
                setActiveTab('master_registrations');
              }}
              lang={lang} 
            />
          ) : (
          <>
            {/* Next Event High-Visibility Banner */}
            {relevantInvitation && !isRestricted && (
              <section className="mb-12 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-1.5 h-6 bg-brand-teal rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic">{t.dashNextTrain}</h3>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-dark p-5 sm:p-10 rounded-[28px] sm:rounded-[56px] shadow-3xl text-white group cursor-pointer hover:bg-brand-navy transition-colors border border-white/5"
                  onClick={() => setActiveTab('schedule')}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-brand-teal flex flex-col items-center justify-center text-white shadow-teal rotate-3 group-hover:rotate-0 transition-transform shrink-0">
                        <span className="text-[8px] sm:text-[10px] uppercase font-black leading-none opacity-60 mb-1">
                          {new Date(relevantInvitation.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'short' }).toUpperCase()}
                        </span>
                        <span className="text-2xl sm:text-3xl font-black leading-none italic tracking-tighter">{new Date(relevantInvitation.date).getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                          <Badge color="sunset" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                            {lang === 'RU' ? 'БЛИЖАЙШЕЕ СОБЫТИЕ' : 'NEXT EVENT'}
                          </Badge>
                          {relevantInvitation.status === 'accepted' ? (
                            <Badge color="teal" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                              {t.dashStatusConfirmed}
                            </Badge>
                          ) : (
                            <Badge color="white" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                              {lang === 'RU' ? 'Ожидает' : 'Pending'}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-black italic uppercase text-lg sm:text-2xl md:text-3xl tracking-tight leading-tight text-white mb-2 truncate">
                          {relevantInvitation.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                          <MapPin className="w-3.5 h-3.5 text-brand-teal animate-bounce shrink-0" />
                          <span className="truncate">{getFullLocation(relevantInvitation.location)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col items-baseline lg:items-end justify-between lg:justify-center border-t border-white/5 lg:border-0 pt-4 lg:pt-0 shrink-0">
                      <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/30 italic lg:mb-1">{lang === 'RU' ? 'Время начала' : 'Start Time'}</p>
                      <div className="text-2xl sm:text-4xl md:text-5xl font-black italic text-brand-teal leading-none tracking-tighter animate-pulse">{relevantInvitation.startTime}</div>
                    </div>
                  </div>
                </motion.div>
              </section>
            )}

            {/* AI-Generated Home Task Section for Athletes (Smaller card, similar to the Next Event card) */}
            {relevantInvitation && relevantInvitation.homeTask && !isRestricted && (() => {
              const task = relevantInvitation.homeTask;
              const listCompletedEvents = athleteData?.completedHomeTasks || [];
              const isCompletedByThisAthlete = listCompletedEvents.includes(relevantInvitation.id) || 
                (task.completedByAthleteIds && task.completedByAthleteIds.includes(athleteData?.id));

              return (
                <section className="mb-12 relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-1.5 h-6 bg-brand-sunset rounded-full animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-widest italic">{(t as any).homeWorkout || (lang === 'RU' ? '🏡 Домашняя тренировка' : '🏡 Active Homework')}</h3>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-dark p-5 sm:p-10 rounded-[28px] sm:rounded-[56px] shadow-3xl text-white group cursor-pointer hover:bg-brand-navy transition-colors border border-white/5"
                    onClick={() => handleViewEventDetails(relevantInvitation.id)}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] bg-brand-sunset flex flex-col items-center justify-center text-white shadow-sunset -rotate-3 group-hover:rotate-0 transition-transform shrink-0">
                          <Home className="w-8 h-8 text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                            <Badge color="sunset" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                              {lang === 'RU' ? 'АКТИВНОЕ ДОМАШНЕЕ ЗАДАНИЕ' : 'ACTIVE HOMEWORK'}
                            </Badge>
                            {isCompletedByThisAthlete ? (
                              <Badge color="teal" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                                {lang === 'RU' ? 'ВЫПОЛНЕНО' : 'COMPLETED'}
                              </Badge>
                            ) : (
                              <Badge color="sunset" className="text-[7.5px] sm:text-[8px] uppercase italic tracking-widest font-black leading-none py-1 px-3">
                                {lang === 'RU' ? 'ОЖИДАЕТ' : 'PENDING'}
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-black italic uppercase text-lg sm:text-2xl md:text-3xl tracking-tight leading-tight text-white mb-2 truncate">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 italic">
                            <Clock className="w-3.5 h-3.5 text-brand-sunset shrink-0" />
                            <span>{task.durationMins} мин</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex lg:flex-col items-baseline lg:items-end justify-between lg:justify-center border-t border-white/5 lg:border-0 pt-4 lg:pt-0 shrink-0">
                        <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/30 italic lg:mb-1">{lang === 'RU' ? 'Кликните для деталей' : 'Click for details'}</p>
                        <div className="text-xs font-black uppercase tracking-widest text-brand-sunset bg-brand-sunset/10 px-4 py-2 rounded-xl border border-brand-sunset/20 flex items-center gap-2 shrink-0">
                          <span>{lang === 'RU' ? 'СМОТРЕТЬ ЗАДАНИЕ' : 'VIEW TASK'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </section>
              );
            })()}

            {/* Notifications Preview Section (Latest 3 Previews) */}
            <section className="mb-12 relative z-10 animate-fade-in">
              <div className="flex items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 bg-brand-teal rounded-full" />
                  <h3 className="text-sm font-black uppercase tracking-widest italic">{t.dashNotifTitle}</h3>
                  <span className="bg-brand-teal/10 text-brand-teal font-black text-[10px] px-3 py-1 rounded-full font-mono">
                    {latestThreeNotifications.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setNotificationFilter('all');
                    setActiveTab('notifications');
                  }}
                  className="px-5 py-2.5 rounded-2xl text-[10px] uppercase font-black italic border border-brand-navy/10 bg-white hover:bg-brand-navy hover:text-white transition-all shadow-md hover:shadow-teal"
                >
                  {lang === 'RU' ? 'ПОКАЗАТЬ ВСЕ' : lang === 'GE' ? 'ყველას ნახვა' : 'SEE ALL'} &rarr;
                </button>
              </div>

              {latestThreeNotifications.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full min-w-0">
                  {latestThreeNotifications.map((notif, idx) => {
                    const IconComponent = notif.icon || Bell;
                    const isUnread = notif.unread;

                    const itemBg = isUnread ? 'glass-dark text-white border-brand-teal/30 hover:bg-brand-navy' : 'glass border-white/60 hover:bg-white/80';
                    const titleColor = isUnread ? 'text-white' : 'text-brand-navy';
                    const descColor = isUnread ? 'text-white/70' : 'text-brand-navy/60';
                    const iconBg = notif.color === 'sunset' ? 'bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';

                    return (
                      <motion.div
                        whileHover={notif.id === 'notif_declined_restricted' ? undefined : { y: -4 }}
                        key={`latest_notif_${notif.id || 'notif'}_${idx}`}
                        onClick={() => {
                          if (notif.id === 'notif_declined_restricted') return;
                          if (notif.onClick) {
                            notif.onClick();
                          } else {
                            setActiveTab('notifications');
                          }
                        }}
                        className={`p-4 sm:p-5 rounded-[20px] sm:rounded-[28px] border flex flex-col justify-between gap-4 group transition-all shadow-sm w-full min-w-0 ${
                          notif.id === 'notif_declined_restricted'
                            ? 'glass-dark text-white border-brand-sunset/40 shadow-lg shadow-sunset/10 col-span-full'
                            : itemBg
                        } ${notif.id !== 'notif_declined_restricted' ? 'cursor-pointer hover:shadow-lg' : ''}`}
                      >
                        <div className="flex gap-3 sm:gap-4 items-start min-w-0 w-full">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-transform ${
                            notif.id === 'notif_declined_restricted'
                              ? 'bg-brand-sunset/20 text-brand-sunset border-brand-sunset/40 scale-105'
                              : 'group-hover:scale-105 ' + iconBg
                          }`}>
                            <IconComponent className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1 w-full">
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 min-w-0 w-full">
                              <h4 className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate flex-1 min-w-0 ${
                                notif.id === 'notif_declined_restricted' ? 'text-brand-sunset' : titleColor
                              }`}>{notif.title}</h4>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping shrink-0" />
                              )}
                            </div>
                            {notif.id === 'notif_declined_restricted' ? (
                              <div className="space-y-4">
                                <p className="text-[10.5px] sm:text-[11.5px] font-bold text-white/90 uppercase italic leading-relaxed whitespace-normal bg-brand-sunset/15 p-3.5 rounded-2xl border border-brand-sunset/30 mt-1.5">
                                  {notif.message}
                                </p>
                                <div className="mt-4 pt-2">
                                  <Button 
                                    onClick={() => {
                                      handleLogout();
                                    }}
                                    className="w-full h-14 !rounded-2xl border-red-500/35 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all gap-3 italic uppercase tracking-[0.15em] text-[10px] font-black font-sans shadow-md"
                                  >
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    {lang === 'RU' ? 'ВЫЙТИ ИЗ АККАУНТА' : lang === 'GE' ? 'სისტემიდან გამოსვლა' : 'LOG OUT'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <p className={`text-[9px] sm:text-[9.5px] font-bold uppercase italic leading-relaxed truncate ${descColor}`}>{notif.message}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-brand-navy/5 shrink-0">
                          <span className="text-[8px] font-black uppercase tracking-widest opacity-40 font-mono">
                            {new Date(notif.createdAt).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                              month: 'short', day: 'numeric'
                            })}
                          </span>
                          {notif.id !== 'notif_declined_restricted' && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-brand-teal hover:underline inline-flex items-center gap-0.5">
                              {lang === 'RU' ? 'ПОДРОБНЕЕ' : lang === 'GE' ? 'დეტალურად' : 'DETAILS'}
                              <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center glass rounded-[48px] border border-brand-navy/5 max-w-lg mx-auto">
                  <Bell className="w-12 h-12 text-brand-navy/10 mx-auto mb-4 animate-bounce" />
                  <p className="text-xs font-black uppercase tracking-widest text-brand-navy/40 mb-1">
                    {lang === 'RU' ? 'Уведомлений нет' : lang === 'GE' ? 'შეტყობინებები არ არის' : 'No notifications'}
                  </p>
                </div>
              )}
            </section>

            {/* Dynamic Grid Layout (Asymmetric) */}
            <div className={`grid lg:grid-cols-12 gap-8 mb-12 relative z-10 ${isRestricted ? 'opacity-30 pointer-events-none select-none filter blur-[0.5px]' : ''}`}>
              {/* Main Stat Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-8 glass p-6 sm:p-8 rounded-[32px] sm:rounded-[48px] border-white/60 shadow-3xl hover:bg-white/60 transition-colors flex flex-col md:flex-row gap-6 md:gap-8 group"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4 sm:mb-8">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-teal/10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Activity className="text-brand-teal w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <Badge color="teal" className="px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl text-[10px] sm:text-xs font-black">{levelInfo.tier} — {levelInfo.title.toUpperCase()}</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-[0.2em]">{t.dashTotalXP}</p>
                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-black italic text-brand-navy tracking-tighter leading-none">{currentStudentXp} <span className="text-base sm:text-lg not-italic opacity-20 ml-1">XP</span></h2>
                  </div>
                </div>

                <div className="md:w-px h-full bg-brand-navy/5 hidden md:block" />

                <div className="flex-1 flex flex-col justify-end pb-2">
                  <div className="h-3 bg-brand-navy/5 rounded-full overflow-hidden mb-4 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progressPercent}%` }}
                      className="h-full bg-brand-teal shadow-teal"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-navy/40 font-black uppercase tracking-[0.2em] italic">
                    <span>{levelInfo.title.toUpperCase()}</span>
                    {levelInfo.nextXpNeeded > 0 ? (
                      <span className="text-brand-teal">
                        {(t as any).dashNextXP.replace('{xp}', levelInfo.nextXpNeeded)}
                      </span>
                    ) : (
                      <span className="text-brand-teal">
                        {lang === 'RU' ? 'МАКСИМАЛЬНЫЙ УРОВЕНЬ' : 'MAX LEVEL ACHIEVED'}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Secondary Stat Card (Simple Earned Badges Widget) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onClick={() => {
                  setActiveTab('achievements');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="lg:col-span-4 bg-brand-navy p-6 sm:p-8 rounded-[32px] sm:rounded-[48px] shadow-3xl text-white relative overflow-hidden group cursor-pointer border border-white/5 hover:border-brand-teal/40 hover:bg-[#0d1624] transition-all duration-300"
              >
                <div className="absolute -top-8 -right-8 opacity-5 scale-125 group-hover:rotate-12 transition-transform duration-700">
                   <Trophy className="w-40 h-40 text-brand-teal" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="text-brand-teal w-5 h-5" />
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest italic">
                          {lang === 'RU' ? 'Трофеи Студента' : 'Student Badges'}
                        </span>
                      </div>
                      <span className="text-[9px] bg-brand-teal/10 text-brand-teal font-black uppercase px-2.5 py-1 rounded-lg">
                        {studentRewards.length} {lang === 'RU' ? 'Получено' : 'Earned'}
                      </span>
                    </div>

                    {/* Badges Icons Only View */}
                    <div className="flex flex-wrap gap-2.5 my-4">
                      {studentRewards.slice(0, 4).map((badge, idx) => {
                        const BadgeIcon = badge.icon;
                        return (
                          <div 
                            key={idx} 
                            title={`${badge.title} (${badge.date})`}
                            className="relative w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-brand-teal shrink-0 shadow-lg shadow-black/20 hover:scale-110 hover:bg-white/10 hover:border-brand-teal/30 transition-all duration-300"
                          >
                            <BadgeIcon className="w-5 h-5" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* View Path Link */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-brand-teal font-black uppercase italic tracking-widest text-[9px] group-hover:translate-x-1 transition-transform">
                    <span>{lang === 'RU' ? 'ОТКРЫТЬ ВСЕ ДОСТИЖЕНИЯ ➜' : 'VIEW ALL ACHIEVEMENTS ➜'}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Grid */}
            <div className={`grid lg:grid-cols-12 gap-8 relative z-10 ${isRestricted ? 'opacity-30 pointer-events-none select-none filter blur-[0.5px]' : ''}`}>
              {/* Skill Tree (Environmental List) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-12 xl:col-span-7 glass p-6 sm:p-12 rounded-[32px] sm:rounded-[64px] border-white/60 shadow-3xl"
              >
                <div className="flex items-center justify-between mb-8 sm:mb-16 gap-3">
                  <h3 className="text-xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none">{t.dashSkillTree}</h3>
                  <Button onClick={() => { if (!isRestricted) setShowReportModal(true); }} disabled={isRestricted} variant="secondary" className="px-4 py-2 sm:px-6 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] italic shadow-lg shrink-0">{t.dashReport} ↗</Button>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6 sm:gap-10">
                  {((athleteData || MOCK_STUDENT).skills || []).map((skill: any, idx: number) => {
                    const label = lang === 'RU' ? skill.labelRU : lang === 'GE' ? skill.labelGE : skill.label;
                    return (
                      <div key={`${skill.key || 'skill'}_${idx}`} className="group">
                        <div className="flex justify-between items-end mb-3 sm:mb-4">
                          <div className="flex gap-3 sm:gap-4 items-center min-w-0 flex-1">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/40 group-hover:bg-brand-teal transition-colors shrink-0" />
                             <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-brand-navy/50 italic truncate">{label}</span>
                          </div>
                          <span className="text-xl sm:text-2xl font-black italic text-brand-navy tracking-tighter leading-none shrink-0">{skill.value}%</span>
                        </div>
                        <div className="h-1.5 bg-brand-navy/5 rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.value}%` }}
                            transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-brand-teal shadow-teal"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Schedule/Utility Cards */}
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6 sm:gap-8">
                <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-1 gap-6 sm:gap-8 flex-1">
                  {[
                    { title: t.dashHabits, sub: t.dashConsistency, icon: Activity, color: 'sunset' },
                    { title: t.dashDrills, sub: t.dashPractice, icon: Target, color: 'teal' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -5 }}
                      className="bg-white/80 p-5 sm:p-8 rounded-[28px] sm:rounded-[48px] border border-black/5 shadow-2xl flex flex-col justify-between group cursor-pointer hover:bg-white transition-all"
                    >
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl mb-4 sm:mb-8 shrink-0
                        ${item.color === 'teal' ? 'bg-brand-teal text-white' : 'bg-brand-sunset text-white'}`}>
                        <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </div>
                      <div>
                        <h4 className="font-black italic uppercase text-xs sm:text-sm tracking-tight text-brand-navy group-hover:text-brand-teal transition-colors mb-1">{item.title}</h4>
                        <p className="text-[8px] sm:text-[9px] text-brand-navy/30 uppercase font-black tracking-widest leading-none">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skills Report Modal */}
            <AnimatePresence>
              {showReportModal && (
                <SkillsReportModal 
                  isOpen={showReportModal} 
                  onClose={() => setShowReportModal(false)} 
                  athlete={athleteData || MOCK_STUDENT} 
                  lang={lang} 
                />
              )}
            </AnimatePresence>
          </>
          )
        ) : activeTab === 'master_registrations' ? (
          selectedAthleteForReview ? (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex">
                <button
                  onClick={() => setSelectedAthleteForReview(null)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/60 text-brand-navy hover:bg-white/80 text-xs font-black uppercase tracking-wider italic rounded-xl transition-all border border-black/5 shadow-sm cursor-pointer self-start"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {lang === 'RU' ? 'К списку спортсменов' : lang === 'GE' ? 'ათლეტების სიაში დაბრუნება' : 'Back to Athlete List'}
                </button>
              </div>

              {/* Static Athlete Basic Information Card */}
              {(() => {
                const reviewXp = selectedAthleteForReview.xp !== undefined
                  ? Number(selectedAthleteForReview.xp)
                  : (selectedAthleteForReview.id === 'demo-athlete' || selectedAthleteForReview.studentName?.toLowerCase().includes('luka') || selectedAthleteForReview.studentName?.toLowerCase().includes('лук') || selectedAthleteForReview.studentName?.toLowerCase().includes('ლუკ') || selectedAthleteForReview.studentName === 'Maxim Ivanov' ? 1300 : 0);
                const studentLevel = getStudentLevelInfo(reviewXp);


                const getBadgeIconLocal = (iconName: string) => {
                  switch (iconName?.toLowerCase()) {
                    case 'target': return Target;
                    case 'dribbble':
                    case 'dribbbleicon': return Dribbble;
                    case 'users':
                    case 'usersicon': return Users;
                    case 'clock':
                    case 'clockicon': return Clock;
                    case 'activity':
                    case 'activityicon': return Activity;
                    case 'zap':
                    case 'zapicon': return Zap;
                    case 'star':
                    case 'staricon': return Star;
                    case 'trophy':
                    case 'trophyicon': return Trophy;
                    default: return Award;
                  }
                };

                const rawReviewAthleteBadges = [...(selectedAthleteForReview.badges || [])];
                const confirmedVisitsCountReview = reviewAthleteInvitations.filter((i: any) => i.visitConfirmed).length;
                const hasConfirmedVisitReview = confirmedVisitsCountReview >= 1 || (isDemo && rawReviewAthleteBadges.length === 0);
                const hasFirstStepBadgeReview = rawReviewAthleteBadges.some((b: any) => 
                  b.id === 'first_step' || 
                  b.id === 'first_training' ||
                  b.titleRU?.toLowerCase().includes('первый шаг') ||
                  b.titleRU?.toLowerCase().includes('первая тренировка') ||
                  b.titleEN?.toLowerCase().includes('first step') ||
                  b.titleEN?.toLowerCase().includes('first training') ||
                  b.titleGE?.toLowerCase().includes('პირველი ნაბიჯი') ||
                  b.titleTR?.toLowerCase().includes('ilk adım') ||
                  b.title?.toLowerCase().includes('first step') ||
                  b.title?.toLowerCase().includes('первый шаг') ||
                  b.title?.toLowerCase().includes('პირველი ნაბიჯი') ||
                  b.title?.toLowerCase().includes('ilk adım') ||
                  b.title?.toLowerCase().includes('первая тренировка') ||
                  b.title?.toLowerCase().includes('first training')
                );

                if (hasConfirmedVisitReview && !hasFirstStepBadgeReview) {
                  rawReviewAthleteBadges.unshift({
                    id: 'first_step',
                    titleRU: 'Первый шаг',
                    titleEN: 'First Step',
                    titleGE: 'პირველი ნაბიჯი',
                    titleTR: 'İlk Adım',
                    descRU: 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
                    descEN: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
                    descGE: 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.',
                    descTR: 'İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.',
                    icon: 'Dribbble',
                    date: selectedAthleteForReview.createdAt 
                      ? (selectedAthleteForReview.createdAt.seconds 
                          ? new Date(selectedAthleteForReview.createdAt.seconds * 1000) 
                          : new Date(selectedAthleteForReview.createdAt)).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'short' })
                      : 'Jun 2026'
                  });
                }

                const has10ConfirmedVisitsReview = confirmedVisitsCountReview >= 10 || (isDemo && (selectedAthleteForReview.id === 'demo-athlete' || selectedAthleteForReview.studentName?.toLowerCase().includes('luka') || selectedAthleteForReview.studentName?.toLowerCase().includes('лук') || selectedAthleteForReview.studentName?.toLowerCase().includes('ლუკ') || selectedAthleteForReview.studentName === 'Maxim Ivanov'));
                const hasIronAthleteBadgeReview = rawReviewAthleteBadges.some((b: any) => 
                  b.id === 'iron_athlete' ||
                  b.titleRU?.toLowerCase().includes('железный спортсмен') ||
                  b.titleRU?.toLowerCase().includes('железный атлет') ||
                  b.titleEN?.toLowerCase().includes('iron athlete')
                );

                if (has10ConfirmedVisitsReview && !hasIronAthleteBadgeReview) {
                  rawReviewAthleteBadges.push({
                    id: 'iron_athlete',
                    titleRU: 'Железный спортсмен',
                    titleEN: 'Iron Athlete',
                    titleGE: 'რკინის ათლეტი',
                    titleTR: 'Demir Sporcu',
                    descRU: 'Награждается за стойкость и приверженность спорту после подтверждения 10 посещений тренировок.',
                    descEN: 'Awarded for resilience and commitment to sport upon completing 10 confirmed training visits.',
                    descGE: 'გადაეცემა სპორტული გამძლეობისა და მონდომებისთვის 10 დადასტურებული ვარჯიშის შემდეგ.',
                    descTR: '10 onaylı antrenman ziyaretini tamamlayan sporcuya dayanıklılık ve spora bağlılık için verilir.',
                    icon: 'Trophy',
                    date: selectedAthleteForReview.createdAt 
                      ? (selectedAthleteForReview.createdAt.seconds 
                          ? new Date(selectedAthleteForReview.createdAt.seconds * 1000) 
                          : new Date(selectedAthleteForReview.createdAt)).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { year: 'numeric', month: 'short' })
                      : 'Jun 2026'
                  });
                }

                // Canonical deduplication to guarantee no double badges
                const reviewAthleteBadges: any[] = [];
                const seenIdsReview = new Set<string>();
                const seenTitlesReview = new Set<string>();

                rawReviewAthleteBadges.forEach((badge: any) => {
                  const bTitle = (badge.titleRU || badge.titleEN || badge.title || '').toLowerCase().trim();
                  const bId = (badge.id || bTitle).trim();
                  
                  const isFirstStep = bId === 'first_step' || bId === 'first_training' || bTitle.includes('first step') || bTitle.includes('первый шаг') || bTitle.includes('первая тренировка') || bTitle.includes('პირველი ნაბიჯი') || bTitle.includes('ilk adım') || bTitle.includes('first training');
                  const isIronAthlete = bId === 'iron_athlete' || bTitle.includes('iron athlete') || bTitle.includes('железный спортсмен') || bTitle.includes('железный атлет') || bTitle.includes('რკინის ათლეტი') || bTitle.includes('demir sporcu');
                  
                  if (isFirstStep) {
                    if (!seenIdsReview.has('first_step')) {
                      seenIdsReview.add('first_step');
                      reviewAthleteBadges.push({
                        ...badge,
                        id: 'first_step',
                        titleRU: 'Первый шаг',
                        titleEN: 'First Step',
                        titleGE: 'პირველი ნაბიჯი',
                        titleTR: 'İlk Adım',
                        descRU: 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
                        descEN: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
                        descGE: 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.',
                        descTR: 'İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.',
                        icon: 'Dribbble'
                      });
                    }
                  } else if (isIronAthlete) {
                    if (!seenIdsReview.has('iron_athlete')) {
                      seenIdsReview.add('iron_athlete');
                      reviewAthleteBadges.push({
                        ...badge,
                        id: 'iron_athlete',
                        titleRU: 'Железный спортсмен',
                        titleEN: 'Iron Athlete',
                        titleGE: 'რკინის ათლეტი',
                        titleTR: 'Demir Sporcu',
                        descRU: 'Награждается за стойкость и приверженность спорту после подтверждения 10 посещений тренировок.',
                        descEN: 'Awarded for resilience and commitment to sport upon completing 10 confirmed training visits.',
                        descGE: 'გადაეცემა სპორტული გამძლეობისა და მონდომებისთვის 10 დადასტურებული ვარჯიშის შემდეგ.',
                        descTR: '10 onaylı antrenman ziyaretini tamamlayan sporcuya dayanıklılık ve spora bağlılık için verilir.',
                        icon: 'Trophy'
                      });
                    }
                  } else {
                    if (!seenIdsReview.has(bId) && !seenTitlesReview.has(bTitle)) {
                      seenIdsReview.add(bId);
                      seenTitlesReview.add(bTitle);
                      reviewAthleteBadges.push(badge);
                    }
                  }
                });

                return (
                  <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-[32px] glass border-white/60 shadow-lg flex flex-col gap-4 relative overflow-hidden text-left w-full min-w-0">
                    {/* Top Row: Basic Info & Stats */}
                    <div className="flex items-center gap-4 sm:gap-6 w-full">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-md shrink-0 relative">
                        <img 
                          src={selectedAthleteForReview.studentProfileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'} 
                          className="w-full h-full object-cover"
                          alt={selectedAthleteForReview.studentName || 'Athlete'}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="text-lg sm:text-xl md:text-2xl font-black uppercase italic tracking-tighter text-brand-navy leading-none mb-1 truncate">
                            {selectedAthleteForReview.studentName || (lang === 'RU' ? 'Демо Спортсмен' : 'Demo Athlete')}
                          </h2>
                          <p className="text-[9px] font-black uppercase tracking-widest text-brand-teal italic leading-none">
                            {lang === 'RU' ? 'ЛИЧНАЯ КАРТА СПОРТСМЕНА' : 'ATHLETE PROFILE CARD'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 shrink-0 pt-1 md:pt-0">
                          <div className="space-y-0.5">
                            <p className="text-[8px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">
                              {lang === 'RU' ? 'Возраст' : 'Age'}
                            </p>
                            <p className="text-sm font-black italic tracking-tight text-brand-navy leading-none">
                              {(() => {
                                if (selectedAthleteForReview.studentAge !== undefined && selectedAthleteForReview.studentAge !== null) {
                                    return `${selectedAthleteForReview.studentAge} ${lang === 'RU' ? 'лет' : 'years'}`;
                                  }
                                if (selectedAthleteForReview.studentBirthDate) {
                                  return `${Math.floor((new Date().getTime() - new Date(selectedAthleteForReview.studentBirthDate).getTime()) / 31557600000)} ${lang === 'RU' ? 'лет' : 'years'}`;
                                }
                                return `8 ${lang === 'RU' ? 'лет' : 'years'}`;
                              })()}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[8px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">
                              {lang === 'RU' ? 'Группа / Уровень' : 'Group / Level'}
                            </p>
                            <p className="text-sm font-black italic tracking-tight uppercase text-brand-sunset leading-none">
                              {selectedAthleteForReview.trainingGroup || 'Standard'} / {studentLevel?.tier || 'Level 1'} ({reviewXp} XP)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dedicated Separate Section for Badges on the Card */}
                    <div className="pt-3.5 border-t border-brand-navy/10 flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                      <p className="text-[9px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none shrink-0">
                        {lang === 'RU' ? 'Полученные награды' : 'Earned Badges'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        {reviewAthleteBadges.length === 0 ? (
                          <span className="text-[9px] font-bold text-brand-navy/30 uppercase italic">
                            {lang === 'RU' ? 'Нет наград' : 'No Badges'}
                          </span>
                        ) : (
                          reviewAthleteBadges.map((badge: any, idx: number) => {
                            const IconComponent = getBadgeIconLocal(badge.icon);
                            const bTitle = lang === 'RU' ? (badge.titleRU || badge.title) : lang === 'GE' ? (badge.titleGE || badge.title) : (badge.titleEN || badge.title);
                            const bDesc = lang === 'RU' ? (badge.descRU || badge.desc) : lang === 'GE' ? (badge.descGE || badge.desc) : (badge.descEN || badge.desc);
                            return (
                              <div 
                                key={badge.id || idx}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-brand-sunset/5 border border-brand-sunset/15 text-brand-sunset hover:scale-105 transition-transform cursor-help"
                                title={`${bTitle}: ${bDesc}`}
                              >
                                <IconComponent className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-[10px] font-black uppercase italic leading-none tracking-tight">{bTitle}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })()}

              {/* Parameters, Balance, Dossier Tabs Bar under Athlete Card */}
              <div className="flex bg-brand-navy/5 p-1.5 rounded-2xl w-full max-w-sm sm:max-w-md mx-auto items-center justify-between gap-1 select-none border border-brand-navy/5 shadow-inner">
                <button
                  onClick={() => setReviewSubTab('parameters')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
                    reviewSubTab === 'parameters'
                      ? 'bg-white text-brand-navy shadow-lg shadow-brand-navy/5 scale-[1.02]'
                      : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal shrink-0" />
                  <span>{lang === 'RU' ? 'Параметры' : lang === 'GE' ? 'პარამეტრები' : 'Parameters'}</span>
                </button>
                <button
                  onClick={() => setReviewSubTab('balance')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
                    reviewSubTab === 'balance'
                      ? 'bg-white text-brand-navy shadow-lg shadow-brand-navy/5 scale-[1.02]'
                      : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal shrink-0" />
                  <span>{lang === 'RU' ? 'Баланс' : lang === 'GE' ? 'ბალანსი' : 'Balance'}</span>
                </button>
                <button
                  onClick={() => setReviewSubTab('dossier')}
                  className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
                    reviewSubTab === 'dossier'
                      ? 'bg-white text-brand-navy shadow-lg shadow-brand-navy/5 scale-[1.02]'
                      : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
                  }`}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal shrink-0" />
                  <span>{lang === 'RU' ? 'Досье' : lang === 'GE' ? 'საქაღალდე' : 'Dossier'}</span>
                </button>
              </div>

              {reviewSubTab === 'dossier' ? (
                <ProfileView 
                  athleteData={selectedAthleteForReview} 
                  masterData={masterData}
                  lang={lang} 
                  t={t} 
                  studentAvatar={selectedAthleteForReview.studentProfileImage || studentAvatar}
                  getFullLocation={getFullLocation}
                  isDemo={isDemo}
                  initialTab="dossier"
                  onLogout={handleLogout}
                  onUpdateAthleteData={(updatedReg: any) => {
                    setSelectedAthleteForReview(updatedReg);
                    setMasterRegistrations(prev => prev.map(r => r.id === updatedReg.id ? updatedReg : r));
                  }}
                  onUpdateMasterData={setMasterData}
                  hideHeaderCard={true}
                  forcedTab="dossier"
                />
              ) : reviewSubTab === 'balance' ? (
                <ProfileView 
                  athleteData={selectedAthleteForReview} 
                  masterData={masterData}
                  lang={lang} 
                  t={t} 
                  studentAvatar={selectedAthleteForReview.studentProfileImage || studentAvatar}
                  getFullLocation={getFullLocation}
                  isDemo={isDemo}
                  initialTab="balance"
                  onLogout={handleLogout}
                  onUpdateAthleteData={(updatedReg: any) => {
                    setSelectedAthleteForReview(updatedReg);
                    setMasterRegistrations(prev => prev.map(r => r.id === updatedReg.id ? updatedReg : r));
                  }}
                  onUpdateMasterData={setMasterData}
                  hideHeaderCard={true}
                  forcedTab="balance"
                />
              ) : (
                <AthleteParametersDashboard 
                  athlete={selectedAthleteForReview}
                  master={masterData}
                  isEditable={true}
                  lang={lang}
                  onBack={() => setSelectedAthleteForReview(null)}
                  hideHeaderCard={true}
                />
              )}
            </div>
          ) : (
            <MasterRegistrationsView t={t} lang={lang} onSelectAthlete={(reg: any) => {
              setSelectedAthleteForReview(reg);
              setReviewSubTab('parameters');
            }} />
          )
        ) : activeTab === 'master_attendance' ? (
          <MasterAttendanceView t={t} lang={lang} master={masterData} />
        ) : activeTab === 'master_exercises' ? (
          <MasterExercisesView lang={lang} t={t} master={masterData} />
        ) : activeTab === 'master_schedule' ? (
          <MasterScheduleView master={masterData} lang={lang} t={t} />
        ) : activeTab === 'schedule' ? (
          <ScheduleView 
            athleteData={athleteData} 
            lang={lang} 
            t={t} 
            getFullLocation={getFullLocation} 
            getRegDay={getRegDay}
            getRegTime={getRegTime}
            onOpenHomeTaskModal={setActiveHomeTaskModalEvent}
            onViewEventDetails={handleViewEventDetails}
          />
        ) : activeTab === 'event_details' ? (
          <InAppEventDetailsView 
            eventId={selectedEventId || ''}
            lang={lang}
            athleteData={athleteData}
            masterData={masterData}
            onBack={handleBackFromEventDetails}
          />
        ) : activeTab === 'profile' ? (
          <ProfileView 
            athleteData={athleteData} 
            masterData={masterData}
            lang={lang} 
            t={t} 
            studentAvatar={studentAvatar}
            getFullLocation={getFullLocation}
            isDemo={isDemo}
            onLogout={handleLogout}
            onUpdateAthleteData={setAthleteData}
            onUpdateMasterData={setMasterData}
          />
        ) : activeTab === 'balance' ? (
          <ProfileView 
            athleteData={athleteData} 
            masterData={masterData}
            lang={lang} 
            t={t} 
            studentAvatar={studentAvatar}
            getFullLocation={getFullLocation}
            isDemo={isDemo}
            initialTab="balance"
            onLogout={handleLogout}
            onUpdateAthleteData={setAthleteData}
            onUpdateMasterData={setMasterData}
          />
        ) : activeTab === 'performance' ? (
          <AthleteParametersDashboard 
            athlete={athleteData || {
              id: 'demo-athlete',
              studentName: lang === 'RU' ? 'Максим Иванов' : 'Maksim Ivanov',
              studentAge: 9,
              studentLocation: 'Heroes Park Batumi',
              parentFullName: lang === 'RU' ? 'Алексей Иванов' : 'Aleksey Ivanov',
              parentPhone: '+995 555 123 456'
            }}
            master={masterData}
            isEditable={isMaster}
            lang={lang}
            onBack={() => setActiveTab('dashboard')}
          />
        ) : activeTab === 'achievements' ? (
          <AchievementsView lang={lang} t={t} isDemo={isDemo} athleteData={athleteData} />
        ) : activeTab === 'account' ? (
          <ProfileView 
            athleteData={athleteData} 
            masterData={masterData}
            lang={lang} 
            t={t} 
            studentAvatar={studentAvatar}
            getFullLocation={getFullLocation}
            isDemo={isDemo}
            onLogout={handleLogout}
            onUpdateAthleteData={setAthleteData}
            onUpdateMasterData={setMasterData}
            showAccountOnly
          />
        ) : activeTab === 'notifications' ? (
          <AllNotificationsView 
            notifications={profileNotifications}
            filter={notificationFilter}
            onFilterChange={setNotificationFilter}
            lang={lang}
            t={t}
            onBack={() => setActiveTab('dashboard')}
            isMaster={isMaster}
            onDeleteNotification={handleDeleteNotification}
          />
        ) : (
          <div className="glass p-6 sm:p-20 rounded-[32px] sm:rounded-[64px] border-white/60 shadow-3xl text-center">
            <h3 className="text-xl sm:text-3xl font-black italic uppercase text-brand-navy/20">{lang === 'RU' ? 'Раздел в разработке' : 'Section Under Development'}</h3>
          </div>
        )}
      </main>

      <AnimatePresence>
        {false && activeHomeTaskModalEvent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/80 backdrop-blur-md z-[5000] flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-brand-navy border border-white/10 p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] max-w-2xl w-full relative overflow-y-auto max-h-[90vh] shadow-3xl text-left text-white"
            >
              <button 
                onClick={() => setActiveHomeTaskModalEvent(null)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all z-[5010]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="pr-10 mb-4">
                <Badge color="sunset" className="text-[8px] uppercase italic tracking-widest font-black mb-2 inline-block">
                  {lang === 'RU' ? 'ПОДРОБНОСТИ ЗАДАНИЯ ИИ' : 'AI WORKOUT DETAILS'}
                </Badge>
                <h3 className="text-xl sm:text-2xl font-black italic uppercase text-white leading-none">
                  {lang === 'RU' ? 'Домашняя Тренировка ИИ' : 'AI Home Workout Practice'}
                </h3>
              </div>

              <div className="text-white">
                <AthleteHomeTaskView 
                  event={activeHomeTaskModalEvent}
                  athleteData={athleteData}
                  lang={lang as any}
                />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showClaimAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/80 backdrop-blur-md z-[5000] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-brand-navy border border-white/10 p-12 rounded-[64px] text-center max-w-sm relative overflow-hidden text-white shadow-3xl"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-sunset/20 blur-[60px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-teal/25 blur-[60px] rounded-full pointer-events-none" />
              <div className="w-24 h-24 rounded-[36px] bg-brand-sunset flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-sunset/30">
                <Trophy className="w-12 h-12 text-white fill-current" />
              </div>
              <h3 className="text-3xl font-black italic uppercase text-brand-sunset mb-2 tracking-tighter">
                {lang === 'RU' ? 'ПОЗДРАВЛЯЕМ!' : 'CONGRATULATIONS!'}
              </h3>
              <p className="text-xs font-black uppercase italic tracking-widest text-white/80 mb-6">
                {lang === 'RU' ? 'НАГРАДА РАЗБЛОКИРОВАНА!' : 'REWARD UNLOCKED SUCCESSFULLY'}
              </p>
              <p className="text-xs text-white/50 italic leading-relaxed mb-8">
                {lang === 'RU' 
                  ? `Вы успешно достигли цели и заработали награду: "${weeklyRewardPrize}"! Возвращайтесь на следующей неделе за новыми достижениями!`
                  : `You have successfully achieved your weekly target and claimed: "${weeklyRewardPrize}"! Keep unlocking badges to master your football pathway!`}
              </p>
              <Button onClick={() => setShowClaimAnimation(false)} variant="secondary" className="w-full h-14 rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-black uppercase italic tracking-widest">
                {lang === 'RU' ? 'ОТЛИЧНО!' : "LET'S GO!"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OldProfileView_Obsolete({ athleteData, masterData, lang, t, studentAvatar, getFullLocation, isDemo, onLogout, showAccountOnly, onUpdateAthleteData, onUpdateMasterData }: any) {
  const isMaster = !!masterData;
  const isMasterProfile = isMaster && !athleteData;

  const [activeAthleteState, setActiveAthleteState] = React.useState<any>(null);
  const [profileTab, setProfileTab] = React.useState<'dossier' | 'balance'>(() => {
    return (localStorage.getItem('profileActiveSubTab') as any) || 'dossier';
  });
  const changeProfileTab = (tab: 'dossier' | 'balance') => {
    setProfileTab(tab);
    localStorage.setItem('profileActiveSubTab', tab);
  };

  const [demoTotal, setDemoTotal] = React.useState(() => {
    return athleteData?.totalPaidClasses ?? 16;
  });
  const [demoUsed, setDemoUsed] = React.useState(() => {
    return athleteData?.usedPaidClasses ?? 10;
  });
  
  React.useEffect(() => {
    if (!athleteData) return;
    setActiveAthleteState(athleteData);
    if (isDemo || !athleteData.id) return;
    const unsubscribe = onSnapshot(doc(db, 'registrations', athleteData.id), (docSnap) => {
      if (docSnap.exists()) {
        setActiveAthleteState({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [athleteData, isDemo]);
  
  const displayAthlete = isDemo ? {
    id: 'demo-athlete',
    studentName: lang === 'RU' ? 'Лука Иванов' : lang === 'GE' ? 'ლუკა ივანოვი' : 'Luka Ivanov',
    studentBirthDate: '2018-05-15', // makes they 8 years old
    studentGender: 'male',
    studentLocation: 'pirosmani_5',
    parentFullName: lang === 'RU' ? 'Алексей Иванов' : 'Aleksey Ivanov',
    parentName: lang === 'RU' ? 'Алексей Иванов' : 'Aleksey Ivanov',
    parentPhone: '+995 555 123 456',
    parentEmail: 'alex.ivanov@example.com',
    studentLanguage: lang || 'RU',
    createdAt: { seconds: 1747805123 }, // Some timestamp
    totalPaidClasses: demoTotal,
    usedPaidClasses: demoUsed
  } : (activeAthleteState || athleteData);

  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'res_error'; text: string } | null>(null);

  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);
  React.useEffect(() => {
    if (!displayAthlete?.id) return;
    if (isDemo) {
      setPaymentHistory([
        {
          id: 'demo-log-1',
          updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
          type: 'purchase',
          label: lang === 'RU' ? 'Пакет на 8 занятий успешно назначен!' : 'Assigned training package of 8 classes',
          newTotal: 8,
          masterName: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman'
        },
        {
          id: 'demo-log-2',
          updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          type: 'purchase',
          label: lang === 'RU' ? 'Активирован пробный урок' : 'Trial lesson activated',
          newTotal: 1,
          masterName: lang === 'RU' ? 'Тренер Роман' : 'Coach Roman'
        }
      ]);
      return;
    }
    const q = query(
      collection(db, 'payment_history'),
      where('athleteId', '==', displayAthlete.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      const sorted = docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPaymentHistory(sorted);
    }, (error) => {
      console.error("Error loading payment history:", error);
    });
    return () => unsubscribe();
  }, [displayAthlete?.id, isDemo, lang]);

  const logPurchase = async (newTotal: number, type: 'purchase' | 'reset', label: string) => {
    if (isDemo || !displayAthlete?.id) {
      if (isDemo) {
        setPaymentHistory((prev) => [
          {
            id: `demo-log-${Date.now()}`,
            updatedAt: new Date().toISOString(),
            type,
            label,
            newTotal,
            masterName: masterData?.fullName || (lang === 'RU' ? 'Тренер Роман' : 'Coach Roman')
          },
          ...prev
        ]);
      }
      return;
    }
    try {
      await addDoc(collection(db, 'payment_history'), {
        athleteId: displayAthlete.id,
        newTotal,
        previousTotal: displayAthlete.totalPaidClasses || 0,
        type,
        label,
        updatedAt: new Date().toISOString(),
        masterId: masterData?.id || masterData?.phone || 'coach-roman',
        masterName: masterData?.fullName || 'Coach Roman'
      });
    } catch (e) {
      console.error("Error logging purchase:", e);
    }
  };
  
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setUploadError(lang === 'RU' ? 'Изображение слишком большое. Лимит 1.5МБ.' : 'Image is too large. Limit 1.5MB.');
      return;
    }

    setUploadingImage(true);
    setUploadError('');

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Data = reader.result as string;
        
        if (isMaster) {
          const docId = masterData.id || masterData.phone;
          const docRef = doc(db, 'masters', docId);
          await updateDoc(docRef, { avatar: base64Data });
          
          const updatedMaster = { ...masterData, avatar: base64Data };
          if (onUpdateMasterData) {
            onUpdateMasterData(updatedMaster);
          }
          localStorage.setItem('masterAccount', JSON.stringify(updatedMaster));
        } else {
          if (athleteData?.id) {
            const docRef = doc(db, 'registrations', athleteData.id);
            await updateDoc(docRef, { studentProfileImage: base64Data });
            
            const updatedAthlete = { ...athleteData, studentProfileImage: base64Data };
            if (onUpdateAthleteData) {
              onUpdateAthleteData(updatedAthlete);
            }
            localStorage.setItem('athleteAccount', JSON.stringify(updatedAthlete));
          }
        }
        
        e.target.value = '';
      } catch (err) {
        console.error("Error updating profile image:", err);
        setUploadError(lang === 'RU' ? 'Ошибка при загрузке изображения' : 'Error uploading image');
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [editParentName, setEditParentName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editLanguage, setEditLanguage] = React.useState('RU');
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    if (displayAthlete) {
      setEditParentName(displayAthlete.parentName || displayAthlete.parentFullName || (lang === 'RU' ? 'Иван Иванов' : 'John Doe'));
      setEditPhone((displayAthlete.parentPhone || '+995 555 123 456').replace('+995', '').trim());
      setEditEmail(displayAthlete.parentEmail || '');
      setEditLanguage(displayAthlete.studentLanguage || 'RU');
    }
  }, [displayAthlete, lang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const formattedPhone = editPhone.startsWith('+995') ? editPhone : `+995${editPhone.replace(/\D/g, '')}`;

    try {
      const updateData = {
        parentFullName: editParentName,
        parentName: editParentName, // Keep both for backward compatibility
        parentPhone: formattedPhone,
        parentEmail: editEmail,
        studentLanguage: editLanguage
      };

      if (!isDemo && athleteData?.id) {
        // Real Firestore update
        const docRef = doc(db, 'registrations', athleteData.id);
        await updateDoc(docRef, updateData);
      }
      
      // Update parent state directly (for instant responsive UI feedback, and for local trials)
      if (onUpdateAthleteData && athleteData) {
        onUpdateAthleteData({
          ...athleteData,
          ...updateData
        });
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4500);
    } catch (err) {
      console.error("Error saving parent details:", err);
      setSaveError(lang === 'RU' ? 'Произошла ошибка при сохранении' : 'An error occurred during save');
    } finally {
      setIsSaving(false);
    }
  };

  const localeMap: any = {
    'RU': 'ru-RU',
    'EN': 'en-US',
    'GE': 'ka-GE'
  };

  const regDate = displayAthlete?.createdAt 
    ? (displayAthlete.createdAt.seconds 
        ? new Date(displayAthlete.createdAt.seconds * 1000) 
        : new Date(displayAthlete.createdAt))
      .toLocaleDateString(localeMap[lang] || 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : (lang === 'RU' ? '15 мая 2025' : 'May 15, 2025');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 relative z-10"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1.5 h-6 bg-brand-sunset rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-widest italic">
          {showAccountOnly 
            ? (lang === 'RU' ? 'УПРАВЛЕНИЕ АККАУНТОМ' : 'ACCOUNT MANAGEMENT')
            : (lang === 'RU' ? 'ЛИЧНЫЙ КАБИНЕТ АТЛЕТА' : 'ATHLETE PROFILE CARD')}
        </h3>
      </div>
      
      {!showAccountOnly && (
        <Card className="p-5 sm:p-8 md:p-12 rounded-[28px] sm:rounded-[56px] glass border-white/60 shadow-3xl flex flex-col md:flex-row items-center gap-6 sm:gap-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-[32px] sm:rounded-[56px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-2xl relative rotate-3 group">
              {uploadingImage ? (
                <div className="absolute inset-0 bg-brand-navy/60 flex items-center justify-center text-white z-10">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
                </div>
              ) : null}
              <img src={studentAvatar} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              
              {!isDemo && (
                <label 
                  htmlFor="avatar-file-input"
                  className="absolute inset-0 bg-brand-navy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center cursor-pointer text-white text-center p-4 z-10"
                >
                  <Plus className="w-8 h-8 mb-2 text-brand-teal animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'RU' ? 'ЗАГРУЗИТЬ' : 'UPLOAD'}</span>
                </label>
              )}
            </div>

            {!isDemo && (
              <div className="mt-6 text-center">
                <label 
                  htmlFor="avatar-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-navy/5 text-brand-navy/60 hover:bg-brand-navy/10 hover:text-brand-navy border border-brand-navy/10 transition-all text-[10px] font-black uppercase tracking-widest italic"
                >
                  <Plus className="w-3 h-3 text-brand-teal animate-pulse" />
                  <span>{lang === 'RU' ? 'Загрузить фото' : 'Upload Image'}</span>
                </label>
                <input 
                  type="file" 
                  id="avatar-file-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                {uploadError && (
                  <p className="text-red-500 font-bold text-[9px] uppercase tracking-wider mt-2 max-w-[150px] leading-tight">
                    {uploadError}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-10 text-left">
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-navy mb-2 leading-none">
                {isMaster ? masterData.fullName : (displayAthlete?.studentName || (lang === 'RU' ? 'Демо Атлет' : 'Demo Athlete'))}
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-brand-teal italic">
                {isMaster ? (masterData.role || 'Master') : t.dashGuardian}
              </p>
            </div>

            {isMaster ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">Specialization</p>
                  <p className="text-xl font-black italic tracking-tight">{masterData.specialization || 'General'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">Status</p>
                  <Badge color="teal" className="text-[9px] uppercase italic">Active Master</Badge>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteAge}</p>
                  <p className="text-xl font-black italic tracking-tight">
                    {(() => {
                      if (displayAthlete?.studentAge !== undefined && displayAthlete?.studentAge !== null) {
                        return `${displayAthlete.studentAge} ${lang === 'RU' ? 'лет' : 'years'}`;
                      }
                      if (displayAthlete?.studentBirthDate) {
                        return `${Math.floor((new Date().getTime() - new Date(displayAthlete.studentBirthDate).getTime()) / 31557600000)} ${lang === 'RU' ? 'лет' : 'years'}`;
                      }
                      return `8 ${lang === 'RU' ? 'лет' : 'years'}`;
                    })()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteGender}</p>
                  <p className="text-xl font-black italic tracking-tight uppercase">
                    {displayAthlete?.studentGender === 'male' ? (lang === 'RU' ? 'М' : 'M') : (displayAthlete?.studentGender === 'female' ? (lang === 'RU' ? 'Ж' : 'F') : (lang === 'RU' ? 'М' : 'M'))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteCenter}</p>
                  <p className="text-base font-black italic tracking-tight uppercase leading-tight">{displayAthlete ? getFullLocation(displayAthlete.studentLocation) : 'Hero Park Batumi'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteRegDate}</p>
                  <p className="text-base font-black italic tracking-tight leading-tight">{regDate}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        {/* Left Column: Contact Details & Athlete Dossier */}
        <div className="space-y-8">
          {/* Card 1: Contact Details */}
          <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[48px] glass border-white/60 text-left">
            <div className="flex justify-between items-center mb-8">
              <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy/40 italic">{lang === 'RU' ? 'КОНТАКТНЫЕ ДАННЫЕ' : 'CONTACT DETAILS'}</h4>
              {!isMaster && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setSaveError('');
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-brand-teal hover:text-brand-sunset transition-colors italic bg-brand-navy/5 hover:bg-brand-navy/10 px-4 py-2 rounded-xl border border-brand-navy/10 shadow-sm"
                >
                  {isEditing ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      {lang === 'RU' ? 'ОТМЕНА' : 'CANCEL'}
                    </>
                  ) : (
                    <>
                      <Edit className="w-3.5 h-3.5" />
                      {lang === 'RU' ? 'ИЗМЕНИТЬ' : 'EDIT'}
                    </>
                  )}
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-4 bg-brand-teal/10 border border-brand-teal/20 text-brand-teal text-xs font-black uppercase tracking-widest rounded-2xl mb-6 italic text-left animate-bounce">
                {lang === 'RU' ? 'Данные успешно обновлены!' : 'Details successfully updated!'}
              </div>
            )}

            {isEditing ? (
              <form
                onSubmit={handleSave}
                className="space-y-6 pt-2 text-left"
              >
                <Input 
                  icon={User}
                  label={lang === 'RU' ? 'ИМЯ РОДИТЕЛЯ' : 'PARENT FULL NAME'}
                  placeholder="ALEXANDER ATHLETE"
                  value={editParentName}
                  onChange={(e: any) => setEditParentName(e.target.value)}
                  required
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-4">
                    {lang === 'RU' ? 'ТЕЛЕФОН' : 'PHONE'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                       <Phone className="w-4 h-4 text-brand-navy/30 group-focus-within:text-brand-teal transition-colors" />
                     </div>
                     <span className="absolute left-11 top-1/2 -translate-y-1/2 font-black text-brand-navy/60 italic text-sm z-10 select-none pointer-events-none">+995</span>
                    <PatternFormat 
                      format="### ### ###"
                      value={editPhone}
                      onValueChange={(values) => {
                        setEditPhone(values.value);
                      }}
                      className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-full h-14 pl-24 pr-6 text-sm font-black focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal/40 transition-all outline-none text-brand-navy placeholder:text-brand-navy/20 italic tracking-tight"
                      placeholder="5__ ___ ___"
                      type="tel"
                      required
                    />
                  </div>
                </div>

                <Input 
                  icon={Mail}
                  label={lang === 'RU' ? 'ЭЛЕКТРОННАЯ ПОЧТА (EMAIL)' : 'EMAIL ADDRESS'}
                  placeholder="parent@example.com"
                  type="email"
                  value={editEmail}
                  onChange={(e: any) => setEditEmail(e.target.value)}
                />

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-4">
                    {lang === 'RU' ? 'ЯЗЫК ОБЩЕНИЯ' : 'COMMUNICATION LANGUAGE'}
                  </label>
                  <div className="flex gap-2.5">
                    {['RU', 'EN', 'GE'].map((lgOpt) => (
                      <button
                        key={lgOpt}
                        type="button"
                        onClick={() => setEditLanguage(lgOpt)}
                        className={`flex-1 h-12 rounded-[20px] font-black text-xs uppercase italic tracking-widest border transition-all ${
                          editLanguage === lgOpt 
                            ? 'bg-brand-navy border-brand-navy text-white shadow-lg' 
                            : 'bg-white/40 border-white/60 text-brand-navy/40 hover:bg-white/80'
                        }`}
                      >
                        {lgOpt === 'RU' ? 'РУС' : (lgOpt === 'EN' ? 'ENG' : 'GEO')}
                      </button>
                    ))}
                  </div>
                </div>

                {saveError && (
                  <p className="text-xs font-bold uppercase tracking-wider text-red-500 bg-red-50 p-4 rounded-2xl border border-red-100 animate-pulse">
                    {saveError}
                  </p>
                )}

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving || !editParentName || editPhone.length < 9}
                    variant="secondary"
                    className="flex-1 h-14 !rounded-2xl shadow-xl italic uppercase tracking-widest text-[10px] font-black"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      lang === 'RU' ? 'СОХРАНИТЬ' : 'SAVE'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="h-14 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-brand-navy/10 italic"
                  >
                    {lang === 'RU' ? 'ОТМЕНА' : 'CANCEL'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                     <User className="w-5 h-5 text-brand-navy/30" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{isMaster ? 'ROLE' : (lang === 'RU' ? 'АТЛЕТ' : 'ATHLETE')}</p>
                     <p className="font-black italic text-brand-navy uppercase text-sm">{isMaster ? (masterData.role || 'Coach') : (displayAthlete?.parentName || displayAthlete?.parentFullName || (lang === 'RU' ? 'Иван Иванов' : 'John Doe'))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                     <Phone className="w-5 h-5 text-brand-navy/30" />
                  </div>
                  <div>
                     <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ТЕЛЕФОН' : 'PHONE'}</p>
                     <p className="font-black italic text-brand-navy text-sm">{isMaster ? masterData.phone : (displayAthlete?.parentPhone || '+995 555 123 456')}</p>
                  </div>
                </div>
                {(displayAthlete?.studentLanguage || isMaster) && (
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                       <Bell className="w-5 h-5 text-brand-navy/30" />
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ЯЗЫК ОБЩЕНИЯ' : 'COMMUNICATION LANGUAGE'}</p>
                       <p className="font-black italic text-brand-navy text-sm">{isMaster ? 'Russian / English' : displayAthlete.studentLanguage}</p>
                     </div>
                  </div>
                )}
              </div>
            )}

            {!isMaster && (
              <div className="mt-8">
                <Button 
                  onClick={() => window.location.href = '/register'}
                  className="w-full h-14 !rounded-2xl border-brand-teal/20 bg-brand-teal/5 text-brand-teal hover:bg-brand-teal hover:text-white transition-all gap-3 italic uppercase tracking-widest text-[10px] font-black font-sans"
                >
                  <Plus className="w-4 h-4" />
                  {lang === 'RU' ? 'ДОБАВИТЬ УЧЕНИКА' : (lang === 'GE' ? 'ახალი ათლეტის დამატება' : 'ADD NEW STUDENT')}
                </Button>
              </div>
            )}
            
            <div className="mt-10 pt-10 border-t border-brand-navy/5">
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="w-full justify-start px-0 text-red-500 hover:text-red-600 transition-colors gap-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest italic">{t.dashExit}</span>
              </Button>
            </div>
          </Card>

          {/* Card 2: Student Dossier */}
          {!isMasterProfile && !showAccountOnly && displayAthlete && (
            <Card className="p-6 sm:p-8 rounded-[28px] sm:rounded-[40px] glass border-white/65 shadow-xl relative overflow-hidden bg-white/50 animate-in fade-in duration-500 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-navy/10 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic uppercase tracking-tight text-brand-navy">
                      {lang === 'RU' ? 'Регистрационное Досье' : lang === 'GE' ? 'სარეგისტრაციო დოკუმენტაცია' : 'Registration Dossier'}
                    </h3>
                    <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wider mt-1">
                      {lang === 'RU' ? 'Анкета родителя и верификация спортсмена' : lang === 'GE' ? 'მშობლის მიერ შევსებული აპლიკაცია და სტატუსი' : 'Original form details and verification status'}
                    </p>
                  </div>
                </div>

                {/* Verification status controls for coach/master */}
                {isMaster && (
                  <div className="flex items-center gap-3 shrink-0">
                    {(!displayAthlete.status || displayAthlete.status === 'pending') ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase italic tracking-wider animate-pulse border border-amber-500/15">
                          {lang === 'RU' ? 'Ожидает проверки' : lang === 'GE' ? 'მოლოდინშია' : 'Pending Verification'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              try {
                                await processRegistrationStatus(displayAthlete.id, 'approved', displayAthlete);
                                setFeedback({
                                  type: 'success',
                                  text: lang === 'RU' ? 'Досье успешно одобрено!' : 'Registration successfully approved!'
                                });
                                setTimeout(() => setFeedback(null), 3000);
                              } catch (err) {
                                console.error("Error approving registration:", err);
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-brand-teal text-white text-xs font-black italic uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-brand-teal/15"
                          >
                            <Check className="w-4 h-4" />
                            {lang === 'RU' ? 'Одобрить' : lang === 'GE' ? 'დამტკიცება' : 'Approve'}
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm(lang === 'RU' ? 'Вы уверены, что хотите отклонить эту регистрацию?' : lang === 'GE' ? 'დარწმუნებული ხართ, რომ გსურთ უარყოფა?' : 'Are you sure you want to decline this registration?')) {
                                try {
                                  await processRegistrationStatus(displayAthlete.id, 'declined', displayAthlete);
                                  setFeedback({
                                    type: 'success',
                                    text: lang === 'RU' ? 'Регистрация отклонена' : 'Registration declined'
                                  });
                                  setTimeout(() => setFeedback(null), 3000);
                                } catch (err) {
                                  console.error("Error declining registration:", err);
                                }
                              }
                            }}
                            className="px-5 py-2.5 rounded-xl bg-brand-sunset/10 border border-brand-sunset/20 text-brand-sunset text-xs font-black italic uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer hover:bg-brand-sunset hover:text-white"
                          >
                            <X className="w-4 h-4" />
                            {lang === 'RU' ? 'Отклонить' : lang === 'GE' ? 'უარყოფა' : 'Decline'}
                          </button>
                        </div>
                      </div>
                    ) : displayAthlete.status === 'approved' ? (
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase italic tracking-wider border border-emerald-500/15 flex items-center gap-1.5">
                          <Check className="w-4 h-4" />
                          {lang === 'RU' ? 'Утверждено и Активировано' : lang === 'GE' ? 'დამტკიცებულია და აქტიურია' : 'Approved & Activated'}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await processRegistrationStatus(displayAthlete.id, 'pending', displayAthlete);
                            } catch (err) {
                              console.error("Error setting pending:", err);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-brand-navy/10 hover:border-brand-navy/20 text-brand-navy/55 text-[9px] font-black uppercase italic cursor-pointer tracking-wider"
                        >
                          {lang === 'RU' ? 'Сбросить' : lang === 'GE' ? 'სტატუსის შეცვლა' : 'Reset Status'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-[10px] font-black uppercase italic tracking-wider border border-red-500/15 flex items-center gap-1.5">
                          <X className="w-4 h-4" />
                          {lang === 'RU' ? 'Отклонено / Архив' : lang === 'GE' ? 'უარყოფილია' : 'Declined / Archived'}
                        </span>
                        <button
                          onClick={async () => {
                            try {
                              await processRegistrationStatus(displayAthlete.id, 'pending', displayAthlete);
                            } catch (err) {
                              console.error("Error setting pending:", err);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg border border-brand-navy/10 hover:border-brand-navy/20 text-brand-navy/55 text-[9px] font-black uppercase italic cursor-pointer tracking-wider"
                        >
                          {lang === 'RU' ? 'Сбросить' : lang === 'GE' ? 'სტატუსის შეცვლა' : 'Reset Status'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Registration Details Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
                {/* Box 1: Sibling/Guardian Details */}
                <div className="p-4 rounded-2xl bg-white/30 border border-white/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-navy/30 mb-2 italic">
                      {lang === 'RU' ? 'Родитель / Опекун' : lang === 'GE' ? 'მშობელი' : 'Parent / Guardian'}
                    </p>
                    <h4 className="text-sm font-black italic uppercase text-brand-navy tracking-tight leading-snug">
                      {displayAthlete.parentFullName || displayAthlete.parentName || (lang === 'RU' ? 'Не указано' : 'Unknown')}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-brand-navy/70 bg-black/5 px-2.5 py-1.5 rounded-xl self-start mt-4">
                    <Phone className="w-3.5 h-3.5 text-brand-teal" />
                    <span className="text-[10px] font-mono font-black italic">
                      {displayAthlete.parentPhone || 'No Phone'}
                    </span>
                  </div>
                </div>

                {/* Box 2: Athlete Specs & Medical */}
                <div className="p-4 rounded-2xl bg-white/30 border border-white/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-navy/30 mb-2 italic">
                      {lang === 'RU' ? 'Характеристики' : lang === 'GE' ? 'სპეციფიკაცია' : 'Athlete Specifications'}
                    </p>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-brand-navy/70 uppercase">
                        {lang === 'RU' ? 'Пол: ' : lang === 'GE' ? 'სქესი: ' : 'Gender: '}
                        <span className="font-black italic text-brand-navy">
                          {displayAthlete.studentGender === 'female' 
                            ? (lang === 'RU' ? 'Женский' : lang === 'GE' ? 'მდედრობითი' : 'Female') 
                            : (lang === 'RU' ? 'Мужской' : lang === 'GE' ? 'მამრობิทი' : 'Male')}
                        </span>
                      </p>
                      <p className="text-[11px] font-bold text-brand-navy/70 uppercase">
                        {lang === 'RU' ? 'Язык: ' : lang === 'GE' ? 'ენა: ' : 'Language: '}
                        <span className="font-black italic text-brand-navy">{displayAthlete.studentLanguage || 'Georgian'}</span>
                      </p>
                    </div>
                  </div>
                  {displayAthlete.studentMedicalNotes ? (
                    <div className="mt-3 p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-900 text-[9px] font-black italic uppercase leading-tight text-left">
                      🚨 {displayAthlete.studentMedicalNotes}
                    </div>
                  ) : (
                    <div className="mt-3 text-[9px] font-bold text-brand-navy/25 italic uppercase text-left">
                      {lang === 'RU' ? 'Ограничений нет' : lang === 'GE' ? 'არ არის შენიშვნა' : 'No medical complaints'}
                    </div>
                  )}
                </div>

                {/* Box 3: Group & Schedule */}
                <div className="p-4 rounded-2xl bg-white/30 border border-white/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-navy/30 mb-1 italic">
                      {lang === 'RU' ? 'Группа и Расписание' : lang === 'GE' ? 'ჯგუფი და ლოკაცია' : 'Division & Schedule'}
                    </p>
                    <h4 className="text-sm font-black italic uppercase text-brand-navy tracking-tight">
                      {displayAthlete.trainingGroup || 'U8/U10'} Group
                    </h4>
                    <p className="text-[10px] font-bold text-brand-navy/40 uppercase mt-0.5 tracking-wider truncate">
                      {getFullLocation ? getFullLocation(displayAthlete.studentLocation) : (displayAthlete.studentLocation || 'Hero Park Batumi')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-brand-navy/70 bg-black/5 px-2.5 py-1.5 rounded-xl self-start mt-4">
                    <Calendar className="w-3.5 h-3.5 text-brand-teal" />
                    <span className="text-[10px] font-black italic uppercase tracking-wider">
                      {displayAthlete.trainingSchedule || 'Standard days'}
                    </span>
                  </div>
                </div>

                {/* Box 4: Billing & Date */}
                <div className="p-4 rounded-2xl bg-white/30 border border-white/40 shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-brand-navy/30 mb-2 italic">
                      {lang === 'RU' ? 'Абонемент и Способ' : lang === 'GE' ? 'გადახდის ტიპი' : 'Payment & Enrollment'}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase italic tracking-wider text-brand-teal px-2 py-0.5 bg-brand-teal/10 border border-brand-teal/20 rounded-lg">
                        {displayAthlete.paymentType || 'trial'}
                      </span>
                      <span className="text-[9px] font-bold text-brand-navy/40 uppercase">
                        via {displayAthlete.paymentMethod || 'cash'}
                      </span>
                    </div>
                  </div>
                  <div className="text-[9px] font-black text-brand-navy/30 uppercase italic text-right mt-4 leading-tight">
                    {lang === 'RU' ? 'Дата регистрации:' : lang === 'GE' ? 'რეგისტრაციის თარიღი:' : 'Enrollment Date:'}
                    <span className="block font-bold text-brand-navy/60 font-mono mt-0.5">
                      {(() => {
                        const createDate = displayAthlete?.createdAt;
                        if (!createDate) return '--';
                        const d = createDate.seconds 
                          ? new Date(createDate.seconds * 1000) 
                          : new Date(createDate);
                        return isNaN(d.getTime()) ? '--' : d.toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US');
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Training Package Balance stats, assigning, update history logs, and notifications */}
        <div className="space-y-8">
          {/* Card 1: Balance Details */}
          {!isMasterProfile && !showAccountOnly && displayAthlete && (
            <div className="space-y-8">
              {/* Stat card */}
              <div id="athlete-balance-card" className="glass p-5 sm:p-8 rounded-[28px] sm:rounded-[40px] border-white/60 shadow-xl bg-white/40 relative z-10 text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Statistics Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 bg-brand-teal rounded-full" />
                      <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy/60 italic">
                        {lang === 'RU' ? 'Баланс оплаченных тренировок' : lang === 'GE' ? 'ფასიანი ვარჯიშების ბალანსი' : 'Paid Training Package Balance'}
                      </h4>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-6 font-sans">
                      {/* Stat 1: Assigned */}
                      <div className="bg-white/30 p-4 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[9px] uppercase font-bold text-brand-navy/40 tracking-wider">
                          {lang === 'RU' ? 'Куплено занятий' : lang === 'GE' ? 'შეძენილი ვარჯიში' : 'Purchased Size'}
                        </p>
                        <p className="text-2xl font-black italic text-brand-navy">
                          {displayAthlete.totalPaidClasses || 0}
                        </p>
                      </div>

                      {/* Stat 2: Visited */}
                      <div className="bg-white/30 p-4 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[9px] uppercase font-bold text-brand-navy/40 tracking-wider">
                          {lang === 'RU' ? 'Посещено' : lang === 'GE' ? 'დასწრებულია' : 'Visited / Used'}
                        </p>
                        <p className="text-2xl font-black italic text-brand-teal">
                          {displayAthlete.usedPaidClasses || 0}
                        </p>
                      </div>

                      {/* Stat 3: Remaining */}
                      <div className="bg-white/30 p-4 rounded-2xl border border-white/40 shadow-sm">
                        <p className="text-[9px] uppercase font-bold text-brand-navy/40 tracking-wider">
                          {lang === 'RU' ? 'Осталось занятий' : lang === 'GE' ? 'დარჩენილია' : 'Remaining Balance'}
                        </p>
                        <p className={`text-2xl font-black italic ${Math.max(0, (displayAthlete.totalPaidClasses || 0) - (displayAthlete.usedPaidClasses || 0)) <= 2 ? 'text-brand-sunset' : 'text-brand-navy'}`}>
                          {Math.max(0, (displayAthlete.totalPaidClasses || 0) - (displayAthlete.usedPaidClasses || 0))}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(displayAthlete.totalPaidClasses || 0) > 0 && (
                      <div className="space-y-1.5 pt-2 font-sans">
                        <div className="w-full h-3 bg-brand-navy/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-teal rounded-full shadow-teal transition-all duration-500"
                            style={{ 
                              width: `${Math.min(100, Math.max(0, ((displayAthlete.usedPaidClasses || 0) / (displayAthlete.totalPaidClasses || 1)) * 100))}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-brand-navy/40 italic">
                          <span>
                            {lang === 'RU' ? 'Прогресс пакета' : lang === 'GE' ? 'პაკეტის პროგრესი' : 'Package progress'}
                          </span>
                          <span>
                            {Math.round(Math.min(100, Math.max(0, ((displayAthlete.usedPaidClasses || 0) / (displayAthlete.totalPaidClasses || 1)) * 100)))}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Master Assignment Form right on profile page for instantly updating athlete limit */}
                  {isMaster && (
                    <div className="w-full lg:w-auto lg:min-w-[280px] bg-brand-navy/5 p-5 rounded-3xl border border-brand-navy/5 flex flex-col justify-between gap-4 font-sans text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/50 italic">
                        {lang === 'RU' ? 'УПРАВЛЕНИЕ ПАКЕТОМ (МАСТЕР)' : lang === 'GE' ? 'პაკეტის მართვა (მასტერი)' : 'MANAGE PACKAGE (MASTER)'}
                      </p>

                      <form onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const fd = new FormData(form);
                        const count = Number(fd.get('totalClasses'));
                        if (!isNaN(count) && count >= 0) {
                          try {
                            const docRef = doc(db, 'registrations', displayAthlete.id);
                            await updateDoc(docRef, { totalPaidClasses: count });
                            await logPurchase(count, 'purchase', lang === 'RU' ? `Пакет обновлен до ${count} зан.` : `Package updated to ${count} classes`);
                            setFeedback({
                              type: 'success',
                              text: lang === 'RU' ? 'Пакет тренировок успешно назначен!' : 'Training package assigned successfully!'
                            });
                            setTimeout(() => setFeedback(null), 3000);
                          } catch (err) {
                            console.error("Error setting paid classes:", err);
                            setFeedback({
                              type: 'res_error',
                              text: lang === 'RU' ? 'Ошибка изменения пакета' : 'Error updating package'
                            });
                          }
                        }
                      }} className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            name="totalClasses"
                            min="0"
                            defaultValue={displayAthlete.totalPaidClasses || 0}
                            key={displayAthlete.totalPaidClasses || 0}
                            className="w-24 h-11 px-3 bg-white border border-brand-navy/10 rounded-xl font-black italic focus:outline-none focus:border-brand-teal text-center text-sm"
                            placeholder="0"
                          />
                          <Button 
                            type="submit"
                            className="flex-1 h-11 !rounded-xl !bg-brand-navy text-white text-[10px] font-black uppercase tracking-widest italic"
                          >
                            {lang === 'RU' ? 'НАЗНАЧИТЬ' : lang === 'GE' ? 'მინიჭება' : 'ASSIGN'}
                          </Button>
                        </div>

                        {/* Fast presets buttons */}
                        <div className="flex gap-1 flex-wrap">
                          {[8, 12, 16, 24].map((num) => (
                            <button
                              type="button"
                              key={num}
                              onClick={async () => {
                                try {
                                  const docRef = doc(db, 'registrations', displayAthlete.id);
                                  await updateDoc(docRef, { totalPaidClasses: num });
                                  await logPurchase(num, 'purchase', lang === 'RU' ? `Добавлен пакет на ${num} зан.` : `Assigned training package of ${num} classes`);
                                  setFeedback({
                                    type: 'success',
                                    text: lang === 'RU' ? `Пакет на ${num} занятий успешно назначен!` : `Assigned training package of ${num} classes!`
                                  });
                                  setTimeout(() => setFeedback(null), 3000);
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="px-2.5 py-1 text-[9px] font-black uppercase italic tracking-wider rounded-lg bg-brand-teal/10 text-brand-teal hover:bg-brand-teal hover:text-white transition-all border border-brand-teal/10 cursor-pointer"
                            >
                              +{num}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={async () => {
                              if (window.confirm(lang === 'RU' ? 'Обнулить баланс?' : 'Reset balance?')) {
                                try {
                                  const docRef = doc(db, 'registrations', displayAthlete.id);
                                  await updateDoc(docRef, { totalPaidClasses: 0, usedPaidClasses: 0 });
                                  await logPurchase(0, 'reset', lang === 'RU' ? 'Баланс обнулен' : 'Balance reset completed');
                                  setFeedback({
                                    type: 'success',
                                    text: lang === 'RU' ? 'Баланс обнулен' : 'Balance reset complete'
                                  });
                                  setTimeout(() => setFeedback(null), 3000);
                                } catch (err) {
                                  console.error(err);
                                }
                              }
                            }}
                            className="px-2.5 py-1 text-[9px] font-black uppercase italic tracking-wider rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-500/10 cursor-pointer"
                          >
                            RESET
                          </button>
                        </div>
                      </form>

                      {feedback && (
                        <p className={`text-[9px] font-bold uppercase tracking-wider text-center animate-pulse ${
                          feedback.type === 'success' ? 'text-brand-teal' : 'text-red-500'
                        }`}>
                          {feedback.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase history list logs table */}
              <Card className="p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] glass border-white/60 shadow-xl bg-white/40 font-sans text-left">
                <div className="flex items-center gap-2 mb-6">
                  <History className="w-5 h-5 text-brand-teal" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">
                    {lang === 'RU' ? 'История обновления баланса и оплат' : lang === 'GE' ? 'პაკეტების განახლების ისტორია' : 'Purchase & Update History'}
                  </h4>
                </div>

                {paymentHistory.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-brand-navy/10 rounded-2xl text-brand-navy/40">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-55 animate-pulse text-brand-navy/30" />
                    <p className="text-xs font-bold uppercase tracking-wider italic">
                      {lang === 'RU' ? 'Логи отсутствуют' : 'No purchase history found'}
                    </p>
                    <p className="text-[10px] mt-1 normal-case px-4">
                      {lang === 'RU' ? 'Измените баланс выше, чтобы добавить первую запись в журнал.' : 'Update the training package count to log transactions.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-brand-navy/10 uppercase tracking-wider font-extrabold text-[9px] text-brand-navy/40">
                          <th className="pb-3 text-left">{lang === 'RU' ? 'Дата' : 'Date'}</th>
                          <th className="pb-3 text-left">{lang === 'RU' ? 'Событие / Описание' : 'Label'}</th>
                          <th className="pb-3 text-right">{lang === 'RU' ? 'Новый Лимит' : 'New Limit'}</th>
                          <th className="pb-3 text-right">{lang === 'RU' ? 'Кем выдано' : 'Authorized By'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-navy/5 font-sans font-bold">
                        {paymentHistory.map((item, index) => {
                          const dateStr = new Date(item.updatedAt).toLocaleString(lang === 'RU' ? 'ru-RU' : 'en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          return (
                            <tr key={item.id || index} className="text-brand-navy/85 hover:bg-black/5 transition-colors">
                              <td className="py-3 font-mono text-[10px] text-brand-navy/40">{dateStr}</td>
                              <td className="py-3 font-medium italic text-brand-navy uppercase tracking-tight text-[11px]">
                                <span className="flex items-center gap-1.5 font-black text-brand-navy/80">
                                  <span className={`w-2 h-2 rounded-full ${item.type === 'reset' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                  {item.label}
                                </span>
                              </td>
                              <td className="py-3 text-right font-black text-brand-navy">{item.newTotal}</td>
                              <td className="py-3 text-right text-[10px] italic text-brand-navy/40">{item.masterName}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Card 2: Notifications */}
          {!showAccountOnly && (
            <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[48px] glass border-white/60 flex flex-col justify-start h-full w-full min-w-0 text-left">
              <div className="flex items-center gap-3 mb-8 border-b border-brand-navy/5 pb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-brand-teal" />
                </div>
                <div className="text-left">
                  <h4 className="font-black italic uppercase text-base text-brand-navy leading-none mb-1">
                    {lang === 'RU' ? 'Уведомления' : 'Notifications'}
                  </h4>
                  <p className="text-[9px] text-brand-navy/30 font-black uppercase tracking-widest italic leading-none">
                    {lang === 'RU' ? 'Активность профиля' : 'Profile Activity Logs'}
                  </p>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin text-left w-full min-w-0 font-sans">
                {isDemo ? (
                  <>
                    <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-4 w-full min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-teal flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                        <Dribbble className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black uppercase italic text-brand-navy leading-none mb-1">
                          {lang === 'RU' ? 'Получена награда' : 'Badge Awarded'}
                        </h5>
                        <p className="text-[10px] font-medium text-brand-navy/60 leading-normal">
                          <span className="break-words block w-full min-w-0">{lang === 'RU' ? 'Значок за первое посещение в сезоне разблокирован! Получена награда в виде футбольного мяча.' : 'Badge for the first visit in season unlocked! Unlocked football ball icon badge.'}</span>
                        </p>
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-brand-teal/50 mt-2 block font-mono">
                          {lang === 'RU' ? 'Только что' : 'Just now'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-brand-sunset/5 border border-brand-sunset/10 flex items-start gap-4 w-full min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-brand-sunset flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black uppercase italic text-brand-navy leading-none mb-1">
                          {lang === 'RU' ? 'Посещение подтверждено' : 'Visit Confirmed'}
                        </h5>
                        <p className="text-[10px] font-medium text-brand-navy/60 leading-normal">
                          <span className="break-words block w-full min-w-0">{lang === 'RU' ? 'Успешное посещение занятия U8 ПН/СР/ПТ! В профиль добавлено 10 XP.' : 'Successful visit to the class U8 MON/WED/FRI! 10 XP added to the profile.'}</span>
                        </p>
                        <span className="text-[8px] font-semibold uppercase tracking-wider text-brand-sunset/50 mt-2 block font-mono">
                          {lang === 'RU' ? 'Только что' : 'Just now'}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (athleteData?.notifications || []).length > 0 ? (
                  (athleteData.notifications).map((notif: any, idx: number) => (
                    <div key={`profile_notif_${notif.id || 'notif'}_${idx}`} className={`p-4 rounded-2xl flex items-start gap-4 border w-full min-w-0 ${
                      notif.type === 'badge' 
                        ? 'bg-brand-teal/5 border-brand-teal/10' 
                        : 'bg-brand-sunset/5 border-brand-sunset/10'
                    }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm mt-1 ${
                        notif.type === 'badge' ? 'bg-brand-teal' : 'bg-brand-sunset'
                      }`}>
                        {notif.type === 'badge' ? <Dribbble className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-black uppercase italic text-brand-navy leading-none mb-1">
                          {notif.title}
                        </h5>
                        <p className="text-[10px] font-medium text-brand-navy/60 leading-normal">
                          <span className="break-words block w-full min-w-0">{notif.message}</span>
                        </p>
                        <span className={`text-[8px] font-semibold uppercase tracking-wider mt-2 block font-mono ${
                          notif.type === 'badge' ? 'text-brand-teal/50' : 'text-brand-sunset/50'
                        }`}>
                          {new Date(notif.createdAt).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <Bell className="w-8 h-8 text-brand-navy/10 mx-auto mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 italic">
                      {lang === 'RU' ? 'Оповещений пока нет' : 'No notification alerts yet'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MasterDashboard({ master, t, registrations = [], allInvitations = [], onNavigate, onSelectAthlete, lang }: any) {
  const pendingRegistrations = registrations.filter((r: any) => !r.status || r.status === 'pending');
  const pendingCount = pendingRegistrations.length;
  const approvedCount = registrations.filter((r: any) => r.status === 'approved').length;

  const checklistTasks = [
    { text: lang === 'RU' ? 'Проверить видеоотчеты (ученики 2 уровня)' : 'Review video reports (Level 2 Students)', done: false },
    { text: lang === 'RU' ? 'Обновить дерево навыков для утренней сессии' : 'Update skill trees for morning session', done: false },
    { 
      text: pendingCount > 0 
        ? (lang === 'RU' ? `Проверить новые регистрации анкет (${pendingCount})` : `Review new athlete registrations (${pendingCount})`) 
        : (lang === 'RU' ? 'Все новые регистрации проверены' : 'All new registrations reviewed'), 
      done: pendingCount === 0,
      action: () => onNavigate?.('master_registrations') 
    }
  ];

  // Dynamic feedback tasks for 12-classes package 10th visit (and any student with 10+ paid confirmed visits)
  const reportTaskPendingRegs = registrations.filter((reg: any) => {
    const studentInvitations = allInvitations.filter((inv: any) => inv.studentId === reg.id && inv.visitConfirmed === true);
    const actualConfirmedVisits = studentInvitations.length;
    const usedPaid = Math.max(Number(reg.usedPaidClasses || 0), actualConfirmedVisits);
    return (reg.reportTaskPending === true || usedPaid >= 10) && reg.reportTaskDeleted !== true;
  });
  
  const pendingFeedbackRegs = reportTaskPendingRegs.filter((reg: any) => {
    const hasSubmittedFeedback = reg.observations?.some((obs: any) => obs.type === 'progress_milestone');
    return !hasSubmittedFeedback;
  });

  reportTaskPendingRegs.forEach((reg: any) => {
    const hasSubmittedFeedback = reg.observations?.some((obs: any) => obs.type === 'progress_milestone');
    checklistTasks.push({
      text: lang === 'RU' 
        ? `Предоставить отзыв премиум-атлету: ${reg.studentName}` 
        : `Provide feedback to premium athlete: ${reg.studentName}`,
      done: !!hasSubmittedFeedback,
      action: () => {
        onSelectAthlete?.(reg);
        localStorage.setItem(`openFeedbackForm_${reg.id}`, 'true');
      }
    });
  });

  // No hardcoded Gabriel Z. task fallback

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-6">
        <div className="w-1.5 h-10 bg-brand-teal rounded-full" />
        <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
          {t.masterWelcome.replace('{name}', master.fullName.split(' ')[0])}
        </h2>
      </div>

      {pendingCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 md:p-8 rounded-[28px] sm:rounded-[40px] bg-gradient-to-r from-brand-sunset/15 to-transparent border border-brand-sunset/30 shadow-2xl relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-sunset/10 flex items-center justify-center text-brand-sunset shrink-0 animate-pulse">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-black italic uppercase text-brand-navy leading-snug">
                {lang === 'RU' ? `Новые спортсмены ожидают проверки (${pendingCount})` : `New Athletes Pending Validation (${pendingCount})`}
              </h4>
              <p className="text-xs font-bold text-brand-navy/60 mt-1">
                {lang === 'RU' 
                  ? 'Пожалуйста, проверьте и утвердите новые анкеты, чтобы их профили были активированы.' 
                  : 'Please review and approve incoming registrations to authorize their athlete profiles.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('master_registrations')}
            className="px-6 py-3 rounded-2xl bg-brand-sunset text-white text-xs font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 self-start md:self-auto cursor-pointer shadow-lg shadow-brand-sunset/20"
          >
            {lang === 'RU' ? 'Проверить сейчас' : 'Verify Now'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {[
          { label: lang === 'RU' ? 'Всего атлетов' : 'Total Athletes', value: String(Math.max(124, approvedCount + 120)), icon: Users, color: 'navy' },
          { label: lang === 'RU' ? 'Сессий сегодня' : 'Today Sessions', value: '4', icon: Clock, color: 'sunset' },
          { label: lang === 'RU' ? 'Ожидают проверки' : 'Pending Validation', value: String(pendingCount), icon: ClipboardList, color: 'teal' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] glass border-white/60 shadow-xl group hover:bg-white transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ${
                stat.color === 'teal' ? 'bg-brand-teal text-white' : 
                stat.color === 'sunset' ? 'bg-brand-sunset text-white' : 'bg-brand-navy text-white'
              }`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <span className="text-4xl font-black italic tracking-tighter text-brand-navy">{stat.value}</span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy/30">{stat.label}</p>
          </Card>
        ))}
      </div>

      {pendingFeedbackRegs.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-6 h-6 text-brand-sunset" />
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-brand-navy/60">
              {lang === 'RU' ? 'Задачи на обратную связь (10 посещений)' : 'Pending Feedback Tasks (10 Visits)'}
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {pendingFeedbackRegs.map((reg: any) => (
              <motion.div 
                key={reg.id}
                whileHover={{ y: -4 }}
                className="p-6 rounded-[28px] bg-white/40 border border-brand-sunset/20 shadow-xl flex flex-col justify-between gap-6"
              >
                <div className="flex items-start gap-4 justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-sunset bg-brand-sunset/10 p-1 px-2.5 rounded-full">
                      {lang === 'RU' ? 'Премиум отчет' : 'Premium Report'}
                    </span>
                    <h4 className="text-xl font-black italic uppercase text-brand-navy tracking-tight mt-2">{reg.studentName}</h4>
                    <p className="text-xs font-bold text-brand-navy/60">
                      {lang === 'RU' 
                        ? `Пакет: ${reg.totalPaidClasses || 12} занятий. Посещено: ${Math.max(Number(reg.usedPaidClasses || 0), allInvitations.filter((inv: any) => inv.studentId === reg.id && inv.visitConfirmed === true).length)}.` 
                        : `Package: ${reg.totalPaidClasses || 12} classes. Attended: ${Math.max(Number(reg.usedPaidClasses || 0), allInvitations.filter((inv: any) => inv.studentId === reg.id && inv.visitConfirmed === true).length)}.`}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-sunset/10 flex items-center justify-center text-brand-sunset shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      onSelectAthlete?.(reg);
                      localStorage.setItem(`openFeedbackForm_${reg.id}`, 'true');
                    }}
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-sunset text-white text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer text-center"
                  >
                    {lang === 'RU' ? 'Написать отзыв' : 'Provide Feedback'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Card className="p-5 sm:p-12 rounded-[28px] sm:rounded-[56px] glass border-white/60 shadow-3xl">
        <h3 className="text-2xl font-black italic uppercase tracking-tight mb-8">
          {lang === 'RU' ? 'Контрольный список тренера' : 'Coach Checklist'}
        </h3>
        <div className="space-y-4">
          {checklistTasks.map((task, idx) => (
            <div 
              key={idx} 
              onClick={() => task.action?.()}
              className={`flex items-center gap-4 p-4 rounded-2xl hover:bg-white/40 transition-colors group ${task.action ? 'cursor-pointer border border-brand-teal/10 hover:border-brand-teal/30 bg-brand-teal/5' : ''}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                task.done 
                  ? 'border-brand-teal bg-brand-teal text-white' 
                  : 'border-brand-teal group-hover:bg-brand-teal/10'
              }`}>
                <CheckCircle2 className={`w-4 h-4 ${task.done ? 'text-white' : 'text-transparent group-hover:text-brand-teal'}`} />
              </div>
              <span className={`text-sm font-bold transition-colors ${
                task.done 
                  ? 'text-brand-navy/30 line-through' 
                  : 'text-brand-navy/60 group-hover:text-brand-navy'
              }`}>
                {task.text}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function MasterRegistrationsView({ t, lang, onSelectAthlete }: any) {
  const [registrations, setRegistrations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'pending' | 'approved' | 'declined' | 'all'>('approved');
  const [selectedCenter, setSelectedCenter] = React.useState<string>('all');

  // Reset selected center when status filter changes
  React.useEffect(() => {
    setSelectedCenter('all');
  }, [filter]);

  React.useEffect(() => {
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRegistrations(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'registrations');
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const regData = registrations.find(r => r.id === id);
      await processRegistrationStatus(id, 'approved', regData);
    } catch (err) {
      console.error("Error approving registration:", err);
    }
  };

  const handleDecline = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const regData = registrations.find(r => r.id === id);
      await processRegistrationStatus(id, 'declined', regData);
    } catch (err) {
      console.error("Error declining registration:", err);
    }
  };

  const approvedStudents = React.useMemo(() => {
    return registrations.filter(r => r.status === 'approved');
  }, [registrations]);

  const activeConfirmedLocs = React.useMemo(() => {
    const locIds = new Set<string>();
    approvedStudents.forEach(r => {
      if (r.studentLocations && Array.isArray(r.studentLocations)) {
        r.studentLocations.forEach((l: string) => locIds.add(l));
      } else if (r.studentLocation) {
        locIds.add(r.studentLocation);
      }
    });
    return LOCATIONS.filter(loc => locIds.has(loc.id));
  }, [approvedStudents]);

  const filtered = registrations.filter(r => {
    const matchesSearch = (r.studentName || '').toLowerCase().includes(search.toLowerCase()) || 
                          (r.parentName || r.parentFullName || '').toLowerCase().includes(search.toLowerCase());
    
    const regStatus = r.status || 'pending';
    let matchesStatus = false;
    if (filter === 'all') {
      matchesStatus = true;
    } else {
      matchesStatus = (regStatus === filter);
    }

    if (!matchesStatus) return false;
    if (!matchesSearch) return false;

    if (filter === 'approved' && selectedCenter !== 'all') {
      if (r.studentLocations && Array.isArray(r.studentLocations)) {
        return r.studentLocations.includes(selectedCenter);
      }
      return r.studentLocation === selectedCenter;
    }

    return true;
  });

  const pendingCount = registrations.filter(r => !r.status || r.status === 'pending').length;
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const declinedCount = registrations.filter(r => r.status === 'declined').length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-navy">
            {lang === 'RU' ? 'Список спортсменов' : lang === 'GE' ? 'ათლეტების სია' : 'Athlete List'}
          </h2>
          <p className="text-xs font-bold text-brand-navy/40 mt-1 uppercase tracking-wider">
            {lang === 'RU' ? 'Управление и валидация профилей учеников' : 'Manage and validate student profiles'}
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/30" />
          <input 
            type="text" 
            placeholder={t.masterSearchStudent}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl glass border-white/60 text-xs font-bold focus:outline-none focus:border-brand-teal text-brand-navy transition-all"
          />
        </div>
      </div>

      {/* Tabs / Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'pending', label: lang === 'RU' ? 'Ожидают проверки' : 'Pending', count: pendingCount },
          { id: 'approved', label: lang === 'RU' ? 'Утвержденные' : 'Approved', count: approvedCount },
          { id: 'declined', label: lang === 'RU' ? 'Отклоненные' : 'Declined', count: declinedCount },
          { id: 'all', label: lang === 'RU' ? 'Все' : 'All', count: registrations.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              filter === tab.id
                ? 'bg-brand-navy text-white shadow-lg'
                : 'bg-white/60 hover:bg-white text-brand-navy/60 border border-black/5'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              filter === tab.id ? 'bg-white/20 text-white' : 'bg-brand-navy/10 text-brand-navy/70'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Centers Filter Tabs for Confirmed Students */}
      {filter === 'approved' && activeConfirmedLocs.length > 0 && (
        <div className="bg-brand-navy/5 p-2 rounded-2xl border border-brand-navy/5 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 px-3 py-1 italic">
            {lang === 'RU' ? 'Центры:' : lang === 'GE' ? 'ცენტრები:' : 'Centers:'}
          </span>
          <button
            onClick={() => setSelectedCenter('all')}
            className={`px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer ${
              selectedCenter === 'all'
                ? 'bg-brand-navy text-white shadow-md scale-[1.02]'
                : 'bg-white/40 hover:bg-white/80 text-brand-navy/70 border border-black/5'
            }`}
          >
            {lang === 'RU' ? 'Все' : lang === 'GE' ? 'ყველა' : 'All'}
          </button>
          {activeConfirmedLocs.map((loc) => {
            const locName = lang === 'RU' ? loc.nameRU : lang === 'GE' ? loc.nameGE : loc.name;
            const locCount = approvedStudents.filter(r => {
              if (r.studentLocations && Array.isArray(r.studentLocations)) {
                return r.studentLocations.includes(loc.id);
              }
              return r.studentLocation === loc.id;
            }).length;
            return (
              <button
                key={loc.id}
                onClick={() => setSelectedCenter(loc.id)}
                className={`px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  selectedCenter === loc.id
                    ? 'bg-brand-navy text-white shadow-md scale-[1.02]'
                    : 'bg-white/40 hover:bg-white/80 text-brand-navy/70 border border-black/5'
                }`}
              >
                <span>{locName}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  selectedCenter === loc.id ? 'bg-white/20 text-white' : 'bg-brand-navy/10 text-brand-navy/70'
                }`}>
                  {locCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Alert Notice inside the section */}
      {pendingCount > 0 && filter === 'pending' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 text-amber-800">
          <Bell className="w-5 h-5 text-amber-600 animate-bounce shrink-0" />
          <p className="text-xs font-bold leading-relaxed">
            {lang === 'RU' 
              ? `Уведомление: ${pendingCount} новых профилей ожидают проверки и утверждения.`
              : `Notification: ${pendingCount} new athlete profiles are waiting for your review and approval.`}
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((reg, idx) => {
            const regStatus = reg.status || 'pending';
            const age = reg.studentAge !== undefined && reg.studentAge !== null 
              ? reg.studentAge 
              : reg.studentBirthDate 
                ? Math.floor((new Date().getTime() - new Date(reg.studentBirthDate).getTime()) / 31557600000)
                : 8;
            const regXp = reg.xp !== undefined ? Number(reg.xp) : (reg.id === 'demo-athlete' || reg.studentName?.toLowerCase().includes('luka') || reg.studentName?.toLowerCase().includes('лук') || reg.studentName?.toLowerCase().includes('ლუკ') || reg.studentName === 'Maxim Ivanov' ? 1300 : 0);
            const studentLevelInfo = getStudentLevelInfo(regXp);

            return (
              <Card 
                key={`${reg.id || 'reg'}_${idx}`} 
                onClick={() => onSelectAthlete?.(reg)}
                className="p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] glass border-white/60 hover:bg-white transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group cursor-pointer hover:border-brand-teal/30 hover:shadow-2xl"
              >
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-brand-teal/10 overflow-hidden flex items-center justify-center border border-brand-teal/20 shrink-0">
                    {reg.studentProfileImage ? (
                      <img src={reg.studentProfileImage} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-6 h-6 text-brand-teal" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black italic uppercase text-lg leading-none text-brand-navy group-hover:text-brand-teal transition-colors truncate">{reg.studentName}</h4>
                      <span className="text-[10px] font-black uppercase text-brand-navy/30 px-2 py-0.5 bg-black/5 rounded-full">{reg.trainingGroup || 'U8'}</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 truncate mt-1">
                      {(() => {
                        const locs = reg.studentLocations && Array.isArray(reg.studentLocations) && reg.studentLocations.length > 0 
                          ? reg.studentLocations 
                          : [reg.studentLocation].filter(Boolean);
                        
                        if (locs.length > 0) {
                          return locs.map((locId: string) => {
                            const matchedLoc = LOCATIONS.find(l => l.id === locId);
                            if (matchedLoc) {
                              return lang === 'RU' ? matchedLoc.nameRU : lang === 'GE' ? matchedLoc.nameGE : matchedLoc.name;
                            }
                            return locId;
                          }).join(', ');
                        }
                        return lang === 'RU' ? 'Локация не указана' : 'No Location';
                      })()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 md:justify-end shrink-0">
                  <div className="text-left md:text-right shrink-0">
                    <p className="text-[10px] font-black uppercase text-brand-navy/20 mb-1">{lang === 'RU' ? 'Родитель' : 'Parent'}</p>
                    <p className="text-xs font-bold text-brand-navy/60">{reg.parentFullName || reg.parentName || 'Unknown'}</p>
                  </div>

                  <div className="text-left md:text-right shrink-0 min-w-[120px]">
                    <p className="text-[10px] font-black uppercase text-brand-navy/20 mb-1">{lang === 'RU' ? 'Возраст / XP Уровень' : 'Age / XP Level'}</p>
                    <p className="text-xs font-bold text-brand-navy/60">
                      {age} {lang === 'RU' ? 'лет' : 'years'}
                    </p>
                    <p className="text-[10px] font-black uppercase text-brand-teal mt-0.5">
                      {studentLevelInfo.tier} — {studentLevelInfo.title.toUpperCase()} ({regXp} XP)
                    </p>
                  </div>

                  <div className="text-left md:text-right shrink-0 min-w-[100px]">
                    <p className="text-[10px] font-black uppercase text-brand-navy/20 mb-1">Status</p>
                    {regStatus === 'approved' ? (
                      <Badge color="teal" className="text-[9px] uppercase italic bg-emerald-500/10 text-emerald-600 border-emerald-500/12 shadow-sm">Approved</Badge>
                    ) : regStatus === 'declined' ? (
                      <Badge color="sunset" className="text-[9px] uppercase italic bg-red-500/10 text-red-600 border-red-500/12 shadow-sm">Declined</Badge>
                    ) : (
                      <Badge color="sunset" className="text-[9px] uppercase italic bg-amber-500/10 text-amber-600 border-amber-500/12 animate-pulse shadow-sm">Pending</Badge>
                    )}
                  </div>

                  {/* Quick Action Validation Buttons */}
                  {regStatus === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleApprove(e, reg.id)}
                        className="h-10 px-4 rounded-xl bg-brand-teal text-white text-xs font-black italic uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-brand-teal/20 flex items-center justify-center cursor-pointer"
                      >
                        {lang === 'RU' ? 'Одобрить' : 'Approve'}
                      </button>
                      <button
                        onClick={(e) => handleDecline(e, reg.id)}
                        className="h-10 px-4 rounded-xl bg-brand-sunset/10 border border-brand-sunset/20 text-brand-sunset text-xs font-black italic uppercase tracking-wider hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer hover:bg-brand-sunset hover:text-white"
                      >
                        {lang === 'RU' ? 'Отклонить' : 'Decline'}
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAthlete?.(reg);
                    }}
                    className="w-12 h-12 rounded-xl border border-black/5 flex items-center justify-center hover:bg-brand-navy hover:text-white transition-all shrink-0"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
            <p className="text-xl font-black italic uppercase text-brand-navy/20">{t.masterNoResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MasterAttendanceView({ t, lang, master }: any) {
  const [events, setEvents] = React.useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = React.useState(true);
  const [selectedEvent, setSelectedEvent] = React.useState<any | null>(null);
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = React.useState(false);
  const [studentsData, setStudentsData] = React.useState<Record<string, any>>({});
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const [warningActiveId, setWarningActiveId] = React.useState<string | null>(null);
  const [warningWord, setWarningWord] = React.useState<string>('');

  const [observationActiveId, setObservationActiveId] = React.useState<string | null>(null);
  const [observationText, setObservationText] = React.useState<string>('');

  const activeEvent = selectedEvent ? events.find(e => e.id === selectedEvent.id) || selectedEvent : null;

  React.useEffect(() => {
    if (warningActiveId) {
      setWarningWord(lang === 'RU' ? 'Отвлекся от упражнения' : 'Stay unfocused from an exercise');
    }
  }, [warningActiveId, lang]);

  React.useEffect(() => {
    if (observationActiveId) {
      setObservationText('');
    }
  }, [observationActiveId]);

  const handleIssueWarning = async (invitation: any, word: string) => {
    if (!activeEvent) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Deduct 1 XP (ensure it doesn't go below 0)
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = Math.max(0, currentXp - 1);

      const penaltyId = `penalty_${Date.now()}`;
      const penaltyRecord = {
        id: penaltyId,
        word: word || (lang === 'RU' ? 'Нарушение дисциплины' : 'Discipline Warning'),
        eventId: activeEvent.id,
        eventName: activeEvent.name,
        date: activeEvent.date,
        timestamp: new Date().toISOString(),
        xpDeducted: 1,
        issuedBy: master?.fullName || 'Coach Roman'
      };

      // 1. Update Student profile (registration)
      const currentPenalties = student.penalties || [];
      const updatedPenalties = [...currentPenalties, penaltyRecord];

      // Add a notification about the discipline penalty
      const newNotifications = [...(student.notifications || [])];
      newNotifications.unshift({
        id: `penalty_${penaltyId}`,
        title: lang === 'RU' ? 'Предупреждение по дисциплине ⚠️' : 'Discipline Warning ⚠️',
        message: lang === 'RU'
          ? `Вынесено предупреждение на занятии "${activeEvent.name}": "${word}". Списано 1 XP.`
          : `Issued a warning during class "${activeEvent.name}": "${word}". 1 XP deducted.`,
        createdAt: new Date().toISOString(),
        type: 'penalty'
      });

      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        penalties: updatedPenalties,
        notifications: newNotifications
      });

      // 2. Update Event profile (event)
      const currentEventPenalties = activeEvent.penalties || [];
      const eventPenaltyRecord = {
        id: penaltyId,
        studentId,
        studentName: invitation.studentName,
        word: word || (lang === 'RU' ? 'Нарушение дисциплины' : 'Discipline Warning'),
        timestamp: new Date().toISOString(),
        xpDeducted: 1,
        issuedBy: master?.fullName || 'Coach Roman',
        masterName: master?.fullName || 'Coach Roman'
      };
      await updateDoc(doc(db, 'events', activeEvent.id), {
        penalties: [...currentEventPenalties, eventPenaltyRecord]
      });

      setFeedback(lang === 'RU'
        ? `Предупреждение вынесено для ${invitation.studentName}! -1 XP.`
        : `Discipline warning issued for ${invitation.studentName}! -1 XP.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error issuing discipline warning:", err);
    } finally {
      setUpdatingId(null);
      setWarningActiveId(null);
    }
  };

  const handleRemoveWarning = async (invitation: any, penaltyId: string) => {
    if (!activeEvent) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found");
      }

      const currentPenalties = student.penalties || [];
      const penaltyToRemove = currentPenalties.find((p: any) => p.id === penaltyId);
      if (!penaltyToRemove) return;

      const updatedPenalties = currentPenalties.filter((p: any) => p.id !== penaltyId);

      // Refund 1 XP
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = currentXp + 1;

      // Filter notifications
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter((n: any) => n.id !== `penalty_${penaltyId}`);

      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        penalties: updatedPenalties,
        notifications: updatedNotifications
      });

      // Remove from Event profile
      const currentEventPenalties = activeEvent.penalties || [];
      const updatedEventPenalties = currentEventPenalties.filter((p: any) => p.id !== penaltyId);
      await updateDoc(doc(db, 'events', activeEvent.id), {
        penalties: updatedEventPenalties
      });

      setFeedback(lang === 'RU'
        ? `Предупреждение удалено. 1 XP возвращено.`
        : `Warning removed. 1 XP refunded.`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error removing warning:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleIssueObservation = async (invitation: any, text: string) => {
    if (!activeEvent) return;
    if (!text.trim()) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      const observationId = `obs_${Date.now()}`;
      const observationRecord = {
        id: observationId,
        text: text,
        eventId: activeEvent.id,
        eventName: activeEvent.name,
        date: activeEvent.date,
        timestamp: new Date().toISOString(),
        issuedBy: master?.fullName || 'Coach Roman'
      };

      // 1. Update Student profile (registration)
      const currentObservations = student.observations || [];
      const updatedObservations = [...currentObservations, observationRecord];

      // Add a notification about the observation
      const newNotifications = [...(student.notifications || [])];
      newNotifications.unshift({
        id: `obs_${observationId}`,
        title: lang === 'RU' ? 'Заметка тренера 📝' : 'Trainer Note 📝',
        message: lang === 'RU'
          ? `Добавлена новая заметка тренера на занятии "${activeEvent.name}": "${text}".`
          : `New trainer note added during class "${activeEvent.name}": "${text}".`,
        createdAt: new Date().toISOString(),
        type: 'badge'
      });

      await updateDoc(doc(db, 'registrations', studentId), {
        observations: updatedObservations,
        notifications: newNotifications
      });

      // 2. Update Event profile (event)
      const currentEventObservations = activeEvent.observations || [];
      const eventObservationRecord = {
        id: observationId,
        studentId,
        studentName: invitation.studentName,
        text: text,
        timestamp: new Date().toISOString(),
        issuedBy: master?.fullName || 'Coach Roman',
        masterName: master?.fullName || 'Coach Roman'
      };
      await updateDoc(doc(db, 'events', activeEvent.id), {
        observations: [...currentEventObservations, eventObservationRecord]
      });

      setFeedback(lang === 'RU'
        ? `Заметка сохранена для ${invitation.studentName}!`
        : `Trainer note saved for ${invitation.studentName}!`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error issuing trainer note:", err);
    } finally {
      setUpdatingId(null);
      setObservationActiveId(null);
    }
  };

  const handleRemoveObservation = async (invitation: any, observationId: string) => {
    if (!activeEvent) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found");
      }

      const currentObservations = student.observations || [];
      const updatedObservations = currentObservations.filter((o: any) => o.id !== observationId);

      // Filter notifications
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter((n: any) => n.id !== `obs_${observationId}`);

      await updateDoc(doc(db, 'registrations', studentId), {
        observations: updatedObservations,
        notifications: updatedNotifications
      });

      // Remove from Event profile
      const currentEventObservations = activeEvent.observations || [];
      const updatedEventObservations = currentEventObservations.filter((o: any) => o.id !== observationId);
      await updateDoc(doc(db, 'events', activeEvent.id), {
        observations: updatedEventObservations
      });

      setFeedback(lang === 'RU'
        ? `Заметка удалена.`
        : `Trainer note removed.`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error removing trainer note:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 1. Fetch all training sessions (events)
  React.useEffect(() => {
    const q = query(
      collection(db, 'events'),
      orderBy('date', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingEvents(false);
    }, (error) => {
      console.error("Error loading events for attendance:", error);
      setLoadingEvents(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. When an event is selected, listen to all invitations for this event, and listen to registration profiles in real-time
  React.useEffect(() => {
    if (!selectedEvent) {
      setInvitations([]);
      return;
    }

    setLoadingInvitations(true);
    const q = query(
      collection(db, 'invitations'),
      where('eventId', '==', selectedEvent.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const invList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvitations(invList);
      setLoadingInvitations(false);
    }, (err) => {
      console.error("Error listening to invitations:", err);
      setLoadingInvitations(false);
    });

    // Listen to registrations in real-time so changes immediately propagate
    const qStudents = query(collection(db, 'registrations'), limit(200));
    const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
      const studentMap: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        studentMap[doc.id] = { id: doc.id, ...doc.data() };
      });
      setStudentsData(studentMap);
    }, (err) => {
      console.error("Error listening to registrations:", err);
    });

    return () => {
      unsubscribe();
      unsubscribeStudents();
    };
  }, [selectedEvent]);

  // 3. Confirm Visit / Award +10 XP
  const handleConfirmVisitAttendance = async (invitation: any) => {
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Check if this student has any other confirmed visits (to see if this is the first class)
      const qConfirmed = query(
        collection(db, 'invitations'),
        where('studentId', '==', studentId)
      );
      const confirmedSnap = await getDocs(qConfirmed);
      const confirmedDocs = confirmedSnap.docs.filter((d: any) => d.data().visitConfirmed === true);
      const isFirstVisit = confirmedDocs.length === 0;

      // Calculate new XP
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = currentXp + 10;

      // Awards badge if first visit
      const firstClassBadge = {
        id: 'first_step',
        title: 'First Step / Первый шаг',
        titleRU: 'Первый шаг',
        titleEN: 'First Step',
        titleGE: 'პირველი ნაბიჯი',
        titleTR: 'İlk Adım',
        desc: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach. / Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
        descRU: 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
        descEN: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
        descGE: 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.',
        descTR: 'İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.',
        icon: 'Target',
        date: new Date().toLocaleDateString(lang === 'RU' ? 'ru' : 'en', { month: 'short', year: 'numeric' })
      };

      const currentBadges = student.badges || [];
      const hasBadge = currentBadges.some((b: any) => b.id === 'first_step');
      const updatedBadges = isFirstVisit && !hasBadge ? [...currentBadges, firstClassBadge] : currentBadges;

      // Track notifications
      const newNotifications = [...(student.notifications || [])];
      
      // 1. Visit plus 10 xp notification
      newNotifications.unshift({
        id: `visit_${invitation.id}_xp`,
        title: lang === 'RU' ? 'Посещение подтверждено' : 'Visit Confirmed',
        message: lang === 'RU'
          ? `Успешное посещение занятия "${selectedEvent?.name || invitation.name || 'Тренировка'}"! В профиль добавлено 10 XP.`
          : `Successful visit to the class "${selectedEvent?.name || invitation.name || 'Training'}"! 10 XP added to the profile.`,
        createdAt: new Date().toISOString(),
        type: 'xp'
      });

      // 2. Badge notification if it's the first visit
      if (isFirstVisit) {
        newNotifications.unshift({
          id: `visit_${invitation.id}_badge`,
          title: lang === 'RU' ? 'Награда «Первый шаг»' : lang === 'GE' ? 'ჯილდო «პირველი ნაბიჯი»' : '«First Step» Badge Awarded',
          message: lang === 'RU'
            ? 'Получена награда за первое посещение тренировки! Разблокирован значок «Первый шаг».'
            : lang === 'GE'
            ? 'პირველი ვარჯიშის წარმატებით გავლისთვის მიიღეთ ჯილდო «პირველი ნაბიჯი»!'
            : 'First visit confirmed! You have unlocked the «First Step» badge.',
          createdAt: new Date().toISOString(),
          type: 'badge'
        });
      }

      const currentUsed = student.usedPaidClasses !== undefined ? Number(student.usedPaidClasses) : 0;
      const newUsed = currentUsed + 1;

      const triggerReportTask = newUsed >= 10;

      // Update student profile with new XP, badges, and notifications
      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        badges: updatedBadges,
        notifications: newNotifications,
        usedPaidClasses: newUsed,
        ...(triggerReportTask ? { reportTaskPending: true } : {})
      });

      // Update invitation to mark visit confirmed
      await updateDoc(doc(db, 'invitations', invitation.id), {
        visitConfirmed: true,
        attended: true
      });

      // Simple level calculation for feedback toast
      const oldLevel = getStudentLevelInfo(currentXp);
      const newLevel = getStudentLevelInfo(newXp);
      
      let levelUpMsg = "";
      if (oldLevel.title !== newLevel.title) {
        levelUpMsg = lang === 'RU' 
          ? ` 🎉 Уровень повышен до ${newLevel.title.toUpperCase()}!` 
          : ` 🎉 Level up to ${newLevel.title.toUpperCase()}!`;
      }

      setFeedback(lang === 'RU'
        ? `Визит подтвержден для ${invitation.studentName}! +10 XP начислено.${levelUpMsg}`
        : `Visit confirmed for ${invitation.studentName}! +10 XP awarded.${levelUpMsg}`
      );

      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error confirming training visit:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Undo Confirm Visit / Remove -10 XP
  const handleUndoConfirmVisit = async (invitation: any) => {
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Query to see if there are other confirmed classes remaining
      const qConfirmed = query(
        collection(db, 'invitations'),
        where('studentId', '==', studentId)
      );
      const confirmedSnap = await getDocs(qConfirmed);
      const otherConfirmedCount = confirmedSnap.docs.filter((d: any) => d.data().visitConfirmed === true && d.id !== invitation.id).length;

      // Calculate new XP (cannot drop below 0)
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = Math.max(0, currentXp - 10);

      // Clean notifications related to this invitation ID
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter(
        (n: any) => !n.id.startsWith(`visit_${invitation.id}`)
      );

      const currentBadges = student.badges || [];
      const updatedBadges = otherConfirmedCount === 0 
        ? currentBadges.filter((b: any) => b.id !== 'first_step') 
        : currentBadges;

      const currentUsed = student.usedPaidClasses !== undefined ? Number(student.usedPaidClasses) : 0;
      const newUsed = Math.max(0, currentUsed - 1);

      // Update student profile with subtracted XP and cleaned badges/notifications
      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        badges: updatedBadges,
        notifications: updatedNotifications,
        usedPaidClasses: newUsed
      });

      // Update invitation to remove visit confirmation
      await updateDoc(doc(db, 'invitations', invitation.id), {
        visitConfirmed: false,
        attended: false
      });

      setFeedback(lang === 'RU'
        ? `Подтверждение отозвано для ${invitation.studentName}. -10 XP списано.`
        : `Visit confirmation withdrawn for ${invitation.studentName}. -10 XP removed.`
      );

      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error undoing training visit:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const LOCATIONS = [
    { id: 'airport_runway', label: t.locAirport },
    { id: 'metro_mall', label: t.locMetroMall },
    { id: 'agmashenebeli', label: t.locAgmashenebeli },
    { id: 'pirosmani_5', label: t.locPirosmani5 },
    { id: 'kaczynski_5', label: t.locKaczynski5 },
    { id: 'batumi_boulevard', label: t.locBatumiBoulevard },
  ];

  const getFullLoc = (id: string) => LOCATIONS.find(l => l.id === id)?.label || id;

  if (selectedEvent) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        {/* Back button and header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 font-sans">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSelectedEvent(null)}
              className="w-14 h-14 rounded-2xl border border-brand-navy/10 flex items-center justify-center text-brand-navy/60 hover:text-brand-navy hover:bg-black/5 transition-all"
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase text-brand-teal tracking-[0.2em] italic mb-1 block">
                {lang === 'RU' ? 'ПОДТВЕРЖДЕНИЕ ПОСЕЩАЕМОСТИ' : 'ATTENDANCE MANAGEMENT'}
              </span>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy leading-none">
                {selectedEvent.name}
              </h2>
            </div>
          </div>
          <div className="p-4 px-6 bg-brand-navy text-white rounded-3xl text-right shrink-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
              {lang === 'RU' ? 'ВРЕМЯ И МЕСТО' : 'TIME & LOCATION'}
            </p>
            <p className="text-xs font-bold leading-none">
              {selectedEvent.date} @ {selectedEvent.startTime}
            </p>
            <p className="text-[10px] font-bold text-brand-teal uppercase mt-1 tracking-wider">
               {getFullLoc(selectedEvent.location)}
            </p>
          </div>
        </div>

        {/* Feedback notification toast */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-6 rounded-3xl bg-brand-teal text-white shadow-teal font-black italic uppercase tracking-wider text-xs flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span>{feedback}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invitees List */}
        <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[56px] glass border-white/60 shadow-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tight text-brand-navy">
              {lang === 'RU' ? 'СПИСОК СТУДЕНТОВ СЕССИИ' : 'SESSION ROSTER'} ({invitations.length})
            </h3>
          </div>

          {loadingInvitations ? (
            <div className="flex justify-center p-20">
              <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
            </div>
          ) : invitations.length > 0 ? (
            <div className="grid gap-6">
              {invitations.map((inv, idx) => {
                const s = studentsData[inv.studentId];
                const studentXp = s ? (s.xp !== undefined ? Number(s.xp) : (s.studentName === 'Luka' ? 1250 : 0)) : 0;
                // Calculate confirmed visits dynamically from all invitations
                const confirmedVisitsCount = invitations.filter(i => i.studentId === inv.studentId && i.visitConfirmed).length;
                console.log(`Debug XP/Balance for ${inv.studentName}:`, { s, studentXp, studentId: inv.studentId, usedPaidClasses: s?.usedPaidClasses, confirmedVisitsCount, totalPaidClasses: s?.totalPaidClasses });
                const studentLevel = getStudentLevelInfo(studentXp);
                const isConfirmed = !!inv.visitConfirmed;

                return (
                  <div
                    key={`${inv.id || 'inv'}_${idx}`}
                    className="p-6 rounded-[32px] bg-white/40 border border-white/50 flex flex-col gap-6 group hover:bg-white transition-all shadow-md text-left animate-fade-in"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-6 justify-between w-full">
                      <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md shrink-0">
                          <img
                            src={s?.studentProfileImage || MOCK_STUDENT.avatar}
                            className="w-full h-full object-cover"
                            alt={inv.studentName}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xl font-black italic uppercase text-brand-navy tracking-tight leading-none mb-1">
                            {inv.studentName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-brand-navy/40">
                            <span className="text-[10px] font-black uppercase text-brand-teal italic tracking-widest">
                              {studentLevel.tier} — {studentLevel.title.toUpperCase()}
                            </span>
                            <span>•</span>
                            <span className="italic">{studentXp} XP</span>
                            {s && s.totalPaidClasses !== undefined && s.totalPaidClasses > 0 && (() => {
                              const usedPaid = Math.max(0, confirmedVisitsCount - 1);
                              const remainingPaid = Math.max(0, s.totalPaidClasses - usedPaid);
                              return (
                                <>
                                  <span>•</span>
                                  <span className={`text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-lg font-black uppercase italic ${remainingPaid <= 2 ? 'bg-brand-sunset/15 text-brand-sunset' : ''}`}>
                                    {lang === 'RU' ? `Осталось: ${remainingPaid}/${s.totalPaidClasses} зан.` : `Paid left: ${remainingPaid}/${s.totalPaidClasses}`}
                                  </span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                        <button
                          type="button"
                          disabled={updatingId === inv.id}
                          onClick={() => setObservationActiveId(observationActiveId === inv.id ? null : inv.id)}
                          className={`p-3 px-4 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center gap-2 border ${
                            observationActiveId === inv.id
                              ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 hover:text-indigo-700 border-indigo-500/20'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          {lang === 'RU' ? 'ЗАМЕТКА' : 'NOTEPAD'}
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === inv.id}
                          onClick={() => setWarningActiveId(warningActiveId === inv.id ? null : inv.id)}
                          className={`p-3 px-4 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center gap-2 border ${
                            warningActiveId === inv.id
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 border-amber-500/20'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {lang === 'RU' ? 'ДИСЦИПЛИНА' : 'DISCIPLINE'}
                        </button>

                        {isConfirmed ? (
                          <div className="flex items-center gap-3">
                            <button
                              disabled={updatingId === inv.id}
                              onClick={() => handleUndoConfirmVisit(inv)}
                              className="bg-brand-teal/10 hover:bg-red-50 text-brand-teal hover:text-red-500 border border-brand-teal/20 hover:border-red-100 p-3 px-5 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center gap-2"
                              title={lang === 'RU' ? 'Отозвать подтверждение' : 'Withdraw Confirmation'}
                            >
                              <span className="w-2 h-2 rounded-full bg-brand-teal" />
                              {lang === 'RU' ? 'ПОДТВЕРЖДЕНО ✔ (+10 XP)' : 'VISIT CONFIRMED ✔ (+10 XP)'}
                            </button>
                          </div>
                        ) : (
                          <Button
                            disabled={updatingId === inv.id}
                            onClick={() => handleConfirmVisitAttendance(inv)}
                            className="h-12 px-6 !rounded-2xl text-[10px] bg-brand-sunset text-white hover:bg-brand-navy font-black italic uppercase tracking-widest shadow-sunset border-none"
                          >
                            {updatingId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              lang === 'RU' ? 'ПОДТВЕРДИТЬ ПОСЕЩЕНИЕ (+10 XP)' : 'CONFIRM VISIT (+10 XP)'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Expandable Discipline Area */}
                    {warningActiveId === inv.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-brand-navy/5 pt-5 space-y-5"
                      >
                        {/* Warning Word Input and Submit */}
                        <div className="bg-amber-500/[0.03] p-5 rounded-3xl border border-amber-500/10 space-y-4">
                          <p className="text-[10px] font-black uppercase text-amber-600 italic tracking-wider">
                            {lang === 'RU' ? 'ВЫНЕСТИ ПРЕДУПРЕЖДЕНИЕ (Списание 1 XP)' : 'ISSUE NEW DISCIPLINE WARNING (Deducts 1 XP)'}
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                              type="text"
                              value={warningWord}
                              onChange={(e) => setWarningWord(e.target.value)}
                              placeholder={lang === 'RU' ? 'Введите причину или слово предупреждения...' : 'Enter warning reason or word...'}
                              className="w-full bg-white border border-brand-navy/10 rounded-xl h-11 px-4 text-xs font-black italic text-brand-navy placeholder:text-brand-navy/20 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40"
                            />
                            <Button
                              onClick={() => handleIssueWarning(inv, warningWord)}
                              className="h-11 px-5 w-full sm:w-auto shrink-0 bg-amber-500 text-white hover:bg-amber-600 font-black italic uppercase text-[10px] tracking-widest border-none rounded-xl"
                            >
                              {lang === 'RU' ? 'ВЫНЕСТИ (-1 XP)' : 'WARN STUDENT (-1 XP)'}
                            </Button>
                          </div>

                          {/* Quick Chips Preset */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {[
                              lang === 'RU' ? 'Отвлеклась/Отвлекся от упражнения' : 'Stay unfocused from an exercise',
                              lang === 'RU' ? 'Нарушение дисциплины' : 'Misbehaving',
                              lang === 'RU' ? 'Не слушает тренера' : 'Not listening to instructions',
                              lang === 'RU' ? 'Не выполняет задание' : 'Not following exercise instructions',
                              lang === 'RU' ? 'Опоздание на тренировку' : 'Being late'
                            ].map((preset, pIdx) => (
                              <button
                                type="button"
                                key={pIdx}
                                onClick={() => setWarningWord(preset)}
                                className="px-3 py-1.5 rounded-full border border-brand-navy/5 bg-white text-[9px] font-black uppercase italic text-brand-navy/60 hover:bg-amber-500/10 hover:text-amber-700 transition-all cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Existing Penalties for this student in this event */}
                        {(() => {
                          const studentPenalties = (s?.penalties || []).filter((p: any) => p.eventId === activeEvent?.id);
                          if (studentPenalties.length > 0) {
                            return (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-brand-navy/40 italic tracking-wider">
                                  {lang === 'RU' ? 'УЖЕ ВЫНЕСЕННЫЕ ПРЕДУПРЕЖДЕНИЯ НА ЭТОЙ ТРЕНИРОВКЕ' : 'ISSUED WARNINGS IN THIS CLASS'}
                                </p>
                                <div className="grid gap-2">
                                  {studentPenalties.map((pen: any, penIdx: number) => (
                                    <div
                                      key={`${pen.id || penIdx}`}
                                      className="p-3.5 rounded-xl bg-white border border-brand-navy/5 flex items-center justify-between text-xs"
                                    >
                                      <div className="flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                        <div>
                                          <span className="font-black text-brand-navy">"{pen.word}"</span>
                                          <span className="text-[10px] text-brand-navy/40 ml-2">
                                            {new Date(pen.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru' : 'en', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveWarning(inv, pen.id)}
                                        className="text-[9px] font-black text-red-500 hover:text-red-700 hover:underline uppercase italic tracking-wider px-2 py-1 rounded bg-red-50"
                                      >
                                        {lang === 'RU' ? 'ОТМЕНИТЬ ПРЕДУПРЕЖДЕНИЕ (+1 XP)' : 'UNDO WARNING'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </motion.div>
                    )}

                    {/* Expandable Notepad Area */}
                    {observationActiveId === inv.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-brand-navy/5 pt-5 space-y-5"
                      >
                        <div className="bg-indigo-500/[0.03] p-5 rounded-3xl border border-indigo-500/10 space-y-4">
                          <p className="text-[10px] font-black uppercase text-indigo-600 italic tracking-wider">
                            {lang === 'RU' ? 'НОВАЯ ЗАМЕТКА ТРЕНЕРА (БЕЗ ШТРАФА XP)' : 'ADD BEHAVIORAL OBSERVATION (NO XP DEDUCTION)'}
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-3 text-left">
                            <input
                              type="text"
                              value={observationText}
                              onChange={(e) => setObservationText(e.target.value)}
                              placeholder={lang === 'RU' ? 'Введите наблюдение или заметку о поведении...' : 'Enter behavioral observation or note...'}
                              className="w-full bg-white border border-brand-navy/10 rounded-xl h-11 px-4 text-xs font-black italic text-brand-navy placeholder:text-brand-navy/20 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                            />
                            <Button
                              onClick={() => handleIssueObservation(inv, observationText)}
                              className="h-11 px-5 w-full sm:w-auto shrink-0 bg-indigo-500 text-white hover:bg-indigo-600 font-black italic uppercase text-[10px] tracking-widest border-none rounded-xl"
                            >
                              {lang === 'RU' ? 'СОХРАНИТЬ' : 'SAVE NOTE'}
                            </Button>
                          </div>

                          {/* Quick Chips Preset for non-penalty behavior */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {[
                              lang === 'RU' ? 'Проявляет отличные лидерские качества' : 'Shows great leadership qualities',
                              lang === 'RU' ? 'Очень старается на тренировке' : 'Trying very hard during training',
                              lang === 'RU' ? 'Помогает другим спортсменам' : 'Helps other athletes',
                              lang === 'RU' ? 'Отличный прогресс в технике' : 'Excellent progress in technique',
                              lang === 'RU' ? 'Внимательно слушает тренера' : 'Listens attentively to instructions'
                            ].map((preset, pIdx) => (
                              <button
                                type="button"
                                key={pIdx}
                                onClick={() => setObservationText(preset)}
                                className="px-3 py-1.5 rounded-full border border-brand-navy/5 bg-white text-[9px] font-black uppercase italic text-brand-navy/60 hover:bg-indigo-500/10 hover:text-indigo-700 transition-all cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Existing Observations for this student in this event */}
                        {(() => {
                          const studentObs = (s?.observations || []).filter((o: any) => o.eventId === activeEvent?.id);
                          if (studentObs.length > 0) {
                            return (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-indigo-600/60 italic tracking-wider text-left">
                                  {lang === 'RU' ? 'СОХРАНЕННЫЕ ЗАМЕТКИ НА ЭТОЙ ТРЕНИРОВКЕ' : 'SAVED OBSERVATIONS IN THIS CLASS'}
                                </p>
                                <div className="grid gap-2 text-left">
                                  {studentObs.map((obs: any, obsIdx: number) => (
                                    <div
                                      key={`${obs.id || obsIdx}`}
                                      className="p-3.5 rounded-xl bg-white border border-indigo-500/10 flex items-center justify-between text-xs text-left"
                                    >
                                      <div className="flex items-center gap-3 text-left">
                                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                        <div className="text-left">
                                          <span className="font-black text-brand-navy">"{obs.text}"</span>
                                          <span className="text-[10px] text-brand-navy/40 ml-2">
                                            {new Date(obs.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru' : 'en', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveObservation(inv, obs.id)}
                                        className="text-[9px] font-black text-red-500 hover:text-red-700 hover:underline uppercase italic tracking-wider px-2 py-1 rounded bg-red-50"
                                      >
                                        {lang === 'RU' ? 'УДАЛИТЬ' : 'DELETE'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
              <p className="text-lg font-black italic uppercase text-brand-navy/10 leading-relaxed max-w-sm mx-auto">
                {lang === 'RU' 
                  ? 'ДЛЯ ЭТОГО ЗАНЯТИЯ ЕЩЕ НЕТ ПРИГЛАШЕНИЙ. ОТПРАВЬТЕ ПРИГЛАШЕНИЯ ИЗ ВКЛАДКИ РАСПИСАНИЕ!'
                  : 'NO STUDENTS INVITED TO THIS TRIAL OR CLASS YET. INVITATIONS CAN BE SENT VIA THE SCHEDULE TAB.'}
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-navy leading-none mb-2">
            {t.masterMenuAttendance}
          </h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 italic">
            {lang === 'RU' ? 'ВЫБЕРИТЕ ЗАНЯТИЕ ДЛЯ ПОДТВЕРЖДЕНИЯ ВИЗИТОВ' : 'SELECT A TRAINING MODULE TO MANAGE VISITS'}
          </p>
        </div>
      </div>

      {loadingEvents ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid gap-6">
          {events.map((event, idx) => {
            const eventDate = new Date(event.date);
            return (
              <Card
                key={`${event.id || 'event'}_${idx}`}
                onClick={() => setSelectedEvent(event)}
                className="p-4 sm:p-8 rounded-[28px] sm:rounded-[48px] glass border-white/60 hover:bg-white transition-all shadow-xl flex flex-col md:flex-row md:items-center gap-4 sm:gap-8 justify-between cursor-pointer group hover:border-brand-teal/30 hover:shadow-2xl animate-fade-in"
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-6 flex-1 min-w-0 w-full text-center sm:text-left">
                  <div className="w-20 h-20 rounded-[28px] bg-brand-teal text-white flex flex-col items-center justify-center shrink-0 shadow-lg rotate-2 group-hover:rotate-0 transition-transform">
                    <span className="text-[9px] uppercase font-black leading-none opacity-60 mb-1">
                      {eventDate.toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'short' }).toUpperCase()}
                    </span>
                    <span className="text-3xl font-black leading-none italic tracking-tighter">
                      {eventDate.getDate()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-2xl font-black italic uppercase text-brand-navy tracking-tight leading-none mb-3 group-hover:text-brand-teal transition-colors truncate">
                      {event.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-6 text-brand-navy/40">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                        <Clock className="w-4 h-4 text-brand-teal" />
                        <span>{event.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                        <MapPin className="w-4 h-4 text-brand-teal" />
                        <span>{getFullLoc(event.location)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest italic text-brand-teal group-hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                    {lang === 'RU' ? 'ОТКРЫТЬ СПИСОК' : 'MANAGE ATTENDANCE'}
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
          <p className="text-xl font-black italic uppercase text-brand-navy/20">
            {lang === 'RU' ? 'ЗАНЯТИЙ НЕ НАЙДЕНО' : 'NO TRAINING SESSIONS FOUND'}
          </p>
        </div>
      )}
    </div>
  );
}

function MasterScheduleView({ master, lang, t }: any) {
  const sanitizeFirestoreData = (data: any): any => {
    if (data === undefined) return null;
    if (data === null) return null;
    if (Array.isArray(data)) {
      return data.map(sanitizeFirestoreData);
    }
    if (typeof data === 'object') {
      const res: any = {};
      for (const key of Object.keys(data)) {
        if (data[key] !== undefined) {
          res[key] = sanitizeFirestoreData(data[key]);
        }
      }
      return res;
    }
    return data;
  };

  const [events, setEvents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [showInviteModal, setShowInviteModal] = React.useState<any>(null); // Stores the event object
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [notification, setNotification] = React.useState<string | null>(null);
  const [editingEvent, setEditingEvent] = React.useState<any | null>(null);

  // States for selecting students and recommending AI Home Tasks directly inside Event Create/Edit form
  const [allStudents, setAllStudents] = React.useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [loadingStudents, setLoadingStudents] = React.useState(true);
  const [studentSearch, setStudentSearch] = React.useState('');
  const [recommendedHomeTask, setRecommendedHomeTask] = React.useState<any | null>(null);

  // States for event templates
  const [saveAsTemplate, setSaveAsTemplate] = React.useState(false);
  const [templates, setTemplates] = React.useState<any[]>([]);

  // Load custom templates for MasterScheduleView
  React.useEffect(() => {
    const qTpl = query(
      collection(db, 'event_templates'),
      limit(50)
    );
    const unsubscribeTpl = onSnapshot(qTpl, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      items.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt || 0).getTime();
        return timeB - timeA;
      });
      setTemplates(items);
    }, (error) => {
      console.error("Error loading event templates:", error);
    });
    return () => unsubscribeTpl();
  }, []);

  // Load student registration records for MasterScheduleView
  React.useEffect(() => {
    const q = query(collection(db, 'registrations'), limit(150));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      setAllStudents(list);
      setLoadingStudents(false);
    }, (error) => {
      console.error("Error loading students in master scheduler:", error);
      setLoadingStudents(false);
    });
    return () => unsubscribe();
  }, []);

  const skipSyncRef = React.useRef(false);

  // Sync selected athletes list when editingEvent is initialized or updated
  React.useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    
    if (!editingEvent) {
      setSelectedStudentIds([]);
      setRecommendedHomeTask(null);
      return;
    }
    
    setRecommendedHomeTask(editingEvent.homeTask || null);

    const q = query(
      collection(db, 'invitations'),
      where('eventId', '==', editingEvent.id)
    );
    getDocs(q).then((snap) => {
      const ids = snap.docs.map(d => d.data().studentId);
      setSelectedStudentIds(ids);
    }).catch((err) => {
      console.error("Error fetching invitations for edit form:", err);
    });
  }, [editingEvent]);

  // Drills collection selection support
  const [exercises, setExercises] = React.useState<any[]>([]);
  React.useEffect(() => {
    const qEx = query(collection(db, 'exercises'));
    const unsubscribeEx = onSnapshot(qEx, (snapshot) => {
      const fbList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeFb = fbList.filter(item => !(item as any).isDeleted);
      const fbIds = new Set(activeFb.map(item => item.id));
      const defaults = getLocalizedDefaults(lang);
      const remainingDefaults = defaults.filter(def => !fbIds.has(def.id));
      
      const combined = [...activeFb, ...remainingDefaults];
      const seen = new Set();
      const uniqueList = combined.filter(item => {
        if (!item.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });
      setExercises(uniqueList);
    }, (error) => {
      console.error("Error loading exercises for list picker:", error);
      setExercises(getLocalizedDefaults(lang));
      handleFirestoreError(error, OperationType.LIST, 'exercises');
    });
    return () => unsubscribeEx();
  }, [lang]);

  // Agenda Builder state
  const [useAgendaBuilder, setUseAgendaBuilder] = React.useState(true);
  const [showPhaseCards, setShowPhaseCards] = React.useState<number | null>(null);
  const [deckFilterGroup, setDeckFilterGroup] = React.useState('All');
  const [draggedItem, setDraggedItem] = React.useState<{ phaseId: number; index: number } | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<{ phaseId: number; index: number } | null>(null);
  
  // Phase Selected Items (representing sequence of exercise instances added to each phase)
  // Each exercise item in the array has: { id, instanceId, name, duration, description }
  const [p1Selected, setP1Selected] = React.useState<any[]>([]);
  const [p2Selected, setP2Selected] = React.useState<any[]>([]);
  const [p3Selected, setP3Selected] = React.useState<any[]>([]);
  const [p4Selected, setP4Selected] = React.useState<any[]>([]);

  const initializeDefaultAgenda = () => {
    const list = getLocalizedDefaults(lang);
    
    // Find matching defaults based on original defaults template ID
    const defMeditation = list.find(ex => ex.id === 'def_meditation_1') || list[0];
    const defJogging = list.find(ex => ex.id === 'def_jogging_1') || list[1];
    const defDiag = list.find(ex => ex.id === 'def_diagnostics') || list[4];
    const defVengerkas = list.find(ex => ex.id === 'def_vengerkas') || list[5];
    const defGladiator = list.find(ex => ex.id === 'def_1v1_gladiator') || list[7];
    const defGameTime = list.find(ex => ex.id === 'def_gametime') || list[list.length - 2];
    const defEndMeditation = list.find(ex => ex.id === 'def_end_meditation') || list[list.length - 1];

    setP1Selected([
      { ...defMeditation, instanceId: `init_p1_${Math.random()}` },
      { ...defJogging, instanceId: `init_p1_${Math.random()}` }
    ]);
    setP2Selected([
      { ...defDiag, instanceId: `init_p2_${Math.random()}` }
    ]);
    setP3Selected([
      { ...defVengerkas, instanceId: `init_p3_${Math.random()}` },
      { ...defGladiator, instanceId: `init_p3_${Math.random()}` }
    ]);
    setP4Selected([
      { ...defGameTime, instanceId: `init_p4_${Math.random()}` },
      { ...defEndMeditation, instanceId: `init_p4_${Math.random()}` }
    ]);
  };

  const handleAddExerciseToPhase = (phaseId: number, exTemplateId: string) => {
    if (!exTemplateId) return;
    const original = exercises.find(ex => ex.id === exTemplateId);
    if (!original) return;
    const newInstance = {
      ...original,
      instanceId: `${original.id}_${Date.now()}_${Math.random()}`
    };
    if (phaseId === 1) setP1Selected([...p1Selected, newInstance]);
    else if (phaseId === 2) setP2Selected([...p2Selected, newInstance]);
    else if (phaseId === 3) setP3Selected([...p3Selected, newInstance]);
    else if (phaseId === 4) setP4Selected([...p4Selected, newInstance]);
  };

  const handleDurationChange = (phaseId: number, instanceId: string, duration: number) => {
    const updateList = (list: any[]) => list.map(item => item.instanceId === instanceId ? { ...item, duration } : item);
    if (phaseId === 1) setP1Selected(updateList(p1Selected));
    else if (phaseId === 2) setP2Selected(updateList(p2Selected));
    else if (phaseId === 3) setP3Selected(updateList(p3Selected));
    else if (phaseId === 4) setP4Selected(updateList(p4Selected));
  };

  const handleRemoveExercise = (phaseId: number, instanceId: string) => {
    if (phaseId === 1) setP1Selected(p1Selected.filter(item => item.instanceId !== instanceId));
    else if (phaseId === 2) setP2Selected(p2Selected.filter(item => item.instanceId !== instanceId));
    else if (phaseId === 3) setP3Selected(p3Selected.filter(item => item.instanceId !== instanceId));
    else if (phaseId === 4) setP4Selected(p4Selected.filter(item => item.instanceId !== instanceId));
  };

  const handleMoveExercise = (phaseId: number, index: number, direction: 'up' | 'down') => {
    const move = (list: any[]) => {
      const newList = [...list];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newList.length) return list;
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;
      return newList;
    };
    if (phaseId === 1) setP1Selected(move(p1Selected));
    else if (phaseId === 2) setP2Selected(move(p2Selected));
    else if (phaseId === 3) setP3Selected(move(p3Selected));
    else if (phaseId === 4) setP4Selected(move(p4Selected));
  };

  const handleLoadTemplate = (tpl: any) => {
    if (!tpl) return;
    setFormData({
      name: tpl.name || '',
      description: tpl.description || '',
      date: new Date().toISOString().split('T')[0],
      startTime: tpl.startTime || '10:00',
      location: tpl.location || 'airport_runway',
      isPublic: !!tpl.isPublic
    });
    setUseAgendaBuilder(tpl.useAgendaBuilder !== undefined ? !!tpl.useAgendaBuilder : false);
    setP1Selected((tpl.p1Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p1'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP2Selected((tpl.p2Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p2'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP3Selected((tpl.p3Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p3'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP4Selected((tpl.p4Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p4'}_${idx}_${Math.random()}_${Date.now()}` })));
    setSelectedStudentIds(tpl.selectedStudentIds || []);
    setRecommendedHomeTask(tpl.homeTask || null);
    setSaveAsTemplate(false);
    
    // CRITICAL: Ensure editingEvent is null when loading/using a template to create a new event
    skipSyncRef.current = true;
    setEditingEvent(null);
  };

  const renderPhaseBlock = (phaseId: number, title: string, subtitle: string, list: any[]) => {
    const totalMins = list.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    return (
      <fieldset className="space-y-4 p-5 bg-white/45 border-2 border-brand-navy/5 rounded-[28px] shadow-xs relative overflow-hidden transition-all hover:border-brand-navy/15">
        <legend className="px-4 py-1.5 bg-brand-navy text-white text-[10px] tracking-widest font-black uppercase rounded-lg italic shadow-xs">
          {title} — {totalMins} {lang === 'RU' ? 'МИН' : 'MINS'}
        </legend>
        <p className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider italic">
          {subtitle}
        </p>

        {/* Selected List */}
        <div className="space-y-2">
          {list.length === 0 ? (
            <div className="h-16 flex items-center justify-center bg-brand-navy/5 rounded-2xl border border-dashed border-brand-navy/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-navy/40 italic">
                {lang === 'RU' ? '💨 Пусто во фрейме. Добавьте упражнения ниже!' : '💨 Empty. Choose and append drills below!'}
              </span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
              <AnimatePresence initial={false}>
                {list.map((item, index) => {
                  const isDragged = draggedItem?.phaseId === phaseId && draggedItem?.index === index;
                  const isDragOver = dragOverIndex?.phaseId === phaseId && dragOverIndex?.index === index;
                  
                  return (
                    <motion.div
                      key={item.instanceId || `${item.id}_${index}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      draggable={list.length > 1}
                      onDragStart={(e) => {
                        setDraggedItem({ phaseId, index });
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", item.instanceId);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedItem && draggedItem.phaseId === phaseId && draggedItem.index !== index) {
                          setDragOverIndex({ phaseId, index });
                        }
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex?.phaseId === phaseId && dragOverIndex?.index === index) {
                          setDragOverIndex(null);
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedItem && draggedItem.phaseId === phaseId) {
                          const fromIndex = draggedItem.index;
                          const toIndex = index;
                          if (fromIndex !== toIndex) {
                            const reorderList = (arr: any[]) => {
                              const newArr = [...arr];
                              const [moved] = newArr.splice(fromIndex, 1);
                              newArr.splice(toIndex, 0, moved);
                              return newArr;
                            };
                            if (phaseId === 1) setP1Selected(reorderList(p1Selected));
                            else if (phaseId === 2) setP2Selected(reorderList(p2Selected));
                            else if (phaseId === 3) setP3Selected(reorderList(p3Selected));
                            else if (phaseId === 4) setP4Selected(reorderList(p4Selected));
                          }
                        }
                        setDraggedItem(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedItem(null);
                        setDragOverIndex(null);
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl gap-3 shadow-xs border transition-all duration-200 select-none ${
                        list.length > 1 ? 'cursor-grab active:cursor-grabbing hover:shadow-sm' : ''
                      } ${
                        isDragged
                          ? 'opacity-30 border-dashed border-brand-teal bg-brand-navy/5 scale-95'
                          : isDragOver
                          ? 'border-brand-teal bg-brand-teal/10 scale-[1.02] shadow-md'
                          : 'bg-white/80 border-brand-navy/5'
                      }`}
                    >
                      {/* Grip Handle for visual cue */}
                      {list.length > 1 && (
                        <div className="text-brand-navy/30 hover:text-brand-navy/60 transition-colors shrink-0">
                          <GripVertical className="w-4 h-4 cursor-grab" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-black text-brand-navy truncate">
                            {item.name}
                          </span>
                          {(() => {
                            const catDetails = getExerciseCategory(item, lang);
                            return (
                              <Badge color={catDetails.color} className="text-[7px] px-1 py-0 italic font-black uppercase">
                                {catDetails.label}
                              </Badge>
                            );
                          })()}
                          <Badge color={
                            item.complexity === 'Beginner' ? 'teal' :
                            item.complexity === 'Advanced' ? 'sunset' : 'blue'
                          }>
                            {item.complexity}
                          </Badge>
                        </div>
                        <p className="text-[9px] text-brand-navy/50 truncate max-w-xs block">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Micro Arrow Increments as Backup click operations */}
                        {list.length > 1 && (
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveExercise(phaseId, index, 'up')}
                              className="p-0.5 hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-teal rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title={lang === 'RU' ? 'Вверх' : 'Move Up'}
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === list.length - 1}
                              onClick={() => handleMoveExercise(phaseId, index, 'down')}
                              className="p-0.5 hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-teal rounded disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              title={lang === 'RU' ? 'Вниз' : 'Move Down'}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Static Duration Display */}
                        <div className="flex items-center gap-1.5 bg-brand-navy/5 rounded-lg px-2.5 py-1">
                          <Clock className="w-3 h-3 text-brand-navy/50" />
                          <span className="text-xs font-black text-brand-navy italic">
                            {item.duration}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider text-brand-navy/40">{lang === 'RU' ? 'мин' : 'm'}</span>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(phaseId, item.instanceId)}
                          className="p-1 hover:bg-red-50 hover:text-red-500 rounded-lg text-brand-navy/40 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Combined Predefined Exercises Card Desk Selector */}
        <div className="pt-3 border-t border-brand-navy/5 flex flex-col gap-3">
          <button
            type="button"
            id={`toggle-card-library-p${phaseId}`}
            onClick={() => {
              if (showPhaseCards === phaseId) {
                setShowPhaseCards(null);
              } else {
                setShowPhaseCards(phaseId);
              }
            }}
            className={`w-full h-11 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
              showPhaseCards === phaseId
                ? 'bg-brand-teal text-white shadow-teal'
                : 'bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy border border-brand-navy/5'
            }`}
          >
            {showPhaseCards === phaseId ? (
              <>
                <ChevronUp className="w-4 h-4" />
                <span>{lang === 'RU' ? 'СКРЫТЬ УПРАЖНЕНИЯ' : 'CLOSE DRILL LIBRARY'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{lang === 'RU' ? 'ВЫБРАТЬ ПРЕДОПРЕДЕЛЕННЫЕ УПРАЖНЕНИЯ' : 'SELECT PREDEFINED EXERCISES'}</span>
              </>
            )}
          </button>

          {/* Collapsible Card Desk of the Exercise Library */}
          <AnimatePresence>
            {showPhaseCards === phaseId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                <div className="p-4 bg-brand-navy/5 rounded-2xl border border-brand-navy/10 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-brand-navy/5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 italic">
                      📚 {lang === 'RU' ? 'КАРТОЧКИ ДЛЯ ЭТОГО БЛОКА' : 'RELEVANT DRILLS FOR BLOCK'}
                    </span>
                    
                    {/* Inline filters */}
                    <div className="flex items-center gap-2">
                      <select
                        value={deckFilterGroup}
                        onChange={(e) => setDeckFilterGroup(e.target.value)}
                        className="h-8 px-2.5 bg-white border border-brand-navy/10 rounded-lg text-[9px] text-brand-navy uppercase tracking-wider font-extrabold italic cursor-pointer focus:outline-none"
                      >
                        <option value="All">{lang === 'RU' ? 'ВСЕ ГРУППЫ' : 'ALL GROUPS'}</option>
                        <option value="U6">U6</option>
                        <option value="U8">U8</option>
                        <option value="U10">U10</option>
                        <option value="U12">U12</option>
                      </select>
                    </div>
                  </div>

                  {/* Exercise card list Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar p-0.5">
                    {exercises
                      .filter(ex => {
                        const matchesGroup = deckFilterGroup === 'All' || 
                               ex.ageGroup.toUpperCase().includes(deckFilterGroup.toUpperCase());
                        if (!matchesGroup) return false;

                        const nameLower = (ex.name || '').toLowerCase();
                        const descLower = (ex.description || '').toLowerCase();
                        const idLower = (ex.id || '').toLowerCase();

                        if (ex.phase !== undefined && ex.phase !== null) {
                          return ex.phase === phaseId;
                        }

                        if (phaseId === 1) {
                          // Warm up and physical preparation
                          return (
                            nameLower.includes('warm') || 
                            nameLower.includes('разминк') ||
                            descLower.includes('warm') ||
                            idLower.includes('jogging') ||
                            idLower.includes('meditation') ||
                            nameLower.includes('meditation') ||
                            nameLower.includes('медитац') ||
                            nameLower.includes('бег')
                          );
                        }
                        if (phaseId === 2) {
                          // Physical/Coordination/Speed Focus
                          return (
                            nameLower.includes('agility') || 
                            nameLower.includes('координац') ||
                            nameLower.includes('fitness') ||
                            nameLower.includes('speed') ||
                            nameLower.includes('моторика') ||
                            nameLower.includes('motoric') ||
                            idLower.includes('diagnostics') ||
                            idLower.includes('running') ||
                            nameLower.includes('бег')
                          );
                        }
                        if (phaseId === 3) {
                          // Football drills/Tactical Mastery/Footwork
                          return (
                            nameLower.includes('mastery') || 
                            nameLower.includes('мяч') ||
                            nameLower.includes('shoot') ||
                            nameLower.includes('dribbl') ||
                            nameLower.includes('pass') ||
                            nameLower.includes('дриблинг') ||
                            nameLower.includes('пас') ||
                            nameLower.includes('удар') ||
                            nameLower.includes('передач') ||
                            nameLower.includes('vengerka') ||
                            nameLower.includes('венгерка') ||
                            nameLower.includes('gladiator')
                          );
                        }
                        if (phaseId === 4) {
                          // Scrimmage/Game/Cooldown
                          return (
                            nameLower.includes('match') || 
                            nameLower.includes('game') ||
                            nameLower.includes('игра') ||
                            nameLower.includes('cooldown') ||
                            nameLower.includes('остывание') ||
                            nameLower.includes('двусторонка') ||
                            nameLower.includes('meditation') ||
                            nameLower.includes('медитац') ||
                            idLower.includes('gametime')
                          );
                        }
                        return true;
                      })
                      .map((ex, idx) => {
                        const isCurrentlyAdded = list.some(item => item.id === ex.id);
                        return (
                          <div
                            key={`${ex.id || 'ex'}_${idx}`}
                            onClick={() => handleAddExerciseToPhase(phaseId, ex.id)}
                            className={`group p-3.5 bg-white hover:bg-gradient-to-br hover:from-white hover:to-brand-teal/5 border rounded-xl shadow-xs transition-all duration-200 cursor-pointer text-left relative overflow-hidden flex flex-col justify-between min-h-[140px] ${
                              isCurrentlyAdded ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'border-brand-navy/10 hover:border-brand-teal'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h5 className="font-extrabold text-[11px] uppercase text-brand-navy group-hover:text-brand-teal transition-colors line-clamp-2">
                                  {ex.name}
                                </h5>
                                {isCurrentlyAdded && (
                                  <span className="shrink-0 bg-brand-teal text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest italic animate-pulse">
                                    {lang === 'RU' ? 'ДОБАВЛЕНО' : 'ADDED'}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                <span className="inline-flex items-center gap-0.5 text-[8px] font-black uppercase text-brand-navy/40 italic">
                                  <Target className="w-2.5 h-2.5 text-brand-navy/30" />
                                  {ex.ageGroup}
                                </span>
                                {(() => {
                                  const catDetails = getExerciseCategory(ex, lang);
                                  return (
                                    <Badge color={catDetails.color} className="text-[7px] px-1 py-0 px-1 italic uppercase font-black">
                                      {catDetails.label}
                                    </Badge>
                                  );
                                })()}
                                <Badge color={
                                  ex.complexity === 'Beginner' ? 'teal' :
                                  ex.complexity === 'Advanced' ? 'sunset' : 'blue'
                                } className="text-[7px] px-1 py-0 px-1 italic uppercase font-black">
                                  {ex.complexity}
                                </Badge>
                                <span className="inline-flex items-center gap-0.5 text-[8.5px] font-black uppercase text-brand-teal italic ml-auto">
                                  <Clock className="w-2.5 h-2.5" />
                                  {ex.duration} {lang === 'RU' ? 'м' : 'm'}
                                </span>
                              </div>

                              <p className="text-[10px] text-brand-navy/70 leading-relaxed font-medium line-clamp-3">
                                {ex.description}
                              </p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-brand-navy/5 flex items-center justify-between">
                              <span className="text-[8px] font-black text-brand-navy/30 uppercase tracking-widest italic group-hover:text-brand-teal transition-all">
                                {lang === 'RU' ? 'ДОБАВИТЬ В ШАБЛОН' : 'APPEND TO TEMPLATE'}
                              </span>
                              <div className="w-5 h-5 rounded-full bg-brand-navy/5 group-hover:bg-brand-teal group-hover:text-white flex items-center justify-center text-brand-navy/40 transition-colors">
                                <Plus className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        );
                      })}

                    {exercises
                      .filter(ex => {
                        const matchesGroup = deckFilterGroup === 'All' || 
                               ex.ageGroup.toUpperCase().includes(deckFilterGroup.toUpperCase());
                        if (!matchesGroup) return false;

                        const nameLower = (ex.name || '').toLowerCase();
                        const descLower = (ex.description || '').toLowerCase();
                        const idLower = (ex.id || '').toLowerCase();

                        if (ex.phase !== undefined && ex.phase !== null) {
                          return ex.phase === phaseId;
                        }

                        if (phaseId === 1) {
                          return (
                            nameLower.includes('warm') || 
                            nameLower.includes('разминк') ||
                            descLower.includes('warm') ||
                            idLower.includes('jogging') ||
                            idLower.includes('meditation') ||
                            nameLower.includes('meditation') ||
                            nameLower.includes('медитац') ||
                            nameLower.includes('бег')
                          );
                        }
                        if (phaseId === 2) {
                          return (
                            nameLower.includes('agility') || 
                            nameLower.includes('координац') ||
                            nameLower.includes('fitness') ||
                            nameLower.includes('speed') ||
                            nameLower.includes('моторика') ||
                            nameLower.includes('motoric') ||
                            idLower.includes('diagnostics') ||
                            idLower.includes('running') ||
                            nameLower.includes('бег')
                          );
                        }
                        if (phaseId === 3) {
                          return (
                            nameLower.includes('mastery') || 
                            nameLower.includes('мяч') ||
                            nameLower.includes('shoot') ||
                            nameLower.includes('dribbl') ||
                            nameLower.includes('pass') ||
                            nameLower.includes('дриблинг') ||
                            nameLower.includes('пас') ||
                            nameLower.includes('удар') ||
                            nameLower.includes('передач') ||
                            nameLower.includes('vengerka') ||
                            nameLower.includes('венгерка') ||
                            nameLower.includes('gladiator')
                          );
                        }
                        if (phaseId === 4) {
                          return (
                            nameLower.includes('match') || 
                            nameLower.includes('game') ||
                            nameLower.includes('игра') ||
                            nameLower.includes('cooldown') ||
                            nameLower.includes('остывание') ||
                            nameLower.includes('двусторонка') ||
                            nameLower.includes('meditation') ||
                            nameLower.includes('медитац') ||
                            idLower.includes('gametime')
                          );
                        }
                        return true;
                      }).length === 0 && (
                      <p className="col-span-full text-center py-6 text-[10px] text-brand-navy/40 font-black italic uppercase tracking-wider">
                        🔍 {lang === 'RU' ? 'Совпадений не найдено!' : 'No matching drills found!'}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </fieldset>
    );
  };

  // Compile Agenda to description text
  React.useEffect(() => {
    if (!useAgendaBuilder) return;

    let text = `⚽ CLASS AGENDA PLAN:\n`;
    text += `=========================================\n\n`;

    // Phase 1
    const p1Total = p1Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    text += lang === 'RU' 
      ? `1. РАЗМИНКА - АКТИВАЦИЯ (WARM UP - ACTIVATION) - ${p1Total} МИН\n` 
      : `1ST PHASE (WARM UP - ACTIVATION) - ${p1Total} MINS\n`;
    text += `-----------------------------------------\n`;
    if (p1Selected.length === 0) {
      text += lang === 'RU' ? `• [Нет упражнений в блоке]\n` : `• [No items in block]\n`;
    } else {
      p1Selected.forEach((item) => {
        text += `• ${item.name} (${item.duration} ${lang === 'RU' ? 'мин' : 'mins'}) - ${item.description}\n`;
      });
    }
    text += `\n`;

    // Phase 2
    const p2Total = p2Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    text += lang === 'RU' 
      ? `2. ИНТЕНСИВ / ФИТНЕС (INTENSIVE / FITNESS) - ${p2Total} МИН\n` 
      : `2ND PHASE (INTENSIVE / FITNESS) - ${p2Total} MINS\n`;
    text += `-----------------------------------------\n`;
    if (p2Selected.length === 0) {
      text += lang === 'RU' ? `• [Нет упражнений в блоке]\n` : `• [No items in block]\n`;
    } else {
      p2Selected.forEach((item) => {
        text += `• ${item.name} (${item.duration} ${lang === 'RU' ? 'мин' : 'mins'}) - ${item.description}\n`;
      });
    }
    text += `\n`;

    // Phase 3
    const p3Total = p3Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    text += lang === 'RU' 
      ? `3. РАБОТА С МЯЧОМ - МАСТЕРСТВО ФУТБОЛА (BALL WORK - FOOTBALL MASTERY) - ${p3Total} МИН\n` 
      : `3RD PHASE (BALL WORK - FOOTBALL MASTERY) - ${p3Total} MINS\n`;
    text += `-----------------------------------------\n`;
    if (p3Selected.length === 0) {
      text += lang === 'RU' ? `• [Нет упражнений в блоке]\n` : `• [No items in block]\n`;
    } else {
      p3Selected.forEach((item) => {
        text += `• ${item.name} (${item.duration} ${lang === 'RU' ? 'мин' : 'mins'}) - ${item.description}\n`;
      });
    }
    text += `\n`;

    // Phase 4
    const p4Total = p4Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    text += lang === 'RU' 
      ? `4. ИГРА И МЕДИТАЦИЯ - ПРАКТИКА, ЗАМИНКА (MATCH & MEDITATION - PRACTICE, COOLDOWN) - ${p4Total} МИН\n` 
      : `4TH PHASE (MATCH & MEDITATION - PRACTICE, COOLDOWN) - ${p4Total} MINS\n`;
    text += `-----------------------------------------\n`;
    if (p4Selected.length === 0) {
      text += lang === 'RU' ? `• [Нет упражнений в блоке]\n` : `• [No items in block]\n`;
    } else {
      p4Selected.forEach((item) => {
        text += `• ${item.name} (${item.duration} ${lang === 'RU' ? 'мин' : 'mins'}) - ${item.description}\n`;
      });
    }

    setFormData(prev => ({ ...prev, description: text }));
  }, [
    useAgendaBuilder,
    p1Selected,
    p2Selected,
    p3Selected,
    p4Selected,
    lang
  ]);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    location: 'airport_runway',
    isPublic: false
  });

  React.useEffect(() => {
    // Simplify query to avoid needing complex composite indexes
    const q = query(
      collection(db, 'events'),
      orderBy('date', 'desc'),
      limit(50)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Snapshot error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openEditForm = (ev: any) => {
    setEditingEvent(ev);
    setFormData({
      name: ev.name || '',
      description: ev.description || '',
      date: ev.date || new Date().toISOString().split('T')[0],
      startTime: ev.startTime || '10:00',
      location: ev.location || 'airport_runway',
      isPublic: !!ev.isPublic
    });
    setUseAgendaBuilder(ev.useAgendaBuilder !== undefined ? !!ev.useAgendaBuilder : false);
    setP1Selected((ev.p1Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p1'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP2Selected((ev.p2Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p2'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP3Selected((ev.p3Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p3'}_${idx}_${Math.random()}_${Date.now()}` })));
    setP4Selected((ev.p4Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p4'}_${idx}_${Math.random()}_${Date.now()}` })));
    setShowForm(true);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!master || (!master.phone && !master.id)) {
        throw new Error("Master data incomplete");
      }
      const eventPayload = sanitizeFirestoreData({
        name: formData.name,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        location: formData.location,
        isPublic: formData.isPublic,
        masterId: master.phone || master.id,
        p1Selected: p1Selected || [],
        p2Selected: p2Selected || [],
        p3Selected: p3Selected || [],
        p4Selected: p4Selected || [],
        useAgendaBuilder,
        homeTask: recommendedHomeTask
      });

      let finalEventId = editingEvent?.id;

      if (editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventPayload);
        setNotification(lang === 'RU' ? 'Событие успешно обновлено!' : 'Event updated successfully!');
      } else {
        const addedRef = await addDoc(collection(db, 'events'), {
          ...eventPayload,
          createdAt: serverTimestamp()
        });
        finalEventId = addedRef.id;
        setNotification(lang === 'RU' ? 'Событие успешно создано!' : 'Event created successfully!');
      }

      if (saveAsTemplate) {
        const templatePayload = sanitizeFirestoreData({
          name: formData.name,
          description: formData.description,
          startTime: formData.startTime,
          location: formData.location,
          masterId: master.phone || master.id,
          p1Selected: p1Selected || [],
          p2Selected: p2Selected || [],
          p3Selected: p3Selected || [],
          p4Selected: p4Selected || [],
          selectedStudentIds: selectedStudentIds || [],
          useAgendaBuilder,
          homeTask: recommendedHomeTask || null,
          createdAt: serverTimestamp(),
          isTemplate: true
        });
        await addDoc(collection(db, 'event_templates'), templatePayload);
      }

      // Sync and persist student invitations
      if (finalEventId) {
        // Fetch current invitations to avoid duplicate writes
        const qInv = query(collection(db, 'invitations'), where('eventId', '==', finalEventId));
        const currentInvsSnap = await getDocs(qInv);
        const currentInvs = currentInvsSnap.docs.map(d => ({ id: d.id, studentId: d.data().studentId }));
        const currentInvitedIds = currentInvs.map(i => i.studentId);

        // 1. Add new invitations for freshly selected students
        const idsToAdd = selectedStudentIds.filter(id => !currentInvitedIds.includes(id));
        if (idsToAdd.length > 0) {
          const invitationData = idsToAdd.map(studentId => {
            const student = allStudents.find(s => s.id === studentId);
            return {
              eventId: finalEventId,
              studentId: student.id,
              studentName: student.studentName || '',
              studentPhone: student.parentPhone || '',
              masterId: master.phone || master.id,
              eventDetails: {
                name: formData.name,
                date: formData.date,
                startTime: formData.startTime,
                location: formData.location
              }
            };
          });

          await fetch('/api/invitations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ invitations: invitationData })
          });

          // Trigger home homework assignment, push custom in-app notifications
          if (recommendedHomeTask) {
            for (const studentId of idsToAdd) {
              const student = allStudents.find(s => s.id === studentId);
              if (student) {
                const currentNotifs = student.notifications || [];
                const matchedNotifId = `hometask_${finalEventId}`;
                if (!currentNotifs.some((n: any) => n.id === matchedNotifId)) {
                  const newNotif = {
                    id: matchedNotifId,
                    title: lang === 'RU' ? `Домашнее задание: ${recommendedHomeTask.title}` : `Homework: ${recommendedHomeTask.title}`,
                    message: lang === 'RU' 
                      ? `Тренер назначил домашнее задание к тренировке "${formData.name}".`
                      : `Coach has recommended a home task: "${recommendedHomeTask.title}".`,
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
        }

        // 2. Remove invitations for untoggled athletes
        const idsToRemove = currentInvitedIds.filter(id => !selectedStudentIds.includes(id));
        for (const remId of idsToRemove) {
          const matchedInv = currentInvs.find(i => i.studentId === remId);
          if (matchedInv) {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'invitations', matchedInv.id));
          }
        }
      }

      setShowForm(false);
      setEditingEvent(null);
      setSelectedStudentIds([]);
      setRecommendedHomeTask(null);
      setSaveAsTemplate(false);
      setFormData({
        name: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        location: 'airport_runway',
        isPublic: false
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      console.error("Error saving event:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const LOCATIONS = [
    { id: 'airport_runway', label: t.locAirport },
    { id: 'metro_mall', label: t.locMetroMall },
    { id: 'agmashenebeli', label: t.locAgmashenebeli },
    { id: 'pirosmani_5', label: t.locPirosmani5 },
    { id: 'kaczynski_5', label: t.locKaczynski5 },
    { id: 'batumi_boulevard', label: t.locBatumiBoulevard },
  ];

  if (selectedEventId) {
    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (selectedEvent) {
      return (
        <EventDetailsView 
          event={selectedEvent} 
          master={master}
          lang={lang}
          t={t}
          onBack={() => setSelectedEventId(null)}
          onEdit={(ev: any) => {
            setSelectedEventId(null);
            openEditForm(ev);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t.masterMenuSchedule}</h2>
          {!showForm && !loading && (
            <div className="flex items-center gap-2 mt-1.5 animate-in fade-in duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
              <p className="text-[10.5px] font-black text-brand-navy/55 uppercase tracking-wider italic">
                {lang === 'RU' ? `Всего создано событий: ${events.length}` : `Total created events: ${events.length}`}
              </p>
            </div>
          )}
        </div>
        <Button 
          id="create-event-btn"
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              name: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
              startTime: '10:00',
              location: 'airport_runway',
              isPublic: false
            });
            setShowForm(true);
          }} 
          className="h-14 px-8 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black bg-brand-teal text-white shadow-teal flex items-center gap-3"
        >
          <Plus className="w-5 h-5" />
          {t.createEventBtn}
        </Button>
      </div>

      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] p-6 bg-brand-teal text-white rounded-[32px] flex items-center gap-4 shadow-teal font-black italic uppercase tracking-widest text-xs"
          >
            <CheckCircle2 className="w-6 h-6" />
            {notification}
          </motion.div>
        )}

        {showInviteModal && (
          <InvitationModal 
            event={showInviteModal} 
            lang={lang} 
            t={t} 
            onClose={() => setShowInviteModal(null)}
            onSuccess={() => {
              setShowInviteModal(null);
              setNotification(lang === 'RU' ? 'Приглашения отправлены!' : 'Invitations sent!');
              setTimeout(() => setNotification(null), 5000);
            }}
            masterId={master.phone || master.id}
          />
        )}

        {showForm ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full relative z-10"
          >
            <Card className="w-full p-5 sm:p-10 md:p-12 glass rounded-[48px] border-white/60 shadow-3xl relative custom-scrollbar">
              <button 
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                }}
                className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 rounded-full border border-brand-navy/10 flex items-center justify-center text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-10">
                <Badge color={editingEvent ? "sunset" : "teal"} className="mb-6">
                  {editingEvent 
                    ? (lang === 'RU' ? 'РЕДАКТИРОВАНИЕ СОБЫТИЯ' : 'EDIT EVENT DETAILS') 
                    : t.createEventTitle}
                </Badge>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy leading-none">
                  {editingEvent 
                    ? (lang === 'RU' ? 'Изменить параметры' : 'Modify Parameters') 
                    : (lang === 'RU' ? 'Данные занятия' : 'Class Details')}
                </h3>
              </div>

              <form onSubmit={handleCreateEvent} className="space-y-8">
                {/* Custom Event Templates saved by the user */}
                <div className="space-y-3 bg-white/25 p-5 rounded-3xl border border-brand-navy/5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/60 italic ml-2">
                      📂 {lang === 'RU' ? 'ПОЛЬЗОВАТЕЛЬСКИЕ ШАБЛОНЫ СОБЫТИЙ' : 'YOUR SAVED TEMPLATES'}
                    </label>
                    <p className="text-[9px] text-brand-navy/40 font-bold uppercase tracking-wider ml-2 leading-normal">
                      {lang === 'RU' ? 'Выберите один из ранее созданных шаблонов, чтобы быстро заполнить форму' : 'Select a previously saved template to quickly pre-populate this session'}
                    </p>
                  </div>
                  {templates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {templates.map((tpl, i) => (
                        <div key={`tpl_${tpl.id || 'tpl'}_${i}`} className="relative group min-h-[58px]">
                          <button
                            type="button"
                            onClick={() => handleLoadTemplate(tpl)}
                            className="px-3.5 py-3 pr-10 bg-teal-50/20 hover:bg-teal-50/55 border border-brand-teal/10 hover:border-brand-teal/30 text-brand-teal rounded-2xl text-[9.5px] font-black uppercase tracking-wider italic transition-all flex flex-col items-start gap-1 cursor-pointer text-left w-full h-full"
                          >
                            <span className="flex items-center gap-1.5 text-xs font-bold text-brand-teal w-full">
                              📋 <span className="truncate max-w-[130px] font-black">{tpl.name}</span>
                            </span>
                            <span className="text-[8px] opacity-75 leading-tight line-clamp-1 font-sans not-italic text-brand-navy/60 font-medium">
                              {tpl.description || 'No description / Без описания'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm(lang === 'RU' ? 'Удалить этот шаблон?' : 'Delete this template?')) {
                                try {
                                  await deleteDoc(doc(db, 'event_templates', tpl.id));
                                  setNotification(lang === 'RU' ? 'Шаблон успешно удален!' : 'Template deleted successfully!');
                                } catch (err) {
                                  console.error("Error deleting template:", err);
                                }
                              }
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border border-red-200/50"
                            title={lang === 'RU' ? 'Удалить шаблон' : 'Delete template'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-brand-navy/40 font-bold uppercase tracking-wider ml-2 py-1 italic">
                      {lang === 'RU' ? 'У вас пока нет сохраненных шаблонов. Отметьте «Сохранить как шаблон» внизу перед отправкой!' : 'No custom templates found. Check "Save as Template" below when saving next time!'}
                    </p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Event Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">{t.eventNameLabel}</label>
                    <Input 
                      required 
                      id="event-name"
                      placeholder={lang === 'RU' ? 'Например, Интенсив U8' : 'e.g. U8 Intensive'} 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="!rounded-[24px] h-14"
                    />
                  </div>

                  {/* Date and Time inline side-by-side inside this grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">{t.eventDateLabel}</label>
                      <Input 
                        id="event-date"
                        type="date" 
                        required 
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="!rounded-[24px] h-14 text-center"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">{t.eventTimeLabel}</label>
                      <Input 
                        id="event-time"
                        type="time" 
                        required 
                        value={formData.startTime}
                        onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                        className="!rounded-[24px] h-14 text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    📍 {lang === 'RU' ? 'Выберите локацию проведения' : 'Choose Class Venue'}
                  </label>
                  <select 
                    id="event-location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full h-14 px-6 bg-white/50 border-2 border-brand-navy/5 rounded-[24px] focus:outline-none focus:border-brand-teal transition-all font-bold text-sm text-brand-navy appearance-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    {LOCATIONS.map(loc => {
                      let icon = "📍";
                      if (loc.id === 'airport_runway') icon = "✈️";
                      else if (loc.id === 'metro_mall') icon = "🚇";
                      else if (loc.id === 'agmashenebeli') icon = "⛪";
                      else if (loc.id === 'pirosmani_5') icon = "🏢";
                      else if (loc.id === 'kaczynski_5') icon = "🏫";
                      else if (loc.id === 'batumi_boulevard') icon = "🏖️";
                      
                      return (
                        <option key={`option_${loc.id}`} value={loc.id}>
                          {icon} {loc.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 👥 PARTICIPATING ATHLETES */}
                <div id="inline-participants" className="space-y-6 bg-white/20 p-6 sm:p-8 rounded-[36px] border border-brand-navy/5">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight text-brand-navy italic">
                      {lang === 'RU' ? '👥 ПРИГЛАСИТЬ УЧАСТНИКОВ' : '👥 INVITE PARTICIPANTS'}
                    </h4>
                    <p className="text-[10px] text-brand-navy/50 font-bold uppercase tracking-wider block mt-1">
                      {lang === 'RU' ? 'Отметьте спортсменов, приглашенных на это занятие' : 'Select athletes invited to this session'}
                    </p>
                  </div>

                  {/* Student Search & Quick Pick Checklist */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/30" />
                      <input 
                        type="text" 
                        placeholder={lang === 'RU' ? 'Быстрый поиск футболиста...' : 'Quick search athlete...'}
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/50 border border-brand-navy/5 text-xs font-bold focus:outline-none focus:border-brand-teal transition-all"
                      />
                    </div>

                    <div className="max-h-[180px] overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                      {loadingStudents ? (
                        <div className="py-4 text-center"><Loader2 className="w-6 h-6 animate-spin text-brand-teal mx-auto" /></div>
                      ) : allStudents.filter(s => s.status === 'approved' && (s.studentLocations && Array.isArray(s.studentLocations) ? s.studentLocations.includes(formData.location) : s.studentLocation === formData.location)).filter(s => (s.studentName || '').toLowerCase().includes(studentSearch.toLowerCase())).length === 0 ? (
                        <p className="text-[10px] uppercase font-bold text-brand-navy/30 py-2 italic">{lang === 'RU' ? 'Никто не найден' : 'No athletes found'}</p>
                      ) : (
                        allStudents
                          .filter(s => s.status === 'approved' && (s.studentLocations && Array.isArray(s.studentLocations) ? s.studentLocations.includes(formData.location) : s.studentLocation === formData.location))
                          .filter(s => (s.studentName || '').toLowerCase().includes(studentSearch.toLowerCase()))
                          .map((student, idx) => {
                            const isChecked = selectedStudentIds.includes(student.id);
                            const xp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
                            const lvl = getStudentLevelInfo(xp);

                            return (
                              <button
                                key={`${student.id || 'student_sched'}_${idx}`}
                                type="button"
                                onClick={() => {
                                  if (isChecked) {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
                                  } else {
                                    setSelectedStudentIds(prev => [...prev, student.id]);
                                  }
                                }}
                                className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                                  isChecked 
                                    ? 'bg-brand-teal/10 border-brand-teal text-brand-navy' 
                                    : 'bg-white/40 border-brand-navy/5 hover:bg-white/60 text-brand-navy/80'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                    isChecked ? 'bg-brand-teal border-brand-teal text-white' : 'border-brand-navy/20'
                                  }`}>
                                    {isChecked && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                  <div>
                                    <span className="text-xs font-extrabold uppercase italic block leading-none mb-1">
                                      {student.studentName}
                                    </span>
                                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-brand-navy/40">
                                      {student.parentPhone}
                                    </span>
                                  </div>
                                </div>

                                <Badge color="sunset" className="text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-lg">
                                  ⚡ {lvl.title} ({xp} XP)
                                </Badge>
                              </button>
                            );
                          })
                      )}
                    </div>
                  </div>

                </div>

                {/* Advanced Class Agenda Helper */}
                <div className="space-y-4 bg-white/20 p-6 sm:p-8 rounded-[36px] border border-brand-navy/5">
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-brand-navy/5">
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-brand-navy italic">
                        {lang === 'RU' ? '⚽ КОНСТРУКТОР АГЕНДЫ ЗАНЯТИЯ' : '⚽ CLASS AGENDA BUILDER'}
                      </h4>
                      <p className="text-[10px] text-brand-navy/50 font-bold uppercase tracking-wider">
                        {lang === 'RU' ? 'Автоматические шаблоны и упражнения' : 'Automated curriculum structures & custom coach drills'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUseAgendaBuilder(!useAgendaBuilder)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        useAgendaBuilder 
                          ? 'bg-brand-teal text-white shadow-teal' 
                          : 'bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy'
                      }`}
                    >
                      {useAgendaBuilder 
                        ? (lang === 'RU' ? 'АКТИВЕН' : 'BUILDER ACTIVE') 
                        : (lang === 'RU' ? 'БЕЗ ШАБЛОНА' : 'MANUAL RAW TEXT')}
                    </button>
                  </div>

                  {useAgendaBuilder ? (
                    <div className="space-y-6 pt-4 text-xs">
                      {(() => {
                        const p1Mins = p1Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
                        const p2Mins = p2Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
                        const p3Mins = p3Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
                        const p4Mins = p4Selected.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
                        const totalMins = p1Mins + p2Mins + p3Mins + p4Mins;

                        if (totalMins === 0) return null;

                        return (
                          <div className="bg-brand-navy/5 p-4.5 rounded-[24px] border border-brand-navy/10 space-y-2 mb-2 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-brand-navy/70 italic">
                              <span>⌛ {lang === 'RU' ? 'РАСПРЕДЕЛЕНИЕ ВРЕМЕНИ ЗАНЯТИЯ:' : 'CLASS TIMELINE DISTRIBUTION:'}</span>
                              <span className="text-brand-teal text-xs">
                                {totalMins} {lang === 'RU' ? 'мин всего' : 'mins total'}
                              </span>
                            </div>
                            
                            {/* Segmented Timeline Progress Bar */}
                            <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden flex shadow-inner">
                              {p1Mins > 0 && (
                                <div 
                                  style={{ width: `${(p1Mins / totalMins) * 100}%` }}
                                  className="bg-orange-400"
                                />
                              )}
                              {p2Mins > 0 && (
                                <div 
                                  style={{ width: `${(p2Mins / totalMins) * 100}%` }}
                                  className="bg-brand-teal"
                                />
                              )}
                              {p3Mins > 0 && (
                                <div 
                                  style={{ width: `${(p3Mins / totalMins) * 100}%` }}
                                  className="bg-cyan-500"
                                />
                              )}
                              {p4Mins > 0 && (
                                <div 
                                  style={{ width: `${(p4Mins / totalMins) * 100}%` }}
                                  className="bg-amber-500"
                                />
                              )}
                            </div>

                            {/* Legend Row */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5px] font-black uppercase text-brand-navy/60 italic">
                              {p1Mins > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block animate-pulse" />
                                  {lang === 'RU' ? 'Разминка' : 'Warm-up'} ({p1Mins}m)
                                </span>
                              )}
                              {p2Mins > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-brand-teal inline-block" />
                                  {lang === 'RU' ? 'Интенсив' : 'Agility'} ({p2Mins}m)
                                </span>
                              )}
                              {p3Mins > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                                  {lang === 'RU' ? 'Мастерство' : 'Skill'} ({p3Mins}m)
                                </span>
                              )}
                              {p4Mins > 0 && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                  {lang === 'RU' ? 'Игра' : 'Match'} ({p4Mins}m)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {renderPhaseBlock(
                        1,
                        lang === 'RU' ? '1. РАЗМИНКА - АКТИВАЦИЯ (15-20 минут)' : '1ST PHASE (WARM UP - ACTIVATION) (15-20 mins)',
                        lang === 'RU' ? 'Начальная концентрация (медитация), подготовка мышц и суставов (активация). Целевое время: 15-20 минут.' : 'Mindfulness arrival focus (meditation), dynamic activation. Target duration: 15-20 mins.',
                        p1Selected
                      )}

                      {renderPhaseBlock(
                        2,
                        lang === 'RU' ? '2. ИНТЕНСИВ / ФИТНЕС' : '2ND PHASE (INTENSIVE / FITNESS)',
                        lang === 'RU' ? 'Диагностика физических качеств, подвижность ног, координация' : 'Direct skill metrics, speed diagnostics, and coordinated agility',
                        p2Selected
                      )}

                      {renderPhaseBlock(
                        3,
                        lang === 'RU' ? '3. РАБОТА С МЯЧОМ - МАСТЕРСТВО ФУТБОЛА' : '3RD PHASE (BALL WORK - FOOTBALL MASTERY)',
                        lang === 'RU' ? 'Контроль мяча, ведение вегерка, пасы и сильный удар' : 'Elite ball sensitivity, technical foot drills, game passing, and target scoring',
                        p3Selected
                      )}

                      {renderPhaseBlock(
                        4,
                        lang === 'RU' ? '4. ИГРА И МЕДИТАЦИЯ - ПРАКТИКА, ЗАМИНКА' : '4TH PHASE (MATCH & MEDITATION - PRACTICE, COOLDOWN)',
                        lang === 'RU' ? 'Двусторонняя игра, футбольное игровое время и охлаждение' : 'Dynamic bilateral scrimmages, active play-making pacing, and cooldown stretch',
                        p4Selected
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-brand-navy/50 font-medium italic">
                      {lang === 'RU' ? 'Планы отключены. Редактируйте описание напрямую.' : 'Builder bypass active. Edit the compiled raw text directly below.'}
                    </p>
                  )}
                </div>

                {/* Inline AIHomeTaskScheduler component integrated directly within creation/edit page */}
                <div id="inline-homework-scheduler" className="bg-white/20 p-6 sm:p-8 rounded-[36px] border border-brand-navy/5">
                  <AIHomeTaskScheduler 
                    event={{
                      id: editingEvent?.id || 'new_draft',
                      name: formData.name,
                      p1Selected,
                      p2Selected,
                      p3Selected,
                      p4Selected,
                      homeTask: recommendedHomeTask
                    }}
                    invitations={selectedStudentIds.map(id => ({ studentId: id }))}
                    studentsData={allStudents.reduce((acc, current) => {
                      acc[current.id] = current;
                      return acc;
                    }, {} as Record<string, any>)}
                    lang={lang as any}
                    onTaskSaved={(savedTask: any) => {
                      setRecommendedHomeTask(savedTask);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">{t.eventDescLabel}</label>
                  <textarea 
                    id="event-description"
                    required
                    placeholder={lang === 'RU' ? 'Краткое описание занятия...' : 'Short description of a class agenda...'}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-6 bg-white/40 border-2 border-brand-navy/5 rounded-[32px] focus:outline-none focus:border-brand-teal transition-all font-medium text-xs min-h-[160px] custom-scrollbar font-mono text-brand-navy/90"
                  />
                </div>

                <div className="flex items-center gap-3.5 p-5 bg-white/40 border border-brand-navy/5 rounded-[24px]">
                  <input 
                    type="checkbox" 
                    id="event-is-public"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    className="w-5 h-5 accent-brand-teal rounded border border-brand-navy/10 focus:ring-brand-teal cursor-pointer"
                  />
                  <div className="font-sans">
                    <label htmlFor="event-is-public" className="text-xs font-black uppercase italic text-brand-navy cursor-pointer select-none">
                      {lang === 'RU' ? 'Сделать событие публичным' : 'Make Event Public'}
                    </label>
                    <p className="text-[9px] text-brand-navy/40 font-bold uppercase tracking-wider mt-0.5">
                      {lang === 'RU' ? 'Оно появится в каталоге на сайте для всех желающих' : 'It will appear in the events directory on the public website'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-5 bg-white/40 border border-brand-navy/5 rounded-[24px]">
                  <input 
                    type="checkbox" 
                    id="event-save-as-template"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="w-5 h-5 accent-brand-teal rounded border border-brand-navy/10 focus:ring-brand-teal cursor-pointer"
                  />
                  <div className="font-sans">
                    <label htmlFor="event-save-as-template" className="text-xs font-black uppercase italic text-brand-navy cursor-pointer select-none">
                      {lang === 'RU' ? 'Сохранить как шаблон' : 'Save as Template'}
                    </label>
                    <p className="text-[9px] text-brand-navy/40 font-bold uppercase tracking-wider mt-0.5">
                      {lang === 'RU' ? 'Создаст отдельный шаблон, который можно выбрать при создании будущих занятий' : 'Creates a standalone template to quickly clone these settings in future classes'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    id="submit-event"
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-16 md:h-18 !rounded-[24px] bg-brand-navy hover:bg-brand-teal text-white font-black italic uppercase tracking-widest transition-all shadow-xl"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    ) : editingEvent ? (
                      lang === 'RU' ? 'ОБНОВИТЬ СОБЫТИЕ' : 'UPDATE EVENT'
                    ) : (
                      t.eventSubmitBtn
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                    }}
                    className="flex-1 h-16 md:h-18 !rounded-[24px] border-brand-navy/10 text-brand-navy/40 uppercase font-black italic text-[10px]"
                  >
                    {t.cancelBtn}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        ) : (
          <div className="grid gap-4">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : events.length > 0 ? (
          events.map((event, idx) => {
            const loc = LOCATIONS.find(l => l.id === event.location)?.label || event.location;
            return (
              <Card key={`${event.id || 'event'}_${idx}`} className="p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] glass border-white/60 hover:bg-white transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 group">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 flex-1 min-w-0 w-full text-left">
                  <div className="w-16 h-16 rounded-2xl bg-brand-teal flex flex-col items-center justify-center text-white shadow-teal rotate-3 group-hover:rotate-0 transition-transform shrink-0 self-start sm:self-center">
                    <span className="text-[9px] font-black uppercase leading-none opacity-60 mb-1">{new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'short' })}</span>
                    <span className="text-2xl font-black italic leading-none">{new Date(event.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h4 className="font-black italic uppercase text-base sm:text-lg leading-none truncate max-w-[150px] sm:max-w-xs">{event.name}</h4>
                      <Badge color="teal" className="text-[8px] uppercase">{event.startTime}</Badge>
                      {event.isPublic && (
                        <Badge color="sunset" className="text-[7.5px] uppercase tracking-wider italic font-black bg-brand-sunset/10 border-brand-sunset/30 text-brand-sunset px-2 py-0.5 rounded-md">
                          {lang === 'RU' ? 'Публичный' : 'Public'}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/30 mb-2 truncate max-w-xs sm:max-w-md">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-teal italic">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{loc}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto justify-end mt-2 md:mt-0 pt-3 md:pt-0 border-t border-brand-navy/5 md:border-none">
                  <Button
                    onClick={() => setShowInviteModal(event)}
                    className="h-10 px-3.5 !rounded-xl italic uppercase tracking-widest text-[8px] font-black bg-brand-sunset text-white shadow-sunset flex items-center gap-2 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {lang === 'RU' ? 'ПРИГЛАСИТЬ' : 'INVITE'}
                  </Button>
                  <button 
                    onClick={() => openEditForm(event)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-black/5 flex items-center justify-center hover:bg-brand-teal hover:text-white transition-all group shrink-0 text-brand-navy/40 hover:text-white"
                    title={lang === 'RU' ? 'Редактировать событие' : 'Edit Event'}
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5 h-5 text-brand-navy/40 group-hover:text-white" />
                  </button>
                  <button 
                    onClick={async () => {
                      setFormData({
                        name: `${event.name} ${lang === 'RU' ? '(Копия)' : '(Copy)'}`,
                        description: event.description || '',
                        date: new Date().toISOString().split('T')[0],
                        startTime: event.startTime || '10:00',
                        location: event.location || 'airport_runway',
                        isPublic: !!event.isPublic
                      });
                      setUseAgendaBuilder(event.useAgendaBuilder !== undefined ? !!event.useAgendaBuilder : false);
                      setP1Selected((event.p1Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p1'}_${idx}_${Math.random()}_${Date.now()}` })));
                      setP2Selected((event.p2Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p2'}_${idx}_${Math.random()}_${Date.now()}` })));
                      setP3Selected((event.p3Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p3'}_${idx}_${Math.random()}_${Date.now()}` })));
                      setP4Selected((event.p4Selected || []).map((item: any, idx: number) => ({ ...item, instanceId: `${item.id || 'p4'}_${idx}_${Math.random()}_${Date.now()}` })));
                      
                      try {
                        const invitationsQuery = query(collection(db, 'invitations'), where('eventId', '==', event.id));
                        const snap = await getDocs(invitationsQuery);
                        const ids = snap.docs.map(d => d.data().studentId);
                        setSelectedStudentIds(ids);
                      } catch (err) {
                        console.error("Error copying invitations for cloned event:", err);
                      }

                      setRecommendedHomeTask(event.homeTask || null);
                      setSaveAsTemplate(false);

                      skipSyncRef.current = true;
                      setEditingEvent(null);
                      setShowForm(true);
                    }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-black/5 flex items-center justify-center hover:bg-indigo-500 hover:text-white transition-all group shrink-0 text-brand-navy/40 hover:text-white"
                    title={lang === 'RU' ? 'Использовать как шаблон (Копировать)' : 'Use as Template / Clone'}
                  >
                    <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-brand-navy/40 group-hover:text-white" />
                  </button>
                  <button 
                    onClick={() => setSelectedEventId(event.id)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-black/5 flex items-center justify-center hover:bg-brand-navy hover:text-white transition-all group shrink-0 text-brand-navy/40 hover:text-white"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </Card>
            );
          })
        ) : (
          <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
            <p className="text-xl font-black italic uppercase text-brand-navy/20">{lang === 'RU' ? 'РАСПИСАНИЕ ПУСТО' : 'NO EVENTS SCHEDULED'}</p>
          </div>
        )}
      </div>
     )}
    </AnimatePresence>
   </div>
  );
}

function EventDetailsView({ event, master, lang, t, onBack, onEdit }: any) {
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [studentsData, setStudentsData] = React.useState<Record<string, any>>({});
  const [loading, setLoading] = React.useState(true);
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [warningActiveId, setWarningActiveId] = React.useState<string | null>(null);
  const [warningWord, setWarningWord] = React.useState<string>('');

  const [observationActiveId, setObservationActiveId] = React.useState<string | null>(null);
  const [observationText, setObservationText] = React.useState<string>('');

  React.useEffect(() => {
    if (warningActiveId) {
      setWarningWord(lang === 'RU' ? 'Отвлекся от упражнения' : 'Stay unfocused from an exercise');
    }
  }, [warningActiveId, lang]);

  React.useEffect(() => {
    if (observationActiveId) {
      setObservationText('');
    }
  }, [observationActiveId]);

  const handleIssueWarning = async (invitation: any, word: string) => {
    if (!event) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Deduct 1 XP (ensure it doesn't go below 0)
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = Math.max(0, currentXp - 1);

      const penaltyId = `penalty_${Date.now()}`;
      const penaltyRecord = {
        id: penaltyId,
        word: word || (lang === 'RU' ? 'Нарушение дисциплины' : 'Discipline Warning'),
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        timestamp: new Date().toISOString(),
        xpDeducted: 1,
        issuedBy: master?.fullName || 'Coach Roman'
      };

      // 1. Update Student profile (registration)
      const currentPenalties = student.penalties || [];
      const updatedPenalties = [...currentPenalties, penaltyRecord];

      // Add a notification about the discipline penalty
      const newNotifications = [...(student.notifications || [])];
      newNotifications.unshift({
        id: `penalty_${penaltyId}`,
        title: lang === 'RU' ? 'Предупреждение по дисциплине ⚠️' : 'Discipline Warning ⚠️',
        message: lang === 'RU'
          ? `Вынесено предупреждение на занятии "${event.name}": "${word}". Списано 1 XP.`
          : `Issued a warning during class "${event.name}": "${word}". 1 XP deducted.`,
        createdAt: new Date().toISOString(),
        type: 'penalty'
      });

      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        penalties: updatedPenalties,
        notifications: newNotifications
      });

      // 2. Update Event profile (event)
      const currentEventPenalties = event.penalties || [];
      const eventPenaltyRecord = {
        id: penaltyId,
        studentId,
        studentName: invitation.studentName,
        word: word || (lang === 'RU' ? 'Нарушение дисциплины' : 'Discipline Warning'),
        timestamp: new Date().toISOString(),
        xpDeducted: 1,
        issuedBy: master?.fullName || 'Coach Roman',
        masterName: master?.fullName || 'Coach Roman'
      };
      await updateDoc(doc(db, 'events', event.id), {
        penalties: [...currentEventPenalties, eventPenaltyRecord]
      });

      setFeedback(lang === 'RU'
        ? `Предупреждение вынесено для ${invitation.studentName}! -1 XP.`
        : `Discipline warning issued for ${invitation.studentName}! -1 XP.`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error issuing discipline warning:", err);
    } finally {
      setUpdatingId(null);
      setWarningActiveId(null);
    }
  };

  const handleRemoveWarning = async (invitation: any, penaltyId: string) => {
    if (!event) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found");
      }

      const currentPenalties = student.penalties || [];
      const penaltyToRemove = currentPenalties.find((p: any) => p.id === penaltyId);
      if (!penaltyToRemove) return;

      const updatedPenalties = currentPenalties.filter((p: any) => p.id !== penaltyId);

      // Refund 1 XP
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = currentXp + 1;

      // Filter notifications
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter(n => n.id !== `penalty_${penaltyId}`);

      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        penalties: updatedPenalties,
        notifications: updatedNotifications
      });

      // Remove from Event profile
      const currentEventPenalties = event.penalties || [];
      const updatedEventPenalties = currentEventPenalties.filter(p => p.id !== penaltyId);
      await updateDoc(doc(db, 'events', event.id), {
        penalties: updatedEventPenalties
      });

      setFeedback(lang === 'RU'
        ? `Предупреждение удалено. 1 XP возвращено.`
        : `Warning removed. 1 XP refunded.`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error removing warning:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleIssueObservation = async (invitation: any, text: string) => {
    if (!event) return;
    if (!text.trim()) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      const observationId = `obs_${Date.now()}`;
      const observationRecord = {
        id: observationId,
        text: text,
        eventId: event.id,
        eventName: event.name,
        date: event.date,
        timestamp: new Date().toISOString(),
        issuedBy: master?.fullName || 'Coach Roman'
      };

      // 1. Update Student profile (registration)
      const currentObservations = student.observations || [];
      const updatedObservations = [...currentObservations, observationRecord];

      // Add a notification about the observation
      const newNotifications = [...(student.notifications || [])];
      newNotifications.unshift({
        id: `obs_${observationId}`,
        title: lang === 'RU' ? 'Заметка тренера 📝' : 'Trainer Note 📝',
        message: lang === 'RU'
          ? `Добавлена новая заметка тренера на занятии "${event.name}": "${text}".`
          : `New trainer note added during class "${event.name}": "${text}".`,
        createdAt: new Date().toISOString(),
        type: 'badge'
      });

      await updateDoc(doc(db, 'registrations', studentId), {
        observations: updatedObservations,
        notifications: newNotifications
      });

      // 2. Update Event profile (event)
      const currentEventObservations = event.observations || [];
      const eventObservationRecord = {
        id: observationId,
        studentId,
        studentName: invitation.studentName,
        text: text,
        timestamp: new Date().toISOString(),
        issuedBy: master?.fullName || 'Coach Roman',
        masterName: master?.fullName || 'Coach Roman'
      };
      await updateDoc(doc(db, 'events', event.id), {
        observations: [...currentEventObservations, eventObservationRecord]
      });

      setFeedback(lang === 'RU'
        ? `Заметка сохранена для ${invitation.studentName}!`
        : `Trainer note saved for ${invitation.studentName}!`
      );
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error issuing trainer note:", err);
    } finally {
      setUpdatingId(null);
      setObservationActiveId(null);
    }
  };

  const handleRemoveObservation = async (invitation: any, observationId: string) => {
    if (!event) return;
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found");
      }

      const currentObservations = student.observations || [];
      const updatedObservations = currentObservations.filter((o: any) => o.id !== observationId);

      // Filter notifications
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter((n: any) => n.id !== `obs_${observationId}`);

      await updateDoc(doc(db, 'registrations', studentId), {
        observations: updatedObservations,
        notifications: updatedNotifications
      });

      // Remove from Event profile
      const currentEventObservations = event.observations || [];
      const updatedEventObservations = currentEventObservations.filter((o: any) => o.id !== observationId);
      await updateDoc(doc(db, 'events', event.id), {
        observations: updatedEventObservations
      });

      setFeedback(lang === 'RU'
        ? `Заметка удалена.`
        : `Trainer note removed.`
      );
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error removing trainer note:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!event?.id) return;
    setIsDeleting(true);
    try {
      // 1. Delete associated invitations from Firestore
      const q = query(collection(db, 'invitations'), where('eventId', '==', event.id));
      const qSnap = await getDocs(q);
      const deletePromises = qSnap.docs.map(docSnap => deleteDoc(doc(db, 'invitations', docSnap.id)));
      await Promise.all(deletePromises);

      // 2. Delete the actual event document
      await deleteDoc(doc(db, 'events', event.id));

      // 3. Clear selectedEventId / Go back to event list
      onBack();
    } catch (err) {
      console.error("Error deleting event within dashboard:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const LOCATIONS = [
    { id: 'airport_runway', label: t.locAirport },
    { id: 'metro_mall', label: t.locMetroMall },
    { id: 'agmashenebeli', label: t.locAgmashenebeli },
    { id: 'pirosmani_5', label: t.locPirosmani5 },
    { id: 'kaczynski_5', label: t.locKaczynski5 },
    { id: 'batumi_boulevard', label: t.locBatumiBoulevard },
  ];

  const locLabel = LOCATIONS.find(l => l.id === event.location)?.label || event.location;

  React.useEffect(() => {
    if (!event?.id) return;
    
    // Fetch invitations
    const q = query(collection(db, 'invitations'), where('eventId', '==', event.id));
    const unsubscribeInv = onSnapshot(q, (snapshot) => {
      const invList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setInvitations(invList);
      setLoading(false);
    });

    // Listen to registrations (students) in real-time
    const qStudents = query(collection(db, 'registrations'), limit(200));
    const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
      const newData: Record<string, any> = {};
      snapshot.docs.forEach(doc => {
        newData[doc.id] = { id: doc.id, ...doc.data() };
      });
      setStudentsData(newData);
    }, (err) => {
      console.error("Error listening to registrations: ", err);
    });

    return () => {
      unsubscribeInv();
      unsubscribeStudents();
    };
  }, [event.id]);

  // 3. Confirm Visit / Award +10 XP
  const handleConfirmVisitDetails = async (invitation: any) => {
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Check if this student has any other confirmed visits (to see if this is the first class)
      const qConfirmed = query(
        collection(db, 'invitations'),
        where('studentId', '==', studentId)
      );
      const confirmedSnap = await getDocs(qConfirmed);
      const confirmedDocs = confirmedSnap.docs.filter((d: any) => d.data().visitConfirmed === true);
      const isFirstVisit = confirmedDocs.length === 0;

      // Calculate new XP
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = currentXp + 10;

      // Awards badge if first visit
      const firstClassBadge = {
        id: 'first_step',
        title: 'First Step / Первый шаг',
        titleRU: 'Первый шаг',
        titleEN: 'First Step',
        titleGE: 'პირველი ნაბიჯი',
        titleTR: 'İlk Adım',
        desc: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach. / Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
        descRU: 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
        descEN: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
        descGE: 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.',
        descTR: 'İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.',
        icon: 'Target',
        date: new Date().toLocaleDateString(lang === 'RU' ? 'ru' : 'en', { month: 'short', year: 'numeric' })
      };

      const currentBadges = student.badges || [];
      const hasBadge = currentBadges.some((b: any) => b.id === 'first_step');
      const updatedBadges = isFirstVisit && !hasBadge ? [...currentBadges, firstClassBadge] : currentBadges;

      // Track notifications
      const newNotifications = [...(student.notifications || [])];
      
      // 1. Visit plus 10 xp notification
      newNotifications.unshift({
        id: `visit_${invitation.id}_xp`,
        title: lang === 'RU' ? 'Посещение подтверждено' : 'Visit Confirmed',
        message: lang === 'RU'
          ? `Успешное посещение занятия "${event?.name || invitation.name || 'Тренировка'}"! В профиль добавлено 10 XP.`
          : `Successful visit to the class "${event?.name || invitation.name || 'Training'}"! 10 XP added to the profile.`,
        createdAt: new Date().toISOString(),
        type: 'xp'
      });

      // 2. Badge notification if it's the first visit
      if (isFirstVisit) {
        newNotifications.unshift({
          id: `visit_${invitation.id}_badge`,
          title: lang === 'RU' ? 'Награда «Первый шаг»' : lang === 'GE' ? 'ჯილდო «პირველი ნაბიჯი»' : '«First Step» Badge Awarded',
          message: lang === 'RU'
            ? 'Получена награда за первое посещение тренировки! Разблокирован значок «Первый шаг».'
            : lang === 'GE'
            ? 'პირველი ვარჯიშის წარმატებით გავლისთვის მიიღეთ ჯილდო «პირველი ნაბიჯი»!'
            : 'First visit confirmed! You have unlocked the «First Step» badge.',
          createdAt: new Date().toISOString(),
          type: 'badge'
        });
      }

      const currentUsed = student.usedPaidClasses !== undefined ? Number(student.usedPaidClasses) : 0;
      const newUsed = currentUsed + 1;

      const triggerReportTask = newUsed >= 10;

      // Update student profile with new XP, badges, and notifications
      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        badges: updatedBadges,
        notifications: newNotifications,
        usedPaidClasses: newUsed,
        ...(triggerReportTask ? { reportTaskPending: true } : {})
      });

      // Update invitation to mark visit confirmed
      await updateDoc(doc(db, 'invitations', invitation.id), {
        visitConfirmed: true,
        attended: true
      });

      // Simple level calculation for feedback toast
      const oldLevel = getStudentLevelInfo(currentXp);
      const newLevel = getStudentLevelInfo(newXp);
      
      let levelUpMsg = "";
      if (oldLevel.title !== newLevel.title) {
        levelUpMsg = lang === 'RU' 
          ? ` 🎉 Уровень повышен до ${newLevel.title.toUpperCase()}!` 
          : ` 🎉 Level up to ${newLevel.title.toUpperCase()}!`;
      }

      setFeedback(lang === 'RU'
        ? `Визит подтвержден для ${invitation.studentName}! +10 XP начислено.${levelUpMsg}`
        : `Visit confirmed for ${invitation.studentName}! +10 XP awarded.${levelUpMsg}`
      );

      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error confirming training visit:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // 4. Undo Confirm Visit / Remove -10 XP
  const handleUndoConfirmVisit = async (invitation: any) => {
    setUpdatingId(invitation.id);
    try {
      const studentId = invitation.studentId;
      const student = studentsData[studentId];
      if (!student) {
        throw new Error("Student profile not found in cache");
      }

      // Query to see if there are other confirmed classes remaining
      const qConfirmed = query(
        collection(db, 'invitations'),
        where('studentId', '==', studentId)
      );
      const confirmedSnap = await getDocs(qConfirmed);
      const otherConfirmedCount = confirmedSnap.docs.filter((d: any) => d.data().visitConfirmed === true && d.id !== invitation.id).length;

      // Calculate new XP (cannot drop below 0)
      const currentXp = student.xp !== undefined ? Number(student.xp) : (student.studentName === 'Luka' ? 1250 : 0);
      const newXp = Math.max(0, currentXp - 10);

      // Clean notifications related to this invitation ID
      const currentNotifications = student.notifications || [];
      const updatedNotifications = currentNotifications.filter(
        (n: any) => !n.id.startsWith(`visit_${invitation.id}`)
      );

      const currentBadges = student.badges || [];
      const updatedBadges = otherConfirmedCount === 0 
        ? currentBadges.filter((b: any) => b.id !== 'first_step') 
        : currentBadges;

      const currentUsed = student.usedPaidClasses !== undefined ? Number(student.usedPaidClasses) : 0;
      const newUsed = Math.max(0, currentUsed - 1);

      // Update student profile with subtracted XP and cleaned badges/notifications
      await updateDoc(doc(db, 'registrations', studentId), {
        xp: newXp,
        badges: updatedBadges,
        notifications: updatedNotifications,
        usedPaidClasses: newUsed
      });

      // Update invitation to remove visit confirmation
      await updateDoc(doc(db, 'invitations', invitation.id), {
        visitConfirmed: false,
        attended: false
      });

      setFeedback(lang === 'RU'
        ? `Подтверждение отозвано для ${invitation.studentName}. -10 XP списано.`
        : `Visit confirmation withdrawn for ${invitation.studentName}. -10 XP removed.`
      );

      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Error undoing training visit:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleWithdraw = async (invitationId: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', invitationId));
    } catch (err) {
      console.error("Error withdrawing invitation:", err);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-brand-navy/5">
        <div className="flex items-center gap-6">
          <button 
            onClick={onBack}
            className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-brand-teal hover:border-brand-teal transition-all group shadow-sm text-brand-navy/40"
          >
            <ChevronRight className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <Badge color="sunset" className="mb-2 italic uppercase">{lang === 'RU' ? 'ДЕТАЛИ СОБЫТИЯ' : 'EVENT DETAILS'}</Badge>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-brand-navy leading-none">{event.name}</h2>
          </div>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-start sm:self-auto">
          <Button
            onClick={() => onEdit(event)}
            className="h-12 px-6 !rounded-xl text-[10px] bg-brand-navy text-white hover:bg-brand-teal font-black italic uppercase tracking-widest shadow-xl flex items-center gap-2 border-none"
          >
            <Edit className="w-4 h-4" />
            {lang === 'RU' ? 'РЕДАКТИРОВАТЬ ДЕТАЛИ' : 'EDIT DETAILS'}
          </Button>
          <Button
            id="delete-event-dashboard-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="h-12 px-6 !rounded-xl text-[10px] bg-red-600 text-white hover:bg-red-700 font-black italic uppercase tracking-widest shadow-xl flex items-center gap-2 border-none"
          >
            <Trash2 className="w-4 h-4" />
            {lang === 'RU' ? 'УДАЛИТЬ' : 'DELETE'}
          </Button>
        </div>
      </div>

      {/* Feedback notification toast */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 rounded-3xl bg-brand-teal text-white shadow-teal font-black italic uppercase tracking-wider text-xs flex items-center gap-3"
          >
            <Trophy className="w-4 h-4 text-white" />
            <span>{feedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="p-6 sm:p-10 rounded-[28px] sm:rounded-[40px] glass border-white/60 shadow-3xl bg-white/70">
         <div className="grid md:grid-cols-2 gap-10">
            {/* Left Column: Date, Time & Location */}
            <div className="space-y-6">
               <div>
                  <p className="text-[10px] font-black uppercase text-brand-navy/30 mb-2 italic">{lang === 'RU' ? 'КОГДА И ГДЕ' : 'WHEN & WHERE'}</p>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-black italic text-brand-navy">
                        {new Date(event.date).getDate()} {new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { month: 'short' }).toUpperCase()}
                      </span>
                      <span className="text-xl font-black italic text-brand-teal">@ {event.startTime}</span>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-brand-sunset italic">
                      {new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long' }).toUpperCase()}
                    </span>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-brand-navy/5 rounded-2xl">
                  <MapPin className="w-5 h-5 text-brand-teal" />
                  <span className="text-xs font-black uppercase italic">{locLabel}</span>
               </div>
            </div>

            {/* Right Column: Publish Feature (Access Status) */}
            <div className="md:pl-8 md:border-l border-brand-navy/5 font-sans space-y-6 flex flex-col justify-start">
               <div>
                  <p className="text-[10px] font-black uppercase text-brand-navy/30 mb-3 italic">{lang === 'RU' ? 'ДОСТУПНОСТЬ' : 'ACCESS STATUS'}</p>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-brand-cream border border-brand-navy/5 rounded-2xl">
                     <div className="flex items-center gap-3 mr-auto">
                        <div className={`w-2.5 h-2.5 rounded-full ${event.isPublic ? 'bg-brand-teal animate-ping' : 'bg-brand-navy/25'}`} />
                        <div>
                           <span className="text-[11px] font-black uppercase italic leading-none block text-brand-navy">
                              {event.isPublic 
                                 ? (lang === 'RU' ? 'Опубликовано' : 'Published') 
                                 : (lang === 'RU' ? 'Черновик (Личное)' : 'Draft (Private)')}
                           </span>
                           <span className="text-[8px] text-brand-navy/40 font-bold uppercase tracking-wider block mt-1">
                              {event.isPublic 
                                 ? (lang === 'RU' ? 'Доступно на публичном сайте' : 'Visible to public audience') 
                                 : (lang === 'RU' ? 'Видно только в портале' : 'Hidden from everyone else')}
                           </span>
                        </div>
                     </div>
                     <Button 
                        variant="outline" 
                        onClick={async () => {
                           try {
                              await updateDoc(doc(db, 'events', event.id), {
                                 isPublic: !event.isPublic
                               });
                           } catch (err) {
                              console.error("Error setting isPublic:", err);
                           }
                        }}
                        className="h-9 px-4 !rounded-xl text-[9px] font-black uppercase tracking-widest italic leading-none shrink-0"
                     >
                        {event.isPublic 
                           ? (lang === 'RU' ? 'СКРЫТЬ' : 'MAKE PRIVATE') 
                           : (lang === 'RU' ? 'ОПУБЛИКОВАТЬ' : 'MAKE PUBLIC')}
                     </Button>
                  </div>
               </div>
            </div>
         </div>

         {/* Full Card Wide Bottom Section: ClassEventAgenda */}
         <div className="mt-8 pt-6 border-t border-brand-navy/5">
            <p className="text-[10px] font-black uppercase text-brand-navy/30 mb-3 italic">{lang === 'RU' ? 'ПОДРОБНЫЙ ПЛАН ЗАНЯТИЯ (ПО ФАЗАМ И БЛОКАМ)' : 'DETAILED CLASS PLAN (PHASES & BLOCKS)'}</p>
            {!(event.p1Selected?.length || event.p2Selected?.length || event.p3Selected?.length || event.p4Selected?.length) && (
              <p className="text-sm font-medium italic text-brand-navy leading-relaxed opacity-80 mb-6">
                {event.description}
              </p>
            )}
            <ClassEventAgenda event={event} lang={lang} />
         </div>
      </Card>

      <div className="space-y-6 pt-6 border-t border-brand-navy/5">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-navy">
               {lang === 'RU' ? 'ПРИГЛАШЕННЫЕ СТУДЕНТЫ' : 'INVITED STUDENTS'} ({invitations.length})
            </h3>
            <Button 
               onClick={() => setShowInviteModal(true)}
               className="h-12 px-8 !rounded-2xl bg-brand-sunset text-white shadow-sunset font-black italic uppercase tracking-widest flex items-center justify-center gap-3 border-none shadow-lg shrink-0"
            >
               <UserPlus className="w-5 h-5" />
               {lang === 'RU' ? 'ПРИГЛАСИТЬ ЕЩЕ СТУДЕНТОВ' : 'INVITE MORE STUDENTS'}
            </Button>
         </div>

         <div className="grid gap-6">
            {loading ? (
              <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 text-brand-teal animate-spin" /></div>
            ) : invitations.length > 0 ? (
              invitations.map((inv, idx) => {
                const s = studentsData[inv.studentId];
                const studentXp = s ? (s.xp !== undefined ? Number(s.xp) : (s.studentName === 'Luka' ? 1250 : 0)) : 0;
                const studentLevel = getStudentLevelInfo(studentXp);
                const isConfirmed = !!inv.visitConfirmed;

                return (
                  <Card key={`${inv.id || 'inv'}_${idx}`} className="p-5 sm:p-8 rounded-[24px] sm:rounded-[48px] glass border-white/60 flex flex-col gap-6 group hover:bg-white transition-all shadow-xl relative overflow-hidden">
                    {/* Status accent */}
                    <div className={`absolute top-0 left-0 w-2 h-full ${
                      isConfirmed ? 'bg-brand-teal' : inv.status === 'declined' ? 'bg-red-500' : 'bg-brand-navy/10'
                    }`} />

                    <div className="flex flex-col md:flex-row items-center gap-6 justify-between w-full">
                      <div className="flex items-center gap-6 flex-1 min-w-0 w-full">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[28px] overflow-hidden border-2 border-white/40 shadow-lg shrink-0">
                          <img 
                            src={s?.studentProfileImage || MOCK_STUDENT.avatar} 
                            className="w-full h-full object-cover"
                            alt={inv.studentName}
                          />
                        </div>

                        <div className="flex-1 text-center md:text-left min-w-0">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                            <h4 className="text-xl sm:text-2xl font-black italic uppercase text-brand-navy tracking-tight leading-none">{inv.studentName}</h4>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                              <Badge color={isConfirmed ? 'teal' : inv.status === 'declined' ? 'red' : 'navy'} className="italic uppercase px-3 text-[9px]">
                                {isConfirmed ? (lang === 'RU' ? 'ПРИСУТСТВОВАЛ' : 'PRESENT') : inv.status}
                              </Badge>
                              <span className="text-[10px] font-black uppercase text-brand-teal italic tracking-widest leading-none">
                                {studentLevel.tier} • {studentLevel.title.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 text-brand-navy/40">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase italic tracking-widest">{lang === 'RU' ? 'ВОЗРАСТ' : 'AGE'}:</span>
                              <span className="text-xs font-black italic text-brand-navy">{s?.studentAge || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase italic tracking-widest">{lang === 'RU' ? 'РОДИТЕЛЬ' : 'PARENT'}:</span>
                              <span className="text-xs font-black italic text-brand-navy">{s?.parentFullName || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black italic text-brand-navy">
                              <Phone className="w-3.5 h-3.5 text-brand-teal" />
                              <span>{inv.studentPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black italic text-brand-navy">
                              <Trophy className="w-3.5 h-3.5 text-brand-teal" />
                              <span>{studentXp} XP</span>
                            </div>
                            {s && s.totalPaidClasses !== undefined && s.totalPaidClasses > 0 && (
                              <div className={`flex items-center gap-2 text-[10px] font-black uppercase italic p-1.5 px-2.5 rounded-lg ${Math.max(0, s.totalPaidClasses - (s.usedPaidClasses || 0)) <= 2 ? 'bg-brand-sunset/15 text-brand-sunset' : 'bg-brand-teal/15 text-brand-teal'}`}>
                                <span>{lang === 'RU' ? 'ОСТАЛОСЬ' : 'PAID LEFT'}:</span>
                                <span>{Math.max(0, s.totalPaidClasses - (s.usedPaidClasses || 0))} / {s.totalPaidClasses}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-wrap sm:flex-nowrap items-center gap-3 w-full md:w-auto justify-center md:justify-end">
                        {/* Notepad button */}
                        <button
                          type="button"
                          disabled={updatingId === inv.id}
                          onClick={() => setObservationActiveId(observationActiveId === inv.id ? null : inv.id)}
                          className={`p-3 px-4 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center gap-2 border ${
                            observationActiveId === inv.id
                              ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                              : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 hover:text-indigo-700 border-indigo-500/20'
                          }`}
                        >
                          <FileText className="w-4 h-4" />
                          {lang === 'RU' ? 'ЗАМЕТКА' : 'NOTEPAD'}
                        </button>

                        {/* Discipline button */}
                        <button
                          type="button"
                          disabled={updatingId === inv.id}
                          onClick={() => setWarningActiveId(warningActiveId === inv.id ? null : inv.id)}
                          className={`p-3 px-4 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center gap-2 border ${
                            warningActiveId === inv.id
                              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                              : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 hover:text-amber-700 border-amber-500/20'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {lang === 'RU' ? 'ДИСЦИПЛИНА' : 'DISCIPLINE'}
                        </button>

                        {isConfirmed ? (
                          <button
                            disabled={updatingId === inv.id}
                            onClick={() => handleUndoConfirmVisit(inv)}
                            className="bg-brand-teal/10 hover:bg-red-50 text-brand-teal hover:text-red-500 border border-brand-teal/20 hover:border-red-100 p-3 px-5 rounded-2xl text-[10px] font-black uppercase italic tracking-wider transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
                            title={lang === 'RU' ? 'Отозвать подтверждение' : 'Withdraw Confirmation'}
                          >
                            <span className="w-2 h-2 rounded-full bg-brand-teal" />
                            {lang === 'RU' ? 'ПОДТВЕРЖДЕНО ✔ (+10 XP)' : 'PRESENT ✔ (+10 XP)'}
                          </button>
                        ) : (
                          <Button
                            disabled={updatingId === inv.id}
                            onClick={() => handleConfirmVisitDetails(inv)}
                            className="h-12 px-6 !rounded-2xl text-[10px] bg-brand-sunset text-white hover:bg-brand-navy font-black italic uppercase tracking-widest shadow-sunset border-none flex-1 sm:flex-initial"
                          >
                            {updatingId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                            ) : (
                              lang === 'RU' ? 'ПОДТВЕРДИТЬ ПОСЕЩЕНИЕ (+10 XP)' : 'CONFIRM VISIT (+10 XP)'
                            )}
                          </Button>
                        )}

                        <button 
                          onClick={() => handleWithdraw(inv.id)}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-brand-navy/20 hover:text-red-500 hover:bg-red-50 transition-all border border-brand-navy/5 hover:border-red-100 group shrink-0"
                          title={lang === 'RU' ? 'Отозвать приглашение' : 'Withdraw Invitation'}
                        >
                          <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Discipline Area */}
                    {warningActiveId === inv.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-brand-navy/5 pt-5 space-y-5 w-full text-left"
                      >
                        {/* Warning Word Input and Submit */}
                        <div className="bg-amber-500/[0.03] p-5 rounded-3xl border border-amber-500/10 space-y-4">
                          <p className="text-[10px] font-black uppercase text-amber-600 italic tracking-wider">
                            {lang === 'RU' ? 'ВЫНЕСТИ ПРЕДУПРЕЖДЕНИЕ (Списание 1 XP)' : 'ISSUE NEW DISCIPLINE WARNING (Deducts 1 XP)'}
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <input
                              type="text"
                              value={warningWord}
                              onChange={(e) => setWarningWord(e.target.value)}
                              placeholder={lang === 'RU' ? 'Введите причину или слово предупреждения...' : 'Enter warning reason or word...'}
                              className="w-full bg-white border border-brand-navy/10 rounded-xl h-11 px-4 text-xs font-black italic text-brand-navy placeholder:text-brand-navy/20 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/40"
                            />
                            <Button
                              onClick={() => handleIssueWarning(inv, warningWord)}
                              className="h-11 px-5 w-full sm:w-auto shrink-0 bg-amber-500 text-white hover:bg-amber-600 font-black italic uppercase text-[10px] tracking-widest border-none rounded-xl"
                            >
                              {lang === 'RU' ? 'ВЫНЕСТИ (-1 XP)' : 'WARN STUDENT (-1 XP)'}
                            </Button>
                          </div>

                          {/* Quick Chips Preset */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {[
                              lang === 'RU' ? 'Отвлеклась/Отвлекся от упражнения' : 'Stay unfocused from an exercise',
                              lang === 'RU' ? 'Нарушение дисциплины' : 'Misbehaving',
                              lang === 'RU' ? 'Не слушает тренера' : 'Not listening to instructions',
                              lang === 'RU' ? 'Не выполняет задание' : 'Not following exercise instructions',
                              lang === 'RU' ? 'Опоздание на тренировку' : 'Being late'
                            ].map((preset, pIdx) => (
                              <button
                                type="button"
                                key={pIdx}
                                onClick={() => setWarningWord(preset)}
                                className="px-3 py-1.5 rounded-full border border-brand-navy/5 bg-white text-[9px] font-black uppercase italic text-brand-navy/60 hover:bg-amber-500/10 hover:text-amber-700 transition-all cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Existing Penalties for this student in this event */}
                        {(() => {
                          const studentPenalties = (s?.penalties || []).filter((p: any) => p.eventId === event.id);
                          if (studentPenalties.length > 0) {
                            return (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-brand-navy/40 italic tracking-wider">
                                  {lang === 'RU' ? 'УЖЕ ВЫНЕСЕННЫЕ ПРЕДУПРЕЖДЕНИЯ НА ЭТОЙ ТРЕНИРОВКЕ' : 'ISSUED WARNINGS IN THIS CLASS'}
                                </p>
                                <div className="grid gap-2 text-left">
                                  {studentPenalties.map((pen: any, penIdx: number) => (
                                    <div
                                      key={`${pen.id || penIdx}`}
                                      className="p-3.5 rounded-xl bg-white border border-brand-navy/5 flex items-center justify-between text-xs text-left"
                                    >
                                      <div className="flex items-center gap-3">
                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                        <div>
                                          <span className="font-black text-brand-navy">"{pen.word}"</span>
                                          <span className="text-[10px] text-brand-navy/40 ml-2">
                                            {new Date(pen.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru' : 'en', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveWarning(inv, pen.id)}
                                        className="text-[9px] font-black text-red-500 hover:text-red-700 hover:underline uppercase italic tracking-wider px-2 py-1 rounded bg-red-50"
                                      >
                                        {lang === 'RU' ? 'ОТМЕНИТЬ ПРЕДУПРЕЖДЕНИЕ (+1 XP)' : 'UNDO WARNING'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </motion.div>
                    )}

                    {/* Expandable Notepad Area */}
                    {observationActiveId === inv.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border-t border-brand-navy/5 pt-5 space-y-5"
                      >
                        <div className="bg-indigo-500/[0.03] p-5 rounded-3xl border border-indigo-500/10 space-y-4">
                          <p className="text-[10px] font-black uppercase text-indigo-600 italic tracking-wider text-left">
                            {lang === 'RU' ? 'НОВАЯ ЗАМЕТКА ТРЕНЕРА (БЕЗ ШТРАФА XP)' : 'ADD BEHAVIORAL OBSERVATION (NO XP DEDUCTION)'}
                          </p>

                          <div className="flex flex-col sm:flex-row items-center gap-3 text-left">
                            <input
                              type="text"
                              value={observationText}
                              onChange={(e) => setObservationText(e.target.value)}
                              placeholder={lang === 'RU' ? 'Введите наблюдение или заметку о поведении...' : 'Enter behavioral observation or note...'}
                              className="w-full bg-white border border-brand-navy/10 rounded-xl h-11 px-4 text-xs font-black italic text-brand-navy placeholder:text-brand-navy/20 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40"
                            />
                            <Button
                              onClick={() => handleIssueObservation(inv, observationText)}
                              className="h-11 px-5 w-full sm:w-auto shrink-0 bg-indigo-500 text-white hover:bg-indigo-600 font-black italic uppercase text-[10px] tracking-widest border-none rounded-xl"
                            >
                              {lang === 'RU' ? 'СОХРАНИТЬ' : 'SAVE NOTE'}
                            </Button>
                          </div>

                          {/* Quick Chips Preset for non-penalty behavior */}
                          <div className="flex flex-wrap gap-2 pt-1 text-left">
                            {[
                              lang === 'RU' ? 'Проявляет отличные лидерские качества' : 'Shows great leadership qualities',
                              lang === 'RU' ? 'Очень старается на тренировке' : 'Trying very hard during training',
                              lang === 'RU' ? 'Помогает другим спортсменам' : 'Helps other athletes',
                              lang === 'RU' ? 'Отличный прогресс в технике' : 'Excellent progress in technique',
                              lang === 'RU' ? 'Внимательно слушает тренера' : 'Listens attentively to instructions'
                            ].map((preset, pIdx) => (
                              <button
                                type="button"
                                key={pIdx}
                                onClick={() => setObservationText(preset)}
                                className="px-3 py-1.5 rounded-full border border-brand-navy/5 bg-white text-[9px] font-black uppercase italic text-brand-navy/60 hover:bg-indigo-500/10 hover:text-indigo-700 transition-all cursor-pointer"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Existing Observations for this student in this event */}
                        {(() => {
                          const studentObs = (s?.observations || []).filter((o: any) => o.eventId === event.id);
                          if (studentObs.length > 0) {
                            return (
                              <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase text-indigo-600/60 italic tracking-wider text-left">
                                  {lang === 'RU' ? 'СОХРАНЕННЫЕ ЗАМЕТКИ НА ЭТОЙ ТРЕНИРОВКЕ' : 'SAVED OBSERVATIONS IN THIS CLASS'}
                                </p>
                                <div className="grid gap-2 text-left">
                                  {studentObs.map((obs: any, obsIdx: number) => (
                                    <div
                                      key={`${obs.id || obsIdx}`}
                                      className="p-3.5 rounded-xl bg-white border border-indigo-500/10 flex items-center justify-between text-xs text-left"
                                    >
                                      <div className="flex items-center gap-3 text-left">
                                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                                        <div className="text-left">
                                          <span className="font-black text-brand-navy">"{obs.text}"</span>
                                          <span className="text-[10px] text-brand-navy/40 ml-2">
                                            {new Date(obs.timestamp).toLocaleTimeString(lang === 'RU' ? 'ru' : 'en', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveObservation(inv, obs.id)}
                                        className="text-[9px] font-black text-red-500 hover:text-red-700 hover:underline uppercase italic tracking-wider px-2 py-1 rounded bg-red-50"
                                      >
                                        {lang === 'RU' ? 'УДАЛИТЬ' : 'DELETE'}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </motion.div>
                    )}
                  </Card>
                );
              })
            ) : (
              <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
                <p className="text-lg font-black italic uppercase text-brand-navy/10">{lang === 'RU' ? 'НИКТО НЕ ПРИГЛАШЕН' : 'NO ONE INVITED YET'}</p>
              </div>
            )}
         </div>

         {/* Discipline Records & Warning Log (Full Width) */}
         <div className="space-y-6 pt-6 border-t border-brand-navy/5">
           <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-amber-500 rounded-full animate-pulse" />
             <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-navy">
               {lang === 'RU' ? 'История дисциплины' : lang === 'GE' ? 'დისციპლინის ისტორია' : lang === 'TR' ? 'Disiplin Geçmişi' : 'Discipline History'}
             </h3>
           </div>

           <Card className="p-6 sm:p-10 bg-white/80 border-white/60 shadow-2xl rounded-[38px] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 text-brand-sunset opacity-5 pointer-events-none">
               <AlertTriangle className="w-32 h-32" />
             </div>

             {event.penalties && event.penalties.length > 0 ? (
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
                         <th className="pb-3 text-right pr-2">{lang === 'RU' ? 'Действие' : lang === 'GE' ? 'მოქმედება' : 'Action'}</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-brand-navy/5">
                       {event.penalties.map((pen: any, idx: number) => {
                         const associatedInv = invitations.find(i => i.studentId === pen.studentId) || { id: 'fallback', studentId: pen.studentId, studentName: pen.studentName };
                         return (
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
                             <td className="py-4 text-right pr-2">
                               <Button
                                 variant="outline"
                                 disabled={updatingId === associatedInv.id}
                                 onClick={() => handleRemoveWarning(associatedInv, pen.id)}
                                 className="h-8 !py-1 !px-3 !rounded-lg text-[9px] uppercase font-black border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 shadow-sm inline-flex items-center gap-1"
                               >
                                 {updatingId === associatedInv.id ? (
                                   <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                 ) : (
                                   <>
                                     <X className="w-2.5 h-2.5" />
                                     {lang === 'RU' ? 'Удалить' : lang === 'GE' ? 'წაშლა' : 'Delete'}
                                   </>
                                 )}
                               </Button>
                             </td>
                           </tr>
                         );
                       })}
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

         {/* AI-Generated Home Task Scheduler Section */}
         <AIHomeTaskScheduler 
           event={event}
           invitations={invitations}
           studentsData={studentsData}
           lang={lang as any}
           onTaskSaved={(savedTask: any) => {
             event.homeTask = savedTask;
           }}
         />
      </div>

      <AnimatePresence>
        {showInviteModal && (
          <InvitationModal 
            event={event} 
            lang={lang} 
            t={t} 
            onClose={() => setShowInviteModal(false)}
            onSuccess={() => setShowInviteModal(false)}
            masterId={master.phone || master.id}
            alreadyInvitedIds={invitations.map(inv => inv.studentId)}
          />
        )}

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
                {lang === 'RU' ? 'Подтверждение удаления' : 'Confirm Deletion'}
              </h3>
              
              <p className="text-sm font-medium italic text-brand-navy/70 leading-relaxed mb-8">
                {lang === 'RU' 
                  ? 'Вы уверены, что хотите навсегда удалить это событие? Это также удалит все связанные приглашения спортсменов и журналы домашних заданий из базы данных.' 
                  : 'Are you sure you want to permanently delete this event? This will also remove all associated athlete invitations and homework logs from the database.'}
              </p>

              <div className="flex gap-3 justify-end">
                <Button
                  id="cancel-dashboard-deletion-btn"
                  variant="outline"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-wider border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5"
                >
                  {lang === 'RU' ? 'Отмена' : 'Cancel'}
                </Button>
                <Button
                  id="confirm-dashboard-deletion-btn"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-wider bg-red-600 hover:bg-red-700 text-white border-none flex items-center justify-center gap-2 shadow-lg"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === 'RU' ? 'Удаление...' : 'Deleting...'}
                    </>
                  ) : (
                    lang === 'RU' ? 'Удалить' : 'Confirm Delete'
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

function InvitationModal({ event, lang, t, onClose, onSuccess, masterId, alreadyInvitedIds = [] }: any) {
  const [students, setStudents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const q = query(collection(db, 'registrations'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInvite = async () => {
    if (selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const invitationData = selectedIds.map(studentId => {
        const student = students.find(s => s.id === studentId);
        return {
          eventId: event.id,
          studentId: student.id,
          studentName: student.studentName,
          studentPhone: student.parentPhone,
          masterId,
          eventDetails: {
            name: event.name,
            date: event.date,
            startTime: event.startTime,
            location: event.location
          }
        };
      });

      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invitations: invitationData }),
      });

      if (!response.ok) {
        throw new Error('Failed to send invitations via API');
      }

      onSuccess();
    } catch (err) {
      console.error("Error sending invitations:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = students.filter(s => 
    s.status === 'approved' &&
    s.studentName.toLowerCase().includes(search.toLowerCase()) && 
    !alreadyInvitedIds.includes(s.id)
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-brand-navy/80 backdrop-blur-md"
    >
      <Card className="max-w-2xl w-full max-h-[85vh] p-5 sm:p-12 glass rounded-[28px] sm:rounded-[64px] border-white/60 shadow-3xl relative flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 rounded-full border border-brand-navy/10 flex items-center justify-center text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8 shrink-0">
          <Badge color="sunset" className="mb-4">{lang === 'RU' ? 'ПРИГЛАШЕНИЕ СТУДЕНТОВ' : 'INVITE STUDENTS'}</Badge>
          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy leading-none mb-2">
            {event.name}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-navy/30">
            {new Date(event.date).toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long' }).toUpperCase()}, {event.date} @ {event.startTime}
          </p>
        </div>

        <div className="mb-6 relative shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-navy/30" />
          <input 
            type="text" 
            placeholder={lang === 'RU' ? 'Поиск студента...' : 'Search student...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/40 border border-brand-navy/5 text-xs font-bold focus:outline-none focus:border-brand-teal transition-all"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 min-h-0 pr-2 custom-scrollbar">
          {loading ? (
            <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-teal" /></div>
          ) : filtered.map((student, idx) => (
            <div 
              key={`${student.id || 'student'}_${idx}`}
              onClick={() => setSelectedIds(prev => prev.includes(student.id) ? prev.filter(id => id !== student.id) : [...prev, student.id])}
              className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${
                selectedIds.includes(student.id) ? 'bg-brand-teal/10 border-brand-teal' : 'bg-white/20 border-transparent hover:bg-white/40'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                selectedIds.includes(student.id) ? 'bg-brand-teal border-brand-teal' : 'border-brand-navy/10'
              }`}>
                {selectedIds.includes(student.id) && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/40">
                <img src={student.studentProfileImage || MOCK_STUDENT.avatar} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black italic uppercase text-brand-navy leading-none mb-1">{student.studentName}</p>
                <p className="text-[9px] font-bold text-brand-navy/30 uppercase tracking-widest">{student.studentLocation}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 mt-4 border-t border-brand-navy/5 shrink-0">
          <Button 
            disabled={selectedIds.length === 0 || isSubmitting}
            onClick={handleInvite}
            className="w-full h-16 !rounded-2xl bg-brand-sunset text-white font-black italic uppercase tracking-widest shadow-sunset"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (lang === 'RU' ? `ОТПРАВИТЬ (${selectedIds.length})` : `SEND INVITATIONS (${selectedIds.length})`)}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

function EfficiencyView({ lang, t, isDemo }: any) {
  const stats = [
    { label: lang === 'RU' ? 'Выносливость' : 'Stamina', value: 85, color: 'teal' },
    { label: lang === 'RU' ? 'Скорость' : 'Speed', value: 92, color: 'sunset' },
    { label: lang === 'RU' ? 'Точность паса' : 'Pass Accuracy', value: 78, color: 'teal' },
    { label: lang === 'RU' ? 'Дриблинг' : 'Dribbling', value: 88, color: 'sunset' },
    { label: lang === 'RU' ? 'Тактика' : 'Tactics', value: 74, color: 'teal' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 relative z-10"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-1.5 h-6 bg-brand-teal rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-widest italic">{lang === 'RU' ? 'АНАЛИЗ ЭФФЕКТИВНОСТИ' : 'EFFICIENCY ANALYSIS'}</h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[56px] glass border-white/60 shadow-3xl">
          <h4 className="text-xl font-black italic uppercase text-brand-navy mb-10">{lang === 'RU' ? 'Основные метрики' : 'Core Metrics'}</h4>
          <div className="space-y-8">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic">{stat.label}</span>
                  <span className="text-xl font-black italic text-brand-navy tracking-tighter">{stat.value}%</span>
                </div>
                <div className="h-2 bg-brand-navy/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className={`h-full ${stat.color === 'teal' ? 'bg-brand-teal shadow-teal' : 'bg-brand-sunset shadow-sunset'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-8">
          <Card className="p-5 sm:p-10 rounded-[24px] sm:rounded-[48px] bg-brand-navy text-white relative overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <Zap className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xs font-black uppercase tracking-widest text-white/40 mb-2 italic">{lang === 'RU' ? 'Интенсивность' : 'Intensity Rate'}</h4>
              <p className="text-6xl font-black italic tracking-tighter mb-4">9.4</p>
              <p className="text-[10px] uppercase font-black text-brand-teal tracking-[0.2em] italic">{lang === 'RU' ? '+12% К ПРОШЛОЙ НЕДЕЛЕ' : '+12% FROM LAST WEEK'}</p>
            </div>
          </Card>
          
          <Card className="p-5 sm:p-10 rounded-[24px] sm:rounded-[48px] glass border-white/60 shadow-xl">
             <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy/40 mb-6 italic">{lang === 'RU' ? 'ТРЕНЕРСКИЙ ИНСАЙТ' : 'COACH INSIGHT'}</h4>
             <p className="text-sm font-medium leading-relaxed italic text-brand-navy">
               {lang === 'RU' 
                 ? "Отличная динамика в скорости принятия решений. Рекомендуем сфокусироваться на точности передач под давлением в следующем тренировочном блоке." 
                 : "Excellent dynamics in decision-making speed. We recommend focusing on pass accuracy under pressure in the next training block."}
             </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function AchievementsView({ lang, t, isDemo, athleteData }: any) {
  const navigate = useNavigate();
  const baseBadges = [
    { title: lang === 'RU' ? 'Железный атлет' : 'Iron Athlete', desc: lang === 'RU' ? '5 тренировок без пропусков' : '5 sessions without miss', icon: Activity, date: 'Jun 2026' },
    { title: lang === 'RU' ? 'Снайпер' : 'Sniper', desc: lang === 'RU' ? '10 голов в упражнениях' : '10 goals in drills', icon: Zap, date: 'Jun 2026' },
    { title: lang === 'RU' ? 'Капитан' : 'Captain', desc: lang === 'RU' ? 'Лидерство в команде' : 'Team leadership', icon: Star, date: 'Jul 2026' },
    { title: lang === 'RU' ? 'Гроза Ворот' : 'Thunder Strike', desc: lang === 'RU' ? 'Лучший бомбардир игрового дня' : 'Top goalscorer of the day', icon: Trophy, date: 'Jun 2026' },
    { title: lang === 'RU' ? 'Ранняя пташка' : 'Early Bird', desc: lang === 'RU' ? 'Прибытие за 15 минут до занятия' : 'Arrival 15 mins before training', icon: Clock, date: 'Jun 2026' },
    { title: lang === 'RU' ? 'Чистая игра' : 'Clean Game', desc: lang === 'RU' ? 'Соблюдение правил и уважение' : 'Outstanding sportsmanship & respect', icon: CheckCircle2, date: 'Jul 2026' },
  ];

  // Map dynamic badges if any exist in the database profile
  const dbBadges = (athleteData?.badges || []).map((b: any) => ({
    title: lang === 'RU' ? (b.titleRU || b.title) : (b.titleEN || b.title),
    desc: lang === 'RU' ? (b.descRU || b.desc) : (b.descEN || b.desc),
    icon: b.icon === 'Target' ? Target : (b.icon === 'Dribbble' ? Dribbble : Target),
    date: b.date
  }));

  // If in demo mode, inject first class visit badge for high fidelity showcase
  if (isDemo && dbBadges.length === 0) {
    dbBadges.push({
      title: lang === 'RU' ? 'Первый шаг' : 'First Step',
      desc: lang === 'RU' ? 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.' : 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
      icon: Target,
      date: 'Jun 2026'
    });
  }

  const badges = [...baseBadges, ...dbBadges];
  const totalBadgesCount = badges.length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 relative z-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-6 bg-brand-sunset rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">{lang === 'RU' ? 'ДОСТИЖЕНИЯ И ТИТУЛЫ' : 'ACHIEVEMENTS & TITLES'}</h3>
        </div>
        <button 
          onClick={() => navigate('/badges')}
          className="text-xs font-black uppercase tracking-widest italic text-brand-teal hover:text-brand-sunset transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>{lang === 'RU' ? 'Гид по значкам →' : 'Badges Guide →'}</span>
        </button>
      </div>

      <Card className="p-6 sm:p-12 rounded-[32px] sm:rounded-[64px] glass-dark border-white/5 text-white flex flex-col md:flex-row items-center gap-6 sm:gap-12 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-96 h-96 bg-brand-teal/10 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
         <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[24px] sm:rounded-[40px] bg-brand-teal flex items-center justify-center shadow-teal shrink-0">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
         </div>
         <div className="flex-1 text-center md:text-left">
            <h4 className="text-2xl sm:text-3xl font-black italic uppercase text-white mb-4 tracking-tighter">
              {lang === 'RU' ? 'Путь к Мастерству' : 'Path to Mastery'}
            </h4>
            <p className="text-white/40 text-xs sm:text-sm font-medium italic leading-relaxed mb-8 max-w-xl">
               {lang === 'RU' 
                 ? "Соберите 10 уникальных значков, чтобы разблокировать титул 'Элитный Атлет' и получить персональную тренировку с главным мастером программы."
                 : "Collect 10 unique badges to unlock the 'Elite Athlete' title and receive a personal training session with the academy's head master."}
            </p>
            <div className="flex items-center gap-4">
               <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-teal rounded-full shadow-teal" style={{ width: `${(totalBadgesCount / 10) * 100}%` }} />
               </div>
               <span className="text-sm font-black italic text-brand-teal">{totalBadgesCount}/10</span>
            </div>
         </div>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {badges.map((badge, i) => (
          <motion.div 
            key={`${badge.title || 'badge'}_${i}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group"
          >
            <Card className="p-5 sm:p-8 rounded-[24px] sm:rounded-[48px] glass border-white/60 text-center hover:bg-white transition-all shadow-xl hover:shadow-2xl">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <badge.icon className="w-6 h-6 sm:w-10 sm:h-10 text-brand-teal" />
              </div>
              <h4 className="text-base sm:text-lg font-black italic uppercase text-brand-navy mb-2 tracking-tight">{badge.title}</h4>
              <p className="text-[10px] text-brand-navy/30 uppercase font-bold italic mb-4 leading-tight">{badge.desc}</p>
              <div className="pt-4 border-t border-brand-navy/5">
                <span className="text-[9px] font-black uppercase tracking-widest text-brand-teal opacity-50">{badge.date}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps & { badge?: number | null, disabled?: boolean }> = ({ icon: Icon, label, active = false, onClick, badge, disabled }) => {
  return (
    <div 
      onClick={disabled ? undefined : onClick}
      className={`flex items-center gap-5 px-8 py-5 rounded-[28px] transition-all duration-700 border group ${
        disabled
          ? 'opacity-30 border-transparent text-white/50 cursor-not-allowed filter grayscale pointer-events-none'
          : active 
            ? 'bg-brand-teal border-brand-teal text-white shadow-teal cursor-pointer' 
            : 'text-white/20 border-transparent hover:text-white hover:bg-white/5 cursor-pointer'
      }`}
    >
      <div className="relative">
        <Icon className={`w-6 h-6 transition-transform duration-500 ${active ? 'scale-110' : !disabled ? 'group-hover:scale-110' : ''}`} />
        {badge && !disabled && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-brand-sunset rounded-full flex items-center justify-center text-[10px] font-black italic shadow-sunset">
            {badge}
          </span>
        )}
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.2em] italic flex items-center gap-1.5">
        {label}
        {disabled && <Lock className="w-3.5 h-3.5 text-white/30" />}
      </span>
      {active && !disabled && (
        <motion.div 
          layoutId="nav-pill"
          className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" 
        />
      )}
    </div>
  );
}

interface AllNotificationsViewProps {
  notifications: any[];
  filter: string;
  onFilterChange: (filter: 'all' | 'invitations' | 'achievements' | 'updates' | 'tasks') => void;
  lang: string;
  t: any;
  onBack: () => void;
  isMaster?: boolean;
  onDeleteNotification?: (notifId: string) => void;
}

function AllNotificationsView({ notifications, filter, onFilterChange, lang, t, onBack, isMaster, onDeleteNotification }: AllNotificationsViewProps) {
  return (
    <div className="space-y-8 relative z-10 text-brand-navy animate-fade-in w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-navy/5">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-brand-navy/40 hover:text-brand-navy transition-colors mb-2"
          >
            &larr; {lang === 'RU' ? 'НАЗАД В ПАНЕЛЬ' : lang === 'GE' ? 'უკან პანელში' : 'BACK TO DASHBOARD'}
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              {t.dashNotifTitle}
            </h2>
            <span className="bg-brand-teal/10 text-brand-teal font-black text-xs px-3 py-1 rounded-full font-mono">
              {notifications.length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'invitations', 'achievements', 'updates', 'tasks'] as const).map((filterOpt) => {
            const label = 
              filterOpt === 'all' 
                ? (lang === 'RU' ? 'Все' : lang === 'GE' ? 'ყველა' : 'All')
                : filterOpt === 'invitations'
                ? (lang === 'RU' ? 'Приглашения' : lang === 'GE' ? 'მოწვევები' : 'Invitations')
                : filterOpt === 'achievements'
                ? (lang === 'RU' ? 'Достижения & XP' : lang === 'GE' ? 'მიღწევები & XP' : 'Progress & XP')
                : filterOpt === 'tasks'
                ? (lang === 'RU' ? 'Задания' : lang === 'GE' ? 'დავალებები' : 'Tasks')
                : (lang === 'RU' ? 'Новости' : lang === 'GE' ? 'სიახლეები' : 'Updates');
            
            const isActive = filter === filterOpt;
            return (
              <button
                key={filterOpt}
                onClick={() => onFilterChange(filterOpt)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${
                  isActive 
                    ? 'bg-brand-navy text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-brand-navy/60 hover:bg-white hover:text-brand-navy border border-brand-navy/5'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full min-w-0">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, idx) => {
              const IconComponent = notif.icon;
              const isUnread = notif.unread;
              
              // Full length details
              const itemBg = isUnread ? 'glass-dark text-white border-brand-teal/30 hover:bg-brand-navy shadow-inner' : 'glass border-white/60 hover:bg-white/85';
              const titleColor = isUnread ? 'text-white' : 'text-brand-navy';
              const descColor = isUnread ? 'text-white/70' : 'text-brand-navy/60';
              const iconBg = notif.color === 'sunset' ? 'bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';

              return (
                <motion.div 
                  layout
                  key={`${notif.id || 'notif'}_${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onClick={() => notif.onClick?.()}
                  className={`p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all shadow-sm hover:shadow-lg w-full min-w-0 ${itemBg} ${notif.onClick ? 'cursor-pointer hover:border-brand-sunset/35' : ''}`}
                >
                  <div className="flex gap-4 items-start sm:items-center min-w-0 flex-1 w-full">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-105 transition-transform ${iconBg}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 w-full mb-1">
                        <h4 className={`text-xs font-black uppercase tracking-widest truncate min-w-0 max-w-[140px] sm:max-w-xs ${titleColor}`}>{notif.title}</h4>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping shrink-0" />
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-35 font-mono truncate">
                          • {new Date(notif.createdAt).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium uppercase italic leading-relaxed break-words ${descColor}`}>{notif.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <span className="px-3 py-1 bg-brand-navy/5 rounded-xl text-[8.5px] font-black uppercase tracking-widest text-brand-navy/50 border border-brand-navy/5 truncate max-w-[120px]">
                      {notif.category === 'invitations' ? (lang === 'RU' ? 'Приглашение' : lang === 'GE' ? 'მოწვევა' : 'Invitation') : 
                       notif.category === 'achievements' ? (lang === 'RU' ? 'Прогресс' : lang === 'GE' ? 'პროგრესი' : 'Progress') : 
                       notif.category === 'tasks' ? (lang === 'RU' ? 'Задание' : lang === 'GE' ? 'დავალება' : 'Task') : 
                       (lang === 'RU' ? 'Обновление' : lang === 'GE' ? 'განახლება' : 'Update')}
                    </span>
                    {isMaster && (notif.id?.startsWith('report_task_notif_') || notif.type === 'report_task') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification?.(notif.id);
                        }}
                        className="p-2 rounded-xl text-brand-navy/40 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        title={lang === 'RU' ? 'Удалить задание' : 'Delete Task'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 text-center glass rounded-[64px] border border-brand-navy/5 max-w-lg mx-auto w-full">
          <Bell className="w-16 h-16 text-brand-navy/10 mx-auto mb-6 animate-bounce" />
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy/40 mb-2">
            {lang === 'RU' ? 'Уведомлений нет' : lang === 'GE' ? 'შეტყობინებები არ არის' : 'No notifications found'}
          </h4>
          <p className="text-xs font-bold text-brand-navy/20 uppercase tracking-wider italic">
            {lang === 'RU' ? 'В этой категории пусто.' : lang === 'GE' ? 'ეს კატეგორია ცარიელია.' : 'Nothing matches this category filter.'}
          </p>
        </div>
      )}
    </div>
  );
}

function ScheduleView({ athleteData, lang, t, onViewEventDetails }: any) {
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  const dummyEvents = React.useMemo(() => getDummyEvents(lang), [lang]);

  const actualIsDemo = !athleteData || !athleteData.parentPhone;

  React.useEffect(() => {
    if (actualIsDemo) {
      setInvitations(dummyEvents);
      setLoading(false);
      return;
    }

    // Fetch invitations
    const qInvitations = query(
      collection(db, 'invitations'),
      where('studentId', '==', athleteData.id)
    );

    const unsubInvitations = onSnapshot(qInvitations, async (snapshot) => {
      const invts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Fetch event details for each invitation
      const eventDetails: any[] = [];
      for (const inv of invts) {
        const qEvent = query(collection(db, 'events'), where('__name__', '==', inv.eventId));
        const eventSnap = await getDocs(qEvent);
        if (!eventSnap.empty) {
          eventDetails.push({
            ...eventSnap.docs[0].data(),
            id: eventSnap.docs[0].id,
            invitationId: inv.id,
            status: inv.status
          });
        }
      }
      setInvitations(eventDetails);
      setLoading(false);
    });

    return () => unsubInvitations();
  }, [athleteData, dummyEvents, actualIsDemo]);

  const handleUpdateInvitation = async (invitationId: string, newStatus: 'accepted' | 'declined') => {
    try {
      if (actualIsDemo) {
        setInvitations(prev => prev.map(evt => (evt.invitationId === invitationId || evt.id === invitationId) ? { ...evt, status: newStatus } : evt));
        return;
      }
      const { doc, updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'invitations', invitationId), { status: newStatus });
    } catch (err) {
      console.error("Error updating invitation:", err);
    }
  };

  const LOCATIONS = [
    { id: 'airport_runway', label: t.locAirport },
    { id: 'metro_mall', label: t.locMetroMall },
    { id: 'agmashenebeli', label: t.locAgmashenebeli },
    { id: 'pirosmani_5', label: t.locPirosmani5 },
    { id: 'kaczynski_5', label: t.locKaczynski5 },
    { id: 'batumi_boulevard', label: t.locBatumiBoulevard },
  ];

  const getFullLoc = (id: string) => LOCATIONS.find(l => l.id === id)?.label || id;

  const allEvents = [...invitations].sort((a, b) => {
    const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.startTime || '').localeCompare(a.startTime || '');
  });

  return (
    <div className="space-y-8 relative z-10">
      {actualIsDemo && (
        <Card className="p-6 md:p-8 rounded-[32px] sm:rounded-[40px] border border-brand-sunset/30 bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sunset/15 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center md:text-left space-y-2">
              <Badge color="sunset" className="text-[9px] uppercase italic tracking-widest">
                {lang === 'RU' ? 'ПРИСОЕДИНЯЙТЕСЬ К НАМ' : lang === 'GE' ? 'შემოგვიერთდით' : 'JOIN THE ACADEMY'}
              </Badge>
              <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tight text-white leading-tight">
                {lang === 'RU' ? 'Хотите записаться на новые тренировки?' : lang === 'GE' ? 'გსურთ ახალ ვარჯიშებზე ჩაწერა?' : 'Want to book more training sessions?'}
              </h3>
              <p className="text-xs text-white/50 font-medium">
                {lang === 'RU' 
                  ? 'Заполните быструю регистрационную форму, чтобы зарезервировать место и получить доступ к полному расписанию.' 
                  : lang === 'GE'
                  ? 'გაიარეთ სწრაფი რეგისტრაცია სრული ფუნქციონალის მისაღებად და ადგილის დასაჯავшნად.'
                  : 'Fill the quick registration form to lock your spot and unlock full platform capabilities.'}
              </p>
            </div>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full md:w-auto h-12 px-8 rounded-2xl bg-brand-sunset hover:bg-brand-sunset/90 text-white font-black uppercase italic tracking-wider text-xs shadow-sunset shadow-lg shrink-0 transition-transform hover:scale-105"
            >
              {lang === 'RU' ? 'Зарегистрироваться' : lang === 'GE' ? 'რეგისტრაცია' : 'Register Now'}
            </Button>
          </div>
        </Card>
      )}
      <div className="grid gap-6">
        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
          </div>
        ) : allEvents.length > 0 ? (
          allEvents.map((event, idx) => {
            const isTraining = event.type === 'training';
            const eventDate = new Date(event.date);
            const statusLabel = event.status === 'accepted' ? t.dashStatusConfirmed : 
                              event.status === 'pending' ? (lang === 'RU' ? 'Приглашен' : 'Invited') :
                              event.status === 'declined' ? (lang === 'RU' ? 'Отклонено' : 'Declined') : t.dashStatusConfirmed;

            return (
              <motion.div
                key={`${event.invitationId || event.id || 'event'}_${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => onViewEventDetails ? onViewEventDetails(event.id) : navigate(`/events/${event.id}`)}
                className={`p-8 md:p-10 rounded-[48px] border transition-all flex flex-col md:flex-row items-center gap-8 group cursor-pointer ${
                  isTraining 
                    ? 'glass-dark border-white/5 text-white hover:bg-brand-navy' 
                    : 'glass border-brand-sunset/20 text-brand-navy hover:bg-white'
                }`}
              >
                <div className={`w-24 h-24 rounded-[32px] flex flex-col items-center justify-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform ${
                  isTraining ? 'bg-brand-teal text-white shadow-teal' : 'bg-brand-sunset text-white shadow-sunset'
                }`}>
                  <span className="text-[10px] uppercase font-black leading-none opacity-60 mb-1">
                    {eventDate.toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { weekday: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-4xl font-black leading-none italic tracking-tighter">
                    {eventDate.getDate()}
                  </span>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                    <Badge color={isTraining ? 'teal' : 'sunset'} className="text-[9px] uppercase italic">
                      {isTraining ? (lang === 'RU' ? 'ТРЕНИРОВКА' : 'TRAINING') : (lang === 'RU' ? 'СОБЫТИЕ' : 'EVENT')}
                    </Badge>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isTraining ? 'text-white/40' : 'text-brand-teal'}`}>
                      {eventDate.toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : lang === 'TR' ? 'tr-TR' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-4 group-hover:translate-x-2 transition-transform">
                    {event.name}
                  </h4>
                  <div className={`flex flex-wrap justify-center md:justify-start items-center gap-6 text-brand-navy/40 group-hover:text-brand-navy transition-colors ${isTraining ? 'text-white/40' : ''}`}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                      <Clock className="w-4 h-4 text-brand-teal" />
                      <span className={isTraining ? 'text-white/40' : ''}>{event.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      <span className={isTraining ? 'text-white/40' : ''}>{getFullLoc(event.location)}</span>
                    </div>
                  </div>

                  {/* Clean Summarized preview as part of this event card - Program & Homework pills */}
                  <div className="mt-6 pt-4 border-t border-brand-navy/10 dark:border-white/10 flex flex-wrap gap-3 justify-center md:justify-start">
                    <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic flex items-center gap-1.5 ${isTraining ? 'bg-white/10 text-brand-teal' : 'bg-brand-navy/5 text-brand-navy/80'}`}>
                      <ClipboardList className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{lang === 'RU' ? 'План занятия включен' : 'Class Program Included'}</span>
                    </div>

                    {event.homeTask && (() => {
                      const listCompletedEvents = athleteData?.completedHomeTasks || [];
                      const isCompleted = listCompletedEvents.includes(event.id) || 
                        (event.homeTask.completedByAthleteIds && event.homeTask.completedByAthleteIds.includes(athleteData?.id));

                      return (
                        <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider italic flex items-center gap-1.5 ${isCompleted ? 'bg-brand-teal/15 text-brand-teal' : 'bg-brand-sunset/15 text-brand-sunset'}`}>
                          <Home className="w-3.5 h-3.5" />
                          <span>
                            {lang === 'RU' ? `Домашка: ${event.homeTask.title}` : `Homework: ${event.homeTask.title}`}
                          </span>
                          {isCompleted && (
                            <span className="text-[8px] font-black bg-brand-teal/20 text-brand-teal px-1 rounded">✓</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-center md:items-end gap-3" onClick={(e) => e.stopPropagation()}>
                  <Badge 
                    color={event.status === 'accepted' || isTraining ? 'teal' : (event.status === 'declined' ? 'red' : (isTraining ? 'white' : 'navy'))} 
                    className="uppercase italic px-6 py-2 rounded-2xl shadow-lg border-white/10 font-black tracking-widest text-[10px]"
                  >
                    {statusLabel}
                  </Badge>

                  <Button
                    onClick={() => onViewEventDetails ? onViewEventDetails(event.id) : navigate(`/events/${event.id}`)}
                    className="h-11 px-6 !rounded-2xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 text-white bg-brand-sunset hover:bg-brand-teal hover:scale-105 transition-transform"
                  >
                    <span>{lang === 'RU' ? 'ПОДРОБНЕЕ' : 'VIEW DETAILS'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  {event.status === 'pending' && !isTraining && (
                    <div className="flex gap-2">
                       <Button 
                         onClick={() => handleUpdateInvitation(event.invitationId, 'accepted')}
                         className="h-11 px-6 !rounded-2xl text-[9px] font-black italic shadow-teal bg-brand-teal border-brand-teal"
                       >
                        {lang === 'RU' ? 'ПРИНЯТЬ' : 'ACCEPT'}
                      </Button>
                      <Button 
                        variant="ghost"
                        onClick={() => handleUpdateInvitation(event.invitationId, 'declined')}
                        className="h-11 px-4 !rounded-2xl text-[9px] font-black italic border-brand-navy/10 text-brand-navy/40"
                       >
                        {lang === 'RU' ? 'ОТКЛОНИТЬ' : 'DECLINE'}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="p-6 sm:p-20 text-center glass rounded-[24px] sm:rounded-[40px] border-white/60">
            <p className="text-xl font-black italic uppercase text-brand-navy/20">{lang === 'RU' ? 'СОБЫТИЙ НЕ НАЙДЕНО' : 'NO EVENTS FOUND'}</p>
          </div>
        )}
      </div>


    </div>
  );
}

function BypassedAllNotificationsView({ notifications, filter, onFilterChange, lang, t, onBack, isMaster, onDeleteNotification }: any) {
  return (
    <div className="space-y-8 relative z-10 text-brand-navy animate-fade-in w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-navy/5">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-brand-navy/40 hover:text-brand-navy transition-colors mb-2"
          >
            &larr; {lang === 'RU' ? 'НАЗАД В ПАНЕЛЬ' : lang === 'GE' ? 'უკან პანელში' : 'BACK TO DASHBOARD'}
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              {t.dashNotifTitle}
            </h2>
            <span className="bg-brand-teal/10 text-brand-teal font-black text-xs px-3 py-1 rounded-full font-mono">
              {notifications.length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'invitations', 'achievements', 'updates', 'tasks'] as const).map((filterOpt) => {
            const label = 
              filterOpt === 'all' 
                ? (lang === 'RU' ? 'Все' : lang === 'GE' ? 'ყველა' : 'All')
                : filterOpt === 'invitations'
                ? (lang === 'RU' ? 'Приглашения' : lang === 'GE' ? 'მოწვევები' : 'Invitations')
                : filterOpt === 'achievements'
                ? (lang === 'RU' ? 'Достижения & XP' : lang === 'GE' ? 'მიღწევები & XP' : 'Progress & XP')
                : filterOpt === 'tasks'
                ? (lang === 'RU' ? 'Задания' : lang === 'GE' ? 'დავალებები' : 'Tasks')
                : (lang === 'RU' ? 'Новости' : lang === 'GE' ? 'სიახლეები' : 'Updates');
            
            const isActive = filter === filterOpt;
            return (
              <button
                key={filterOpt}
                onClick={() => onFilterChange(filterOpt)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${
                  isActive 
                    ? 'bg-brand-navy text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-brand-navy/60 hover:bg-white hover:text-brand-navy border border-brand-navy/5'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full min-w-0">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, idx) => {
              const IconComponent = notif.icon;
              const isUnread = notif.unread;
              
              // Full length details
              const itemBg = isUnread ? 'glass-dark text-white border-brand-teal/30 hover:bg-brand-navy shadow-inner' : 'glass border-white/60 hover:bg-white/85';
              const titleColor = isUnread ? 'text-white' : 'text-brand-navy';
              const descColor = isUnread ? 'text-white/70' : 'text-brand-navy/60';
              const iconBg = notif.color === 'sunset' ? 'bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';

              return (
                <motion.div 
                  layout
                  key={`${notif.id || 'notif'}_${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onClick={() => notif.onClick?.()}
                  className={`p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all shadow-sm hover:shadow-lg w-full min-w-0 ${itemBg} ${notif.onClick ? 'cursor-pointer hover:border-brand-sunset/35' : ''}`}
                >
                  <div className="flex gap-4 items-start sm:items-center min-w-0 flex-1 w-full">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-105 transition-transform ${iconBg}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 w-full mb-1">
                        <h4 className={`text-xs font-black uppercase tracking-widest truncate min-w-0 max-w-[140px] sm:max-w-xs ${titleColor}`}>{notif.title}</h4>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping shrink-0" />
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-35 font-mono truncate">
                          • {new Date(notif.createdAt).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium uppercase italic leading-relaxed break-words ${descColor}`}>{notif.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <span className="px-3 py-1 bg-brand-navy/5 rounded-xl text-[8.5px] font-black uppercase tracking-widest text-brand-navy/50 border border-brand-navy/5 truncate max-w-[120px]">
                      {notif.category === 'invitations' ? (lang === 'RU' ? 'Приглашение' : lang === 'GE' ? 'მოწვევა' : 'Invitation') : 
                       notif.category === 'achievements' ? (lang === 'RU' ? 'Прогресс' : lang === 'GE' ? 'პროგრესი' : 'Progress') : 
                       notif.category === 'tasks' ? (lang === 'RU' ? 'Задание' : lang === 'GE' ? 'დავალება' : 'Task') : 
                       (lang === 'RU' ? 'Обновление' : lang === 'GE' ? 'განახლება' : 'Update')}
                    </span>
                    {isMaster && (notif.id?.startsWith('report_task_notif_') || notif.type === 'report_task') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteNotification?.(notif.id);
                        }}
                        className="p-2 rounded-xl text-brand-navy/40 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                        title={lang === 'RU' ? 'Удалить задание' : 'Delete Task'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 text-center glass rounded-[64px] border border-brand-navy/5 max-w-lg mx-auto w-full">
          <Bell className="w-16 h-16 text-brand-navy/10 mx-auto mb-6 animate-bounce" />
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy/40 mb-2">
            {lang === 'RU' ? 'Уведомлений нет' : lang === 'GE' ? 'შეტყობინებები არ არის' : 'No notifications found'}
          </h4>
          <p className="text-xs font-bold text-brand-navy/20 uppercase tracking-wider italic">
            {lang === 'RU' ? 'В этой категории пусто.' : lang === 'GE' ? 'ეს კატეგორია ცარიელია.' : 'Nothing matches this category filter.'}
          </p>
        </div>
      )}
    </div>
  );
}

interface SkillsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: any;
  lang: string;
}

function SkillsReportModal({ isOpen, onClose, athlete, lang }: SkillsReportModalProps) {
  if (!isOpen) return null;

  const studentName = athlete?.studentName || athlete?.name || 'Luka';
  const age = athlete?.studentAge || athlete?.age || 8;
  const group = athlete?.trainingGroup || athlete?.group || 'U-9 Development';

  // Get current date for the header
  const reportMonthYear = lang === 'RU' ? 'Май 2026' : lang === 'GE' ? '2026 წლის მაისი' : 'May 2026';

  const skillsList = athlete?.skills || MOCK_STUDENT.skills;

  const overallScore = Math.round(
    skillsList.reduce((acc: number, curr: any) => acc + curr.value, 0) / skillsList.length
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-brand-navy/60 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 180 }}
        className="relative w-full max-w-2xl bg-brand-cream border border-brand-navy/10 rounded-[24px] sm:rounded-[48px] shadow-[0_50px_100px_-20px_rgba(3,10,36,0.3)] overflow-hidden flex flex-col max-h-[85vh] z-10 text-brand-navy"
      >
        {/* Header decoration */}
        <div className="p-5 sm:p-10 pb-6 border-b border-brand-navy/5 flex items-center justify-between bg-gradient-to-r from-brand-navy to-brand-navy/95 text-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge color="teal" className="text-[9px] uppercase italic tracking-widest leading-none py-1 px-3">
                {lang === 'RU' ? 'ОТЧЕТНЫЙ ПЕРИОД' : 'REPORT PERIOD'}
              </Badge>
              <span className="text-xs font-black uppercase text-brand-teal italic font-mono tracking-wider">{reportMonthYear}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-tight">
              {lang === 'RU' ? 'СПОРТИВНЫЙ ПАСПОРТ' : 'ATHLETE SPORT PASSPORT'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-10 overflow-y-auto space-y-8 flex-1">
          {/* Athlete Info Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/60 border border-brand-navy/5 rounded-3xl">
            <div className="w-20 h-20 rounded-[24px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-teal shrink-0">
              <img src={athlete?.studentProfileImage || MOCK_STUDENT.avatar} alt={studentName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-2xl font-black italic uppercase text-brand-navy leading-none mb-2">{studentName}</h4>
              <p className="text-[10px] text-brand-navy/40 font-black uppercase tracking-widest mb-1 italic">
                {lang === 'RU' ? `Возраст: ${age} лет` : `Age: ${age} years`} &bull; {lang === 'RU' ? `Группа: ${group}` : `Group: ${group}`}
              </p>
              <p className="text-[10px] text-brand-teal uppercase font-black tracking-widest italic leading-none">
                {lang === 'RU' ? 'Действующий статус: Прогрессирует' : 'Current Status: Progressing'}
              </p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-[9px] text-brand-navy/30 uppercase font-black tracking-widest mb-1">{lang === 'RU' ? 'ОБЩИЙ ИНДЕКС' : 'OVERALL RATING'}</p>
              <div className="text-5xl font-black italic text-brand-teal font-mono tracking-tighter leading-none">
                {overallScore}%
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h5 className="text-[11px] font-black uppercase tracking-widest text-brand-navy/40 italic">
              {lang === 'RU' ? 'РАЗВИТИЕ ПРОФЕССИОНАЛЬНЫХ НАВЫКОВ' : 'CORE SKILL TREE ASSESSMENT'}
            </h5>
            
            <div className="grid gap-6">
              {skillsList.map((skill: any, idx: number) => {
                const label = lang === 'RU' ? skill.labelRU || skill.label : lang === 'GE' ? skill.labelGE || skill.label : skill.label;
                return (
                  <div key={`${skill.key || 'skill'}_${idx}`} className="p-5 bg-white/40 border border-brand-navy/5 rounded-2xl group flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <span className="text-sm font-black uppercase tracking-widest text-brand-navy block italic mb-0.5">{label}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/20 italic font-bold">
                          {skill.value >= 85 ? (lang === 'RU' ? 'Мастерство' : 'Elite Class') : 
                           skill.value >= 70 ? (lang === 'RU' ? 'Хорошо' : 'Advanced Class') : (lang === 'RU' ? 'Развитие' : 'Improving')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 max-w-xs flex items-center gap-4">
                      <div className="flex-1 h-2 bg-brand-navy/5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-brand-teal"
                          style={{ width: `${skill.value}%` }}
                        />
                      </div>
                      <span className="font-black italic text-xl tracking-tighter text-brand-navy font-mono w-12 text-right">{skill.value}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coach Feedback Section */}
          <div className="p-6 bg-brand-navy text-white rounded-3xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Trophy className="w-24 h-24" />
            </div>
            
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal italic mb-3">
              {lang === 'RU' ? 'РЕЗЮМЕ ТЕХНИЧЕСКОГО ДИРЕКТОРА' : 'CHIEF TECHNICAL DIRECTOR COMMENTARY'}
            </h5>
            
            <p className="text-xs text-white/75 font-bold italic leading-relaxed uppercase tracking-tight mb-4">
              {lang === 'RU' 
                ? `«За отчетный период ${reportMonthYear}, ${studentName} показал исключительную дисциплину и желание совершенствоваться на тренировках. Зафиксирован стабильный рост показателей взрывной силы и точности. Рекомендуется продолжать фокусироваться на домашних практиках для закрепления баланса.»`
                : `“Over the report period of ${reportMonthYear}, ${studentName} has committed exceptional dedication and high levels of focus. We monitored significant athletic strides in ball tracking, reaction-rate control, and speed endurance parameters. Keep up the high effort in domestic homework routines!”`
              }
            </p>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/15">
                <img src="/Images/tech_director_01.png" alt="Coach Roman" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white italic">{lang === 'RU' ? 'Роман Горбунов' : 'Roman Gorbunov'}</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-brand-teal/60 italic">{lang === 'RU' ? 'Технический Директор' : 'Author of Holistic Program & Director'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 sm:p-8 border-t border-brand-navy/5 flex flex-wrap sm:flex-nowrap justify-end gap-3 sm:gap-4 bg-white/30">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="px-6 rounded-2xl text-[10px] uppercase font-black italic text-brand-navy/50 hover:text-brand-navy h-12"
          >
            {lang === 'RU' ? 'ЗАКРЫТЬ' : 'CLOSE'}
          </Button>
          <Button 
            onClick={() => window.print()}
            className="px-6 rounded-2xl text-[10px] uppercase font-black italic bg-brand-teal text-white shadow-teal h-12"
          >
            {lang === 'RU' ? 'ПЕЧАТЬ ↗' : 'PRINT REPORT ↗'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

interface AllNotificationsViewProps_Bypassed {
  notifications: any[];
  filter: string;
  onFilterChange: (filter: 'all' | 'invitations' | 'achievements' | 'updates') => void;
  lang: string;
  t: any;
  onBack: () => void;
}

function BypassedAllNotificationsView2({ notifications, filter, onFilterChange, lang, t, onBack }: AllNotificationsViewProps_Bypassed) {
  return (
    <div className="space-y-8 relative z-10 text-brand-navy animate-fade-in w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-navy/5">
        <div>
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 text-[10px] font-black tracking-[0.3em] uppercase text-brand-navy/40 hover:text-brand-navy transition-colors mb-2"
          >
            &larr; {lang === 'RU' ? 'НАЗАД В ПАНЕЛЬ' : lang === 'GE' ? 'უკან პანელში' : 'BACK TO DASHBOARD'}
          </button>
          <div className="flex items-center gap-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none">
              {t.dashNotifTitle}
            </h2>
            <span className="bg-brand-teal/10 text-brand-teal font-black text-xs px-3 py-1 rounded-full font-mono">
              {notifications.length}
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'invitations', 'achievements', 'updates'] as const).map((filterOpt) => {
            const label = 
              filterOpt === 'all' 
                ? (lang === 'RU' ? 'Все' : lang === 'GE' ? 'ყველა' : 'All')
                : filterOpt === 'invitations'
                ? (lang === 'RU' ? 'Приглашения' : lang === 'GE' ? 'მოწვევები' : 'Invitations')
                : filterOpt === 'achievements'
                ? (lang === 'RU' ? 'Достижения & XP' : lang === 'GE' ? 'მიღწευები & XP' : 'Progress & XP')
                : (lang === 'RU' ? 'Новости' : lang === 'GE' ? 'სიახლეები' : 'Updates');
            
            const isActive = filter === filterOpt;
            return (
              <button
                key={filterOpt}
                onClick={() => onFilterChange(filterOpt)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all ${
                  isActive 
                    ? 'bg-brand-navy text-white shadow-lg scale-105' 
                    : 'bg-white/60 text-brand-navy/60 hover:bg-white hover:text-brand-navy border border-brand-navy/5'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full min-w-0">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, idx) => {
              const IconComponent = notif.icon;
              const isUnread = notif.unread;
              
              // Full length details
              const itemBg = isUnread ? 'glass-dark text-white border-brand-teal/30 hover:bg-brand-navy shadow-inner' : 'glass border-white/60 hover:bg-white/85';
              const titleColor = isUnread ? 'text-white' : 'text-brand-navy';
              const descColor = isUnread ? 'text-white/70' : 'text-brand-navy/60';
              const iconBg = notif.color === 'sunset' ? 'bg-brand-sunset/10 text-brand-sunset border-brand-sunset/20' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';

              return (
                <motion.div 
                  layout
                  key={`${notif.id || 'notif'}_${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  onClick={() => notif.onClick?.()}
                  className={`p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] border flex flex-col md:flex-row md:items-center justify-between gap-4 group transition-all shadow-sm hover:shadow-lg w-full min-w-0 ${itemBg} ${notif.onClick ? 'cursor-pointer hover:border-brand-sunset/35' : ''}`}
                >
                  <div className="flex gap-4 items-start sm:items-center min-w-0 flex-1 w-full">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-inner group-hover:scale-105 transition-transform ${iconBg}`}>
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 w-full mb-1">
                        <h4 className={`text-xs font-black uppercase tracking-widest truncate min-w-0 max-w-[140px] sm:max-w-xs ${titleColor}`}>{notif.title}</h4>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-sunset animate-ping shrink-0" />
                        )}
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-35 font-mono truncate">
                          • {new Date(notif.createdAt).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className={`text-[10px] font-medium uppercase italic leading-relaxed break-words ${descColor}`}>{notif.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                    <span className="px-3 py-1 bg-brand-navy/5 rounded-xl text-[8.5px] font-black uppercase tracking-widest text-brand-navy/50 border border-brand-navy/5 truncate max-w-[120px]">
                      {notif.category === 'invitations' ? (lang === 'RU' ? 'Приглашение' : lang === 'GE' ? 'მოწვევა' : 'Invitation') : 
                       notif.category === 'achievements' ? (lang === 'RU' ? 'Прогресс' : lang === 'GE' ? 'პროგრესი' : 'Progress') : 
                       (lang === 'RU' ? 'Обновление' : lang === 'GE' ? 'განახლება' : 'Update')}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="py-24 text-center glass rounded-[64px] border border-brand-navy/5 max-w-lg mx-auto w-full">
          <Bell className="w-16 h-16 text-brand-navy/10 mx-auto mb-6 animate-bounce" />
          <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy/40 mb-2">
            {lang === 'RU' ? 'Уведомлений нет' : lang === 'GE' ? 'შეტყобინებები არ არის' : 'No notifications found'}
          </h4>
          <p className="text-xs font-bold text-brand-navy/20 uppercase tracking-wider italic">
            {lang === 'RU' ? 'В этой категории пусто.' : lang === 'GE' ? 'ეს კატეგორია ცარიელია.' : 'Nothing matches this category filter.'}
          </p>
        </div>
      )}
    </div>
  );
}
