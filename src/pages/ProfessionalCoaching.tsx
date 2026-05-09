import { motion } from 'motion/react';
import { Badge, Button } from '../components/UI';
import { translations } from '../i18n';
import { Play, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfessionalCoaching({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-cream font-sans overflow-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white shadow-none py-6 px-6 md:px-12 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-brand-navy hover:text-brand-teal transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center group-hover:bg-brand-teal group-hover:text-white transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] italic">
            {lang === 'RU' ? 'Назад' : lang === 'GE' ? 'უკან' : 'Back Home'}
          </span>
        </button>
        <span className="font-sans font-black text-2xl tracking-tighter uppercase italic text-brand-navy leading-none">
          {t.brandTitle1} <span className="text-brand-teal">{t.brandTitle2}</span>
        </span>
        <div className="w-20 hidden md:block" />
      </nav>

      <main className="pt-48 pb-32">
        <section className="container mx-auto px-6">
          <div className="text-center mb-24 max-w-4xl mx-auto">
            <Badge color="teal" className="px-6 py-2 rounded-xl italic">{t.methBadge}</Badge>
            <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter mt-10 mb-12 text-brand-navy leading-[0.85]">
              {t.methTitle_1} <br /> 
              <span className="text-brand-sunset drop-shadow-sm">{t.methTitle_2}</span>
            </h1>
            <p className="text-brand-navy/60 text-xl font-medium leading-relaxed mb-12 max-w-2xl mx-auto italic">
              {lang === 'RU' 
                ? 'Наша научная методология тренировок разработана для максимальной эффективности развития юных атлетов.' 
                : lang === 'GE'
                ? 'ჩვენი ვარჯიშის სამეცნიერო მეთოდოლოგია შექმნილია ახალგაზრდა ათლეტების განვითარების მაქსიმალური ეფექტურობისთვის.'
                : 'Our scientific training methodology is designed for maximum efficiency in young athlete development.'}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-24 items-center max-w-6xl mx-auto">
            <div className="space-y-16">
              {[
                { num: '01', title: t.methStep1Title, desc: t.methStep1Desc },
                { num: '02', title: t.methStep2Title, desc: t.methStep2Desc },
                { num: '03', title: t.methStep3Title, desc: t.methStep3Desc }
              ].map((step, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                  className="flex gap-10 group"
                >
                  <div className="w-14 h-14 rounded-2xl border-2 border-brand-navy/10 flex-shrink-0 flex items-center justify-center font-black italic text-brand-teal text-xl group-hover:bg-brand-teal group-hover:text-white group-hover:border-brand-teal transition-all duration-700 shadow-sm leading-none bg-white">
                    {step.num}
                  </div>
                  <div>
                    <h4 className="font-black italic uppercase text-2xl mb-4 tracking-tight text-brand-navy leading-none">{step.title}</h4>
                    <p className="text-brand-navy/60 leading-relaxed text-lg font-medium italic">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="glass rounded-[80px] overflow-hidden relative border-white shadow-3xl skew-x-[-1deg]"
              >
                <img 
                  src="https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Training Sessions" 
                  className="w-full h-[750px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-12 left-12 right-12 p-12 glass rounded-[50px] border-white/20 shadow-2xl">
                  <div className="flex items-center gap-8 mb-10">
                    <div className="w-20 h-20 rounded-[28px] bg-brand-sunset flex items-center justify-center shadow-sunset transition-transform hover:scale-110 cursor-pointer">
                      <Play className="text-white w-10 h-10 fill-white ml-1.5" />
                    </div>
                    <div>
                      <h5 className="font-black italic uppercase text-xl tracking-tight text-white leading-none">{t.methWatchBtn}</h5>
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] mt-2 font-black italic">{t.methWatchSub}</p>
                    </div>
                  </div>
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-brand-sunset shadow-[0_0_20px_rgba(255,140,66,0.5)]"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Extra Philosophy Section */}
        <section className="py-40 mt-40 bg-brand-navy text-white overflow-hidden relative rounded-[100px] mx-6 border-4 border-white/10 shadow-3xl">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-teal/10 blur-[200px] rounded-full translate-x-1/3 -translate-y-1/3" />
           <div className="container mx-auto px-6 relative z-10 text-center">
              <h2 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter mb-16 leading-[0.85]">
                {lang === 'RU' ? 'ФИЛОСОФИЯ' : lang === 'GE' ? 'ფილოსოფია' : 'PHILOSOPHY OF'} <br /> 
                <span className="text-brand-teal drop-shadow-sm">{lang === 'RU' ? 'ОБУЧЕНИЯ' : lang === 'GE' ? 'სწავლების' : 'TEACHING'}</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
                 {[
                   { 
                     title: lang === 'RU' ? 'Дисциплина' : lang === 'GE' ? 'დისციპლინა' : 'Discipline', 
                     desc: lang === 'RU' ? 'Мы учим ответственности и пунктуальности с первого дня.' : lang === 'GE' ? 'ჩვენ ვასწავლით პასუხისმგებლობას და პუნქტუალურობას პირველივე დღიდან.' : 'Instilling responsibility and punctuality from day one.' 
                   },
                   { 
                     title: lang === 'RU' ? 'Уважение' : lang === 'GE' ? 'პატივისცემა' : 'Respect', 
                     desc: lang === 'RU' ? 'Уважение к тренеру, сопернику и самому себе.' : lang === 'GE' ? 'პატივისცემა მწვრთნელის, მოწინააღმდეგის და საკუთარი თავის მიმართ.' : 'Respect for coaches, opponents, and oneself.' 
                   },
                   { 
                     title: lang === 'RU' ? 'Страсть' : lang === 'GE' ? 'ვნება' : 'Passion', 
                     desc: lang === 'RU' ? 'Любовь к игре — главный двигатель прогресса.' : lang === 'GE' ? 'თამაშის სიყვარული პროგრესის მთავარი მამოძრავებელია.' : 'Love for the game is the main driver of progress.' 
                   }
                 ].map((item, i) => (
                   <div key={i} className="p-12 rounded-[56px] bg-white/5 border border-white/10 glass-dark transition-all hover:bg-white/10 group shadow-2xl">
                      <h4 className="text-2xl font-black italic uppercase tracking-tight mb-6 text-brand-teal leading-none group-hover:scale-105 transition-transform">{item.title}</h4>
                      <p className="text-white/50 font-medium italic leading-relaxed text-lg">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <section className="py-40 bg-brand-cream relative">
        <div className="container mx-auto px-6">
          <div className="glass p-16 md:p-32 rounded-[100px] border-white shadow-3xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-teal/10 blur-[150px] rounded-full" />
            <div className="relative z-10">
              <Badge color="teal" className="px-6 py-2 rounded-xl italic">Elite Academy</Badge>
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mt-10 mb-10 text-brand-navy leading-[0.85]">
                {lang === 'RU' ? 'ГОТОВЫ НАЧАТЬ?' : lang === 'GE' ? 'მზად ხართ დასაწყებად?' : 'READY TO START?'}
              </h2>
              <p className="text-brand-navy/50 text-2xl font-medium mb-16 max-w-2xl mx-auto italic">
                {lang === 'RU' 
                  ? 'Запишитесь на первое бесплатное занятие и раскройте потенциал вашего ребенка.' 
                  : lang === 'GE'
                  ? 'დარეგისტრირდით პირველ უფასო ვარჯიშზე და გამოავლინეთ თქვენი შვილის პოტენციალი.'
                  : 'Sign up for the first free session and unlock your child\'s potential.'}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-8">
                <Button 
                  variant="primary" 
                  className="h-20 px-16 text-sm font-black italic uppercase tracking-[0.2em] !rounded-[32px] shadow-teal" 
                  onClick={() => navigate('/register')}
                >
                  {t.ctaJoin}
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 px-16 text-sm font-black italic uppercase tracking-[0.2em] !rounded-[32px] border-brand-navy/10 text-brand-navy hover:bg-brand-navy hover:text-white" 
                  onClick={() => navigate('/register')}
                >
                  {t.ctaTrial}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer lang={lang} />
    </div>
  );
}

function Footer({ lang = 'EN' }: { lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  return (
    <footer className="py-20 bg-white border-t border-brand-navy/5">
      <div className="container mx-auto px-6 text-center">
        <p className="text-brand-navy/40 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Sport Park Juno</p>
        <p className="text-[10px] text-brand-navy/20 font-bold uppercase tracking-widest">{t.footerCopyright}</p>
      </div>
    </footer>
  );
}
