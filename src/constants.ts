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
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
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
    experience: 'Author of the holistic program',
    experienceRU: 'Автор холистической программы',
    certifications: ['Higher Pedagogy Degree', 'National Rugby Team RB U-21'],
    certificationsRU: ['Высшее пед. образование', 'Нац. команда по регби РБ U-21'],
    bio: 'Multi-disciplinary expert combining high-level rugby experience with pedagogical foundation for holistic football training.',
    bioRU: 'Сочетает опыт в сборной по регби с высшим педагогическим образованием для подготовки мультидисциплинарных атлетов.',
    image: '/Images/tech_director_01.png',
    objectPosition: 'top'
  },
  {
    id: 'coach-2',
    name: 'Stefan Zhivozudsky',
    nameRU: 'Стефан Живозудский',
    specialization: 'Football Coach',
    specializationRU: 'Футбольный тренер',
    experience: '12 Years Pro',
    experienceRU: '12 Лет в профи',
    certifications: ['FC Rostov Alum', 'Professional Football License'],
    certificationsRU: ['экс-ФК Ростов', 'Проф. опыт 12 лет'],
    bio: 'Professional football veteran bringing elite-level field experience to the next generation of players.',
    bioRU: 'Бывший игрок ФК Ростов, передающий опыт профессионального спорта и дисциплины юным атлетам.',
    image: '/Images/football_coach_01.png',
    objectPosition: 'center'
  },
  {
    id: 'coach-3',
    name: 'Elena Petrova',
    nameRU: 'Елена Петрова',
    specialization: 'Crossfit',
    specializationRU: 'Crossfit',
    experience: 'Fitness Professional',
    experienceRU: 'Фитнес-профессионал',
    certifications: ['Certified Fitness Coach', 'Track & Field Specialist'],
    certificationsRU: ['Сертифицированный тренер', 'Специалист по легкой атлетике'],
    bio: 'Focuses on the mechanics of movement and speed development, foundational for every disciplinary sport.',
    bioRU: 'Специалист по биомеханике бега и постановке правильной техники движений для любых игровых видов спорта.',
    image: 'https://placehold.co/600x800/0B1120/4FB0A8?text=Loading...',
    objectPosition: 'center'
  }
];

export const LOCATIONS = [
  { 
    id: 'airport_runway',
    name: 'Airport runway', 
    nameRU: 'Взлётка',
    nameGE: 'აეროპორტის ასაფრენი ბილიკი',
    nameTR: 'Havaalanı pisti',
    address: 'Giorgi Antsukhelidze St',
    addressRU: 'ул. Георгия Анцухелидзе',
    addressGE: 'გიორგი ანწუხელიძის ქ.',
    addressTR: 'Giorgi Antsukhelidze Sk',
    coordinates: { x: 40, y: 80 },
    schedule: [
      { days: 'Mon, Wed, Fri', time: '16:00 - 18:00' },
      { days: 'Sat, Sun', time: '10:00 - 12:00' }
    ]
  },
  { 
    id: 'metro_mall',
    name: 'Metrogorod', 
    nameRU: 'Метрогород',
    nameGE: 'მეტროგოროდი',
    nameTR: 'Metrogorod',
    address: '6 Grigol Lortkipanidze St',
    addressRU: 'ул. Григола Лорткипанидзе, 6',
    addressGE: 'გრიგოლ ლორთქიფანიძის ქ. 6',
    addressTR: '6 Grigol Lortkipanidze Sk',
    coordinates: { x: 45, y: 70 },
    schedule: [
      { days: 'Tue, Thu', time: '17:00 - 19:00' },
      { days: 'Sat', time: '12:00 - 14:00' }
    ]
  },
  { 
    id: 'agmashenebeli',
    name: 'Agmashenebeli', 
    nameRU: 'Агмашенебели',
    nameGE: 'აღმაშენებელი',
    nameTR: 'Agmashenebeli',
    address: '12a Agmashenebeli St',
    addressRU: 'ул. Агмашенебели, 12а',
    addressGE: 'აღმაშენებლის ქ. 12ა',
    addressTR: '12a Agmashenebeli Sk',
    coordinates: { x: 55, y: 55 },
    schedule: [
      { days: 'Mon, Fri', time: '18:00 - 20:00' },
      { days: 'Sun', time: '15:00 - 17:00' }
    ]
  },
  { 
    id: 'pirosmani_5',
    name: 'Pirosmani 5', 
    nameRU: 'Пиросмани 5',
    nameGE: 'ფიროსმანის 5',
    nameTR: 'Pirosmani 5',
    address: '5 Niko Pirosmani St',
    addressRU: 'ул. Нико Пиросмани, 5',
    addressGE: 'ნიკო ფიროსმანის ქ. 5',
    addressTR: '5 Niko Pirosmani Sk',
    coordinates: { x: 50, y: 40 },
    schedule: [
      { days: 'Mon, Wed, Fri', time: '17:00 - 19:00' },
      { days: 'Sat', time: '11:00 - 13:00' }
    ]
  },
  { 
    id: 'kaczynski_5',
    name: 'Kaczynski 5', 
    nameRU: 'Качинских 5',
    nameGE: 'კაჩინსკის 5',
    nameTR: 'Kaczynski 5',
    address: '5 Lech and Maria Kaczynski St',
    addressRU: 'ул. Леха и Марии Качиньских, 5',
    addressGE: 'ლეხ და მარია კაჩინსკების ქ. 5',
    addressTR: '5 Lech ve Maria Kaczynski Sk',
    coordinates: { x: 42, y: 58 },
    schedule: [
      { days: 'Tue, Thu', time: '16:00 - 18:00' },
      { days: 'Sun', time: '11:00 - 13:00' }
    ]
  },
  { 
    id: 'batumi_boulevard',
    name: 'Batumi Boulevard', 
    nameRU: 'Батумский бульвар',
    nameGE: 'ბათუმის ბულვარი',
    nameTR: 'Batum Bulvarı',
    address: 'Ninoshvili St',
    addressRU: 'ул. Ниношвили',
    addressGE: 'ნინოშვილის ქ.',
    addressTR: 'Ninoshvili Sk',
    coordinates: { x: 30, y: 60 },
    schedule: [
      { days: 'Tue, Thu', time: '18:00 - 20:00' },
      { days: 'Sun', time: '12:00 - 14:00' }
    ]
  },
  { 
    id: 'heroes_park',
    name: 'Heroes Park', 
    nameRU: 'Парк Героев',
    nameGE: 'გმირთა პარკი',
    nameTR: 'Kahramanlar Parkı',
    address: '2 Sulkhan-Saba Orbeliani St',
    addressRU: 'ул. Сулхан-Саба Орбелиани, 2',
    addressGE: 'სულხან-საბა ორბელიანის ქ. 2',
    addressTR: '2 Sulkhan-Saba Orbeliani Sk',
    coordinates: { x: 60, y: 35 },
    schedule: [
      { days: 'Mon, Wed, Fri', time: '15:00 - 17:00' },
      { days: 'Sat', time: '10:00 - 12:00' }
    ]
  }
];
