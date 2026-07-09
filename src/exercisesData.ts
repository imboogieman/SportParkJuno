export interface Exercise {
  id: string;
  name: string;
  duration: number;
  description: string;
  ageGroup: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  phase?: number;
  masterId?: string;
  createdAt?: any;
  isDefault?: boolean;
}

export const getExerciseCategory = (
  ex: { name: string; description: string; id: string; category?: string },
  lang: string
): { label: string; color: 'teal' | 'sunset' | 'blue' | 'navy' | 'orange' | 'purple' } => {
  const isRu = lang === 'RU';
  
  if (ex.category) {
    const cat = String(ex.category).toLowerCase();
    if (cat.includes('warm') || cat.includes('разминк')) {
      return { label: isRu ? 'Разминка' : 'Warm-up', color: 'teal' };
    }
    if (cat.includes('cognit') || cat.includes('когнити')) {
      return { label: isRu ? 'Когнитивное' : 'Cognitive', color: 'purple' };
    }
    if (cat.includes('technic') || cat.includes('техниче')) {
      return { label: isRu ? 'Техническое' : 'Technical', color: 'sunset' };
    }
    if (cat.includes('tactic') || cat.includes('тактиче') || cat.includes('game') || cat.includes('игра')) {
      return { label: isRu ? 'Тактическое' : 'Tactical', color: 'blue' };
    }
    return {
      label: ex.category,
      color: cat.includes('warm') ? 'teal' : cat.includes('cognit') ? 'purple' : cat.includes('tactic') ? 'blue' : 'sunset'
    };
  }

  const nameLower = (ex.name || '').toLowerCase();
  const descLower = (ex.description || '').toLowerCase();
  const idLower = (ex.id || '').toLowerCase();

  // 1. Cognitive
  if (
    nameLower.includes('reaction') || nameLower.includes('реакция') ||
    nameLower.includes('светофор') || nameLower.includes('red light') ||
    idLower.includes('diagnostics') || nameLower.includes('диагностика') ||
    nameLower.includes('rabbit') || nameLower.includes('кролик') ||
    nameLower.includes('jungle') || nameLower.includes('джунгли') ||
    nameLower.includes('meditation') || nameLower.includes('медитац')
  ) {
    return { label: isRu ? 'Когнитивное' : 'Cognitive', color: 'purple' };
  }

  // 2. Warm-up
  if (
    nameLower.includes('warm') || nameLower.includes('разминк') ||
    descLower.includes('warm') || idLower.includes('jogging') ||
    nameLower.includes('бег') || nameLower.includes('cooldown') ||
    nameLower.includes('остывание')
  ) {
    return { label: isRu ? 'Разминка' : 'Warm-up', color: 'teal' };
  }

  // 3. Tactical
  if (
    nameLower.includes('match') || nameLower.includes('game') ||
    nameLower.includes('игра') || nameLower.includes('двусторонка') ||
    idLower.includes('gametime')
  ) {
    return { label: isRu ? 'Тактическое' : 'Tactical', color: 'blue' };
  }

  // 4. Technical (Default)
  return { label: isRu ? 'Техническое' : 'Technical', color: 'sunset' };
};


export const getLocalizedDefaults = (lang: string): Exercise[] => {
  const isRu = lang === 'RU';
  const groupA = isRu ? 'Группа А (5–7 лет)' : 'Group A (5-7 yrs)';
  const groupB = isRu ? 'Группа B (8–11 лет)' : 'Group B (8-11 yrs)';
  const groupC = isRu ? 'Группа C (12–14 лет)' : 'Group C (12-14 yrs)';
  const allAges = isRu ? 'Все возрасты (Универсально)' : 'All Ages';

  const rawDefaults: Exercise[] = [
  {
    id: 'def_meditation_1',
    name: lang === 'RU' ? 'Медитация на старте' : 'Start Meditation',
    duration: 3,
    description: lang === 'RU'
      ? 'Короткое расслабление, концентрация на дыхании и настрой игрока на тренировку.'
      : 'Brief relaxation, breathing awareness, setting a focused state of mind for the training session.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_jogging_1',
    name: lang === 'RU' ? 'Беговая разминка' : 'Jogging warm-up',
    duration: 8,
    description: lang === 'RU'
      ? 'Легкий бег с вращением рук, подъемом бедра, захлестом голени и приставными шагами.'
      : 'Slow-paced running with arm rotations, high-knees, butt-kicks, and side shuffles to prepare muscles.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_rabbit_game',
    name: lang === 'RU' ? 'Игра «Кролики»' : 'Rabbit Game',
    duration: 10,
    description: lang === 'RU'
      ? 'Подвижная игра на реакцию, где игроки прыгают по обручам (норкам), скрываясь от ведущего.'
      : 'Active reaction game where players hop inside hoops (rabbit burrows) to escape from the tagger master.',
    ageGroup: 'U6 (4-5 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_jungles_running',
    name: lang === 'RU' ? 'Бег в Джунглях' : 'Jungles Running',
    duration: 8,
    description: lang === 'RU'
      ? 'Координационный бег с перевоплощением: прыжки зайцев, лягушек, ходьба обезьяной и утиный шаг.'
      : 'Coordinated run where students transform into animals: rabbit jumps, frog jumps, monkey walk, duck walk over 10 meters.',
    ageGroup: 'U6 (4-5 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_diagnostics',
    name: lang === 'RU' ? 'Диагностика навыков (3-10 мин)' : 'Diagnostics (3-10 mins)',
    duration: 7,
    description: lang === 'RU'
      ? 'Диагностический блок для оценки скорости ведения мяча, координации ног и точности паса.'
      : 'Diagnostic block evaluating ball control speed, foot speed, coordination under direct coach metrics monitoring.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_vengerkas',
    name: lang === 'RU' ? 'Касания Венгерка' : 'Vengerkas Touches',
    duration: 10,
    description: lang === 'RU'
      ? 'Ритмичная тренировка стоп: комбинации касаний внутренней-внешней стороной и подошвой.'
      : 'High-speed foot-motor rhythm exercise executing inner-outer-sole tap combinations with maximum touches.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_micro_motoric',
    name: lang === 'RU' ? 'Микромоторика и контроль' : 'Micro Motoric & Ball Control',
    duration: 8,
    description: lang === 'RU'
      ? 'Упражнения на микромоторику и частоту касаний мяча в ограниченном пространстве 2х2м.'
      : 'Touches and micro-motoric foot rhythm drills inside small areas to build ultimate physical ball sensitivity.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_1v1_gladiator',
    name: lang === 'RU' ? 'Дриблинг Гладиаторы 1в1' : 'Gladiator Dribbling 1v1',
    duration: 12,
    description: lang === 'RU'
      ? 'Дуэль 1в1, где атакующий с помощью финтов и смены ритма должен пройти защитника и забить.'
      : 'Micro gate challenge where attacker uses feints, dribbles and accelerations to pass defender and score.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_red_light',
    name: lang === 'RU' ? 'Светофор (Дриблинг)' : 'Red Light Green Light Dribbling',
    duration: 8,
    description: lang === 'RU'
      ? 'Игра-светофор на координацию и резкую остановку мяча подошвой по сигналу тренера.'
      : 'Classic reaction-dribbling game where players accelerate and immediately freeze the ball on red light.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_airball_passing',
    name: lang === 'RU' ? 'Передачи верхом (Airball)' : 'Airball Lofted Passing',
    duration: 12,
    description: lang === 'RU'
      ? 'Тренировка средних и длинных передач верхом на точность в мишени или партнеру.'
      : 'Lifting passes in the air (airball) targeting teammates or marked sectors, adjusting height and power.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_short_floor_pass',
    name: lang === 'RU' ? 'Короткий низовой пас' : 'Short Floor Passing',
    duration: 10,
    description: lang === 'RU'
      ? 'Прием и передача мяча низом щечкой в треугольниках со сменой позиций.'
      : 'Rapid short-range ground passing (floor pass) focusing on correct instep touch and body orientation.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_mid_long_passing',
    name: lang === 'RU' ? 'Средний и длинный пас' : 'Mid & Long Range Passing',
    duration: 12,
    description: lang === 'RU'
      ? 'Тренировка передач на расстояние от 15 до 30 метров со своевременным открыванием партнера.'
      : 'Ground and semi-lofted passing transitions across mid and long range scales to move the play.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_cross_passing',
    name: lang === 'RU' ? 'Фланговые кроссы и передачи' : 'Crossing & Cross Passing',
    duration: 15,
    description: lang === 'RU'
      ? 'Фланговые прострелы и кроссы (навесы) в штрафную площадь со взятием ворот в одно касание.'
      : 'Deep dynamic crossovers (cross pass) delivered from the wings for forwards to attack and finish.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_passing_team_games',
    name: lang === 'RU' ? 'Командные игры на пас' : 'Passing & Possession Team Games',
    duration: 15,
    description: lang === 'RU'
      ? 'Мини-матч, в котором гол засчитывается только после заданного количества успешных передач всей команды.'
      : 'Tactical team games where completing multiple consecutive passes wins points, forcing space creation and vision.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Intermediate',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_shooting_volley',
    name: lang === 'RU' ? 'Удары с лета и полулета' : 'Volley Shooting Drills',
    duration: 12,
    description: lang === 'RU'
      ? 'Отработка прицельных ударов по воротам с лета после наброса или рикошета.'
      : 'High-focus shooting at goal on the volley or half-volley, coordinating clean contact and target placement.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_shooting_gate',
    name: lang === 'RU' ? 'Удары из ворот (Gate Shooting)' : 'Gate-Turn Shooting',
    duration: 10,
    description: lang === 'RU'
      ? 'Прием спиной к воротам, прокидка мяча в имитируемые ворота и резкий удар в створ.'
      : 'Receiving on the half-turn, driving through speed gates, and immediate low shot into the corners.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_gametime',
    name: lang === 'RU' ? 'Игровое время (Двусторонка)' : 'Bilateral Game Time',
    duration: 20,
    description: lang === 'RU'
      ? 'Двусторонняя игра на двое ворот с тактическими установками тренера.'
      : 'Standard bilateral scrimmage with rotating lineups to apply learned exercises under real game pacing.',
    ageGroup: 'All Ages',
    complexity: 'Intermediate',
    phase: 4,
    isDefault: true
  },
  {
    id: 'def_joint_mobilization',
    name: lang === 'RU' ? 'Разминка суставов' : 'Joint Mobilization Warm-Up',
    duration: 5,
    description: lang === 'RU'
      ? 'Комплекс упражнений на месте для подготовки суставов к нагрузкам: вращения шеи, плеч, таза, коленей.'
      : 'Gentle on-the-spot joint mobility exercises: neck rolls, shoulder shrugs, hip rotations, and knee warm-ups.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_catch_tail',
    name: lang === 'RU' ? 'Игра «Поймай хвост»' : 'Catch the Tail Game',
    duration: 7,
    description: lang === 'RU'
      ? 'Подвижная игра, развивающая ловкость, реакцию и ускорение. Игроки пытаются сорвать ленточки («хвосты») друг у друга.'
      : 'Fun chasing game to develop agility and speed. Players tuck a bib into their shorts as a tail and try to grab others while protecting their own.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_light_bounce',
    name: lang === 'RU' ? 'Легкие набросы партнера' : 'Partner Ball Lob-Receive',
    duration: 8,
    description: lang === 'RU'
      ? 'Работа в парах. Один игрок мягко набрасывает мяч руками, второй принимает его бедром или стопой и возвращает назад.'
      : 'Working in pairs. One player gently tosses the ball by hand, and the other controls it with thigh/foot and returns it.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_traffic_coordination',
    name: lang === 'RU' ? 'Координационный светофор' : 'Traffic Light Coordination',
    duration: 10,
    description: lang === 'RU'
      ? 'Игроки двигаются по сигналам тренера (красный - стоп, желтый - медленный бег, зеленый - быстрое ведение мяча).'
      : 'Coordinated reaction drill where players respond to visual/verbal colors: red (stop), yellow (slow jog), green (sprint or quick dribble).',
    ageGroup: 'U6 (4-5 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_crab_relay',
    name: lang === 'RU' ? 'Эстафета «Крабики»' : 'Crab Walk Relay',
    duration: 8,
    description: lang === 'RU'
      ? 'Эстафета без мяча на спине для укрепления корсета спины, рук и ягодиц. Повышает общую координацию.'
      : 'Fun bodyweight relay moving cursorially like crabs to strengthen core, shoulders, and glutes under playful timing.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_balance_touch',
    name: lang === 'RU' ? 'Балансировка и касание' : 'Static Balance & Toe Touches',
    duration: 8,
    description: lang === 'RU'
      ? 'Игроки балансируют на одной ноге, совершая легкие поочередные касания верха мяча другой ногой.'
      : 'Players stand on one foot while lightly tapping the top of the ball with the sole of the opposite foot to build core stability.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_gate_dribble',
    name: lang === 'RU' ? 'Ведение сквозь ворота' : 'Gate-to-Gate Gentle Dribbling',
    duration: 12,
    description: lang === 'RU'
      ? 'Свободное ведение мяча с прохождением через как можно большее количество ворот из конусов за отведенное время.'
      : 'Dribble freely inside a marked grid and pass clean through as many cone gates as possible to improve control.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_pair_passing',
    name: lang === 'RU' ? 'Пас в парах на месте' : 'In-Place Passing in Pairs',
    duration: 10,
    description: lang === 'RU'
      ? 'Отработка паса внутренней стороной стопы (щечкой) в парах с расстояния 5-7 метров с обработкой мяча.'
      : 'Practicing ground passes back and forth with a partner using the inside of the foot, taking a gentle touch to control first.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_empty_target',
    name: lang === 'RU' ? 'Удары по пустым воротам' : 'Shooting at Empty Target Zones',
    duration: 10,
    description: lang === 'RU'
      ? 'Обучение правильной технике удара щечкой и внутренней частью подъема стопы по условным зонам ворот.'
      : 'Learning proper foot-lock, ankle, and instep posture while taking shots from the edge of the box into open corners.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_four_goal_game',
    name: lang === 'RU' ? 'Мини-игра на 4 ворот' : 'Four-Goal Mini Match',
    duration: 15,
    description: lang === 'RU'
      ? 'Матч в малых составах на четверо маленьких ворот, побуждающий игроков видеть свободное пространство на противоположном фланге.'
      : 'Small-sided scrimmage with four small target goals. Encourages youngsters to look up, switch play, and find open space.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 4,
    isDefault: true
  },
  {
    id: 'def_static_stretch',
    name: lang === 'RU' ? 'Статическая заминка в кругу' : 'Static Stretching Circle',
    duration: 5,
    description: lang === 'RU'
      ? 'Круговое выполнение упражнений на плавную растяжку основных групп мышц ног и спины после нагрузок.'
      : 'Gentle static calf, hamstring, and quad stretches carried out together in a circle, accompanied by deep slow breathing.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    phase: 4,
    isDefault: true
  },
  {
    id: 'def_gratitude_circle',
    name: lang === 'RU' ? 'Рефлексия и благодарность' : 'Gratitude & Review Circle',
    duration: 4,
    description: lang === 'RU'
      ? 'Короткое обсуждение тренировки, похвала за усердие, пять («дай пять») и кричалка команды для сплочения.'
      : 'Brief interactive gathering to review session achievements, share high-fives, and perform a powerful united team cheer.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    phase: 4,
    isDefault: true
  },
  {
    id: 'def_end_meditation',
    name: lang === 'RU' ? 'Медитация на выходе' : 'End Meditation & Cooldown',
    duration: 3,
    description: lang === 'RU'
      ? 'Завершающая медитация, дыхательные упражнения и мягкая растяжка для восстановления мышц.'
      : 'Closing mindfulness meditation, focused nasal breathing loops, and recovery stretching to end session.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    phase: 4,
    isDefault: true
  },
  {
    id: 'def_catcher_beginner',
    name: lang === 'RU' ? 'Ловец (Для начинающих)' : 'Catcher (Beginner)',
    duration: 10,
    description: lang === 'RU'
      ? '1 или 2 игрока стоят в квадрате, остальные — по краям. Центральные игроки должны перехватить мяч. Другие игроки могут пасовать, используя от 3 до 5 касаний.'
      : '1 or 2 players standing in a square, others on the side. The central players have to take the ball, while the others can pass using up to 3-5 touches.',
    ageGroup: 'All Ages',
    complexity: 'Beginner',
    category: 'Warm-up',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_catcher_intermediate',
    name: lang === 'RU' ? 'Ловец (Средний уровень)' : 'Catcher (Intermediate)',
    duration: 10,
    description: lang === 'RU'
      ? 'Средний уровень: 1 или 2 игрока стоят в квадрате, остальные — по краям, с нейтральным игроком в центре квадрата. Центральные игроки должны отобрать мяч. Внешние игроки могут пасовать только в 1-2 касания, задействуя нейтрального игрока.'
      : 'Intermediate level: 1 or 2 players standing in a square, others on the side with a neutral player in the square. Central players must take the ball. Others can pass with 1, 2 touches only, utilizing the neutral player.',
    ageGroup: 'All Ages',
    complexity: 'Intermediate',
    category: 'Warm-up',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_agility_ladder_sprints',
    name: lang === 'RU' ? 'Координационная лестница и спринты' : 'Agility Ladder & Acceleration Sprints',
    duration: 10,
    description: lang === 'RU'
      ? 'Упражнения на частоту шага и взрывную силу. Игрок быстро преодолевает координационную лестницу различными способами (два касания в ячейку, боком, впрыгивания), после чего моментально делает взрывной рывок на 10-15 метров.'
      : 'Foot speed and explosive training. Players race through the coordination ladder utilizing rapid foot combinations (two-in-one-out, lateral hops) followed by an immediate maximum acceleration sprint over 15 meters.',
    ageGroup: 'All Ages',
    complexity: 'Intermediate',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_plyo_squat_jumps',
    name: lang === 'RU' ? 'Плиометрические прыжки (Мощность ног)' : 'Plyometric Jump Squares (Leg Power)',
    duration: 10,
    description: lang === 'RU'
      ? 'Тренировка взрывной силы ног и мышц кора. Игроки выполняют прыжки из глубокого приседа на тумбы или через барьеры высотой 30-40 см с мгновенной фиксацией приземления и повторным прыжком. Укрепляет квадрицепсы, икры и сухожилия.'
      : 'Building dynamic vertical-horizontal leg power and muscular stabilization. Soccer players perform explosive squat jumps over successive 30-45cm hurdles, maintaining tight landing balance followed by rapid rebounds.',
    ageGroup: 'U10 (8-9 yrs)',
    complexity: 'Intermediate',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_shuttle_stamina',
    name: lang === 'RU' ? 'Интервальный челночный бег (Выносливость)' : 'Multi-Stage Shuttle Run (Stamina)',
    duration: 12,
    description: lang === 'RU'
      ? 'Тест и тренировка аэробной выносливости. Игроки совершают челночные пробежки между фишками на расстоянии 20 метров. Интенсивность бега и скорость разворота постепенно увеличиваются по сигналу тренера.'
      : 'High-intensity interval stamina training mimicking match play. Players jog, run, and sprint back and forth over a 20-meter distance, focusing on rapid deceleration-turn and acceleration mechanics on coaches whistle.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_resistance_band_power',
    name: lang === 'RU' ? 'Ускорения с сопротивлением резиновой ленты' : 'Resistance Band Aggressive Drives',
    duration: 8,
    description: lang === 'RU'
      ? 'Упражнение на мощность бедра и стартовую скорость. Игрок надевает пояс сопротивления (или резиновую ленту), закрепленную партнером сзади. Задача — преодолеть натяжение резины мощным бегом вперед с высоким подъемом бедра.'
      : 'Designed for powerful first-step release speed and powerful hamstrings/quads. One player runs forward with high knee drives, wearing a strong resistance band tensioned by a partner holding from behind.',
    ageGroup: 'U12 (10-12 yrs)',
    complexity: 'Advanced',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_cone_zigzag_agility',
    name: lang === 'RU' ? 'Координационный зигзаг (Ловкость)' : 'Cone Zig-Zag Agility Run',
    duration: 8,
    description: lang === 'RU'
      ? 'Упражнение развивает ловкость, координацию смены вектора движения и баланс. Игроки на максимальной скорости обегают 6-8 конусов, выставленных зигзагом на расстоянии 2 метра друг от друга, делая низкий центр тяжести при входе в поворот.'
      : 'Improves running agility, dynamic weight shifting, and sharp cut steps. Players run at full speed zig-zagging through a series of 6-8 cones placed 2 meters apart, forcing quick hip turn, low center of gravity, and clean decel/accel.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 2,
    isDefault: true
  },
  {
    id: 'def_passing_bowling',
    name: lang === 'RU' ? 'Футбольный боулинг' : 'Football Bowling',
    duration: 10,
    description: lang === 'RU'
      ? 'Веселая мини-игра на точность передачи щечкой для новичков. На расстоянии 8-10 метров выстраиваются цветные фишки или конусы («кегли»). Игрок должен низовым аккуратным пасом сбить как можно больше кеглей за 5 попыток.'
      : 'Fun targeting mini-game for beginner kids practicing inside-foot passing. Multi-colored plastic cones (or plastic bottles) are set up 8-10 meters away. Players take turns delivering exact ground passes to knock down the targets.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_gatekeeper_passing',
    name: lang === 'RU' ? 'Врата конусов (Пас сквозь ворота)' : 'The Gatekeeper (Gate Pass Challenge)',
    duration: 10,
    description: lang === 'RU'
      ? 'Тренировка точного паса на ход и первого контролирующего касания подошвой/щечкой. Два игрока стоят по обе стороны от импровизированных ворот из конусов шириной 1м и пасуют друг другу низом строго сквозь конусы, делая обработку перед ответным пасом.'
      : 'Promotes precise short passing and soft receiving. Pairs stand on opposite sides of a 1-meter wide gate of cones. They alternate passing the ball cleanly through the gate, utilizing their first touch to cushion and control it completely.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_clean_backyard',
    name: lang === 'RU' ? 'Мини-игра «Очисти свой двор»' : 'Clean Your Backyard (Team Passing)',
    duration: 10,
    description: lang === 'RU'
      ? 'Динамичная командная игра. Поле делится пополам линией из конусов. В каждой зоне находятся 4-5 игроков и множество мячей. Задача команд — точными пасами щечкой перепинывать мячи на половину соперника. Побеждает команда, у которой в конце времени меньше мячей.'
      : 'Exciting energetic team game for beginners. Divide a grid into two halves. Each team stays in their half with several soccer balls. Players must pass ball across the divider line into the opposing team zone using inside-foot passes. Team with fewer balls wins.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_wall_pass_trap',
    name: lang === 'RU' ? 'Пас в стену и мягкий прием' : 'Wall Passing & Soft Trap',
    duration: 8,
    description: lang === 'RU'
      ? 'Индивидуальная тренировка контроля. Игрок стоит в 3-4 метрах от стены, наносит пас низом, принимает отскочивший мяч мягким касанием подошвы или внутренней стороны стопы, фиксируя его, и сразу выполняет следующий удар другой ногой.'
      : 'Excellent drill for solo repetition of basic ball control. Player stands 3-4 meters away from a wall or rebounder. Delivers a low ground pass, handles the rebounding ball with a cushioned sole or instep trap, and repeats with the opposite foot.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_space_invaders',
    name: lang === 'RU' ? 'Игра «Космические захватчики»' : 'Space Invaders Grid Game',
    duration: 12,
    description: lang === 'RU'
      ? 'Подвижная тактическая игра для новичков. На поле размечаются квадраты 3х3м («планеты»). Игроки без мяча открываются на свободные планеты, а игрок с мячом должен своевременно направить точный пас на открывшегося партнера, который фиксирует мяч.'
      : "Interactive coordination and awareness mini-game. The field consists of 3x3m marked grid squares (safe zones). Players run between empty squares to find space, while passer has to quickly view and snap an accurate pass into teammate's zone.",
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_group_fitness_tag',
    name: lang === 'RU' ? 'Групповые салки с удержанием баланса' : 'Group Tag & Balance Challenge',
    duration: 10,
    description: lang === 'RU'
      ? 'Групповые салки разминочного типа в квадрате 15х15м. Все игроки медленно бегают (трусцой). Водящие пытаются осалить игроков. Осаленный игрок замирает на одной ноге в ласточке (баланс) на 5 секунд, после чего возвращается в игру. Развивает выносливость, координацию и устойчивость.'
      : 'Group tag warm-up in a 15x15m grid. All players jog inside. Taggers try to touch active players. Tagged players must pause and hold a single-leg airplane balance pose for 5 seconds before returning. Trains light stamina, lower body stability, and balance.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    category: 'Warm-up',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_group_animal_race',
    name: lang === 'RU' ? 'Командная эстафета зверей (Фитнес)' : 'Team Animal Fitness Relay',
    duration: 8,
    description: lang === 'RU'
      ? 'Веселая круговая тренировка в группах. Игроки делятся на команды по 3-4 человека. По очереди они преодолевают 10 метров разными стилями: прыжки лягушкой для силы ног, бег на четвереньках спиной вперед (рак) для мышц кора и плеч, и легкое ускорение назад. Развивает силу мышц ног и выносливость.'
      : 'A high-energy team relay in groups. Players split into teams of 3-4. They take turns crossing 10 meters using different movements: deep frog hops for quadricep power, backward crab walk for core and arm strength, followed by a light recovery jog. Increases functional strength and basic stamina.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    category: 'Warm-up',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_dynamic_mirror_drills',
    name: lang === 'RU' ? 'Динамическая игра «Зеркало» (Ловкость)' : 'Dynamic Mirror Agility Games',
    duration: 8,
    description: lang === 'RU'
      ? 'Групповое фитнес-упражнение на координацию и реакцию. Игроки разбиваются на пары и встают лицом друг к другу. Один игрок («Лидер») выполняет боковые приставные шаги, прыжки, приседания в хаотичном порядке, а второй («Зеркало») старается мгновенно повторить его движения. Через 1 минуту игроки меняются ролями.'
      : 'Fun group/partner dynamic agility routine training reactions and foot speed. Players face each other in pairs. One player is the leader, performing sudden side-shuffles, lateral hops, squat drops, and high knees; the other player acts as the "mirror" to immediately copy them. Swap roles every 60 seconds.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    category: 'Warm-up',
    phase: 1,
    isDefault: true
  },
  {
    id: 'def_triangle_passing_loop',
    name: lang === 'RU' ? 'Передачи в треугольнике (Контроль в тройках)' : 'Triangle Passing Loop (Groups of 3)',
    duration: 10,
    description: lang === 'RU'
      ? 'Тренировка контроля и паса для начинающих в тройках. Три игрока образуют треугольник со стороной 4-5 метров. Мяч передается по часовой стрелке низом: первым касанием игрок принимает (гасит) мяч внешней или внутренней стороной стопы в сторону движения, вторым касанием делает точный пас следующему партнеру.'
      : 'An introductory triangular layout to practice receiving-and-passing patterns in groups of 3. Three players stand in a triangle 4-5 meters apart. They pass the ball clockwise: player takes a soft, guided first touch with their inside foot to position the ball, then delivers a precise second-touch pass to the next teammate.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_give_and_go_gates',
    name: lang === 'RU' ? 'Передача «Стена» через ворота (В парах)' : 'Give-and-Go Gate Attack (In Pairs)',
    duration: 10,
    description: lang === 'RU'
      ? 'Обучение игре в стенку в паре. На поле ставятся ворота из конусов шириной 1 метр. Первый партнер пасует второму по диагонали сквозь ворота, делает рывок вперед мимо конуса, получает обратный мягкий пас («стеночку») в одно касание и аккуратно фиксирует мяч подошвой.'
      : "An interactive pair drill using simple one-two passing. Players set up small 1-meter cone gates. Partner A passes diagonally through the gate to Partner B, then sprints forward. Partner B delivers a soft first-time cushion pass ('wall') back into Partner A's running path to control and trap.",
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  },
  {
    id: 'def_middle_man_rondo',
    name: lang === 'RU' ? 'Пас через центрального (Тренировка контроля)' : 'Through the Middle Man (Pairs & Trio Mastery)',
    duration: 12,
    description: lang === 'RU'
      ? 'Упражнение в тройках для освоения контроля высоты передачи и мягкого приема. Два игрока стоят по краям (расстояние 8-10м), их разделяет пассивный центральный защитник. Внешние игроки должны сделать точный пас низом сквозь ноги или в обход защитника. Защитник лишь обозначает прессинг. После 2 минут игроки меняются позициями.'
      : 'An interactive trio drill for beginners learning to look for passing lanes. Two outer players (8-10m apart) try to pass the ball cleanly to each other, while a third passive player stays in the middle. The outer players must make a soft first touch to control, search for the passing opening, and pass. swap roles every 2 minutes.',
    ageGroup: 'U8 (6-7 yrs)',
    complexity: 'Beginner',
    phase: 3,
    isDefault: true
  }
];

  return rawDefaults.map(ex => {
    let mappedAgeGroup = ex.ageGroup;
    if (ex.ageGroup === 'U6 (4-5 yrs)' || ex.ageGroup === 'U8 (6-7 yrs)') {
      mappedAgeGroup = groupA;
    } else if (ex.ageGroup === 'U10 (8-9 yrs)' || ex.ageGroup === 'U12 (10-12 yrs)') {
      mappedAgeGroup = groupB;
    } else if (ex.ageGroup === 'U14+ (13+ yrs)' || ex.ageGroup.includes('14')) {
      mappedAgeGroup = groupC;
    } else if (ex.ageGroup === 'All Ages' || ex.ageGroup.includes('All')) {
      mappedAgeGroup = allAges;
    }
    return {
      ...ex,
      ageGroup: mappedAgeGroup
    };
  });
};
