import * as firestore from '@firebase/firestore';

// Re-export all original firestore exports
export * from '@firebase/firestore';

// Active listeners to notify on data changes (reactive state)
interface OfflineListener {
  id: string;
  reference: any;
  onNext: () => void;
}
const activeListeners: OfflineListener[] = [];

// Helper to check if quota is active
const isQuotaExceededActive = (): boolean => {
  return (
    (typeof window !== 'undefined' && (window as any).__firestoreQuotaExceeded) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('firestoreQuotaExceeded') === 'true')
  );
};

// Retrieve mock DB from localStorage
const getLocalDb = (): Record<string, Record<string, any>> => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const data = localStorage.getItem('__firestore_mock_db');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
};

// Save mock DB to localStorage
const saveLocalDb = (dbData: Record<string, Record<string, any>>) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem('__firestore_mock_db', JSON.stringify(dbData));
  } catch (e) {
    console.error("[Firestore Wrapper] Error saving mock DB:", e);
  }
};

// Get collection and document info from ref
const getRefInfo = (ref: any) => {
  if (!ref) return { isDoc: false, isCollection: false, path: '', collectionName: '', docId: '' };
  
  let path = ref.path || (ref._path && ref._path.toString()) || '';
  if (!path && ref.converter && ref.query) {
    path = ref.query.path || (ref.query._path && ref.query._path.toString()) || '';
  }
  if (!path && ref.collection) {
    path = ref.collection.path || (ref.collection._path && ref.collection._path.toString()) || '';
  }
  if (!path && ref._query && ref._query.path) {
    path = ref._query.path.toString();
  }
  
  if (!path) {
    const str = String(ref);
    for (const key of ['registrations', 'athletes', 'public_profiles', 'masters', 'events', 'event_templates', 'exercises', 'invitations', 'parameter_records', 'payment_history']) {
      if (str.includes(key)) {
        path = key;
        break;
      }
    }
  }

  if (!path) {
    try {
      const jsonStr = JSON.stringify(ref);
      for (const key of ['registrations', 'athletes', 'public_profiles', 'masters', 'events', 'event_templates', 'exercises', 'invitations', 'parameter_records', 'payment_history']) {
        if (jsonStr.includes(`"${key}"`)) {
          path = key;
          break;
        }
      }
    } catch (e) {}
  }

  const parts = path.split('/').filter(Boolean);
  const isDoc = parts.length % 2 === 0;
  const isCollection = parts.length % 2 === 1;
  const collectionName = parts[0] || '';
  const docId = isDoc ? parts[parts.length - 1] : '';

  return { isDoc, isCollection, path, collectionName, docId };
};

// Filter local collection based on query filters
const filterLocalCollection = (collectionName: string, queryRef: any): any[] => {
  const localDb = getLocalDb();
  const rawDocsObj = localDb[collectionName] || {};
  let docsList = Object.keys(rawDocsObj).map(id => ({
    id,
    ...rawDocsObj[id]
  }));

  const filters: { field: string; op: string; value: any }[] = [];
  
  if (queryRef) {
    const findFilters = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (obj.field && obj.op && obj.value !== undefined) {
        filters.push({
          field: typeof obj.field === 'string' ? obj.field : (obj.field.segments ? obj.field.segments.join('.') : String(obj.field)),
          op: String(obj.op),
          value: obj.value
        });
        return;
      }
      
      if (Array.isArray(obj._query?.filters)) {
        obj._query.filters.forEach((f: any) => {
          if (f.field && f.op && f.value !== undefined) {
            filters.push({
              field: f.field.segments ? f.field.segments.join('.') : String(f.field),
              op: String(f.op),
              value: f.value
            });
          } else if (f.field && f.value !== undefined) {
            filters.push({
              field: f.field.segments ? f.field.segments.join('.') : String(f.field),
              op: '==',
              value: f.value
            });
          }
        });
        return;
      }

      for (const k of Object.keys(obj)) {
        if (k === 'filters' && Array.isArray(obj[k])) {
          obj[k].forEach((f: any) => {
            if (f.field && f.value !== undefined) {
              filters.push({
                field: f.field.segments ? f.field.segments.join('.') : String(f.field),
                op: f.op || '==',
                value: f.value
              });
            }
          });
        } else if (typeof obj[k] === 'object') {
          if (k !== 'parent' && k !== 'db' && k !== 'firestore' && k !== 'delegate') {
            findFilters(obj[k]);
          }
        }
      }
    };
    
    try {
      findFilters(queryRef);
    } catch (e) {
      console.warn("[Firestore Wrapper] Error parsing query filters:", e);
    }
  }

  if (filters.length > 0) {
    docsList = docsList.filter(doc => {
      return filters.every(f => {
        const val = doc[f.field];
        const fVal = f.value;
        let targetFilterVal = fVal;
        
        if (fVal && typeof fVal === 'object') {
          if (fVal.stringValue !== undefined) targetFilterVal = fVal.stringValue;
          else if (fVal.integerValue !== undefined) targetFilterVal = Number(fVal.integerValue);
          else if (fVal.booleanValue !== undefined) targetFilterVal = fVal.booleanValue;
          else if (fVal.value !== undefined) targetFilterVal = fVal.value;
        }

        if (f.op === '==' || f.op === 'equal') {
          return String(val) === String(targetFilterVal);
        }
        if (f.op === 'in') {
          const arr = Array.isArray(targetFilterVal) ? targetFilterVal : [targetFilterVal];
          return arr.map(String).includes(String(val));
        }
        return true;
      });
    });
  }

  // Supply default events if events is empty (for fresh demo run)
  if (docsList.length === 0 && collectionName === 'events') {
    return [
      {
        id: 'dummy_evt_1',
        name: 'Football Pro Training (U12)',
        description: 'Technical soccer training focusing on dribbling, passing, and small-sided games.',
        date: new Date().toISOString().split('T')[0],
        startTime: '16:00',
        location: 'Vake Park Pitch',
        masterId: 'coach_1',
        isPublic: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'dummy_evt_2',
        name: 'Youth Soccer Academy (U8)',
        description: 'Fun introductory drills, coordination exercises, and friendly games.',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        startTime: '10:00',
        location: 'Saburtalo Field',
        masterId: 'coach_1',
        isPublic: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  return docsList;
};

// Notify active listeners of changes on a collection
const notifyListeners = (collectionName: string) => {
  activeListeners.forEach(l => {
    const info = getRefInfo(l.reference);
    if (info.collectionName === collectionName) {
      setTimeout(() => {
        try {
          l.onNext();
        } catch (e) {
          console.error("[Firestore Wrapper] Error calling listener onNext callback:", e);
        }
      }, 0);
    }
  });
};

// Mock Document Snapshot class
class MockDocumentSnapshot {
  id: string;
  private _data: any;
  private _exists: boolean;

  constructor(id: string, data: any, exists: boolean = true) {
    this.id = id;
    this._data = data;
    this._exists = exists;
  }

  exists() {
    return this._exists;
  }

  data() {
    return this._exists ? { ...this._data } : undefined;
  }

  get(fieldPath: string) {
    if (!this._exists || !this._data) return undefined;
    return this._data[fieldPath];
  }
}

// Mock Query Snapshot class
class MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
  empty: boolean;
  size: number;

  constructor(docs: MockDocumentSnapshot[]) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }

  forEach(callback: (doc: MockDocumentSnapshot, index: number) => void) {
    this.docs.forEach((doc, idx) => callback(doc, idx));
  }
}

// Global handler for quota exhaustion detection
const handleWriteError = (error: any, actionName: string) => {
  const isQuota = 
    String(error?.code) === 'resource-exhausted' || 
    String(error?.message || '').toLowerCase().includes('quota') ||
    String(error?.message || '').toLowerCase().includes('resource-exhausted');

  if (isQuota) {
    console.warn(`[Firestore Wrapper] Detected quota error in ${actionName}:`, error);
    if (typeof window !== 'undefined') {
      (window as any).__firestoreQuotaExceeded = true;
      window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('firestoreQuotaExceeded', 'true');
    }
  }
  throw error;
};

// Intercepted write operations
export const addDoc = async (...args: any[]) => {
  const ref = args[0];
  const data = args[1];
  const { collectionName } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const docId = 'offline_' + Math.random().toString(36).substring(2);
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    const newDoc = { id: docId, ...data, createdAt: new Date().toISOString() };
    localDb[collectionName][docId] = newDoc;
    saveLocalDb(localDb);
    console.log(`[Firestore Wrapper] Offline addDoc on ${collectionName}:`, newDoc);
    notifyListeners(collectionName);
    return { id: docId, path: `${collectionName}/${docId}` };
  }

  try {
    const res = await (firestore.addDoc as any)(...args);
    // Sync to local cache on success
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    localDb[collectionName][res.id] = { id: res.id, ...data };
    saveLocalDb(localDb);
    return res;
  } catch (error) {
    return handleWriteError(error, 'addDoc');
  }
};

export const updateDoc = async (...args: any[]) => {
  const ref = args[0];
  const data = args[1];
  const { collectionName, docId } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    const existingDoc = localDb[collectionName][docId] || {};
    const updatedDoc = { ...existingDoc, ...data, id: docId, updatedAt: new Date().toISOString() };
    localDb[collectionName][docId] = updatedDoc;
    saveLocalDb(localDb);
    console.log(`[Firestore Wrapper] Offline updateDoc on ${collectionName}/${docId}:`, updatedDoc);
    notifyListeners(collectionName);
    return;
  }

  try {
    const res = await (firestore.updateDoc as any)(...args);
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    const existingDoc = localDb[collectionName][docId] || {};
    localDb[collectionName][docId] = { ...existingDoc, ...data, id: docId };
    saveLocalDb(localDb);
    return res;
  } catch (error) {
    return handleWriteError(error, 'updateDoc');
  }
};

export const setDoc = async (...args: any[]) => {
  const ref = args[0];
  const data = args[1];
  const options = args[2];
  const { collectionName, docId } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    const existingDoc = localDb[collectionName][docId] || {};
    const isMerge = options && options.merge;
    const updatedDoc = isMerge ? { ...existingDoc, ...data } : { ...data };
    updatedDoc.id = docId;
    localDb[collectionName][docId] = updatedDoc;
    saveLocalDb(localDb);
    console.log(`[Firestore Wrapper] Offline setDoc on ${collectionName}/${docId}:`, updatedDoc);
    notifyListeners(collectionName);
    return;
  }

  try {
    const res = await (firestore.setDoc as any)(...args);
    const localDb = getLocalDb();
    if (!localDb[collectionName]) localDb[collectionName] = {};
    const existingDoc = localDb[collectionName][docId] || {};
    const isMerge = options && options.merge;
    const updatedDoc = isMerge ? { ...existingDoc, ...data } : { ...data };
    updatedDoc.id = docId;
    localDb[collectionName][docId] = updatedDoc;
    saveLocalDb(localDb);
    return res;
  } catch (error) {
    return handleWriteError(error, 'setDoc');
  }
};

export const deleteDoc = async (...args: any[]) => {
  const ref = args[0];
  const { collectionName, docId } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const localDb = getLocalDb();
    if (localDb[collectionName] && localDb[collectionName][docId]) {
      delete localDb[collectionName][docId];
      saveLocalDb(localDb);
    }
    console.log(`[Firestore Wrapper] Offline deleteDoc on ${collectionName}/${docId}`);
    notifyListeners(collectionName);
    return;
  }

  try {
    const res = await (firestore.deleteDoc as any)(...args);
    const localDb = getLocalDb();
    if (localDb[collectionName] && localDb[collectionName][docId]) {
      delete localDb[collectionName][docId];
      saveLocalDb(localDb);
    }
    return res;
  } catch (error) {
    return handleWriteError(error, 'deleteDoc');
  }
};

// Intercepted read operations
export const getDoc = async (...args: any[]) => {
  const ref = args[0];
  const { collectionName, docId } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const localDb = getLocalDb();
    const docData = (localDb[collectionName] || {})[docId];
    const exists = !!docData;
    return new MockDocumentSnapshot(docId, docData || {}, exists);
  }

  try {
    const snap = await (firestore.getDoc as any)(...args);
    if (snap && snap.exists && snap.exists()) {
      const localDb = getLocalDb();
      if (!localDb[collectionName]) localDb[collectionName] = {};
      localDb[collectionName][docId] = { id: docId, ...snap.data() };
      saveLocalDb(localDb);
    }
    return snap;
  } catch (error) {
    return handleWriteError(error, 'getDoc');
  }
};

export const getDocs = async (...args: any[]) => {
  const ref = args[0];
  const { collectionName } = getRefInfo(ref);

  if (isQuotaExceededActive()) {
    const filteredDocs = filterLocalCollection(collectionName, ref);
    return new MockQuerySnapshot(filteredDocs.map(d => new MockDocumentSnapshot(d.id, d, true)));
  }

  try {
    const snap = await (firestore.getDocs as any)(...args);
    if (snap && snap.docs) {
      const localDb = getLocalDb();
      if (!localDb[collectionName]) localDb[collectionName] = {};
      snap.docs.forEach((docSnap: any) => {
        localDb[collectionName][docSnap.id] = { id: docSnap.id, ...docSnap.data() };
      });
      saveLocalDb(localDb);
    }
    return snap;
  } catch (error) {
    return handleWriteError(error, 'getDocs');
  }
};

// Intercepted subscriber
export const onSnapshot = (...args: any[]) => {
  const ref = args[0];
  const { collectionName, isDoc, docId } = getRefInfo(ref);

  const functions = args.filter(arg => typeof arg === 'function');
  const onNext = functions[0];
  const onError = functions[1];

  const listenerId = Math.random().toString(36).substring(2);

  const triggerOfflineUpdate = () => {
    try {
      if (isDoc) {
        const localDb = getLocalDb();
        const docData = (localDb[collectionName] || {})[docId];
        const exists = !!docData;
        const snap = new MockDocumentSnapshot(docId, docData || {}, exists);
        onNext(snap);
      } else {
        const filteredDocs = filterLocalCollection(collectionName, ref);
        const snap = new MockQuerySnapshot(filteredDocs.map(d => new MockDocumentSnapshot(d.id, d, true)));
        onNext(snap);
      }
    } catch (err) {
      console.error("[Firestore Wrapper] Error in offline listener trigger:", err);
    }
  };

  if (isQuotaExceededActive()) {
    console.log(`[Firestore Wrapper] Quota exceeded active. Registering offline real-time listener for ${collectionName}.`);
    
    activeListeners.push({
      id: listenerId,
      reference: ref,
      onNext: triggerOfflineUpdate
    });

    // Trigger immediately in next tick
    setTimeout(triggerOfflineUpdate, 0);

    return () => {
      const idx = activeListeners.findIndex(l => l.id === listenerId);
      if (idx !== -1) {
        activeListeners.splice(idx, 1);
      }
    };
  }

  let unsubscribe: any = null;

  const wrappedOnNext = (snapshot: any) => {
    if (snapshot) {
      try {
        const localDb = getLocalDb();
        if (!localDb[collectionName]) localDb[collectionName] = {};
        if (snapshot.docs) {
          snapshot.docs.forEach((docSnap: any) => {
            localDb[collectionName][docSnap.id] = { id: docSnap.id, ...docSnap.data() };
          });
        } else if (snapshot.exists && snapshot.exists()) {
          localDb[collectionName][snapshot.id] = { id: snapshot.id, ...snapshot.data() };
        }
        saveLocalDb(localDb);
      } catch (err) {
        console.warn("[Firestore Wrapper] Error caching onSnapshot data:", err);
      }
    }
    onNext(snapshot);
  };

  const wrappedOnError = (error: any) => {
    const isQuota = 
      String(error?.code) === 'resource-exhausted' || 
      String(error?.message || '').toLowerCase().includes('quota') ||
      String(error?.message || '').toLowerCase().includes('resource-exhausted');

    if (isQuota) {
      console.warn("[Firestore Wrapper] Quota limit reached on active snapshot. Transitioning listener to offline mode.");
      if (typeof window !== 'undefined') {
        (window as any).__firestoreQuotaExceeded = true;
        window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('firestoreQuotaExceeded', 'true');
      }

      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (e) {}
      }

      const item = activeListeners.find(l => l.id === listenerId);
      if (item) {
        item.onNext = triggerOfflineUpdate;
      }
      
      triggerOfflineUpdate();
      return;
    }

    if (onError) {
      onError(error);
    }
  };

  activeListeners.push({
    id: listenerId,
    reference: ref,
    onNext: triggerOfflineUpdate
  });

  const modifiedArgs = [...args];
  let onNextIdx = -1;
  let onErrorIdx = -1;
  let funcCount = 0;
  for (let i = 0; i < modifiedArgs.length; i++) {
    if (typeof modifiedArgs[i] === 'function') {
      funcCount++;
      if (funcCount === 1) onNextIdx = i;
      if (funcCount === 2) onErrorIdx = i;
    }
  }

  if (onNextIdx !== -1) {
    modifiedArgs[onNextIdx] = wrappedOnNext;
  }
  if (onErrorIdx !== -1) {
    modifiedArgs[onErrorIdx] = wrappedOnError;
  } else {
    modifiedArgs.push(wrappedOnError);
  }

  try {
    unsubscribe = (firestore.onSnapshot as any)(...modifiedArgs);
    
    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (e) {}
      }
      const idx = activeListeners.findIndex(l => l.id === listenerId);
      if (idx !== -1) {
        activeListeners.splice(idx, 1);
      }
    };
  } catch (err: any) {
    const isQuota = 
      String(err?.code) === 'resource-exhausted' || 
      String(err?.message || '').toLowerCase().includes('quota') ||
      String(err?.message || '').toLowerCase().includes('resource-exhausted');

    if (isQuota) {
      if (typeof window !== 'undefined') {
        (window as any).__firestoreQuotaExceeded = true;
        window.dispatchEvent(new CustomEvent('firestore-quota-exceeded'));
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('firestoreQuotaExceeded', 'true');
      }
      
      const item = activeListeners.find(l => l.id === listenerId);
      if (item) {
        item.onNext = triggerOfflineUpdate;
      }
      setTimeout(triggerOfflineUpdate, 0);
      
      return () => {
        const idx = activeListeners.findIndex(l => l.id === listenerId);
        if (idx !== -1) {
          activeListeners.splice(idx, 1);
        }
      };
    }
    
    throw err;
  }
};
