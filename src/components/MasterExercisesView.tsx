import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Card, Button, Input, Badge } from './UI';
import { Search, Plus, X, Clock, Target, Trash2, Edit, Award, Loader2, ClipboardList, Check, HelpCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exercise, getLocalizedDefaults, getExerciseCategory } from '../exercisesData';

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Summary: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}



export default function MasterExercisesView({ lang = 'EN', t, master }: { lang?: string; t: any; master: any }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('All');
  const [complexityFilter, setComplexityFilter] = useState('All');
  const [phaseFilter, setPhaseFilter] = useState('All');
  
  // Notification banner
  const [notification, setNotification] = useState<string | null>(null);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    duration: 10,
    description: '',
    ageGroup: lang === 'RU' ? 'Группа А (5–7 лет)' : 'Group A (5-7 yrs)',
    complexity: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    category: '',
    phase: 1
  });

  const masterId = master?.phone || master?.id || '+995551530272';

  // Load exercises from firestore + defaults
  useEffect(() => {
    const q = query(collection(db, 'exercises'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fbList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
      // Filter out soft-deleted ones (like deleted defaults)
      const activeFb = fbList.filter(item => !(item as any).isDeleted);
      const fbIds = new Set(activeFb.map(item => item.id));
      const defaults = getLocalizedDefaults(lang);
      const remainingDefaults = defaults.filter(def => !fbIds.has(def.id));

      setExercises([...activeFb, ...remainingDefaults]);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching exercises:", error);
      setExercises(getLocalizedDefaults(lang)); // fallback to defaults
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'exercises');
    });

    return () => unsubscribe();
  }, [lang]);

  const openCreateForm = () => {
    setEditingExercise(null);
    setFormError(null);
    setFormData({
      name: '',
      duration: 10,
      description: '',
      ageGroup: lang === 'RU' ? 'Группа А (5–7 лет)' : 'Group A (5-7 yrs)',
      complexity: 'Intermediate',
      category: '',
      phase: 1
    });
    setShowForm(true);
  };

  const openEditForm = (ex: Exercise) => {
    setEditingExercise(ex);
    setFormError(null);
    
    // Map legacy age group to new ones if necessary
    let initialAgeGroup = ex.ageGroup;
    if (ex.ageGroup === 'U6 (4-5 yrs)' || ex.ageGroup === 'U8 (6-7 yrs)') {
      initialAgeGroup = lang === 'RU' ? 'Группа А (5–7 лет)' : 'Group A (5-7 yrs)';
    } else if (ex.ageGroup === 'U10 (8-9 yrs)' || ex.ageGroup === 'U12 (10-12 yrs)') {
      initialAgeGroup = lang === 'RU' ? 'Группа B (8–11 лет)' : 'Group B (8-11 yrs)';
    } else if (ex.ageGroup === 'U14+ (13+ yrs)' || ex.ageGroup.includes('14')) {
      initialAgeGroup = lang === 'RU' ? 'Группа C (12–14 лет)' : 'Group C (12-14 yrs)';
    } else if (ex.ageGroup === 'All Ages' || ex.ageGroup.includes('All')) {
      initialAgeGroup = 'All Ages';
    }

    setFormData({
      name: ex.name,
      duration: ex.duration,
      description: ex.description,
      ageGroup: initialAgeGroup,
      complexity: ex.complexity,
      category: ex.category || '',
      phase: ex.phase || 1
    });
    setShowForm(true);
  };

  const handleDeleteExercise = async (id: string, isDefault?: boolean) => {
    if (!confirm(lang === 'RU' ? 'Вы уверены, что хотите удалить это упражнение?' : 'Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      if (isDefault) {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'exercises', id), {
          isDeleted: true,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'exercises', id));
      }
      setNotification(lang === 'RU' ? 'Упражнение успешно удалено!' : 'Exercise deleted successfully!');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error("Error deleting exercise:", err);
      handleFirestoreError(err, OperationType.DELETE, `exercises/${id}`);
    }
  };

  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Validation check: An exercise with Warmup tag (category 'Warm-up' or Phase 1) cannot contain intensive (Phase 2) or technical (Phase 3 or category 'Technical')
    const isWarmup = formData.category === 'Warm-up' || formData.phase === 1;
    const isConflicting = formData.phase === 2 || formData.phase === 3 || formData.category === 'Technical';

    if (isWarmup && isConflicting) {
      setFormError(
        lang === 'RU'
          ? 'Разминка не может содержать отметку Интенсив (Ф2), Мастерство (Ф3) или Категорию "Техническое"!'
          : 'Warm-up exercises cannot contain features of Intensive (Phase 2), Football/Technical (Phase 3), or Technical category!'
      );
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        duration: Number(formData.duration),
        description: formData.description.trim(),
        ageGroup: formData.ageGroup,
        complexity: formData.complexity,
        category: formData.category,
        phase: formData.phase,
        masterId: masterId,
        updatedAt: serverTimestamp()
      };

      if (editingExercise) {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'exercises', editingExercise.id), {
          ...payload,
          isDefault: editingExercise.isDefault || false
        }, { merge: true });
        setNotification(lang === 'RU' ? 'Упражнение успешно обновлено!' : 'Exercise updated successfully!');
      } else {
        await addDoc(collection(db, 'exercises'), {
          ...payload,
          createdAt: serverTimestamp()
        });
        setNotification(lang === 'RU' ? 'Новое упражнение добавлено!' : 'New exercise added successfully!');
      }

      setShowForm(false);
      setEditingExercise(null);
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error("Error saving exercise:", err);
      handleFirestoreError(err, editingExercise ? OperationType.UPDATE : OperationType.CREATE, 'exercises');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filters calculation
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesAge = ageFilter === 'All' || (() => {
      const groupLower = (ex.ageGroup || '').toLowerCase();
      if (ageFilter === 'A') {
        return groupLower.includes('группа а') || groupLower.includes('group a') || groupLower.includes('u6') || groupLower.includes('u8') || groupLower.includes('5–7') || groupLower.includes('5-7');
      }
      if (ageFilter === 'B') {
        return groupLower.includes('группа b') || groupLower.includes('group b') || groupLower.includes('группа в') || groupLower.includes('group в') || groupLower.includes('u10') || groupLower.includes('8–11') || groupLower.includes('8-11') || groupLower.includes('u12') || groupLower.includes('10-12');
      }
      if (ageFilter === 'C') {
        return groupLower.includes('группа c') || groupLower.includes('group c') || groupLower.includes('группа с') || groupLower.includes('group с') || groupLower.includes('12–14') || groupLower.includes('12-14') || groupLower.includes('u14') || groupLower.includes('13+');
      }
      return groupLower.includes(ageFilter.toLowerCase());
    })();
    
    const matchesComplexity = complexityFilter === 'All' || ex.complexity === complexityFilter;
    const matchesPhase = phaseFilter === 'All' || (ex.phase !== undefined && String(ex.phase) === String(phaseFilter));
    
    return matchesSearch && matchesAge && matchesComplexity && matchesPhase;
  });

  const ageGroups = ['All', 'A', 'B', 'C'];
  const complexities = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 font-sans text-brand-navy">
      {/* Title section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Badge color="teal" className="mb-2 italic uppercase">
            {lang === 'RU' ? 'БАЗА УПРАЖНЕНИЙ' : 'EXERCISES SUITE'}
          </Badge>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">
            {lang === 'RU' ? 'Управление упражнениями' : 'Academy Exercises'}
          </h2>
          <p className="text-[10px] uppercase font-bold text-brand-navy/40 tracking-wider">
            {lang === 'RU' ? 'Планируйте занятия быстро, сохраняя упражнения для агeнды' : 'Create, browse, and sync specific exercises to coaching events'}
          </p>
        </div>
        <Button 
          id="create-exercise-btn"
          onClick={openCreateForm}
          className="h-14 px-8 !rounded-2xl italic uppercase tracking-widest text-[10px] font-black bg-brand-teal text-white shadow-teal flex items-center gap-3 self-start md:self-auto shrink-0"
        >
          <Plus className="w-5 h-5" />
          {lang === 'RU' ? 'ДОБАВИТЬ УПРАЖНЕНИЕ' : 'ADD NEW EXERCISE'}
        </Button>
      </div>

      {/* Filter and Search rail */}
      <Card className="p-6 rounded-[28px] glass border-white/60 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Search box */}
          <div className="col-span-1 relative flex items-center">
            <Search className="absolute left-5 w-5 h-5 text-brand-navy/30 pointer-events-none" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'RU' ? 'Найти по имени...' : 'Search drills...'}
              className="w-full h-12 pl-12 pr-5 bg-white/45 border-2 border-brand-navy/5 rounded-2xl focus:outline-none focus:border-brand-teal transition-all text-xs font-black uppercase italic"
            />
          </div>

          {/* Age filter */}
          <div className="col-span-1 flex flex-col gap-1.5 justify-center">
            <label className="text-[9px] font-black tracking-widest uppercase text-brand-navy/40 italic ml-2">
              {lang === 'RU' ? 'ВОЗРАСТНАЯ ГРУППА' : 'AGE CATEGORY'}
            </label>
            <div className="flex flex-wrap gap-1">
              {['All', 'A', 'B', 'C'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setAgeFilter(tag)}
                  className={`px-2.5 py-1.5 rounded-xl uppercase text-[9px] font-black italic tracking-widest transition-all ${
                    ageFilter === tag 
                      ? 'bg-brand-navy text-white shadow-md' 
                      : 'bg-white/40 hover:bg-white text-brand-navy/60 border border-brand-navy/5'
                  }`}
                >
                  {tag === 'All' 
                    ? (lang === 'RU' ? 'Все' : 'All') 
                    : lang === 'RU' 
                      ? `Группа ${tag}` 
                      : `Group ${tag}`}
                </button>
              ))}
            </div>
          </div>

          {/* Complexity filter */}
          <div className="col-span-1 flex flex-col gap-1.5 justify-center">
            <label className="text-[9px] font-black tracking-widest uppercase text-brand-navy/40 italic ml-2">
              {lang === 'RU' ? 'СЛОЖНОСТЬ' : 'DIFFICULTY LEVEL'}
            </label>
            <div className="flex gap-1.5">
              {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setComplexityFilter(lvl)}
                  className={`flex-1 py-1.5 rounded-xl uppercase text-[9px] font-black italic tracking-widest transition-all ${
                    complexityFilter === lvl 
                      ? 'bg-brand-teal text-white shadow-md' 
                      : 'bg-white/40 hover:bg-white text-brand-navy/60 border border-brand-navy/5'
                  }`}
                >
                  {lvl === 'All' ? (lang === 'RU' ? 'Все' : 'All') : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Phase Filter */}
          <div className="col-span-1 flex flex-col gap-1.5 justify-center">
            <label className="text-[9px] font-black tracking-widest uppercase text-brand-navy/40 italic ml-2">
              {lang === 'RU' ? 'ЭТАП / ФАЗА' : 'TRAINING PHASE'}
            </label>
            <div className="grid grid-cols-5 gap-1">
              {['All', '1', '2', '3', '4'].map((ph) => {
                const label = ph === 'All' 
                  ? (lang === 'RU' ? 'Все' : 'All') 
                  : `Ф${ph}`;
                const titleText = ph === 'All' 
                  ? 'All' 
                  : ph === '1' 
                    ? (lang === 'RU' ? 'Разминка' : 'Warm Up') 
                    : ph === '2' 
                      ? (lang === 'RU' ? 'Интенсив' : 'Skills & Fit') 
                      : ph === '3' 
                        ? (lang === 'RU' ? 'Мастерство' : 'Football') 
                        : (lang === 'RU' ? 'Игра/Заминка' : 'Scrimmage');

                return (
                  <button
                    key={ph}
                    onClick={() => setPhaseFilter(ph)}
                    className={`py-1.5 rounded-xl uppercase text-[9px] font-black italic tracking-widest transition-all text-center ${
                      phaseFilter === ph 
                        ? 'bg-brand-teal text-white shadow-md' 
                        : 'bg-white/40 hover:bg-white text-brand-navy/60 border border-brand-navy/5'
                    }`}
                    title={titleText}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[2000] p-6 bg-brand-navy text-white rounded-[32px] flex items-center gap-4 shadow-3xl font-black italic uppercase tracking-widest text-xs border border-white/15"
          >
            <Check className="w-5 h-5 text-brand-teal" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercises list */}
      {loading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
        </div>
      ) : filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((ex) => (
            <Card 
              key={ex.id} 
              className={`p-6 rounded-[28px] glass border-white/60 flex flex-col justify-between shadow-xl group hover:shadow-2xl transition-all relative overflow-hidden ${
                ex.isDefault ? 'bg-gradient-to-br from-white to-brand-teal/5' : 'bg-white'
              }`}
            >
              {/* Badge indicating default template */}
              {ex.isDefault && (
                <div className="absolute top-0 right-0 py-1.5 px-4 bg-brand-teal/10 rounded-bl-2xl text-[7px] font-black uppercase tracking-widest italic text-brand-teal">
                  {lang === 'RU' ? 'ШАБЛОН' : 'TEMPLATE'}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-start justify-between min-w-0 pr-12">
                  <div className="min-w-0 w-full">
                    <h4 className="font-black italic uppercase text-base sm:text-lg text-brand-navy leading-tight mb-1 group-hover:text-brand-teal transition-colors break-words">
                      {ex.name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-brand-navy/30 italic mr-2">
                      <Target className="w-3 h-3 text-brand-navy/20" />
                      {ex.ageGroup}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {ex.phase && (
                    <Badge color={ex.phase === 1 ? 'navy' : ex.phase === 2 ? 'teal' : ex.phase === 3 ? 'orange' : 'sunset'} className="text-[7.5px] font-semibold tracking-widest italic uppercase py-0.5">
                      {ex.phase === 1 
                        ? (lang === 'RU' ? 'Разминка' : 'Warm-up') 
                        : ex.phase === 2 
                          ? (lang === 'RU' ? 'Интенсив' : 'Skills & Fit') 
                          : ex.phase === 3 
                            ? (lang === 'RU' ? 'Мастерство' : 'Football') 
                            : (lang === 'RU' ? 'Игра/Заминка' : 'Scrimmage')}
                    </Badge>
                  )}
                  {(() => {
                    const catDetails = getExerciseCategory(ex, lang);
                    const phaseLabel = ex.phase === 1 
                      ? (lang === 'RU' ? 'Разминка' : 'Warm-up') 
                      : ex.phase === 2 
                        ? (lang === 'RU' ? 'Интенсив' : 'Skills & Fit') 
                        : ex.phase === 3 
                          ? (lang === 'RU' ? 'Мастерство' : 'Football') 
                          : ex.phase === 4 
                            ? (lang === 'RU' ? 'Игра/Заминка' : 'Scrimmage')
                            : '';
                    
                    if (phaseLabel && catDetails.label.toLowerCase() === phaseLabel.toLowerCase()) {
                      return null;
                    }
                    
                    return (
                      <Badge color={catDetails.color} className="text-[7.5px] font-semibold tracking-widest italic uppercase py-0.5">
                        {catDetails.label}
                      </Badge>
                    );
                  })()}
                  <Badge color={ex.complexity === 'Beginner' ? 'teal' : ex.complexity === 'Intermediate' ? 'navy' : 'sunset'} className="text-[7.5px] font-semibold tracking-widest italic uppercase py-0.5">
                    {ex.complexity}
                  </Badge>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase italic text-brand-teal">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ex.duration} {lang === 'RU' ? 'мин' : 'mins'}</span>
                  </div>
                </div>

                <p className="text-[11px] font-medium leading-relaxed opacity-75 text-brand-navy hover:opacity-100 transition-opacity whitespace-pre-wrap">
                  {ex.description}
                </p>
              </div>

              {/* CRUD Actions */}
              <div className="flex items-center gap-2 justify-end mt-6 pt-4 border-t border-brand-navy/5">
                <button
                  onClick={() => openEditForm(ex)}
                  className="w-9 h-9 rounded-lg border border-black/5 flex items-center justify-center bg-white hover:bg-brand-teal hover:text-white hover:border-brand-teal text-brand-navy/40 transition-all shadow-sm cursor-pointer"
                  title={lang === 'RU' ? 'Изменить' : 'Edit exercise'}
                  id={`edit-btn-${ex.id}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExercise(ex.id, ex.isDefault)}
                  className="w-9 h-9 rounded-lg border border-black/5 flex items-center justify-center bg-white hover:bg-brand-sunset hover:text-white hover:border-brand-sunset text-brand-navy/40 transition-all shadow-sm cursor-pointer"
                  title={lang === 'RU' ? 'Удалить' : 'Delete exercise'}
                  id={`delete-btn-${ex.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center glass rounded-[36px] border-white/60">
          <p className="text-xl font-black italic uppercase text-brand-navy/20">
            {lang === 'RU' ? 'УПРАЖНЕНИЙ НЕ НАЙДЕНО' : 'NO DRILLS MATCH YOUR FILTERS'}
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setAgeFilter('All'); setComplexityFilter('All'); }}
            className="text-[9px] font-black uppercase text-brand-teal underline tracking-widest mt-3 whitespace-nowrap block mx-auto"
          >
            {lang === 'RU' ? 'Сбросить фильтры' : 'Reset active filters'}
          </button>
        </div>
      )}

      {/* Modal Slideover Form for creation/editing */}
      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-brand-navy/60 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-10 md:p-12 glass rounded-[32px] sm:rounded-[48px] border-white/60 shadow-3xl relative custom-scrollbar bg-brand-cream/95 text-brand-navy"
            >
              <button 
                onClick={() => setShowForm(false)}
                className="absolute top-6 right-6 w-10 h-10 rounded-full border border-brand-navy/10 flex items-center justify-center text-brand-navy/40 hover:text-brand-navy hover:bg-black/5 transition-all z-[10]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-10">
                <Badge color={editingExercise ? "sunset" : "teal"} className="mb-4">
                  {editingExercise 
                    ? (lang === 'RU' ? 'РЕДАКТИРОВАНИЕ УПРАЖНЕНИЯ' : 'MODIFY DRILL SPECIFICATION') 
                    : (lang === 'RU' ? 'СОЗДАНИЕ НОВОГО УПРАЖНЕНИЯ' : 'DECLARE NEW EXERCISE')}
                </Badge>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand-navy leading-none">
                  {editingExercise 
                    ? (lang === 'RU' ? 'Изменить параметры' : 'Edit Parameters') 
                    : (lang === 'RU' ? 'Форма упражнения' : 'Coaching Drill Form')}
                </h3>
              </div>

              <form onSubmit={handleSaveExercise} className="space-y-6">
                {/* Exercise name */}
                <div className="space-y-2">
                  <label htmlFor="exercise-name" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    {lang === 'RU' ? 'НАЗВАНИЕ УПРАЖНЕНИЯ' : 'DRILL INTRO/NAME'}
                  </label>
                  <Input 
                    id="exercise-name"
                    required
                    placeholder={lang === 'RU' ? 'Например, Касания на месте Vengerkas' : 'e.g. Red Light Speed Dribbling'}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="!rounded-[20px] h-14"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Length in minutes */}
                  <div className="space-y-2">
                    <label htmlFor="exercise-duration" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                      {lang === 'RU' ? 'ПРОДОЛЖИТЕЛЬНОСТЬ (МИН)' : 'DURATION (MINUTES)'}
                    </label>
                    <input 
                      id="exercise-duration"
                      required
                      type="number"
                      min={1}
                      max={60}
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                      className="w-full h-14 px-6 bg-white/40 border-2 border-brand-navy/5 rounded-[20px] focus:outline-none focus:border-brand-teal transition-all font-black italic text-brand-navy"
                    />
                  </div>

                  {/* Level of complexity */}
                  <div className="space-y-2">
                    <label htmlFor="exercise-complexity" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                      {lang === 'RU' ? 'СЛОЖНОСТЬ' : 'COMPLEXITY LEVEL'}
                    </label>
                    <select
                      id="exercise-complexity"
                      value={formData.complexity}
                      onChange={(e) => setFormData({...formData, complexity: e.target.value as any})}
                      className="w-full h-14 px-5 bg-white/45 border-2 border-brand-navy/5 rounded-[20px] focus:outline-none focus:border-brand-teal transition-all text-sm font-black uppercase italic text-brand-navy"
                    >
                      <option value="Beginner">⭐ Easy (Beginner)</option>
                      <option value="Intermediate">⭐⭐ Medium (Intermediate)</option>
                      <option value="Advanced">⭐⭐⭐ Hard (Advanced)</option>
                    </select>
                  </div>
                </div>

                {/* Relevance to age group */}
                <div className="space-y-2">
                  <label htmlFor="exercise-age" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    {lang === 'RU' ? 'АКТУАЛЬНОСТЬ ДЛЯ ГРУППЫ' : 'RELEVANCE FOR AGE GROUP'}
                  </label>
                  <select
                    id="exercise-age"
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({...formData, ageGroup: e.target.value})}
                    className="w-full h-14 px-5 bg-white/45 border-2 border-brand-navy/5 rounded-[20px] focus:outline-none focus:border-brand-teal transition-all text-sm font-black uppercase italic text-brand-navy"
                  >
                    <option value="All Ages">{lang === 'RU' ? 'Все возрасты (Универсально)' : 'All Ages'}</option>
                    <option value="Группа А (5–7 лет)">{lang === 'RU' ? 'Группа А (5–7 лет)' : 'Group A (5-7 yrs)'}</option>
                    <option value="Группа B (8–11 лет)">{lang === 'RU' ? 'Группа B (8–11 лет)' : 'Group B (8-11 yrs)'}</option>
                    <option value="Группа C (12–14 лет)">{lang === 'RU' ? 'Группа C (12–14 лет)' : 'Group C (12-14 yrs)'}</option>
                  </select>
                </div>

                {/* Category Focus Select Field */}
                <div className="space-y-2">
                  <label htmlFor="exercise-category" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    {lang === 'RU' ? 'СФЕРА УПРАЖНЕНИЯ (КАТЕГОРИЯ FOCUS)' : 'DRILL FOCUS CATEGORY'}
                  </label>
                  <select
                    id="exercise-category"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({...formData, category: e.target.value});
                      setFormError(null);
                    }}
                    className="w-full h-14 px-5 bg-white/45 border-2 border-brand-navy/5 rounded-[20px] focus:outline-none focus:border-brand-teal transition-all text-sm font-black uppercase italic text-brand-navy"
                  >
                    <option value="">{lang === 'RU' ? '⚙️ Автоопределение (по названию/описанию)' : '⚙️ Auto-Detect (intelligent)'}</option>
                    <option value="Warm-up" disabled={formData.phase === 2 || formData.phase === 3}>
                      {lang === 'RU' ? '🔥 Разминка / Восстановление (Warm-up) - [Заблокировано для Ф2/Ф3]' : '🔥 Warm-up / Recovery - [Disabled for P2/P3]'}
                    </option>
                    <option value="Technical" disabled={formData.phase === 1}>
                      {lang === 'RU' ? '⚽ Техническое / Контроль и пас (Technical) - [Заблокировано для Ф1]' : '⚽ Technical Skills & Touches - [Disabled for P1]'}
                    </option>
                    <option value="Cognitive">{lang === 'RU' ? '🧠 Когнитивное / Реакция и фокус (Cognitive)' : '🧠 Cognitive & Focus Spark'}</option>
                    <option value="Tactical">{lang === 'RU' ? '⚔️ Тактическое и игровое (Tactical / Scrimmage)' : '⚔️ Tactical Game Play'}</option>
                  </select>
                </div>

                {/* Phase tag selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    {lang === 'RU' ? 'ЭТАП СЕССИИ (ФАЗА УПРАЖНЕНИЯ)' : 'TRAINING PHASE TAG'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { val: 1, label_ru: 'Разминка (Ф1)', label_en: 'Warm-up (P1)' },
                      { val: 2, label_ru: 'Интенсив (Ф2)', label_en: 'Skills (P2)' },
                      { val: 3, label_ru: 'Мастерство (Ф3)', label_en: 'Football (P3)' },
                      { val: 4, label_ru: 'Двусторонка (Ф4)', label_en: 'Scrimmage (P4)' }
                    ].map((item) => {
                      const isDisabled = 
                        (item.val === 1 && formData.category === 'Technical') ||
                        ((item.val === 2 || item.val === 3) && formData.category === 'Warm-up');

                      return (
                        <button
                          key={item.val}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => {
                            setFormData({ ...formData, phase: item.val });
                            setFormError(null);
                          }}
                          className={`py-3 px-4 rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all border text-center ${
                            formData.phase === item.val
                              ? 'bg-brand-teal text-white border-brand-teal shadow-md shadow-brand-teal/20 font-black'
                              : isDisabled
                                ? 'bg-red-500/5 border-red-500/10 text-red-500/20 line-through cursor-not-allowed'
                                : 'bg-white/40 border-brand-navy/10 hover:bg-white text-brand-navy/60'
                          }`}
                          title={isDisabled ? (lang === 'RU' ? 'Конфликтует с выбранной Категорией' : 'Conflicts with the selected Option') : undefined}
                        >
                          {lang === 'RU' ? item.label_ru : item.label_en}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="exercise-description" className="text-[10px] font-black uppercase tracking-widest text-brand-navy/40 italic ml-4">
                    {lang === 'RU' ? 'ПОДРОБНОЕ ОПИСАНИЕ И ИНСТРУКЦИЯ' : 'DETAILED DESCRIPTION & TUTORIAL'}
                  </label>
                  <textarea 
                    id="exercise-description"
                    required
                    rows={4}
                    placeholder={lang === 'RU' ? 'Шаг за шагом: подготовка, инвентарь, правила и критерии оценки...' : 'Define requirements, steps, cone arrangements, player rotation...'}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-5 bg-white/45 border-2 border-brand-navy/5 rounded-[24px] focus:outline-none focus:border-brand-teal transition-all text-sm font-medium text-brand-navy leading-relaxed min-h-[120px]"
                  />
                </div>

                {formError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-black uppercase italic tracking-wider flex items-center gap-2 block animate-in fade-in duration-300">
                    <span>⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button 
                    id="save-exercise-btn"
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 h-14 !rounded-[20px] bg-brand-navy text-white hover:bg-brand-teal font-black italic uppercase tracking-widest transition-all shadow-xl"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
                    ) : editingExercise ? (
                      lang === 'RU' ? 'ОБНОВИТЬ УПРАЖНЕНИЕ' : 'UPDATE DRILL'
                    ) : (
                      lang === 'RU' ? 'СОХРАНИТЬ' : 'SAVE EXERCISE'
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 h-14 !rounded-[20px] border-brand-navy/10 text-brand-navy/40 uppercase font-black italic text-[10px]"
                  >
                    {lang === 'RU' ? 'ОТМЕНА' : 'CANCEL'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
