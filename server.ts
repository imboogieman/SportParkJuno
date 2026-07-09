import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import twilio from "twilio";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';
import { GoogleGenAI, Type } from "@google/genai";

// Lazy-initialize Gemini securely
let aiInstance: any = null;
function getGeminiClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Lazy-initialize Firebase Firestore securely
let dbInstance: any = null;

function getFirestoreDb() {
  if (!dbInstance) {
    try {
      const firebaseConfigPath = path.join(process.cwd(), 'firebase-applet-config.json');
      if (!fs.existsSync(firebaseConfigPath)) {
        throw new Error(`Firebase config file not found at ${firebaseConfigPath}`);
      }
      const firebaseConfigContent = fs.readFileSync(firebaseConfigPath, 'utf-8');
      const firebaseConfig = JSON.parse(firebaseConfigContent);
      
      if (!firebaseConfig || !firebaseConfig.apiKey) {
        throw new Error("Firebase config is invalid or missing apiKey close");
      }
      
      const firebaseApp = initializeApp(firebaseConfig);
      dbInstance = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
      console.log("Firebase initialized successfully on backend.");
    } catch (err: any) {
      console.error("Firebase lazy-initialization error:", err);
      throw err;
    }
  }
  return dbInstance;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending invitations
  app.post("/api/invitations", async (req, res) => {
    try {
      const { invitations } = req.body;
      
      if (!invitations || !Array.isArray(invitations)) {
        return res.status(400).json({ error: "Invalid invitations data" });
      }

      const db = getFirestoreDb();
      if (!db) {
        return res.status(500).json({ error: "Database setup failed. Unable to save invitations." });
      }

      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

      const client = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;

      const results = [];

      for (const inv of invitations) {
        const { eventId, studentId, studentName, studentPhone, masterId, eventDetails } = inv;

        // 1. Save to Firestore
        const docRef = await addDoc(collection(db, 'invitations'), {
          eventId,
          studentId,
          studentName,
          studentPhone,
          status: 'pending',
          masterId,
          createdAt: serverTimestamp()
        });

        // 2. Send SMS
        let smsSent = false;
        let smsError = null;

        if (client && twilioFrom && studentPhone) {
          try {
            // Basic E.164 check - ensures it starts with +
            const formattedPhone = studentPhone.startsWith('+') ? studentPhone : `+${studentPhone.replace(/\D/g, '')}`;
            
            const message = `Sport Park Juno: ${studentName} invited to ${eventDetails.name} on ${eventDetails.date} @ ${eventDetails.startTime}. Location: ${eventDetails.location}. Confirm in app: ${process.env.APP_URL || 'https://ais-dev.europe-west2.run.app'}`;
            
            console.log(`Sending SMS to ${formattedPhone}...`);
            await client.messages.create({
              body: message,
              from: twilioFrom,
              to: formattedPhone
            });
            smsSent = true;
          } catch (err: any) {
            console.error(`Twilio Error for ${studentPhone}:`, err.message);
            smsError = err.message;
          }
        } else {
          smsError = !client ? "Twilio credentials missing" : "Twilio phone or student phone missing";
        }

        results.push({ id: docRef.id, studentName, smsSent, smsError });
      }

      res.json({ success: true, results });
    } catch (err: any) {
      console.error("Invitation Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // API Route for AI-generated home task recommendations
  app.post("/api/gemini/generate-home-tasks", async (req, res) => {
    try {
      const { exercises, athleteLevel, lang } = req.body;
      const level = athleteLevel || "Rookie";
      const exerciseNames = exercises && exercises.length > 0
        ? exercises.map((e: any) => e.name)
        : ["Ball Control Fundamentals"];

      const languageMap: Record<string, string> = {
        'RU': 'Russian',
        'GE': 'Georgian',
        'TR': 'Turkish',
        'EN': 'English'
      };
      const requestedLangName = languageMap[lang as string] || 'Russian';

      const hasApiKey = !!process.env.GEMINI_API_KEY;

      // Define highly personalized premium fallback generators tailored to athlete levels
      let fallbackTasks: any[] = [];
        if (level.toLowerCase().includes("pro") || level.toLowerCase().includes("advanced") || level.toLowerCase().includes("star")) {
          if (lang === 'RU') {
            fallbackTasks = [
              {
                title: `Мастер элитного касания: Адаптация ${exerciseNames[0]}`,
                description: `Обустройте узкий квадрат 1х1 метр. Катайте мяч подошвой, чередуйте с приемом внутренней стороной стопы и делайте развороты на 180 градусов вслепую. Поддерживайте высокую скорость касаний, проверяя пространство за плечом для визуального сканирования, повторяя упражнение "${exerciseNames[0] || 'наши упражнения'}".`,
                durationMins: 15,
                repetitions: "4 серии по 50 касаний на каждую ногу",
                targetSkills: ["Контроль мяча", "Сканирование пространства", "Быстрота ног"],
                levelMatchExplanation: "Фокус на быстром ведении мяча и когнитивном пространственном сканировании для подготовленных игроков."
              },
              {
                title: "Реактивная ловкость и челночное ускорение",
                description: "Разложите 4 домашних предмета в радиусе 2.5 метров, присвоив каждому номер. Делайте касания мяча стопой поочередно в центре; когда называется номер или звучит сигнал таймера, резко сделайте приставной шаг в сторону, коснитесь предмета и спиной вперед вернитесь к мячу.",
                durationMins: 12,
                repetitions: "3 раунда по 2 минуты непрерывно",
                targetSkills: ["Короткая ловкость", "Триггер реакции", "Координация"],
                levelMatchExplanation: "Взрывное разнонаправленное ускорение для оптимизации профессиональной скорости реакции под нагрузкой."
              },
              {
                title: "Челендж удержания мяча в воздухе",
                description: "Жонглируйте мячом, используя стопы, бедра и грудь. На каждое 5-е касание отправляйте мяч выше головы и плавно гасите его опускание подъемом стопы или бедром, не допуская лишних отскоков.",
                durationMins: 10,
                repetitions: "Выполните 3 чистых раунда без падения мяча",
                targetSkills: ["Мастерство в воздухе", "Мягкий прием", "Проприоцепция"],
                levelMatchExplanation: "Развивает самообладание, координацию на высоте и точность движений под давлением времени."
              }
            ];
          } else if (lang === 'GE') {
            fallbackTasks = [
              {
                title: `Elite Touch Master: ${exerciseNames[0]} ადაპტაცია`,
                description: `მოაწყვეთ 1x1 მეტრიანი კვადრატი. აკონტროლეთ ბურთი ფეხის გულის ტრიალით, მონაცვლეობით და გააკეთეთ 180 გრადუსიანი ბრმა ბრუნები. შეინარჩუნეთ მაღალი ინტენსივობის სიჩქარე, რათა განავითაროთ კოორდინაციათა მართვა.`,
                durationMins: 15,
                repetitions: "4 სერია 50 შეხებით თითოეულ ფეხზე",
                targetSkills: ["ბურთის კონტროლი", "მხედველობა", "სისწრაფე"],
                levelMatchExplanation: "ბურთის სწრაფი მანიპულირება და სივრცითი ორიენტაცია მოწინავე მოთამაშეებისათვის."
              },
              {
                title: "რეაქტიული სისწრაფე",
                description: "მოათავსეთ 4 საყოფაცხოვრებო ნივთი 2.5 მეტრის რადიუსში. დანიშნეთ ნომრები და სწრაფად შეეხეთ მათ სიგნალზე.",
                durationMins: 12,
                repetitions: "3 რაუნდი 2 წუთის განმავლობაში",
                targetSkills: ["სისწრაფე", "რეაქცია", "კომუნიკაცია"],
                levelMatchExplanation: "ფეთქებადი აჩქარება რეაქციის სისწრაფის გასაუმჯობესებლად."
              },
              {
                title: "ჟონგლირება და კონტროლი",
                description: "ააგდეთ ბურთი მაღლა და მიიღეთ იგი რბილად მიწაზე დაუშვებლად.",
                durationMins: 10,
                repetitions: "3 სუფთა ციკლი ბურთის დაცემის გარეშე",
                targetSkills: ["ჰაერში მართვა", "ბურთის მიღება", "ბალანსი"],
                levelMatchExplanation: "ავითარებს ბურთის ფლობას და კოორდინაციას დროის წნეხის ქვეშ."
              }
            ];
          } else if (lang === 'TR') {
            fallbackTasks = [
              {
                title: `Elit Temas Ustası: ${exerciseNames[0]} Adaptasyonu`,
                description: `Dar bir alanda topu ayak tabanınızla yönlendirin. Top kontrolünü ve dönüş hızınızı arttırmak için antrenman yapın.`,
                durationMins: 15,
                repetitions: "Her bacak için 50 dokunuştan 4 set",
                targetSkills: ["Top Kontrolü", "Göz Taraması", "Ayak Hızı"],
                levelMatchExplanation: "İleri düzey oyuncular için yüksek hızlı top manipülasyonu ve mekansal farkındalık."
              },
              {
                title: "Reaktif Çeviklik ve Kısa Sürat",
                description: "Etrafınıza 4 nesne yerleştirin. Sinyal geldiğinde en hızlı şekilde ilgili nesneye dokunup merkeze dönün.",
                durationMins: 12,
                repetitions: "2 dakikalık 3 tur",
                targetSkills: ["Kısa Mesafe Çeviklik", "Reaksiyon", "Koordinasyon"],
                levelMatchExplanation: "Profesyonel reaksiyon hızını artırmaya yönelik çeviklik çalışması."
              },
              {
                title: "Havadan Gelen Topu Yumuşatma",
                description: "Topu havaya dikin ve yere düşürmeden yumuşak bir dokunuşla kontrol edin.",
                durationMins: 10,
                repetitions: "Düşürmeden 3 temiz tur",
                targetSkills: ["Hava Hakimiyeti", "Kuş tüyü kontrol", "Denge"],
                levelMatchExplanation: "Zaman baskısı altında yüksek koordinasyon ve sakinlik geliştirir."
              }
            ];
          } else {
            fallbackTasks = [
              {
                title: `Elite Touch Master: ${exerciseNames[0]} Special`,
                description: `Set up a tight 1x1 meter square. Tap the ball with sole rolls, alternate with instep cushions, and execute 180-degree blind turns. Maintain high-intensity speed while checking over your shoulder for cognitive tracking, mirroring "${exerciseNames[0] || 'our drills'}".`,
                durationMins: 15,
                repetitions: "4 sets of 50 touches per leg",
                targetSkills: ["Elite Ball Control", "Shoulder Scanning", "Footwork Speed"],
                levelMatchExplanation: "Targeted focus on high speed ball manipulation and cognitive spatial awareness for advanced players."
              },
              {
                title: "Reactive Agility & Shuttle Acceleration",
                description: "Scatter 4 household items in a 2.5-meter radius, assigning each a number. Tap toes on the ball in the center; when a number is called or timer beep sounds, break into a side-step, touch the item, and sprint backwards to reclaim the ball structure.",
                durationMins: 12,
                repetitions: "3 rounds of 2 minutes continuous",
                targetSkills: ["Short Agility", "Reaction Trigger", "Nervous System Sync"],
                levelMatchExplanation: "Explosive multi-directional acceleration to optimize professional reaction speeds under metabolic load."
              },
              {
                title: "Air Cushion 'Keep-Up' Drill",
                description: "Juggle the ball utilizing feet, knees and chest. On every 5th touch, flick the ball higher than head level and cushion the downward impact smoothly on your instep or thigh with no extra bounces allowed.",
                durationMins: 10,
                repetitions: "Complete 3 clean round cycles without dropping the ball",
                targetSkills: ["Aerial Mastery", "Cushion Control", "Proprioception"],
                levelMatchExplanation: "Develops supreme composure, high-altitude coordination, and micro-adjustments under timing pressure."
              }
            ];
          }
        } else if (level.toLowerCase().includes("baller") || level.toLowerCase().includes("player")) {
          if (lang === 'RU') {
            fallbackTasks = [
              {
                title: `Прием и разворот стопой: ведение ${exerciseNames[0]}`,
                description: `Найдите ровную стену. Направьте пас в стену, примите мяч правой ногой, прокатите вбок подошвой, затем сделайте пас левой ногой обратно в стену. Отрабатывайте детали приема мяча как на тренировке "${exerciseNames[0] || 'наши упражнения'}".`,
                durationMins: 12,
                repetitions: "5 серий по 20 повторений пас-прием",
                targetSkills: ["Точность паса в стену", "Инстинкт приема", "Координация обеих ног"],
                levelMatchExplanation: "Обеспечивает игрокам среднего уровня структурированную мышечную память и симметричное ведение."
              },
              {
                title: "Челночный спринт с ведением вокруг фишек",
                description: "Установите два ориентира на расстоянии 5 метров друг от друга. Быстро ведите мяч к ориентиру, сделайте резкий уход назад подошвой стопы, вернитесь обратно под контролем и завершите перешагиванием.",
                durationMins: 10,
                repetitions: "6 высокоинтенсивных челночных интервалов",
                targetSkills: ["Ведение вплотную", "Уход подошвой", "Маневренность"],
                levelMatchExplanation: "Развивает контроль мяча и быструю смену направлений в ограниченном пространстве для игроков среднего уровня."
              },
              {
                title: "Снайперская точность по бутылкам",
                description: "Обведите мяч вокруг стула дважды, затем поднимите голову и сделайте точную низкую передачу щечкой, чтобы сбить бутылку с водой на расстоянии 4 метров.",
                durationMins: 10,
                repetitions: "Сбейте 10 мишеней для выполнения дневной серии",
                targetSkills: ["Снайперская точность", "Визуальное сканирование", "Координация разворота"],
                levelMatchExplanation: "Повышает концентрацию и точность паса в игровой манере для юных футболистов."
              }
            ];
          } else if (lang === 'GE') {
            fallbackTasks = [
              {
                title: `შიდა კონტროლი და ბრუნი: ${exerciseNames[0]} პრაქტიკა`,
                description: `იპოვნეთ ბრტყელი კედელი. გადაეციც ბურთი კედელს, მიიღეთ იგი მარჯვენა ფეხით, გადააგორეთ ფეხის გულით, შემდეგ მარცხენა ფეხით დააბრუნეთ კედელთან. ივარჯიშეთ ტექნიკაზე "${exerciseNames[0] || 'ჩვენი ვარჯიშები'}".`,
                durationMins: 12,
                repetitions: "5 სერია 20 გამეორებით",
                targetSkills: ["კედლის პასი", "მიღების ალღო", "სიმეტრიული მართვა"],
                levelMatchExplanation: "უზრუნველყოფს საშუალო დონის მოთამაშეებისათვის ტექნიკურ მეხსიერებას."
              },
              {
                title: "დრიბლინგის შატლ სპრინტი",
                description: "მოათავსეთ ორი მარკერი 5 მეტრის დაშორებით. გააკეთეთ სწრაფი დრიბლინგი მარკერისკენ, შეცვალეთ მიმართულება ფეხის გულით და დაბრუნდით უკან.",
                durationMins: 10,
                repetitions: "6 მაღალი ინტენსივობის ინტერვალი",
                targetSkills: ["მჭიდრო დრიბლინგი", "ფეხის გულით წამოღება", "სისწრაფე"],
                levelMatchExplanation: "ავითარებს ბურთის მჭიდრო კონტროლს და მიმართulების სწრაფ ცვლილებას."
              },
              {
                title: "ბოთლის მიზანში დარტყმის გამოწვევა",
                description: "ბურთის კონტროლი სკამის გარშემო ორჯერ, შემდეგ ზუსტი დარტყმით წააქციეთ 4 მეტრში მდგარი ბოთლი.",
                durationMins: 10,
                repetitions: "10 პირდაპირი დარტყმა დასასრულებლად",
                targetSkills: ["ზუსტი დარტყმა", "ხედვის არეალი", "კორდინაცია"],
                levelMatchExplanation: "ავითარებს მიზანში ზუსტ დარტყმას სახალისო სცენარით."
              }
            ];
          } else if (lang === 'TR') {
            fallbackTasks = [
              {
                title: `İç Kontrol ve Ayak İçi Pas: ${exerciseNames[0]} Çalışması`,
                description: `Düz bir duvar bulun. Duvara pas atın, sağ ayağınızla kontrol edip yana yuvarlayın, ardından sol ayağınızla duvara geri pas atın. "${exerciseNames[0] || 'egzersizlerimizle'}" uyumlu çalışın.`,
                durationMins: 12,
                repetitions: "5 set 20 tekrar pas-kontrol",
                targetSkills: ["Duvar Pas İsabeti", "Top Alma İçgüdüsü", "Çift Ayak Yönetimi"],
                levelMatchExplanation: "Orta seviye oyuncular için yüksek kaliteli teknik kas hafızası sunar."
              },
              {
                title: "Koni Driblingi",
                description: "5 metre arayla iki işaretçi yerleştirin. İşaretçiye hızlıca top sürün, ani bir çekme hareketi yapıp başlangıca dönün.",
                durationMins: 10,
                repetitions: "6 yüksek yoğunluklu interval",
                targetSkills: ["Yakın Dribling", "Taban Çekme", "Çevik Dönüşler"],
                levelMatchExplanation: "Dar alanda top kontrolü ve yön değişimlerini geliştirir."
              },
              {
                title: "Hassas Şişe Vurma Mücadelesi",
                description: "Topu bir sandalyenin etrafında iki kez sürün, ardından kafanızı kaldırıp 4 metre uzaklıktaki su şişesini vurmaya çalışın.",
                durationMins: 10,
                repetitions: "10 hedef isabeti",
                targetSkills: ["Keskin Nişancılık", "Görüş Taraması", "Dönüş Koordinasyonu"],
                levelMatchExplanation: "Enfes bir oyun tasarımı ile hedefe odaklanmayı ve pas isabetini artırır."
              }
            ];
          } else {
            fallbackTasks = [
              {
                title: `Instep Control Pivot: ${exerciseNames[0]} Practice`,
                description: `Find a flat wall. Pass the ball flat, cushion-control with your right foot, roll to the side using your sole, then pass with your left back to the wall. Practice the control details matching "${exerciseNames[0] || 'our class drills'}".`,
                durationMins: 12,
                repetitions: "5 sets of 20 pass-and-receive repetitions",
                targetSkills: ["Wall Passing Accuracy", "Receiving Instinct", "Dual Foot Coordination"],
                levelMatchExplanation: "Provides intermediate ballers with high-quality structured technical muscle memory and symmetric mastery."
              },
              {
                title: "Cone Dribble Shuttle Sprint",
                description: "Position two markers 5 meters apart. Dribble fast to the marker, execute a rapid sole-pullback inside cut, sprint with close control back to home, and finalize with a quick sole step-over.",
                durationMins: 10,
                repetitions: "6 high-intensity shuttle intervals",
                targetSkills: ["Close Dribbling", "Sole Pullbacks", "Agility Pivoting"],
                levelMatchExplanation: "Drives close ball control improvement and tight-space direction changes tailored for intermediate players."
              },
              {
                title: "Precision Bottle Sniper Challenge",
                description: "Dribble the ball in a circular boundary around a chair twice, then raise your head and deliver a precise, low side-foot pass to topple a water bottle set up 4 meters away.",
                durationMins: 10,
                repetitions: "Aim to score 10 direct hits to complete your daily checklist streak",
                targetSkills: ["Sniper Precision", "Vision Scan", "Turning Coordination"],
                levelMatchExplanation: "Fosters focus and precise target hitting under gamified, engaging scenarios for baller athletes."
              }
            ];
          }
        } else {
          if (lang === 'RU') {
            fallbackTasks = [
              {
                title: `Базовый баланс новичка: ${exerciseNames[0]} весело`,
                description: `Встаньте на одну ногу и удерживайте равновесие. Мягко касайтесь верхней части футбольного мяча подошвой, медленно меняя ноги. Сохраняйте ровное положение тела и контролируйте мяч на месте, как на занятии "${exerciseNames[0] || 'наша тренировка'}".`,
                durationMins: 10,
                repetitions: "3 серии по 15 поочередных касаний стопой",
                targetSkills: ["Баланс на одной ноге", "Тактильный контакт", "Уверенность в себе"],
                levelMatchExplanation: "Развивает базовый баланс, стабильность ног и начальное ощущение мяча для новичков."
              },
              {
                title: "Тропинка тик-так",
                description: "Начертите прямую линию длиной 3 метра. Медленно идите по тропинке, аккуратно щелкая мяч внутренней стороной стоп друг другу («тик-так»). Старайтесь сделать не менее 15 мягких касаний до конца линии!",
                durationMins: 8,
                repetitions: "Медленно пройдите по линии 5 раз туда и обратно",
                targetSkills: ["Мягкие касания щечкой", "Ритмичность движений", "Симметричный контроль"],
                levelMatchExplanation: "Развивает ощущение мягкого мышечного касания и ритмичное движение с мячом для начинающих."
              },
              {
                title: "Мягкий наброс от помощника",
                description: "Занимайтесь вместе с родителем или братом на расстоянии 2 метров. Помощник аккуратно набрасывает вам мяч в ноги, а вы мягко принимаете его и пасуете внутренней стороной стопы прямо в руки.",
                durationMins: 10,
                repetitions: "Всего 20 точных набросов подряд",
                targetSkills: ["Амортизация стопой", "Совместная игра", "Концентрация внимания"],
                levelMatchExplanation: "Стимулирует координацию ребенка и родителя и обучает базовому приему мяча в игровой форме."
              }
            ];
          } else if (lang === 'GE') {
            fallbackTasks = [
              {
                title: `დამწყების ბალანსი: ${exerciseNames[0]} მხიარულება`,
                description: `დადექით ცალ ფეხზე და შეინარჩუნეთ წონასწორობა. მსუბუქად შეეხეთ ბურთის ზედა ნაწილს ფეხის გულით, ნელა შეცვალეთ ფეხები. შეინარჩუნეთ სხეულის სწორი პოზიცია, ისევე როგორც "${exerciseNames[0] || 'ჩვენი ვარჯიშები'}"-ზე.`,
                durationMins: 10,
                repetitions: "3 სერია 15 მონაცვლეობითი შეხებით",
                targetSkills: ["ბალანსი", "ტაქტილური შეხება", "თვითდაჯერებულობა"],
                levelMatchExplanation: "ავითარებს ძირითად ბალანსს და ფეხის სტაბილურობას დამწყებთათვის."
              },
              {
                title: "ტიკ-ტაკ ბილიკი",
                description: "გავავლოთ 3-მეტრიანი სწორი ხაზი. იარეთ ნელა ბილიკზე ბურთის მსუბუქი შეხებით ფეხებს შორის.",
                durationMins: 8,
                repetitions: "5-ჯერ წინ და უკან ნელა",
                targetSkills: ["შიდა შეხებათი მართვა", "რიტმი", "სიმეტრიული კონტროლი"],
                levelMatchExplanation: "ავითარებს ფეხის შიდა ნაწილის მსუბუქ შეხებას და რიტმს დამწყებთათვის."
              },
              {
                title: "მშობლის ან დამხმარეს მოწოდება",
                description: "წყვილში მუშაობა 2 მეტრის დაშორებით. პარტნიორი გაწვდის ბურთს, თქვენ კი მსუბუქად უბრუნებთ მას ხელში.",
                durationMins: 10,
                repetitions: "20 კოოპერაციული გადაცემა",
                targetSkills: ["დარტყმის შერბილება", "თანაგუნდელობა", "კონცენტრაცია"],
                levelMatchExplanation: "ავითარებს მშობლისა და სპორტსმენის კოორდინაციას."
              }
            ];
          } else if (lang === 'TR') {
            fallbackTasks = [
              {
                title: `Rookie Temel Dengesi: ${exerciseNames[0]} Eğlencesi`,
                description: `Tek ayak üzerinde dengede durun. Ayak tabanınızla topun üstüne hafifçe dokunup ayak değiştirin. Gelişiminizi "${exerciseNames[0] || 'antrenmanımızdaki'}" derslerimize benzetin.`,
                durationMins: 10,
                repetitions: "3 set 15 dokunuş (alternatif)",
                targetSkills: ["Denge", "Taban Temas Hissi", "Özgüven"],
                levelMatchExplanation: "Başlangıç seviyesindeki oyuncular için denge ve ayak-top hissi oluşturur."
              },
              {
                title: "Tik-Tak Pas Yolu",
                description: "3 metrelik düz bir hat çizin. Topu ayak içlerinizle birbirine çarptırarak (tik-tak) yavaşça bu yolda ilerleyin.",
                durationMins: 8,
                repetitions: "Yolda yavaşça 5 kez git-gel",
                targetSkills: ["Hafif İç Dokunuşlar", "Ritmik Hareket", "Simetrik Kontrol"],
                levelMatchExplanation: "Yumuşak kas teması ve ritmik ilerleme sağlar."
              },
              {
                title: "Yardımcı ile Top Kabulü",
                description: "2 metre mesafedeki bir aile üyesiyle çalışın. Size yumuşakça havadan pas atsınlar, siz de kontrol edip ayak içiyle geri ulaştırın.",
                durationMins: 10,
                repetitions: "Toplam 20 pas-kabul",
                targetSkills: ["Topu Yumuşatma", "Veli-Sporcu Uyum", "Konsantrasyon"],
                levelMatchExplanation: "Aile üyesi ve sporcu koordinasyonunu destekler, yumuşak kontrolü öğretir."
              }
            ];
          } else {
            fallbackTasks = [
              {
                title: `Rookie Base Balance: ${exerciseNames[0]} Fun`,
                description: `Stand comfortably on one leg and balance. Gently tap the top of the soccer ball with the sole of your shoe, slowly alternating. Maintain full body alignment and control the ball in place as learned in "${exerciseNames[0] || 'our training'}".`,
                durationMins: 10,
                repetitions: "3 sets of 15 alternate taps",
                targetSkills: ["Single-Leg Balance", "Tactile Sole Contact", "Confidence Building"],
                levelMatchExplanation: "Builds essential balance, leg stability, and preliminary foot-on-ball sensation for start rookies."
              },
              {
                title: "Tick-Tock Fairy Path",
                description: "Designate a 3-meter straight line. Walk slowly down the path tapping the ball gently between the insides of your feet (the tick-tock pass). Aim to record 15 light touches before reaching the finish line!",
                durationMins: 8,
                repetitions: "Walk the path slowly 5 times back and forth",
                targetSkills: ["Soft Inside Touches", "Rhythmic Movement", "Symmetric Control"],
                levelMatchExplanation: "Develops light muscular touch sensation and rhythmic coordinate moving on the ball for starters."
              },
              {
                title: "Helper's Soft Toss Receiver",
                description: "Cooperate with a parent or brother standing 2 meters away. They toss the ball directly to your feet, and you gently cushion and pass it right back to their hands with the inside of your foot.",
                durationMins: 10,
                repetitions: "20 cooperative tosses in total",
                targetSkills: ["Instep Cushions", "Parent-Athlete Teamwork", "Focus Awareness"],
                levelMatchExplanation: "Fosters parent-athlete coordination and basic receiving technique under friendly, supportive environments."
              }
            ];
          }
        }

      if (!hasApiKey) {
        console.warn("GEMINI_API_KEY environment variable is not defined - Using high-fidelity dynamic custom recommendations fallback.");
        return res.json({ success: true, homeTasks: fallbackTasks });
      }

      const ai = getGeminiClient();
      
      const exercisesDescription = exercises && exercises.length > 0 
        ? exercises.map((e: any) => `- Name: ${e.name}. Description: ${e.description}`).join("\n")
        : "General dribbling skills, coordination routines and footwork.";

      const prompt = `You are an elite youth football academy director at Sport Park Juno soccer academy.
Generate exactly three customized home task training variants that athletes can practice at home, in a small backyard, inside a room (with soft/indoor footballs), or at a nearby playground.

IMPORTANT: You MUST write the content for ALL text properties (title, description, repetitions, levelMatchExplanation, targetSkills) in the ${requestedLangName} language because our client-athletes select ${requestedLangName} as their interface language. Do not output English.

These tasks MUST be strategically based on and complement the following exercises that were added to and practiced in our group class session:
${exercisesDescription}

Adjust the difficulty, coaching detail, and repetition structure precisely for athletes with the level of experience: "${level}".
- Rookie/Nookie: Focus on high-repetition basic touches, safety, building basic balance/confidence, and simple parent-assisted challenges.
- Player/Baller: Intermediate difficulty, introducing fast direction changes, timed challenges, and combining technical with metabolic load.
- Advanced/Pro/Star: Highly advanced, demanding speed and cognitive scanning (e.g. tracking colors, shadows, or counting while moving), elite stability control, and intense reflex challenges.

Provide exactly three variants as a JSON array of objects:
- Variant 1: Skill & Technique (Focus on pure ball manipulation)
- Variant 2: Fitness & Speed (Focus on agility, stamina, reflexes, body coordination)
- Variant 3: Creative Game Scenario (Fun, immersive gamified challenge or high-intensity simulated drill)

Return the response strictly as a JSON array adhering to the requested schema.`;

      let parsed;
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Compact, catchy, motivational title of the home task." },
                  description: { type: Type.STRING, description: "Step-by-step instructions of the homework exercise. Positive, parent-friendly and clear." },
                  durationMins: { type: Type.INTEGER, description: "Recommended training duration (e.g., 10 to 15)." },
                  repetitions: { type: Type.STRING, description: "Repetitions, sets, or time segments (e.g., '3 sets of 15 seconds per leg' or '5 rounds of 10 loops')." },
                  targetSkills: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific target skills, max 3 (e.g., Ball Control, Agility, Speed, Coordination, Reaction)."
                  },
                  levelMatchExplanation: { type: Type.STRING, description: "Brief explanation of how this exercise complies with and targets the specified experience level." }
                },
                required: ["title", "description", "durationMins", "repetitions", "targetSkills", "levelMatchExplanation"]
              }
            }
          }
        });

        const text = response.text;
        if (!text) {
          throw new Error("Empty response from Gemini API");
        }

        parsed = JSON.parse(text.trim());
      } catch (geminiErr: any) {
        console.warn("Gemini API Request failed:", geminiErr.message);
        console.warn("Falling back to pre-generated tasks due to Gemini API Error.");
        parsed = fallbackTasks;
      }

      res.json({ success: true, homeTasks: parsed });
    } catch (err: any) {
      console.error("General Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate home tasks." });
    }
  });

  // API Route for AI-generated taken classes summary report
  app.post("/api/gemini/generate-visited-summary", async (req, res) => {
    try {
      const { visitedEvents, lang } = req.body;
      const ai = getGeminiClient();

      const eventsInfo = visitedEvents && visitedEvents.length > 0
        ? visitedEvents.map((e: any) => `- Date: \${e.date}, Name: \${e.name}`).join("\n")
        : "No specific class logs available.";

      const prompt = `You are an elite football academy master and head coach.
We are generating a highly personalized progress and activity feedback summary for a youth student's progress report based on the agenda of visited classes.

Here are the details of the classes the student attended:
\${eventsInfo}

Generate a beautiful, inspiring, and professional technical summary of the skills and materials learned during these classes.
- Technical elements covered may include: dribbling, close control, reaction agility, tactical position play, passing accuracy, speed/coordination.
- Tone: Extremely encouraging, professional, parent-friendly, focusing on positive developmental gains.
- Format: A single, compact, cohesive, and impactful paragraph (approx 3-5 sentences).
- Language: Please output the summary strictly in \${lang === 'RU' ? 'Russian' : 'English'}. Do not include any JSON markers or headers, just return the plain text of the paragraph itself.

Your response must be ONLY the plain text paragraph.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const summaryText = response.text?.trim() || "";
      res.json({ success: true, summary: summaryText });
    } catch (err: any) {
      console.error("Summary Generation Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate class summary." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
