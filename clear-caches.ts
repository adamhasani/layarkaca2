import { db } from './src/lib/firebase';
import { doc, deleteDoc, getDocs, collection } from 'firebase/firestore';

async function clearCaches() {
  const systemRef = collection(db, 'system');
  const snap = await getDocs(systemRef);
  
  for (const document of snap.docs) {
    if (document.id.includes('cache') || document.id.includes('sync')) {
      console.log('Deleting', document.id);
      await deleteDoc(doc(db, 'system', document.id));
    }
  }
  console.log('Caches cleared');
  process.exit(0);
}
clearCaches();
