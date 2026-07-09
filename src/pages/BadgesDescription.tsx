import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Activity, 
  Zap, 
  Star, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles,
  Award,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Search,
  X,
  Flame,
  Shield
} from 'lucide-react';
import { Navbar, Footer } from '../components/Landing';
import { Badge, Button, Card } from '../components/UI';
import { translations } from '../i18n';

const badgesTranslations = {
  EN: {
    badge: "Academy Achievements",
    title: "Sport Badges Guide",
    subtitle: "Sport Park Juno's elite curriculum tracks and rewards technical mastery, explosive physical preparation, cognitive coordination, leadership, and fair play.",
    xpReward: "XP Reward",
    requirements: "Requirements",
    coachingTip: "Coaching Tip",
    backHome: "Back to Home",
    testingNotice: "Please Note: All sport badges on this system are currently operating in a testing regime. Real-time profile synchronizations are not fully deployed.",
    points: "points",
    category: "Category",
    difficulty: "Difficulty",
    searchPlaceholder: "Search badges by title, requirements or coaching tips...",
    all: "All",
    filterDifficulty: "Difficulty",
    filterCategory: "Category",
    noResults: "No badges found matching your search. Try resetting filters!",
    levels: {
      easy: "Beginner",
      medium: "Challenger",
      hard: "Elite"
    },
    types: {
      general: "Growth",
      athletic: "Physical",
      technical: "Skills",
      behavioral: "Dignity",
      social: "Leadership"
    },
    items: [
      {
        id: 'first_step',
        title: "First Step",
        desc: "Awarded to every athlete upon successfully attending their first training session, confirmed by the head coach.",
        req: "Attend your first training session at Sport Park Juno and have your attendance confirmed by the master.",
        tip: "Log into the portal to check dynamic performance statistics, view attendance records, and track weekly goals.",
        xp: 150,
        difficulty: "easy",
        type: "general",
        icon: Target,
        color: "teal"
      },
      {
        id: 'iron_athlete',
        title: "Iron Athlete",
        desc: "Recognizes steady determination, resilience, and impeccable self-discipline in physical development.",
        req: "Attend 5 consecutive scheduled training sessions without a single absence.",
        tip: "Discipline beats talent. Ensure you notify coaches 24h beforehand if you need a makeup class credited.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: Activity,
        color: "sunset"
      },
      {
        id: 'sniper',
        title: "Sniper",
        desc: "Celebrates pinpoint accuracy, clean ball striking, and rapid decision-making in shooting drills.",
        req: "Score 10 goals during structured coaching drill exercises and standard training routines.",
        tip: "Focus on your body position and ankle locking before striking. Precision matters more than raw power.",
        xp: 200,
        difficulty: "easy",
        type: "technical",
        icon: Zap,
        color: "sunset"
      },
      {
        id: 'captain',
        title: "Captain",
        desc: "Awarded to players who demonstrate outstanding social guidance, vocal organization, and team spirit.",
        req: "Demonstrate on-field leadership, support teammates during difficult drills, or act as team captain during matchday.",
        tip: "A true captain makes everyone around them play better. Use encouraging words and lead by positive example.",
        xp: 250,
        difficulty: "medium",
        type: "social",
        icon: Star,
        color: "teal"
      },
      {
        id: 'thunder_strike',
        title: "Thunder Strike",
        desc: "Awarded to the most clinical, high-performing attacker during internal academy competitive games.",
        req: "Finish as the top goalscorer of a training match or competitive open event day.",
        tip: "Intelligent timing and spatial awareness are key. Always scan for open passing lanes and empty pocket zones.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Trophy,
        color: "sunset"
      },
      {
        id: 'early_bird',
        title: "Early Bird",
        desc: "Promotes professional attitude, punctuality, and focus-orientation prior to the kickoff.",
        req: "Arrive at least 15 minutes before the training start time with all gear prepared.",
        tip: "Arriving early allows you to warm up, stretch properly, and mentally prepare for the day's training goals.",
        xp: 100,
        difficulty: "easy",
        type: "general",
        icon: Clock,
        color: "teal"
      },
      {
        id: 'clean_game',
        title: "Clean Game",
        desc: "Represents exceptional sportsmanship, high ethical standards, and deep respect for the sport, coaches, and peers.",
        req: "Successfully complete a full training cycle with zero fouls, complaints, or behavioral remarks.",
        tip: "Respect is the foundation of greatness. Help opponents up, respect official calls, and play with honor.",
        xp: 250,
        difficulty: "medium",
        type: "behavioral",
        icon: CheckCircle2,
        color: "teal"
      },
      {
        id: 'brain_master',
        title: "Mind Gym Warrior",
        desc: "Celebrates exceptional spatial IQ, swift reactive choices, and tactical soccer understanding under high pressure.",
        req: "Achieve an 85%+ score in cognitive coordination training sequences and solve 3 tactical board quizzes.",
        tip: "Scanning before you catch is the elite difference. Learn to count teammates and opponents in a quick look.",
        xp: 250,
        difficulty: "medium",
        type: "general",
        icon: BookOpen,
        color: "teal"
      },
      {
        id: 'aqua_gladiator',
        title: "Aqua Gladiator",
        desc: "Acknowledge elite lung recovery, dynamic glide streamlining, and core breathing mastery in pool sessions.",
        req: "Succeed in 10 dynamic aerobic swimming sequences with continuous streamlined dolphin phase.",
        tip: "A horizontal relaxed spine and deep exhale under the surface clear away lactic pooling in the leg groups.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: ShieldCheck,
        color: "sunset"
      },
      {
        id: 'game_creator',
        title: "Playmaker",
        desc: "Awarded to players showing altruistic vision on the turf and delivering accurate defense-splitting assist passes.",
        req: "Record at least 5 clean final assists matching teammate stride times during competitive matches.",
        tip: "Never target where the runner is standing. Lead them to the empty space where they can strike on the run.",
        xp: 300,
        difficulty: "hard",
        type: "social",
        icon: TrendingUp,
        color: "teal"
      },
      {
        id: 'golden_touch',
        title: "Golden Touch",
        desc: "Awarded to players demonstrating superior ball control, elegant passing, and smooth first-touch reception.",
        req: "Successfully complete the visual sensory test and trap 20 high balls perfectly inside the target circle.",
        tip: "Let your foot cushion the ball's momentum on contact. Absorb the energy to keep the ball glued to yours.",
        xp: 250,
        difficulty: "medium",
        type: "technical",
        icon: Award,
        color: "sunset"
      },
      {
        id: 'elastic_force',
        title: "Elastic Force",
        desc: "Celebrates exceptional active flexibility, core rotation, and agility developed through gymnastics routines.",
        req: "Perform the full dynamic mobility progression including bridge holds and lateral high kicks.",
        tip: "Mobility is strength through a full range of motion. Maintain steady breathing and focus on a long, strong spine.",
        xp: 200,
        difficulty: "easy",
        type: "athletic",
        icon: Flame,
        color: "sunset"
      },
      {
        id: 'iron_wall',
        title: "Iron Wall",
        desc: "Honors exceptional positioning, anticipation, and tactical reading in defense to deny opponents.",
        req: "Achieve 10 successful defensive interceptions or blocks during open game scrimmages.",
        tip: "Never look only at the ball. Watch the attacker's hips and eyes to anticipate their direction before they make the pass.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Shield,
        color: "teal"
      }
    ]
  },
  RU: {
    badge: "Достижения Программы",
    title: "Гид по Спортивным Значкам",
    subtitle: "Элитная программа Sport Park Juno отслеживает и поощряет техническое мастерство, взрывную физическую подготовку, когнитивную координацию, лидерство и спортивное благородство.",
    xpReward: "Награда XP",
    requirements: "Требования",
    coachingTip: "Совет тренера",
    backHome: "На главную",
    testingNotice: "Обратите внимание: Все спортивные значки в системе в данный момент работают в тестовом режиме. Синхронизация данных с реальными профилями участников еще не запущена.",
    points: "очков",
    category: "Категория",
    difficulty: "Сложность",
    searchPlaceholder: "Поиск значков по названию, требованиям или советам...",
    all: "Все",
    filterDifficulty: "Сложность",
    filterCategory: "Категория",
    noResults: "Похожих значков не найдено. Попробуйте сбросить фильтры!",
    levels: {
      easy: "Начальный",
      medium: "Средний",
      hard: "Элитный"
    },
    types: {
      general: "Развитие",
      athletic: "Физподготовка",
      technical: "Навыки",
      behavioral: "Достоинство",
      social: "Лидерство"
    },
    items: [
      {
        id: 'first_step',
        title: "Первый шаг",
        desc: "Награждается каждый спортсмен при успешном посещении своего первого занятия и подтверждении его тренером.",
        req: "Посетите свою первую тренировку в Sport Park Juno и получите официальное подтверждение посещения от главного тренера.",
        tip: "Регулярно заглядывайте в портал для просмотра персональной графики развития, расписания и еженедельных целей.",
        xp: 150,
        difficulty: "easy",
        type: "general",
        icon: Target,
        color: "teal"
      },
      {
        id: 'iron_athlete',
        title: "Железный атлет",
        desc: "Символизирует железное терпение, дисциплину и регулярность тренировок, закладывая базу характера физической стойкости.",
        req: "Посетите подряд 5 официальных учебно-тренировочных классов без единого пропуска.",
        tip: "Регулярность бьет талант. Если вы заболели, обязательно ведите отработку в альтернативной локации вовремя.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: Activity,
        color: "sunset"
      },
      {
        id: 'sniper',
        title: "Снайпер",
        desc: "Отражает выдающуюся точность удара, умение концентрироваться и координировать действия перед воротами.",
        req: "Забейте 10 голов во время прохождения специализированных тренировочных упражнений и отработок.",
        tip: "Контролируйте опорную ногу и голеностоп в момент удара. Точность попадания всегда важнее слепой мощности.",
        xp: 200,
        difficulty: "easy",
        type: "technical",
        icon: Zap,
        color: "sunset"
      },
      {
        id: 'captain',
        title: "Капитан",
        desc: "Присваивается лидерам, умеющим позитивно общаться, подбадривать коллег по команде под давлением тренировки.",
        req: "Проявите инициативу на поле, поддержите партнеров по команде в сложные секунды или ведите команду как лидер.",
        tip: "Настоящий капитан раскрывает сильные стороны других. Подбадривайте ребят голосом и личным примером.",
        xp: 250,
        difficulty: "medium",
        type: "social",
        icon: Star,
        color: "teal"
      },
      {
        id: 'thunder_strike',
        title: "Гроза Ворот",
        desc: "Отдает дань уважения лучшему бомбардиру игрового дня в рамках внутренних мероприятий.",
        req: "Завершите товарищеский турнир или демонстрационную игру в роли самого результативного нападающего.",
        tip: "Читайте игру на шаг вперед. Ищите пустые зоны для неожиданных ускорений и маневров за спиной защитников.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Trophy,
        color: "sunset"
      },
      {
        id: 'early_bird',
        title: "Ранняя пташка",
        desc: "Стимулирует профессиональную дисциплину, пунктуальность и психологическую подготовку до свистка.",
        req: "Прибыть на место тренировки как минимум за 15 минут до назначенного начала в полной спортивной экипировке.",
        tip: "Ранний приход дает время на качественную суставную разминку, легкий стретчинг и концентрацию на целях.",
        xp: 100,
        difficulty: "easy",
        type: "general",
        icon: Clock,
        color: "teal"
      },
      {
        id: 'clean_game',
        title: "Чистая игра",
        desc: "Свидетельствует об образцовом спортивном благородстве, уважении к тренерам, соперникам и футбольным правилам.",
        req: "Проведите полный цикл тренировок или игр без нарушений дисциплины, фолов или резких споров.",
        tip: "Великие игроки сильны духом и уважают спорт. Относитесь к соперникам на поле так же, как к партнерам.",
        xp: 250,
        difficulty: "medium",
        type: "behavioral",
        icon: CheckCircle2,
        color: "teal"
      },
      {
        id: 'brain_master',
        title: "Нейро-Атлет",
        desc: "Регистрирует превосходный пространственный IQ, высокую ментальную скорость решения задач и чтение тактических схем.",
        req: "Наберите от 85% правильных ответов по разбору тактик тренера и тестам сенсорной координации.",
        tip: "Сканируйте свободные фланги до касания мяча. Ментальная скорость решает эпизод быстрее физических рывков.",
        xp: 250,
        difficulty: "medium",
        type: "general",
        icon: BookOpen,
        color: "teal"
      },
      {
        id: 'aqua_gladiator',
        title: "Акваглайдер",
        desc: "Символизирует высокий контроль объёма лёгких, координацию скольжения в воде и ритмичное снятие напряжения в бассейне.",
        req: "Пройдите 10 аэробных интервальных циклов заплыва с идеальным обтекаемым выходом из-под воды.",
        tip: "Глубокий растянутый выдох в воду запускает быстрое вымывание лактата из мышц после стрессовой нагрузки на газоне.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: ShieldCheck,
        color: "sunset"
      },
      {
        id: 'game_creator',
        title: "Плеймейкер",
        desc: "Вручается игрокам за коллективный разум, щедрость в атаке и безупречные разрезные передачи за спину защитникам.",
        req: "Оформите не менее 5 точных голевых ассистов в темп движения напарника во время игровых матчей.",
        tip: "Не катите мяч партнеру спиной к воротам. Ищите зону, куда он может ворваться на полной скорости.",
        xp: 300,
        difficulty: "hard",
        type: "social",
        icon: TrendingUp,
        color: "teal"
      },
      {
        id: 'golden_touch',
        title: "Золотое касание",
        desc: "Вручается игрокам за образцовый контроль мяча, чистый первый прием и элегантную работу ног.",
        req: "Пройти тест на сенсорно-визуальную координацию и безупречно обработать 20 верховых передач в круге.",
        tip: "При приеме гасите инерцию мяча движением стопы назад. Мяч должен буквально прилипать к вашей бутсе.",
        xp: 250,
        difficulty: "medium",
        type: "technical",
        icon: Award,
        color: "sunset"
      },
      {
        id: 'elastic_force',
        title: "Эластичная сила",
        desc: "Чествует превосходную гибкость, ротацию корпуса и ловкость, развитые на гимнастических тренировках.",
        req: "Выполнить полную серию упражнений на динамическую мобильность, включая удержание моста и махи ногами.",
        tip: "Гибкость — это сила в полном диапазоне движения. Сохраняйте ровное дыхание и следите за вытяжением позвоночника.",
        xp: 200,
        difficulty: "easy",
        type: "athletic",
        icon: Flame,
        color: "sunset"
      },
      {
        id: 'iron_wall',
        title: "Железная стена",
        desc: "Отмечает великолепное позиционирование, чтение игры и тактическую грамотность в защите.",
        req: "Совершить 10 успешных перехватов или блокировок удара/передачи во время двусторонних игр.",
        tip: "Никогда не смотрите только на мяч. Следите за корпусом и взглядом нападающего, чтобы перехватить мяч до паса.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Shield,
        color: "teal"
      }
    ]
  },
  GE: {
    badge: "პროგრამის მიღწევები",
    title: "სპორტული ნიშნების გზამკვლევი",
    subtitle: "Juno-ს ელიტარული პროგრამა აფასებს და აჯილდოებს ტექნიკურ ოსტატობას, ფიზიკურ მომზადებას, კოგნიტურ კოორდინაციას, ლიდერულ თვისებებსა და სამართლიან თამაშს.",
    xpReward: "XP ჯილდო",
    requirements: "მოთხოვნები",
    coachingTip: "მწვრთნელის რჩევა",
    backHome: "მთავარ გვერდზე",
    testingNotice: "ყურადღება: სისტემაში არსებული ყველა სპორტული ნიშანი მუშაობს სატესტო რეჟიმში. რეალურ მოთამაშეთა პროფილებთან მონაცემთა სინქრონიზაცია ჯერ არ არის სრულად დანერგილი.",
    points: "ქულა",
    category: "კატეგორია",
    difficulty: "სირთულე",
    searchPlaceholder: "მოძებნეთ ნიშნები სათაურით, მოთხოვნებით ან რჩევებით...",
    all: "ყველა",
    filterDifficulty: "სირთულე",
    filterCategory: "კატეგორია",
    noResults: "შესაბამისი ნიშნები ვერ მოიძებნა. სცადეთ ფილტრების გასუფთავება!",
    levels: {
      easy: "საწყისი",
      medium: "საშუალო",
      hard: "ელიტური"
    },
    types: {
      general: "განვითარება",
      athletic: "ფიზმომზადება",
      technical: "უნარები",
      behavioral: "ღირსება",
      social: "ლიდერობა"
    },
    items: [
      {
        id: 'first_step',
        title: "პირველი ნაბიჯი",
        desc: "გადაეცემა თითოეულ ათლეტს პირველი ვარჯიშის წარმატებით გავლისა და მწვრთნელის მიერ მისი დადასტურებისას.",
        req: "დაესწარით პირველ ვარჯიშს Sport Park Juno-ში და მიიღეთ დადასტურება მწვრთნელისგან.",
        tip: "შედით პორტალში თქვენი დინამიკური სტატისტიკის, დასწრების განრიგისა და კვირის მიზნების შესამოწმებლად.",
        xp: 150,
        difficulty: "easy",
        type: "general",
        icon: Target,
        color: "teal"
      },
      {
        id: 'iron_athlete',
        title: "რკინის ათლეტი",
        desc: "აღიარებს მტკიცე მონდომებას, გამძლეობას და უზადო თვითდისციპლინას ფიზიკური მომზადების პროცესში.",
        req: "დაესწარით ზედიზედ 5 დაგეგმილ ვარჯიშს არცერთი გაცდენის გარეშე.",
        tip: "დისციპლინა ყოველთვის ამარცხებს ნიჭს. გაცდენის შემთხვევაში, წინასწარ აცნობეთ მწვრთნელს ალტერნატიული აღდგენისთვის.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: Activity,
        color: "sunset"
      },
      {
        id: 'sniper',
        title: "სნაიპერი",
        desc: "აღნიშნავს დარტყმის სიზუსტეს, კოორდინაციასა და სწრაფ გადაწყვეტილებებს კარის წინ.",
        req: "გაიტანეთ 10 გოლი სპეციალური სავარჯიშოების ან ინტენსიური წვრთნების დროს.",
        tip: "დარტყმისას აკონტროლეთ სხეულის პოზიცია და ფეხის ბრუნი. სიზუსტე ბევრად უფრო მნიშვნელოვანია, ვიდრე უხეში ძალა.",
        xp: 200,
        difficulty: "easy",
        type: "technical",
        icon: Zap,
        color: "sunset"
      },
      {
        id: 'captain',
        title: "კაპიტანი",
        desc: "ენიჭება მოთამაშეს, რომელიც ავლენს გუნდურ სულისკვეთებასა და გამორჩეულ ლიდერულ თვისებებს.",
        req: "გამოავლინეთ ლიდერული თვისებები მოედანზე, მხარი დაუჭირეთ თანაგუნდელებს ან უხელმძღვანელეთ გუნდს მატჩისას.",
        tip: "ნამდვილი კაპიტანი სხვებს ეხმარება უკეთესად თამაშში. გაამხნევეთ თანაგუნდელები პოზიტიური მაგალითით.",
        xp: 250,
        difficulty: "medium",
        type: "social",
        icon: Star,
        color: "teal"
      },
      {
        id: 'thunder_strike',
        title: "გროზა ვოროტ",
        desc: "გადაეცემა საუკეთესო და ყველაზე პროდუქტიულ თავდამსხმელს შიდა აკადემიური თამაშების ფარგლებში.",
        req: "დაასრულეთ ვარჯიში ან ამხანაგური მატჩი ყველაზე მეტი გატანილი გოლით.",
        tip: "მოედანზე სივრცის სწორად აღქმა მთავარია. მუდამ ეძებეთ თავისუფალი ზონები მცველების ზურგს უკან დასასწრებად.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Trophy,
        color: "sunset"
      },
      {
        id: 'early_bird',
        title: "ადრიანი ჩიტი",
        desc: "ახალისებს პროფესიონალურ დამოკიდებულებას, პუნქტუალურობასა და კონცენტრირებას ვარჯიშის დაწყებამდე.",
        req: "მიდით საწვრთნელ მოედანზე მინიმუმ 15 წუთით ადრე სრულ აღჭურვილობაში.",
        tip: "ადრე მოსვლა გაძლევთ დროს ხარისხიანი გახურებისთვის, გაწელვისა და დღის მიზნებზე სათანადოდ კონცენტრირებისთვის.",
        xp: 100,
        difficulty: "easy",
        type: "general",
        icon: Clock,
        color: "teal"
      },
      {
        id: 'clean_game',
        title: "სუფთა თამაში",
        desc: "გამოხატავს მაღალ ეთიკურ სტანდარტებს, წესების დაცვასა და მწვრთნელებისა და მეტოქეების პატივისცემას.",
        req: "ჩაატარეთ სრული საწვრთნელი ციკლი უხეში თამაშის, ჯარიმების ან დისციპლინური შენიშვნების გარეშე.",
        tip: "პატივისცემა დიდების საფუძველია. დაეხმარეთ წაქცეულ მეტოქეს, პატივი ეცით მსაჯის გადაწყვეტილებას და ითამაშეთ ღირსებით.",
        xp: 250,
        difficulty: "medium",
        type: "behavioral",
        icon: CheckCircle2,
        color: "teal"
      },
      {
        id: 'brain_master',
        title: "ნეირო-ათლეტი",
        desc: "აღნიშნავს განსაკუთრებულ სივრცით ინტელექტს, სწრაფ გადაწყვეტილებებს და ტაქტიკურ ხედვას მოედანზე.",
        req: "მიაღწიეთ 85%+ ქულას კოორდინაციის ტესტებში და წარმატებით ამოხსენით 3 ტაქტიკური დავალება.",
        tip: "სკანირება მიღებამდე მთავარი გასაღებია. ისწავლეთ თანაგუნდელების განლაგების სწრაფი შეფასება.",
        xp: 250,
        difficulty: "medium",
        type: "general",
        icon: BookOpen,
        color: "teal"
      },
      {
        id: 'aqua_gladiator',
        title: "აკვაგლადიატორი",
        desc: "ენიჭება აუზის სესიებში ფილტვების მუშაობის, სწორი სუნთქვისა და აქტიური აღდგენის დემონსტრირებისთვის.",
        req: "შეასრულეთ 10 აერობული საცურაო ციკლი წყალქვეшა სწორი მოძრაობითა და სხეულის ჰორიზონტალური ბალანსით.",
        tip: "წყალქვეშ მშვიდი და გრძელი ამოსუნთქვა ეხმარება კუნთებს დაგროვილი დაღლილობის სწრაფად მოხსნაში.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: ShieldCheck,
        color: "sunset"
      },
      {
        id: 'game_creator',
        title: "პლეიმეიკერი",
        desc: "გადაეცემა მოთამაშეებს, რომლებიც ავლენენ განსაკუთრებულ ხედვას და აკეთებენ ზუსტ საგოლე გადაცემებს.",
        req: "შეასრულეთ მინიმუმ 5 სუფთა საგოლე პასი პარტნიორის მოძრაობის მიმართულებით თამაშების დროს.",
        tip: "ნუ მისცემთ პასს იქ, სადაც პარტნიორი უძრავად დგას. იპოვეთ თავისუფალი სივრცე, სადაც ის სირბილისას მიიღებს ბურთს.",
        xp: 300,
        difficulty: "hard",
        type: "social",
        icon: TrendingUp,
        color: "teal"
      },
      {
        id: 'golden_touch',
        title: "ოქროს შეხება",
        desc: "გადაეცემა მოთამაშეებს, რომლებიც ავლენენ ბურთის ბრწყინვალე კონტროლს, ელეგანტურ მიღებასა და ფეხის ტექნიკას.",
        req: "წარმატებით გაიარეთ სენსორულ-ვიზუალური ტესტი და იდეალურად მიიღეთ 20 მაღალი გადაცემა სამიზნე წრეში.",
        tip: "ბურთის მიღებისას შეამცირეთ მისი ინერცია წვივისა და ტერფის დაბალანსებული მოძრაობით. ბურთი ფეხზე უნდა 'დაგეწებოთ'.",
        xp: 250,
        difficulty: "medium",
        type: "technical",
        icon: Award,
        color: "sunset"
      },
      {
        id: 'elastic_force',
        title: "ელასტიური ძალა",
        desc: "აღნიშნავს განსაკუთრებულ მოქნილობას, სხეულის როტაციასა და სისწრაფეს, რომელიც გამომუშავებულია ტანვარჯიშისას.",
        req: "შეასრულეთ დინამიკური მობილობის სრული სერია, მათ შორის ხიდზე დგომა და ფეხის მაღალი გაქნევები.",
        tip: "მოქნილობა არის ძალა მოძრაობის სრულ დიაპაზონში. შეინარჩუნეთ თანაბარი სუნთქვა და გაამახვილეთ ყურადღება ხერხემალზე.",
        xp: 200,
        difficulty: "easy",
        type: "athletic",
        icon: Flame,
        color: "sunset"
      },
      {
        id: 'iron_wall',
        title: "რკინის კედელი",
        desc: "აღიარებს ბრწყინვალე პოზიციონირებას, თამაშის კითხვასა და ტაქტიკურ წვრთნას დაცვით ფაზაში.",
        req: "განახორციელეთ მინიმუმ 10 წარმატებული ჩაჭრა ან დარტყმის ბლოკირება ორმხრივი თამაშების დროს.",
        tip: "არასოდეს უყუროთ მხოლოდ ბურთს. აკონტროლეთ თავდამსხმელის მოძრაობა და მზერა, რათა წინასწარ ამოიკითხოთ მისი პასი.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Shield,
        color: "teal"
      }
    ]
  },
  TR: {
    badge: "Program Başarıları",
    title: "Spor Rozetleri Kılavuzu",
    subtitle: "Sport Park Juno'nun elit müfredatı; teknik beceriyi, patlayıcı fiziksel gücü, bilişsel koordinasyonu, liderlik yeteneğini ve centilmenliği takip edip ödüllendirir.",
    xpReward: "XP Ödülü",
    requirements: "Gereksinimler",
    coachingTip: "Antrenör Önerisi",
    backHome: "Ana Sayfaya Dön",
    testingNotice: "Lütfen Dikkat: Sistemdeki tüm spor rozetleri şu anda test rejiminde çalışmaktadır. Gerçek zamanlı oyuncu profili senkronizasyonu henüz tam olarak dağıtılmamıştır.",
    points: "puan",
    category: "Kategori",
    difficulty: "Zorluk",
    searchPlaceholder: "Rozetleri başlık, gereksinimler veya önerilere göre ara...",
    all: "Tümü",
    filterDifficulty: "Zorluk",
    filterCategory: "Kategori",
    noResults: "Aramanıza uygun rozet bulunamadı. Filtreleri sıfırlamayı deneyin!",
    levels: {
      easy: "Başlangıç",
      medium: "Aday",
      hard: "Elit"
    },
    types: {
      general: "Gelişim",
      athletic: "Fiziksel",
      technical: "Teknik Nitelik",
      behavioral: "Centilmenlik",
      social: "Liderlik"
    },
    items: [
      {
        id: 'first_step',
        title: "İlk Adım",
        desc: "İlk antrenman seansına katılan ve antrenör tarafından onaylanan her sporcuya verilir.",
        req: "Sport Park Juno'daki ilk idmanınıza katılın ve baş antrenör tarafından onaylanmasını sağlayın.",
        tip: "Haftalık gelişim istatistiklerini, devamsızlık durumunu ve ilerleme hedeflerini görmek için portalı düzenli ziyaret edin.",
        xp: 150,
        difficulty: "easy",
        type: "general",
        icon: Target,
        color: "teal"
      },
      {
        id: 'iron_athlete',
        title: "Demir Sporcu",
        desc: "Fiziksel gelişimde kararlılık, azim ve kusursuz antrenman devamlılığını simgeler.",
        req: "Grup planındaki 5 ardışık idman seansına tek bir devamsızlık yapmadan katılın.",
        tip: "Devamlılık yeteneği gölgeler. Hastalık durumunda, başka bir grupta telafi dersine katılmak için 24 saat önceden haber verin.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: Activity,
        color: "sunset"
      },
      {
        id: 'sniper',
        title: "Keskin Nişancı",
        desc: "Kaleye yapılan vuruşlarda üst düzey isabet oranı, doğru top kontrolü ve odaklanma becerisini gösterir.",
        req: "Belirlenen teknik şut egzersizleri ve seans içi maçlarda toplam 10 gol atın.",
        tip: "Şut çekerken destek ayağınızı doğru yerleştirin ve ayak bileğinizi kilitleyin. İsabet güce her zaman üstün gelir.",
        xp: 200,
        difficulty: "easy",
        type: "technical",
        icon: Zap,
        color: "sunset"
      },
      {
        id: 'captain',
        title: "Kaptan",
        desc: "Takım arkadaşlarına destek olan, liderlik duruşu sergileyen ve saha içi iletişimi üstün oyunculara verilir.",
        req: "Antrenmanlarda takımını motive etmek, zor anlarda lidere yakışır davranışlarla örnek olmak.",
        tip: "Gerçek bir kaptan çevresindekileri de parlatır. Sesinizle ve olumlu davranışlarınızla her zaman takımınıza güç verin.",
        xp: 250,
        difficulty: "medium",
        type: "social",
        icon: Star,
        color: "teal"
      },
      {
        id: 'thunder_strike',
        title: "Kale Fatihi",
        desc: "Bölgesel veya akademi içi müsabakalarda günün en skorer hücum oyuncusu onurlandırması.",
        req: "Grup içi hazırlık turnuvalarında veya seçmelerde günün gol kralı olarak tamamlamak.",
        tip: "Doğru zamanlama ve pozisyon alma başarının kilididir. Blok aralarındaki boşlukları gözlemleyin.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Trophy,
        color: "sunset"
      },
      {
        id: 'early_bird',
        title: "Erkenci Kuş",
        desc: "Profesyonel yaklaşımı, dakikliği ve antrenman öncesi zihinsel hazırlığı teşvik eder.",
        req: "İdman saatinden en az 15 dakika önce tüm ekipmanınız eksiksiz olarak sahada hazır bulunmak.",
        tip: "Erken gelmek iyi bir ısınma, germe hareketleri yapma ve günün hedeflerine zihinsel olarak adapte olma şansı verir.",
        xp: 100,
        difficulty: "easy",
        type: "general",
        icon: Clock,
        color: "teal"
      },
      {
        id: 'clean_game',
        title: "Temiz Oyun",
        desc: "Oyun kurallarına, antrenörlere, saha arkadaşlarına ve rakiplere karşı üst düzey saygıyı temsil eder.",
        req: "Tüm antrenman dönemini tek bir disiplin uyarısı, bilerek faul veya centilmenlik dışı haraket yapmadan tamamlamak.",
        tip: "Büyük sporcular saygıyla yükselir. Rakibinize de takım arkadaşınız gibi önem verin, kararlara ve kurallara güvenin.",
        xp: 250,
        difficulty: "medium",
        type: "behavioral",
        icon: CheckCircle2,
        color: "teal"
      },
      {
        id: 'brain_master',
        title: "Zihin Savaşçısı",
        desc: "Yüksek oyun baskısı altında gelişmiş uzamsal zeka, hızlı reaktif seçimler ve tarlasında üstün oyun zekası oluşturma.",
        req: "Bilişsel koordinasyon eğitim serilerinde %85+ başarı elde edin ve 3 taktiksel oyun tahtası testini çözün.",
        tip: "Gerekli alanı topla buluşmadan saniyeler önce tarayın. Zihinsel hız en zorlu engelleri aşmanızı sağlar.",
        xp: 250,
        difficulty: "medium",
        type: "general",
        icon: BookOpen,
        color: "teal"
      },
      {
        id: 'aqua_gladiator',
        title: "Su Gladyatörü",
        desc: "Havuz çalışmalarında üstün akciğer kapasitesini, dinamik süzülme kontrolünü ve doğru nefes yönetimini ödüllendirir.",
        req: "Havuzda kesintisiz dolfin süzülme aşaması içeren 10 dinamik aerobik yüzme serisini başarıyla tamamlayın.",
        tip: "Sualtındaki derin ve uzun nefes çıkışları bacak kaslarındaki yorgunluğu ve laktik asit birikimini hızla temizler.",
        xp: 300,
        difficulty: "medium",
        type: "athletic",
        icon: ShieldCheck,
        color: "sunset"
      },
      {
        id: 'game_creator',
        title: "Oyun Kurucu",
        desc: "Saha içinde yüksek pas vizyonu ve takım yararına oynayıp savunma kilidini açan asistleri ödüllendirir.",
        req: "Gerektiğinde arkadaşının koşu yolunu görerek maçlarda en az 5 net asist yapın.",
        tip: "Pasınızı hiçbir zaman arkadaşınızın ayakta beklediği yere atmayın; koşusunu kesmeyeceği boş alanı hedefleyin.",
        xp: 300,
        difficulty: "hard",
        type: "social",
        icon: TrendingUp,
        color: "teal"
      },
      {
        id: 'golden_touch',
        title: "Altın Dokunuş",
        desc: "Kusursuz top kontrolü, zarif pas alışı ve yumuşak ilk dokunuş becerisi sergileyen sporculara verilir.",
        req: "Sensörsel görsel testi tamamlayın ve hedef daire içinde gelen 20 yüksek topu mükemmel şekilde yumuşatın.",
        tip: "Top ayağınızla buluştuğunda bileğinizi hafifçe geriye doğru esneterek topun hızını sönümleyin.",
        xp: 250,
        difficulty: "medium",
        type: "technical",
        icon: Award,
        color: "sunset"
      },
      {
        id: 'elastic_force',
        title: "Esnek Güç",
        desc: "Jimnastik çalışmalarıyla kazanılan üstün aktif esnekliği, gövde rotasyonunu ve çevikliği ödüllendirir.",
        req: "Köprü duruşu ve yan yüksek tekmeleri içeren dinamik hareketlilik serisini eksiksiz uygulayın.",
        tip: "Esneklik, tam hareket açıklığında sergilenen güçtür. Temponuzu koruyun ve omurganızı dik tutun.",
        xp: 200,
        difficulty: "easy",
        type: "athletic",
        icon: Flame,
        color: "sunset"
      },
      {
        id: 'iron_wall',
        title: "Demir Duvar",
        desc: "Savunmada üstün yer tutma, oyun kurma planlarını sezinleme ve taktiksel müdahale becerisini onurlandırır.",
        req: "Saha içi maçlarda 10 başarılı pas arası kesme veya rakip şut engellemesi gerçekleştirin.",
        tip: "Asla sadece topa bakmayın. Pası atmadan önce yönünü tahmin etmek için hücum oyuncusunun kalça açısını izleyin.",
        xp: 350,
        difficulty: "hard",
        type: "technical",
        icon: Shield,
        color: "teal"
      }
    ]
  }
};

export default function BadgesDescription({ lang = 'EN', setLang }: { lang: 'EN' | 'GE' | 'RU' | 'TR', setLang: (l: any) => void }) {
  const navigate = useNavigate();
  const text = badgesTranslations[lang] || badgesTranslations.EN;
  const t = translations[lang] || translations.EN;

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // Scroll behavior
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Filter computation
  const filteredItems = text.items.filter(badge => {
    const matchesSearch = searchQuery === '' || 
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.req.toLowerCase().includes(searchQuery.toLowerCase()) ||
      badge.tip.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || badge.type === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || badge.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-brand-cream text-brand-navy font-sans relative overflow-hidden">
      {/* Background radial soft light blobs */}
      <div className="fixed top-0 left-0 w-[800px] h-[800px] bg-brand-teal/5 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-brand-sunset/5 blur-[150px] rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Primary header/navbar */}
      <Navbar 
        onPortalClick={() => navigate('/portal')} 
        currentLang={lang} 
        onLangChange={setLang} 
      />

      <main className="pt-24 pb-32">
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          {/* Top navigation actions */}
          <div className="flex justify-between items-center mb-10">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)} 
              className="group border-brand-navy/10 hover:border-brand-navy/30 h-11 px-5 !rounded-xl text-[10px] uppercase font-black tracking-widest flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {text.backHome}
            </Button>
            <div className="flex items-center gap-1.5 opacity-55 text-[10px] font-black uppercase tracking-widest italic text-brand-navy/60">
              <Award className="w-4 h-4 text-brand-teal" />
              <span>SPORT PARK JUNO STANDARD</span>
            </div>
          </div>

          {/* Heading intro hero */}
          <div className="max-w-4xl mb-12">
            <Badge color="teal" className="mb-4">
              <span className="flex items-center gap-1 sm:gap-2">
                <Sparkles className="w-3 h-3 text-brand-teal shrink-0" />
                {text.badge}
              </span>
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase leading-none tracking-tighter mb-4">
              {text.title.split(' ')[0]}{' '}
              <span className="text-brand-sunset drop-shadow-sm">{text.title.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-brand-navy/55 text-base sm:text-lg max-w-3xl leading-relaxed italic">
              {text.subtitle}
            </p>

            {/* Testing regime notice */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-brand-sunset/5 border border-brand-sunset/15 rounded-3xl p-5 relative overflow-hidden backdrop-blur-sm">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-sunset" />
              <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-brand-sunset/10 flex items-center justify-center text-brand-sunset animate-pulse">
                <Activity className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-sunset block mb-0.5">
                  {lang === 'RU' ? 'Тестовый режим' : lang === 'GE' ? 'სატესტო რეჟიმი' : lang === 'TR' ? 'Test Aşaması' : 'Testing Regime'}
                </span>
                <p className="text-brand-navy/70 text-xs sm:text-sm font-semibold italic leading-relaxed">
                  {text.testingNotice}
                </p>
              </div>
            </div>
          </div>

          {/* Brand Search & Filter Controls */}
          <div className="bg-white/40 border border-brand-navy/5 rounded-[32px] p-6 mb-12 flex flex-col gap-6 backdrop-blur-md">
            {/* Search Input Row */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-navy/40">
                <Search className="w-5 h-5 animate-pulse" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={text.searchPlaceholder}
                className="w-full h-14 pl-12 pr-12 rounded-2xl border border-brand-navy/10 bg-white/70 text-brand-navy font-semibold text-sm placeholder-brand-navy/30 focus:outline-none focus:border-brand-teal/40 focus:ring-2 focus:ring-brand-teal/5 transition-all text-left"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-navy/40 hover:text-brand-navy transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* In-depth filters */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-4 border-t border-brand-navy/5">
              {/* Category selector */}
              <div className="flex flex-wrap items-center gap-2 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-brand-navy/40 mr-1">
                  {text.filterCategory}:
                </span>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-brand-teal text-white shadow-md'
                      : 'bg-white/60 hover:bg-white text-brand-navy/75 border border-brand-navy/5'
                  }`}
                >
                  {text.all}
                </button>
                {Object.entries(text.types).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      selectedCategory === key
                        ? 'bg-brand-teal text-white shadow-md'
                        : 'bg-white/60 hover:bg-white text-brand-navy/75 border border-brand-navy/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Difficulty selector */}
              <div className="flex flex-wrap items-center gap-2 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-brand-navy/40 mr-1">
                  {text.filterDifficulty}:
                </span>
                <button
                  onClick={() => setSelectedDifficulty('all')}
                  className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                    selectedDifficulty === 'all'
                      ? 'bg-brand-sunset text-white shadow-md'
                      : 'bg-white/60 hover:bg-white text-brand-navy/75 border border-brand-navy/5'
                  }`}
                >
                  {text.all}
                </button>
                {Object.entries(text.levels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDifficulty(key)}
                    className={`h-9 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                      selectedDifficulty === key
                        ? 'bg-brand-sunset text-white shadow-md'
                        : 'bg-white/60 hover:bg-white text-brand-navy/75 border border-brand-navy/5'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid of badges */}
          {filteredItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/50 border border-brand-navy/5 rounded-[40px] p-12 text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-brand-navy/5 text-brand-navy/40 flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-brand-navy/65 font-semibold italic text-base leading-relaxed mb-6">
                {text.noResults}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                }}
                className="h-12 px-6 !rounded-xl text-[10px] uppercase font-black tracking-widest"
              >
                {lang === 'RU' 
                  ? 'Сбросить фильтры' 
                  : lang === 'GE' 
                    ? 'ფილტრების გასუფთავება' 
                    : lang === 'TR' 
                      ? 'Filtreleri Sıfırla' 
                      : 'Reset All Filters'}
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredItems.map((badge, idx) => {
                const IconComp = badge.icon;
                const isSunset = badge.color === 'sunset';
                const diffLabel = text.levels[badge.difficulty as keyof typeof text.levels] || badge.difficulty;
                const typeLabel = text.types[badge.type as keyof typeof text.types] || badge.type;

              return (
                <motion.div
                  key={`${badge.id || 'badge'}_${idx}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.6, type: "spring", damping: 20 }}
                  className="group relative"
                >
                  <Card className="p-6 sm:p-8 bg-white/70 hover:bg-white border-brand-navy/5 hover:border-brand-teal/20 hover:shadow-2xl transition-all duration-500 rounded-[38px] flex flex-col h-full relative overflow-hidden">
                    {/* Corner gradient glow decoration */}
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full pointer-events-none transition-opacity duration-500 opacity-[0.03] group-hover:opacity-[0.08] ${
                      isSunset ? 'bg-brand-sunset' : 'bg-brand-teal'
                    }`} />

                    {/* Header: badge representation + rewards */}
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 ${
                        isSunset 
                          ? 'bg-brand-sunset/10 text-brand-sunset shadow-brand-sunset/5 group-hover:bg-brand-sunset group-hover:text-white' 
                          : 'bg-brand-teal/10 text-brand-teal shadow-brand-teal/5 group-hover:bg-brand-teal group-hover:text-white'
                      }`}>
                        <IconComp className="w-7 h-7" />
                      </div>
                      
                      <div className="text-right">
                        <div className="text-[9px] font-black uppercase text-brand-navy/30 tracking-widest leading-none mb-1">
                          {text.xpReward}
                        </div>
                        <div className={`font-black italic text-xl leading-none ${isSunset ? 'text-brand-sunset' : 'text-brand-teal'}`}>
                          +{badge.xp} <span className="text-[10px] uppercase font-bold tracking-wider italic text-brand-navy/40">{text.points}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge details */}
                    <div className="mb-6 flex-1 text-left">
                      <h3 className="text-xl sm:text-2xl font-black italic uppercase text-brand-navy tracking-tight leading-none mb-3">
                        {badge.title}
                      </h3>
                      <p className="text-brand-navy/60 text-xs sm:text-sm leading-relaxed font-sans font-medium italic mb-6">
                        {badge.desc}
                      </p>

                      {/* Pill parameters */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-navy/5 text-[9px] font-black uppercase tracking-widest text-brand-navy/60">
                          <BookOpen className="w-3 h-3" />
                          <span>{text.category}: {typeLabel}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-navy/5 text-[9px] font-black uppercase tracking-widest text-brand-navy/60">
                          <TrendingUp className="w-3 h-3" />
                          <span>{text.difficulty}: {diffLabel}</span>
                        </span>
                      </div>

                      {/* Requirements */}
                      <div className="p-4 bg-brand-cream/60 rounded-2xl border border-brand-navy/5 mb-4 text-xs font-sans font-medium text-brand-navy/80 leading-relaxed text-left">
                        <strong className="block text-[10px] uppercase font-black tracking-widest text-brand-navy/50 leading-none mb-2">
                          🛡️ {text.requirements}
                        </strong>
                        {badge.req}
                      </div>

                      {/* Coaching Tip */}
                      <div className="p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10 text-xs font-sans font-medium text-brand-navy/70 leading-relaxed text-left">
                        <strong className="block text-[10px] uppercase font-black tracking-widest text-brand-teal leading-none mb-2">
                          ⚽ {text.coachingTip}
                        </strong>
                        {badge.tip}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
          )}

          {/* Core Call to action bottom */}
          <div className="mt-20 glass p-8 rounded-[48px] bg-white border border-brand-teal/15 shadow-xl text-center max-w-4xl mx-auto overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-teal to-brand-sunset" />
            <div className="relative z-10 max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black italic uppercase text-brand-navy leading-none mb-2">
                {lang === 'RU' ? 'ГОТОВЫ ЗАРАСПОРТОВАНИЮ?' : lang === 'GE' ? 'მზად ხართ საპასპორტოდ?' : 'Passport Level Milestones'}
              </h3>
              <p className="text-xs sm:text-sm text-brand-navy/50 leading-relaxed italic mb-6">
                {lang === 'RU' 
                  ? 'Собирайте уникальные значки на тренировках, чтобы поднять свой Спортивный Паспорт Juno до элитного уровня 2 и открыть привилегии.' 
                  : 'Earn accomplishments on the field to boost your Sport Passport and unlock verified master ranks.'}
              </p>
              <Button onClick={() => navigate('/register')} animatePulse className="h-14 px-8 !rounded-xl text-[10px] uppercase font-black tracking-widest shadow-teal">
                {lang === 'RU' ? 'Зарегистрироваться сейчас' : 'Start Your Journey'}
              </Button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <Footer lang={lang} onPortalClick={() => navigate('/portal')} />
    </div>
  );
}
