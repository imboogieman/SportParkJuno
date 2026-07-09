import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Phone, GraduationCap, Calendar, MapPin, ClipboardList, Camera, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Clock, CreditCard, LayoutGrid, ShieldCheck, X } from 'lucide-react';
import { translations } from '../i18n';
import { Button, Card, Badge } from '../components/UI';
import { TermsModal } from '../components/TermsModal';
import { db, auth } from '../lib/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { collection, addDoc, serverTimestamp, doc, getDocFromCache, query, where, getDocs, limit } from 'firebase/firestore';
import { signInWithPhoneNumber } from 'firebase/auth';
import { PatternFormat } from 'react-number-format';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
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
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface RegistrationData {
  parent: {
    fullName: string;
    phone: string;
  };
  student: {
    name: string;
    age: string;
    gender: 'male' | 'female';
    location: string;
    language: 'RU' | 'EN' | 'GE' | 'TR';
    medicalNotes: string;
    profileImage: string | null;
  };
  training: {
    group: string;
    schedule: string;
  };
  payment: {
    type: 'trial' | 'foundation' | 'monthly';
    method: 'at_field';
  };
}

export default function Registration({ lang }: { lang: 'EN' | 'GE' | 'RU' }) {
  const t = (translations[lang] as any);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isAddingNewAthlete = useMemo(() => searchParams.get('add_athlete') === 'true', [searchParams]);

  const [step, setStep] = useState<number | 'loading'>(() => {
    return 'loading'; // Always show loading then decide in useEffect
  });
  const [isLoggedInFlow, setIsLoggedInFlow] = useState(() => {
    const storedAthlete = localStorage.getItem('athleteAccount');
    const storedMaster = localStorage.getItem('masterAccount');
    return !!(auth.currentUser?.phoneNumber || storedAthlete || storedMaster || isAddingNewAthlete);
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Phone Auth states
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [showDuplicateError, setShowDuplicateError] = useState(false);

  useEffect(() => {
    // Initialize reCAPTCHA once and keep it stable
    const initRecaptcha = async () => {
      try {
        const { RecaptchaVerifier } = await import('firebase/auth');
        // Set language based on current selection
        auth.languageCode = lang.toLowerCase();
        
        if (!(window as any).recaptchaVerifier) {
          console.log("Setting up RecaptchaVerifier for domain:", window.location.hostname);
          console.log("Auth config domain:", firebaseConfig.authDomain);
          
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
              console.log("reCAPTCHA transition solved:", !!response);
            },
            'expired-callback': () => {
              console.warn("reCAPTCHA has expired. Application may need reload.");
            }
          });
          
          (window as any).recaptchaVerifier = verifier;
          
          try {
            await verifier.render();
            console.log("reCAPTCHA rendered successfully.");
          } catch (renderError) {
            console.error("reCAPTCHA rendering failed:", renderError);
          }
        }
      } catch (err) {
        console.error("reCAPTCHA Init Global Error:", err);
      }
    };
    
    // Delay initialization slightly to ensure element is in DOM
    const timer = setTimeout(() => {
      initRecaptcha();
    }, 1000);

    return () => clearTimeout(timer);
  }, [lang]);

  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromCache(doc(db, 'test', 'connection'));
      } catch (error) {
        // Ignored
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    // Listen for auth state changes to pre-fill parent info
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const storedAthlete = localStorage.getItem('athleteAccount');
      const storedMaster = localStorage.getItem('masterAccount');
      
      if (!isAddingNewAthlete && (storedAthlete || storedMaster)) {
        navigate('/portal');
        return;
      }

      const hasStoredSession = false;
      
      console.log("Auth State Changed:", { 
        hasUser: !!user, 
        phone: user?.phoneNumber, 
        hasStoredSession,
        currentStep: step,
        isAddingNewAthlete
      });

      if (isAddingNewAthlete) {
        setIsLoggedInFlow(true);
        let parentName = '';
        let cleanPhone = '';

        if (storedAthlete) {
          try {
            const data = JSON.parse(storedAthlete);
            parentName = data.parentFullName || '';
            const rawPhone = data.parentPhone || '';
            cleanPhone = rawPhone.replace('+995', '').replace(/\s/g, '');
          } catch (e) {
            console.error("Error parsing storedAthlete", e);
          }
        }

        if (user?.phoneNumber) {
          const userPhone = user.phoneNumber;
          const userCleanPhone = userPhone.replace('+995', '').replace(/\s/g, '');
          if (!cleanPhone) {
            cleanPhone = userCleanPhone;
          }

          if (!parentName) {
            try {
              const q = query(
                collection(db, 'registrations'), 
                where('parentPhone', '==', userPhone),
                limit(1)
              );
              const snapshot = await getDocs(q);
              if (!snapshot.empty) {
                const existingReg = snapshot.docs[0].data();
                parentName = existingReg.parentFullName || '';
              }
            } catch (err) {
              console.error("Error fetching parent info:", err);
            }
          }
        }

        setFormData(prev => ({
          ...prev,
          parent: {
            fullName: parentName || prev.parent.fullName,
            phone: cleanPhone || prev.parent.phone
          }
        }));

        setStep(2);
        return;
      }

      if (user?.phoneNumber) {
        setIsLoggedInFlow(true);
        let parentPhone = user.phoneNumber;
        let parentName = '';

        const cleanPhone = parentPhone.replace('+995', '').replace(/\s/g, '');
        
        try {
          const q = query(
            collection(db, 'registrations'), 
            where('parentPhone', '==', parentPhone),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const existingReg = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            localStorage.setItem('athleteAccount', JSON.stringify(existingReg));
            navigate('/portal');
            return;
          }

          setFormData(prev => ({
            ...prev,
            parent: {
              fullName: parentName || prev.parent.fullName,
              phone: cleanPhone || prev.parent.phone
            }
          }));
        } catch (err) {
          console.error("Error fetching parent info:", err);
          setFormData(prev => ({
            ...prev,
            parent: {
              ...prev.parent,
              phone: cleanPhone || prev.parent.phone
            }
          }));
        }

        // Keep user at step 1 to confirm their info, even if logged in
        setStep(1);
      } else if (user === null) {
        setIsLoggedInFlow(false);
        setStep(1);
      }
    });

    return () => unsubscribe();
  }, [isAddingNewAthlete]);

  const [formData, setFormData] = useState<RegistrationData>({
    parent: {
      fullName: '',
      phone: '',
    },
    student: {
      name: '',
      age: '',
      gender: 'male',
      location: '',
      language: (['RU', 'EN'].includes(lang) ? lang : 'RU') as any,
      medicalNotes: '',
      profileImage: null,
    },
    training: {
      group: '',
      schedule: '',
    },
    payment: {
      type: 'trial',
      method: 'at_field',
    },
  });

  const pricingValues = useMemo(() => {
    const age = parseInt(formData.student.age, 10) || 8;
    if (age >= 5 && age <= 7) {
      return {
        foundation: 145,
        foundationPerClass: '18.1',
        monthly: 199,
        monthlyPerClass: '16.6',
      };
    } else if (age >= 12) {
      return {
        foundation: 189,
        foundationPerClass: '23.6',
        monthly: 234,
        monthlyPerClass: '19.5',
      };
    } else {
      // 8-11
      return {
        foundation: 177,
        foundationPerClass: '22.1',
        monthly: 222,
        monthlyPerClass: '18.5',
      };
    }
  }, [formData.student.age]);

  const updateParentField = (field: keyof RegistrationData['parent'], value: string) => {
    setFormData(prev => ({
      ...prev,
      parent: { ...prev.parent, [field]: value }
    }));
  };

  const updateStudentField = (field: keyof RegistrationData['student'], value: any) => {
    setFormData(prev => ({
      ...prev,
      student: { ...prev.student, [field]: value },
      training: field === 'location' ? { ...prev.training, schedule: '' } : prev.training
    }));
  };

  const updateTrainingField = (field: keyof RegistrationData['training'], value: string) => {
    setFormData(prev => ({
      ...prev,
      training: { ...prev.training, [field]: value }
    }));
  };

  const updatePaymentField = (field: keyof RegistrationData['payment'], value: any) => {
    setFormData(prev => ({
      ...prev,
      payment: { ...prev.payment, [field]: value }
    }));
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Georgian mobile numbers: exactly 9 digits, starting with '5'
    const cleanPhone = phone.replace(/\D/g, '');
    return /^5\d{8}$/.test(cleanPhone);
  };

  const handleNext = async () => {
    if (step === 1 || step === 1.5) { // Allow handleNext to trigger SMS again from step 1.5 (resend)
      const errors: Record<string, string> = {};
      
      const cleanPhone = formData.parent.phone.replace(/\D/g, '');
      
      if (formData.parent.fullName.length < 3) errors.parentName = 'Name too short';
      if (!validatePhone(formData.parent.phone)) errors.parentPhone = t.regInvalidPhone;
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      setValidationErrors({});
      setIsVerifying(true);
      setSubmitError(null);
      
      // Ensure E.164 format: +995XXXXXXXXX (995 is the country code, cleanPhone is 9 digits)
      const fullPhone = `+995${cleanPhone}`;
      console.log("Full Phone prepared:", fullPhone);

      try {
        // Only check for duplicates if user is NOT logged in.
        // If they are logged in, we allow multiple students per phone.
        if (!auth.currentUser) {
          const q = query(collection(db, 'registrations'), where('parentPhone', '==', fullPhone));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setShowDuplicateError(true);
            setIsVerifying(false);
            return;
          }
        } else if (auth.currentUser.phoneNumber === fullPhone) {
          // Already logged in with this number, just skip to student info
          setStep(2);
          setIsVerifying(false);
          return;
        }

        let verifier = (window as any).recaptchaVerifier;
        
        if (!verifier) {
          console.log("Verifier missing in handleNext, creating now...");
          const { RecaptchaVerifier } = await import('firebase/auth');
          auth.languageCode = lang.toLowerCase();
          verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 'size': 'invisible' });
          (window as any).recaptchaVerifier = verifier;
        }

        console.log("Executing signInWithPhoneNumber for:", fullPhone, "on domain:", window.location.hostname);
        
        const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
        console.log("SMS result received successfully.");
        setConfirmationResult(result);
        setStep(1.5);
      } catch (error: any) {
        console.error("Firebase SMS Detailed Error:", error);
        
        const errorCode = error.code || 'unknown';
        let msg = t.regPhoneError || "Failed to send SMS.";
        
        if (errorCode === 'auth/invalid-phone-number') {
           msg = "Invalid phone number format. Use 9 digits (e.g. 551 530 272).";
        } else if (errorCode === 'auth/too-many-requests') {
           msg = "Too many attempts. Please wait 10-15 minutes.";
        } else if (errorCode === 'auth/captcha-check-failed' || errorCode.includes('captcha')) {
           msg = "reCAPTCHA verification failed. Try disabling adblockers or VPN.";
        } else if (errorCode === 'auth/app-not-authorized' || errorCode.includes('-39')) {
           msg = "Domain/App Auth Error (-39). CRITICAL: 1. In GCP Console > Credentials, ensure your API Key has NO 'HTTP Referrer' restrictions or includes '*//ais-*'. 2. Check Firebase Console > Auth > Settings > Authorized Domains. 3. Ensure 'Identity Toolkit API' is enabled in Google Cloud Console.";
        } else {
           msg = `Error: ${error.message || 'Verification failed'}`;
        }
        
        setSubmitError(`${msg} (${errorCode})`);
      } finally {
        setIsVerifying(false);
      }
    } else {
      setStep(prev => prev + 1);
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult || otp.length !== 6) return;
    setIsVerifying(true);
    setSubmitError(null);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      
      if (user?.phoneNumber) {
        const q = query(
          collection(db, 'registrations'),
          where('parentPhone', '==', user.phoneNumber),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const existingAthlete = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          localStorage.setItem('athleteAccount', JSON.stringify(existingAthlete));
          navigate('/portal');
          return;
        }
      }
      
      setStep(2);
    } catch (error) {
      console.error("OTP Error", error);
      setSubmitError("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrev = () => {
    if (step === 2) {
      if (isLoggedInFlow) navigate('/portal');
      else setStep(1);
    } else if (step === 1.5) setStep(1);
    else setStep(prev => Math.floor((prev as number) - 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registrationPath = 'registrations';
      const fullPhone = `+995${formData.parent.phone}`;
      const docData = {
        parentFullName: formData.parent.fullName,
        parentPhone: fullPhone,
        parentEmail: '',
        studentName: formData.student.name,
        studentAge: parseInt(formData.student.age, 10),
        studentGender: formData.student.gender,
        studentLocation: formData.student.location,
        studentLanguage: formData.student.language,
        studentMedicalNotes: formData.student.medicalNotes || '',
        studentProfileImage: formData.student.profileImage || '',
        trainingGroup: formData.training.group,
        trainingSchedule: formData.training.schedule,
        paymentType: formData.payment.type,
        paymentMethod: formData.payment.method,
        xp: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, registrationPath), docData);
      
      // Write public profile for landing page preview (no PII)
      const publicProfileData = {
        studentName: formData.student.name,
        studentAge: parseInt(formData.student.age, 10),
        studentLocation: formData.student.location,
        studentProfileImage: formData.student.profileImage || '',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'public_profiles'), publicProfileData);
      
      // Save for profile preview on landing and cabinet
      const lastAthlete = {
        id: docRef.id,
        name: formData.student.name,
        location: formData.student.location,
        profileImage: formData.student.profileImage,
        registeredAt: new Date().toISOString(),
        schedule: formData.training.schedule,
        group: formData.training.group
      };

      const accountData = {
        id: docRef.id,
        ...docData,
        createdAt: new Date().toISOString() // Simulating for local storage
      };

      localStorage.setItem('lastRegisteredAthlete', JSON.stringify(lastAthlete));
      localStorage.setItem('athleteAccount', JSON.stringify(accountData));
      localStorage.setItem('justRegistered', 'true');
      
      setStep(5);
    } catch (error) {
      setSubmitError('Failed to complete registration. Please try again.');
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageToGroup = useMemo(() => {
    return 'Standard';
  }, []);

  React.useEffect(() => {
    if (ageToGroup && !formData.training.group) {
        updateTrainingField('group', ageToGroup);
    }
  }, [ageToGroup]);

  const scheduleOptions = useMemo(() => {
    const loc = formData.student.location;
    if (loc === 'metro_mall') {
      return [
        {
          value: 'tue_thu_sun_10',
          label: lang === 'RU' 
            ? 'ВТ / ЧТ / ВС — 10:00 am' 
            : lang === 'GE' 
            ? 'სამშ / ხუთშ / კვირა — 10:00 am' 
            : 'Tue, Thursday, Sunday - 10:00 am'
        },
        {
          value: 'tue_thu_sun_18',
          label: lang === 'RU'
            ? 'ВТ / ЧТ / ВС — 18:00 pm'
            : lang === 'GE'
            ? 'სამშ / ხუთშ / კვირა — 18:00 pm'
            : 'Tue, Thursday, Sunday - 18:00 pm'
        }
      ];
    } else if (loc === 'agmashenebeli') {
      return [
        {
          value: 'mon_wed_fri_10',
          label: lang === 'RU'
            ? 'ПН / СР / ПТ — 10:00 am'
            : lang === 'GE'
            ? 'ორშ / ოთხშ / პარ — 10:00 am'
            : 'Mon, Wednesday, Friday - 10:00 am'
        },
        {
          value: 'mon_wed_fri_18_pm',
          label: lang === 'RU'
            ? 'ПН / СР / ПТ — 18:00 pm'
            : lang === 'GE'
            ? 'ორშ / ოთხშ / პარ — 18:00 pm'
            : 'Mon, Wednesday, Friday - 18:00 pm'
        }
      ];
    } else if (loc === 'heroes_park') {
      return [
        {
          value: 'mon_wed_fri_15_pm',
          label: lang === 'RU'
            ? 'ПН / СР / ПТ — 15:00 pm'
            : lang === 'GE'
            ? 'ორშ / ოთხშ / პარ — 15:00 pm'
            : 'Mon, Wednesday, Friday - 15:00 pm'
        },
        {
          value: 'sat_10',
          label: lang === 'RU'
            ? 'СБ — 10:00 am'
            : lang === 'GE'
            ? 'შაბ — 10:00 am'
            : 'Sat - 10:00 am'
        }
      ];
    } else {
      return [
        {
          value: 'mon_wed_fri_morning',
          label: lang === 'RU'
            ? 'ПН / СР / ПТ — утро'
            : lang === 'GE'
            ? 'ორშ / ოთხშ / პარ — დილა'
            : 'Mon, Wednesday, Friday - morning'
        },
        {
          value: 'mon_wed_fri_evening',
          label: lang === 'RU'
            ? 'ПН / СР / ПТ — вечер'
            : lang === 'GE'
            ? 'ორშ / ოთხშ / პარ — საღამო'
            : 'Mon, Wednesday, Friday - evening'
        },
        {
          value: 'tue_thu_sun_morning',
          label: lang === 'RU'
            ? 'ВТ / ЧТ / ВС — утро'
            : lang === 'GE'
            ? 'სამშ / ხუთშ / კვირა — დილა'
            : 'Tue, Thursday, Sunday - morning'
        },
        {
          value: 'tue_thu_sun_evening',
          label: lang === 'RU'
            ? 'ВТ / ЧТ / ВС — вечер'
            : lang === 'GE'
            ? 'სამშ / ხუთშ / კვირა — საღამო'
            : 'Tue, Thursday, Sunday - evening'
        }
      ];
    }
  }, [formData.student.location, lang]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateStudentField('profileImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-brand-teal animate-spin mb-6" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-navy animate-pulse italic">
          {lang === 'RU' ? 'Загрузка профиля...' : 'Checking Authorization...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream pt-6 pb-12 md:py-24 px-4 sm:px-6 relative flex flex-col justify-start md:justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <img src="https://images.unsplash.com/photo-1551952237-954a0e68786c?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="" />
      </div>
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Recaptcha Container */}
      <div className="flex justify-center mb-6 h-0 overflow-hidden pointer-events-none">
        <div id="recaptcha-container" className="min-w-[1px] min-h-[1px]"></div>
      </div>
      
      <div className="max-w-2xl w-full mx-auto relative z-10">
        <div className="mb-4 md:mb-12 text-center flex flex-col items-center">
          <Badge color="teal">{t.regTitle}</Badge>
        </div>

        <AnimatePresence mode="wait">
          {showDuplicateError ? (
            <motion.div
              key="duplicateError"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-8 md:p-12 glass border-white shadow-3xl rounded-[48px] md:rounded-[64px] text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[32px] bg-red-100 flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-4 leading-none text-brand-navy">{t.regDuplicatePhone}</h2>
                <p className="text-xs md:text-sm font-black text-brand-navy/30 italic uppercase tracking-widest leading-relaxed max-w-xs mx-auto mb-10">
                  {t.regDuplicatePhoneDesc}
                </p>

                <div className="flex flex-col gap-4">
                  <Button 
                    className="w-full h-18 !rounded-[24px] italic uppercase tracking-widest text-xs font-black shadow-teal" 
                    onClick={async () => {
                      setIsVerifying(true);
                      const cleanPhone = formData.parent.phone.replace(/\D/g, '');
                      const fullPhone = `+995${cleanPhone}`;
                      try {
                        const q = query(
                          collection(db, 'registrations'), 
                          where('parentPhone', '==', fullPhone),
                          limit(1)
                        );
                        const snapshot = await getDocs(q);
                        if (!snapshot.empty) {
                          const existingReg = snapshot.docs[0].data();
                          setFormData(prev => ({
                            ...prev,
                            parent: {
                              fullName: existingReg.parentFullName || prev.parent.fullName,
                              phone: cleanPhone
                            }
                          }));
                        }
                      } catch (err) {
                        console.error("Error pre-filling parent details:", err);
                      }
                      setIsVerifying(false);
                      setShowDuplicateError(false);
                      setStep(2);
                    }}
                  >
                    {t.regDuplicateSignIn} <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full h-16 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black border-brand-navy/10 hover:bg-black/5" 
                    onClick={() => setShowDuplicateError(false)}
                  >
                    {t.regDuplicateUseOther}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ) : step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 md:p-12 glass border-white shadow-3xl rounded-[48px] md:rounded-[64px] relative">
                <button 
                  onClick={() => navigate('/')}
                  className="absolute top-6 right-6 w-10 h-10 rounded-full border border-brand-navy/10 flex items-center justify-center text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-6 mb-12 pr-12">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-teal/10 flex items-center justify-center shadow-inner shrink-0">
                    <User className="text-brand-teal w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-1">
                      {isLoggedInFlow ? (lang === 'RU' ? 'Проверка родителя' : 'Confirm Guardian') : t.regParentTitle}
                    </h2>
                    <p className="text-xs font-black uppercase tracking-widest text-brand-navy/30 italic">Step 01 / Primary Guardian</p>
                  </div>
                </div>

                {isLoggedInFlow ? (
                  <div className="mb-8 p-4 bg-brand-sunset/5 rounded-2xl border border-brand-sunset/10 flex items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase italic tracking-widest text-brand-navy/40">
                      {lang === 'RU' ? 'Вы вошли в систему' : 'You are logged in'}
                    </p>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('athleteAccount');
                        localStorage.removeItem('masterAccount');
                        auth.signOut();
                        window.location.reload();
                      }}
                      className="text-[10px] font-black uppercase italic tracking-widest text-brand-sunset hover:underline"
                    >
                      {lang === 'RU' ? 'Выйти / Очистить форму' : 'Logout / Clear Form'}
                    </button>
                  </div>
                ) : (
                  <div className="mb-8 p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10 flex items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase italic tracking-widest text-brand-navy/40">
                      {lang === 'RU' ? 'Уже есть аккаунт?' : 'Already have an account?'}
                    </p>
                    <button 
                      onClick={() => navigate('/portal')}
                      className="text-[10px] font-black uppercase italic tracking-widest text-brand-teal hover:underline"
                    >
                      {lang === 'RU' ? 'Войти в портал' : 'Login to Portal'}
                    </button>
                  </div>
                )}

                <div className="space-y-8 text-left">
                  <div>
                    <label className="block text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regParentName}</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <input 
                        type="text" 
                        value={formData.parent.fullName}
                        onChange={(e) => updateParentField('fullName', e.target.value)}
                        className={`w-full h-16 md:h-18 pl-16 pr-6 bg-white/40 border-2 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm ${validationErrors.parentName ? 'border-red-500' : 'border-brand-navy/5'}`} 
                        placeholder="ALEXANDER ATHLETE"
                        required
                      />
                    </div>
                    {validationErrors.parentName && <p className="text-[10px] text-red-500 mt-2 font-black uppercase px-2">{validationErrors.parentName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regParentPhone}</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20 pointer-events-none z-10" />
                      <PatternFormat 
                        format="### ### ###"
                        value={formData.parent.phone}
                        onValueChange={(values) => {
                          // values.value will be just the 9 digits
                          updateParentField('phone', values.value);
                        }}
                        className={`w-full h-16 md:h-18 pl-[115px] pr-6 bg-white/40 border-2 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm ${validationErrors.parentPhone ? 'border-red-500' : 'border-brand-navy/5'}`} 
                        placeholder="5__ ___ ___"
                        required
                        type="tel"
                        allowEmptyFormatting
                      />
                      <span className="absolute left-14 top-1/2 -translate-y-1/2 font-black text-brand-navy/60 italic text-base md:text-lg select-none pointer-events-none z-10">+995</span>
                    </div>
                    {validationErrors.parentPhone && <p className="text-[10px] text-red-500 mt-2 font-black uppercase px-2">{validationErrors.parentPhone}</p>}
                  </div>

                  <div className="flex items-center gap-4 px-2">
                    <button 
                      onClick={() => setAgreedToTerms(!agreedToTerms)}
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${agreedToTerms ? 'bg-brand-teal border-brand-teal text-white' : 'border-brand-navy/10 bg-white/40'}`}
                    >
                      {agreedToTerms && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-brand-navy/40 italic leading-relaxed">
                      {lang === 'RU' ? (
                        <>
                          Нажимая кнопку, вы принимаете <button type="button" onClick={() => setIsTermsOpen(true)} className="text-brand-teal hover:text-brand-sunset transition-colors font-black underline decoration-brand-teal/30 hover:decoration-brand-sunset">условия публичной оферты и обработки персональных данных</button>
                        </>
                      ) : (
                        <>
                          By clicking, you accept the <button type="button" onClick={() => setIsTermsOpen(true)} className="text-brand-teal hover:text-brand-sunset transition-colors font-black underline decoration-brand-teal/30 hover:decoration-brand-sunset">public offer and privacy policy</button>
                        </>
                      )}
                    </p>
                  </div>

                  {submitError && (
                    <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100">
                      {submitError}
                    </div>
                  )}

                  <Button 
                    className="w-full h-18 md:h-20 !rounded-[28px] mt-6 italic uppercase tracking-widest text-sm font-black shadow-teal" 
                    onClick={handleNext}
                    disabled={!formData.parent.fullName || !validatePhone(formData.parent.phone) || isVerifying || !agreedToTerms}
                  >
                    {isVerifying ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <span className="flex items-center gap-3">{t.regNext} <ArrowRight className="w-5 h-5" /></span>}
                  </Button>

                  {isVerifying && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-teal animate-pulse italic">
                        {t.regSendingCode}
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {step === 1.5 && (
            <motion.div 
              key="step1.5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-xl mx-auto px-4"
            >
              <Card className="p-6 md:p-10 glass border-white shadow-3xl rounded-[32px] md:rounded-[48px] text-center overflow-hidden relative border-t-4 md:border-t-8 border-t-brand-teal/40">
                <div className="absolute top-0 left-0 w-full h-1 bg-brand-teal/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 60, ease: "linear" }}
                    className="h-full bg-brand-teal shadow-[0_0_10px_rgba(45,185,183,0.5)]"
                  />
                </div>

                <div className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] bg-brand-teal/10 flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner group transition-all hover:scale-110">
                  <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-brand-teal group-hover:rotate-[15deg] transition-transform duration-500" />
                </div>
                
                <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none text-brand-navy drop-shadow-sm">{t.regOTPTitle}</h2>
                
                <div className="mb-8">
                  <p className="text-[10px] md:text-xs font-black text-brand-navy/30 italic uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto mb-4">
                    {t.regOTPSub}
                  </p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/60 rounded-[24px] border border-brand-teal/20 shadow-lg backdrop-blur-xl group hover:border-brand-teal transition-all">
                    <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                    <span className="text-brand-navy font-black text-base md:text-lg tracking-tighter italic">+995 {formData.parent.phone}</span>
                    <button 
                      onClick={() => setStep(1)} 
                      className="ml-2 w-8 h-8 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/40 hover:text-brand-teal hover:bg-brand-teal/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-8 max-w-xs md:max-w-sm mx-auto">
                  <div className="relative group">
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/20 mb-4 italic transition-all group-focus-within:text-brand-teal">
                      {t.regOTPCode}
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        pattern="\d*"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full h-20 md:h-28 text-center text-4xl md:text-6xl font-black tracking-[0.2em] md:tracking-[0.4em] bg-white/40 border-2 border-brand-navy/5 rounded-[32px] focus:outline-none focus:border-brand-teal focus:bg-white transition-all shadow-xl italic placeholder:opacity-5" 
                        placeholder="••••••"
                        autoFocus
                      />
                    </div>
                  </div>

                  {submitError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="p-6 bg-red-50 text-red-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest border border-red-100 flex items-start gap-3 shadow-sm text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4" />
                      </div>
                      <span className="leading-tight pt-1">{submitError}</span>
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      variant="outline" 
                      className="w-full sm:w-auto px-8 h-14 md:h-16 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black border hover:bg-brand-navy hover:text-white transition-all order-2 sm:order-1" 
                      onClick={() => setStep(1)} 
                      disabled={isVerifying}
                    >
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-1 h-14 md:h-16 !rounded-[24px] italic uppercase tracking-[0.1em] text-base font-black shadow-teal order-1 sm:order-2" 
                      onClick={verifyOTP}
                      disabled={otp.length !== 6 || isVerifying}
                    >
                      {isVerifying ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="flex items-center justify-center gap-3">{t.regOTPVerify} <ArrowRight className="w-6 h-6" /></span>}
                    </Button>
                  </div>

                  <div className="flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black text-brand-navy/30 italic uppercase tracking-[0.3em]">
                      Didn't receive code? 
                      <button 
                        onClick={handleNext} 
                        disabled={isVerifying} 
                        className="text-brand-teal hover:text-brand-sunset ml-1 border-b border-brand-teal/20 hover:border-brand-sunset/40 transition-all pb-0.5"
                      >
                        Resend SMS
                      </button>
                    </p>
                    
                    <div className="opacity-30">
                      <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] text-brand-navy/60 leading-relaxed max-w-[240px] text-center italic">
                        This environment is protected by <span className="text-brand-teal">reCAPTCHA</span>. 
                        Google <a href="https://policies.google.com/privacy" className="underline hover:text-brand-teal">Privacy</a> & 
                        <a href="https://policies.google.com/terms" className="ml-1 underline hover:text-brand-teal">Terms</a> apply.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 md:p-12 glass border-white shadow-3xl rounded-[48px] md:rounded-[64px] relative">
                {!isLoggedInFlow && (
                  <button 
                    onClick={() => setStep(1)}
                    className="absolute top-6 right-6 px-4 py-2 rounded-full border border-brand-navy/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-navy/40 hover:text-brand-teal hover:border-brand-teal hover:bg-white transition-all bg-white/40"
                  >
                    <ArrowLeft className="w-3 h-3" /> Step 01
                  </button>
                )}
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-brand-teal/5 flex items-center justify-center shadow-inner shrink-0">
                    <GraduationCap className="text-brand-teal w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-1">{t.regStudentTitle}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 italic">
                      {isLoggedInFlow ? 'Step 01 / Athlete Profile' : 'Step 02 / Athlete Profile'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8 text-left">
                  <div className="flex justify-center mb-8 md:mb-10">
                    <div className="relative group">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-[32px] md:rounded-[40px] overflow-hidden bg-brand-navy/5 flex items-center justify-center border-2 border-dashed border-brand-navy/10 relative transition-transform group-hover:scale-105 group-hover:rotate-3">
                        {formData.student.profileImage ? (
                          <img src={formData.student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 md:w-10 md:h-10 text-brand-navy/10" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-xl border-4 border-brand-cream">
                        <Camera className="w-3 md:w-4 h-3 md:h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentName}</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <input 
                        type="text" 
                        value={formData.student.name}
                        onChange={(e) => updateStudentField('name', e.target.value)}
                        className="w-full h-16 md:h-18 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[24px] md:rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm" 
                        placeholder="YOUNG ATHLETE NAME"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentAge}</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                        <input 
                          type="number" 
                          value={formData.student.age}
                          onChange={(e) => updateStudentField('age', e.target.value)}
                          className="w-full h-16 md:h-18 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[24px] md:rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm" 
                          placeholder="8"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentGender}</label>
                      <div className="flex bg-white/40 p-1.5 rounded-[20px] md:rounded-[24px] border-2 border-brand-navy/5 h-16 md:h-18 shadow-sm">
                        <button 
                          onClick={() => updateStudentField('gender', 'male')}
                          className={`flex-1 rounded-[14px] md:rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            formData.student.gender === 'male' ? 'bg-brand-navy text-white shadow-xl' : 'text-brand-navy/30 hover:bg-black/5'
                          }`}
                        >
                          {t.regStudentGenderMale}
                        </button>
                        <button 
                          onClick={() => updateStudentField('gender', 'female')}
                          className={`flex-1 rounded-[14px] md:rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            formData.student.gender === 'female' ? 'bg-brand-navy text-white shadow-xl' : 'text-brand-navy/30 hover:bg-black/5'
                          }`}
                        >
                          {t.regStudentGenderFemale}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentLocation}</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <select 
                        value={formData.student.location}
                        onChange={(e) => updateStudentField('location', e.target.value)}
                        className="w-full h-16 md:h-18 pl-16 pr-10 bg-white/40 border-2 border-brand-navy/5 rounded-[24px] md:rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm appearance-none" 
                        required
                      >
                        <option value="">{t.locNearest}</option>
                        <option value="airport_runway">{t.locAirport}</option>
                        <option value="metro_mall">{t.locMetroMall}</option>
                        <option value="agmashenebeli">{t.locAgmashenebeli}</option>
                        <option value="pirosmani_5">{t.locPirosmani5}</option>
                        <option value="kaczynski_5">{t.locKaczynski5}</option>
                        <option value="batumi_boulevard">{t.locBatumiBoulevard}</option>
                        <option value="heroes_park">{t.locHeroesPark}</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                        <ArrowRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentLanguage}</label>
                    <div className="flex bg-white/40 p-1.5 rounded-[20px] md:rounded-[24px] border-2 border-brand-navy/5 h-16 md:h-18 shadow-sm gap-1">
                      {([
                        { code: 'RU', label: t.langRussian },
                        { code: 'EN', label: t.langEnglish }
                      ] as const).map((item) => (
                        <button
                          type="button"
                          key={item.code}
                          onClick={() => updateStudentField('language', item.code)}
                          className={`flex-1 rounded-[14px] md:rounded-[18px] text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all italic ${
                            formData.student.language === item.code ? 'bg-brand-navy text-white shadow-xl' : 'text-brand-navy/30 hover:bg-black/5'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-2 md:mb-3 px-2 italic">{t.regStudentMedical}</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-6 top-6 w-5 h-5 text-brand-navy/20" />
                      <textarea 
                        value={formData.student.medicalNotes}
                        onChange={(e) => updateStudentField('medicalNotes', e.target.value)}
                        className="w-full p-6 pl-16 bg-white/40 border-2 border-brand-navy/5 rounded-[24px] md:rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-sm shadow-sm h-32 resize-none" 
                        placeholder="..."
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button variant="outline" className="w-full sm:flex-1 h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black order-2 sm:order-1" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="w-full sm:flex-[2] h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal order-1 sm:order-2" 
                      onClick={handleNext}
                      disabled={!formData.student.name || !formData.student.age || !formData.student.location}
                    >
                      <span className="flex items-center gap-3">{t.regNext} <ArrowRight className="w-4 h-4" /></span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 md:p-12 glass border-white shadow-3xl rounded-[48px] md:rounded-[64px]">
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-brand-teal/10 flex items-center justify-center shadow-inner shrink-0">
                    <LayoutGrid className="text-brand-teal w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-1 md:mb-2">{t.regClassTitle}</h2>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-navy/30 italic">
                      {isLoggedInFlow ? 'Step 02 / Training Group' : 'Step 03 / Training Group'}
                    </p>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8 text-left">
                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 md:mb-4 px-2 italic">{t.groupStandard}</label>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="w-full h-16 md:h-20 px-6 md:px-8 rounded-2xl border-2 bg-brand-navy border-brand-navy text-white shadow-xl flex items-center justify-between font-black uppercase italic tracking-tighter text-sm md:text-base">
                        {t.groupStandard}
                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-brand-teal" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 md:mb-4 px-2 italic">{t.regSelectSchedule}</label>
                    <div className="relative">
                      <Clock className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-brand-navy/20" />
                      <select 
                        value={formData.training.schedule}
                        onChange={(e) => updateTrainingField('schedule', e.target.value)}
                        className="w-full h-16 md:h-20 pl-14 md:pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[24px] md:rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm appearance-none" 
                        required
                      >
                        <option value="">{lang === 'RU' ? 'ВЫБЕРИТЕ ВРЕМЯ' : 'Select Time Slot'}</option>
                        {scheduleOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 md:pt-6">
                    <Button variant="outline" className="w-full sm:flex-1 h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black order-2 sm:order-1" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="w-full sm:flex-[2] h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal order-1 sm:order-2" 
                      onClick={handleNext}
                      disabled={!formData.training.group || !formData.training.schedule}
                    >
                      <span className="flex items-center gap-3">{t.regNext} <ArrowRight className="w-4 h-4" /></span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6 md:p-12 glass border-white shadow-3xl rounded-[48px] md:rounded-[64px]">
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[20px] md:rounded-[24px] bg-brand-sunset/10 flex items-center justify-center shadow-inner shrink-0">
                    <CreditCard className="text-brand-sunset w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-1 md:mb-2">{t.regPaymentTitle}</h2>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-brand-navy/30 italic">
                      {isLoggedInFlow ? 'Step 03 / Plan Finalization' : 'Step 04 / Plan Finalization'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6 text-left">
                  <button
                    onClick={() => updatePaymentField('type', 'trial')}
                    className={`w-full p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 text-left transition-all relative group ${
                      formData.payment.type === 'trial' 
                      ? 'bg-brand-navy border-brand-navy text-white shadow-2xl scale-[1.01]' 
                      : 'bg-white/40 border-brand-navy/5 text-brand-navy hover:border-brand-teal/30 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4 pr-8">
                       <h3 className="font-black italic uppercase tracking-tighter text-xl md:text-2xl">{t.regTrialOption}</h3>
                       <div className="text-right">
                          <Badge color={formData.payment.type === 'trial' ? 'white' : 'teal'} className="px-3 md:px-4 py-1 md:py-1.5 rounded-xl uppercase italic text-[9px] md:text-xs">FREE</Badge>
                          <div className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1.5 leading-none ${formData.payment.type === 'trial' ? 'text-white/60' : 'text-brand-teal'}`}>0 GEL / {(t as any).perClassLabel}</div>
                       </div>
                    </div>
                    <p className={`text-xs md:text-sm font-medium leading-relaxed italic ${formData.payment.type === 'trial' ? 'text-white/50' : 'text-brand-navy/40'}`}>
                      {t.regTrialDesc}
                    </p>
                    {formData.payment.type === 'trial' && <div className="absolute top-6 right-6 md:top-8 md:right-8"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-brand-teal" /></div>}
                  </button>

                  <button
                    onClick={() => updatePaymentField('type', 'foundation')}
                    className={`w-full p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 text-left transition-all relative group ${
                      formData.payment.type === 'foundation' 
                      ? 'bg-brand-navy border-brand-navy text-white shadow-2xl scale-[1.01]' 
                      : 'bg-white/40 border-brand-navy/5 text-brand-navy hover:border-brand-teal/30 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4 pr-8">
                       <h3 className="font-black italic uppercase tracking-tighter text-xl md:text-2xl">{(t as any).plan3Name}</h3>
                       <div className="text-right">
                          <div className={`font-black text-lg md:text-xl italic leading-none ${formData.payment.type === 'foundation' ? 'text-white' : 'text-brand-sunset'}`}>{pricingValues.foundation} GEL</div>
                          <div className={`text-[7px] md:text-[8px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black mt-1 ${formData.payment.type === 'foundation' ? 'text-white/40' : 'text-brand-navy/20'}`}>8 CLASSES / MONTH</div>
                          <div className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1.5 leading-none ${formData.payment.type === 'foundation' ? 'text-white/60' : 'text-brand-sunset'}`}>{pricingValues.foundationPerClass} GEL / {(t as any).perClassLabel}</div>
                       </div>
                    </div>
                    <p className={`text-xs md:text-sm font-medium leading-relaxed italic ${formData.payment.type === 'foundation' ? 'text-white/50' : 'text-brand-navy/40'}`}>
                      {(t as any).plan3Sub}
                    </p>
                    {formData.payment.type === 'foundation' && <div className="absolute top-6 right-6 md:top-8 md:right-8"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-brand-sunset" /></div>}
                  </button>

                  <button
                    onClick={() => updatePaymentField('type', 'monthly')}
                    className={`w-full p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-2 text-left transition-all relative group ${
                      formData.payment.type === 'monthly' 
                      ? 'bg-brand-teal border-brand-teal text-white shadow-teal scale-[1.01]' 
                      : 'bg-white/40 border-brand-navy/5 text-brand-navy hover:border-brand-teal/30 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4 pr-8">
                       <h3 className="font-black italic uppercase tracking-tighter text-xl md:text-2xl">{t.regMonthlyOption}</h3>
                       <div className="text-right">
                          <div className={`font-black text-lg md:text-xl italic leading-none ${formData.payment.type === 'monthly' ? 'text-white' : 'text-brand-teal'}`}>{pricingValues.monthly} GEL</div>
                          <div className={`text-[7px] md:text-[8px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black mt-1 ${formData.payment.type === 'monthly' ? 'text-white/40' : 'text-brand-navy/20'}`}>12 CLASSES / MONTH</div>
                          <div className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider mt-1.5 leading-none ${formData.payment.type === 'monthly' ? 'text-white/60' : 'text-brand-teal'}`}>{pricingValues.monthlyPerClass} GEL / {(t as any).perClassLabel}</div>
                       </div>
                    </div>
                    <p className={`text-xs md:text-sm font-medium leading-relaxed italic ${formData.payment.type === 'monthly' ? 'text-white/70' : 'text-brand-navy/40'}`}>
                      {t.regMonthlyDesc}
                    </p>
                    {formData.payment.type === 'monthly' && <div className="absolute top-6 right-6 md:top-8 md:right-8"><CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-white" /></div>}
                  </button>

                  <div className="pt-6 md:pt-8">
                    <label className="block text-[10px] md:text-xs uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 md:mb-4 px-2 italic">{t.regPayAtField}</label>
                    <div className="flex items-center gap-4 md:gap-6 p-5 md:p-6 glass-dark rounded-[24px] md:rounded-[32px] border border-white/10 shadow-2xl">
                       <div className="w-10 h-10 md:w-14 md:h-14 rounded-[16px] md:rounded-[20px] bg-brand-teal/20 flex items-center justify-center shadow-inner shrink-0">
                          <CreditCard className="w-5 h-5 md:w-7 md:h-7 text-brand-teal" />
                       </div>
                       <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-white/50 leading-relaxed italic">
                         Secure processing at the academy center prior to session start.
                       </p>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-4 md:p-6 bg-red-50 text-red-600 rounded-2xl md:rounded-3xl text-[10px] md:text-sm font-black uppercase tracking-widest border border-red-100 italic">
                      {submitError}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 md:pt-10">
                    <Button variant="outline" className="w-full sm:flex-1 h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black order-2 sm:order-1" onClick={handlePrev} disabled={isSubmitting}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="w-full sm:flex-[2] h-16 md:h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal order-1 sm:order-2" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="w-5 h-5 animate-spin" /> {t.regComplete}...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3 uppercase">{t.regComplete} <CheckCircle2 className="w-5 h-5" /></span>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Card className="p-10 md:p-16 glass border-white shadow-3xl rounded-[60px] md:rounded-[80px] text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl" />
                
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[36px] bg-brand-teal/10 flex items-center justify-center mx-auto mb-8 md:mb-10 shadow-inner group">
                  <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-brand-teal transition-transform group-hover:scale-110" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 md:mb-6 leading-none">{t.regSuccessTitle}</h2>
                <div className="space-y-4 mb-10 md:mb-12 max-w-sm mx-auto">
                  <p className="text-brand-navy/60 font-medium leading-relaxed text-base italic">
                    {t.regSuccessThanks}
                  </p>
                  <div className="h-0.5 w-12 bg-brand-teal/20 mx-auto" />
                  <p className="text-brand-navy/30 font-bold uppercase tracking-widest text-[10px] leading-relaxed">
                    {t.regSuccessDesc}
                  </p>
                </div>
                <Button className="w-full h-18 md:h-20 !rounded-[28px] md:rounded-[32px] italic uppercase tracking-widest text-xs md:text-sm font-black shadow-teal" onClick={() => navigate('/portal')}>
                   {t.regSuccessProceed}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms Modal */}
        <TermsModal 
          isOpen={isTermsOpen} 
          onClose={() => setIsTermsOpen(false)} 
          lang={lang} 
        />
      </div>
    </div>
  );
}
