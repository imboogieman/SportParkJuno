import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Star, Zap, Users } from 'lucide-react';
import { Navbar, Hero, NewProfilePreview, HolisticDevelopment, SocialProof, DigitalShowcase, GamificationSection, MastersSection, USPSection, LocationsSection, Footer } from './components/Landing';
import { Badge, Button } from './components/UI';
import { FAQSection } from './components/FAQSection';
import { Dashboard } from './components/Dashboard';
import { translations } from './i18n';
import ProfessionalCoaching from './pages/ProfessionalCoaching';
import Registration from './pages/Registration';
import Methodology from './pages/Methodology';
import PublicEvents from './pages/PublicEvents';
import EventDetailsPage from './pages/EventDetailsPage';
import BadgesDescription from './pages/BadgesDescription';
import Testimonials from './components/Testimonials';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './lib/firebase';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const [lang, setLang] = useState<'EN' | 'GE' | 'RU' | 'TR'>('RU');

  // Bootstrap Master Profile
  useEffect(() => {
    const seedMaster = async () => {
      try {
        const masterPhone = "+995551530272";
        const masterRef = doc(db, 'masters', masterPhone);
        const masterSnap = await getDoc(masterRef);
        
        if (!masterSnap.exists()) {
          await setDoc(masterRef, {
            fullName: 'Roman',
            phone: '+995551530272',
            role: 'Head Master',
            specialization: 'Academy Director',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
            createdAt: serverTimestamp()
          });
          console.log("Master profile seeded successfully for:", masterPhone);
        }
      } catch (e) {
        console.error("Error seeding master:", e);
      }
    };
    seedMaster();
  }, []);

  // Smooth scroll behavior
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home lang={lang} setLang={setLang} />} />
        <Route path="/professional-coaching" element={<ProfessionalCoaching lang={lang} />} />
        <Route path="/methodology" element={<Methodology lang={lang} setLang={setLang} />} />
        <Route path="/events" element={<PublicEvents lang={lang} setLang={setLang} />} />
        <Route path="/events/:eventId" element={<EventDetailsPage lang={lang} setLang={setLang} />} />
        <Route path="/register" element={<Registration lang={lang} />} />
        <Route path="/portal" element={<PortalWrapper lang={lang} />} />
        <Route path="/badges" element={<BadgesDescription lang={lang} setLang={setLang} />} />
      </Routes>
    </Router>
  );
}

function PortalWrapper({ lang }: { lang: string }) {
  const navigate = useNavigate();
  return <Dashboard onBack={() => navigate('/')} lang={lang} />;
}

function Home({ lang, setLang }: { lang: 'EN' | 'GE' | 'RU' | 'TR', setLang: (l: any) => void }) {
  const t = translations[lang];
  const navigate = useNavigate();
  const [ageGroup, setAgeGroup] = useState<'A' | 'B' | 'C'>('B');

  return (
    <div className="min-h-screen">
      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />
      <main>
        <Hero lang={lang} />
        <NewProfilePreview lang={lang} />
        <SocialProof lang={lang} />
        <USPSection lang={lang} />
        <HolisticDevelopment lang={lang} />
        <DigitalShowcase lang={lang} />
        <GamificationSection lang={lang} />
        <MastersSection lang={lang} />
        <LocationsSection lang={lang} />
        <Testimonials lang={lang} />
        
        {/* Pricing Section */}
        <section id="pricing" className="py-32 bg-brand-cream relative overflow-hidden font-sans">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-teal/5 blur-[200px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16 max-w-4xl mx-auto">
                <Badge color="teal">{t.pricingBadge}</Badge>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mt-10 mb-10 leading-none text-brand-navy">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-teal">{t.pricingTitle_1}</span>{' '}
                  <span className="text-brand-teal drop-shadow-sm">{t.pricingTitle_2}</span>
                </h2>
                <p className="text-brand-navy/40 max-w-2xl mx-auto font-medium italic text-xl mb-6">
                  {t.pricingDesc}
                </p>


                {/* Age-Based Selector */}
                <div className="flex justify-center mt-10 font-sans">
                  <div className="outline outline-1 outline-brand-navy/15 rounded-[24px] bg-white/45 backdrop-blur-md p-1.5 flex flex-wrap gap-1 shadow-inner relative z-20 justify-center">
                    <button
                      type="button"
                      onClick={() => setAgeGroup('A')}
                      className={`px-4 md:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 pointer-events-auto cursor-pointer ${
                        ageGroup === 'A'
                          ? 'bg-brand-navy text-white shadow-xl scale-[1.03]'
                          : 'text-brand-navy/60 hover:text-brand-navy'
                      }`}
                    >
                      {(t as any).groupSelectorA}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgeGroup('B')}
                      className={`px-4 md:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 pointer-events-auto cursor-pointer ${
                        ageGroup === 'B'
                          ? 'bg-brand-navy text-white shadow-xl scale-[1.03]'
                          : 'text-brand-navy/60 hover:text-brand-navy'
                      }`}
                    >
                      {(t as any).groupSelectorB}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgeGroup('C')}
                      className={`px-4 md:px-6 py-3 rounded-[18px] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 pointer-events-auto cursor-pointer ${
                        ageGroup === 'C'
                          ? 'bg-brand-navy text-white shadow-xl scale-[1.03]'
                          : 'text-brand-navy/60 hover:text-brand-navy'
                      }`}
                    >
                      {(t as any).groupSelectorC}
                    </button>
                  </div>
                </div>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
              {/* Plan 0: Free Trial */}
              <div className="glass p-8 rounded-[48px] border-white shadow-3xl relative overflow-hidden group hover:scale-[1.04] hover:shadow-[0_45px_75px_-10px_rgba(26,26,26,0.18)] transition-all duration-300 bg-gradient-to-br from-white to-brand-teal/5 flex flex-col">
                <div className="absolute top-8 right-8">
                  <div className="w-10 h-10 rounded-xl border border-brand-navy/5 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 bg-white shadow-sm">
                    <Star className="w-4 h-4" />
                  </div>
                </div>
                <div className="mb-8 pr-16">
                  <h3 className="text-xl font-black italic uppercase mb-1 tracking-tight text-brand-navy leading-none">{(t as any).plan0Name}</h3>
                  <p className="text-[8px] text-brand-navy/30 uppercase font-black tracking-[0.4em] italic leading-none">{(t as any).plan0Sub}</p>
                </div>
                <div className="flex flex-col mb-8 font-sans">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic text-brand-navy tracking-tighter">0</span>
                    <span className="text-[10px] font-black italic text-brand-navy/30 uppercase tracking-widest leading-none">GEL</span>
                  </div>
                  <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mt-1.5 leading-none">
                    0 GEL / {(t as any).perClassLabel}
                  </span>
                </div>
                <div className="space-y-3 mb-10 flex-1">
                  {((t as any).plan0Features as string[]).map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className="w-1.5 h-1.5 rounded-full border border-brand-teal/20 group-hover/item:border-brand-teal transition-all" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/60 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                   variant="outline" 
                   className="w-full h-14 !rounded-xl italic uppercase tracking-widest text-[9px] font-black border-brand-navy/10 hover:bg-brand-navy hover:text-white shadow-xl transition-all"
                   onClick={() => navigate('/register')}
                >
                  {(t as any).plan0Button}
                </Button>
              </div>

               {/* Plan 3: Foundation (8 Classes) */}
              <div className="glass p-8 rounded-[48px] border-white shadow-3xl relative overflow-hidden group hover:scale-[1.04] hover:shadow-[0_45px_75px_-10px_rgba(26,26,26,0.18)] transition-all duration-300 bg-white flex flex-col">
                <div className="absolute top-8 right-8">
                  <div className="w-10 h-10 rounded-xl border border-brand-navy/5 flex items-center justify-center text-brand-sunset group-hover:bg-brand-sunset group-hover:text-white transition-all duration-500 bg-white shadow-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="mb-8 pr-16">
                  <h3 className="text-xl font-black italic uppercase mb-1 tracking-tight text-brand-navy leading-none">{(t as any).plan3Name}</h3>
                  <p className="text-[8px] text-brand-navy/30 uppercase font-black tracking-[0.4em] italic leading-none font-sans">{(t as any).plan3Sub}</p>
                </div>
                <div className="flex flex-col mb-8 font-sans">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic text-brand-navy tracking-tighter">
                      {ageGroup === 'A' ? '145' : ageGroup === 'B' ? '177' : '189'}
                    </span>
                    <span className="text-[10px] font-black italic text-brand-navy/30 uppercase tracking-widest leading-none">GEL</span>
                  </div>
                  <span className="text-[9px] font-bold text-brand-sunset uppercase tracking-wider mt-1.5 leading-none">
                    {ageGroup === 'A' ? '18.1' : ageGroup === 'B' ? '22.1' : '23.6'} GEL / {(t as any).perClassLabel}
                  </span>
                </div>
                <div className="space-y-3 mb-10 flex-1">
                  {((t as any).plan3Features as string[]).map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 group/item">
                      <div className="w-1.5 h-1.5 rounded-full border border-brand-sunset/20 group-hover/item:border-brand-sunset transition-all" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/60 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full h-14 !rounded-xl italic uppercase tracking-widest text-[9px] font-black hover:bg-brand-teal transition-all shadow-xl"
                  onClick={() => navigate('/register')}
                >
                  {(t as any).plan3Button}
                </Button>
              </div>

              {/* Plan 1: Standard (12 Classes) */}
              <div className="p-8 rounded-[48px] bg-brand-navy text-white shadow-3xl relative overflow-hidden group hover:scale-[1.04] hover:shadow-[0_45px_75px_-10px_rgba(79,176,168,0.4)] hover:border-brand-teal/30 transition-all duration-300 flex flex-col border border-white/10">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-teal/20 rounded-full blur-[80px]" />
                <div className="absolute top-8 right-8">
                  <div className="w-10 h-10 rounded-xl bg-brand-teal flex items-center justify-center text-white shadow-teal ring-4 ring-brand-teal/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="mb-8 pr-16">
                  <h3 className="text-xl font-black italic uppercase mb-1 tracking-tight text-white leading-none">{t.plan1Name}</h3>
                  <p className="text-[8px] text-brand-teal uppercase font-black tracking-[0.4em] italic leading-none font-sans">{t.plan1Sub}</p>
                </div>
                <div className="flex flex-col mb-8 font-sans">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic text-white tracking-tighter drop-shadow-teal">
                      {ageGroup === 'A' ? '199' : ageGroup === 'B' ? '222' : '234'}
                    </span>
                    <span className="text-[10px] font-black italic text-white/30 uppercase tracking-widest leading-none">GEL</span>
                  </div>
                  <span className="text-[9px] font-bold text-brand-teal uppercase tracking-wider mt-1.5 leading-none font-sans">
                    {ageGroup === 'A' ? '16.6' : ageGroup === 'B' ? '18.5' : '19.5'} GEL / {(t as any).perClassLabel}
                  </span>
                </div>
                <div className="space-y-3 mb-10 flex-1">
                  {t.plan1Features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-1.5 h-1.5 rounded-full border border-brand-teal group-hover/item:bg-brand-teal transition-all" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/80 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="primary" 
                  animatePulse
                  className="w-full h-14 !rounded-xl italic uppercase tracking-widest text-[9px] font-black bg-brand-teal text-white border-none shadow-teal hover:bg-brand-teal/80 transition-colors"
                  onClick={() => navigate('/register')}
                >
                  {t.plan1Button}
                </Button>
              </div>

              {/* Plan 2: Elite / One class */}
              <div className="glass p-8 rounded-[48px] border-white shadow-3xl relative overflow-hidden group hover:scale-[1.04] hover:shadow-[0_45px_75px_-10px_rgba(26,26,26,0.18)] transition-all duration-300 bg-gradient-to-br from-brand-stone to-white flex flex-col group/elite">
                <div className="absolute top-6 right-8 px-3 py-1 bg-brand-sunset text-white text-[7px] font-black uppercase rounded-lg tracking-widest shadow-sunset shadow-xl z-20 animate-pulse">{t.plan2Badge}</div>
                <div className="mb-8 pr-20">
                  <h3 className="text-xl font-black italic uppercase mb-1 tracking-tight text-brand-navy leading-none">{t.plan2Name}</h3>
                  <p className="text-[8px] text-brand-navy/30 uppercase font-black tracking-[0.4em] italic leading-none font-sans">{t.plan2Sub}</p>
                </div>
                <div className="flex flex-col mb-8 font-sans">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black italic text-brand-navy tracking-tighter">
                      {ageGroup === 'A' ? '25' : ageGroup === 'B' ? '28' : '31'}
                    </span>
                    <span className="text-[10px] font-black italic text-brand-navy/30 uppercase tracking-widest leading-none">GEL</span>
                  </div>
                  <span className="text-[9px] font-bold text-brand-sunset uppercase tracking-wider mt-1.5 leading-none font-sans">
                    {ageGroup === 'A' ? '25' : ageGroup === 'B' ? '28' : '31'} GEL / {(t as any).perClassLabel}
                  </span>
                </div>
                <div className="space-y-3 mb-10 flex-1">
                  {t.plan2Features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-1.5 h-1.5 rounded-full border border-brand-sunset group-hover/item:bg-brand-sunset transition-all" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/60 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full h-14 !rounded-xl italic uppercase tracking-widest text-[9px] font-black border-brand-navy/10 hover:bg-brand-navy hover:text-white transition-all shadow-xl"
                  onClick={() => navigate('/register')}
                >
                  {t.plan2Button}
                </Button>
              </div>
            </div>

            {/* Discount / Promo Notes */}
            <div id="pricing-special-offers" className="mt-16 max-w-4xl mx-auto glass p-8 rounded-[36px] bg-white border border-brand-teal/15 shadow-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/5 rounded-full blur-2xl pointer-events-none" />
              <div className="w-14 h-14 rounded-2xl bg-brand-teal flex items-center justify-center shrink-0 text-white shadow-teal">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-center md:text-left flex-1 font-sans">
                <h4 className="text-lg font-black italic uppercase text-brand-navy tracking-tight leading-none mb-2">
                  {lang === 'RU' ? 'СПЕЦИАЛЬНЫЕ ПРЕДЛОЖЕНИЯ' : lang === 'GE' ? 'სპეციალური შემოთავაზებები' : lang === 'TR' ? 'ÖZEL TEKLİFLER' : 'SPECIAL OFFERS'}
                </h4>
                <p className="text-[13px] font-bold text-brand-navy/60 leading-relaxed font-sans">
                  {(t as any).pricingDiscount}
                </p>
              </div>
              <div className="shrink-0">
                <Button 
                  variant="outline" 
                  className="h-12 px-6 text-[9px] font-black uppercase tracking-widest"
                  onClick={() => navigate('/register')}
                >
                  {lang === 'RU' ? 'Получить скидку' : lang === 'GE' ? 'მიიღე ფასდაკლება' : lang === 'TR' ? 'İndirim Al' : 'Claim Discount'}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection lang={lang} />
      </main>
      <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
    </div>
  );
}

