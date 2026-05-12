import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from './UI';
import { MOCK_STUDENT } from '../constants';
import { BarChart3, Clock, MapPin, Trophy, Users, Zap, LayoutGrid, Settings, LogOut, ChevronRight, Activity, Bell, Star, Target, CheckCircle2 } from 'lucide-react';
import { translations } from '../i18n';

export function Dashboard({ onBack, lang = 'EN' }: { onBack: () => void, lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  // Load registered athlete data if available
  const [athleteData, setAthleteData] = React.useState<any>(null);
  
  React.useEffect(() => {
    const stored = localStorage.getItem('athleteAccount');
    if (stored) {
      setAthleteData(JSON.parse(stored));
    }
  }, []);

  const studentName = athleteData?.studentName || (lang === 'RU' ? MOCK_STUDENT.nameRU : lang === 'GE' ? MOCK_STUDENT.nameGE : MOCK_STUDENT.name);
  const studentAvatar = athleteData?.studentProfileImage || MOCK_STUDENT.avatar;
  const studentLocation = athleteData?.studentLocation || 'Hero Park Batumi';

  const getScheduleLabel = (id: string) => {
    const slots: any = {
      'mon_wed_fri_16': 'Mon / Wed / Fri — 16:00',
      'mon_wed_fri_18': 'Mon / Wed / Fri — 18:00',
      'tue_thu_sat_16': 'Tue / Thu / Sat — 16:00',
      'tue_thu_sat_18': 'Tue / Thu / Sat — 18:00',
    };
    return slots[id] || id;
  };

  const getRegDay = (id: string) => {
    if (id?.startsWith('mon')) return lang === 'RU' ? 'ПН' : 'MON';
    if (id?.startsWith('tue')) return lang === 'RU' ? 'ВТ' : 'TUE';
    return lang === 'RU' ? 'СБ' : 'SAT';
  };

  const getRegTime = (id: string) => {
    if (id?.endsWith('16')) return '16:00';
    if (id?.endsWith('18')) return '18:00';
    return '17:00';
  };

  const getFullLocation = (id: string) => {
    const locs: any = {
      'airport_runway': t.locAirport,
      'metro_mall': t.locMetroMall,
      'agmashenebeli': t.locAgmashenebeli,
      'rustaveli': t.locRustaveli,
      'heroes_park': t.locHeroesPark,
    };
    return locs[id] || id;
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutGrid, label: t.navDash },
    { id: 'profile', icon: Users, label: t.navProfile },
    { id: 'schedule', icon: Clock, label: t.navSchedule },
    { id: 'performance', icon: BarChart3, label: t.navPerformance },
    { id: 'achievements', icon: Trophy, label: t.navAchievements },
  ];

  return (
    <div className="min-h-screen bg-brand-cream text-brand-navy flex font-sans">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-80 border-r border-black/5 flex-col p-10 glass-dark sticky top-0 h-screen z-50">
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
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <NavItem 
            icon={Settings} 
            label={t.navAccount} 
            active={activeTab === 'account'} 
            onClick={() => setActiveTab('account')}
          />
          <Button variant="ghost" onClick={onBack} className="w-full justify-start px-6 text-white/20 hover:text-white transition-colors gap-4">
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">{t.dashExit}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 lg:p-20 overflow-y-auto relative">
        {/* Background Decor */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-brand-teal/5 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8 relative z-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">
              {activeTab === 'schedule' ? t.navSchedule : t.dashTitle}
            </h1>
            <p className="text-lg text-brand-navy/30 font-medium italic">
              {activeTab === 'schedule' 
                ? (lang === 'RU' ? 'Ваше расписание тренировок и событий' : 'Your training and event schedule')
                : (t as any).dashSub.replace('{name}', studentName)}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="w-14 h-14 rounded-[24px] glass border-white/60 flex items-center justify-center relative hover:bg-white hover:scale-105 transition-all shadow-xl">
              <Bell className="w-6 h-6 text-brand-navy/40" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-sunset rounded-full shadow-sunset animate-pulse" />
            </button>
            <div className="flex items-center gap-5 glass-dark p-2 pr-8 rounded-[28px] border-white/10 shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="w-14 h-14 rounded-[20px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-teal">
                <img src={studentAvatar} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1">{studentName}</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter italic">{t.dashGuardian}</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' ? (
          <>
            {/* Notifications Section */}
            <section className="mb-12 relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1.5 h-6 bg-brand-teal rounded-full" />
                <h3 className="text-sm font-black uppercase tracking-widest italic">{t.dashNotifTitle}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-[32px] glass-dark border border-brand-teal/20 flex gap-5 items-center group cursor-pointer hover:bg-brand-teal/10 transition-all"
                  onClick={() => setActiveTab('profile')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-teal/20 flex items-center justify-center shrink-0 border border-brand-teal/20 shadow-inner group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-6 h-6 text-brand-teal" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-white mb-1">{t.dashNotifWelcome}</h4>
                    <p className="text-[10px] text-white/40 font-bold uppercase italic leading-relaxed">{t.dashNotifWelcomeDesc}</p>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-[32px] glass border border-brand-sunset/20 flex gap-5 items-center group cursor-pointer hover:bg-white/60 transition-all shadow-xl"
                  onClick={() => setActiveTab('schedule')}
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-sunset/10 flex items-center justify-center shrink-0 border border-brand-sunset/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Star className="w-6 h-6 text-brand-sunset" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-navy mb-1">{t.dashNotifEvent}</h4>
                    <p className="text-[10px] text-brand-navy/30 font-bold uppercase italic leading-relaxed">{t.dashNotifEventDesc}</p>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* Dynamic Grid Layout (Asymmetric) */}
            <div className="grid lg:grid-cols-12 gap-8 mb-12 relative z-10">
              {/* Main Stat Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:col-span-8 glass p-12 rounded-[64px] border-white/60 shadow-3xl hover:bg-white/60 transition-colors flex flex-col md:flex-row gap-12 group"
              >
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-20 h-20 bg-brand-teal/10 rounded-[32px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Activity className="text-brand-teal w-10 h-10" />
                    </div>
                    <Badge color="teal" className="px-6 py-2 rounded-2xl text-xs">{t.dashLevel} {MOCK_STUDENT.level}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] text-brand-navy/30 uppercase font-black tracking-[0.4em] mb-4">{t.dashTotalXP}</p>
                    <h2 className="text-6xl md:text-8xl font-black italic text-brand-navy tracking-tighter leading-none">{MOCK_STUDENT.xp} <span className="text-xl not-italic opacity-20 ml-2">XP</span></h2>
                  </div>
                </div>

                <div className="md:w-px h-full bg-brand-navy/5 hidden md:block" />

                <div className="flex-1 flex flex-col justify-end pb-4">
                  <div className="h-4 bg-brand-navy/5 rounded-full overflow-hidden mb-6 shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(MOCK_STUDENT.xp / MOCK_STUDENT.nextLevelXp) * 100}%` }}
                      className="h-full bg-brand-teal shadow-teal"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-brand-navy/40 font-black uppercase tracking-[0.2em] italic">
                    <span>{lang === 'RU' ? 'Новичок II' : 'Novice II'}</span>
                    <span className="text-brand-teal">{(t as any).dashNextXP.replace('{xp}', MOCK_STUDENT.nextLevelXp - MOCK_STUDENT.xp)}</span>
                  </div>
                </div>
              </motion.div>

              {/* Secondary Stat Card */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-4 bg-brand-navy p-12 rounded-[64px] shadow-3xl text-white relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 group-hover:rotate-45 transition-transform duration-1000">
                   <Trophy className="w-48 h-48" />
                </div>
                
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-12">
                    <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center shadow-2xl">
                      <Trophy className="text-brand-teal w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-1 italic">Weekly Reward</p>
                      <p className="text-2xl font-black italic tracking-tighter">14 {t.dashTokens}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.4em]">RANKING BADGES</p>
                    <div className="flex -space-x-4">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-14 h-14 rounded-full border-4 border-brand-navy bg-white/10 backdrop-blur-lg flex items-center justify-center shadow-xl hover:translate-y-[-8px] transition-transform">
                          <Star className="w-6 h-6 text-brand-teal fill-current" />
                        </div>
                      ))}
                      <div className="w-14 h-14 rounded-full border-4 border-brand-navy bg-brand-teal text-white flex items-center justify-center text-xs font-black italic shadow-xl">+10</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Grid */}
            <div className="grid lg:grid-cols-12 gap-8 relative z-10">
              {/* Skill Tree (Environmental List) */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-12 xl:col-span-7 glass p-12 rounded-[64px] border-white/60 shadow-3xl"
              >
                <div className="flex items-center justify-between mb-16">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{t.dashSkillTree}</h3>
                  <Button variant="secondary" className="px-6 rounded-2xl text-[10px] italic shadow-lg">{t.dashReport} ↗</Button>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-10">
                  {MOCK_STUDENT.skills.map((skill, idx) => {
                    const label = lang === 'RU' ? skill.labelRU : lang === 'GE' ? skill.labelGE : skill.label;
                    return (
                      <div key={skill.key} className="group">
                        <div className="flex justify-between items-end mb-4">
                          <div className="flex gap-4 items-center">
                             <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/40 group-hover:bg-brand-teal transition-colors" />
                             <span className="text-[11px] font-black uppercase tracking-widest text-brand-navy/50 italic">{label}</span>
                          </div>
                          <span className="text-2xl font-black italic text-brand-navy tracking-tighter leading-none">{skill.value}%</span>
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
              <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-8">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="glass-dark p-10 rounded-[56px] shadow-3xl text-white group cursor-pointer hover:bg-brand-navy transition-colors border border-white/5"
                  onClick={() => setActiveTab('schedule')}
                >
                  <div className="flex items-center justify-between mb-10">
                     <h3 className="text-xl font-black italic uppercase tracking-tight">{t.dashNextTrain}</h3>
                     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-teal transition-all">
                        <Clock className="w-6 h-6" />
                     </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[28px] bg-brand-teal flex flex-col items-center justify-center text-white shadow-teal rotate-3 group-hover:rotate-0 transition-transform">
                      <span className="text-[10px] uppercase font-black leading-none opacity-60 mb-1">{athleteData ? getRegDay(athleteData.trainingSchedule) : (lang === 'RU' ? 'ЧТ' : 'THU')}</span>
                      <span className="text-3xl font-black leading-none italic tracking-tighter">{athleteData ? '15' : '12'}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-black italic uppercase text-lg tracking-tight mb-2 leading-none">
                        {athleteData ? (lang === 'RU' ? 'Первая тренировка' : 'First Training Session') : (lang === 'RU' ? 'Динамика мяча' : 'Ball Dynamics')}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{athleteData ? getFullLocation(athleteData.studentLocation) : 'Hero Park Batumi'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <div className="text-2xl font-black italic text-brand-teal mb-2 leading-none">{athleteData ? getRegTime(athleteData.trainingSchedule) : '16:30'}</div>
                       <Badge color="teal" className="text-[9px] uppercase italic">{t.dashStatusConfirmed}</Badge>
                    </div>
                  </div>
                </motion.div>

                <div className="grid grid-cols-2 gap-8 flex-1">
                  {[
                    { title: t.dashHabits, sub: t.dashConsistency, icon: Activity, color: 'sunset' },
                    { title: t.dashDrills, sub: t.dashPractice, icon: Target, color: 'teal' }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ y: -10 }}
                      className={`bg-white/80 p-8 rounded-[48px] border border-black/5 shadow-2xl flex flex-col justify-between group cursor-pointer hover:bg-white transition-all`}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl mb-8
                        ${item.color === 'teal' ? 'bg-brand-teal text-white' : 'bg-brand-sunset text-white'}`}>
                        <item.icon className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-black italic uppercase text-sm tracking-tight text-brand-navy group-hover:text-brand-teal transition-colors mb-1">{item.title}</h4>
                        <p className="text-[9px] text-brand-navy/30 uppercase font-black tracking-widest leading-none">{item.sub}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'schedule' ? (
          <ScheduleView 
            athleteData={athleteData} 
            lang={lang} 
            t={t} 
            getFullLocation={getFullLocation} 
            getRegDay={getRegDay}
            getRegTime={getRegTime}
          />
        ) : (
          <div className="glass p-20 rounded-[64px] border-white/60 shadow-3xl text-center">
            <h3 className="text-3xl font-black italic uppercase text-brand-navy/20">{lang === 'RU' ? 'Раздел в разработке' : 'Section Under Development'}</h3>
          </div>
        )}
      </main>
    </div>
  );
}

function ScheduleView({ athleteData, lang, t, getFullLocation, getRegDay, getRegTime }: any) {
  const events = [
    {
      id: 'training_1',
      title: lang === 'RU' ? 'Регулярная тренировка' : 'Regular Training',
      type: 'training',
      date: 'Dec 15, 2026',
      day: athleteData ? getRegDay(athleteData.trainingSchedule) : (lang === 'RU' ? 'ПН' : 'MON'),
      time: athleteData ? getRegTime(athleteData.trainingSchedule) : '16:00',
      location: athleteData ? getFullLocation(athleteData.studentLocation) : 'Hero Park Batumi',
      status: 'confirmed'
    },
    {
      id: 'event_1',
      title: t.dashNotifEvent,
      type: 'event',
      date: 'Dec 20, 2026',
      day: lang === 'RU' ? 'СБ' : 'SAT',
      time: '11:00',
      location: lang === 'RU' ? 'Центральный хаб' : 'Main Hub',
      status: 'invited'
    }
  ];

  return (
    <div className="space-y-8 relative z-10">
      <div className="grid gap-6">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-8 md:p-10 rounded-[48px] border transition-all flex flex-col md:flex-row items-center gap-8 group ${
              event.type === 'training' 
                ? 'glass-dark border-white/5 text-white hover:bg-brand-navy' 
                : 'glass border-brand-sunset/20 text-brand-navy hover:bg-white'
            }`}
          >
            <div className={`w-24 h-24 rounded-[32px] flex flex-col items-center justify-center shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform ${
              event.type === 'training' ? 'bg-brand-teal text-white shadow-teal' : 'bg-brand-sunset text-white shadow-sunset'
            }`}>
              <span className="text-[10px] uppercase font-black leading-none opacity-60 mb-1">{event.day}</span>
              <span className="text-4xl font-black leading-none italic tracking-tighter">{event.date.split(' ')[1].replace(',', '')}</span>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                <Badge color={event.type === 'training' ? 'teal' : 'sunset'} className="text-[9px] uppercase italic">
                  {event.type === 'training' ? (lang === 'RU' ? 'ТРЕНИРОВКА' : 'TRAINING') : (lang === 'RU' ? 'СОБЫТИЕ' : 'EVENT')}
                </Badge>
                <span className="text-[10px] font-black uppercase text-brand-teal tracking-widest">{event.date}</span>
              </div>
              <h4 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight leading-none mb-4 group-hover:translate-x-2 transition-transform">
                {event.title}
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-brand-navy/40 group-hover:text-brand-navy transition-colors">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                  <Clock className="w-4 h-4 text-brand-teal" />
                  <span className={event.type === 'training' ? 'text-white/40' : ''}>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest italic">
                  <MapPin className="w-4 h-4 text-brand-teal" />
                  <span className={event.type === 'training' ? 'text-white/40' : ''}>{event.location}</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-center md:items-end gap-3">
              <Badge color={event.status === 'confirmed' ? 'teal' : 'white'} className="uppercase italic px-6 py-2 rounded-2xl shadow-lg border-white/10">
                {event.status === 'confirmed' ? t.dashStatusConfirmed : (lang === 'RU' ? 'Приглашен' : 'Invited')}
              </Badge>
              {event.status === 'invited' && (
                <Button variant="primary" className="h-12 px-8 !rounded-2xl text-[10px] font-black italic shadow-sunset bg-brand-sunset border-brand-sunset">
                  {lang === 'RU' ? 'ПРИНЯТЬ' : 'CONFIRM ATTENDANCE'}
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface NavItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-5 px-8 py-5 rounded-[28px] cursor-pointer transition-all duration-700 border group ${
        active 
          ? 'bg-brand-teal border-brand-teal text-white shadow-teal' 
          : 'text-white/20 border-transparent hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon className={`w-6 h-6 transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-pill"
          className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]" 
        />
      )}
    </div>
  );
}
