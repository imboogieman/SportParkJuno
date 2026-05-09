import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Badge } from './UI';
import { MOCK_STUDENT } from '../constants';
import { BarChart3, Clock, MapPin, Trophy, Users, Zap, LayoutGrid, Settings, LogOut, ChevronRight, Activity, Bell, Star, Target } from 'lucide-react';
import { translations } from '../i18n';

export function Dashboard({ onBack, lang = 'EN' }: { onBack: () => void, lang?: string }) {
  const t = translations[lang as keyof typeof translations] || translations.EN;
  const studentName = lang === 'RU' ? MOCK_STUDENT.nameRU : lang === 'GE' ? MOCK_STUDENT.nameGE : MOCK_STUDENT.name;
  const navigate = useNavigate();

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
          <NavItem icon={LayoutGrid} label={t.navDash} active />
          <NavItem icon={Users} label={t.navProfile} />
          <NavItem icon={Clock} label={t.navSchedule} />
          <NavItem icon={BarChart3} label={t.navPerformance} />
          <NavItem icon={Trophy} label={t.navAchievements} />
        </nav>

        <div className="mt-auto space-y-4">
          <NavItem icon={Settings} label={t.navAccount} />
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
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-4">{t.dashTitle}</h1>
            <p className="text-lg text-brand-navy/30 font-medium italic">
              {(t as any).dashSub.replace('{name}', studentName)}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="w-14 h-14 rounded-[24px] glass border-white/60 flex items-center justify-center relative hover:bg-white hover:scale-105 transition-all shadow-xl">
              <Bell className="w-6 h-6 text-brand-navy/40" />
              <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-brand-sunset rounded-full shadow-sunset animate-pulse" />
            </button>
            <div className="flex items-center gap-5 glass-dark p-2 pr-8 rounded-[28px] border-white/10 shadow-2xl hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="w-14 h-14 rounded-[20px] bg-brand-teal flex items-center justify-center overflow-hidden shadow-teal">
                <img src={MOCK_STUDENT.avatar} alt="Student" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-widest text-white leading-none mb-1">{studentName}</p>
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-tighter italic">{t.dashGuardian}</p>
              </div>
            </div>
          </div>
        </header>

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
            >
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black italic uppercase tracking-tight">{t.dashNextTrain}</h3>
                 <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand-teal transition-all">
                    <Clock className="w-6 h-6" />
                 </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="w-20 h-20 rounded-[28px] bg-brand-teal flex flex-col items-center justify-center text-white shadow-teal rotate-3 group-hover:rotate-0 transition-transform">
                  <span className="text-[10px] uppercase font-black leading-none opacity-60 mb-1">{lang === 'RU' ? 'ЧТ' : 'THU'}</span>
                  <span className="text-3xl font-black leading-none italic tracking-tighter">12</span>
                </div>
                <div className="flex-1">
                  <h5 className="font-black italic uppercase text-lg tracking-tight mb-2 leading-none">
                    {lang === 'RU' ? 'Динамика мяча' : 'Ball Dynamics'}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 italic">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Hero Park Batumi</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-2xl font-black italic text-brand-teal mb-2 leading-none">16:30</div>
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
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex items-center gap-5 px-8 py-5 rounded-[28px] cursor-pointer transition-all duration-700 border group ${
      active 
        ? 'bg-brand-teal border-brand-teal text-white shadow-teal' 
        : 'text-white/20 border-transparent hover:text-white hover:bg-white/5'
    }`}>
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
