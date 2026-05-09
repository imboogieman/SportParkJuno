import { Trophy, Zap, Shield, Target, Users, MapPin, Star, Activity, LayoutGrid, BarChart3, Clock, CheckCircle2 } from 'lucide-react';

export const USPS = [
  {
    id: 'holistic',
    title: 'Holistic Development',
    description: 'Beyond football: we build endurance, leadership, resilience, and emotional intelligence.',
    icon: Shield,
    color: 'cyan'
  },
  {
    id: 'multi',
    title: 'Multi-Disciplinary System',
    description: 'Integration of various sports disciplines to develop a versatile and well-rounded athlete.',
    icon: Zap,
    color: 'orange'
  },
  {
    id: 'digital',
    title: 'Digital Platform',
    description: 'Track progress with our Sport Passport. Real-time metrics for every child.',
    icon: LayoutGrid,
    color: 'orange'
  },
  {
    id: 'gamified',
    title: 'Gamified Motivation',
    description: 'XP, badges, and trophies keep kids engaged and excited to improve.',
    icon: Trophy,
    color: 'cyan'
  }
];

export const PROGRAMS = [
  {
    title: 'Physical Power',
    focus: ['Endurance', 'Flexibility', 'Coordination', 'Balance'],
    icon: Activity,
    message: 'Build stronger bodies and healthier lifestyles.'
  },
  {
    title: 'Elite Skills',
    focus: ['Dribbling', 'Passing', 'Shooting', 'Reaction'],
    icon: Zap,
    message: 'Develop confident and technically intelligent players.'
  },
  {
    title: 'Tactical Mind',
    focus: ['Positioning', 'Teamwork', 'Leadership', 'Awareness'],
    icon: Target,
    message: 'Teach children how to think and lead under pressure.'
  }
];

export const MOCK_STUDENT = {
  name: 'Luka',
  nameRU: 'Лука',
  nameGE: 'ლუკა',
  age: 8,
  level: 4,
  xp: 1250,
  nextLevelXp: 2000,
  avatar: 'https://images.unsplash.com/photo-1618671401673-bc97e5967f65?auto=format&fit=crop&q=80&w=400',
  skills: [
    { key: 'dribbling', label: 'Dribbling', labelRU: 'Дриблинг', labelGE: 'დრიბლინგი', value: 75 },
    { key: 'passing', label: 'Passing', labelRU: 'Пасы', labelGE: 'პასი', value: 60 },
    { key: 'shooting', label: 'Shooting', labelRU: 'Удары', labelGE: 'დარტყმა', value: 85 },
    { key: 'endurance', label: 'Endurance', labelRU: 'Выносливость', labelGE: 'გამძლეობა', value: 90 },
    { key: 'discipline', label: 'Discipline', labelRU: 'Дисциплина', labelGE: 'დისციპლინა', value: 95 }
  ],
  badges: [
    { title: 'Goal Hunter', icon: Target },
    { title: 'Team Leader', icon: Users },
    { title: 'Early Bird', icon: Clock }
  ],
  attendance: 98
};

export const COACHES = [
  {
    id: 'coach-1',
    name: 'Roman Gorbunov',
    nameRU: 'Роман Горбунов',
    specialization: 'Technical Director',
    specializationRU: 'Технический Директор',
    experience: 'Elite Youth Coach',
    experienceRU: 'Тренер высшей категории',
    certifications: ['Higher Pedagogy Degree', 'National Rugby Team RB U-21'],
    certificationsRU: ['Высшее пед. образование', 'Нац. команда по регби РБ U-21'],
    bio: 'Multi-disciplinary expert combining high-level rugby experience with pedagogical foundation for holistic football training.',
    bioRU: 'Сочетает опыт в сборной по регби с высшим педагогическим образованием для подготовки мультидисциплинарных атлетов.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coach-2',
    name: 'Anton Kipelov',
    nameRU: 'Антон Кипелов',
    specialization: 'Football Coach',
    specializationRU: 'Футбольный тренер',
    experience: '12 Years Pro',
    experienceRU: '12 Лет в профи',
    certifications: ['FC Rostov Alum', 'Professional Football License'],
    certificationsRU: ['экс-ФК Ростов', 'Проф. опыт 12 лет'],
    bio: 'Professional football veteran bringing elite-level field experience to the next generation of players.',
    bioRU: 'Бывший игрок ФК Ростов, передающий опыт профессионального спорта и дисциплины юным атлетам.',
    image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coach-3',
    name: 'Elena Petrova',
    nameRU: 'Елена Петрова',
    specialization: 'Running Preparation',
    specializationRU: 'Беговая подготовка',
    experience: 'Fitness Professional',
    experienceRU: 'Фитнес-профессионал',
    certifications: ['Certified Fitness Coach', 'Track & Field Specialist'],
    certificationsRU: ['Сертифицированный тренер', 'Специалист по легкой атлетике'],
    bio: 'Focuses on the mechanics of movement and speed development, foundational for every disciplinary sport.',
    bioRU: 'Специалист по биомеханике бега и постановке правильной техники движений для любых игровых видов спорта.',
    image: 'https://images.unsplash.com/photo-1548690312-e3b507d17a47?auto=format&fit=crop&w=600&q=80'
  }
];

export const LOCATIONS = [
  { 
    id: 'l1',
    name: 'Aeroport Runway', 
    nameRU: 'Взлётная полоса Аэропорта',
    nameGE: 'აეროპორტის ასაფრენი ბილიკი',
    address: 'Batumi, Airport Highway area',
    addressRU: 'Батуми, район Шоссе Аэропорта',
    addressGE: 'ბათუმი, აეროპორტის გზატკეცილის ტერიტორია',
    coordinates: { x: 40, y: 80 },
    schedule: [
      { days: 'Mon, Wed, Fri', time: '16:00 - 18:00' },
      { days: 'Sat, Sun', time: '10:00 - 12:00' }
    ]
  },
  { 
    id: 'l2',
    name: 'Metro Mall', 
    nameRU: 'Метро Молл',
    nameGE: 'მეტრო მოლი',
    address: 'Batumi, Lech and Maria Kaczynski St',
    addressRU: 'Батуми, ул. Леха и Марии Качиньских',
    addressGE: 'ბათუმი, ლეხ და მარია კაჩინსკების ქ.',
    coordinates: { x: 45, y: 70 },
    schedule: [
      { days: 'Tue, Thu', time: '17:00 - 19:00' },
      { days: 'Sat', time: '12:00 - 14:00' }
    ]
  },
  { 
    id: 'l3',
    name: 'Aghmashenebeli', 
    nameRU: 'Агмашенебели',
    nameGE: 'აღმაშენებელი',
    address: 'Batumi, Aghmashenebeli Ave',
    addressRU: 'Батуми, пр. Агмашенебели',
    addressGE: 'ბათუმი, აღმაშენებლის გამზ.',
    coordinates: { x: 55, y: 55 },
    schedule: [
      { days: 'Mon, Fri', time: '18:00 - 20:00' },
      { days: 'Sun', time: '15:00 - 17:00' }
    ]
  },
  { 
    id: 'l4',
    name: 'Rustaveli', 
    nameRU: 'Руставели',
    nameGE: 'რუსთაველი',
    address: 'Batumi, Rustaveli Ave / Seafront',
    addressRU: 'Батуми, пр. Руставели / Набережная',
    addressGE: 'ბათუმი, რუსთაველის გამზ. / სანაპირო',
    coordinates: { x: 60, y: 35 },
    schedule: [
      { days: 'Weekday Evenings', time: '19:00 - 21:00' },
      { days: 'Morning Bliss', time: '08:00 - 10:00' }
    ]
  },
  { 
    id: 'l5',
    name: 'Hero Park', 
    nameRU: 'Парк Героев',
    nameGE: 'გმირთა პარკი',
    address: 'Batumi, Heroes Square Area',
    addressRU: 'Батуми, район площади Героев',
    addressGE: 'ბათუმი, გმირთა მოედნის ტერიტორია',
    coordinates: { x: 70, y: 45 },
    schedule: [
      { days: 'Daily', time: '16:00 - 21:00' }
    ]
  }
];
