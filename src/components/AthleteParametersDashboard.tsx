import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronDown, ChevronUp, Activity, Info, Save, Calendar, Clock, 
  TrendingUp, Trash2, CheckCircle2, History, RotateCcw, Award, Sparkles, User, HelpCircle,
  Dribbble, Target, Trophy, Star, Zap, Phone, FileText, Check, X
} from 'lucide-react';
import { Card, Button, Badge } from './UI';
import { collection, query, where, addDoc, getDocs, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth, processRegistrationStatus } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Metadata for the metrics
export interface ParameterMeta {
  key: string;
  label: Record<string, string>;
  unit: string;
  group: 'health' | 'running' | 'start_energy' | 'agility' | 'elasticity' | 'muscle_power';
  icon: any;
  color: 'teal' | 'sunset' | 'blue';
  description: Record<string, string>;
  placeholder: string;
  step: string;
}

export const PARAMETERS_METADATA: Record<string, ParameterMeta> = {
  height: {
    key: 'height',
    group: 'health',
    icon: Activity,
    color: 'teal',
    unit: 'cm',
    label: {
      EN: 'Height, cm',
      RU: 'Рост, см',
      GE: 'სიმაღლე, სმ'
    },
    description: {
      EN: 'Athlete\'s height in centimeters. Essential for tracking physical growth speed, posture development, and step stride potential.',
      RU: 'Рост спортсмена в сантиметрах. Необходим для отслеживания физического развития, темпов роста и анализа длины шага.',
      GE: 'სპორტსმენის სიმაღლე სანტიმეტრებში. აუცილებელია ფიზიკური ზრდის ტემპის, სხეულის პროპორციებისა და ნაბიჯის სიგრძის ანალიზისთვის.'
    },
    placeholder: '145.5',
    step: '0.1'
  },
  weight: {
    key: 'weight',
    group: 'health',
    icon: Activity,
    color: 'sunset',
    unit: 'kg',
    label: {
      EN: 'Weight, kg',
      RU: 'Вес, кг',
      GE: 'წონა, კგ'
    },
    description: {
      EN: 'Athlete\'s current body weight in kilograms. Used to monitor muscle mass development and calorie energy balance.',
      RU: 'Текущий вес спортсмена в килограммах. Используется для мониторинга прироста мышечной массы и баланса энергии.',
      GE: 'სპორტსმენის მიმდინარე წონა კილოგრამებში. გამოიყენება კუნთოვანი მასის განვითარებისა და ენერგეტიკული ბალანსის მონიტორინგისთვის.'
    },
    placeholder: '35.2',
    step: '0.1'
  },
  lungs_volume: {
    key: 'lungs_volume',
    group: 'health',
    icon: Activity,
    color: 'blue',
    unit: 'sec',
    label: {
      EN: 'Lungs volume (breath hold time), t',
      RU: 'Объем легких (задержка дыхания), t',
      GE: 'ფილტვის მოცულობა (სუნთქვის შეკავება), t'
    },
    description: {
      EN: 'Duration in seconds the athlete can hold breath after deep inhalation. Measures anaerobic endurance, carbon dioxide tolerance, and lung control.',
      RU: 'Время задержки дыхания в секундах после глубокого вдоха. Измеряет анаэробную выносливость и объем контроля дыхания.',
      GE: 'სუნთქვის შეკავების დრო წამებში ღრმა ჩასუნთქვის შემდეგ. ზომავს ანაერობულ გამძლეობას და სუნთქვის კონტროლის უნარს.'
    },
    placeholder: '45',
    step: '1'
  },
  run_10m: {
    key: 'run_10m',
    group: 'running',
    icon: Activity,
    color: 'teal',
    unit: 'sec',
    label: {
      EN: '10 meters stand still (acceleration)',
      RU: '10 метров с места (ускорение)',
      GE: '10 მეტრი ადგილიდან (აჩქარება)'
    },
    description: {
      EN: 'Sprinting time over 10 meters, starting stationary. Assesses raw explosive power, initial traction control, and acceleration reflexes.',
      RU: 'Время бега на 10 метров с места. Оценивает стартовую взрывную силу, качество сцепления и реактивный разгон спортсмена.',
      GE: 'აღნიშნავს 10 მეტრზე სირბილის დროს ადგილიდან. აფასებს სტარტის ფეთქებად ძალას, მოჭიდებასა და რეაქტიულ აჩქარებას.'
    },
    placeholder: '3.12',
    step: '0.01'
  },
  run_30m: {
    key: 'run_30m',
    group: 'running',
    icon: Activity,
    color: 'sunset',
    unit: 'sec',
    label: {
      EN: '30 meters stand activated (max velocity)',
      RU: '30 метров на ходу / с датчиком (макс. скорость)',
      GE: '30 მეტრი მოძრაობიდან (მაქს. სიჩქარე)'
    },
    description: {
      EN: 'Sprinting speed over 30 meters with flying/motion-activated start. Measures maximum sprint velocity and neuromuscular coordination speed.',
      RU: 'Время спринта на 30 метров, замеряемое по движению (с датчика). Позволяет измерить максимальную пиковую скорость.',
      GE: '30 მეტრზე სირბილის დრო, რომელიც იზომება მოძრაობის დასაწყისში სენსორის გააქტიურებით. ზომავს მაქსიმალურ პიკურ სიჩქარეს.'
    },
    placeholder: '5.85',
    step: '0.01'
  },
  run_100m: {
    key: 'run_100m',
    group: 'running',
    icon: Activity,
    color: 'sunset',
    unit: 'sec',
    label: {
      EN: '100 meters stand still',
      RU: '100 метров с места',
      GE: '100 მეტრი ადგილიდან'
    },
    description: {
      EN: 'Sprinting time over 100 meters, starting stationary. Measures maximum speed endurance and drive-phase sprint sustainability.',
      RU: 'Время бега на 100 метров с места. Измеряет скоростную выносливость и способность поддерживать циклическое ускорение.',
      GE: 'აღნიშნავს 100 მეტრზე სირბილის დროს ადგილიდან. ზომავს მაქსიმალური სიჩქარის შენარჩუნების უნარსა და გამძლეობას.'
    },
    placeholder: '13.50',
    step: '0.01'
  },
  jump_forward_stand: {
    key: 'jump_forward_stand',
    group: 'start_energy',
    icon: Activity,
    color: 'blue',
    unit: 'cm',
    label: {
      EN: 'Forward Jump Stand still',
      RU: 'Прыжок в длину с места',
      GE: 'სიგრძეში ნახტომი ადგილიდან'
    },
    description: {
      EN: 'Distance of forward horizontal jump starting from a stationary position. Measures lower body explosive power and hip extension dynamics.',
      RU: 'Дальность прыжка вперед в длину с места. Измеряет взрывную силу ног и координацию толчка в горизонтальной плоскости.',
      GE: 'სიგრძეში ნახტომის მანძილი ადგილიდან. ზომავს ფეხების ფეთქებად ძალასა და ბიძგის კოორდინაციას.'
    },
    placeholder: '185',
    step: '1'
  },
  jump_upward_stand: {
    key: 'jump_upward_stand',
    group: 'start_energy',
    icon: Activity,
    color: 'blue',
    unit: 'cm',
    label: {
      EN: 'Upward Jump Stand still',
      RU: 'Прыжок вверх с места',
      GE: 'სიმაღლეში ნახტომი ადგილიდან'
    },
    description: {
      EN: 'Vertical jump height starting from a stationary position. Evaluates vertical takeoff power and explosive extension.',
      RU: 'Высота вертикального прыжка вверх без разгона. Оценивает силу вертикального отталкивания ног.',
      GE: 'ვერტიკალური ნახტომის სიმაღლე ადგილიდან. აფასებს ვერტიკალური აცორცების ძალას.'
    },
    placeholder: '35',
    step: '1'
  },
  jump_upward_run: {
    key: 'jump_upward_run',
    group: 'start_energy',
    icon: Activity,
    color: 'blue',
    unit: 'cm',
    label: {
      EN: 'Upward Jump Running',
      RU: 'Прыжок вверх с разбега',
      GE: 'სიმაღლეში ნახტომი გამოქანებით'
    },
    description: {
      EN: 'Vertical jump height with a running start. Assesses the transfer of horizontal speed to vertical power.',
      RU: 'Высота вертикального прыжка с разбега. Показывает эффективность перевода горизонтальной скорости во взрывную силу вверх.',
      GE: 'ვერტიკალური ნახტომის სიმაღლე გამოქანებით. გვიჩვენებს ჰორიზონტალური სიჩქარის გარდაქმნას ვერტიკალურ ძალაში.'
    },
    placeholder: '45',
    step: '1'
  },
  agility_t_test: {
    key: 'agility_t_test',
    group: 'agility',
    icon: Activity,
    color: 'sunset',
    unit: 'sec',
    label: {
      EN: 'T-test (agility)',
      RU: 'Т-тест (ловкость)',
      GE: 'T-ტესტი (სისწრაფე და მანევრირება)'
    },
    description: {
      EN: 'Multi-directional agility running course including forward, side-to-side, and backward movements. Tests overall coordination and stability.',
      RU: 'Тест на многонаправленную ловкость и координацию, включающий бег вперед, приставным шагом боком и спиной вперед.',
      GE: 'მრავალმხრივი მანევრირების ტესტი, რომელიც მოიცავს სირბილს წინ, გვერდითი ნაბიჯებითა და ზურგით წინ.'
    },
    placeholder: '10.50',
    step: '0.01'
  },
  sit_and_reach: {
    key: 'sit_and_reach',
    group: 'elasticity',
    icon: Activity,
    color: 'teal',
    unit: 'cm',
    label: {
      EN: 'Sit and Reach (flexibility)',
      RU: 'Наклон из положения сидя (гибкость)',
      GE: 'დახრა მჯდომარე მდგომარეობიდან'
    },
    description: {
      EN: 'Measures flexibility of lower back and hamstring muscles, bending forward from a seated position with straight legs.',
      RU: 'Измеряет гибкость нижней части спины и задней поверхности бедра при наклоне вперед сидя с прямыми ногами.',
      GE: 'ზომავს წელისა და ბარძაყის უკანა კუნთების მოქნილობას მჯდომარე მდგომარეობაში წინ დახრისას.'
    },
    placeholder: '8',
    step: '1'
  },
  longitudinal_split: {
    key: 'longitudinal_split',
    group: 'elasticity',
    icon: Activity,
    color: 'teal',
    unit: 'cm',
    label: {
      EN: 'Longitudinal split',
      RU: 'Продольный шпагат',
      GE: 'გრძივი შპაგატი'
    },
    description: {
      EN: 'Hamstring and hip flexor range of motion checked in centimeters target clearance (distance to floor).',
      RU: 'Диапазон подвижности тазобедренного сустава на продольном шпагате (в см до пола).',
      GE: 'ბარძაყის სახსრის მოძრაობის დიაპაზონი გრძივ შპაგატში (სანტიმეტრებში იატაკამდე).'
    },
    placeholder: '2',
    step: '1'
  },
  transverse_split: {
    key: 'transverse_split',
    group: 'elasticity',
    icon: Activity,
    color: 'teal',
    unit: 'cm',
    label: {
      EN: 'Transverse split',
      RU: 'Поперечный шпагат',
      GE: 'განივი შპაგატი'
    },
    description: {
      EN: 'Adductor and hip mobility measured via remaining distance in centimeters from pelvis center to the floor.',
      RU: 'Подвижность отводящих мыщц бедра и таза на поперечном шпагате (в см до пола).',
      GE: 'ბარძაყის მომზიდველი კუნთების მობილობა განივ შპაგატში (სანტიმეტრებში იატაკამდე).'
    },
    placeholder: '4',
    step: '1'
  },
  pushups: {
    key: 'pushups',
    group: 'muscle_power',
    icon: Activity,
    color: 'blue',
    unit: 'reps',
    label: {
      EN: 'Pushups (30 sec)',
      RU: 'Отжимания за 30 сек',
      GE: 'აზიდვები 30 წამში'
    },
    description: {
      EN: 'Total number of standard full-range pushups performed in 30 seconds. Measures upper-body muscle endurance and triceps strength.',
      RU: 'Количество правильно выполненных отжиманий за 30 секунд. Измеряет силовую выносливость грудных мышц и трицепсов.',
      GE: 'სტანდარტული აზიდვების რაოდენობა 30 წამში. ზომავს მხრებისა და ხელების ძალასა და გამძლეობას.'
    },
    placeholder: '25',
    step: '1'
  },
  standups: {
    key: 'standups',
    group: 'muscle_power',
    icon: Activity,
    color: 'blue',
    unit: 'reps',
    label: {
      EN: 'Standups (30 sec)',
      RU: 'Приседания за 30 сек',
      GE: 'ჩაჯდომები 30 წამში'
    },
    description: {
      EN: 'Number of rapid squats or bodyweight standups executed with proper posture in 30 seconds. Focuses on lower body power endurance.',
      RU: 'Количество приседаний за 30 секунд с полной амплитудой. Оценивает силовую выносливость четырехглавых и ягодичных мышц.',
      GE: 'ჩაჯდომების რაოდენობა 30 წამში. აფასებს ქვედა ტანის კუნთების გამძლეობას.'
    },
    placeholder: '30',
    step: '1'
  },
  plank: {
    key: 'plank',
    group: 'muscle_power',
    icon: Activity,
    color: 'blue',
    unit: 'sec',
    label: {
      EN: 'Plank hold duration',
      RU: 'Удержание планки',
      GE: 'პლანკა'
    },
    description: {
      EN: 'Maximum duration in seconds holding a straight elbow-support core plank posture. Tests core stability and muscle perseverance.',
      RU: 'Максимальное время удержания упора лежа на локтях (планка) в секундах. Оценивает статическую выносливость мышц кора.',
      GE: 'იდაყვებზე პლანკის შენარჩუნების მაქსიმალური დრო წამებში. ზომავს კორპუსის სტატიკურ გამძლეობას.'
    },
    placeholder: '90',
    step: '1'
  }
};

// Generates baseline/demo historical parameter records if DB has none yet
const getBaselineDemoRecords = (athleteId: string, parameterKey: string, masterName: string) => {
  const now = new Date();
  
  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const master = masterName || 'Coach Roman';

  const sets: Record<string, any[]> = {
    height: [
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 138.2, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 139.5, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 141.0, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 142.4, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    weight: [
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 31.4, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 32.1, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 32.8, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 33.5, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    lungs_volume: [
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 35, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 41, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 45, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'General Health', value: 48, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    run_10m: [
      { athleteId, parameterKey, parameterGroup: 'Running', value: 3.52, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 3.44, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 3.31, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 3.22, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    run_30m: [
      { athleteId, parameterKey, parameterGroup: 'Running', value: 6.78, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 6.55, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 6.32, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 6.14, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    run_100m: [
      { athleteId, parameterKey, parameterGroup: 'Running', value: 18.2, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 17.5, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 16.8, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Running', value: 16.20, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    jump_forward_stand: [
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 165, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 172, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 178, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 185, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    jump_upward_stand: [
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 28, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 31, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 33, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 35, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    jump_upward_run: [
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 38, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 41, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 43, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Start Energy', value: 45, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    agility_t_test: [
      { athleteId, parameterKey, parameterGroup: 'Agility', value: 12.50, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Agility', value: 11.90, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Agility', value: 11.20, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Agility', value: 10.50, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    sit_and_reach: [
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 3, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 5, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 6, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 8, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    longitudinal_split: [
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 10, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 7, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 4, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 2, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    transverse_split: [
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 12, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 9, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 6, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Elasticity', value: 4, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    pushups: [
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 15, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 18, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 22, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 25, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    standups: [
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 20, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 24, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 27, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 30, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ],
    plank: [
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 45, recordedAt: daysAgo(90), masterName: 'Coach Roman', masterId: 'demo-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 60, recordedAt: daysAgo(60), masterName: 'Master Davit', masterId: 'demo-2' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 75, recordedAt: daysAgo(30), masterName: master, masterId: 'm-1' },
      { athleteId, parameterKey, parameterGroup: 'Muscle Power', value: 90, recordedAt: daysAgo(5), masterName: master, masterId: 'm-1' }
    ]
  };

  return sets[parameterKey] || [];
};

export interface LevelDetails {
  tier: string;
  title: string;
  minXp: number;
  maxXp: number;
  nextXpNeeded: number;
  progressPercent: number;
}

export function getStudentLevelInfo(xp: number): LevelDetails {
  if (xp < 100) {
    return {
      tier: "Level 1",
      title: "nookie",
      minXp: 0,
      maxXp: 100,
      nextXpNeeded: 100 - xp,
      progressPercent: Math.max(0, Math.min(100, (xp / 100) * 100))
    };
  } else if (xp < 300) {
    return {
      tier: "Level 1",
      title: "player",
      minXp: 100,
      maxXp: 300,
      nextXpNeeded: 300 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 100) / 200) * 100))
    };
  } else if (xp < 500) {
    return {
      tier: "Level 1",
      title: "baller",
      minXp: 300,
      maxXp: 500,
      nextXpNeeded: 500 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 300) / 200) * 100))
    };
  } else if (xp < 1000) {
    return {
      tier: "Level 2",
      title: "Advanced",
      minXp: 500,
      maxXp: 1000,
      nextXpNeeded: 1000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 500) / 500) * 100))
    };
  } else if (xp < 5000) {
    return {
      tier: "Level 2",
      title: "Pro",
      minXp: 1000,
      maxXp: 5000,
      nextXpNeeded: 5000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 1000) / 4000) * 100))
    };
  } else if (xp < 10000) {
    return {
      tier: "Level 2",
      title: "Star",
      minXp: 5000,
      maxXp: 10000,
      nextXpNeeded: 10000 - xp,
      progressPercent: Math.max(0, Math.min(100, ((xp - 5000) / 5000) * 100))
    };
  } else {
    return {
      tier: "Level 2 Max",
      title: "Star",
      minXp: 10000,
      maxXp: 10000,
      nextXpNeeded: 0,
      progressPercent: 100
    };
  }
}

export default function AthleteParametersDashboard({ 
  athlete, 
  master, 
  onBack, 
  isEditable = false, 
  lang = 'RU',
  activeSubsection,
  setActiveSubsection,
  hideHeaderCard = false
}: { 
  athlete: any; 
  master?: any; 
  onBack: () => void; 
  isEditable?: boolean; 
  lang?: string; 
  activeSubsection?: 'profile' | 'balance' | 'parameters';
  setActiveSubsection?: (sec: 'profile' | 'balance' | 'parameters') => void;
  hideHeaderCard?: boolean;
}) {
  const navigate = useNavigate();
  const [selectedParamKey, setSelectedParamKey] = useState<string>('height');
  const [instructionExpanded, setInstructionExpanded] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newValue, setNewValue] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [recordTime, setRecordTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'res_error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hoveredPointData, setHoveredPointData] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [paramTab, setParamTab] = useState<'list' | 'details'>('list');
  const [activeGroupTab, setActiveGroupTab] = useState<string>(() => {
    const selectedParam = PARAMETERS_METADATA[selectedParamKey];
    return selectedParam?.group || 'health';
  });

  useEffect(() => {
    if (selectedParamKey) {
      const selectedParam = PARAMETERS_METADATA[selectedParamKey];
      if (selectedParam && selectedParam.group !== activeGroupTab) {
        setActiveGroupTab(selectedParam.group);
      }
    }
  }, [selectedParamKey]);

  const [activeAthlete, setActiveAthlete] = useState<any>(athlete);

  const [internalSubsection, setInternalSubsection] = useState<'profile' | 'balance' | 'parameters'>('parameters');
  const currentSubsection = activeSubsection || internalSubsection;
  const setSubsection = (sec: 'profile' | 'balance' | 'parameters') => {
    setInternalSubsection(sec);
    if (setActiveSubsection) {
      setActiveSubsection(sec);
    }
  };

  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  useEffect(() => {
    if (!activeAthlete?.id) return;
    const q = query(
      collection(db, 'payment_history'),
      where('athleteId', '==', activeAthlete.id)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as any));
      const sorted = docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setPaymentHistory(sorted);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'payment_history');
    });
    return () => unsubscribe();
  }, [activeAthlete?.id]);

  const logPurchase = async (newTotal: number, type: 'purchase' | 'reset', label: string) => {
    if (!activeAthlete?.id) return;
    try {
      await addDoc(collection(db, 'payment_history'), {
        athleteId: activeAthlete.id,
        newTotal,
        previousTotal: activeAthlete.totalPaidClasses || 0,
        type,
        label,
        updatedAt: new Date().toISOString(),
        masterId: master?.id || master?.phone || 'coach-roman',
        masterName: master?.fullName || 'Coach Roman'
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'payment_history');
    }
  };

  // Real-time student profile listener
  useEffect(() => {
    if (!athlete?.id) return;
    const unsubscribe = onSnapshot(doc(db, 'registrations', athlete.id), (docSnap) => {
      if (docSnap.exists()) {
        setActiveAthlete({ id: docSnap.id, ...docSnap.data() });
      }
    });
    return () => unsubscribe();
  }, [athlete?.id]);

  const activeMeta = PARAMETERS_METADATA[selectedParamKey];
  const activeLang = lang === 'RU' || lang === 'GE' || lang === 'EN' ? lang : 'EN';

  // Real-time parameters listener for this athlete
  useEffect(() => {
    if (!athlete?.id) return;
    setLoading(true);

    const q = query(
      collection(db, 'parameter_records'),
      where('athleteId', '==', athlete.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecords(docs);
      setLoading(false);
    }, (err) => {
      setLoading(false);
      handleFirestoreError(err, OperationType.LIST, 'parameter_records');
    });

    return () => unsubscribe();
  }, [athlete?.id]);

  // Merge database records with baseline demo records so there is always a time series shown
  const activeParamRecords = React.useMemo(() => {
    // Filter database records for this parameter key
    const dbRecords = records.filter(r => r.parameterKey === selectedParamKey);

    // Sort chronologically by recordedAt
    return dbRecords.sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }, [records, selectedParamKey]);

  // Keep track of the current values of each metric to show on cards
  const currentMetricValues = React.useMemo(() => {
    const latestValues: Record<string, { value: number; date: string; master: string }> = {};

    Object.keys(PARAMETERS_METADATA).forEach(key => {
      const keyRecords = records.filter(r => r.parameterKey === key);
      
      if (keyRecords.length > 0) {
        // Find latest by recordedAt
        const sorted = [...keyRecords].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
        latestValues[key] = {
          value: sorted[0].value,
          date: sorted[0].recordedAt,
          master: sorted[0].masterName || sorted[0].master || 'Coach Roman'
        };
      }
    });

    return latestValues;
  }, [records]);

  // Check if a parameter's latest recording is stale (e.g. >= 20 days ago)
  const staleMetrics = React.useMemo(() => {
    const staleMap: Record<string, boolean> = {};
    const now = new Date();
    
    Object.keys(PARAMETERS_METADATA).forEach(key => {
      const latest = currentMetricValues[key];
      if (latest) {
        const recordedDate = new Date(latest.date);
        const diffTime = Math.abs(now.getTime() - recordedDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 20) {
          staleMap[key] = true;
        }
      }
    });

    return staleMap;
  }, [currentMetricValues]);

  const staleParametersCount = React.useMemo(() => {
    return Object.values(staleMetrics).filter(Boolean).length;
  }, [staleMetrics]);

  const totalParametersCount = Object.keys(PARAMETERS_METADATA).length;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue || isNaN(Number(newValue))) {
      setFeedback({
        type: 'res_error',
        text: lang === 'RU' ? 'Пожалуйста, введите корректное числовое значение' : 'Please enter a valid numeric value'
      });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      // Build proper ISO recorded date-time string
      const localString = `${recordDate}T${recordTime}:00`;
      const finalRecordedAt = new Date(localString).toISOString();

      const newRecord = {
        athleteId: athlete.id,
        parameterKey: selectedParamKey,
        parameterGroup: activeMeta.group === 'health' ? 'General Health' :
                        activeMeta.group === 'running' ? 'Running' :
                        activeMeta.group === 'start_energy' ? 'Start Energy' :
                        activeMeta.group === 'agility' ? 'Agility' :
                        activeMeta.group === 'elasticity' ? 'Elasticity' : 'Muscle Power',
        value: Number(newValue),
        recordedAt: finalRecordedAt,
        masterId: master?.id || master?.phone || 'coach-roman',
        masterName: master?.fullName || 'Coach Roman',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'parameter_records'), newRecord);

      setNewValue('');
      setFeedback({
        type: 'success',
        text: lang === 'RU' ? 'Значение сохранено в дневнике прогресса' : 'Value saved into progress logs'
      });

      // Clear feedback after 4 seconds
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: 'res_error',
        text: lang === 'RU' ? 'Ошибка сохранения данных' : 'Failed to save value'
      });
      handleFirestoreError(err, OperationType.CREATE, 'parameter_records');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, 'parameter_records', id));
      setShowDeleteConfirm(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'parameter_records/' + id);
    }
  };

  // Helper to render responsive SVG chart
  const renderSVGChart = () => {
    if (activeParamRecords.length === 0) {
      return (
        <div id="no-records-chart-placeholder" className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed border-brand-navy/10 rounded-3xl bg-brand-navy/[0.01]">
          <TrendingUp className="w-10 h-10 text-brand-navy/20 mb-3 animate-[pulse_3s_infinite]" />
          <p className="font-extrabold text-brand-navy/70 text-sm uppercase italic tracking-wide">
            {lang === 'RU' ? 'Нет замеров для этого параметра' : 'No entries recorded yet'}
          </p>
          <p className="text-xs text-brand-navy/40 mt-1 max-w-sm">
            {lang === 'RU' 
              ? 'Внесите первый результат ниже, чтобы начать отслеживать динамику спортсмена.' 
              : 'Add the first performance value below to trace metrics on this dynamic graph.'}
          </p>
        </div>
      );
    }

    const values = activeParamRecords.map(r => r.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const delta = maxVal - minVal;

    // Give some padding on chart top and bottom so lines don't hit borders
    const paddingMultiplier = selectedParamKey === 'height' ? 0.05 : 0.15;
    const chartMin = minVal - (delta === 0 ? 5 : delta * paddingMultiplier);
    const chartMax = maxVal + (delta === 0 ? 5 : delta * paddingMultiplier);
    const chartDelta = chartMax - chartMin;

    const width = 600;
    const height = 240;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const graphWidth = width - paddingLeft - paddingRight;
    const graphHeight = height - paddingTop - paddingBottom;

    // Calculate (x, y) coordinates for each data point
    const points = activeParamRecords.map((rec, idx) => {
      const x = paddingLeft + (idx / (activeParamRecords.length - 1 || 1)) * graphWidth;
      const progress = (rec.value - chartMin) / chartDelta;
      const y = height - paddingBottom - progress * graphHeight;
      return { x, y, record: rec };
    });

    // Make smooth SVG path or standard lines
    let dPath = '';
    points.forEach((p, idx) => {
      if (idx === 0) {
        dPath += `M ${p.x} ${p.y}`;
      } else {
        dPath += ` L ${p.x} ${p.y}`;
      }
    });

    // Generate coordinate ticks for Y-Axis
    const yTicksCount = 4;
    const yTicks = Array.from({ length: yTicksCount }).map((_, idx) => {
      const val = chartMin + (idx / (yTicksCount - 1)) * chartDelta;
      const y = height - paddingBottom - (idx / (yTicksCount - 1)) * graphHeight;
      return { val, y };
    });

    return (
      <div className="relative w-full overflow-hidden select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line 
                x1={paddingLeft} 
                y1={tick.y} 
                x2={width - paddingRight} 
                y2={tick.y} 
                stroke="currentColor" 
                className="text-brand-navy/[0.04]"
                strokeDasharray="4 4" 
              />
              <text 
                x={paddingLeft - 10} 
                y={tick.y + 4} 
                textAnchor="end" 
                className="font-mono text-[9px] font-black text-brand-navy/30 italic fill-current"
              >
                {tick.val.toFixed(selectedParamKey.includes('run') ? 2 : 1)}
              </text>
            </g>
          ))}

          {/* X Axis division lines */}
          {points.map((p, i) => (
            <line
              key={i}
              x1={p.x}
              y1={paddingTop}
              x2={p.x}
              y2={height - paddingBottom}
              stroke="currentColor"
              className="text-brand-navy/[0.02]"
            />
          ))}

          {/* Area under line gradient */}
          {points.length > 1 && (
            <path
              d={`${dPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`}
              fill="url(#chartGradient)"
              className="opacity-50"
            />
          )}

          {/* Main Time series Line */}
          <path
            d={dPath}
            fill="none"
            stroke="currentColor"
            className="text-brand-teal"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Decorative highlight nodes */}
          {points.map((p, idx) => {
            const isHovered = hoveredPointData?.record?.recordedAt === p.record.recordedAt;
            return (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "8" : "5"}
                  className="fill-brand-teal stroke-white cursor-pointer transition-all duration-300"
                  strokeWidth={isHovered ? "2.5" : "1.5"}
                  onMouseEnter={() => setHoveredPointData(p)}
                  onClick={() => setHoveredPointData(p)}
                />
              </g>
            );
          })}

          {/* X Axis dates label */}
          {points.map((p, idx) => {
            const dateStr = new Date(p.record.recordedAt).toLocaleDateString(
              lang === 'RU' ? 'ru-RU' : 'en-US', 
              { month: 'short', day: 'numeric' }
            );
            return (
              <text
                key={idx}
                x={p.x}
                y={height - paddingBottom + 16}
                textAnchor="middle"
                className="text-[8px] font-black fill-current text-brand-navy/45 tracking-tight italic"
              >
                {dateStr}
              </text>
            );
          })}

          {/* SVG Definitions for Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2db9b7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2db9b7" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating details tooltip */}
        <div className="h-6 mt-2 flex items-center justify-between text-[11px] font-black italic uppercase tracking-wider text-brand-navy/60 bg-brand-navy/5 px-4 py-2 rounded-xl">
          {hoveredPointData ? (
            <div className="flex justify-between w-full items-center">
              <span>{new Date(hoveredPointData.record.recordedAt).toLocaleDateString(lang === 'RU' ? 'ru-RU' : 'en-US', { hour: '2-digit', minute: '2-digit', month: 'long', day: 'numeric', year: 'numeric' })}:</span>
              <span className="text-brand-teal ml-1 font-black">{hoveredPointData.record.value} {activeMeta.unit}</span>
              <span className="opacity-50 ml-2 font-black tracking-normal flex items-center gap-1 text-[9px]">
                <User className="w-3 h-3 text-brand-teal" />
                 {hoveredPointData.record.masterName}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 opacity-40 text-[9px]">
              <HelpCircle className="w-3.5 h-3.5" />
              {lang === 'RU' ? 'Наведите на точку графика для просмотра записи' : 'Hover over chart nodes to inspect values'}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getTranslatedGroup = (group: string) => {
    if (group === 'health') {
      return lang === 'RU' ? 'ОБЩЕЕ ЗДОРОВЬЕ' : lang === 'GE' ? 'ჯანმრთელობა' : 'GENERAL HEALTH';
    }
    return lang === 'RU' ? 'БЕГ И СПРИНТ' : lang === 'GE' ? 'რბენა და სიჩქარე' : 'RUNNING METRICS';
  };

  // Experience, level and badges calculation
  const xp = activeAthlete.xp !== undefined ? Number(activeAthlete.xp) : (activeAthlete.id === 'demo-athlete' || activeAthlete.studentName?.toLowerCase().includes('luka') || activeAthlete.studentName?.toLowerCase().includes('лук') || activeAthlete.studentName?.toLowerCase().includes('ლუკ') || activeAthlete.studentName === 'Maxim Ivanov' ? 1300 : 0);
  const studentLevel = getStudentLevelInfo(xp);

  const baseBadges = [
    { title: lang === 'RU' ? 'Первый шаг' : 'First Step', desc: lang === 'RU' ? 'Регистрация' : 'Registration', icon: Target, date: 'May 2026' }
  ];

  const dbBadges: any[] = [];
  const allBadges: any[] = [];

  const mainRender = () => {
    return (
      <div className="w-full space-y-6">
            {/* Parameters Section Stat Banner */}
            <div className="bg-white/80 border border-black/5 rounded-[32px] p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-navy/50 mb-1">
                    {lang === 'RU' ? 'Секция параметров' : lang === 'GE' ? 'პარამეტრების სექცია' : 'Parameters Section'}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span id="total-params-count" className="text-3xl font-black italic tracking-tighter text-brand-navy">
                      {totalParametersCount}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-brand-navy/40 tracking-wider">
                      {lang === 'RU' ? 'всего параметров' : lang === 'GE' ? 'სულ პარამეტრი' : 'total parameters'}
                    </span>
                  </div>
                </div>

                {staleParametersCount > 0 ? (
                  <div className="text-right flex flex-col items-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span id="stale-params-count" className="text-xs font-black tracking-tight uppercase leading-none">
                        {staleParametersCount} {lang === 'RU' ? 'УСТАРЕЛИ' : lang === 'GE' ? 'მოძველდა' : 'STALE'}
                      </span>
                    </div>
                    <p className="text-[8px] text-brand-navy/35 font-semibold uppercase tracking-wider mt-1">
                      {lang === 'RU' ? 'требуется замер' : lang === 'GE' ? 'საჭიროებს გაზომვას' : 'needs measurement'}
                    </p>
                  </div>
                ) : (
                  <div className="text-right flex flex-col items-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-xs font-black tracking-tight uppercase leading-none">
                        {lang === 'RU' ? 'АКТУАЛЬНО' : lang === 'GE' ? 'აქტუალური' : 'ALL FRESH'}
                      </span>
                    </div>
                    <p className="text-[8px] text-brand-navy/35 font-semibold uppercase tracking-wider mt-1">
                      {lang === 'RU' ? 'данные свежие' : lang === 'GE' ? 'ყველა მონაცემი ახალია' : 'all metrics up-to-date'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {((): React.ReactNode => {
              const PARAM_GROUPS_CONFIG = [
                { key: 'health' as const, color: 'teal' as const, dotColor: 'bg-brand-teal', labelRU: 'ОБЩЕЕ ЗДОРОВЬЕ', labelEN: 'GENERAL HEALTH', labelGE: 'ჯანმრთელობა', subtitleRU: 'ЗДОРОВЬЕ', subtitleEN: 'HEALTH', subtitleGE: 'ჯანმრთელობა' },
                { key: 'running' as const, color: 'sunset' as const, dotColor: 'bg-brand-sunset', labelRU: 'БЕГ И СПРИНТ', labelEN: 'RUNNING METRICS', labelGE: 'რბენა და სიჩქარე', subtitleRU: 'БЕГ', subtitleEN: 'SPRINT', subtitleGE: 'რბена' },
                { key: 'start_energy' as const, color: 'blue' as const, dotColor: 'bg-brand-blue', labelRU: 'СТАРТОВАЯ ЭНЕРГИЯ', labelEN: 'START ENERGY', labelGE: 'სტარტის ენერგია', subtitleRU: 'СТАРТ', subtitleEN: 'START', subtitleGE: 'სტარტი' },
                { key: 'agility' as const, color: 'sunset' as const, dotColor: 'bg-brand-sunset', labelRU: 'ЛОВКОСТЬ И КООРДИНАЦИЯ', labelEN: 'AGILITY & DRILLS', labelGE: 'სისწრაფე და მანევრირება', subtitleRU: 'ЛОВКОСТЬ', subtitleEN: 'AGILITY', subtitleGE: 'სისწრაფე' },
                { key: 'elasticity' as const, color: 'teal' as const, dotColor: 'bg-brand-teal', labelRU: 'ГИБКОСТЬ И ЭЛАСТИЧНОСТЬ', labelEN: 'FLEXIBILITY & ELASTICITY', labelGE: 'მოქნილობა', subtitleRU: 'ГИБКОСТЬ', subtitleEN: 'FLEX', subtitleGE: 'მოქნილობა' },
                { key: 'muscle_power' as const, color: 'blue' as const, dotColor: 'bg-brand-blue', labelRU: 'СИЛОВЫЕ ПОКАЗАТЕЛИ', labelEN: 'MUSCLE POWER', labelGE: 'კუნთების ძალა', subtitleRU: 'СИЛА', subtitleEN: 'POWER', subtitleGE: 'ძალა' },
              ];

              return (
                <div className="space-y-6">
                  {/* Parameter Groups Tab bar (Flex wrapping is used so it adapts to mobile / desktop screens cleanly without horizontal scrolling) */}
                  <div className="flex flex-wrap gap-2 p-1 bg-brand-navy/[0.03] border border-brand-navy/5 rounded-2xl select-none">
                    {PARAM_GROUPS_CONFIG.map((group) => {
                      const isActive = activeGroupTab === group.key;
                      const translatedTabName = lang === 'RU' ? group.subtitleRU : lang === 'GE' ? group.subtitleGE : group.subtitleEN;
                      const dotClass = group.dotColor;

                      return (
                        <button
                          key={group.key}
                          type="button"
                          onClick={() => setActiveGroupTab(group.key)}
                          className={`flex-1 min-w-[90px] sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider italic transition-all duration-300 cursor-pointer ${
                            isActive
                              ? 'bg-white text-brand-navy shadow-md shadow-brand-navy/5 scale-[1.02] border border-black/5'
                              : 'text-brand-navy/60 hover:text-brand-navy hover:bg-white/40'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0 ${isActive ? 'animate-pulse' : 'opacity-60'}`} />
                          <span>{translatedTabName}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Group Content */}
                  {(() => {
                    const group = PARAM_GROUPS_CONFIG.find(g => g.key === activeGroupTab);
                    if (!group) return null;

                    const filteredParams = Object.values(PARAMETERS_METADATA).filter(p => p.group === group.key);
                    if (filteredParams.length === 0) return null;

                    const translatedGroupName = lang === 'RU' ? group.labelRU : lang === 'GE' ? group.labelGE : group.labelEN;
                    const translatedSubtitle = lang === 'RU' ? group.subtitleRU : lang === 'GE' ? group.subtitleGE : group.subtitleEN;

                    return (
                      <div key={group.key} className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-4 ${group.dotColor} rounded-full`} />
                          <h4 className="text-[10px] uppercase font-black tracking-[0.2em] italic text-brand-navy/60">{translatedGroupName}</h4>
                        </div>
                        <div className="grid gap-4">
                          {filteredParams.map((p) => {
                            const latest = currentMetricValues[p.key];
                            const cleanLabel = p.label[activeLang];
                            const displayedLabel = cleanLabel;

                            // Color configuration based on chosen active states
                            let subtitleTextColor = 'text-brand-navy/35';

                            if (selectedParamKey === p.key) {
                              if (group.color === 'sunset') {
                                subtitleTextColor = 'text-brand-sunset';
                              } else if (group.color === 'blue') {
                                subtitleTextColor = 'text-brand-blue';
                              } else {
                                subtitleTextColor = 'text-brand-teal';
                              }
                            }

                            const isExpanded = selectedParamKey === p.key;

                            return (
                              <div
                                key={p.key}
                                className={`w-full rounded-[28px] border text-left transition-all duration-300 flex flex-col shadow-sm overflow-hidden ${
                                  isExpanded 
                                    ? 'bg-white border-brand-navy/15 ring-2 ring-brand-navy/5 shadow-md'
                                    : 'bg-white/80 border-black/5 hover:bg-white hover:border-brand-navy/15'
                                }`}
                              >
                                {/* Card Header Trigger */}
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    if (isExpanded) {
                                      setSelectedParamKey('');
                                    } else {
                                      setSelectedParamKey(p.key);
                                      setNewValue('');
                                      setFeedback(null);
                                      setInstructionExpanded(false);
                                    }
                                  }}
                                  className={`w-full p-5 flex items-center justify-between cursor-pointer select-none transition-all duration-300 ${
                                    isExpanded ? 'bg-brand-navy text-white rounded-t-[26px]' : 'text-brand-navy rounded-[26px]'
                                  }`}
                                >
                                  <div className="flex-1 min-w-0 pr-3">
                                    <p className={`text-[9px] uppercase font-black tracking-widest leading-none mb-2 ${
                                      isExpanded ? 'text-brand-teal' : subtitleTextColor
                                    } flex items-center flex-wrap gap-2`}>
                                      <span>{translatedSubtitle}</span>
                                      {staleMetrics[p.key] && (
                                        <span className="inline-flex items-center gap-0.5 text-[8px] text-red-500 font-extrabold uppercase tracking-widest bg-red-500/10 px-1.5 py-0.5 rounded-md shrink-0">
                                          ⚠️ {lang === 'RU' ? 'УСТАРЕЛ' : lang === 'GE' ? 'მოძველდა' : 'STALE'}
                                        </span>
                                      )}
                                    </p>
                                    <h5 className="font-sans font-black italic uppercase text-sm leading-snug block truncate">{cleanLabel}</h5>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right">
                                      <span className="text-lg font-mono font-black italic tracking-tighter leading-none">
                                        {latest ? (p.step === '0.01' ? latest.value.toFixed(2) : latest.value) : '--'}
                                      </span>
                                      <span className="text-[9px] font-bold uppercase ml-1 opacity-60">
                                        {p.unit}
                                      </span>
                                    </div>
                                    <div>
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-brand-teal shrink-0" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-brand-navy/30 shrink-0" />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded Section inside Card */}
                                {isExpanded && (
                                  <div className="p-5 sm:p-8 bg-brand-navy/[0.01] rounded-b-[26px] space-y-6">
                                    
                                    {/* 1. CHART VIEW */}
                                    <div className="bg-white border border-brand-navy/5 rounded-3xl p-5 shadow-sm">
                                      <div className="flex items-center justify-between gap-3 mb-4">
                                        <h4 className="text-xs font-black italic uppercase text-brand-navy/60 flex items-center gap-1.5">
                                          <TrendingUp className="w-4 h-4 text-brand-teal" />
                                          {lang === 'RU' ? 'ВРЕМЕННОЙ РЯД (ДИНАМИКА)' : 'TIME SERIES DYNAMICS'}
                                        </h4>
                                        <span className="text-[8px] bg-brand-navy/5 text-brand-navy/40 px-2 py-0.5 rounded font-black italic">
                                          {p.unit.toUpperCase()}
                                        </span>
                                      </div>
                                      
                                      <div className="my-2">
                                        {loading ? (
                                          <div className="flex items-center justify-center py-10 text-brand-teal font-black text-xs uppercase tracking-widest gap-2">
                                            <div className="w-4 h-4 rounded-full border-2 border-brand-teal border-t-transparent animate-spin" />
                                            {lang === 'RU' ? 'СИНХРОНИЗАЦИЯ...' : 'LOADING TIME SERIES...'}
                                          </div>
                                        ) : (
                                          renderSVGChart()
                                        )}
                                      </div>
                                    </div>

                                    {/* 2. EXPANDABLE INSTRUCTIONS */}
                                    <div className="bg-white border border-brand-navy/5 rounded-2xl p-4 shadow-sm">
                                      <button 
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setInstructionExpanded(!instructionExpanded);
                                        }}
                                        className="flex items-center justify-between w-full font-black uppercase text-[10px] tracking-wider text-brand-navy/60 hover:text-brand-navy transition-colors text-left"
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <Info className="w-3.5 h-3.5 text-brand-teal shrink-0" />
                                          {lang === 'RU' ? 'ИНСТРУКЦИЯ И МЕТОДИКА ИЗМЕРЕНИЯ' : 'MEASUREMENT INSTRUCTION & PROTOCOL'}
                                        </span>
                                        {instructionExpanded ? (
                                          <ChevronUp className="w-4 h-4 text-brand-teal shrink-0" />
                                        ) : (
                                          <ChevronDown className="w-4 h-4 text-brand-navy/30 shrink-0" />
                                        )}
                                      </button>

                                      {instructionExpanded && (
                                        <div className="mt-3 text-xs text-brand-navy/70 leading-relaxed pl-5 border-l-2 border-brand-teal/20 animate-in fade-in duration-200">
                                          {p.description[activeLang]}
                                        </div>
                                      )}
                                    </div>

                                    {/* 3. ADD NEW PERFORMANCE VALUE (COACH WRITE MODE) */}
                                    {isEditable && (
                                      <div className="bg-white border border-brand-navy/15 rounded-3xl p-5 shadow-sm text-brand-navy relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-5 opacity-5 pointer-events-none">
                                          <Sparkles className="w-24 h-24 text-brand-teal" />
                                        </div>
                                        
                                        <div className="relative z-10 space-y-4">
                                          <div>
                                            <h4 className="text-xs font-black italic uppercase tracking-tight text-brand-navy mb-1 flex items-center gap-1.5">
                                              <Save className="w-3.5 h-3.5 text-brand-teal" />
                                              {lang === 'RU' ? 'Записать новый замер' : 'Record New Performance Value'}
                                            </h4>
                                            <p className="text-[9px] text-brand-navy/40 uppercase font-black tracking-widest italic">
                                              {lang === 'RU' ? `Для ученика ${activeAthlete.studentName.split(' ')[0]}` : `For athlete ${activeAthlete.studentName.split(' ')[0]}`}
                                            </p>
                                          </div>

                                          <form onSubmit={handleSave} className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                              {/* Value Field */}
                                              <div className="space-y-1.5">
                                                <label className="text-[9px] uppercase font-black tracking-widest text-brand-navy/60 italic block">
                                                  {lang === 'RU' ? `ЗНАЧЕНИЕ (${p.unit}):` : `NEW VALUE (${p.unit}):`}
                                                </label>
                                                <div className="relative">
                                                  <input
                                                    type="number"
                                                    step={p.step}
                                                    min={p.step}
                                                    max="1000"
                                                    required
                                                    value={newValue}
                                                    onChange={(e) => {
                                                      setNewValue(e.target.value);
                                                      setFeedback(null);
                                                    }}
                                                    placeholder={p.placeholder}
                                                    className="w-full h-11 bg-white border border-brand-navy/15 focus:border-brand-teal focus:outline-none text-brand-navy italic font-black text-sm px-3.5 rounded-xl placeholder-brand-navy/30 transition-colors"
                                                  />
                                                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-black italic uppercase text-[9px] text-brand-navy/60 tracking-widest">
                                                    {p.unit}
                                                  </span>
                                                </div>
                                              </div>

                                              {/* Date Selector */}
                                              <div className="space-y-1.5">
                                                <label className="text-[9px] uppercase font-black tracking-widest text-brand-navy/60 italic block flex items-center gap-1">
                                                  <Calendar className="w-3 h-3 text-brand-sunset" />
                                                  {lang === 'RU' ? 'ДАТА ЗАМЕРА:' : 'MEASUREMENT DATE:'}
                                                </label>
                                                <input
                                                  type="date"
                                                  required
                                                  value={recordDate}
                                                  max={new Date().toISOString().split('T')[0]}
                                                  onChange={(e) => setRecordDate(e.target.value)}
                                                  className="w-full h-11 bg-white border border-brand-navy/15 focus:border-brand-teal focus:outline-none text-brand-navy font-black text-[11px] uppercase italic px-3 rounded-xl cursor-pointer transition-colors"
                                                />
                                              </div>

                                              {/* Time Selector */}
                                              <div className="space-y-1.5">
                                                <label className="text-[9px] uppercase font-black tracking-widest text-brand-navy/60 italic block flex items-center gap-1">
                                                  <Clock className="w-3 h-3 text-brand-teal" />
                                                  {lang === 'RU' ? 'ВРЕМЯ:' : 'TIME OF CAPTURE:'}
                                                </label>
                                                <input
                                                  type="time"
                                                  required
                                                  value={recordTime}
                                                  onChange={(e) => setRecordTime(e.target.value)}
                                                  className="w-full h-11 bg-white border border-brand-navy/15 focus:border-brand-teal focus:outline-none text-brand-navy font-black text-[11px] uppercase italic px-3 rounded-xl cursor-pointer transition-colors"
                                                />
                                              </div>
                                            </div>

                                            {/* Feedback status notifications */}
                                            {feedback && (
                                              <div 
                                                className={`p-3 rounded-xl text-[10px] uppercase font-black tracking-widest border flex items-center gap-2 leading-relaxed ${
                                                  feedback.type === 'success' 
                                                  ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal' 
                                                  : 'bg-red-500/10 border-red-500/20 text-red-400'
                                                }`}
                                              >
                                                {feedback.type === 'success' ? (
                                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                                ) : (
                                                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                                )}
                                                <span>{feedback.text}</span>
                                              </div>
                                            )}

                                            <Button 
                                              type="submit"
                                              disabled={isSaving || !newValue}
                                              className="w-full h-11 !rounded-xl bg-brand-teal hover:bg-brand-teal/80 text-white font-black uppercase italic tracking-widest text-[10px] shadow-teal flex items-center justify-center gap-2 transition-colors cursor-pointer"
                                            >
                                              {isSaving ? (
                                                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                              ) : (
                                                <>
                                                  <Save className="w-3.5 h-3.5" />
                                                  {lang === 'RU' ? 'Сохранить изменения' : 'Save Captured Record'}
                                                </>
                                              )}
                                            </Button>
                                          </form>
                                        </div>
                                      </div>
                                    )}

                                    {/* 4. CHRONOLOGY LOG HISTORY */}
                                    <div className="bg-white border border-brand-navy/5 rounded-3xl p-5 shadow-sm">
                                      <div className="flex items-center gap-2 mb-4">
                                        <History className="w-4 h-4 text-brand-teal shrink-0" />
                                        <h4 className="text-sm font-black italic uppercase text-brand-navy tracking-tight">
                                          {lang === 'RU' ? 'Хронология всех измерений' : 'Measurement Chronology Log'}
                                        </h4>
                                      </div>

                                      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                                        {activeParamRecords.length === 0 ? (
                                          <div className="text-center py-6 text-brand-navy/20 uppercase font-black tracking-widest text-[9px]">
                                            {lang === 'RU' ? 'История замеров пуста' : 'No previous measurements recorded'}
                                          </div>
                                        ) : (
                                          [...activeParamRecords].reverse().map((rec, rIdx) => {
                                            const dateText = new Date(rec.recordedAt).toLocaleString(
                                              lang === 'RU' ? 'ru-RU' : 'en-US', 
                                              { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                            );
                                            const isDbGenerated = !!rec.id;

                                            return (
                                              <div 
                                                key={`${rec.id || 'rec'}_${rIdx}`} 
                                                className={`p-3 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                                                  isDbGenerated ? 'bg-white border border-brand-navy/5 shadow-inner' : 'bg-brand-navy/[0.02]'
                                                }`}
                                              >
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span className="text-sm font-black italic text-brand-navy leading-none">
                                                      {rec.value} {p.unit}
                                                    </span>
                                                    {!isDbGenerated && (
                                                      <span className="text-[7px] font-black uppercase bg-brand-sunset/10 text-brand-sunset px-1.5 py-0.5 rounded tracking-widest italic shrink-0 leading-none">
                                                        {lang === 'RU' ? 'базовый' : 'baseline'}
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[8.5px] text-brand-navy/40 font-bold uppercase italic leading-none truncate max-w-xs">{dateText}</p>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                  <div className="text-right shrink-0">
                                                    <p className="text-[6.5px] font-black tracking-widest text-brand-navy/25 uppercase leading-none mb-0.5">{lang === 'RU' ? 'ЗАПИСАЛ' : 'RECORDER'}</p>
                                                    <div className="flex items-center gap-0.5 text-[8.5px] font-black uppercase italic tracking-tighter text-brand-navy/60 leading-none">
                                                      <User className="w-2.5 h-2.5 text-brand-teal" />
                                                      {rec.masterName}
                                                    </div>
                                                  </div>

                                                  {isEditable && isDbGenerated && (
                                                    <div className="shrink-0 relative">
                                                      {showDeleteConfirm === rec.id ? (
                                                        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 shadow-sm">
                                                          <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              handleDeleteRecord(rec.id);
                                                            }}
                                                            className="text-[8px] font-black bg-red-500 text-white uppercase italic px-1.5 py-0.5 rounded cursor-pointer animate-pulse"
                                                          >
                                                            {lang === 'RU' ? 'Да' : 'Ok'}
                                                          </button>
                                                          <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                              e.stopPropagation();
                                                              setShowDeleteConfirm(null);
                                                            }}
                                                            className="text-[8px] font-black text-brand-navy/40 uppercase italic px-1 py-0.5 cursor-pointer"
                                                          >
                                                            x
                                                          </button>
                                                        </div>
                                                      ) : (
                                                        <button 
                                                          type="button"
                                                          onClick={(e) => {
                                                            e.stopPropagation();
                                                            setShowDeleteConfirm(rec.id);
                                                          }}
                                                          className="w-7 h-7 rounded-lg border border-red-100 bg-red-50/20 text-red-400 hover:text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                                                        >
                                                          <Trash2 className="w-3 h-3" />
                                                        </button>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            );
                                          })
                                        )}
                                      </div>
                                    </div>

                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        );
      };

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-30 font-sans text-brand-navy">
          {/* Back Header */}
          {!hideHeaderCard && (
            <div className="flex flex-col md:flex-row md:items-center justify-between py-2 border-b border-brand-navy/5 gap-4">
              <button 
                onClick={onBack}
                className="flex items-center gap-3 text-brand-navy/40 hover:text-brand-navy uppercase tracking-widest text-[10px] font-black italic transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                {lang === 'RU' ? 'К списку спортсменов' : lang === 'GE' ? 'უკან' : 'Back to Athlete List'}
              </button>

              <div className="flex items-center gap-4">
                <Badge color="sunset" className="px-4 py-1 uppercase italic text-[9px] font-black">
                  {lang === 'RU' ? 'КАРТА ПРОГРЕССА' : 'SPORT PASSPORT MONITORING'}
                </Badge>
                {isEditable && (
                  <span className="text-[10px] bg-brand-teal/15 text-brand-teal px-3 py-1 rounded-xl font-black uppercase italic tracking-widest">
                    {lang === 'RU' ? 'РЕЖИМ ЗАПИСИ (МАСТЕР)' : 'COACH WRITE MODE'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Athlete Header Card (To the athlete page add athlete details: name, avatar, age) */}
          {!hideHeaderCard && (
            <div className="p-6 sm:p-8 rounded-[24px] sm:rounded-[36px] bg-white/50 border border-white/60 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 sm:gap-8 glass">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden bg-brand-teal/10 border border-brand-teal/20 shrink-0 shadow-lg relative group">
                <img 
                  src={activeAthlete.studentProfileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={activeAthlete.studentName || 'Athlete'}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <p className="text-[9px] font-black uppercase tracking-widest text-brand-teal mb-1 italic">
                  {lang === 'RU' ? 'Профиль спортсмена' : 'Selected Athlete Profile'}
                </p>
                <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight text-brand-navy leading-tight truncate">
                  {activeAthlete.studentName || 'Athlete'}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-2.5 text-xs font-bold text-brand-navy/60 uppercase">
                  <span className="px-3.5 py-1 bg-brand-teal/10 text-brand-teal rounded-xl tracking-wider font-extrabold italic text-[10px]">
                    {activeAthlete.studentAge || activeAthlete.studentAge === 0 ? activeAthlete.studentAge : 8} {lang === 'RU' ? 'лет' : 'years old'}
                  </span>
                  <span className="px-3.5 py-1 bg-black/5 text-brand-navy rounded-xl text-[10px] tracking-wider font-extrabold italic">
                    {activeAthlete.trainingGroup || 'U8/U10'} Group
                  </span>
                  <span className="px-3.5 py-1 bg-brand-sunset/10 text-brand-sunset rounded-xl text-[10px] tracking-wider font-extrabold italic font-sans animate-pulse">
                    {studentLevel ? `${studentLevel.tier} — ${studentLevel.title.toUpperCase()} (${xp} XP)` : 'Level 1'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Parameters & Historical Records Section (Full-Width Expandable parameters) */}
          <div className="w-full min-w-0 animate-in fade-in duration-500">
            <div className="space-y-6">
              {mainRender()}
            </div>
          </div>
        </div>
      );
    }
