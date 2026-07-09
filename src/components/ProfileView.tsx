import React from 'react';
import { motion } from 'motion/react';
import { Button, Card, Badge, Input } from './UI';
import { MOCK_STUDENT, LOCATIONS } from '../constants';
import { doc, onSnapshot, query, collection, where, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db, processRegistrationStatus } from '../lib/firebase';
import { PatternFormat } from 'react-number-format';
import { getStudentLevelInfo } from './AthleteParametersDashboard';
import { 
  BarChart3, Clock, MapPin, Trophy, Users, Zap, LayoutGrid, Settings, LogOut, ChevronRight, 
  Activity, Bell, Star, Target, CheckCircle2, User, Phone, Search, Loader2, X, UserPlus, 
  Dribbble, Mail, Check, Edit, Home, Lock, Trash2, Copy, ClipboardList, Plus, ChevronUp, 
  ChevronDown, GripVertical, Calendar, Award, History, ChevronLeft, FileText, CreditCard, 
  PlusSquare, Minus, AlertTriangle, AlertCircle
} from 'lucide-react';

const getBadgeIcon = (iconName: string) => {
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

export default function ProfileView({ 
  athleteData, 
  masterData, 
  lang, 
  t, 
  studentAvatar, 
  getFullLocation, 
  isDemo, 
  onLogout, 
  showAccountOnly, 
  onUpdateAthleteData, 
  onUpdateMasterData,
  initialTab,
  hideHeaderCard,
  forcedTab
}: any) {
  const isMaster = !!masterData;
  const isMasterProfile = isMaster && !athleteData;

  const [activeAthleteState, setActiveAthleteState] = React.useState<any>(null);
  const syncedAthletesRef = React.useRef<Set<string>>(new Set());
  const [profileTabState, setProfileTabState] = React.useState<'dossier' | 'balance'>(() => {
    if (initialTab) return initialTab;
    return (localStorage.getItem('profileActiveSubTab') as any) || 'dossier';
  });

  const profileTab = forcedTab || (showAccountOnly ? 'dossier' : profileTabState);

  React.useEffect(() => {
    if (initialTab) {
      setProfileTabState(initialTab);
    }
  }, [initialTab]);

  const changeProfileTab = (tab: 'dossier' | 'balance') => {
    setProfileTabState(tab);
    localStorage.setItem('profileActiveSubTab', tab);
  };

  const [demoTotal, setDemoTotal] = React.useState(() => {
    return athleteData?.totalPaidClasses ?? 16;
  });
  const [demoUsed, setDemoUsed] = React.useState(() => {
    return athleteData?.usedPaidClasses ?? 10;
  });
  
  React.useEffect(() => {
    if (!athleteData) {
      setActiveAthleteState(null);
      return;
    }
    setActiveAthleteState(athleteData);
  }, [athleteData]);
  
  React.useEffect(() => {
    if (isDemo || !athleteData?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'registrations', athleteData.id), (docSnap) => {
      if (docSnap.exists()) {
        setActiveAthleteState({ id: docSnap.id, ...docSnap.data() });
      }
    }, (error) => {
      console.warn("Error listening to registration in ProfileView:", error);
    });
    return () => unsubscribe();
  }, [athleteData?.id, isDemo]);
  
  const defaultDemoAthlete = React.useMemo(() => ({
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
  }), [lang, demoTotal, demoUsed]);

  const rawAthlete = isDemo ? (activeAthleteState || defaultDemoAthlete) : (activeAthleteState || athleteData);
  const displayAthlete = React.useMemo(() => {
    if (!rawAthlete || !rawAthlete.id) return rawAthlete;
    const offlineSaved = localStorage.getItem(`localOfflineUpdates_${rawAthlete.id}`);
    if (offlineSaved) {
      try {
        const offlineData = JSON.parse(offlineSaved);
        return {
          ...rawAthlete,
          ...offlineData
        };
      } catch (e) {
        console.error("Error parsing offline updates", e);
      }
    }
    return rawAthlete;
  }, [rawAthlete]);

  const penaltiesList = displayAthlete?.penalties || [];
  const observationsList = displayAthlete?.observations || [];

  const [feedback, setFeedback] = React.useState<{ type: 'success' | 'res_error'; text: string } | null>(null);

  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = React.useState(false);
  const [feedbackText, setFeedbackText] = React.useState('');
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = React.useState(false);
  const [editingObsId, setEditingObsId] = React.useState<string | null>(null);
  const [editingObsText, setEditingObsText] = React.useState<string>('');

  const handleGenerateVisitedSummary = async () => {
    if (isGeneratingSummary) return;
    setIsGeneratingSummary(true);
    try {
      const response = await fetch('/api/gemini/generate-visited-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          visitedEvents,
          lang
        })
      });
      const data = await response.json();
      if (data.success && data.summary) {
        if (feedbackText.trim()) {
          setFeedbackText(prev => `${data.summary}\n\n${prev}`);
        } else {
          setFeedbackText(data.summary);
        }
        setFeedback({
          type: 'success',
          text: lang === 'RU' ? 'Резюме занятий успешно сгенерировано!' : 'Visited classes summary successfully generated!'
        });
        setTimeout(() => setFeedback(null), 5000);
      } else {
        console.error("Failed to generate summary:", data.error);
        setFeedback({
          type: 'res_error',
          text: lang === 'RU' ? 'Не удалось сгенерировать резюме.' : 'Failed to generate summary.'
        });
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Error generating taken classes summary:", err);
      setFeedback({
        type: 'res_error',
        text: lang === 'RU' ? 'Ошибка при запросе к серверу.' : 'Error contacting server.'
      });
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  React.useEffect(() => {
    if (!displayAthlete?.id) return;
    const flag = localStorage.getItem(`openFeedbackForm_${displayAthlete.id}`);
    const isPendingReport = displayAthlete.reportTaskPending === true || (
      Number(displayAthlete.usedPaidClasses) >= 10 &&
      !displayAthlete.observations?.some((obs: any) => obs.type === 'progress_milestone')
    );
    if (flag === 'true' || isPendingReport) {
      localStorage.removeItem(`openFeedbackForm_${displayAthlete.id}`);
      setIsFeedbackFormOpen(true);
    }
  }, [displayAthlete?.id, displayAthlete?.reportTaskPending, displayAthlete?.totalPaidClasses, displayAthlete?.usedPaidClasses, displayAthlete?.observations]);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !displayAthlete?.id) return;

    setSubmittingFeedback(true);
    try {
      const feedbackRecord = {
        id: `milestone_report_${Date.now()}`,
        text: feedbackText.trim(),
        type: 'progress_milestone',
        timestamp: new Date().toISOString(),
        eventName: lang === 'RU' ? 'Индивидуальный отчет (10-е занятие)' : 'Individual Progress Report (10th Class)',
        masterName: masterData?.fullName || (lang === 'RU' ? 'Роман Горбунов' : 'Roman Gorbunov'),
        masterRole: masterData?.role || (lang === 'RU' ? 'Технический Директор' : 'Author of Holistic Program & Director'),
        masterAvatar: masterData?.avatar || '/Images/tech_director_01.png'
      };

      const updatedObservations = [feedbackRecord, ...observationsList];
      
      const currentNotifications = displayAthlete.notifications || [];
      const newParentNotification = {
        id: `feedback_milestone_${Date.now()}`,
        title: lang === 'RU' ? 'Индивидуальный отчет тренера' : 'Individual Coach Feedback',
        message: lang === 'RU' 
          ? `Получен отзыв от тренера: "${feedbackText.trim()}"` 
          : `Received progress report: "${feedbackText.trim()}"`,
        createdAt: new Date().toISOString(),
        type: 'announcement',
        category: 'updates'
      };

      const updatedNotifications = [newParentNotification, ...currentNotifications];

      const isMockStudent = isDemo || displayAthlete.id === 'demo-athlete' || displayAthlete.id === 'gabriel_z_reg';

      let isOfflineSaved = false;

      if (!isMockStudent) {
        try {
          const docRef = doc(db, 'registrations', displayAthlete.id);
          await updateDoc(docRef, {
            observations: updatedObservations,
            notifications: updatedNotifications,
            reportTaskPending: false
          });
          localStorage.removeItem(`localOfflineUpdates_${displayAthlete.id}`);
        } catch (dbErr: any) {
          console.warn("Database update failed (quota limit or network), falling back to offline local storage:", dbErr);
          isOfflineSaved = true;
          const msg = String(dbErr?.message || dbErr || '').toLowerCase();
          const errCode = String(dbErr?.code || '');
          if (msg.includes('quota') || msg.includes('resource-exhausted') || errCode === 'resource-exhausted') {
            window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
          }
          // Save in local storage
          localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
            observations: updatedObservations,
            notifications: updatedNotifications,
            reportTaskPending: false
          }));
        }
      } else {
        localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
          observations: updatedObservations,
          notifications: updatedNotifications,
          reportTaskPending: false
        }));
      }

      // Update state locally
      setActiveAthleteState((prev: any) => ({
        ...(prev || displayAthlete || MOCK_STUDENT),
        observations: updatedObservations,
        notifications: updatedNotifications,
        reportTaskPending: false
      }));

      if (onUpdateAthleteData) {
        onUpdateAthleteData({
          ...displayAthlete,
          observations: updatedObservations,
          notifications: updatedNotifications,
          reportTaskPending: false
        });
      }

      setFeedback({
        type: 'success',
        text: isOfflineSaved
          ? (lang === 'RU' 
              ? 'Отзыв сохранен локально (облачное хранилище временно заполнено)!' 
              : 'Feedback saved locally (Cloud storage temporary quota exceeded)!')
          : (lang === 'RU' 
              ? 'Отзыв успешно отправлен родителю!' 
              : 'Feedback successfully sent to the parent!')
      });
      setFeedbackText('');
      setIsFeedbackFormOpen(false);
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      console.error("Error submitting student feedback:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleDeleteObservation = async (obsId: string) => {
    if (!displayAthlete?.id) return;
    
    const updatedObservations = observationsList.filter((obs: any, idx: number) => {
      const currentId = obs.id || `obs_idx_${idx}`;
      return currentId !== obsId;
    });

    const currentNotifications = displayAthlete.notifications || [];
    const updatedNotifications = currentNotifications.filter((n: any) => {
      const milestoneId = obsId.startsWith('milestone_report_') ? obsId.replace('milestone_report_', '') : obsId;
      return n.id !== `feedback_milestone_${milestoneId}` && n.id !== `obs_${obsId}`;
    });

    const isMockStudent = isDemo || displayAthlete.id === 'demo-athlete' || displayAthlete.id === 'gabriel_z_reg';
    let isOfflineSaved = false;

    if (!isMockStudent) {
      try {
        const docRef = doc(db, 'registrations', displayAthlete.id);
        await updateDoc(docRef, {
          observations: updatedObservations,
          notifications: updatedNotifications
        });
        localStorage.removeItem(`localOfflineUpdates_${displayAthlete.id}`);
      } catch (dbErr: any) {
        console.warn("Database delete failed, falling back to offline local storage:", dbErr);
        isOfflineSaved = true;
        const msg = String(dbErr?.message || dbErr || '').toLowerCase();
        const errCode = String(dbErr?.code || '');
        if (msg.includes('quota') || msg.includes('resource-exhausted') || errCode === 'resource-exhausted') {
          window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
        }
        localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
          observations: updatedObservations,
          notifications: updatedNotifications
        }));
      }
    } else {
      localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
        observations: updatedObservations,
        notifications: updatedNotifications
      }));
    }

    setActiveAthleteState((prev: any) => ({
      ...(prev || displayAthlete || MOCK_STUDENT),
      observations: updatedObservations,
      notifications: updatedNotifications
    }));

    if (onUpdateAthleteData) {
      onUpdateAthleteData({
        ...displayAthlete,
        observations: updatedObservations,
        notifications: updatedNotifications
      });
    }

    setFeedback({
      type: 'success',
      text: lang === 'RU' ? 'Отзыв успешно удален!' : 'Feedback successfully deleted!'
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleSaveEditedObservation = async (obsId: string) => {
    if (!editingObsText.trim() || !displayAthlete?.id) return;

    const updatedObservations = observationsList.map((obs: any, idx: number) => {
      const currentId = obs.id || `obs_idx_${idx}`;
      if (currentId === obsId) {
        return {
          ...obs,
          text: editingObsText.trim()
        };
      }
      return obs;
    });

    const isMockStudent = isDemo || displayAthlete.id === 'demo-athlete' || displayAthlete.id === 'gabriel_z_reg';
    let isOfflineSaved = false;

    if (!isMockStudent) {
      try {
        const docRef = doc(db, 'registrations', displayAthlete.id);
        await updateDoc(docRef, {
          observations: updatedObservations
        });
        localStorage.removeItem(`localOfflineUpdates_${displayAthlete.id}`);
      } catch (dbErr: any) {
        console.warn("Database edit failed, falling back to offline local storage:", dbErr);
        isOfflineSaved = true;
        const msg = String(dbErr?.message || dbErr || '').toLowerCase();
        const errCode = String(dbErr?.code || '');
        if (msg.includes('quota') || msg.includes('resource-exhausted') || errCode === 'resource-exhausted') {
          window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
        }
        localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
          observations: updatedObservations
        }));
      }
    } else {
      localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
        observations: updatedObservations
      }));
    }

    setActiveAthleteState((prev: any) => ({
      ...(prev || displayAthlete || MOCK_STUDENT),
      observations: updatedObservations
    }));

    if (onUpdateAthleteData) {
      onUpdateAthleteData({
        ...displayAthlete,
        observations: updatedObservations
      });
    }

    setEditingObsId(null);
    setEditingObsText('');
    setFeedback({
      type: 'success',
      text: lang === 'RU' ? 'Отзыв успешно обновлен!' : 'Feedback successfully updated!'
    });
    setTimeout(() => setFeedback(null), 5000);
  };

  const [paymentHistory, setPaymentHistory] = React.useState<any[]>([]);
  const [invitations, setInvitations] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!displayAthlete?.id) return;
    
    // Fetch payment history
    const q = query(
      collection(db, 'payment_history'),
      where('athleteId', '==', displayAthlete.id)
    );
    const unsubscribeHistory = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      const sorted = docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPaymentHistory(sorted);
    }, (error) => {
      console.error("Error loading payment history:", error);
    });

    // Fetch invitations to calculate confirmed visits
    const qInv = query(
      collection(db, 'invitations'),
      where('studentId', '==', displayAthlete.id)
    );
    const unsubscribeInv = onSnapshot(qInv, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      setInvitations(docs);
    }, (error) => {
      console.error("Error loading invitations:", error);
    });
    
    return () => {
      unsubscribeHistory();
      unsubscribeInv();
    };
  }, [displayAthlete?.id, isDemo, lang]);
  
  const confirmedVisitsCount = invitations.filter(i => i.visitConfirmed).length;
  const usedPaidClasses = displayAthlete?.usedPaidClasses || 0; // Keeping as a fallback or to compare
  const effectiveUsedClasses = Math.max(0, confirmedVisitsCount - 1);

  const missedEventsCount = invitations.filter(inv => {
    if (inv.visitConfirmed) return false;
    if (inv.status === 'declined') return true;
    if (!inv.date) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return inv.date < todayStr;
  }).length;

  const [visitedEvents, setVisitedEvents] = React.useState<any[]>([]);
  const [loadingVisits, setLoadingVisits] = React.useState(false);

  React.useEffect(() => {
    if (isDemo) {
      const dummyEvents = [
        {
          id: 'dummy-visit-1',
          name: lang === 'RU' ? 'Холистическая футбольная тренировка' : lang === 'GE' ? 'ჰოლისტიკური საფეხბურთო ვარჯიში' : 'Holistic Football Training',
          date: '2026-06-18',
          startTime: '17:00 - 18:30',
          location: 'pirosmani_5',
          visitConfirmed: true
        },
        {
          id: 'dummy-visit-2',
          name: lang === 'RU' ? 'Отработка паса и дриблинг' : lang === 'GE' ? 'პასის ტექნიკა და დრიბლინგი' : 'Passing & Dribbling drills',
          date: '2026-06-15',
          startTime: '16:00 - 17:30',
          location: 'pirosmani_5',
          visitConfirmed: true
        },
        {
          id: 'dummy-visit-3',
          name: lang === 'RU' ? 'ОФП и координация' : lang === 'GE' ? 'ფიზიკური მომზადება და კოორდინაცია' : 'Fitness & Coordination',
          date: '2026-06-12',
          startTime: '17:00 - 18:30',
          location: 'metro_mall',
          visitConfirmed: true
        }
      ];
      setVisitedEvents(dummyEvents);
      return;
    }

    if (!invitations || invitations.length === 0) {
      setVisitedEvents([]);
      return;
    }

    const fetchEventDetails = async () => {
      setLoadingVisits(true);
      try {
        const confirmedInvs = invitations.filter(inv => inv.visitConfirmed);
        const list: any[] = [];
        
        for (const inv of confirmedInvs) {
          if (!inv.eventId) continue;
          try {
            const eventDocSnap = await getDoc(doc(db, 'events', inv.eventId));
            if (eventDocSnap.exists()) {
              list.push({
                ...eventDocSnap.data(),
                id: eventDocSnap.id,
                invitationId: inv.id,
                visitConfirmed: true,
              });
            } else {
              list.push({
                id: inv.eventId,
                name: inv.eventName || (lang === 'RU' ? 'Занятие по расписанию' : 'Scheduled Class'),
                date: inv.date || new Date().toISOString().split('T')[0],
                startTime: inv.startTime || '17:00',
                location: inv.location || 'pirosmani_5',
                visitConfirmed: true,
              });
            }
          } catch (err) {
            console.error("Error fetching single event:", err);
          }
        }
        
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setVisitedEvents(list);
      } catch (e) {
        console.error("Error loading visited events:", e);
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchEventDetails();
  }, [invitations, isDemo, lang]);

  // Auto-sync calculated correct XP and usedPaidClasses to database to prevent stale values
  React.useEffect(() => {
    if (isDemo || !displayAthlete?.id || displayAthlete.id === 'demo-athlete' || displayAthlete.id === 'gabriel_z_reg') return;
    
    const isLuka = displayAthlete?.studentName?.toLowerCase().includes('luka') || 
                   displayAthlete?.studentName?.toLowerCase().includes('лук') || 
                   displayAthlete?.studentName?.toLowerCase().includes('ლუკ') || 
                   displayAthlete?.studentName === 'Maxim Ivanov';
    const baseXP = isLuka ? 1250 : 0;
    const expectedXp = Math.max(0, baseXP + (confirmedVisitsCount * 10) - (penaltiesList.length * 1));
    const expectedUsedPaidClasses = Math.max(0, confirmedVisitsCount - 1);
    
    const needsXpSync = displayAthlete.xp !== undefined && Number(displayAthlete.xp) !== expectedXp;
    const needsUsedSync = displayAthlete.usedPaidClasses !== undefined && Number(displayAthlete.usedPaidClasses) !== expectedUsedPaidClasses;

    if (needsXpSync || needsUsedSync) {
      const syncKey = `${displayAthlete.id}_${expectedXp}_${expectedUsedPaidClasses}`;
      if (syncedAthletesRef.current.has(syncKey)) return;
      syncedAthletesRef.current.add(syncKey);

      console.log(`Auto-syncing XP/Used Classes for ${displayAthlete.studentName}: db_xp=${displayAthlete.xp}, calculated_xp=${expectedXp}, db_used=${displayAthlete.usedPaidClasses}, calculated_used=${expectedUsedPaidClasses}`);
      const docRef = doc(db, 'registrations', displayAthlete.id);
      updateDoc(docRef, { 
        xp: expectedXp,
        usedPaidClasses: expectedUsedPaidClasses
      }).catch(err => {
        console.warn("Error auto-syncing student data (likely quota or network). Falling back to offline updates:", err);
        // Save in local storage so displayAthlete gets the updated values immediately
        const existingOffline = localStorage.getItem(`localOfflineUpdates_${displayAthlete.id}`);
        const existingData = existingOffline ? JSON.parse(existingOffline) : {};
        localStorage.setItem(`localOfflineUpdates_${displayAthlete.id}`, JSON.stringify({
          ...existingData,
          xp: expectedXp,
          usedPaidClasses: expectedUsedPaidClasses
        }));

        // Force local state update so the UI updates immediately
        setActiveAthleteState((prev: any) => ({
          ...(prev || displayAthlete),
          xp: expectedXp,
          usedPaidClasses: expectedUsedPaidClasses
        }));
      });
    }
  }, [confirmedVisitsCount, penaltiesList.length, displayAthlete?.xp, displayAthlete?.usedPaidClasses, displayAthlete?.id, isDemo]);

  const logPurchase = async (newTotal: number, type: 'purchase' | 'reset', label: string) => {
    if (isDemo || !displayAthlete?.id || displayAthlete.id === 'gabriel_z_reg') {
      if (isDemo || displayAthlete?.id === 'gabriel_z_reg') {
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
        
        if (isMasterProfile) {
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
  const [editStudentName, setEditStudentName] = React.useState('');
  const [editStudentAge, setEditStudentAge] = React.useState('');
  const [editParentName, setEditParentName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editLanguage, setEditLanguage] = React.useState('RU');
  const [editStudentLocation, setEditStudentLocation] = React.useState('');
  const [editStudentLocations, setEditStudentLocations] = React.useState<string[]>([]);
  
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState('');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    if (displayAthlete) {
      setEditStudentName(displayAthlete.studentName || '');
      
      const currentAge = displayAthlete.studentAge !== undefined && displayAthlete.studentAge !== null 
        ? String(displayAthlete.studentAge) 
        : displayAthlete.studentBirthDate 
          ? String(Math.floor((new Date().getTime() - new Date(displayAthlete.studentBirthDate).getTime()) / 31557600000)) 
          : '8';
      setEditStudentAge(currentAge);

      setEditParentName(displayAthlete.parentName || displayAthlete.parentFullName || (lang === 'RU' ? 'Иван Иванов' : 'John Doe'));
      setEditPhone((displayAthlete.parentPhone || '+995 555 123 456').replace('+995', '').trim());
      setEditEmail(displayAthlete.parentEmail || '');
      setEditLanguage(displayAthlete.studentLanguage || 'RU');
      setEditStudentLocation(displayAthlete.studentLocation || '');

      const initialLocs = displayAthlete.studentLocations && Array.isArray(displayAthlete.studentLocations) && displayAthlete.studentLocations.length > 0
        ? displayAthlete.studentLocations
        : displayAthlete.studentLocation
          ? [displayAthlete.studentLocation]
          : [];
      setEditStudentLocations(initialLocs);
    }
  }, [displayAthlete, lang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const formattedPhone = editPhone.startsWith('+995') ? editPhone : `+995${editPhone.replace(/\D/g, '')}`;

    try {
      const ageNum = parseInt(editStudentAge, 10) || 8;
      const calculatedBirthDate = new Date(new Date().getFullYear() - ageNum, 4, 15).toISOString().split('T')[0];

      const updateData = {
        studentName: editStudentName,
        studentAge: ageNum,
        studentBirthDate: calculatedBirthDate,
        parentFullName: editParentName,
        parentName: editParentName,
        parentPhone: formattedPhone,
        parentEmail: editEmail,
        studentLanguage: editLanguage,
        studentLocation: editStudentLocations[0] || editStudentLocation || '',
        studentLocations: editStudentLocations
      };

      if (!isDemo && athleteData?.id && athleteData.id !== 'gabriel_z_reg') {
        const docRef = doc(db, 'registrations', athleteData.id);
        await updateDoc(docRef, updateData);
      } else if (isDemo || athleteData?.id === 'gabriel_z_reg') {
        setActiveAthleteState((prev: any) => ({
          ...(prev || defaultDemoAthlete),
          ...updateData
        }));
      }
      
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
      console.error("Error saving athlete details:", err);
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

  // Calculate correct XP dynamically based on actual visited events (confirmed visits * 10) and warnings (-1 XP each)
  const isLuka = displayAthlete?.studentName?.toLowerCase().includes('luka') || 
                 displayAthlete?.studentName?.toLowerCase().includes('лук') || 
                 displayAthlete?.studentName?.toLowerCase().includes('ლუკ') || 
                 displayAthlete?.studentName === 'Maxim Ivanov';
  const baseXP = isLuka ? 1250 : 0;
  const xpVal = Math.max(0, baseXP + (confirmedVisitsCount * 10) - (penaltiesList.length * 1));

  const dynamicBadges = React.useMemo(() => {
    if (!displayAthlete) return [];
    
    const athleteBadges = [...(displayAthlete.badges || [])];
    
    // Check if they have a confirmed visit (first class visit)
    const hasConfirmedVisit = confirmedVisitsCount >= 1 || (isDemo && athleteBadges.length === 0);
    const hasFirstStepBadge = athleteBadges.some((b: any) => 
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
      b.title?.toLowerCase().includes('ilk adım')
    );

    if (hasConfirmedVisit && !hasFirstStepBadge) {
      athleteBadges.unshift({
        id: 'first_step',
        titleRU: 'Первый шаг',
        titleEN: 'First Step',
        titleGE: 'პირველი ნაბიჯი',
        titleTR: 'İlk Adım',
        descRU: 'Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.',
        descEN: 'Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.',
        descGE: 'გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა и მწვრთნელის მიერ მისი დადასტურებისას.',
        descTR: 'İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.',
        icon: 'Dribbble',
        date: displayAthlete.createdAt 
          ? (displayAthlete.createdAt.seconds 
              ? new Date(displayAthlete.createdAt.seconds * 1000) 
              : new Date(displayAthlete.createdAt)).toLocaleDateString(localeMap[lang] || 'en-US', { year: 'numeric', month: 'short' })
          : 'Jun 2026'
      });
    }

    // Check if they have 10 confirmed visits
    const has10ConfirmedVisits = confirmedVisitsCount >= 10 || (isDemo && (displayAthlete.id === 'demo-athlete' || isLuka));
    const hasIronAthleteBadge = athleteBadges.some((b: any) => 
      b.id === 'iron_athlete' ||
      b.titleRU?.toLowerCase().includes('железный спортсмен') ||
      b.titleRU?.toLowerCase().includes('железный атлет') ||
      b.titleEN?.toLowerCase().includes('iron athlete')
    );

    if (has10ConfirmedVisits && !hasIronAthleteBadge) {
      athleteBadges.push({
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
        date: displayAthlete.createdAt 
          ? (displayAthlete.createdAt.seconds 
              ? new Date(displayAthlete.createdAt.seconds * 1000) 
              : new Date(displayAthlete.createdAt)).toLocaleDateString(localeMap[lang] || 'en-US', { year: 'numeric', month: 'short' })
          : 'Jun 2026'
      });
    }

    // Dynamic deduplication to ensure absolutely no duplicate badges
    const uniqueBadges: any[] = [];
    const seenIds = new Set<string>();
    const seenTitles = new Set<string>();

    athleteBadges.forEach((badge: any) => {
      const bTitle = (badge.titleRU || badge.titleEN || badge.title || '').toLowerCase().trim();
      const bId = (badge.id || bTitle).trim();
      
      const isFirstStep = bId === 'first_step' || bId === 'first_training' || bTitle.includes('first step') || bTitle.includes('первый шаг') || bTitle.includes('первая тренировка') || bTitle.includes('პირველი ნაბიჯი') || bTitle.includes('ilk adım') || bTitle.includes('first training');
      const isIronAthlete = bId === 'iron_athlete' || bTitle.includes('iron athlete') || bTitle.includes('железный спортсмен') || bTitle.includes('железный атлет') || bTitle.includes('რკინის ათლეტი') || bTitle.includes('demir sporcu');
      
      if (isFirstStep) {
        if (!seenIds.has('first_step')) {
          seenIds.add('first_step');
          uniqueBadges.push({
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
        if (!seenIds.has('iron_athlete')) {
          seenIds.add('iron_athlete');
          uniqueBadges.push({
            ...badge,
            id: 'iron_athlete',
            titleRU: 'Железный спортсмен',
            titleEN: 'Iron Athlete',
            titleGE: 'რკინის აทლეტი',
            titleTR: 'Demir Sporcu',
            descRU: 'Награждается за стойкость и приверженность спорту после подтверждения 10 посещений тренировок.',
            descEN: 'Awarded for resilience and commitment to sport upon completing 10 confirmed training visits.',
            descGE: 'გადაეცემა სპორტული გამძლეობისა და მონდომებისთვის 10 დადასტურებული ვარჯიშის შემდეგ.',
            descTR: '10 onaylı antrenman ziyaretini tamamlayan sporcuya dayanıklılık ve spora bağlılık için verilir.',
            icon: 'Trophy'
          });
        }
      } else {
        if (!seenIds.has(bId) && !seenTitles.has(bTitle)) {
          seenIds.add(bId);
          seenTitles.add(bTitle);
          uniqueBadges.push(badge);
        }
      }
    });

    return uniqueBadges;
  }, [displayAthlete, confirmedVisitsCount, isDemo, lang, localeMap]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 relative z-10"
    >
      {!hideHeaderCard && (
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1.5 h-6 bg-brand-sunset rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest italic">
            {showAccountOnly 
              ? (lang === 'RU' ? 'УПРАВЛЕНИЕ АККАУНТОМ' : 'ACCOUNT MANAGEMENT')
              : (lang === 'RU' ? 'ЛИЧНЫЙ КАБИНЕТ АТЛЕТА' : 'ATHLETE PROFILE CARD')}
          </h3>
        </div>
      )}
      
      {!showAccountOnly && !hideHeaderCard && (
        <Card className="p-5 sm:p-8 md:p-12 rounded-[28px] sm:rounded-[56px] glass border-white/60 shadow-3xl flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10">
          <div className="flex flex-col items-center shrink-0">
            <div className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-[24px] sm:rounded-[40px] md:rounded-[56px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-2xl relative rotate-3 group">
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
              <div className="mt-4 sm:mt-6 text-center">
                <label 
                  htmlFor="avatar-file-input"
                  className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-brand-navy/5 text-brand-navy/60 hover:bg-brand-navy/10 hover:text-brand-navy border border-brand-navy/10 transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest italic"
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
          
          <div className="flex-1 space-y-6 sm:space-y-10 text-center sm:text-left w-full">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-brand-navy mb-2 leading-none">
                {isMasterProfile ? masterData.fullName : (displayAthlete?.studentName || (lang === 'RU' ? 'Демо Атлет' : 'Demo Athlete'))}
              </h2>
              <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-teal italic">
                {isMasterProfile ? (masterData.role || 'Master') : (lang === 'RU' ? 'Профиль Спортсмена' : 'Athlete Profile')}
              </p>
            </div>

            {isMasterProfile ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">Specialization</p>
                  <p className="text-lg sm:text-xl font-black italic tracking-tight">{masterData.specialization || 'General'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">Status</p>
                  <Badge color="teal" className="text-[9px] uppercase italic">Active Master</Badge>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-10 text-left">
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteAge}</p>
                  <p className="text-base sm:text-xl font-black italic tracking-tight font-sans">
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
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-2 sm:px-3 rounded-2xl border border-brand-navy/5 sm:border sm:border-brand-navy/10 col-span-1 xs:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{lang === 'RU' ? 'ГРУППА / УРОВЕНЬ' : 'GROUP / LEVEL'}</p>
                    <p className="text-base sm:text-xl font-black italic tracking-tight uppercase text-brand-sunset">
                      {(() => {
                        const group = displayAthlete?.trainingGroup || 'Standard';
                        const lvlInfo = getStudentLevelInfo(xpVal);
                        return `${group} / ${lvlInfo.tier} (${xpVal} XP)`;
                      })()}
                    </p>
                  </div>
                  {/* Miniature badges right next to the group/level */}
                  <div className="flex items-center gap-2 shrink-0 bg-white/40 p-1.5 rounded-xl border border-brand-navy/5 self-start sm:self-auto">
                    {(() => {
                      if (dynamicBadges.length === 0) {
                        return (
                          <span className="text-[9px] font-bold text-brand-navy/30 uppercase italic px-2">
                            {lang === 'RU' ? 'Нет наград' : 'No Badges'}
                          </span>
                        );
                      }

                      return (
                        <div className="flex items-center gap-1.5">
                          {dynamicBadges.map((badge: any, idx: number) => {
                            const IconComponent = getBadgeIcon(badge.icon);
                            const bTitle = lang === 'RU' ? (badge.titleRU || badge.title) : lang === 'GE' ? (badge.titleGE || badge.title) : (badge.titleEN || badge.title);
                            const bDesc = lang === 'RU' ? (badge.descRU || badge.desc) : lang === 'GE' ? (badge.descGE || badge.desc) : (badge.descEN || badge.desc);
                            return (
                              <div 
                                key={badge.id || idx}
                                className="w-8 h-8 rounded-lg bg-brand-sunset/10 flex items-center justify-center text-brand-sunset border border-brand-sunset/20 hover:scale-110 transition-transform cursor-help"
                                title={`${bTitle}: ${bDesc}`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{lang === 'RU' ? 'УРОВЕНЬ XP' : 'XP LEVEL'}</p>
                  <p className="text-base sm:text-xl font-black italic tracking-tight uppercase text-brand-teal">
                    {(() => {
                      const lvlInfo = getStudentLevelInfo(xpVal);
                      return `${lvlInfo.tier} — ${lvlInfo.title.toUpperCase()} (${xpVal} XP)`;
                    })()}
                  </p>
                </div>
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{lang === 'RU' ? 'РОДИТЕЛЬ' : 'PARENT / GUARDIAN'}</p>
                  <p className="text-sm sm:text-base font-black italic tracking-tight uppercase leading-tight truncate">
                    {displayAthlete?.parentFullName || displayAthlete?.parentName || (lang === 'RU' ? 'Иван Иванов' : 'John Doe')}
                  </p>
                </div>
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{lang === 'RU' ? 'ДОГОВОР' : 'CONTRACT NUMBER'}</p>
                  <p className="text-sm sm:text-base font-black italic tracking-tight uppercase leading-tight font-mono text-brand-teal">
                    {displayAthlete?.contractNumber || (displayAthlete?.id && displayAthlete.id !== 'demo-athlete' ? `CN-${displayAthlete.id.substring(0, 6).toUpperCase()}` : 'CN-8842-DEMO')}
                  </p>
                </div>
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteCenter}</p>
                  <p className="text-sm sm:text-base font-black italic tracking-tight uppercase leading-tight">
                    {displayAthlete ? (
                      (() => {
                        const locs = displayAthlete.studentLocations && Array.isArray(displayAthlete.studentLocations) && displayAthlete.studentLocations.length > 0
                          ? displayAthlete.studentLocations
                          : [displayAthlete.studentLocation].filter(Boolean);
                        return locs.map((l: string) => getFullLocation(l)).join(', ');
                      })()
                    ) : 'Hero Park Batumi'}
                  </p>
                </div>
                <div className="space-y-1 bg-brand-navy/[0.02] sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-brand-navy/5 sm:border-none">
                  <p className="text-[9px] sm:text-[10px] text-brand-navy/30 uppercase font-black tracking-widest italic leading-none">{t.athleteRegDate}</p>
                  <p className="text-sm sm:text-base font-black italic tracking-tight leading-tight">{regDate}</p>
                </div>
              </div>
            )}

            {/* Earned Badges Section */}
            {!isMasterProfile && displayAthlete && (
              <div className="pt-6 sm:pt-8 border-t border-brand-navy/10 w-full text-left">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-brand-sunset" />
                  <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-navy italic">
                    {lang === 'RU' ? 'ПОЛУЧЕННЫЕ НАГРАДЫ И ЗНАЧКИ' : lang === 'GE' ? 'მოპოვებული ჯილდოები' : 'EARNED BADGES & ACHIEVEMENTS'}
                  </h4>
                </div>
                {(() => {
                  if (dynamicBadges.length === 0) {
                    return (
                      <p className="text-xs font-medium text-brand-navy/40 italic">
                        {lang === 'RU' ? 'Пока нет полученных наград. Посетите первую тренировку!' : 'No badges earned yet. Attend your first training session!'}
                      </p>
                    );
                  }

                  return (
                    <div className="flex flex-wrap gap-4">
                      {dynamicBadges.map((badge: any, idx: number) => {
                        const IconComponent = getBadgeIcon(badge.icon);
                        const bTitle = lang === 'RU' ? (badge.titleRU || badge.title) : lang === 'GE' ? (badge.titleGE || badge.title) : (badge.titleEN || badge.title);
                        const bDesc = lang === 'RU' ? (badge.descRU || badge.desc) : lang === 'GE' ? (badge.descGE || badge.desc) : (badge.descEN || badge.desc);
                        return (
                          <div 
                            key={badge.id || idx} 
                            className="flex items-center gap-3 bg-white/60 backdrop-blur-sm border border-brand-navy/5 rounded-2xl p-3 pr-4 shadow-sm hover:shadow-md transition-all duration-300 group max-w-xs"
                            title={bDesc}
                          >
                            <div className="w-10 h-10 rounded-xl bg-brand-sunset/10 flex items-center justify-center text-brand-sunset shrink-0 group-hover:scale-110 transition-transform duration-300">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black uppercase italic tracking-tight text-brand-navy truncate">
                                {bTitle}
                              </p>
                              <p className="text-[9px] font-bold text-brand-navy/40 uppercase font-mono mt-0.5">
                                {badge.date || 'Jun 2026'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Toggle Tab Navigation switcher: Dossier Details vs Class Balance Page */}
      {!isMasterProfile && !showAccountOnly && displayAthlete && !hideHeaderCard && (
        <div className="flex bg-brand-navy/5 p-1.5 rounded-[22px] max-w-sm sm:max-w-md mx-auto relative z-10 border border-brand-navy/5 shadow-inner">
          <button
            onClick={() => changeProfileTab('dossier')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
              profileTab === 'dossier'
                ? 'bg-white text-brand-navy shadow-lg shadow-brand-navy/5 scale-[1.02]'
                : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
            }`}
          >
            <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal font-sans" />
            {lang === 'RU' ? (
              <>
                <span className="hidden sm:inline">Аннотация и Досье</span>
                <span className="inline sm:hidden">Досье</span>
              </>
            ) : lang === 'GE' ? (
              'საქაღალდე'
            ) : (
              <>
                <span className="hidden sm:inline">Dossier & Info</span>
                <span className="inline sm:hidden">Dossier</span>
              </>
            )}
          </button>
          <button
            onClick={() => changeProfileTab('balance')}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
              profileTab === 'balance'
                ? 'bg-white text-brand-navy shadow-lg shadow-brand-navy/5 scale-[1.02]'
                : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-teal font-sans" />
            {lang === 'RU' ? (
              <>
                <span className="hidden sm:inline">Баланс занятий</span>
                <span className="inline sm:hidden">Баланс</span>
              </>
            ) : lang === 'GE' ? (
              'ბალანსი'
            ) : (
              <>
                <span className="hidden sm:inline">Class Balance</span>
                <span className="inline sm:hidden">Balance</span>
              </>
            )}
          </button>
        </div>
      )}

      {profileTab === 'dossier' || !displayAthlete ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start animate-in fade-in duration-300">
          {/* Left Column: Contact Details */}
          <div className="space-y-8">
            <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[48px] glass border-white/60 text-left">
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy/40 italic">{lang === 'RU' ? 'КОНТАКТНЫЕ ДАННЫЕ' : 'CONTACT DETAILS'}</h4>
                {!isMasterProfile && (
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

              {feedback && (
                <div className={`p-4 rounded-xl text-xs font-black uppercase tracking-wider mb-6 ${
                  feedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'
                }`}>
                  {feedback.text}
                </div>
              )}

              {/* Profile Status & Verification Controls */}
              {isMaster && !isMasterProfile && displayAthlete && (
                <div className="mb-6 p-4 rounded-2xl bg-neutral-100 border border-neutral-200">
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 mb-2 italic">
                    {lang === 'RU' ? 'СТАТУС ВЕРИФИКАЦИИ' : 'VERIFICATION STATUS'}
                  </p>
                  
                  {(!displayAthlete.status || displayAthlete.status === 'pending') ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase italic tracking-wider text-amber-600">
                          {lang === 'RU' ? 'Ожидает проверки' : 'Pending Verification'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
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
                          className="flex-1 bg-brand-teal text-white hover:bg-brand-teal/90 text-[10px] font-black uppercase tracking-widest italic !rounded-xl h-9 gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {lang === 'RU' ? 'Одобрить' : 'Approve'}
                        </Button>
                        <Button
                          onClick={async () => {
                            if (window.confirm(lang === 'RU' ? 'Вы уверены?' : 'Are you sure?')) {
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
                            variant="ghost"
                            className="flex-1 border border-red-200 text-red-500 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest italic !rounded-xl h-9 gap-1"
                          >
                            <X className="w-3.5 h-3.5" />
                            {lang === 'RU' ? 'Отклонить' : 'Decline'}
                          </Button>
                      </div>
                    </div>
                  ) : displayAthlete.status === 'approved' ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/15">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[9px] font-black uppercase italic tracking-wider">
                          {lang === 'RU' ? 'Утвержден' : 'Approved'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await processRegistrationStatus(displayAthlete.id, 'pending', displayAthlete);
                          } catch (err) {
                            console.error("Error setting pending:", err);
                          }
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 hover:text-brand-navy underline"
                      >
                        {lang === 'RU' ? 'Сбросить' : 'Reset'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-red-600 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/15">
                        <X className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[9px] font-black uppercase italic tracking-wider">
                          {lang === 'RU' ? 'Отклонено' : 'Declined'}
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await processRegistrationStatus(displayAthlete.id, 'pending', displayAthlete);
                          } catch (err) {
                            console.error("Error setting pending:", err);
                          }
                        }}
                        className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 hover:text-brand-navy underline"
                      >
                        {lang === 'RU' ? 'Сбросить' : 'Reset'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!isMaster && !isMasterProfile && displayAthlete && displayAthlete.status && (
                <div className="mb-6 flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-xl border border-neutral-200 self-start select-none max-w-max">
                  <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 italic">
                    {lang === 'RU' ? 'СТАТУС ПРОФИЛЯ' : 'PROFILE STATUS'}:
                  </span>
                  {displayAthlete.status === 'approved' ? (
                    <span className="text-[10px] font-black uppercase italic tracking-wider text-emerald-600">
                      {lang === 'RU' ? 'Активен' : 'Active'}
                    </span>
                  ) : displayAthlete.status === 'declined' ? (
                    <span className="text-[10px] font-black uppercase italic tracking-wider text-red-600">
                      {lang === 'RU' ? 'Отклонено' : 'Declined'}
                    </span>
                  ) : (
                    <span className="text-[10px] font-black uppercase italic tracking-wider text-amber-600 animate-pulse">
                      {lang === 'RU' ? 'Проверка' : 'Verifying'}
                    </span>
                  )}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-6 pt-2 text-left">
                  <Input 
                    icon={User}
                    label={lang === 'RU' ? 'ИМЯ СПОРТСМЕНА' : 'ATHLETE FULL NAME'}
                    placeholder="Luka Ivanov"
                    value={editStudentName}
                    onChange={(e: any) => setEditStudentName(e.target.value)}
                    required
                  />

                  <Input 
                    icon={Calendar}
                    label={lang === 'RU' ? 'ВОЗРАСТ СПОРТСМЕНА' : 'ATHLETE AGE'}
                    placeholder="8"
                    type="number"
                    value={editStudentAge}
                    onChange={(e: any) => setEditStudentAge(e.target.value)}
                    required
                  />

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

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-4">
                      {lang === 'RU' ? 'ЦЕНТРЫ ОБУЧЕНИЯ (МОЖНО ВЫБРАТЬ НЕСКОЛЬКО)' : 'TRAINING CENTER LOCATIONS (SELECT MULTIPLE)'}
                    </label>

                    {/* List of currently assigned locations */}
                    <div className="flex flex-wrap gap-2 px-2">
                      {editStudentLocations.map((locId) => {
                        const loc = LOCATIONS.find(l => l.id === locId);
                        if (!loc) return null;
                        const locName = lang === 'RU' ? loc.nameRU : lang === 'GE' ? loc.nameGE : loc.name;
                        return (
                          <span 
                            key={locId} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-black uppercase italic border border-brand-navy/5 animate-in zoom-in-95 duration-150"
                          >
                            <span>{locName}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditStudentLocations(prev => prev.filter(id => id !== locId));
                              }}
                              className="w-4 h-4 rounded-full bg-brand-navy/15 flex items-center justify-center hover:bg-brand-navy/25 hover:text-brand-sunset text-brand-navy/60 transition-colors cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        );
                      })}
                      {editStudentLocations.length === 0 && (
                        <p className="text-xs text-brand-navy/40 italic ml-2">
                          {lang === 'RU' ? 'Локации не выбраны. Добавьте хотя бы одну ниже.' : 'No locations selected. Add at least one below.'}
                        </p>
                      )}
                    </div>

                    {/* Dropdown to add a new location */}
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Plus className="w-4 h-4 text-brand-teal" />
                      </div>
                      <select 
                        value=""
                        onChange={(e: any) => {
                          const val = e.target.value;
                          if (val && !editStudentLocations.includes(val)) {
                            setEditStudentLocations(prev => [...prev, val]);
                          }
                          // Reset dropdown selection
                          e.target.value = "";
                        }}
                        className="w-full bg-white/40 backdrop-blur-md border border-white/40 rounded-full py-4 pl-12 pr-10 text-sm font-medium focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal/40 transition-all outline-none text-brand-navy appearance-none cursor-pointer italic"
                      >
                        <option value="" className="text-brand-navy/30">
                          {lang === 'RU' ? '+ Добавить еще одну локацию...' : '+ Add another location...'}
                        </option>
                        {LOCATIONS.map((loc: any) => (
                          <option 
                            key={loc.id} 
                            value={loc.id} 
                            disabled={editStudentLocations.includes(loc.id)}
                            className="text-brand-navy bg-white disabled:opacity-40"
                          >
                            {lang === 'RU' ? loc.nameRU : lang === 'GE' ? loc.nameGE : loc.name} ({loc.address || ''})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-brand-navy/40" />
                      </div>
                    </div>
                  </div>

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
                      disabled={isSaving || !editParentName || editPhone.length < 9 || !editStudentName || editStudentLocations.length === 0 || !editStudentAge}
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
                  {!isMasterProfile && (
                    <div className="flex items-center gap-4 text-left font-sans">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-brand-navy/30" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ВОЗРАСТ СПОРТСМЕНА' : 'ATHLETE AGE'}</p>
                        <p className="font-black italic text-brand-navy text-sm">
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
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-brand-navy/30" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{isMasterProfile ? 'ROLE' : (lang === 'RU' ? 'РОДИТЕЛЬ' : 'PARENT')}</p>
                      <p className="font-black italic text-brand-navy uppercase text-sm">{isMasterProfile ? (masterData.role || 'Coach') : (displayAthlete?.parentName || displayAthlete?.parentFullName || (lang === 'RU' ? 'Иван Иванов' : 'John Doe'))}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-brand-navy/30" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ТЕЛЕФОН' : 'PHONE'}</p>
                      <p className="font-black italic text-brand-navy text-sm">{isMasterProfile ? masterData.phone : (displayAthlete?.parentPhone || '+995 555 123 456')}</p>
                    </div>
                  </div>
                  {(displayAthlete?.studentLanguage || isMasterProfile) && (
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                        <Bell className="w-5 h-5 text-brand-navy/30" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ЯЗЫК ОБЩЕНИЯ' : 'COMMUNICATION LANGUAGE'}</p>
                        <p className="font-black italic text-brand-navy text-sm">{isMasterProfile ? 'Russian / English' : displayAthlete?.studentLanguage}</p>
                      </div>
                    </div>
                  )}
                  {((displayAthlete?.studentLocation) || (displayAthlete?.studentLocations && displayAthlete.studentLocations.length > 0)) && !isMasterProfile && (
                    <div className="flex items-center gap-4 text-left font-sans">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-brand-navy/30" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ЦЕНТР ОБУЧЕНИЯ' : 'CENTER OF EDUCATION'}</p>
                        <p className="font-black italic text-brand-navy text-sm uppercase">
                          {(() => {
                            const locs = displayAthlete.studentLocations && Array.isArray(displayAthlete.studentLocations) && displayAthlete.studentLocations.length > 0
                              ? displayAthlete.studentLocations
                              : [displayAthlete.studentLocation].filter(Boolean);
                            return locs.map((l: string) => getFullLocation(l)).join(', ');
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                  {displayAthlete?.createdAt && !isMasterProfile && (
                    <div className="flex items-center gap-4 text-left font-sans">
                      <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-brand-navy/30" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase text-brand-navy/20 mb-0.5">{lang === 'RU' ? 'ДАТА РЕГИСТРАЦИИ' : 'REGISTRATION DATE'}</p>
                        <p className="font-black italic text-brand-navy text-sm font-mono leading-none">
                          {(() => {
                            const createDate = displayAthlete?.createdAt;
                            if (!createDate) return '--';
                            const d = createDate.seconds 
                              ? new Date(createDate.seconds * 1000) 
                              : new Date(createDate);
                            return isNaN(d.getTime()) ? '--' : d.toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US');
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                  {displayAthlete?.studentMedicalNotes && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs font-black uppercase tracking-wide">
                      🚨 {lang === 'RU' ? 'Медицинские особенности' : 'Medical Considerations'}: {displayAthlete?.studentMedicalNotes}
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

              {onLogout && showAccountOnly && (
                <div className="mt-4 border-t border-brand-navy/5 pt-6">
                  <button 
                    type="button"
                    onClick={onLogout}
                    className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-black uppercase tracking-[0.15em] italic shadow-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <LogOut className="w-5 h-5 shrink-0 text-white" />
                    <span>{lang === 'RU' ? 'ВЫЙТИ ИЗ АККАУНТА' : lang === 'GE' ? 'სისტემიდან გამოსვლა' : 'LOG OUT'}</span>
                  </button>
                </div>
              )}
              
            </Card>
          </div>

          {/* Right Column: Student Dossier */}
          <div className="space-y-8 animate-in fade-in duration-500 text-left">
            {/* Profile Notifications Alerts */}
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
                      <div className="p-4 rounded-2xl bg-brand-teal/5 border border-brand-teal/10 flex items-start gap-4 w-full min-w-0 text-left">
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

                      <div className="p-4 rounded-2xl bg-brand-sunset/5 border border-brand-sunset/10 flex items-start gap-4 w-full min-w-0 text-left">
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

            {/* Discipline warnings card */}
            {!showAccountOnly && !isMasterProfile && (
              <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[48px] glass border-white/60 flex flex-col justify-start w-full min-w-0 text-left mt-8">
                <div className="flex items-center gap-3 mb-8 border-b border-brand-navy/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-black italic uppercase text-base text-brand-navy leading-none mb-1">
                      {lang === 'RU' ? 'Замечания по дисциплине' : 'Discipline Warnings'}
                    </h4>
                    <p className="text-[9px] text-brand-navy/30 font-black uppercase tracking-widest italic leading-none">
                      {lang === 'RU' ? 'История предупреждений (-1 XP)' : 'Penalty History (-1 XP)'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin text-left w-full min-w-0 font-sans">
                  {penaltiesList.length > 0 ? (
                    penaltiesList.map((pen: any, idx: number) => (
                      <div key={`profile_penalty_${pen.id || idx}`} className="p-4 rounded-2xl flex items-start gap-4 border border-amber-500/10 bg-amber-500/[0.03] w-full min-w-0 animate-fade-in">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black uppercase italic text-brand-navy leading-none mb-1">
                            {lang === 'RU' ? 'Замечание' : 'Discipline Warned'}
                          </h5>
                          <p className="text-[10px] font-semibold text-amber-700 leading-normal mb-1">
                            "${pen.word}"
                          </p>
                          {pen.eventName && (
                            <p className="text-[9px] font-black uppercase italic text-brand-navy/40">
                              {lang === 'RU' ? 'Занятие' : 'Class'}: {pen.eventName}
                            </p>
                          )}
                          <span className="text-[8px] font-semibold uppercase tracking-wider mt-2 block font-mono text-brand-navy/30">
                            {new Date(pen.timestamp).toLocaleDateString(lang === 'RU' ? 'ru' : 'en', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-brand-teal/10 flex items-center justify-center mx-auto mb-3">
                        <Check className="w-6 h-6 text-brand-teal" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-teal italic">
                        {lang === 'RU' ? 'Идеальная дисциплина! Нет замечаний' : 'Perfect discipline! No active warnings'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Trainer Notepad / Observations card */}
          <div className="space-y-8">
            {!showAccountOnly && !isMasterProfile && (
              <Card className="p-5 sm:p-10 rounded-[28px] sm:rounded-[48px] glass border-white/60 flex flex-col justify-start w-full min-w-0 text-left mt-8 animate-fade-in">
                <div className="flex items-center gap-3 mb-8 border-b border-brand-navy/5 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-black italic uppercase text-base text-brand-navy leading-none mb-1">
                      {lang === 'RU' ? 'Заметки тренера и наблюдения' : 'Trainer Notes & Observations'}
                    </h4>
                    <p className="text-[9px] text-brand-navy/30 font-black uppercase tracking-widest italic leading-none">
                      {lang === 'RU' ? 'Поведенческие отзывы (без штрафа XP)' : 'Behavioral feedback history (0 XP)'}
                    </p>
                  </div>
                </div>

                {isMaster && (
                  <div className="mb-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-sunset animate-pulse" />
                        <h5 className="text-xs font-black uppercase italic text-brand-navy">
                          {lang === 'RU' ? 'Форма отзыва и прогресса спортсмена' : 'Athlete Progress & Activity Feedback Form'}
                        </h5>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setIsFeedbackFormOpen(!isFeedbackFormOpen)}
                        className="text-xs text-brand-teal font-bold uppercase tracking-wider underline hover:text-brand-navy"
                      >
                        {isFeedbackFormOpen ? (lang === 'RU' ? 'Свернуть' : 'Collapse') : (lang === 'RU' ? 'Открыть' : 'Expand')}
                      </button>
                    </div>
                    
                    {isFeedbackFormOpen && (
                      <form onSubmit={handleFeedbackSubmit} className="space-y-4" id="athlete-feedback-form">
                        <div>
                          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                            <label className="block text-[10px] font-black uppercase text-brand-navy/60">
                              {lang === 'RU' ? 'Текст отзыва об активности и успеваемости' : 'Activity & Progress Feedback Text'}
                            </label>
                          </div>
                          <textarea
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            rows={3}
                            className="w-full p-3.5 text-xs font-semibold rounded-2xl border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent text-brand-navy"
                            placeholder={lang === 'RU' ? 'Введите профессиональное замечание или индивидуальный отчет о прогрессе...' : 'Enter a professional note or individual progress report...'}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="submit"
                            disabled={submittingFeedback || !feedbackText.trim()}
                            className="px-4 py-2 bg-brand-teal hover:bg-brand-teal/90 disabled:opacity-50 text-white font-black uppercase tracking-wider text-[10px] rounded-xl transition-all shadow-md shadow-brand-teal/15 cursor-pointer"
                          >
                            {submittingFeedback 
                              ? (lang === 'RU' ? 'Сохранение...' : 'Saving...') 
                              : (lang === 'RU' ? 'Опубликовать отчет' : 'Publish Report')}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin text-left w-full min-w-0 font-sans">
                  {observationsList.length > 0 ? (
                    observationsList.map((obs: any, idx: number) => {
                      const isMilestone = obs.type === 'progress_milestone';
                      const masterName = obs.masterName || (lang === 'RU' ? 'Роман Горбунов' : 'Roman Gorbunov');
                      const masterRole = obs.masterRole || (lang === 'RU' ? 'Технический Директор' : 'Author of Holistic Program & Director');
                      const masterAvatar = obs.masterAvatar || '/Images/tech_director_01.png';
                      const obsId = obs.id || `obs_idx_${idx}`;
                      const isEditing = editingObsId === obsId;

                      return (
                        <div 
                          key={`profile_obs_${obsId}`} 
                          className={`p-4 rounded-2xl flex flex-col gap-3 border w-full min-w-0 animate-fade-in ${
                            isMilestone 
                              ? 'bg-gradient-to-br from-brand-teal/5 via-indigo-500/[0.02] to-white border-brand-teal/20 shadow-sm'
                              : 'border-indigo-500/10 bg-indigo-500/[0.03]'
                          }`}
                        >
                          <div className="flex items-start gap-3 justify-between">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                                isMilestone ? 'bg-brand-teal text-white' : 'bg-indigo-500 text-white'
                              }`}>
                                {isMilestone ? <Trophy className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                  <h5 className={`text-[10px] font-black uppercase tracking-wider leading-none italic ${
                                    isMilestone ? 'text-brand-teal' : 'text-brand-navy/60'
                                  }`}>
                                    {isMilestone 
                                      ? (lang === 'RU' ? 'ИНДИВИДУАЛЬНЫЙ ОТЧЕТ ТРЕНЕРА' : 'INDIVIDUAL COACH REPORT')
                                      : (lang === 'RU' ? 'Заметка тренера' : 'Trainer Observation')
                                    }
                                  </h5>
                                  {isMilestone && (
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full">
                                      {lang === 'RU' ? 'Подтверждено' : 'Certified'}
                                    </span>
                                  )}
                                </div>
                                {isEditing ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={editingObsText}
                                      onChange={(e) => setEditingObsText(e.target.value)}
                                      rows={3}
                                      className="w-full p-2.5 text-xs font-semibold rounded-xl border border-indigo-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-brand-navy"
                                      placeholder={lang === 'RU' ? 'Редактировать текст отзыва...' : 'Edit feedback text...'}
                                    />
                                    <div className="flex gap-2 justify-end">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingObsId(null);
                                          setEditingObsText('');
                                        }}
                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-black/5 text-brand-navy/60 hover:bg-black/10 rounded-lg transition-colors cursor-pointer"
                                      >
                                        {lang === 'RU' ? 'Отмена' : 'Cancel'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditedObservation(obsId)}
                                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-brand-teal text-white hover:bg-brand-teal/90 rounded-lg transition-colors cursor-pointer"
                                      >
                                        {lang === 'RU' ? 'Сохранить' : 'Save'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className={`text-xs font-bold leading-relaxed ${isMilestone ? 'text-brand-navy' : 'text-indigo-700'}`}>
                                      "${obs.text}"
                                    </p>
                                    {obs.eventName && (
                                      <p className="text-[9px] font-black uppercase italic text-brand-navy/40 mt-1">
                                        {lang === 'RU' ? 'Занятие' : 'Class'}: {obs.eventName}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                            {isMaster && !isEditing && (
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingObsId(obsId);
                                    setEditingObsText(obs.text || '');
                                  }}
                                  className="p-1.5 hover:bg-black/5 rounded-lg text-brand-navy/40 hover:text-brand-teal transition-colors cursor-pointer"
                                  title={lang === 'RU' ? 'Редактировать' : 'Edit'}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(lang === 'RU' ? 'Вы уверены, что хотите удалить этот отзыв?' : 'Are you sure you want to delete this feedback?')) {
                                      handleDeleteObservation(obsId);
                                    }
                                  }}
                                  className="p-1.5 hover:bg-black/5 rounded-lg text-brand-navy/40 hover:text-red-500 transition-colors cursor-pointer"
                                  title={lang === 'RU' ? 'Удалить' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Master Credentials & Date Section */}
                          <div className="pt-2 border-t border-brand-navy/5 flex flex-wrap items-center justify-between gap-2 text-left">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md overflow-hidden border border-brand-navy/10 shrink-0 bg-white">
                                <img src={masterAvatar} alt={masterName} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-wider text-brand-navy/80 leading-none mb-0.5">
                                  {masterName}
                                </p>
                                <p className="text-[7px] font-bold uppercase tracking-wider text-brand-navy/40 leading-none">
                                  {masterRole}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] font-semibold uppercase tracking-wider text-brand-navy/40 font-mono block">
                                {lang === 'RU' ? 'Предоставлено: ' : 'Provided: '}
                                {new Date(obs.timestamp).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6 text-indigo-500" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 italic">
                        {lang === 'RU' ? 'Заметок о поведении пока нет' : 'No behavioral notes yet'}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* profileTab === 'balance' (THE ATHLETE BALANCE PAGE) - Highly polished, open and responsive to both users! */
        <div id="athlete-balance-page" className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start animate-in fade-in duration-300 text-left">
          
          {/* Left Column: Visual Balance card widget & Gauge */}
          <div className="space-y-8">
            <div id="athlete-balance-card" className="glass p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] border-white/60 shadow-2xl bg-white/40 relative z-10 text-left">
              <div className="space-y-8">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-brand-teal rounded-full" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy/60 italic font-sans">
                    {lang === 'RU' ? 'Баланс оплаченных тренировок' : lang === 'GE' ? 'ფასიანი ვარჯიშების ბალანსი' : 'Paid Training Package Balance'}
                  </h4>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4 font-sans text-left">
                  {/* Stat 1: Total Purchased */}
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm text-left">
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-navy/40 tracking-wider leading-none">
                      {lang === 'RU' ? 'Куплено' : lang === 'GE' ? 'სულ შეძენილი' : 'Purchased'}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black italic text-brand-navy font-mono mt-1 leading-none">
                      {displayAthlete.totalPaidClasses || 0}
                    </p>
                  </div>

                  {/* Stat 2: Visited */}
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm text-left">
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-navy/40 tracking-wider leading-none">
                      {lang === 'RU' ? 'Посещено' : lang === 'GE' ? 'დასწრებულია' : 'Visited'}
                    </p>
                    <p className="text-2xl sm:text-3xl font-black italic text-brand-teal font-mono mt-1 leading-none">
                      {effectiveUsedClasses}
                    </p>
                  </div>

                  {/* Stat 3: Remaining */}
                  <div className="bg-white/40 p-4 rounded-2xl border border-white/50 shadow-sm text-left">
                    <p className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-navy/40 tracking-wider leading-none">
                      {lang === 'RU' ? 'Осталось' : lang === 'GE' ? 'დარჩენილია' : 'Remaining'}
                    </p>
                    <p className={`text-2xl sm:text-3xl font-black italic font-mono mt-1 leading-none ${Math.max(0, (displayAthlete.totalPaidClasses || 0) - effectiveUsedClasses) <= 2 ? 'text-brand-sunset animate-pulse font-black' : 'text-brand-navy'}`}>
                      {Math.max(0, (displayAthlete.totalPaidClasses || 0) - effectiveUsedClasses)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 pt-2">
                  <div className="w-full h-3 bg-brand-navy/5 rounded-full overflow-hidden p-[2px] border border-white">
                    <div 
                      className="h-full bg-brand-teal rounded-full shadow-teal transition-all duration-700"
                      style={{ 
                        width: `${Math.min(100, Math.max(0, (effectiveUsedClasses / (displayAthlete.totalPaidClasses || 1)) * 100))}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider text-brand-navy/40 italic">
                    <span>{lang === 'RU' ? 'Выработка оплаченного пакета' : 'Package Completion Progress'}</span>
                    <span>{Math.round(Math.min(100, Math.max(0, (effectiveUsedClasses / (displayAthlete.totalPaidClasses || 1)) * 100)))}%</span>
                  </div>
                </div>

                {/* Big Visual Circular Gauge */}
                <div className="p-6 bg-brand-navy/5 rounded-[24px] sm:rounded-[36px] border border-brand-navy/5 flex flex-col items-center justify-center text-center">
                  <div className="w-40 h-40 rounded-full border-8 border-brand-teal/20 relative flex flex-col items-center justify-center shadow-lg bg-white/50 transition-all duration-500 hover:scale-105">
                    <span className="text-5xl font-black italic text-brand-navy font-mono">
                      {Math.max(0, (displayAthlete.totalPaidClasses || 0) - effectiveUsedClasses)}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 mt-1">
                      {lang === 'RU' ? 'ЗАНЯТИЙ' : 'CLASSES LEFT'}
                    </span>
                  </div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-brand-teal italic mt-6 bg-white/85 px-4 py-2.5 rounded-full border border-brand-navy/5 shadow-sm leading-none">
                    {Math.max(0, (displayAthlete.totalPaidClasses || 0) - effectiveUsedClasses) === 0 
                      ? (lang === 'RU' ? '⚠️ НЕОБХОДИМА ОПЛАТА НОВОГО ПАКЕТА' : '⚠️ NO CLASSES REMAIN - TOP UP NEEDED') 
                      : (lang === 'RU' ? 'ТРЕНИРОВОЧНЫЙ ПАКЕТ АКТИВЕН' : 'TRAINING PACKAGE IS CURRENTLY ACTIVE')}
                  </p>
                </div>
              </div>
            </div>

            {/* Athlete Visits History Card */}
            <Card className="p-6 sm:p-8 rounded-[32px] glass border-white/60 shadow-xl bg-white/40 font-sans text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-brand-navy/10 pb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand-teal" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">
                    {lang === 'RU' ? 'История посещений' : lang === 'GE' ? 'ვიზიტების ისტორია' : 'Visits & Attendance'}
                  </h4>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-brand-teal/15 text-brand-teal text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    {visitedEvents.length} {lang === 'RU' ? 'ПОСЕЩЕНО' : lang === 'GE' ? 'ვიზიტი' : 'VISITED'}
                  </span>
                  <span className="bg-red-500/15 text-red-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    {missedEventsCount} {lang === 'RU' ? 'ПРОПУЩЕНО' : lang === 'GE' ? 'გაცდენილი' : 'MISSED'}
                  </span>
                </div>
              </div>

              {loadingVisits ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
                </div>
              ) : visitedEvents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-brand-navy/10 rounded-2xl text-brand-navy/40">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-55 text-brand-navy/30" />
                  <p className="text-xs font-bold uppercase tracking-wider italic">
                    {lang === 'RU' ? 'История посещений пуста' : 'No visited events yet'}
                  </p>
                  <p className="text-[10px] mt-1 normal-case px-4 text-center">
                    {lang === 'RU' ? 'Подтвержденные посещения занятий будут отображаться здесь.' : 'Confirmed training sessions and event visits will populate here.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[550px] sm:min-w-0">
                    {/* Table Body */}
                    <div className="divide-y divide-brand-navy/5">
                      {visitedEvents.map((event: any, idx: number) => {
                        const eventDate = new Date(event.date);
                        
                        // Day of the week (shortened)
                        const dayOfWeekStr = eventDate.toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : 'en-US', { weekday: 'short' }).replace(/\.$/, '');
                        
                        // Compact date formatting
                        const compactDateStr = eventDate.toLocaleDateString(lang === 'RU' ? 'ru-RU' : lang === 'GE' ? 'ka-GE' : 'en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });

                        return (
                          <div 
                            key={event.id || idx} 
                            id={`visit-history-item-${event.id || idx}`}
                            className="grid grid-cols-12 gap-2 px-3 py-1.5 items-center hover:bg-brand-navy/[0.02] transition-all group"
                          >
                            {/* Column 1: Date, Day, Time Block */}
                            <div className="col-span-6 text-xs sm:text-sm text-brand-navy/90 flex flex-wrap items-center gap-x-2">
                              <span className="font-bold whitespace-nowrap">{compactDateStr}</span>
                              <span className="text-brand-teal font-extrabold uppercase tracking-wider whitespace-nowrap text-[10px] sm:text-xs">
                                ({dayOfWeekStr})
                              </span>
                              <span className="text-brand-navy/30">•</span>
                              <span className="font-mono font-medium text-brand-navy/70 whitespace-nowrap">
                                {event.startTime || event.time || '17:00'}
                              </span>
                            </div>

                            {/* Column 2: Event Name */}
                            <div className="col-span-4 text-xs sm:text-sm font-black uppercase italic text-brand-navy/80 truncate">
                              {event.name || (lang === 'RU' ? 'Тренировка' : 'Training Session')}
                            </div>

                            {/* Column 3: Location */}
                            <div className="col-span-2 text-xs sm:text-sm font-black uppercase tracking-wider text-brand-sunset truncate">
                              {getFullLocation(event.location)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Dynamic increment, custom count entry & logging history logs */}
          <div className="space-y-8 text-left">
            {isMaster && (
              <Card className="p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] glass border-white/65 shadow-2xl bg-white/50 relative overflow-hidden transition-all duration-300">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0">
                      <PlusSquare className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase tracking-tight text-brand-navy leading-none mb-1">
                        {lang === 'RU' ? 'Изменить баланс занятий' : 'Update Athlete Balance'}
                      </h4>
                      <p className="text-xs font-bold text-brand-navy/40 uppercase tracking-wider leading-none mt-1">
                        {lang === 'RU' ? 'Назначьте пакет тренировок, отрегулируйте лимиты или запишите визит' : 'Manage training packages or record single visits'}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const fd = new FormData(form);
                    const count = Number(fd.get('totalClasses'));
                    if (!isNaN(count) && count >= 0) {
                      try {
                        if (isDemo || displayAthlete.id === 'gabriel_z_reg') {
                          setDemoTotal(count);
                          await logPurchase(count, 'purchase', lang === 'RU' ? `Пакет обновлен до ${count} зан.` : `Package updated to ${count} classes`);
                        } else {
                          const docRef = doc(db, 'registrations', displayAthlete.id);
                          await updateDoc(docRef, { totalPaidClasses: count });
                          await logPurchase(count, 'purchase', lang === 'RU' ? `Пакет обновлен до ${count} зан.` : `Package updated to ${count} classes`);
                          
                          // Sync with athletes collection
                          if (displayAthlete.athleteId) {
                            await updateDoc(doc(db, 'athletes', displayAthlete.athleteId), {
                              totalPaidClasses: count
                            });
                          }
                        }
                        setFeedback({
                          type: 'success',
                          text: lang === 'RU' ? 'Баланс оплаченных тренировок успешно сохранен!' : 'Athlete class balance successfully updated!'
                        });
                        setTimeout(() => setFeedback(null), 4000);
                      } catch (err) {
                        console.error("Error setting paid classes:", err);
                        setFeedback({
                          type: 'res_error',
                          text: lang === 'RU' ? 'Ошибка изменения лимита' : 'Error updating package'
                        });
                      }
                    }
                  }} className="space-y-6 text-left">
                    
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-2 italic">
                        {lang === 'RU' ? 'НАЗНАЧИТЬ КЛАССЫ (ПОДТВЕРДИТЬ ИЗМЕНЕНИЯ СНИЗУ)' : 'TOTAL PURCHASED TRAINING CLASSES'}
                      </label>
                      
                      <div className="flex items-center gap-3">
                        {/* Interactive Step decrementer */}
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('totalClassesInput') as HTMLInputElement;
                            if (input) {
                              const val = Math.max(0, Number(input.value) - 1);
                              input.value = String(val);
                            }
                          }}
                          className="w-14 h-14 rounded-2xl bg-brand-navy/5 text-brand-navy/60 hover:bg-brand-navy/10 active:scale-95 transition-all flex items-center justify-center font-black cursor-pointer border border-brand-navy/5 shadow-sm"
                        >
                          <Minus className="w-5 h-5 text-brand-navy/30" />
                        </button>

                        <input
                          type="number"
                          id="totalClassesInput"
                          name="totalClasses"
                          min="0"
                          defaultValue={displayAthlete.totalPaidClasses || 0}
                          key={displayAthlete.totalPaidClasses || 0}
                          className="flex-1 h-14 px-4 bg-white/60 border border-brand-navy/10 rounded-2xl font-black italic text-center text-xl focus:outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/15 shadow-inner transition-all text-brand-navy"
                          placeholder="0"
                        />

                        {/* Interactive Step incrementer */}
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('totalClassesInput') as HTMLInputElement;
                            if (input) {
                              const val = Number(input.value) + 1;
                              input.value = String(val);
                            }
                          }}
                          className="w-14 h-14 rounded-2xl bg-brand-navy/5 text-brand-navy/60 hover:bg-brand-navy/10 active:scale-95 transition-all flex items-center justify-center font-black cursor-pointer border border-brand-navy/5 shadow-sm"
                        >
                          <Plus className="w-5 h-5 text-brand-navy/30" />
                        </button>
                      </div>
                    </div>

                    {/* Proceed & confirm update package action button */}
                    <Button 
                      type="submit"
                      className="w-full h-14 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black shadow-lg shadow-brand-navy/10 hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4 text-brand-teal" />
                      {lang === 'RU' ? 'ПОДТВЕРДИТЬ ИЗМЕНЕНИЯ' : 'PROCEED & UPDATE BALANCE'}
                    </Button>

                    {/* Quick Preset Packs actions and substract visits panel */}
                    <div className="space-y-3 pt-2 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 ml-2 italic">
                        {lang === 'RU' ? 'БЫСТРОЕ ПАКЕТНОЕ ДОБАВЛЕНИЕ ЗАНЯТИЙ' : 'QUICK ADD PRESET ACTIONS'}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap">
                        {[8, 12, 16, 24].map((num) => (
                          <button
                            type="button"
                            key={`sub_preset_${num}`}
                            onClick={async () => {
                              const nextCount = (displayAthlete.totalPaidClasses || 0) + num;
                              try {
                                if (isDemo || displayAthlete.id === 'gabriel_z_reg') {
                                  setDemoTotal(nextCount);
                                  await logPurchase(nextCount, 'purchase', lang === 'RU' ? `Добавлен пакет на +${num} зан.` : `Added package of +${num} classes`);
                                } else {
                                  const docRef = doc(db, 'registrations', displayAthlete.id);
                                  await updateDoc(docRef, { totalPaidClasses: nextCount });
                                  await logPurchase(nextCount, 'purchase', lang === 'RU' ? `Добавлен пакет на +${num} зан.` : `Added package of +${num} classes`);
                                  
                                  if (displayAthlete.athleteId) {
                                    await updateDoc(doc(db, 'athletes', displayAthlete.athleteId), {
                                      totalPaidClasses: nextCount
                                    });
                                  }
                                }
                                setFeedback({
                                  type: 'success',
                                  text: lang === 'RU' ? `Пакет на +${num} успешно зачислен!` : `Successfully added package of +${num} classes!`
                                });
                                setTimeout(() => setFeedback(null), 4000);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="px-4 py-3 text-xs font-black uppercase italic tracking-wider rounded-xl bg-brand-teal/10 hover:bg-brand-teal hover:text-white text-brand-teal transition-all border border-brand-teal/20 cursor-pointer shadow-sm hover:scale-[1.05]"
                          >
                            +{num}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-brand-navy/5 justify-between">
                        {/* Subtract single visit action */}
                        <button
                          type="button"
                          onClick={async () => {
                            const currentUsed = displayAthlete.usedPaidClasses || 0;
                            const nextUsed = currentUsed + 1;
                            if (nextUsed > displayAthlete.totalPaidClasses) {
                              alert(lang === 'RU' ? 'Ошибка: Баланс исчерпан!' : 'Error: No classes left in package!');
                              return;
                            }
                            try {
                              if (isDemo || displayAthlete.id === 'gabriel_z_reg') {
                                setDemoUsed(nextUsed);
                                await logPurchase(displayAthlete.totalPaidClasses, 'purchase', lang === 'RU' ? 'Списано 1 посещение тренировки (-1)' : 'Recorded 1 lesson visit (-1)');
                              } else {
                                const docRef = doc(db, 'registrations', displayAthlete.id);
                                await updateDoc(docRef, { usedPaidClasses: nextUsed });
                                await logPurchase(displayAthlete.totalPaidClasses, 'purchase', lang === 'RU' ? 'Списано 1 посещение тренировки (-1)' : 'Recorded 1 lesson visit (-1)');
                                
                                if (displayAthlete.athleteId) {
                                  await updateDoc(doc(db, 'athletes', displayAthlete.athleteId), {
                                    usedPaidClasses: nextUsed
                                  });
                                }
                              }
                              setFeedback({
                                type: 'success',
                                text: lang === 'RU' ? 'Посещение официально зафиксировано!' : 'Recorded 1 lesson visit successfully!'
                              });
                              setTimeout(() => setFeedback(null), 4000);
                            } catch (err) {
                              console.error(err);
                            }
                          }}
                          className="flex-1 px-4 py-3 text-xs font-black uppercase italic tracking-wider rounded-xl bg-orange-500/10 hover:bg-orange-600 hover:text-white text-orange-600 transition-all border border-orange-500/20 cursor-pointer shadow-sm hover:scale-[1.03] text-center"
                        >
                          {lang === 'RU' ? 'СПИСАТЬ ПОСЕЩЕНИЕ (-1)' : 'RECORD SINGLE VISIT (-1)'}
                        </button>

                        {/* Zero Balance reset button */}
                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm(lang === 'RU' ? 'Сбросить балансы спортсмена до нуля?' : 'Are you sure you want to completely reset athlete balance?')) {
                              try {
                                if (isDemo || displayAthlete.id === 'gabriel_z_reg') {
                                  setDemoTotal(0);
                                  setDemoUsed(0);
                                  await logPurchase(0, 'reset', lang === 'RU' ? 'Балансы полностью обнулились' : 'Completely reset packages');
                                } else {
                                  const docRef = doc(db, 'registrations', displayAthlete.id);
                                  await updateDoc(docRef, { totalPaidClasses: 0, usedPaidClasses: 0 });
                                  await logPurchase(0, 'reset', lang === 'RU' ? 'Балансы полностью обнулились' : 'Completely reset packages');
                                  
                                  if (displayAthlete.athleteId) {
                                    await updateDoc(doc(db, 'athletes', displayAthlete.athleteId), {
                                      totalPaidClasses: 0,
                                      usedPaidClasses: 0
                                    });
                                  }
                                }
                                setFeedback({
                                  type: 'success',
                                  text: lang === 'RU' ? 'Баланс полностью сброшен!' : 'Completely reset balance progress!'
                                });
                                setTimeout(() => setFeedback(null), 4000);
                              } catch (err) {
                                console.error(err);
                              }
                            }
                          }}
                          className="px-4 py-3 text-xs font-black uppercase italic tracking-wider rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all border border-red-500/25 cursor-pointer shadow-sm hover:scale-[1.03]"
                        >
                          RESET
                        </button>
                      </div>
                    </div>

                  </form>

                  {feedback && (
                    <div className={`p-4 rounded-2xl text-xs font-black text-center animate-bounce shadow-inner ${
                      feedback.type === 'success' 
                        ? 'bg-brand-teal/10 border border-brand-teal/25 text-brand-teal uppercase' 
                        : 'bg-red-500/10 border border-red-500/25 text-red-600 uppercase'
                    }`}>
                      {feedback.text}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* History logs table */}
            <Card className="p-6 sm:p-8 rounded-[32px] glass border-white/60 shadow-xl bg-white/40 font-sans text-left">
              <div className="flex items-center gap-2 mb-6 justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-brand-teal" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">
                    {lang === 'RU' ? 'История обновления баланса и оплат' : lang === 'GE' ? 'პაკეტების განახლების ისტორია' : 'Purchase & Update History'}
                  </h4>
                </div>
              </div>

              {paymentHistory.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-brand-navy/10 rounded-2xl text-brand-navy/40">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-55 animate-pulse text-brand-navy/30" />
                  <p className="text-xs font-bold uppercase tracking-wider italic">
                    {lang === 'RU' ? 'История чиста' : 'No purchase history logs'}
                  </p>
                  <p className="text-[10px] mt-1 normal-case px-4 text-center">
                    {lang === 'RU' ? 'Информация о назначении пакетов и транзакциях появится после обновлений.' : 'Transactions will populate here once you make adjustments or assign packages.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto text-left">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="text-brand-navy/30 border-b border-brand-navy/5 uppercase text-[9px] font-black tracking-widest text-left">
                        <th className="py-2.5 font-sans italic text-left">{lang === 'RU' ? 'Дата и Время' : 'Date & Time'}</th>
                        <th className="py-2.5 font-sans italic text-left">{lang === 'RU' ? 'Событие / Описание' : 'Transaction description'}</th>
                        <th className="py-2.5 text-right font-sans italic">{lang === 'RU' ? 'Тикет' : 'Balance'}</th>
                        <th className="py-2.5 text-right font-sans italic text-right">{lang === 'RU' ? 'Оператор' : 'Staff'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-navy/5 font-sans font-bold">
                      {paymentHistory.map((item: any, index: number) => {
                        const dateStr = new Date(item.updatedAt).toLocaleString(lang === 'RU' ? 'ru' : 'en', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        return (
                          <tr key={item.id || index} className="text-brand-navy/85 hover:bg-black/5 transition-colors text-left">
                            <td className="py-3 font-mono text-[10px] text-brand-navy/40 text-left">{dateStr}</td>
                            <td className="py-3 font-medium italic text-brand-navy uppercase tracking-tight text-[11px] text-left">
                              <span className="flex items-center gap-1.5 font-black text-brand-navy/80 text-left">
                                <span className={`w-2 h-2 rounded-full ${item.type === 'reset' ? 'bg-red-500 animate-ping' : 'bg-brand-teal'}`} />
                                {item.label}
                              </span>
                            </td>
                            <td className="py-3 text-right font-black font-mono text-brand-navy">{item.newTotal}</td>
                            <td className="py-3 text-right text-[10px] italic text-brand-navy/40 text-right">{item.masterName}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

        </div>
      )}
    </motion.div>
  );
}
