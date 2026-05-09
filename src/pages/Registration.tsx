import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, GraduationCap, Calendar, MapPin, ClipboardList, Camera, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Clock, CreditCard, LayoutGrid, ShieldCheck, X } from 'lucide-react';
import { translations } from '../i18n';
import { Button, Card, Badge } from '../components/UI';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, getDocFromCache } from 'firebase/firestore';
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
    medicalNotes: string;
    profileImage: string | null;
  };
  training: {
    group: string;
    schedule: string;
  };
  payment: {
    type: 'trial' | 'monthly';
    method: 'at_field';
  };
}

export default function Registration({ lang }: { lang: 'EN' | 'GE' | 'RU' }) {
  const t = (translations[lang] as any);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Phone Auth states
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize reCAPTCHA
    const initRecaptcha = async () => {
      try {
        const { RecaptchaVerifier } = await import('firebase/auth');
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
              console.log("Recaptcha verified");
            },
            'expired-callback': () => {
              console.log("Recaptcha expired");
            }
          });
          await (window as any).recaptchaVerifier.render();
        }
      } catch (err) {
        console.error("Recaptcha Init Error:", err);
      }
    };
    
    initRecaptcha();

    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

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

  const [formData, setFormData] = useState<RegistrationData>({
    parent: {
      fullName: '',
      phone: '+995',
    },
    student: {
      name: '',
      age: '',
      gender: 'male',
      location: '',
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

  const updateParentField = (field: keyof RegistrationData['parent'], value: string) => {
    setFormData(prev => ({
      ...prev,
      parent: { ...prev.parent, [field]: value }
    }));
  };

  const updateStudentField = (field: keyof RegistrationData['student'], value: any) => {
    setFormData(prev => ({
      ...prev,
      student: { ...prev.student, [field]: value }
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
    const cleanPhone = phone.replace(/[\s_]/g, '');
    return /^\+[0-9]{12}$/.test(cleanPhone);
  };

  const handleNext = async () => {
    if (step === 1) {
      const errors: Record<string, string> = {};
      if (formData.parent.fullName.length < 3) errors.parentName = 'Name too short';
      if (!validatePhone(formData.parent.phone)) errors.parentPhone = t.regInvalidPhone;
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      setValidationErrors({});
      setIsVerifying(true);
      setSubmitError(null);
      // Ensure E.164 format: +955XXXXXXXXX
      const cleanPhone = formData.parent.phone.replace(/[\s_]/g, '');
      
      try {
        const result = await signInWithPhoneNumber(auth, cleanPhone, (window as any).recaptchaVerifier);
        setConfirmationResult(result);
        setStep(1.5);
      } catch (error: any) {
        console.error("SMS Error Details:", error);
        let msg = t.regPhoneError || "Failed to send SMS.";
        setSubmitError(`${msg} (${error.code || 'unknown-error'})`);
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
      await confirmationResult.confirm(otp);
      setStep(2);
    } catch (error) {
      console.error("OTP Error", error);
      setSubmitError("Invalid verification code. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrev = () => {
    if (step === 2) setStep(1);
    else if (step === 1.5) setStep(1);
    else setStep(prev => Math.floor(prev - 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const registrationPath = 'registrations';
      const cleanPhone = formData.parent.phone.replace(/[\s_]/g, '');
      const docData = {
        parentFullName: formData.parent.fullName,
        parentPhone: cleanPhone,
        parentEmail: '',
        studentName: formData.student.name,
        studentAge: parseInt(formData.student.age, 10),
        studentGender: formData.student.gender,
        studentLocation: formData.student.location,
        studentMedicalNotes: formData.student.medicalNotes || '',
        studentProfileImage: formData.student.profileImage || '',
        trainingGroup: formData.training.group,
        trainingSchedule: formData.training.schedule,
        paymentType: formData.payment.type,
        paymentMethod: formData.payment.method,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, registrationPath), docData);
      
      // Redirect to portal cabinet
      setTimeout(() => navigate('/portal'), 1500);
      setStep(5);
    } catch (error) {
      setSubmitError('Failed to complete registration. Please try again.');
      handleFirestoreError(error, OperationType.CREATE, 'registrations');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageToGroup = useMemo(() => {
    const age = parseInt(formData.student.age, 10);
    if (!age) return '';
    if (age <= 6) return 'U6 (Foundation)';
    if (age <= 8) return 'U8 (Development)';
    if (age <= 10) return 'U10 (Mastery)';
    if (age <= 12) return 'U12 (Pro)';
    return 'U14+ (Elite)';
  }, [formData.student.age]);

  React.useEffect(() => {
    if (ageToGroup && !formData.training.group) {
        updateTrainingField('group', ageToGroup);
    }
  }, [ageToGroup]);

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

  return (
    <div className="min-h-screen bg-brand-cream py-20 px-6 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
        <img src="https://images.unsplash.com/photo-1551952237-954a0e68786c?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="" />
      </div>
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Recaptcha Container */}
      <div id="recaptcha-container"></div>
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="mb-16 text-center">
          <Badge color="teal" className="mb-6">{t.regTitle}</Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-6 leading-none">{t.regSub}</h1>
          
          {/* Progress Bar (Environmental Pills) */}
          <div className="flex justify-center gap-3 mt-12">
            {[1, 2, 3, 4, 5].map(i => {
              const isActive = step >= i || (i === 1 && step === 1.5);
              return (
                <motion.div 
                  key={i} 
                  initial={false}
                  animate={{ 
                    width: isActive ? 64 : 16,
                    backgroundColor: isActive ? 'var(--color-brand-teal)' : 'rgba(26, 26, 26, 0.05)'
                  }}
                  className="h-2 rounded-full transition-all duration-700" 
                />
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
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

                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-teal/10 flex items-center justify-center shadow-inner">
                    <User className="text-brand-teal w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-1">{t.regParentTitle}</h2>
                    <p className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-brand-navy/30 italic">Step 01 / Primary Guardian</p>
                  </div>
                </div>

                <div className="space-y-8 text-left">
                  <div>
                    <label className="block text-xs md:text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regParentName}</label>
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
                    <label className="block text-xs md:text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regParentPhone}</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <PatternFormat 
                        format="+995 ### ### ###"
                        value={formData.parent.phone}
                        onValueChange={(values) => {
                          updateParentField('phone', values.formattedValue);
                        }}
                        className={`w-full h-16 md:h-18 pl-16 pr-6 bg-white/40 border-2 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-base md:text-lg shadow-sm ${validationErrors.parentPhone ? 'border-red-500' : 'border-brand-navy/5'}`} 
                        placeholder="+995 000 000 000"
                        required
                        type="tel"
                      />
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-navy/40 italic leading-snug">
                      {lang === 'RU' ? 'Я ПРИНИМАЮ УСЛОВИЯ ПУБЛИЧНОЙ ОФЕРТЫ И СОГЛАСЕН С ПОЛИТИКОЙ КОНФИДЕНЦИАЛЬНОСТИ' : 'I ACCEPT THE TERMS OF THE PUBLIC OFFER AND AGREE TO THE PRIVACY POLICY'}
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
                    disabled={!formData.parent.fullName || formData.parent.phone.length < 12 || isVerifying || !agreedToTerms}
                  >
                    {isVerifying ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : <span className="flex items-center gap-3">{t.regNext} <ArrowRight className="w-5 h-5" /></span>}
                  </Button>
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
            >
              <Card className="p-12 glass border-white shadow-3xl rounded-[64px] text-center">
                <div className="w-20 h-20 rounded-[32px] bg-brand-teal/10 flex items-center justify-center mx-auto mb-10 shadow-inner">
                  <ShieldCheck className="w-10 h-10 text-brand-teal" />
                </div>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">{t.regOTPTitle}</h2>
                <p className="text-xs font-medium text-brand-navy/30 mb-10 italic uppercase tracking-widest">{t.regOTPSub} <span className="text-brand-navy font-black">{formData.parent.phone}</span></p>

                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-4 italic">{t.regOTPCode}</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full h-24 text-center text-5xl font-black tracking-[0.5em] bg-white/40 border-2 border-brand-navy/5 rounded-[32px] focus:outline-none focus:border-brand-teal transition-all shadow-sm italic" 
                      placeholder="000000"
                    />
                  </div>

                  {submitError && (
                    <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-xs font-black uppercase tracking-widest border border-red-100">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black" onClick={() => setStep(1)} disabled={isVerifying}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2] h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal" 
                      onClick={verifyOTP}
                      disabled={otp.length !== 6 || isVerifying}
                    >
                      {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : t.regOTPVerify}
                    </Button>
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
              <Card className="p-12 glass border-white shadow-3xl rounded-[64px]">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-teal/5 flex items-center justify-center shadow-inner">
                    <GraduationCap className="text-brand-teal w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none mb-1">{t.regStudentTitle}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 italic">Step 02 / Athlete Profile</p>
                  </div>
                </div>

                <div className="space-y-8 text-left">
                  <div className="flex justify-center mb-10">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-[40px] overflow-hidden bg-brand-navy/5 flex items-center justify-center border-2 border-dashed border-brand-navy/10 relative transition-transform group-hover:scale-105 group-hover:rotate-3">
                        {formData.student.profileImage ? (
                          <img src={formData.student.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-10 h-10 text-brand-navy/10" />
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-brand-teal text-white flex items-center justify-center shadow-xl border-4 border-brand-cream">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regStudentName}</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <input 
                        type="text" 
                        value={formData.student.name}
                        onChange={(e) => updateStudentField('name', e.target.value)}
                        className="w-full h-18 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-lg shadow-sm" 
                        placeholder="YOUNG ATHLETE NAME"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regStudentAge}</label>
                      <div className="relative">
                        <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                        <input 
                          type="number" 
                          value={formData.student.age}
                          onChange={(e) => updateStudentField('age', e.target.value)}
                          className="w-full h-18 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-lg shadow-sm" 
                          placeholder="8"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regStudentGender}</label>
                      <div className="flex bg-white/40 p-1.5 rounded-[24px] border-2 border-brand-navy/5 h-18 shadow-sm">
                        <button 
                          onClick={() => updateStudentField('gender', 'male')}
                          className={`flex-1 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            formData.student.gender === 'male' ? 'bg-brand-navy text-white shadow-xl' : 'text-brand-navy/30 hover:bg-black/5'
                          }`}
                        >
                          {t.regStudentGenderMale}
                        </button>
                        <button 
                          onClick={() => updateStudentField('gender', 'female')}
                          className={`flex-1 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all italic ${
                            formData.student.gender === 'female' ? 'bg-brand-navy text-white shadow-xl' : 'text-brand-navy/30 hover:bg-black/5'
                          }`}
                        >
                          {t.regStudentGenderFemale}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regStudentLocation}</label>
                    <div className="relative">
                      <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-navy/20" />
                      <select 
                        value={formData.student.location}
                        onChange={(e) => updateStudentField('location', e.target.value)}
                        className="w-full h-18 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-lg shadow-sm appearance-none" 
                        required
                      >
                        <option value="">{t.locNearest}</option>
                        <option value="batumi_central">Batumi Central Park</option>
                        <option value="batumi_boulevard">Batumi Boulevard</option>
                        <option value="gonio_arena">Gonio Performance Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-3 px-2 italic">{t.regStudentMedical}</label>
                    <div className="relative">
                      <ClipboardList className="absolute left-6 top-6 w-5 h-5 text-brand-navy/20" />
                      <textarea 
                        value={formData.student.medicalNotes}
                        onChange={(e) => updateStudentField('medicalNotes', e.target.value)}
                        className="w-full p-6 pl-16 bg-white/40 border-2 border-brand-navy/5 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-sm shadow-sm h-32 resize-none" 
                        placeholder="..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1 h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2] h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal" 
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
              <Card className="p-12 glass border-white shadow-3xl rounded-[64px]">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-teal/10 flex items-center justify-center shadow-inner">
                    <LayoutGrid className="text-brand-teal w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none mb-2">{t.regClassTitle}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 italic">Step 03 / Training Group</p>
                  </div>
                </div>

                <div className="space-y-8 text-left">
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-4 px-2 italic">{t.regSelectGroup}</label>
                    <div className="grid grid-cols-1 gap-3">
                      {['U6 (Foundation)', 'U8 (Development)', 'U10 (Mastery)', 'U12 (Pro)', 'U14+ (Elite)'].map(group => (
                        <button
                          key={group}
                          onClick={() => updateTrainingField('group', group)}
                          className={`w-full h-16 px-8 rounded-2xl border-2 text-left font-black uppercase italic tracking-tighter text-base transition-all flex items-center justify-between group h-20 ${
                            formData.training.group === group 
                            ? 'bg-brand-navy border-brand-navy text-white shadow-xl translate-x-2' 
                            : 'bg-white/40 border-brand-navy/5 text-brand-navy/40 hover:border-brand-teal/30 hover:bg-white/60'
                          }`}
                        >
                          {group}
                          {formData.training.group === group ? (
                            <CheckCircle2 className="w-6 h-6 text-brand-teal" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-brand-navy/10 group-hover:bg-brand-teal/30" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-4 px-2 italic">{t.regSelectSchedule}</label>
                    <div className="relative">
                      <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-brand-navy/20" />
                      <select 
                        value={formData.training.schedule}
                        onChange={(e) => updateTrainingField('schedule', e.target.value)}
                        className="w-full h-20 pl-16 pr-6 bg-white/40 border-2 border-brand-navy/5 rounded-[28px] focus:outline-none focus:border-brand-teal transition-all font-black uppercase italic tracking-tight text-lg shadow-sm appearance-none" 
                        required
                      >
                        <option value="">Select Time Slot</option>
                        <option value="mon_wed_fri_16">Mon / Wed / Fri — 16:00</option>
                        <option value="mon_wed_fri_18">Mon / Wed / Fri — 18:00</option>
                        <option value="tue_thu_sat_16">Tue / Thu / Sat — 16:00</option>
                        <option value="tue_thu_sat_18">Tue / Thu / Sat — 18:00</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button variant="outline" className="flex-1 h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black" onClick={handlePrev}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2] h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal" 
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
              <Card className="p-12 glass border-white shadow-3xl rounded-[64px]">
                <div className="flex items-center gap-6 mb-12">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-sunset/10 flex items-center justify-center shadow-inner">
                    <CreditCard className="text-brand-sunset w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tight leading-none mb-2">{t.regPaymentTitle}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30 italic">Step 04 / Plan Finalization</p>
                  </div>
                </div>

                <div className="space-y-6 text-left">
                  <button
                    onClick={() => updatePaymentField('type', 'trial')}
                    className={`w-full p-8 rounded-[40px] border-2 text-left transition-all relative group ${
                      formData.payment.type === 'trial' 
                      ? 'bg-brand-navy border-brand-navy text-white shadow-2xl scale-[1.02]' 
                      : 'bg-white/40 border-brand-navy/5 text-brand-navy hover:border-brand-teal/30 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-black italic uppercase tracking-tighter text-2xl">{t.regTrialOption}</h3>
                       <Badge color={formData.payment.type === 'trial' ? 'white' : 'teal'} className="px-4 py-1.5 rounded-xl uppercase italic">FREE</Badge>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed italic ${formData.payment.type === 'trial' ? 'text-white/50' : 'text-brand-navy/40'}`}>
                      {t.regTrialDesc}
                    </p>
                    {formData.payment.type === 'trial' && <div className="absolute top-6 right-6"><CheckCircle2 className="w-6 h-6 text-brand-teal" /></div>}
                  </button>

                  <button
                    onClick={() => updatePaymentField('type', 'monthly')}
                    className={`w-full p-8 rounded-[40px] border-2 text-left transition-all relative group ${
                      formData.payment.type === 'monthly' 
                      ? 'bg-brand-teal border-brand-teal text-white shadow-teal scale-[1.02]' 
                      : 'bg-white/40 border-brand-navy/5 text-brand-navy hover:border-brand-teal/30 hover:bg-white/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                       <h3 className="font-black italic uppercase tracking-tighter text-2xl">{t.regMonthlyOption}</h3>
                       <div className="text-right">
                          <div className={`font-black text-xl italic leading-none ${formData.payment.type === 'monthly' ? 'text-white' : 'text-brand-teal'}`}>250 GEL</div>
                          <div className={`text-[8px] uppercase tracking-[0.4em] font-black mt-1 ${formData.payment.type === 'monthly' ? 'text-white/40' : 'text-brand-navy/20'}`}>PER MONTH</div>
                       </div>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed italic ${formData.payment.type === 'monthly' ? 'text-white/70' : 'text-brand-navy/40'}`}>
                      {t.regMonthlyDesc}
                    </p>
                    {formData.payment.type === 'monthly' && <div className="absolute top-6 right-6"><CheckCircle2 className="w-6 h-6 text-white" /></div>}
                  </button>

                  <div className="pt-8">
                    <label className="block text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/40 mb-4 px-2 italic">{t.regPayAtField}</label>
                    <div className="flex items-center gap-6 p-6 glass-dark rounded-[32px] border border-white/10 shadow-2xl">
                       <div className="w-14 h-14 rounded-[20px] bg-brand-teal/20 flex items-center justify-center shadow-inner">
                          <CreditCard className="w-7 h-7 text-brand-teal" />
                       </div>
                       <p className="text-[11px] font-black uppercase tracking-[0.1em] text-white/50 leading-relaxed italic">
                         Secure processing at the academy center prior to session start.
                       </p>
                    </div>
                  </div>

                  {submitError && (
                    <div className="p-6 bg-red-50 text-red-600 rounded-3xl text-sm font-black uppercase tracking-widest border border-red-100 italic">
                      {submitError}
                    </div>
                  )}

                  <div className="flex gap-4 pt-10">
                    <Button variant="outline" className="flex-1 h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black" onClick={handlePrev} disabled={isSubmitting}>
                      <ArrowLeft className="w-4 h-4" /> {t.regPrev}
                    </Button>
                    <Button 
                      variant="primary" 
                      className="flex-[2] h-18 !rounded-[24px] italic uppercase tracking-widest text-[10px] font-black shadow-teal" 
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
              <Card className="p-16 glass border-white shadow-3xl rounded-[80px] text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-teal/10 rounded-full blur-3xl" />
                
                <div className="w-24 h-24 rounded-[36px] bg-brand-teal/10 flex items-center justify-center mx-auto mb-10 shadow-inner group">
                  <CheckCircle2 className="w-12 h-12 text-brand-teal transition-transform group-hover:scale-110" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 leading-none">{t.regSuccessTitle}</h2>
                <p className="text-brand-navy/40 font-medium mb-12 leading-relaxed text-lg max-w-sm mx-auto italic">
                  {t.regSuccessDesc}
                </p>
                <Button className="w-full h-20 !rounded-[32px] italic uppercase tracking-widest text-sm font-black shadow-teal" onClick={() => navigate('/')}>
                   {lang === 'RU' ? 'ВЕРНУТЬСЯ НА ГЛАВНУЮ' : 'RETURN TO MISSION CONTROL'}
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
