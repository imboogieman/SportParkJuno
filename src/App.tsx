import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Star } from 'lucide-react';
import { Navbar, Hero, HolisticDevelopment, SocialProof, DigitalShowcase, GamificationSection, MastersSection, USPSection, LocationsSection, Footer } from './components/Landing';
import { Badge, Button } from './components/UI';
import { Dashboard } from './components/Dashboard';
import { translations } from './i18n';
import ProfessionalCoaching from './pages/ProfessionalCoaching';
import Registration from './pages/Registration';
import Methodology from './pages/Methodology';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [lang, setLang] = useState<'EN' | 'GE' | 'RU'>('RU');

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
        <Route path="/register" element={<Registration lang={lang} />} />
        <Route path="/portal" element={<PortalWrapper lang={lang} />} />
      </Routes>
    </Router>
  );
}

function PortalWrapper({ lang }: { lang: string }) {
  const navigate = useNavigate();
  return <Dashboard onBack={() => navigate('/')} lang={lang} />;
}

function Home({ lang, setLang }: { lang: 'EN' | 'GE' | 'RU', setLang: (l: any) => void }) {
  const t = translations[lang];
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />
      <main>
        <Hero lang={lang} />
        <SocialProof lang={lang} />
        <USPSection lang={lang} />
        <HolisticDevelopment lang={lang} />
        <DigitalShowcase lang={lang} />
        <GamificationSection lang={lang} />
        <MastersSection lang={lang} />
        <LocationsSection lang={lang} />
        
        {/* Pricing Section */}
        <section className="py-32 bg-brand-cream relative overflow-hidden font-sans">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand-teal/5 blur-[200px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-24 max-w-4xl mx-auto">
                <Badge color="teal">{t.pricingBadge}</Badge>
                <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mt-10 mb-10 leading-none text-brand-navy">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-teal">{t.pricingTitle_1}</span><br /> 
                  <span className="text-brand-teal drop-shadow-sm">{t.pricingTitle_2}</span>
                </h2>
                <p className="text-brand-navy/40 max-w-2xl mx-auto font-medium italic text-xl">
                  {t.pricingDesc}
                </p>
              </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 max-w-7xl mx-auto">
              {/* Plan 0: Free Trial */}
              <div className="glass p-10 md:p-12 rounded-[60px] md:rounded-[80px] border-white shadow-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 bg-gradient-to-br from-white to-brand-teal/5 flex flex-col">
                <div className="absolute top-10 right-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-brand-navy/5 flex items-center justify-center text-brand-teal group-hover:bg-brand-teal group-hover:text-white transition-all duration-500 bg-white shadow-sm">
                    <Star className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="mb-10 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase mb-2 tracking-tight text-brand-navy leading-none">{(t as any).plan0Name}</h3>
                  <p className="text-[9px] md:text-[10px] text-brand-navy/30 uppercase font-black tracking-[0.4em] italic leading-none">{(t as any).plan0Sub}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-10 md:mb-12">
                  <span className="text-7xl md:text-8xl font-black italic text-brand-navy tracking-tighter">{(t as any).plan0Price}</span>
                  <span className="text-xs font-black italic text-brand-navy/30 uppercase tracking-widest leading-none">GEL</span>
                </div>
                <div className="space-y-4 md:space-y-6 mb-12 md:mb-16 flex-1">
                  {((t as any).plan0Features as string[]).map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full border-2 border-brand-teal/20 group-hover/item:border-brand-teal transition-all" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-brand-navy/60 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full h-16 md:h-18 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black border-brand-navy/10 hover:bg-brand-navy hover:text-white shadow-2xl transition-all"
                  onClick={() => navigate('/register')}
                >
                  {(t as any).plan0Button}
                </Button>
              </div>

              {/* Plan 1: Standard */}
              <div className="p-10 md:p-12 rounded-[60px] md:rounded-[80px] bg-brand-navy text-white shadow-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 flex flex-col border border-white/10">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-teal/20 rounded-full blur-[80px]" />
                <div className="absolute top-10 right-10">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-teal flex items-center justify-center text-white shadow-teal ring-4 ring-brand-teal/20">
                    <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="mb-10 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase mb-2 tracking-tight text-white leading-none">{t.plan1Name}</h3>
                  <p className="text-[9px] md:text-[10px] text-brand-teal uppercase font-black tracking-[0.4em] italic leading-none">{t.plan1Sub}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-10 md:mb-12">
                  <span className="text-7xl md:text-8xl font-black italic text-white tracking-tighter drop-shadow-teal">222</span>
                  <span className="text-xs font-black italic text-white/30 uppercase tracking-widest leading-none">{t.plan1Price}</span>
                </div>
                <div className="space-y-4 md:space-y-6 mb-12 md:mb-16 flex-1">
                  {t.plan1Features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full border-2 border-brand-teal group-hover/item:bg-brand-teal transition-all" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-white/80 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="primary" 
                  className="w-full h-16 md:h-18 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black bg-brand-teal text-white border-none shadow-teal hover:bg-brand-teal/80 transition-colors"
                  onClick={() => navigate('/register')}
                >
                  {t.plan1Button}
                </Button>
              </div>

              {/* Plan 2: Elite / One class */}
              <div className="glass p-10 md:p-12 rounded-[60px] md:rounded-[80px] border-white shadow-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-700 bg-gradient-to-br from-brand-stone to-white flex flex-col group/elite">
                <div className="absolute top-8 right-10 px-4 py-1.5 bg-brand-sunset text-white text-[8px] font-black uppercase rounded-xl tracking-widest shadow-sunset shadow-xl z-20 animate-pulse">{t.plan2Badge}</div>
                <div className="mb-10 md:mb-12">
                  <h3 className="text-2xl md:text-3xl font-black italic uppercase mb-2 tracking-tight text-brand-navy leading-none">{t.plan2Name}</h3>
                  <p className="text-[9px] md:text-[10px] text-brand-navy/30 uppercase font-black tracking-[0.4em] italic leading-none">{t.plan2Sub}</p>
                </div>
                <div className="flex items-baseline gap-2 mb-10 md:mb-12">
                  <span className="text-7xl md:text-8xl font-black italic text-brand-navy tracking-tighter">27</span>
                  <span className="text-xs font-black italic text-brand-navy/30 uppercase tracking-widest leading-none">{t.plan2Price}</span>
                </div>
                <div className="space-y-4 md:space-y-6 mb-12 md:mb-16 flex-1">
                  {t.plan2Features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-4 group/item">
                      <div className="w-2 h-2 rounded-full border-2 border-brand-sunset group-hover/item:bg-brand-sunset transition-all" />
                      <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-brand-navy/60 italic leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full h-16 md:h-18 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black bg-brand-navy text-white hover:bg-brand-teal transition-all shadow-2xl"
                  onClick={() => navigate('/register')}
                >
                  {t.plan2Button}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}

