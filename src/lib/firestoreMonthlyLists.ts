import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.ts";

export function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`; // e.g. "2026-07"
}

export async function getCollectionSyncMetadata(collectionName: string): Promise<{ lastSyncMonth: string | null; count: number } | null> {
  try {
    const metaRef = doc(db, "sync_metadata", collectionName);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const data = metaSnap.data();
      return {
        lastSyncMonth: data.lastSyncMonth || null,
        count: data.count || 0
      };
    }
  } catch (err) {
    console.error(`Firestore error reading sync_metadata for ${collectionName}:`, err);
  }
  return null;
}

export async function fetchMonthlyCollectionFromFirestore(collectionName: string): Promise<{ items: any[]; lastSyncMonth: string | null }> {
  try {
    const meta = await getCollectionSyncMetadata(collectionName);
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return { items: [], lastSyncMonth: meta?.lastSyncMonth || null };
    }

    const items: any[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && (data.title || data.name)) {
        items.push({
          ...data,
          id: data.id || docSnap.id
        });
      }
    });

    // Sort by rank if rank exists, or match descending
    items.sort((a, b) => {
      if (typeof a.rank === 'number' && typeof b.rank === 'number') {
        return a.rank - b.rank;
      }
      return (b.match || 0) - (a.match || 0);
    });

    return {
      items,
      lastSyncMonth: meta?.lastSyncMonth || (items[0]?.syncMonth || null)
    };
  } catch (err) {
    console.error(`Firestore error fetching collection ${collectionName}:`, err);
    return { items: [], lastSyncMonth: null };
  }
}

export async function saveMonthlyCollectionToFirestore(collectionName: string, items: any[], monthKey: string): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    
    for (const item of items) {
      const rawId = item.id || item.slug || (item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'item-' + Math.random().toString(36).substr(2, 6));
      const docId = String(rawId).replace(/\//g, '-');
      
      const payload = {
        ...item,
        id: docId,
        syncMonth: monthKey,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(colRef, docId), payload, { merge: true });
    }

    // Update metadata record
    const metaRef = doc(db, "sync_metadata", collectionName);
    await setDoc(metaRef, {
      collectionName,
      lastSyncMonth: monthKey,
      lastSyncDate: new Date().toISOString(),
      count: items.length,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[Firebase Firestore] Saved ${items.length} records into collection '${collectionName}' for month ${monthKey}`);
    return true;
  } catch (err) {
    console.error(`Firestore error saving collection ${collectionName}:`, err);
    return false;
  }
}
