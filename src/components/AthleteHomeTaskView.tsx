import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Clock, 
  Sparkles, 
  BookOpen, 
  Dribbble
} from 'lucide-react';

interface AthleteHomeTaskViewProps {
  event: any; // The next event representing relevantInvitation
  athleteData: any; // Active student registration profile
  lang?: 'EN' | 'GE' | 'RU' | 'TR';
}

const TEXTS = {
  EN: {
    homeWorkout: "🏡 Active Homework",
    practicedBtn: "I Done This! Claim +15 XP 🔥",
    completedMsg: "Congratulations! Practiced & Completed!",
    xpAwarded: "+15 XP Added to your Academy Profile!",
    reps: "Sets & Reps",
    skills: "Target Skills",
    estimateTime: "Workout Time",
    howToPlay: "Step-by-step drills guide",
    motivation: "Practicing at home helps you unlock secret badges and level up faster!",
    levelVerified: "Level adaptation verified ✔"
  },
  RU: {
    homeWorkout: "🏡 Домашнее задание",
    practicedBtn: "Я потренировался! Получить +15 XP 🔥",
    completedMsg: "Поздравляем! Тренировка выполнена!",
    xpAwarded: "+15 XP добавлено в ваш профиль!",
    reps: "Повторения и подходы",
    skills: "Целевые навыки",
    estimateTime: "Время тренировки",
    howToPlay: "Пошаговое руководство",
    motivation: "Домашние тренировки помогают повышать уровень навыков быстрее!",
    levelVerified: "Для твоего уровня подготовки ✔"
  },
  GE: {
    homeWorkout: "🏡 სახლის აქტიური ვარჯიში",
    practicedBtn: "შევასრულე ვარჯიში! +15 XP მიღება 🔥",
    completedMsg: "გილოცავთ! ვარჯიში შესრულებულია!",
    xpAwarded: "+15 XP დაგერიცხათ პროფილზე!",
    reps: "გამეორებები",
    skills: "უნარები",
    estimateTime: "ვარჯიშის დრო",
    howToPlay: "ინსტრუქცია",
    motivation: "სახლში ვარჯიში დაგეხმარებათ საიდუმლო ბეიჯების გახსნაში და დონის სწრაფად ამაღლებაში!",
    levelVerified: "ადაპტირებულია თქვენს დონეზე ✔"
  },
  TR: {
    homeWorkout: "🏡 Aktif Ev Ödevi",
    practicedBtn: "Antrenmanı Tamamladım! +15 XP Al 🔥",
    completedMsg: "Tebrikler! Ev Antrenmanı Tamamlandı!",
    xpAwarded: "Profiline +15 XP Eklendi!",
    reps: "Setler & Tekrarlar",
    skills: "Hedef Beceriler",
    estimateTime: "Antrenman Süresi",
    howToPlay: "Detaylı Çalışma Rehberi",
    motivation: "Evde antrenman yapmak gizli rozetleri açmana ve daha hızlı seviye atlamana yardımcı olur!",
    levelVerified: "Seviye adaptasyonu doğrulandı ✔"
  }
};

const LOCALIZED_TASKS = {
  RU: {
    eliteTouch: {
      title: "🏡 Мастер элитного касания",
      description: "Обустройте узкий квадрат 1х1 метр. Катайте мяч подошвой, чередуйте с приемом внутренней стороной стопы и делайте развороты на 180 градусов вслепую. Поддерживайте высокую скорость касаний, регулярно проверяя пространство за плечом для визуального сканирования.",
      repetitions: "4 серии по 50 касаний на каждую ногу",
      levelMatchExplanation: "Фокус на быстром ведении мяча и когнитивном пространственном сканировании для подготовленных игроков.",
      targetSkills: ["Контроль мяча", "Сканирование пространства", "Быстрота ног"]
    },
    reactiveAgility: {
      title: "🏡 Реактивная ловкость и челночное ускорение",
      description: "Разложите 4 домашних предмета в радиусе 2.5 метров, присвоив каждому номер. Делайте касания мяча стопой поочередно в центре; когда называется номер или звучит сигнал таймера, резко сделайте приставной шаг в сторону, коснитесь предмета и спиной вперед вернитесь к мячу.",
      repetitions: "3 раунда по 2 минуты непрерывно",
      levelMatchExplanation: "Взрывное разнонаправленное ускорение для оптимизации профессиональной скорости реакции под нагрузкой.",
      targetSkills: ["Короткая ловкость", "Триггер реакции", "Координация"]
    },
    airCushion: {
      title: "🏡 Челлендж удержания мяча в воздухе",
      description: "Жонглируйте мячом, используя стопы, бедра и грудь. На каждое 5-е касание отправляйте мяч выше головы и плавно гасите его опускание подъемом стопы или бедром, не допуская лишних отскоков.",
      repetitions: "Выполните 3 чистых раунда без падения мяча",
      levelMatchExplanation: "Развивает самообладание, координацию на высоте и точность движений под давлением времени.",
      targetSkills: ["Мастерство в воздухе", "Мягкий прием", "Проприоцепция"]
    },
    instepPivot: {
      title: "🏡 Прием и разворот стопой",
      description: "Найдите ровную стену. Направьте пас в стену, примите мяч правой ногой, прокатите вбок подошвой, затем сделайте пас левой ногой обратно в стену. Отрабатывайте детали приема мяча.",
      repetitions: "5 серий по 20 повторений пас-прием",
      levelMatchExplanation: "Обеспечивает игрокам среднего уровня структурированную мышечную память и симметричное ведение.",
      targetSkills: ["Точность паса", "Инстинкт приема", "Координация ног"]
    },
    coneDribble: {
      title: "🏡 Челночный спринт с ведением вокруг фишек",
      description: "Установите два ориентира на расстоянии 5 метров друг от друга. Быстро ведите мяч к ориентиру, сделайте резкий уход назад подошвой стопы, вернитесь обратно под контролем и завершите перешагиванием.",
      repetitions: "6 высокоинтенсивных челночных интервалов",
      levelMatchExplanation: "Развивает контроль мяча и быструю смену направлений в ограниченном пространстве для игроков среднего уровня.",
      targetSkills: ["Ведение вплотную", "Уход подошвой", "Маневренность"]
    },
    precisionSniper: {
      title: "🏡 Снайперская точность по бутылкам",
      description: "Обведите мяч вокруг стула дважды, затем поднимите голову и сделайте точную низкую передачу щечкой, чтобы сбить бутылку с водой на расстоянии 4 метров.",
      repetitions: "Сбейте 10 мишеней для выполнения дневной серии",
      levelMatchExplanation: "Повышает концентрацию и точность паса.",
      targetSkills: ["Точность удара", "Пространственное зрение", "Координация поворота"]
    },
    rookieBalance: {
      title: "🏡 Базовый баланс новичка",
      description: "Встаньте на одну ногу и удерживайте равновесие. Мягко касайтесь верхней части футбольного мяча подошвой, медленно меняя ноги. Сохраняйте ровное положение тела и контролируйте мяч на месте.",
      repetitions: "3 серии по 15 поочередных касаний стопой",
      levelMatchExplanation: "Развивает базовый баланс, стабильность ног и начальное ощущение мяча для новичков.",
      targetSkills: ["Баланс", "Тактильное ощущение", "Уверенность"]
    },
    tickTock: {
      title: "🏡 Тропинка тик-так",
      description: "Начертите прямую линию длиной 3 метра. Медленно идите по тропинке, аккуратно щелкая мяч внутренней стороной стоп друг другу («тик-так»). Старайтесь сделать не менее 15 мягких касаний до конца линии!",
      repetitions: "Медленно пройдите по линии 5 раз туда и обратно",
      levelMatchExplanation: "Развивает ощущение мягкого мышечного касания и ритмичное движение с мячом для начинающих.",
      targetSkills: ["Внутренние касания", "Ритм", "Симметричный контроль"]
    },
    helperToss: {
      title: "🏡 Мягкий наброс от помощника",
      description: "Занимайтесь вместе с родителем или братом на расстоянии 2 метров. Помощник аккуратно набрасывает вам мяч в ноги, а вы мягко принимаете его и пасуете внутренней стороной стопы прямо в руки.",
      repetitions: "Всего 20 точных набросов подряд",
      levelMatchExplanation: "Стимулирует координацию ребенка и родителя и обучает базовому приему мяча в игровой форме.",
      targetSkills: ["Смягчение мяча", "Взаимодействие", "Концентрация"]
    }
  },
  GE: {
    eliteTouch: {
      title: "🏡 ელიტური შეხების ილეთი",
      description: "მოაწყვეთ 1x1 მეტრიანი კვადრატი. აკონტროლეთ ბურთი ფეხის გულის ტრიალით, მონაცვლეობით და გააკეთეთ 180 გრადუსიანი ბრმა ბრუნები. შეინარჩუნეთ მაღალი ინტენსივობის სიჩქარე, რათა განავითაროთ კოორდინაციათა მართვა.",
      repetitions: "4 სერია 50 შეხებით თითოეულ ფეხზე",
      levelMatchExplanation: "ბურთის სწრაფი მანიპულირება და სივრცითი ორიენტაცია მოწინავე მოთამაშეებისათვის.",
      targetSkills: ["ბურთის კონტროლი", "ხედვის არეალი", "სისწრაფე"]
    },
    reactiveAgility: {
      title: "🏡 რეაქტიული სისწრაფე და აჩქარება",
      description: "მოათავსეთ 4 საყოფაცხოვრებო ნივთი 2.5 მეტრის რადიუსში. დანიშნეთ ნომრები და სწრაფად შეეხეთ მათ სიგნალზე, შემდეგ დაბრუნდით ბურთთან.",
      repetitions: "3 რაუნდი 2 წუთის განმავლობაში",
      levelMatchExplanation: "ფეთქებადი აჩქარება რეაქციის სისწრაფის გასაუმჯობესებლად.",
      targetSkills: ["სისწრაფე", "რეაქცია", "კორდინაცია"]
    },
    airCushion: {
      title: "🏡 ჟონგლირება და კონტროლი ჰაერში",
      description: "ააგდეთ ბურთი მაღლა და მიიღეთ იგი რბილად მიწაზე დაუშვებლად.",
      repetitions: "3 სუფთა ციკლი ბურთის დაცემის გარეშე",
      levelMatchExplanation: "ავითარებს ბურთის ფლობას და კოორდინაციას დროის წნეხის ქვეშ.",
      targetSkills: ["ჰაერში მართვა", "ბურთის მიღება", "ბალანსი"]
    },
    instepPivot: {
      title: "🏡 შიდა კონტროლი და ბრუნი",
      description: "იპოვნეთ ბრტყელი კედელი. გადაეცით ბურთი კედელს, მიიღეთ იგი მარჯვენა ფეხით, გადააგორეთ ფეხის გულით, შემდეგ მარცხენა ფეხით დააბრუნეთ კედელთან.",
      repetitions: "5 სერია 20 გამეორებით",
      levelMatchExplanation: "უზრუნველყოფს საშუალო დონის მოთამაშეებისათვის ტექნიკურ მეხსიერებას.",
      targetSkills: ["კედლის პასი", "მიღების ალღო", "სიმეტრიული მართვა"]
    },
    coneDribble: {
      title: "🏡 დრიბლინგის შატლ სპრინტი",
      description: "მოათავსეთ ორი მარკერი 5 მეტრის დაშორებით. გააკეთეთ სწრაფი დრიბლინგი მარკერისკენ, შეცვალეთ მიმართულება და დაბრუნდით უკან.",
      repetitions: "6 მაღალი ინტენსივობის ინტერვალი",
      levelMatchExplanation: "ავითარებს ბურთის მჭიდრო კონტროლს და მიმართულების სწრაფ ცვლილებას.",
      targetSkills: ["მჭიდრო დრიბლინგი", "ფეხის გულით წამოღება", "სისწრაფე"]
    },
    precisionSniper: {
      title: "🏡 ბოთლის მიზანში დარტყმის გამოწვევა",
      description: "ბურთის კონტროლი სკამის გარშემო ორჯერ, შემდეგ ზუსტი დარტყმით წააქციეთ 4 მეტრში მდგარი ბოთლი.",
      repetitions: "10 პირდაპირი დარტყმა დასასრულებლად",
      levelMatchExplanation: "ავითარებს მიზანში ზუსტ დარტყმას სახალისო სცენარით.",
      targetSkills: ["ზუსტი დარტყმა", "ხედვის არეალი", "კორდინაცია"]
    },
    rookieBalance: {
      title: "🏡 დამწყების ბალანსი და წონასწორობა",
      description: "დადექით ცალ ფეხზე და შეინარჩუნეთ წონასწორობა. მსუბუქად შეეხეთ ბურთის ზედა ნაწილს ფეხის გულით, ნელა შეცვალეთ ფეხები.",
      repetitions: "3 სერია 15 მონაცვლეობითი შეხებით",
      levelMatchExplanation: "ავითარებს ძირითად ბალანსს და ფეხის სტაბილურობას დამწყებთათვის.",
      targetSkills: ["ბალანსი", "ტაქტილური შეხება", "თვითდაჯერებულობა"]
    },
    tickTock: {
      title: "🏡 ტიკ-ტაკ ბილიკი",
      description: "გავავლოთ 3-მეტრიანი სწორი ხაზი. იარეთ ნელა ბილიკზე ბურთის მსუბუქი შეხებით ფეხებს შორის.",
      repetitions: "5-ჯერ წინ და უკან ნელა",
      levelMatchExplanation: "ავითარებს ფეხის შიდა ნაწილის მსუბუქ შეხებას და რიტმს დამწყებთათვის.",
      targetSkills: ["შიდა შეხებათი მართვა", "რიტმი", "სიმეტრიული კონტროლი"]
    },
    helperToss: {
      title: "🏡 მშობლის ან დამხმარეს მოწოდება",
      description: "წყვილში მუშაობა 2 მეტრის დაშორებით. პარტნიორი გაწვდის ბურთს, თქვენ კი მსუბუქად უბრუნებთ მას ხელში.",
      repetitions: "20 კოოპერაციული გადაცემა",
      levelMatchExplanation: "ავითარებს მშობლისა და სპორტსმენის კოორდინაციას.",
      targetSkills: ["დარტყმის შერბილება", "თანაგუნდელობა", "კონცენტრაცია"]
    }
  },
  TR: {
    eliteTouch: {
      title: "🏡 Elit Temas Ustası",
      description: "Dar bir 1x1 metre alanda topu ayak tabanınızla yönlendirin. Top kontrolünü ve dönüş hızınızı arttırmak için antrenman yapın.",
      repetitions: "Her bacak için 50 dokunuştan 4 set",
      levelMatchExplanation: "İleri düzey oyuncular için yüksek hızlı top manipülasyonu ve mekansal farkındalık.",
      targetSkills: ["Top Kontrolü", "Göz Taraması", "Ayak Hızı"]
    },
    reactiveAgility: {
      title: "🏡 Reaktif Çeviklik Çalışması",
      description: "Etrafınıza 4 nesne yerleştirin. Sinyal geldiğinde en hızlı şekilde ilgili nesneye dokunup merkeze dönün.",
      repetitions: "2 dakikalık 3 tur",
      levelMatchExplanation: "Profesyonel reaksiyon hızını artırmaya yönelik çeviklik çalışması.",
      targetSkills: ["Kısa Mesafe Çeviklik", "Reaksiyon", "Koordinasyon"]
    },
    airCushion: {
      title: "🏡 Hava Hakimiyeti Ödevi",
      description: "Topu havaya dikin ve yere düşürmeden yumuşak bir dokunuşla kontrol edin.",
      repetitions: "Düşürmeden 3 temiz tur",
      levelMatchExplanation: "Zaman baskısı altında yüksek koordinasyon ve sakinlik geliştirir.",
      targetSkills: ["Hava Hakimiyeti", "Kuş tüyü kontrol", "Denge"]
    },
    instepPivot: {
      title: "🏡 İç Kontrol ve Ayak İçi Pas",
      description: "Düz bir duvar bulun. Duvara pas atın, sağ ayağınızla kontrol edip yana yuvarlayın, ardından sol ayağınızla duvara geri pas atın.",
      repetitions: "5 set 20 tekrar pas-kontrol",
      levelMatchExplanation: "Orta seviye oyuncular için yüksek kaliteli teknik kas hafızası sunar.",
      targetSkills: ["Duvar Pas İsabeti", "Top Alma İçgüdüsü", "Çift Ayak Yönetimi"]
    },
    coneDribble: {
      title: "🏡 Koni Driblingi",
      description: "5 metre arayla iki işaretçi yerleştirin. İşaretçiye hızlıca top sürün, ani bir çekme hareketi yapıp başlangıca dönün.",
      repetitions: "6 yüksek yoğunluklu interval",
      levelMatchExplanation: "Dar alanda top kontrolü ve yön değişimlerini geliştirir.",
      targetSkills: ["Yakın Dribling", "Taban Çekme", "Çevik Dönüşler"]
    },
    precisionSniper: {
      title: "🏡 Hassas Şişe Vurma Mücadelesi",
      description: "Topu bir sandalyenin etrafında iki kez sürün, ardından kafanızı kaldırıp 4 metre uzaklıktaki su şişesini vurmaya çalışın.",
      repetitions: "10 hedef isabeti",
      levelMatchExplanation: "Enfes bir oyun tasarımı ile hedefe odaklanmayı ve pas isabetini artırır.",
      targetSkills: ["Keskin Nişancılık", "Görüş Taraması", "Dönüş Koordinasyonu"]
    },
    rookieBalance: {
      title: "🏡 Rookie Temel Dengesi",
      description: "Tek ayak üzerinde dengede durun. Ayak tabanınızla topun üstüne hafifçe dokunup ayak değiştirin.",
      repetitions: "3 set 15 dokunuş (alternatif)",
      levelMatchExplanation: "Başlangıç seviyesindeki oyuncular için denge ve ayak-top hissi oluşturur.",
      targetSkills: ["Denge", "Taban Temas Hissi", "Özgüven"]
    },
    tickTock: {
      title: "🏡 Tik-Tak Pas Yolu",
      description: "3 metrelik düz bir hat çizin. Topu ayak içlerinizle birbirine çarptırarak (tik-tak) yavaşça bu yolda ilerleyin.",
      repetitions: "Yolda yavaşça 5 kez git-gel",
      levelMatchExplanation: "Yumuşak kas teması ve ritmik ilerleme sağlar.",
      targetSkills: ["Hafif İç Dokunuşlar", "Ritmik Hareket", "Simetrik Kontrol"]
    },
    helperToss: {
      title: "🏡 Yardımcı ile Top Kabulü",
      description: "2 metre mesafedeki bir aile üyesiyle çalışın. Size yumuşakça havadan pas atsınlar, siz de kontrol edip ayak içiyle geri ulaştırın.",
      repetitions: "Toplam 20 pas-kabul",
      levelMatchExplanation: "Aile üyesi ve sporcu koordinasyonunu destekler, yumuşak kontrolü öğretir.",
      targetSkills: ["Topu Yumuşatma", "Veli-Sporcu Uyum", "Konsantrasyon"]
    }
  }
};

export default function AthleteHomeTaskView({ event, athleteData, lang = 'RU' }: AthleteHomeTaskViewProps) {
  const t = TEXTS[lang as keyof typeof TEXTS] || TEXTS.RU;

  if (!event || !event.homeTask || !athleteData) return null;

  // Localized task override for backwards compatibility with previously saved English tasks
  const getLocalizedTask = (originalTask: any, currentLang: string) => {
    if (!originalTask) return null;
    const l = currentLang as 'EN' | 'GE' | 'RU' | 'TR';
    if (l === 'EN') return originalTask;

    const dict = LOCALIZED_TASKS[l as keyof typeof LOCALIZED_TASKS];
    if (!dict) return originalTask;

    const titleLower = (originalTask.title || "").toLowerCase();
    
    let key: keyof typeof dict | null = null;
    if (titleLower.includes("elite touch")) key = "eliteTouch";
    else if (titleLower.includes("reactive agility")) key = "reactiveAgility";
    else if (titleLower.includes("air cushion")) key = "airCushion";
    else if (titleLower.includes("instep control") || titleLower.includes("instep pivot")) key = "instepPivot";
    else if (titleLower.includes("cone dribble")) key = "coneDribble";
    else if (titleLower.includes("precision bottle") || titleLower.includes("precision sniper")) key = "precisionSniper";
    else if (titleLower.includes("rookie base balance") || titleLower.includes("rookie balance")) key = "rookieBalance";
    else if (titleLower.includes("tick-tock")) key = "tickTock";
    else if (titleLower.includes("helper's soft toss") || titleLower.includes("helper's soft")) key = "helperToss";

    if (key && dict[key]) {
      return {
        ...originalTask,
        title: dict[key].title,
        description: dict[key].description,
        repetitions: dict[key].repetitions,
        levelMatchExplanation: dict[key].levelMatchExplanation,
        targetSkills: dict[key].targetSkills
      };
    }
    return originalTask;
  };

  const task = getLocalizedTask(event.homeTask, lang) || event.homeTask;

  return (
    <motion.section 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 relative z-10 font-sans"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-1.5 h-6 bg-brand-sunset rounded-full animate-pulse" />
        <h3 className="text-sm font-black uppercase tracking-widest italic text-brand-navy">{t.homeWorkout}</h3>
      </div>

      <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[40px] shadow-xl text-brand-navy border border-brand-teal/20 relative overflow-hidden">
        {/* Background Sparkles Grid decorator */}
        <div className="absolute top-0 right-0 p-6 text-brand-teal opacity-5 pointer-events-none">
          <Dribbble className="w-24 h-24 animate-spin-slow" />
        </div>

        <h4 className="font-black italic uppercase text-lg sm:text-2xl md:text-3xl tracking-tight leading-tight text-brand-navy mb-3">
          {task.title}
        </h4>

        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 mt-4">
          <div className="p-3 bg-brand-cream/30 rounded-xl border border-brand-teal/10">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-brand-navy/60 block mb-1">
              {t.estimateTime}
            </span>
            <span className="text-xs sm:text-sm font-black italic text-brand-teal flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              {task.durationMins} мин
            </span>
          </div>

          <div className="p-3 bg-brand-cream/30 rounded-xl border border-brand-teal/10 col-span-2">
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-brand-navy/60 block mb-1">
              {t.reps}
            </span>
            <span className="text-[11px] sm:text-xs font-bold italic text-brand-navy flex items-center gap-1.5 truncate">
              <Zap className="w-3.5 h-3.5 text-brand-sunset shrink-0" />
              {task.repetitions}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-brand-cream/10 rounded-2xl border border-brand-teal/10 animate-fade-in">
            <p className="text-[9px] font-black uppercase text-brand-teal tracking-[0.2em] mb-2 italic flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              {t.howToPlay}
            </p>
            <p className="text-xs sm:text-[13px] font-medium leading-relaxed italic text-brand-charcoal pl-1">
              {task.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 py-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-navy/40 italic">
              {t.skills}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(task.targetSkills || []).map((skill: string, idx: number) => (
                <span key={idx} className="bg-brand-teal/10 text-brand-teal font-black text-[8px] sm:text-[9px] uppercase tracking-wider px-2.5 py-0.5 rounded-lg italic">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {task.levelMatchExplanation && (
            <p className="text-[9.5px] text-brand-navy/50 font-bold italic leading-relaxed pt-2 border-t border-brand-teal/10 flex items-center gap-2">
              💡 {task.levelMatchExplanation}
            </p>
          )}

          {/* Recommendation Note instead of Action Button */}
          <div className="pt-4 mt-3 border-t border-brand-teal/10">
            <div className="p-4 rounded-xl bg-brand-teal/5 border border-brand-teal/15 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black italic uppercase tracking-wider text-brand-teal mb-1">
                  {lang === 'RU' ? 'Рекомендовано' : lang === 'GE' ? 'რეკომენდებულია' : lang === 'TR' ? 'Tavsiye Edilen' : 'Highly Recommended'}
                </p>
                <p className="text-[11px] font-bold text-brand-navy/70 leading-relaxed italic">
                  {t.motivation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
