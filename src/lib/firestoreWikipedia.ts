import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase.ts";

export interface WikipediaBlockbusterRecord {
  id: string;
  slug: string;
  title: string;
  type: string;
  rank: number;
  year: number;
  rating: string;
  duration: string;
  genres: string[];
  poster: string;
  posterUrl?: string;
  bannerUrl: string;
  synopsis: string;
  boxOffice: string;
  match: number;
  syncMonth: string;
  updatedAt?: string;
  subtitles?: Array<{ lang: string; label: string }>;
  reviews?: Array<any>;
}

export function getCurrentMonthKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`; // e.g. "2026-07"
}

export async function getWikipediaSyncMetadata(metaDocId: string = "sync_info"): Promise<{ lastSyncMonth: string | null; count: number } | null> {
  try {
    const metaRef = doc(db, "wikipedia_metadata", metaDocId);
    const metaSnap = await getDoc(metaRef);
    if (metaSnap.exists()) {
      const data = metaSnap.data();
      return {
        lastSyncMonth: data.lastSyncMonth || null,
        count: data.count || 0
      };
    }
  } catch (err) {
    console.error("Firestore error reading wikipedia_metadata:", err);
  }
  return null;
}

export async function fetchWikipediaFromFirestore(
  collectionName: string = "wikipedia_blockbusters",
  metaDocId: string = "sync_info"
): Promise<{ films: WikipediaBlockbusterRecord[]; lastSyncMonth: string | null }> {
  try {
    const meta = await getWikipediaSyncMetadata(metaDocId);
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      return { films: [], lastSyncMonth: meta?.lastSyncMonth || null };
    }

    const films: WikipediaBlockbusterRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as WikipediaBlockbusterRecord;
      if (data && data.title) {
        films.push({
          ...data,
          id: data.id || docSnap.id,
          posterUrl: data.posterUrl || data.poster
        });
      }
    });

    // Sort by rank ascending (Rank 1, 2, 3...)
    films.sort((a, b) => (a.rank || 999) - (b.rank || 999));

    return {
      films,
      lastSyncMonth: meta?.lastSyncMonth || (films[0]?.syncMonth || null)
    };
  } catch (err) {
    console.error(`Firestore error fetching ${collectionName}:`, err);
    return { films: [], lastSyncMonth: null };
  }
}

export async function saveWikipediaToFirestore(
  films: WikipediaBlockbusterRecord[],
  monthKey: string,
  collectionName: string = "wikipedia_blockbusters",
  metaDocId: string = "sync_info"
): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    
    // Batch set each film document
    for (const film of films) {
      const docId = film.id || ('wiki-film-' + film.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
      const payload = {
        ...film,
        id: docId,
        syncMonth: monthKey,
        updatedAt: new Date().toISOString()
      };
      await setDoc(doc(colRef, docId), payload, { merge: true });
    }

    // Save sync metadata
    const metaRef = doc(db, "wikipedia_metadata", metaDocId);
    await setDoc(metaRef, {
      lastSyncMonth: monthKey,
      lastSyncDate: new Date().toISOString(),
      count: films.length,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`[Firebase Firestore] Successfully stored ${films.length} Wikipedia items into ${collectionName} for month ${monthKey}!`);
    return true;
  } catch (err) {
    console.error(`Firestore error saving to ${collectionName}:`, err);
    return false;
  }
}
