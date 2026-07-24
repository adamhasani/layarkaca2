import { db } from './src/lib/firebase.js';
import { doc, deleteDoc } from 'firebase/firestore';

async function clear() {
  await deleteDoc(doc(db, 'system', 'home_cache'));
  console.log('Cache cleared');
}
clear();
