import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Card, Badge } from './UI';
import { USPS, PROGRAMS, MOCK_STUDENT, LOCATIONS, COACHES } from '../constants';
import { Trophy, Star, ChevronRight, ChevronDown, Play, Info, CheckCircle2, MapPin, Calendar, Smartphone, Activity, Target, BarChart3, Users, LayoutGrid, Settings, Zap, Brain, Shield, Heart, Command, Clock, Wind, Utensils, ExternalLink, Award, BookOpen, ArrowRight } from 'lucide-react';
import { translations } from '../i18n';
import { Link, useNavigate } from 'react-router-dom';

export function Navbar({ onPortalClick, currentLang, onLangChange }: { 
  onPortalClick: () => void, 
  currentLang: string, 
  onLangChange: (lang: any) => void 
}) {
  const t = translations[currentLang as keyof typeof translations] || translations.EN;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b shadow-none py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-brand-teal rounded-xl flex items-center justify-center neon-glow-teal rotate-6">
            <Activity className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="hidden sm:block font-display font-black text-base sm:text-lg md:text-xl tracking-tighter uppercase italic text-brand-navy whitespace-nowrap">
            Sport Park <span className="text-brand-teal">Juno</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 font-bold text-[10px] uppercase tracking-[0.2em] text-brand-navy/50">
          <a href="#programs" className="hover:text-brand-teal transition-colors">{t.navPrograms}</a>
          <Link to="/methodology" className="hover:text-brand-teal transition-colors">{t.navMethodology}</Link>
          <a href="#locations" className="hover:text-brand-teal transition-colors">{t.navLocations}</a>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative">
            {/* Desktop Version */}
            <div className="hidden md:flex items-center gap-1 bg-black/5 rounded-full p-1 border border-black/5 mr-2">
              {['EN', 'GE', 'RU'].map((l) => (
                <button
                  key={l}
                  onClick={() => onLangChange(l)}
                  className={`px-2 py-1 rounded-full text-[9px] font-black transition-all cursor-pointer ${
                    l === currentLang ? 'bg-white text-brand-teal shadow-sm' : 'text-brand-navy/30 hover:text-brand-navy'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Mobile Version - Current Lang button that opens popup */}
            <button 
              onClick={() => setIsLangOpen(true)}
              className="md:hidden flex items-center gap-1 px-4 py-2 bg-brand-navy/5 rounded-full border border-brand-navy/5 text-brand-navy text-[10px] font-black uppercase tracking-widest"
            >
              {currentLang}
              <ChevronDown className="w-3 h-3 text-brand-teal" />
            </button>

            {/* Language Popup Modal */}
            <AnimatePresence>
              {isLangOpen && (
                <>
                  {/* Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsLangOpen(false)}
                    className="fixed inset-0 bg-brand-navy/60 backdrop-blur-md z-[60] md:hidden"
                  />
                  {/* Modal Content */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white rounded-[40px] p-6 sm:p-8 z-[70] md:hidden shadow-3xl border border-white/20 max-w-[400px] mx-auto overflow-hidden"
                  >
                    <div className="text-center mb-6 sm:mb-8">
                      <h3 className="text-brand-navy text-xl sm:text-2xl font-black italic uppercase tracking-tighter">
                        {currentLang === 'RU' ? 'Выберите язык' : currentLang === 'GE' ? 'აირჩიეთ ენა' : 'Select Language'}
                      </h3>
                      <div className="w-12 h-1 bg-brand-teal/20 mx-auto mt-3 rounded-full" />
                    </div>
                    
                    <div className="grid gap-3 sm:gap-4">
                      {[
                        { code: 'EN', label: 'English', native: 'English' },
                        { code: 'GE', label: 'Georgian', native: 'ქართული' },
                        { code: 'RU', label: 'Russian', native: 'Русский' }
                      ].map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            onLangChange(item.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full p-4 sm:p-6 rounded-3xl flex items-center justify-between transition-all ${
                            item.code === currentLang 
                              ? 'bg-brand-teal text-white shadow-teal' 
                              : 'bg-brand-cream/50 text-brand-navy border border-brand-navy/5'
                          }`}
                        >
                          <div className="text-left">
                            <div className="text-[13px] sm:text-[14px] font-black italic uppercase tracking-widest leading-none mb-1">{item.native}</div>
                            <div className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] opacity-40`}>{item.label}</div>
                          </div>
                          {item.code === currentLang && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      onClick={() => setIsLangOpen(false)}
                      className="w-full mt-6 sm:mt-8 p-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-brand-navy/30 hover:text-brand-teal transition-all"
                    >
                      {currentLang === 'RU' ? 'ОТМЕНА' : currentLang === 'GE' ? 'გაუქმება' : 'CANCEL'}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <Button variant="ghost" className="hidden md:flex" onClick={onPortalClick}>{t.navPortal}</Button>
          <Button variant="primary" className="text-[10px] md:text-sm px-4 md:px-8 !rounded-full whitespace-nowrap" onClick={() => navigate('/register')}>{t.navJoin}</Button>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 ml-2 relative z-[60]"
            aria-label="Toggle Menu"
          >
            <div className={`w-6 h-0.5 bg-brand-navy transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <div className={`w-6 h-0.5 bg-brand-navy transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
            <div className={`w-6 h-0.5 bg-brand-navy transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-white md:hidden pt-32 pb-12 px-6 overflow-y-auto"
          >
            <div className="flex flex-col gap-6 text-center pb-8">
              <div className="flex justify-center gap-3 mb-6">
                {['EN', 'GE', 'RU'].map((l) => (
                  <button
                    key={l}
                    onClick={() => { onLangChange(l); }}
                    className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all border ${
                      l === currentLang ? 'bg-brand-teal text-white border-brand-teal' : 'border-brand-navy/5 text-brand-navy/30'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              
              <a href="#programs" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy">{t.navPrograms}</a>
              <Link to="/methodology" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy">{t.navMethodology}</Link>
              <a href="#locations" onClick={() => setIsMenuOpen(false)} className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy">{t.navLocations}</a>
              
              <div className="mt-8 space-y-4">
                <Button variant="ghost" className="w-full text-base h-16 rounded-3xl" onClick={() => { onPortalClick(); setIsMenuOpen(false); }}>{t.navPortal}</Button>
                <Button variant="primary" className="w-full text-base h-16 rounded-3xl shadow-teal" onClick={() => { navigate('/register'); setIsMenuOpen(false); }}>{t.navJoin}</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function Hero({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[100dvh] md:min-h-screen flex items-center pt-32 md:pt-40 lg:pt-20 overflow-hidden bg-brand-cream">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="/Images/Hero section background.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-100"
          referrerPolicy="no-referrer"
        />
        {/* Subtle dark overlay to protect text contrast while maintaining image vibrancy */}
        <div className="absolute inset-0 bg-brand-navy/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-cream/100 via-brand-cream/40 to-brand-cream/20 md:from-brand-cream/90 md:via-transparent md:to-brand-cream/30" />
      </div>

      {/* Background Shapes - Simplified to let image shine */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 opacity-30" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl ml-0 lg:ml-12 mt-12 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-left relative px-0"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-white/40 bg-gradient-to-r from-brand-navy/90 via-brand-teal/90 to-brand-sunset/90 animate-gradient-slow mb-6 md:mb-8 shadow-2xl backdrop-blur-xl">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-white">{(t as any).heroBadge}</span>
            </div>

            <div className="mb-8 md:mb-10">
               <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.6em] text-brand-teal italic mb-4 md:mb-6 block drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                  {(t as any).heroPrefix}
               </span>
               <h1 className="text-5xl md:text-8xl lg:text-[140px] font-black italic tracking-tighter leading-[0.85] md:leading-[0.75] text-white uppercase mb-6 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] filter">
                 {t.heroTitle_1}
               </h1>
               <p className="text-xs md:text-xl font-black uppercase tracking-[0.4em] text-brand-sunset italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                 {t.heroSubtitle}
               </p>
            </div>
            
            <p className="text-base md:text-2xl text-white mb-10 md:mb-12 max-w-2xl leading-[1.1] md:leading-[1.1] font-bold italic drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center sm:items-start sm:justify-start gap-4 md:gap-8 pr-0 md:pr-4">
              <Button 
                variant="primary" 
                className="w-full sm:w-auto h-16 md:h-20 px-12 md:px-20 tracking-[0.2em] italic uppercase bg-gradient-to-r from-brand-teal to-brand-sunset hover:from-brand-sunset hover:to-brand-teal text-white border-none shadow-[0_20px_50px_rgba(244,114,182,0.3)] hover:scale-105 transition-all duration-500 font-black text-base md:text-lg" 
                onClick={() => navigate('/register')}
              >
                {t.ctaTrial} ↗
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-10 text-brand-navy/20 flex flex-col items-center gap-3 hidden lg:flex"
      >
        <span className="text-[8px] uppercase font-black tracking-[0.4em] rotate-180 [writing-mode:vertical-lr]">{t.scroll}</span>
        <div className="w-px h-16 bg-gradient-to-b from-brand-teal/50 to-transparent" />
      </motion.div>
    </section>
  );
}

export function HolisticDevelopment({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  const pillars = [
    { 
      title: lang === 'RU' ? 'Индивидуальные футбольные навыки' : lang === 'GE' ? 'ინდივიდუალური უნარები' : 'Individual Football Mastery', 
      desc: lang === 'RU' ? 'Продвинутые технические элементы и владение мячом, адаптированные под персональные особенности атлета.' : lang === 'GE' ? 'ბურთის ფლობა და ინდივიდუალური ტექნიკა.' : 'Advanced technical elements and ball control tailored to the athlete master traits.',
      icon: Star,
      color: 'teal',
      img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: lang === 'RU' ? 'Общая физическая выносливость' : lang === 'GE' ? 'ფიზიკური გამძლეობა' : 'General Physical Endurance', 
      desc: lang === 'RU' ? 'Развитие через плавание и бег (дыхалка), борьбу и кроссфит (сила), йогу и гимнастику (гибкость).' : lang === 'GE' ? 'ძალა, მოქნილობა და გამძლეობა სხვადასხვა დისციპლინით.' : 'Development through swimming/running (breathing), wrestling/crossfit (strength), and yoga/gymnastics (flexibility).',
      icon: Wind,
      color: 'blue',
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: lang === 'RU' ? 'Тактика и стратегия' : lang === 'GE' ? 'ტაქტიკური უნარები' : 'Tactical Intelligence', 
      desc: lang === 'RU' ? 'Навыки командной игры, стратегическое мышление и быстрое принятие решений на поле.' : lang === 'GE' ? 'სტრატეგიული აზროვნება და გუნდური თამაში.' : 'Strategic thinking, team cooperation, and rapid on-field decision making.',
      icon: LayoutGrid,
      color: 'teal',
      img: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: lang === 'RU' ? 'Эмоциональный иммунитет' : lang === 'GE' ? 'ემოციური იმუნიტეტი' : 'Emotional Immunity', 
      desc: lang === 'RU' ? 'Стрессоустойчивость и ментальная закалка. Умение сохранять фокус и спокойствие в критические моменты.' : lang === 'GE' ? 'სტრესმედეგობა და მენტალური სიმტკიცე.' : 'Stress resilience and mental toughness. Maintaining focus during critical match moments.',
      icon: Shield,
      color: 'sunset',
      img: "https://images.unsplash.com/photo-1552667466-07770ae110d0?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: lang === 'RU' ? 'Практическая физиология' : lang === 'GE' ? 'პრაქტიკული ფიზიოლოგია' : 'Practical Physiology', 
      desc: lang === 'RU' ? 'Знания о питании, медитации и восстановлении для самостоятельного управления своим здоровьем.' : lang === 'GE' ? 'კვება, მედიტაცია და აღდგენა.' : 'Knowledge of nutrition, meditation, and recovery for longevity in professional sports.',
      icon: Activity,
      color: 'teal',
      img: "https://images.unsplash.com/photo-1518611012118-296072bb58c4?auto=format&fit=crop&q=80&w=400"
    },
    { 
      title: lang === 'RU' ? 'Эффективные привычки' : lang === 'GE' ? 'ეფექტური ჩვევები' : 'Effective Habits', 
      desc: lang === 'RU' ? 'Управление временем, энергией, планирование и целеполагание как основа успеха.' : lang === 'GE' ? 'დროის მენეჯმენტი და დაგეგმვა.' : 'Time management, planning, and goal setting as a foundation for life success.',
      icon: Clock,
      color: 'blue',
      img: "https://images.unsplash.com/photo-1508962944647-f30730740661?auto=format&fit=crop&q=80&w=400"
    },
  ];

  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-teal/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
      
      <div className="container mx-auto px-6 relative z-10 font-sans">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-8">
          <div className="max-w-3xl">
            <Badge color="teal">{t.holisticBadge}</Badge>
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mt-10 mb-8 text-brand-navy leading-[0.9]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-teal">{t.holisticTitle_1}</span> <br /> 
              <span className="text-brand-teal drop-shadow-sm">{t.holisticTitle_2}</span>
            </h2>
            <p className="text-brand-navy/60 text-xl font-medium leading-relaxed max-w-2xl">
              {t.holisticDesc}
            </p>
          </div>
          <div className="hidden lg:block pb-10">
             <motion.div 
               animate={{ rotate: [12, 15, 12] }}
               transition={{ repeat: Infinity, duration: 3 }}
               className="w-48 h-48 rounded-[40px] border border-brand-navy/5 flex items-center justify-center bg-white shadow-2xl relative overflow-hidden"
             >
                <img 
                  src="https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&q=80&w=400" 
                  className="absolute inset-0 w-full h-full object-cover opacity-20" 
                  alt="Training"
                />
                <Trophy className="text-brand-teal w-20 h-20 relative z-10" />
             </motion.div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mb-24">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className={`group rounded-[48px] transition-all duration-700 hover:shadow-2xl overflow-hidden flex flex-col h-[420px] relative
                ${idx % 2 === 0 ? 'bg-white shadow-xl' : 'glass border-white/60 hover:bg-white'}
                ${idx === 1 ? 'lg:-translate-y-10 shadow-2xl' : ''}
                ${idx === 4 ? 'lg:translate-y-10 shadow-2xl' : ''}
              `}
            >
              <div className="h-48 overflow-hidden relative">
                <img src={pillar.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={pillar.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
                <div className={`absolute top-6 left-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg z-10
                  ${pillar.color === 'teal' ? 'bg-brand-teal text-white' : pillar.color === 'sunset' ? 'bg-brand-sunset text-white' : 'bg-brand-blue text-white'}`}>
                  <pillar.icon className="w-7 h-7" />
                </div>
              </div>
              <div className="p-10 flex flex-col justify-between flex-1 relative z-10">
                <h4 className="font-black italic uppercase text-xl tracking-tight mb-4 text-brand-navy group-hover:text-brand-teal transition-colors leading-none">
                  {pillar.title}
                </h4>
                <p className="text-xs text-brand-navy/40 leading-relaxed font-bold uppercase tracking-widest group-hover:text-brand-navy/60 transition-colors">
                  {pillar.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Detailed Methodology Link */}
        <div className="flex justify-center mb-24">
           <Link 
             to="/methodology" 
             className="group relative flex items-center gap-6 bg-brand-navy text-white px-10 py-6 rounded-[32px] hover:bg-brand-teal transition-all duration-500 shadow-2xl hover:-translate-y-1"
           >
             <div className="flex flex-col text-left">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white/60 transition-colors">
                  {lang === 'RU' ? 'ПОДРОБНЕЕ О ПРОГРАММЕ' : 'PROGRAM DETAILS'}
               </span>
               <span className="text-xl font-black italic uppercase tracking-tight">
                  {lang === 'RU' ? 'ПЕРЕЙТИ К МЕТОДОЛОГИИ' : 'GO TO METHODOLOGY'}
               </span>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-brand-teal transition-all">
                <ArrowRight className="w-6 h-6" />
             </div>
           </Link>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass p-8 md:p-16 rounded-[60px] border-white/60 shadow-2xl"
        >
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-[48px] bg-brand-teal/5 border-2 border-white flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner group">
                <Info className="w-20 h-20 text-brand-teal group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-teal mb-6 block">
                {lang === 'RU' ? 'НАУЧНОЕ ОБОСНОВАНИЕ' : 'Scientific Reference'}
              </span>
              <h4 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter text-brand-navy mb-6 leading-tight">
                {lang === 'RU' 
                  ? 'Роль холистического метода в спортивной подготовке молодых атлетов' 
                  : 'The Role of Holistic Training for Young Athletes'}
              </h4>
              <p className="text-lg text-brand-navy/60 leading-relaxed font-medium mb-10">
                {lang === 'RU' 
                  ? "Научное обоснование того, как мультидисциплинарные блоки влияют на долгосрочное развитие." 
                  : "Evidence on how multi-disciplinary blocks impact long-term elite development."}
              </p>

              <div className="mb-12 text-left">
                <h5 className="text-xs font-black italic uppercase text-brand-teal mb-6 tracking-widest">
                  {lang === 'RU' ? 'Почему чемпионы выбирают мультидисциплинарность:' : 'The Championship Advantage:'}
                </h5>
                <ul className="grid sm:grid-cols-2 gap-8">
                  {[
                    { title: lang === 'RU' ? 'Меньше травм' : 'Reduced Risk', desc: lang === 'RU' ? 'Разнообразие снижает износ.' : 'Diversity reduces mechanical wear.' },
                    { title: lang === 'RU' ? 'Выше интеллект' : 'Elite IQ', desc: lang === 'RU' ? 'Адаптивность к любым вызовам.' : 'Adaptability to any challenge.' },
                  ].map((point, pIdx) => (
                    <li key={pIdx} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-teal mt-2" />
                      <div>
                        <p className="text-[11px] font-black uppercase text-brand-navy mb-1">{point.title}</p>
                        <p className="text-[10px] text-brand-navy/40 font-bold uppercase">{point.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <a 
                href="#" 
                className="inline-flex items-center gap-4 text-xs font-black uppercase italic tracking-widest text-brand-teal hover:gap-6 transition-all"
              >
                {lang === 'RU' ? 'Читать исследование' : 'Read Full Research'} 
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function SocialProof({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  
  const stats = [
    { label: (t as any).social_athletes_sub, value: (t as any).social_athletes },
    { label: (t as any).social_centers_sub, value: (t as any).social_centers },
    { label: (t as any).social_education_sub, value: (t as any).social_education },
  ];

  return (
    <section className="py-24 bg-white flex justify-center border-b border-brand-navy/5 font-sans">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-32">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-4xl md:text-7xl font-black italic tracking-tighter text-brand-navy leading-none mb-2">{stat.value}</span>
              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-teal max-w-[140px] leading-tight">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function USPSection({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  const translatedUSPS = USPS.map(usp => {
    let title = usp.title;
    let desc = usp.description;
    if (lang === 'RU') {
       if (usp.id === 'holistic') { title = "Холистический подход"; desc = "Развитие физической силы, ментальной стойкости и лидерских качеств."; }
       if (usp.id === 'multi') { title = "Мультидисциплинарная система"; desc = "Гармоничное развитие атлета через интеграцию различных спортивных дисциплин."; }
       if (usp.id === 'digital') { title = "Цифровая платформа"; desc = "Собственная система Juno Digital для отслеживания прогресса атлета."; }
       if (usp.id === 'gamified') { title = "Геймификация обучения"; desc = "Игровые механики и вознаграждения для максимальной вовлеченности."; }
    } else if (lang === 'GE') {
       if (usp.id === 'holistic') { title = "ჰოლისტიკური მიდგომა"; desc = "ფიზიკური და მენტალური განვითარება."; }
       if (usp.id === 'multi') { title = "მულტიდისციპლინური სისტემა"; desc = "სხვადასხვა სპორტული დისციპლინების ინტეგრაცია ათლეტის განვითარებისთვის."; }
       if (usp.id === 'digital') { title = "ციფრული პლატფორმა"; desc = "Juno Digital პროგრესის კონტროლისთვის."; }
       if (usp.id === 'gamified') { title = "გეიმიფიკაცია"; desc = "თამაშის ელემენტები სწავლის პროცესში."; }
    }
    return { ...usp, title, description: desc };
  });

  return (
    <section id="programs" className="py-24 container mx-auto px-6 font-sans overflow-hidden">
      <div className="text-center mb-20">
        <Badge color="teal">{t.uspBadge}</Badge>
        <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter mt-4 leading-none">
          {t.uspTitle_1} <br /> <span className="text-brand-teal">{t.uspTitle_2}</span>
        </h2>
        <p className="text-brand-navy/50 max-w-xl mx-auto font-medium px-4">{t.uspDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {translatedUSPS.map((usp, idx) => (
          <Card key={usp.id} className="group hover:border-brand-teal/30 transition-all duration-500 hover:shadow-xl bg-white/60 p-10 rounded-[40px]">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-10 transition-transform duration-500 group-hover:rotate-6
              ${usp.color === 'teal' ? 'bg-brand-teal text-white shadow-teal' : usp.color === 'sunset' ? 'bg-brand-sunset text-white shadow-sunset' : 'bg-brand-blue text-white shadow-blue'}`}>
              <usp.icon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black uppercase italic mb-4">{usp.title}</h3>
            <p className="text-xs text-brand-navy/50 leading-relaxed mb-8 uppercase font-bold tracking-widest">
              {usp.description}
            </p>
            <div className="h-0.5 w-12 bg-brand-navy/5 group-hover:w-full transition-all duration-500" />
          </Card>
        ))}
      </div>
    </section>
  );
}

export function LocationsSection({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const [selectedLoc, setSelectedLoc] = useState(LOCATIONS[0].id);
  const navigate = useNavigate();

  return (
    <section id="locations" className="py-32 bg-brand-stone relative overflow-hidden font-sans">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <Badge color="teal">Локации</Badge>
            <h2 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter mt-10 mb-8 text-brand-navy leading-none">
              {t.centersTitle}
            </h2>
            <p className="text-xl text-brand-navy/50 font-medium italic">
              {lang === 'RU' ? 'Международная сеть высокотехнологичных центров подготовки.' : 'Elite international high-performance centers.'}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LOCATIONS.map((loc: any) => (
            <motion.div
              layout
              key={loc.id}
              onClick={() => setSelectedLoc(loc.id)}
              className={`p-10 rounded-[64px] border transition-all duration-700 cursor-pointer relative overflow-hidden flex flex-col justify-between h-[360px] group ${
                selectedLoc === loc.id 
                  ? 'bg-brand-navy text-white border-brand-navy shadow-3xl scale-[1.01] z-10' 
                  : 'bg-white text-brand-navy border-brand-navy/5 hover:border-brand-teal/20 hover:bg-brand-cream/30 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center transition-all duration-700 ${
                  selectedLoc === loc.id ? 'bg-brand-teal text-white shadow-xl' : 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal group-hover:text-white'
                }`}>
                  <MapPin className="w-10 h-10" />
                </div>
                {selectedLoc === loc.id && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-brand-sunset text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    {t.locActiveStatus}
                  </motion.div>
                )}
              </div>

              <div className="relative z-10">
                <h3 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">
                  {lang === 'RU' ? (loc as any).nameRU : lang === 'GE' ? (loc as any).nameGE : loc.name}
                </h3>
                <p className={`text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-[85%] ${
                  selectedLoc === loc.id ? 'text-white/60' : 'text-brand-navy/30'
                }`}>
                  {lang === 'RU' ? (loc as any).addressRU : lang === 'GE' ? (loc as any).addressGE : loc.address}
                </p>
                <div className={`w-full h-1 rounded-full transition-all duration-1000 origin-left ${
                  selectedLoc === loc.id ? 'bg-brand-teal scale-x-100' : 'bg-brand-teal/10 scale-x-0 group-hover:scale-x-10'
                }`} />
              </div>

              {/* Decorative Tech Rings */}
              <div className={`absolute -bottom-20 -right-20 w-80 h-80 rounded-full border-[40px] transition-all duration-1000 ${
                selectedLoc === loc.id ? 'border-brand-teal/5 scale-125 rotate-45 opacity-100' : 'border-brand-teal/5 scale-50 opacity-0'
              }`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DigitalShowcase({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-5">
        <img src="https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="" />
      </div>
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-24 font-sans">
          <div className="lg:w-1/2 relative z-10">
            <Badge color="teal">{t.digitalBadge}</Badge>
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mt-6 mb-8 text-brand-navy leading-none">
              {t.digitalTitle_1} <br /> <span className="text-brand-teal">{t.digitalTitle_2}</span>
            </h2>
            <p className="text-brand-navy/60 mb-12 leading-loose max-w-xl font-medium">
              {t.digitalDesc}
            </p>
            <div className="mb-12">
              <a 
                href="#gamification" 
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-brand-teal hover:gap-4 transition-all"
              >
                {lang === 'RU' ? 'Подробное описание функций платформы' : 'View full platform functionality'}
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-8">
              {[
                { title: lang === 'RU' ? 'Лестница прогресса' : 'Progression Ladder', desc: lang === 'RU' ? 'Визуальный трекинг XP и уровней.' : 'Visual XP and level tracking system.', icon: Activity },
                { title: lang === 'RU' ? 'Ежедневные отчеты' : 'Daily Insights', desc: lang === 'RU' ? 'Отзывы тренера после каждой тренировки.' : 'Coach feedback delivered after every training.', icon: Target },
                { title: lang === 'RU' ? 'Глобальные вызовы' : 'Global Challenges', desc: lang === 'RU' ? 'Участвуйте в еженедельных испытаниях.' : 'Compete in weekly skill missions.', icon: Trophy }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl border border-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase text-sm tracking-widest text-brand-navy">{item.title}</h4>
                    <p className="text-xs text-brand-navy/30 mt-1 uppercase font-bold tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 relative flex justify-center">
            {/* Background Decorations */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-teal/15 blur-[100px] rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-sunset/10 blur-[80px] rounded-full translate-x-20 -translate-y-20" />
            
            <motion.div 
              style={{ rotateY: -15, rotateX: 5 }}
              whileInView={{ rotateY: -5, rotateX: 0 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative z-10 p-4 rounded-[60px] border border-white shadow-2xl max-w-[400px] w-full bg-white/40 backdrop-blur-2xl"
            >
              <div className="bg-brand-cream rounded-[45px] overflow-hidden aspect-[1/1.6] relative border-[12px] border-brand-navy shadow-inner">
                {/* Mock Phone UI */}
                <div className="p-8 h-full flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                    <div className="w-10 h-10 rounded-2xl bg-white border border-brand-navy/5 flex items-center justify-center shadow-sm">
                      <LayoutGrid className="text-brand-teal w-5 h-5" />
                    </div>
                    <Badge color="teal">Juno Athlete</Badge>
                   </div>
                   
                   <div className="mb-8 text-center">
                    <div className="relative inline-block mb-4">
                      <div className="w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden relative z-10">
                        <img 
                          src={MOCK_STUDENT.avatar} 
                          alt="Luka J." 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 1, type: 'spring' }}
                        className="absolute -bottom-1 -right-1 w-12 h-12 bg-brand-blue rounded-full border-4 border-white flex items-center justify-center shadow-lg z-20"
                      >
                        <Trophy className="text-white w-6 h-6" />
                      </motion.div>
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-[10px] text-brand-navy/30 uppercase font-black tracking-[0.3em]">Athlete ID</span>
                      <h3 className="text-3xl font-black italic uppercase text-brand-navy leading-none">Luka J.</h3>
                      <p className="text-[10px] font-black italic text-brand-teal uppercase tracking-widest mt-1">U-10 Squad</p>
                    </div>

                    <div className="mt-8">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy/30">Progression</span>
                        <span className="text-xs font-black italic text-brand-teal">LVL 4</span>
                      </div>
                      <div className="w-full h-2.5 bg-brand-navy/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '70%' }}
                          transition={{ duration: 2, delay: 0.5 }}
                          className="h-full bg-brand-teal rounded-full shadow-[0_0_10px_rgba(79,176,168,0.5)]" 
                        />
                      </div>
                    </div>
                   </div>

                   <div className="space-y-4 flex-1">
                    <div className="bg-white p-4 rounded-3xl border border-brand-navy/5 shadow-sm">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-brand-navy/40 tracking-wider">
                        <span>Ball Control</span>
                        <span className="text-brand-navy">88%</span>
                      </div>
                      <div className="h-1.5 bg-brand-navy/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: '88%' }}
                          transition={{ duration: 1.5, delay: 0.7 }}
                          className="h-full bg-brand-blue" 
                        />
                      </div>
                    </div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="bg-brand-teal p-5 rounded-3xl relative overflow-hidden shadow-lg border border-white/20"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <Zap className="text-white w-10 h-10 opacity-20 rotate-12" />
                      </div>
                      <h4 className="text-[9px] uppercase font-black text-white/60 tracking-[0.2em] mb-1">
                        {lang === 'RU' ? 'Достижение' : 'Milestone'}
                      </h4>
                      <p className="text-[11px] font-black italic uppercase text-white leading-tight">
                        {lang === 'RU' ? '"Разрушитель скорости" разблокирован' : '"Speed Demon" Unlocked'}
                      </p>
                    </motion.div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function GamificationSection({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  const missions = [
    { type: (t as any).missionIndiv, title: (t as any).missionExample1, icon: Target, img: "https://images.unsplash.com/photo-1510566337590-2fc1f21d0faa?auto=format&fit=crop&q=80&w=400" },
    { type: (t as any).missionTeam, title: (t as any).missionExample2, icon: Users, img: "https://images.unsplash.com/photo-1543326175-9e6669f6e3c5?auto=format&fit=crop&q=80&w=400" },
  ];

  return (
    <section id="gamification" className="py-32 bg-brand-cream/50 relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <img src="https://images.unsplash.com/photo-1431324155629-1a6eda1eed2d?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover grayscale" alt="" />
      </div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-teal/10 blur-[200px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-30" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-24 max-w-4xl mx-auto">
          <Badge color="teal">{(t as any).gamifyBadge}</Badge>
          <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mt-12 mb-10 text-brand-navy leading-none">
            {(t as any).gamifyTitle_1} <br /> <span className="text-brand-teal">{(t as any).gamifyTitle_2}</span>
          </h2>
          <p className="text-brand-navy/40 text-xl font-medium max-w-2xl mx-auto italic leading-relaxed">
            {(t as any).gamifyDesc}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
          {[
            { title: (t as any).gamifyLevels, desc: lang === 'RU' ? 'От Новичка до Легенды. Прогресс в реальном времени.' : 'From Rookie to Legend. Real-time XP tracking.', icon: Star },
            { title: (t as any).gamifyBadges, desc: lang === 'RU' ? 'Уникальные значки за технику, скорость и лидерство.' : 'Unique badges for technique, speed, and leadership.', icon: Trophy },
            { title: (t as any).gamifyTitles, desc: lang === 'RU' ? 'Заслужи звание Капитана или Мастер-Дриблера.' : 'Earn rankings like Captain or Master Dribbler.', icon: Shield }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="glass p-12 rounded-[64px] border-white shadow-3xl hover:border-brand-teal/20 hover:bg-white transition-all group flex flex-col justify-between h-[380px]"
            >
              <div>
                <div className="w-20 h-20 rounded-[32px] bg-brand-teal/10 flex items-center justify-center text-brand-teal mb-10 group-hover:scale-110 group-hover:bg-brand-teal group-hover:text-white transition-all duration-700 shadow-xl bg-white/40">
                  <item.icon className="w-10 h-10" />
                </div>
                <h4 className="text-3xl font-black italic uppercase tracking-tight mb-4 text-brand-navy leading-none">{item.title}</h4>
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-navy/30 group-hover:text-brand-navy/60 transition-colors leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto glass p-12 md:p-16 rounded-[72px] border-white shadow-3xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between gap-16">
            <div className="flex-1 w-full relative z-10">
              <h3 className="text-4xl font-black italic uppercase text-brand-navy mb-12 tracking-tighter leading-none">
                {lang === 'RU' ? 'Текущие квесты' : 'Active Skill Quests'}
              </h3>
              <div className="space-y-6">
                {missions.map((mission, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-8 rounded-[40px] bg-white/40 border border-brand-navy/5 hover:bg-white hover:border-brand-teal/20 transition-all cursor-pointer group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                      <img src={mission.img} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-brand-teal/20 flex items-center justify-center">
                        <mission.icon className="w-8 h-8 text-white shadow-lg" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-teal mb-2 block">
                        {mission.type}
                      </span>
                      <p className="text-xl font-black italic uppercase tracking-tight text-brand-navy leading-none">{mission.title}</p>
                    </div>
                    <div className="ml-auto text-brand-sunset font-black italic text-2xl tracking-tighter shadow-sunset">+500 XP</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-[320px] aspect-square relative flex items-center justify-center">
              <div className="absolute inset-0 bg-brand-teal/20 blur-[100px] rounded-full animate-pulse" />
              <div className="relative w-full h-full bg-white rounded-full border-4 border-white/10 flex items-center justify-center shadow-3xl group overflow-hidden">
                 {/* Inner rotating element */}
                 <div className="absolute inset-0 bg-brand-teal opacity-5 animate-spin-slow" />
                 <div className="text-center relative z-10">
                    <span className="text-6xl font-black italic text-brand-navy tracking-tighter leading-none block mb-2">2.5X</span>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-brand-navy/30 leading-none">BOOST</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MastersSection({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  return (
    <section id="masters" className="py-24 bg-brand-cream/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <Badge color="teal">{(t as any).mastersBadge}</Badge>
          <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mt-6 mb-8 text-brand-navy">
            {(t as any).mastersTitle}
          </h2>
          <p className="text-brand-navy/60 leading-relaxed font-medium text-lg">
            {(t as any).mastersIntro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {COACHES.map((coach, idx) => (
            <motion.div
              key={coach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white rounded-[48px] overflow-hidden border border-brand-navy/5 shadow-xl flex flex-col group h-full"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={coach.image} 
                  alt={lang === 'RU' ? coach.nameRU : coach.name} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <div className="mb-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-teal mb-2 block">
                    {lang === 'RU' ? coach.specializationRU : coach.specialization}
                  </span>
                  <h3 className="text-2xl font-black italic uppercase text-brand-navy mb-2">
                    {lang === 'RU' ? coach.nameRU : coach.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic">
                    <Activity className="w-3 h-3" />
                    {(t as any).masterExp}: {lang === 'RU' ? coach.experienceRU : coach.experience}
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-1">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-teal tracking-widest">
                      <Award className="w-3 h-3" />
                      {(t as any).masterCert}
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {(lang === 'RU' ? coach.certificationsRU : coach.certifications).map((cert, cIdx) => (
                        <li key={cIdx} className="bg-brand-cream/50 px-2.5 py-1.5 rounded-xl text-[9px] font-bold text-brand-navy border border-brand-navy/5">
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-brand-teal tracking-widest">
                      <BookOpen className="w-3 h-3" />
                      Bio
                    </div>
                    <p className="text-[11px] text-brand-navy/60 font-medium leading-relaxed italic">
                      "{lang === 'RU' ? coach.bioRU : coach.bio}"
                    </p>
                  </div>
                </div>

                <Button variant="secondary" className="w-full text-[10px] py-4">
                  {lang === 'RU' ? 'Подробнее' : 'Read Full Story'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <Link to="/methodology">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-8 glass px-12 py-10 rounded-[48px] border-white/40 cursor-pointer group hover:bg-brand-navy transition-all duration-700 shadow-3xl"
            >
              <div className="w-20 h-20 rounded-[32px] bg-brand-teal/10 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 shadow-xl">
                <Settings className="w-10 h-10" />
              </div>
              <div className="text-left font-sans">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-teal group-hover:text-brand-teal/60 mb-2">
                  {(t as any).methBadge}
                </p>
                <p className="text-2xl md:text-3xl font-black italic uppercase text-brand-navy group-hover:text-white tracking-tighter leading-none">
                  {lang === 'RU' ? 'НАУЧНАЯ МЕТОДИКА JUNO' : 'EXPLORE JUNO METHODOLOGY'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-brand-navy flex items-center justify-center text-white group-hover:bg-white group-hover:text-brand-navy transition-all duration-700 shadow-xl">
                <ArrowRight className="w-7 h-7" />
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
    </section>
  );
}


export function Footer({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;

  return (
    <footer className="py-20 bg-brand-navy border-t border-white/5">
      <div className="container mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <div>
           <div className="flex items-center gap-2 mb-6 text-white font-sans">
            <div className="w-8 h-8 bg-brand-teal rounded flex items-center justify-center">
              <Activity className="text-white w-4 h-4" />
            </div>
            <span className="font-display font-black text-lg tracking-tighter uppercase italic">
              {t.brandTitle1} <span className="text-brand-teal">{t.brandTitle2}</span>
            </span>
          </div>
          <p className="text-sm text-white/40 leading-relaxed italic">
            {t.footerMission}
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-brand-teal">{translations[lang as keyof typeof translations]?.navPrograms || 'Programs'}</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#programs" className="hover:text-white transition-colors">{(t as any).social_athletes}</a></li>
            <li><a href="#locations" className="hover:text-white transition-colors">{(t as any).social_centers}</a></li>
            <li><a href="#methodology" className="hover:text-white transition-colors">{(t as any).social_education}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-brand-teal">{t.footerLegal}</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#" className="hover:text-white transition-colors">{t.footerPrivacy}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t.footerTerms}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t.footerSupport}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-brand-teal">{t.footerSocial}</h4>
          <p className="text-sm text-white/40 mb-6">{lang === 'RU' ? 'Получите ранний доступ к лагерям и материалам.' : 'Get early access to seasonal camps and exclusive training materials.'}</p>
          <div className="flex gap-2">
            <input type="email" placeholder="Email" className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:border-brand-teal" />
            <Button className="px-4 py-2 rounded-lg !bg-brand-sunset text-white border-none">{lang === 'RU' ? 'Подать' : 'Apply'}</Button>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-white/20 uppercase font-bold tracking-widest">
        <span>{t.footerCopyright}</span>
        <div className="flex gap-6">
          <a href="#">Instagram</a>
          <a href="#">TikTok</a>
          <a href="#">Facebook</a>
        </div>
      </div>
    </footer>
  );
}
