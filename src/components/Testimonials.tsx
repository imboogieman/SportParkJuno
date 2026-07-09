import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Badge } from './UI';

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
  tag: string;
}

const TESTIMONIALS_DATA: Record<string, Testimonial[]> = {
  EN: [
    {
      name: "Mariam T.",
      role: "Parent of Luka (8 years)",
      rating: 5,
      text: "The holistic training format is brilliant! My child is not only playing better football but is also, and more importantly, learning how to manage stress and stay active through gymnastics and breathing techniques.",
      tag: "Holistic approach"
    },
    {
      name: "Ayşe K.",
      role: "Parent of Emre (11 years)",
      rating: 5,
      text: "We love the digital passport. Every week we check the XP and badges together! The coaches are very structured and deeply care about safety and long-term development on the program.",
      tag: "Digital passport"
    },
    {
      name: "Oksana K.",
      role: "Parent of Bohdan (9 years)",
      rating: 5,
      text: "Combining elements from different disciplines, physical strength, and soccer intelligence in one unified program has been a game-changer! Highly recommended for parents seeking quality over raw drill reps.",
      tag: "Physical prep"
    },
    {
      name: "Elena S.",
      role: "Parent of Maxim (10 years)",
      rating: 5,
      text: "The professional coaches here are fantastic. The feedback is personalized, which makes the learning process incredibly clear and very interactive for kids.",
      tag: "Professional coaching"
    }
  ],
  GE: [
    {
      name: "მარიამ თ.",
      role: "ლუკას მშობელი (8 წლის)",
      rating: 5,
      text: "ჰოლისტიკური ვარჯიშის ფორმატი შესანიშნავია! ჩემი შვილი არა მხოლოდ უკეთ თამაშობს ფეხბურთს, არამედ სწავლობს სტრესის მართვას და აქტიურია ტანვარჯიშისა და სუნთქვის მეთოდებით.",
      tag: "ჰოლისტიკური მიდგომა"
    },
    {
      name: "დავით ქ.",
      role: "ალექსანდრეს მშობელი (11 წლის)",
      rating: 5,
      text: "პასპორტი ძალიან მოგვწონს. ყოველ კვირას ერთად ვამოწმებთ XP-ს და ნიშნებს! მწვრთნელები ძალიან ორგანიზებულები არიან და ზრუნავენ უსაფრთხოებაზე.",
      tag: "ციფრული პასპორტი"
    },
    {
      name: "გიორგი ბ.",
      role: "საბას მშობელი (9 წლის)",
      rating: 5,
      text: "სხვადასხვა დისციპლინის ელემენტების, ფიზიკური ძალისა და საფეხბურთო ინტელექტის გაერთიანება ერთ პროგრამაში საუკეთესო გადაწყვეტილებაა! ვურჩევ ყველა მშობელს, ვისაც ხარისხი სურს.",
      tag: "ფიზიკური მომზადება"
    }
  ],
  RU: [
    {
      name: "Мариам Т.",
      role: "Родитель Луки (8 лет)",
      rating: 5,
      text: "Формат холистических тренировок просто великолепен! Ребёнок не только лучше играет в футбол, но и учится справляться со стрессом, повышает общую выносливость благодаря физическим и гимнастическим упражнениям.",
      tag: "Холистический подход"
    },
    {
      name: "Айше К.",
      role: "Родитель Эмре (11 лет)",
      rating: 5,
      text: "Нам очень нравится цифровой паспорт Juno. Каждую неделю вместе проверяем XP и собранные значки! Тренеры мотивируют ребят и дают детальную обратную связь по программе.",
      tag: "Цифровой паспорт"
    },
    {
      name: "Оксана К.",
      role: "Родитель Богдана (9 лет)",
      rating: 5,
      text: "Сочетание элементов из разных дисциплин, силовой подготовки и футбольной тактики в рамках одной программы — это прорыв! Отличная организация и индивидуальный подход.",
      tag: "Физическая подготовка"
    },
    {
      name: "Елена С.",
      role: "Родитель Максима (10 лет)",
      rating: 5,
      text: "Прекрасные тренеры и замечательная атмосфера. Программа дала сыну невероятный толчок в физическом плане и научила дисциплине на поле и в жизни!",
      tag: "Профессиональный коучинг"
    }
  ],
  TR: [
    {
      name: "Mariam T.",
      role: "Luka'nın Velisi (8 yaş)",
      rating: 5,
      text: "Bütünsel antrenman formatı tek kelimeyle harika! Çocuğum sadece daha iyi futbol oynamakla kalmıyor, aynı zamanda stresi yönetmeyi ve jimnastikle aktif kalmayı öğreniyor.",
      tag: "Bütünsel yaklaşım"
    },
    {
      name: "Ayşe K.",
      role: "Emre'nin Velisi (11 yaş)",
      rating: 5,
      text: "Dijital spor pasaportunu çok seviyoruz. Her hafta gelişim puanlarını ve kazanılan rozetleri birlikte kontrol ediyoruz! Koçlar son derece deneyimli ve profesyonel.",
      tag: "Dijital Pasaport"
    },
    {
      name: "Oksana K.",
      role: "Bohdan'ın Velisi (9 yaş)",
      rating: 5,
      text: "Farklı disiplinlerden unsurları, kuvvet ve futbol zekasını tek bir programda birleştirmek harika bir fikir! Kaliteye önem veren velilere bu harika programı kesinlikle tavsiye ederim.",
      tag: "Fiziksel hazırlık"
    }
  ]
};

const LABELS: Record<string, { badge: string; titlePrimary: string; titleAccent: string; desc: string }> = {
  EN: {
    badge: "PARENT CORNER",
    titlePrimary: "TRUSTED BY",
    titleAccent: "PARENTS",
    desc: "Read what families say about our revolutionary holistic athletic development program and their children's progress."
  },
  GE: {
    badge: "მშობელთა კუთხე",
    titlePrimary: "მშობლების",
    titleAccent: "შეფასებები",
    desc: "წაიკითხეთ რას ამბობენ ოჯახები ჩვენი რევოლუციური ჰოლისტიკური სპორტული პროგრამისა და მათი შვილების პროგრესის შესახებ."
  },
  RU: {
    badge: "ОТЗЫВЫ РОДИТЕЛЕЙ",
    titlePrimary: "НАМ ДОВЕРЯЮТ",
    titleAccent: "РОДИТЕЛИ",
    desc: "Узнайте, что говорят семьи о нашей уникальной холистической программе развития юных атлетов и результатах детей."
  },
  TR: {
    badge: "VELİ KÖŞESİ",
    titlePrimary: "GÜVENİLİR",
    titleAccent: "DENEYİMLER",
    desc: "Kapsamlı bütünsel spor programımız ve çocuklarının mükemmel gelişim süreçleri hakkında ailelerin paylaştığı değerli görüşler."
  }
};

export default function Testimonials({ lang = 'RU' }: { lang?: string }) {
  const currentLang = TESTIMONIALS_DATA[lang] ? lang : 'RU';
  const testimonials = TESTIMONIALS_DATA[currentLang];
  const labels = LABELS[currentLang];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;
    
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const activeTestimonial = testimonials[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    })
  };

  return (
    <section id="testimonials" className="py-24 bg-brand-cream relative overflow-hidden font-sans border-b border-brand-navy/5">
      {/* Abstract background highlights */}
      <div className="absolute top-1/2 left-10 w-[500px] h-[500px] bg-brand-teal/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-brand-sunset/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Block */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge color="sunset" className="px-6 py-2 rounded-full font-black text-[10px] tracking-widest leading-none">
            {labels.badge}
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mt-8 mb-6 leading-none text-brand-navy">
            <span>{labels.titlePrimary}</span>{" "}
            <span className="text-brand-teal drop-shadow-sm">{labels.titleAccent}</span>
          </h2>
          <p className="text-brand-navy/55 font-medium italic text-lg leading-relaxed px-4">
            {labels.desc}
          </p>
        </div>

        {/* Carousel Container */}
        <div className="max-w-3xl mx-auto relative px-2 md:px-10 h-[480px] sm:h-[340px] md:h-[285px] lg:h-[250px]">
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none z-20">
            {/* Nav Arrows (visible on large screen, inside pointer target) */}
            <button
              onClick={handlePrev}
              className="pointer-events-auto w-12 h-12 rounded-2xl bg-white border border-brand-navy/5 text-brand-navy hover:text-brand-teal hover:border-brand-teal/30 hover:shadow-lg flex items-center justify-center transition-all cursor-pointer shadow-sm translate-x-2 md:-translate-x-6"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto w-12 h-12 rounded-2xl bg-white border border-brand-navy/5 text-brand-navy hover:text-brand-teal hover:border-brand-teal/30 hover:shadow-lg flex items-center justify-center transition-all cursor-pointer shadow-sm -translate-x-2 md:translate-x-6"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full"
            >
              <div 
                className="h-full bg-white border border-brand-navy/5 rounded-[40px] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col justify-between relative group hover:shadow-[0_24px_60px_rgba(0,0,0,0.05)] transition-all duration-500"
                onMouseEnter={() => setIsAutoPlaying(false)}
                onMouseLeave={() => setIsAutoPlaying(true)}
              >
                {/* Visual Icon Accent (Quote Icon) */}
                <div className="absolute top-6 right-8 text-brand-teal/5 pointer-events-none hidden md:block">
                  <Quote className="w-20 h-20 stroke-[1]" />
                </div>

                {/* Content Block */}
                <div className="flex-1 flex flex-col justify-between h-full text-center md:text-left font-sans">
                  <div>
                    {/* Stars bar */}
                    <div className="flex items-center justify-center md:justify-start gap-1 mb-3">
                      {Array.from({ length: activeTestimonial.rating }).map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-brand-sunset text-brand-sunset" />
                      ))}
                    </div>

                    {/* Testimonial message */}
                    <p className="text-brand-navy font-semibold text-base md:text-lg md:leading-relaxed leading-relaxed italic mb-4">
                      “{activeTestimonial.text}”
                    </p>
                  </div>

                  {/* Author Meta */}
                  <div className="mt-auto pt-2 border-t border-brand-navy/5">
                    <h4 className="text-lg font-black italic uppercase tracking-tight text-brand-navy leading-none mb-1">
                      {activeTestimonial.name}
                    </h4>
                    <span className="text-[11px] font-black uppercase tracking-widest text-brand-teal">
                      {activeTestimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Indicators / DOTS */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-3 mt-10 relative z-30">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'bg-brand-teal w-12 shadow-sm' : 'bg-brand-navy/10 hover:bg-brand-navy/20'
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
