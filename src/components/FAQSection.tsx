import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Calendar, ShieldCheck, Shirt, RefreshCw, Users, FileText } from 'lucide-react';
import { Badge } from './UI';

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

const FAQ_DATA: Record<string, FAQItem[]> = {
  EN: [
    {
      question: "How do I enroll my child in the academy?",
      answer: "You can start by booking a free trial class on our website (click 'Book Trial Class' or 'Join Today'). After the trial session, our coaching staff will assess your child's age group and fitness level, and guide you through the registration process and document collection.",
      icon: Calendar
    },
    {
      question: "What documents are required for registration?",
      answer: "To complete official permanent enrollment, we require a medical clearance statement from a pediatrician certifying that your child is fit for intense athletic activity, a copy of the child's birth certificate or ID card, and a signed parental consent and liability agreement form.",
      icon: FileText
    },
    {
      question: "What equipment and training gear does my child need?",
      answer: "For your free trial class, normal athletic wear (t-shirt, shorts) and comfortable sneakers are perfect. Upon official registration, we order their personalized Sport Park Juno kit (jersey, shorts, socks). For safety reasons, athletes must wear age-appropriate youth shin guards during all training sessions.",
      icon: Shirt
    },
    {
      question: "Can we change training groups or schedules later?",
      answer: "Yes, group or schedule adjustments can be requested via the Parental Portal account or by coordinating directly with our administration. Group transfers are approved based on participant capacity at specific time slots and the athlete merit evaluation performed by the head coaches.",
      icon: RefreshCw
    },
    {
      question: "How does the sibling discount or multi-child offer work?",
      answer: "We offer an institutional 20% discount on the monthly subscription fee for the second (and each subsequent) child enrolled from the same household. This discount applies automatically during payment processing online, or can be verified by our administrative staff.",
      icon: Users
    },
    {
      question: "What is your cancellation and makeup class policy?",
      answer: "If an athlete misses a session due to illness or family travel, the session token can be credited for a makeup class in an alternate slot. For a makeup credit to be registered, you must submit a notification through the portal at least 24 hours prior to the scheduled training session.",
      icon: ShieldCheck
    }
  ],
  RU: [
    {
      question: "Как записать ребёнка на программу?",
      answer: "Вы можете начать с бронирования бесплатной пробной тренировки на нашем сайте (кнопка «Пробное занятие» или «Вступить»). После этого мы свяжемся с вами для верификации и разъяснения дальнейших действий.",
      icon: Calendar
    },
    {
      question: "Какие документы требуются для регистрации?",
      answer: "Регистрация на платформе является официальным согласием с условиями Публичной оферты. Нажимая кнопку «Зарегистрироваться», вы подтверждаете отсутствие медицинских противопоказаний у ребенка к интенсивным занятиям спортом и принимаете правила нашей программы. Все личные данные ребенка заполняются непосредственно в вашем личном кабинете.",
      icon: FileText
    },
    {
      question: "Какая экипировка и инвентарь нужны ребенку?",
      answer: "Для всех этапов программы, включая пробное занятие, ребенку понадобится собственная форма. Мы рекомендуем выбирать одежду из технологичных, дышащих спортивных материалов (фирменный полиэстер или гибридный хлопок), которые эффективно отводят влагу и защищают от перегрева.\n\nОсобое внимание уделите обуви: кроссовки должны быть с качественной амортизацией и надежной фиксацией стопы для защиты суставов во время резких маневров.\n\nВ целях безопасности детские защитные щитки строго обязательны на каждой групповой игре, матче (от 10 человек).",
      icon: Shirt
    },
    {
      question: "Можно ли изменить группу или расписание тренировок позже?",
      answer: "Да, подать запрос на изменение группы или расписания можно в личном кабинете родителя или обратившись напрямую в администрацию. Переводы согласовываются в зависимости от наполненности групп в выбранные часы и спортивных рекомендаций старшего тренера.",
      icon: RefreshCw
    },
    {
      question: "Как работает семейная скидка или предложение для нескольких детей?",
      answer: "Мы предоставляем постоянную скидку 20% на ежемесячный абонемент на второго (и последующих) детей из одной семьи или приведённого друга. Скидка рассчитывается автоматически при выставлении счета в личном кабинете или настраивается администратором во время оплаты. Скидка активна на протяжении активности второго (и последующих) участников.",
      icon: Users
    },
    {
      question: "Какая у вас политика отмены и отработки пропущенных занятий?",
      answer: "Если ребенок пропускает тренировку по личным причинам, занятие считается пропущенным, так как это групповые занятия. Индивидуальная отработка проводится по согласованию и по отдельной индивидуальной тарификации 35 GEL за академический час (45 минут).",
      icon: ShieldCheck
    }
  ],
  GE: [
    {
      question: "როგორ ჩავწერო ჩემი შვილი აკადემიაში?",
      answer: "შეგიძლიათ დაიწყოთ ჩვენს ვებგვერდზე უფასო საცდელი ვარჯიშის დაჯავშნით. საცდელი შეხვედრის შემდეგ, ჩვენი სამწვრთნელო შტაბი შეაფასებს თქვენი შვილის ასაკობრივ ჯგუფს და ფიზიკურ მომზადებას, დაგეხმარებათ რეგისტრაციაში და საჭირო დოკუმენტების შეგროვებაში.",
      icon: Calendar
    },
    {
      question: "რა დოკუმენტებია საჭირო რეგისტრაციისთვის?",
      answer: "ოფიციალური მუდმივი ჩარიცხვისთვის საჭიროა პედიატრის სამედიცინო ცნობა (ფორმა 100), რომელიც ადასტურებს, რომ ბავშვს შეუძლია სპორტული დატვირთვა, ბავშვის დაბადების მოწმობის ან ID ბარათის ასლი და მშობლის მიერ ხელმოწერილი თანხმობის ფორმა.",
      icon: FileText
    },
    {
      question: "რა ეკიპირება და აღჭურვილობა სჭირდება ბავშვს ვარჯიშისთვის?",
      answer: "უფასო საცდელი ვარჯიშისთვის ჩვეულებრივი სპორტული ტანსაცმელი (მაისური, შორტები) და კომფორტული სპორტული ფეხსაცმელი საკმარისია. ოფიციალური რეგისტრაციის შემდეგ, ვიწერთ Sport Park Juno-ს პერსონალიზებულ ფორმას (მაისური, შორტები, გეტრები). უსაფრთხოების მიზნით, ყველა ვარჯიშზე აუცილებელია ფეხის წინა დამცავების (щитки) ტარება.",
      icon: Shirt
    },
    {
      question: "შესაძლებელია თუ არა ჯგუფის ან ვარჯიშის განრიგის შეცვლა მოგვიანებით?",
      answer: "დიახ, განრიგის ან ჯგუფის შეცვლა შესაძლებელია მშობლების პორტალის მეშვეობით ან ადმინისტრაციასთან პირდაპირ დაკავშირებით. ჯგუფებს შორის გადაყვანა მტკიცდება შერჩეულ საათებში თავისუფალი ადგილებისა და მწვრთნელების რეკომენდაციის საფუძველზე.",
      icon: RefreshCw
    },
    {
      question: "როგორ მუშაობს საოჯახო ფასდაკლება ან შემოთავაზება რამდენიმე ბავშვზე?",
      answer: "ჩვენ გთავაზობთ 20%-იან ფასდაკლებას ყოველთვიურ სააბონენტო გადასახადზე მეორე (და ყოველ მომდევნო) ბავშვზე ერთი ოჯახიდან. ფასდაკლება ავტომატურად აისახება ონლაინ გადახდისას ან შეგიძლიათ გადაამოწმოთ ადმინისტრაციასთან.",
      icon: Users
    },
    {
      question: "როგორია ვარჯიშების გაცდენის ან აღდგენის წესი?",
      answer: "თუ ბავშვი აცდენს ვარჯიშს ავადმყოფობის ან ოჯახური მგზავრობის გამო, მისი აღდგენა შესაძლებელია სხვა ჯგუფის საათებში. აღდგენის უფლების გასააქტიურებლად ვარჯიშის დაწყებამდე მინიმუმ 24 საათით ადრე უნდა გამოგვიგზავნოთ შეტყობინება მშობლის პორტალიდან.",
      icon: ShieldCheck
    }
  ],
  TR: [
    {
      question: "Çocuğumu akademiye nasıl kaydettirebilirim?",
      answer: "Web sitemiz üzerinden ücretsiz bir deneme dersi randevusu alarak başlayabilirsiniz (tıpkı 'Deneme Dersi Al' veya 'Hemen Katıl' gibi). Deneme dersinden sonra antrenör kadromuz çocuğunuzun yaş grubunu ve fiziksel seviyesini değerlendirecek, kayıt ve belge teslim sürecinde size yol gösterecektir.",
      icon: Calendar
    },
    {
      question: "Kayıt için hangi belgeler gereklidir?",
      answer: "Resmi kalıcı kaydı tamamlamak için çocuğunuzun yoğun sportif faaliyetlere uygun olduğunu belgeleyen çocuk doktoru onaylı sağlık raporu, çocuğun doğum belgesi veya kimlik kartı fotokopisi ve imzalı veli izin/muvafakatnamesi gerekmektedir.",
      icon: FileText
    },
    {
      question: "Çocuğumun hangi ekipman ve spor kıyafetlerine ihtiyacı var?",
      answer: "Ücretsiz deneme dersi için standart bir spor kıyafeti (tişört, şort) ve rahat bir spor ayakkabı yeterlidir. Resmi kayıt gerçekleştikten sonra kişiselleştirilmiş Sport Park Juno kitleri (forma, şort, tozluk) sipariş edilir. Güvenlik nedeniyle sporcuların tüm antrenmanlar boyunca bacak koruyucu (tekmelik) takması zorunludur.",
      icon: Shirt
    },
    {
      question: "Daha sonra antrenman grubunu veya saatlerimizi değiştirebilir miyiz?",
      answer: "Evet, grup veya program değişiklikleri Veli Portalı hesabınız üzerinden ya da doğrudan idaremiz ile iletişime geçilerek talep edilebilir. Grup transferleri, belirli saat dilimlerindeki kontenjan durumuna ve başantrenörlerin sportif değerlendirmelerine bağlı olarak onaylanır.",
      icon: RefreshCw
    },
    {
      question: "Kardeş indirimi veya çoklu çocuk teklifi nasıl çalışıyor?",
      answer: "Aynı haneden kayıt yaptıran ikinci (ve sonraki her bir) çocuk için aylık abonelik ücretinde net %20 indirim sunmaktayız. Şartlar sağlandığında bu indirim çevrimiçi ödeme aşamasında otomatik olarak faturanıza yansıtılır veya idari personelimizce aktive edilir.",
      icon: Users
    },
    {
      question: "Ders iptali ve telafi dersi politikanız nedir?",
      answer: "Sporcunun hastalık veya önceden planlanmış aile seyahati nedeniyle bir dersi kaçırması halinde, kaçırılan ders başka bir gruptaki uygun saatte telafi edilebilir. Telafi hakkınızın oluşturulabilmesi için planlı antrenmandan en az 24 saat önce portal üzerinden devamsızlık bildirimi yapılması gerekmektedir.",
      icon: ShieldCheck
    }
  ]
};

export function FAQSection({ lang = 'EN' }: { lang?: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activeLang = FAQ_DATA[lang] ? lang : 'EN';
  const faqs = FAQ_DATA[activeLang];

  const sectionTitles: Record<string, { badge: string; title_1: string; title_2: string; desc: string }> = {
    EN: {
      badge: "KNOWLEDGE HUB",
      title_1: "FREQUENTLY ASKED",
      title_2: "QUESTIONS",
      desc: "Everything you need to know about the academy registration process, required gear, and class scheduling."
    },
    RU: {
      badge: "БАЗА ЗНАНИЙ",
      title_1: "ЧАСТО ЗАДАВАЕМЫЕ",
      title_2: "ВОПРОСЫ",
      desc: "Все, что вам нужно знать о процессе регистрации на программу, спортивной экипировке и расписании занятий."
    },
    GE: {
      badge: "ინფორმაცია",
      title_1: "ხშირად დასმული",
      title_2: "კითხვები",
      desc: "ყველაფერი რაც უნდა იცოდეთ აკადემიაში რეგისტრაციის, საჭირო ეკიპირებისა და ვარჯიშის განრიგის შესახებ."
    },
    TR: {
      badge: "BİLGİ MERKEZİ",
      title_1: "SIKÇA SORULAN",
      title_2: "SORULAR",
      desc: "Akademiye kayıt süreci, gerekli ekipmanlar ve ders planlaması hakkında bilmeniz gereken her şey."
    }
  };

  const currentStrings = sectionTitles[activeLang] || sectionTitles.EN;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brand-cream/45 relative overflow-hidden border-t border-brand-navy/5 font-sans">
      {/* Decorative ambient gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-brand-sunset/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge color="sunset" className="px-3 py-1.5 rounded-full">{currentStrings.badge}</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mt-8 mb-6 leading-none text-brand-navy">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-navy to-brand-teal">{currentStrings.title_1}</span>{' '}
            <span className="text-brand-teal drop-shadow-sm">{currentStrings.title_2}</span>
          </h2>
          <p className="text-brand-navy/60 font-medium leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
            {currentStrings.desc}
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const IconComponent = faq.icon;
            return (
              <motion.div
                key={idx}
                id={`faq-item-${idx}`}
                layout="position"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`rounded-[32px] border transition-all duration-500 overflow-hidden ${
                  isOpen 
                    ? 'bg-white border-brand-teal/20 shadow-xl scale-[1.01]' 
                    : 'bg-white/50 border-brand-navy/5 hover:border-brand-teal/20 hover:bg-white shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-6 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal/50 select-none group"
                >
                  <div className="flex items-center gap-4 md:gap-6 flex-1">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shrink-0 ${
                      isOpen 
                        ? 'bg-brand-teal text-white shadow-teal' 
                        : 'bg-brand-navy/5 text-brand-navy/55 group-hover:bg-brand-teal/10 group-hover:text-brand-teal'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-sm md:text-base font-black uppercase italic tracking-tight text-brand-navy group-hover:text-brand-teal transition-colors leading-snug">
                      {faq.question}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all ${
                      isOpen 
                        ? 'border-brand-teal/15 bg-brand-teal/5 text-brand-teal' 
                        : 'border-brand-navy/10 text-brand-navy/40 group-hover:bg-brand-navy/5'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      <div className="px-6 md:px-8 pb-8 pt-2 md:pt-0 pl-6 md:pl-24 pr-6 md:pr-12 text-xs md:text-sm font-medium leading-relaxed font-sans text-brand-navy/70 border-t border-brand-navy/5 bg-brand-cream/15">
                        <p className="max-w-2xl text-brand-navy/75 font-sans leading-relaxed tracking-wide whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
