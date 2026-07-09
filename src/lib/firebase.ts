import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, query, where, getDocs, addDoc, updateDoc, getDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
auth.useDeviceLanguage();

export async function processRegistrationStatus(
  registrationId: string, 
  status: 'approved' | 'declined' | 'pending',
  passedData?: any
) {
  let registrationData = passedData;
  if (!registrationData) {
    const regSnap = await getDoc(doc(db, 'registrations', registrationId));
    if (regSnap.exists()) {
      registrationData = regSnap.data();
    } else {
      throw new Error(`Registration with ID ${registrationId} not found.`);
    }
  }

  // Prepare athlete data to save
  const athleteDataToSave = {
    registrationId,
    studentName: registrationData.studentName || '',
    studentAge: Number(registrationData.studentAge || 0),
    studentGender: registrationData.studentGender || 'male',
    studentLocation: registrationData.studentLocation || '',
    studentMedicalNotes: registrationData.studentMedicalNotes || '',
    studentProfileImage: registrationData.studentProfileImage || '',
    studentLanguage: registrationData.studentLanguage || 'RU',
    trainingGroup: registrationData.trainingGroup || '',
    trainingSchedule: registrationData.trainingSchedule || '',
    xp: Number(registrationData.xp || 0),
    totalPaidClasses: Number(registrationData.totalPaidClasses || 0),
    usedPaidClasses: Number(registrationData.usedPaidClasses || 0),
    status,
    parentFullName: registrationData.parentFullName || registrationData.parentName || '',
    parentPhone: registrationData.parentPhone || '',
    parentEmail: registrationData.parentEmail || '',
    createdAt: new Date().toISOString()
  };

  const athletesRef = collection(db, 'athletes');
  const q = query(athletesRef, where('registrationId', '==', registrationId));
  const querySnapshot = await getDocs(q);

  let athleteId = '';

  if (!querySnapshot.empty) {
    const existingDoc = querySnapshot.docs[0];
    athleteId = existingDoc.id;
    await updateDoc(doc(db, 'athletes', athleteId), {
      status,
      studentName: athleteDataToSave.studentName,
      studentAge: athleteDataToSave.studentAge,
      studentGender: athleteDataToSave.studentGender,
      studentLocation: athleteDataToSave.studentLocation,
      studentLanguage: athleteDataToSave.studentLanguage,
      trainingGroup: athleteDataToSave.trainingGroup,
      trainingSchedule: athleteDataToSave.trainingSchedule,
      parentFullName: athleteDataToSave.parentFullName,
      parentPhone: athleteDataToSave.parentPhone,
      parentEmail: athleteDataToSave.parentEmail
    });
  } else {
    const newDocRef = await addDoc(athletesRef, athleteDataToSave);
    athleteId = newDocRef.id;
  }

  await updateDoc(doc(db, 'registrations', registrationId), {
    status,
    athleteId
  });

  return athleteId;
}

