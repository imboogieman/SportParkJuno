import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  Activity, 
  Brain, 
  Heart, 
  Zap, 
  Clock, 
  Wind, 
  Wrench, 
  ShieldCheck, 
  Flame, 
  Utensils, 
  Timer, 
  Compass,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Badge, Button } from '../components/UI';
import { Navbar, Footer } from '../components/Landing';
import { translations } from '../i18n';

export default function Methodology({ lang = 'RU', setLang }: { lang?: string, setLang: (l: any) => void }) {
  const navigate = useNavigate();
  const t = translations[lang as keyof typeof translations] || translations.RU;

  const sections = [
    {
      id: 'physical',
      num: '01',
      title: lang === 'RU' ? 'Общая физическая выносливость' : lang === 'GE' ? 'ზოგადი ფიზიკური გამძლეობა' : 'Essential Physical Endurance',
      subtitle: lang === 'RU' ? 'Essential Physical Endurance' : lang === 'GE' ? 'ფიზიკური მომზადება' : 'Core Fitness',
      desc: lang === 'RU' 
        ? 'Развитие через плавание и бег (дыхалка), борьбу и кроссфит (сила), йогу и гимнастику (гибкость).'
        : lang === 'GE'
        ? 'განვითარება ცურვის და სირბილის (სუნთქვა), ჭიდაობის და კროსფიტის (ძალა), იოგას და ტანვარჯიშის (მოქნილობა) მეშვეობით.'
        : 'Development through swimming and running (breathing), wrestling and crossfit (strength), yoga and gymnastics (flexibility).',
      includes: [
        { label: lang === 'RU' ? 'Бег на длинные дистанции' : lang === 'GE' ? 'სირბილი დისტანციაზე' : 'Long-distance running', icon: Wind },
        { label: lang === 'RU' ? 'Силовая подготовка' : lang === 'GE' ? 'ძალისმიერი მომზადება' : 'Strength training', icon: Flame },
        { label: lang === 'RU' ? 'Растяжка и гибкость' : lang === 'GE' ? 'გაწელვა და მოქნილობა' : 'Stretching', icon: Activity },
      ],
      color: 'cyan'
    },
    {
      id: 'skills',
      num: '02',
      title: lang === 'RU' ? 'Индивидуальные футбольные навыки' : lang === 'GE' ? 'ინდივიდუალური საფეხბურთო უნარები' : 'Advanced Football Skills',
      subtitle: lang === 'RU' ? 'Advanced Football Skills' : lang === 'GE' ? 'ტექნიკური ოსტატობა' : 'Technical Mastery',
      desc: lang === 'RU'
        ? 'Продвинутые технические элементы и владение мячом, адаптированные под персональные особенности атлета.'
        : lang === 'GE'
        ? 'მოწინავე ტექნიკური ელემენტები და ბურთის ფლობა, ადაპტირებული ათლეტის პერსონალურ მახასიათებლებზე.'
        : 'Advanced technical elements and ball control, adapted to the personal characteristics of the athlete.',
      includes: [
        { label: lang === 'RU' ? 'Дриблинг' : lang === 'GE' ? 'დრიბლინგი' : 'Dribbling', icon: Zap },
        { label: lang === 'RU' ? 'Передачи' : lang === 'GE' ? 'პასები' : 'Passing', icon: Compass },
        { label: lang === 'RU' ? 'Удары' : lang === 'GE' ? 'დარტყმები' : 'Shooting', icon: Target },
      ],
      color: 'orange'
    },
    {
      id: 'tactical',
      num: '03',
      title: lang === 'RU' ? 'Тактика и стратегия' : lang === 'GE' ? 'ტაქტიკა და სტრატეგია' : 'Tactical Intelligence',
      subtitle: lang === 'RU' ? 'Tactical Intelligence' : lang === 'GE' ? 'თამაშის IQ' : 'Game IQ',
      desc: lang === 'RU'
        ? 'Навыки командной игры, стратегическое мышление и быстрое принятие решений на поле.'
        : lang === 'GE'
        ? 'გუნდური თამაშის უნარები, სტრატეგიული აზროვნება და სწრაფი გადაწყვეტილების მიღება მოედანზე.'
        : 'Team game skills, strategic thinking, and quick decision-making on the field.',
      includes: [
        { label: lang === 'RU' ? 'Позиционные роли' : lang === 'GE' ? 'პოზიციური როლები' : 'Position roles', icon: Wrench },
        { label: lang === 'RU' ? 'Коммуникация на поле' : lang === 'GE' ? 'კომუნიკაცია მოედანზე' : 'Field communication', icon: Heart },
        { label: lang === 'RU' ? 'Лидерство' : lang === 'GE' ? 'ლიდერობა' : 'Leadership', icon: ShieldCheck },
      ],
      color: 'cyan'
    },
    {
      id: 'habits',
      num: '04',
      title: lang === 'RU' ? 'Практическая физиология и привычки' : lang === 'GE' ? 'პრაქტიკული ფიზიოლოგია და ჩვევები' : 'Healthy Habits & Physiology',
      subtitle: lang === 'RU' ? 'Healthy Habits' : lang === 'GE' ? 'ჯანსაღი ჩვევები' : 'Lifestyle Success',
      desc: lang === 'RU'
        ? 'Знания о питании, медитации и восстановлении для самостоятельного управления своим здоровьем, временем и энергией.'
        : lang === 'GE'
        ? 'ცოდნა კვების, მედიტაციის და აღდგენის შესახებ ჯანმრთელობის, დროის და ენერგიის მართვისთვის.'
        : 'Knowledge of nutrition, meditation, and recovery for self-management of health, time, and energy.',
      includes: [
        { label: lang === 'RU' ? 'Дыхание и Медитация' : lang === 'GE' ? 'სუნთქვა და მედიტაცია' : 'Breathing & Meditation', icon: Wind },
        { label: lang === 'RU' ? 'Диета и Питание' : lang === 'GE' ? 'დიეტა და კვება' : 'Diet & Nutrition', icon: Utensils },
        { label: lang === 'RU' ? 'Тайм-менеджмент' : lang === 'GE' ? 'დროის მართვა' : 'Time management', icon: Timer },
        { label: lang === 'RU' ? 'Восстановление' : lang === 'GE' ? 'აღდგენა' : 'Recovery', icon: Activity },
      ],
      color: 'blue'
    },
    {
      id: 'psychological',
      num: '05',
      title: lang === 'RU' ? 'Эмоциональный иммунитет' : lang === 'GE' ? 'ემოციური იმუნიტეტი' : 'Psychological Immunity',
      subtitle: lang === 'RU' ? 'Psychological Immunity' : lang === 'GE' ? 'მენტალური სიმტკიცე' : 'Mental Toughness',
      desc: lang === 'RU'
        ? 'Стрессоустойчивость и ментальная закалка. Умение сохранять фокус и спокойствие в критические моменты.'
        : lang === 'GE'
        ? 'სტრესის მიმართ მდგრადობა და მენტალური მომზადება. ფოკუსის და სიმშვიდის შენარჩუნება კრიტიკულ მომენტებში.'
        : 'Stress resilience and mental hardening. Ability to maintain focus and calm in critical moments.',
      includes: [
        { label: lang === 'RU' ? 'Позитивное мышление' : lang === 'GE' ? 'პოზიტიური აზროვნება' : 'Positive thinking', icon: Brain },
        { label: lang === 'RU' ? 'Адаптация к вызовам' : lang === 'GE' ? 'ადაპტაცია გამოწვევებთან' : 'Challenge adaptation', icon: Flame },
        { label: lang === 'RU' ? 'Стрессоустойчивость' : lang === 'GE' ? 'სტრესისადმი მდგრადობა' : 'Stress resilience', icon: ShieldCheck },
      ],
      color: 'cyan'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-cream text-brand-navy selection:bg-brand-teal selection:text-white font-sans overflow-hidden">
      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Hero Section */}
      <header className="pt-48 pb-32 px-6 relative">
        <div className="absolute inset-0 z-0 opacity-[0.03]">
          <img src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1600" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="container mx-auto max-w-6xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge color="teal" className="mb-8 px-6 py-2 rounded-xl italic">
              {lang === 'RU' ? 'Раздел Программы' : lang === 'GE' ? 'პროგრამის სექცია' : 'Program Section'}
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-[0.85] mb-10 text-brand-navy">
              {lang === 'RU' ? 'МЕТОДОЛОГИЯ' : lang === 'GE' ? 'მეთოდოლოგია' : 'METHODOLOGY'} <br /> 
              <span className="text-brand-teal drop-shadow-sm">{lang === 'RU' ? 'ПРОГРАММЫ' : lang === 'GE' ? 'აკადემიის' : 'ACADEMY'}</span>
            </h1>
            <p className="text-brand-navy/60 max-w-2xl mx-auto text-xl font-medium leading-relaxed italic">
              {lang === 'RU' 
                ? 'Наша цель — представить комплексную систему развития атлета, объединяющую физическую подготовку, техническое мастерство и психологическую устойчивость.' 
                : lang === 'GE'
                ? 'ჩვენი მიზანია წარმოგიდგინოთ ათლეტის განვითარების კომპლექსური სისტემა, რომელიც აერთიანებს ფიზიკურ მომზადებას, ტექნიკურ ოსტატობას და ფსიქოლოგიურ მდგრადობას.'
                : 'Our goal is to present a comprehensive athlete development system combining physical training, technical mastery, and psychological resilience.'}
            </p>
          </motion.div>
        </div>
      </header>

      {/* Detailed Sections */}
      <section className="pb-48 px-6">
        <div className="container mx-auto max-w-6xl space-y-48">
          {sections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              id={section.id}
              className="flex flex-col lg:flex-row gap-20 items-start"
            >
              {/* Left Column: Number & Title */}
              <div className="lg:w-1/3 sticky top-32">
                <div className="flex items-center gap-6 mb-8">
                  <span className="text-7xl font-black italic text-brand-teal/10 tracking-tighter leading-none">
                    {section.num}
                  </span>
                  <div className="h-px flex-1 bg-brand-navy/10" />
                </div>
                <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-6 leading-tight text-brand-navy">
                  {section.title}
                </h2>
                <p className="text-brand-navy/30 dark:text-brand-navy/20 font-black uppercase tracking-[0.4em] text-[10px] mb-12 italic">
                  {section.subtitle}
                </p>
                <div className="p-10 rounded-[48px] glass border-white shadow-3xl">
                   <p className="text-base text-brand-navy/70 leading-relaxed font-black italic uppercase tracking-tight">
                    "{section.desc}"
                   </p>
                </div>
              </div>

              {/* Right Column: Detailed Breakdown */}
              <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {section.includes.map((item, iIdx) => (
                  <div 
                    key={iIdx}
                    className="group bg-white/40 backdrop-blur-xl border-2 border-white/60 p-12 rounded-[56px] hover:border-brand-teal/40 transition-all duration-700 shadow-3xl hover:-translate-y-2"
                  >
                    <div className="w-16 h-16 rounded-[24px] bg-brand-teal/5 flex items-center justify-center text-brand-teal mb-10 shadow-inner group-hover:scale-110 group-hover:bg-brand-teal group-hover:text-white transition-all duration-500">
                      <item.icon className="w-8 h-8" />
                    </div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tight mb-6 text-brand-navy leading-none">
                      {item.label}
                    </h4>
                    
                    <div className="space-y-4">
                       {[1, 2].map((_, dot) => (
                          <div key={dot} className="flex gap-4 items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/30 group-hover:bg-brand-teal transition-colors" />
                             <div className="h-2.5 w-full bg-brand-navy/5 rounded-full overflow-hidden shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: '75%' }}
                                  className="h-full bg-brand-teal/20 rounded-full" 
                                />
                             </div>
                          </div>
                       ))}
                    </div>
                  </div>
                ))}

                {/* Additional Action Block */}
                <div className="bg-brand-navy p-12 rounded-[56px] flex flex-col justify-between group cursor-pointer hover:shadow-sunset transition-all duration-700 h-full min-h-[300px] border-4 border-white/10 shadow-3xl">
                  <div className="flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Lock className="text-white/40 w-7 h-7" />
                    </div>
                    <Badge color="sunset" className="px-6 py-2 rounded-xl italic">Full Access</Badge>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black italic uppercase tracking-tight mb-3 text-white leading-none">Detailed <br />Protocol</h4>
                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] leading-relaxed italic">
                      Unlocked in portal upon intake
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 bg-brand-navy text-white rounded-[100px] mx-6 mb-20 relative overflow-hidden border-4 border-white/10 shadow-3xl">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-sunset/20 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center max-w-4xl relative z-10">
          <h2 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter mb-12 text-white leading-[0.85]">
            {lang === 'RU' ? 'ГОТОВЫ НАЧАТЬ?' : lang === 'GE' ? 'მზად ხართ დასაწყებად?' : 'READY TO START?'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 justify-center pt-8">
             <Button 
               variant="primary" 
               className="h-20 px-16 text-sm font-black italic uppercase tracking-[0.2em] !rounded-[32px] shadow-sunset bg-brand-sunset"
               onClick={() => navigate('/register')}
             >
               {lang === 'RU' ? 'Записаться сейчас' : lang === 'GE' ? 'დარეგისტრირდით ახლავე' : 'Register Now'}
             </Button>
             <Button 
               variant="outline" 
               className="h-20 px-16 text-sm font-black italic uppercase tracking-[0.2em] !rounded-[32px] border-white/20 text-white hover:bg-white hover:text-brand-navy"
               onClick={() => navigate('/')}
             >
               {lang === 'RU' ? 'На главную' : lang === 'GE' ? 'მთავარ გვერდზე' : 'Back Home'}
             </Button>
          </div>
        </div>
      </section>

      <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
    </div>
  );
}
