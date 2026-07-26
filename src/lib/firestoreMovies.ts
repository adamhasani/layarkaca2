import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export interface MovieRecord {
  id?: string;
  slug: string;
  title: string;
  type: string;
  year: number;
  rating: string;
  duration: string;
  genres: string[];
  posterUrl: string;
  bannerUrl: string;
  synopsis: string;
  match: number;
  subtitles?: Array<{ lang: string; label: string }>;
  reviews?: Array<{ id: string; user: string; avatar: string; rating: number; comment: string; date: string }>;
}

export const REAL_FIREBASE_MOVIES: MovieRecord[] = [
  {
    slug: 'dune-part-two-2024',
    title: 'Dune: Part Two (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.6',
    duration: '2h 46m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/71/a8/31/71a8312e-a20a-29b2-af70-5cab08908657/aca7621e-74e7-419a-96cd-5aaff99fb0cc_DUNE_PART2_V_DD_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/71/a8/31/71a8312e-a20a-29b2-af70-5cab08908657/aca7621e-74e7-419a-96cd-5aaff99fb0cc_DUNE_PART2_V_DD_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    synopsis: 'Paul Atreides bersatu kembali dengan Chani dan Fremen saat membalas dendam terhadap para konspirator yang menghancurkan keluarganya.',
    match: 98,
    subtitles: [{ lang: 'id', label: 'Indo' }],
    reviews: [
      { id: '1', user: 'Rian S.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rian', rating: 5, comment: 'Visual dan audio cinematic luar biasa!', date: '2 hari lalu' }
    ]
  },
  {
    slug: 'deadpool-and-wolverine-2024',
    title: 'Deadpool & Wolverine (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.1',
    duration: '2h 08m',
    genres: ['Action', 'Comedy', 'Sci-Fi'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/6b/c3/3b/6bc33b93-8db8-1e4e-09ca-cd3fb4d2325a/f3ecf124-ed28-44fb-9cb3-cb9aa1d33167_DP3_US_Main_Payoff_1-Smt_HD_sRGB_FIN1_2000x3000.lsr/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/6b/c3/3b/6bc33b93-8db8-1e4e-09ca-cd3fb4d2325a/f3ecf124-ed28-44fb-9cb3-cb9aa1d33167_DP3_US_Main_Payoff_1-Smt_HD_sRGB_FIN1_2000x3000.lsr/600x600bb.jpg',
    synopsis: 'Wolverine yang sedang memulihkan diri bertemu dengan Deadpool untuk mengalahkan musuh bersama dan menyelamatkan alam semesta mereka.',
    match: 97,
    subtitles: [{ lang: 'id', label: 'Indo' }],
    reviews: [
      { id: '2', user: 'Budi T.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi', rating: 5, comment: 'Kocak banget dan aksi berdarah khas Deadpool!', date: '1 hari lalu' }
    ]
  },
  {
    slug: 'agak-laen-2024',
    title: 'Agak Laen (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.0',
    duration: '1h 59m',
    genres: ['Comedy', 'Drama'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/3b/b1/d1/3bb1d13f-a3cd-fb67-27e1-ae76bdcfcfb8/mza_10336262486771120247.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/3b/b1/d1/3bb1d13f-a3cd-fb67-27e1-ae76bdcfcfb8/mza_10336262486771120247.jpg/600x600bb.jpg',
    synopsis: 'Empat sekawan penjaga rumah hantu di pasar malam berusaha menyembunyikan mayat pengunjung yang terkejut hingga tewas di wahana mereka.',
    match: 96,
    subtitles: [{ lang: 'id', label: 'Indo' }],
    reviews: [
      { id: '3', user: 'Siti M.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', rating: 5, comment: 'Film komedi Indonesia terbaik tahun ini, ngakak mampus!', date: '3 hari lalu' }
    ]
  },
  {
    slug: 'siksa-kubur-2024',
    title: 'Siksa Kubur (2024)',
    type: 'movie',
    year: 2024,
    rating: '7.9',
    duration: '1h 57m',
    genres: ['Horror', 'Drama'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/17/80/3f/17803feb-d12c-9679-b1d3-30589d9703f8/cover.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/17/80/3f/17803feb-d12c-9679-b1d3-30589d9703f8/cover.jpg/600x600bb.jpg',
    synopsis: 'Sita mencari orang paling berdosa untuk membuktikan bahwa agama dan siksa kubur tidak ada, namun konsekuensi mengerikan menunggunya.',
    match: 93,
    subtitles: [{ lang: 'id', label: 'Indo' }],
    reviews: [
      { id: '4', user: 'Andi P.', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi', rating: 4, comment: 'Karya Joko Anwar yang sangat mencekam dan penuh pesan filosofis.', date: '4 hari lalu' }
    ]
  },
  {
    slug: 'exhuma-2024',
    title: 'Exhuma (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.1',
    duration: '2h 14m',
    genres: ['Horror', 'Mystery', 'Thriller'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/20/de/cc20deb3-8bca-b983-6e2a-e882d544b261/vfu1595476035330633779.png/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/cc/20/de/cc20deb3-8bca-b983-6e2a-e882d544b261/vfu1595476035330633779.png/600x600bb.jpg',
    synopsis: 'Dua dukun muda, ahli feng shui, dan penggali kubur disewa keluarga kaya untuk memindahkan makam leluhur, namun membongkar rahasia kelam.',
    match: 95,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'godzilla-x-kong-the-new-empire-2024',
    title: 'Godzilla x Kong: The New Empire (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.3',
    duration: '1h 55m',
    genres: ['Action', 'Sci-Fi'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/80/75/f0/8075f0a6-cdd2-132e-50db-ddfa70dbcf08/aca16b7f-aeb4-4dd2-a05e-8848cddfb8c1_GxK_TNE_Main_Poster_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/80/75/f0/8075f0a6-cdd2-132e-50db-ddfa70dbcf08/aca16b7f-aeb4-4dd2-a05e-8848cddfb8c1_GxK_TNE_Main_Poster_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    synopsis: 'Dua titan legendaris, Godzilla dan Kong, harus bersatu melawan ancaman raksasa baru yang bersembunyi di dalam bumi.',
    match: 94,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'interstellar-2014',
    title: 'Interstellar (2014)',
    type: 'movie',
    year: 2014,
    rating: '8.7',
    duration: '2h 49m',
    genres: ['Sci-Fi', 'Drama'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video5/v4/94/0b/4e/940b4e0d-1393-270f-155a-4b0870932c02/mzl.agqihosj.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video5/v4/94/0b/4e/940b4e0d-1393-270f-155a-4b0870932c02/mzl.agqihosj.jpg/600x600bb.jpg',
    synopsis: 'Tim penjelajah melintasi lubang cacing di luar angkasa demi kelangsungan hidup manusia di bumi yang terancam punah.',
    match: 99,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'john-wick-chapter-4-2023',
    title: 'John Wick: Chapter 4 (2023)',
    type: 'movie',
    year: 2023,
    rating: '8.2',
    duration: '2h 49m',
    genres: ['Action', 'Thriller'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/aa/62/7b/aa627be9-eb3a-6ff4-ffc7-6dbfddfb3df0/JohnWick4_Payoff_2000x3000.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/aa/62/7b/aa627be9-eb3a-6ff4-ffc7-6dbfddfb3df0/JohnWick4_Payoff_2000x3000.jpg/600x600bb.jpg',
    synopsis: 'John Wick menemukan jalan untuk mengalahkan High Table demi kebebasannya, menghadapi musuh terkuat dari seluruh dunia.',
    match: 95,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'pengabdi-setan-2-communion-2022',
    title: 'Pengabdi Setan 2: Communion (2022)',
    type: 'movie',
    year: 2022,
    rating: '7.8',
    duration: '2h 00m',
    genres: ['Horror', 'Mystery'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/74/a9/2e/74a92eed-85eb-9bd9-d41c-fb2eb26d24f0/mza_17208753177893922646.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/74/a9/2e/74a92eed-85eb-9bd9-d41c-fb2eb26d24f0/mza_17208753177893922646.jpg/600x600bb.jpg',
    synopsis: 'Rini dan keluarganya pindah ke rumah susun dengan harapan merasa aman, namun teror gelap kuno menyusul mereka di malam badai.',
    match: 93,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'oppenheimer-2023',
    title: 'Oppenheimer (2023)',
    type: 'movie',
    year: 2023,
    rating: '8.9',
    duration: '3h 00m',
    genres: ['Drama', 'History'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/97/6f/67/976f671c-f236-7e10-bf7f-44be7ca48eb7/OPPENHEIMER_Payoff_Key_Art_2000x3000.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/97/6f/67/976f671c-f236-7e10-bf7f-44be7ca48eb7/OPPENHEIMER_Payoff_Key_Art_2000x3000.jpg/600x600bb.jpg',
    synopsis: 'Kisah fisikawan Amerika J. Robert Oppenheimer dan perannya dalam pengembangan bom atom dalam Proyek Manhattan.',
    match: 99,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'spider-man-across-the-spider-verse-2023',
    title: 'Spider-Man: Across the Spider-Verse (2023)',
    type: 'movie',
    year: 2023,
    rating: '8.8',
    duration: '2h 20m',
    genres: ['Animation', 'Action', 'Adventure'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/5e/88/19/5e881907-7440-e2ef-cc16-b83492576b54/SpiderManAcrossTheSpiderVerse_iTunes_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/5e/88/19/5e881907-7440-e2ef-cc16-b83492576b54/SpiderManAcrossTheSpiderVerse_iTunes_Poster.jpg/600x600bb.jpg',
    synopsis: 'Miles Morales terlempar ke multiverse dan bertemu tim Spider-People yang bertugas melindungi keberadaan alam semesta.',
    match: 98,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'inside-out-2-2024',
    title: 'Inside Out 2 (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.4',
    duration: '1h 36m',
    genres: ['Animation', 'Comedy', 'Family'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video115/v4/7c/29/d4/7c29d4b3-3436-c786-3970-7fac08e7bb48/AthensInsideOut2_iTunes_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video115/v4/7c/29/d4/7c29d4b3-3436-c786-3970-7fac08e7bb48/AthensInsideOut2_iTunes_Poster.jpg/600x600bb.jpg',
    synopsis: 'Riley memasuki masa remaja dan markas emosinya kedatangan emosi baru seperti Anxiety, Envy, Ennui, dan Embarrassment.',
    match: 97,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'avatar-the-way-of-water-2022',
    title: 'Avatar: The Way of Water (2022)',
    type: 'movie',
    year: 2022,
    rating: '8.5',
    duration: '3h 12m',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/33/c2/f3/33c2f30b-03c6-e9e7-f81d-e065715ef537/Avatar2_Payoff_Main_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/33/c2/f3/33c2f30b-03c6-e9e7-f81d-e065715ef537/Avatar2_Payoff_Main_Poster.jpg/600x600bb.jpg',
    synopsis: 'Jake Sully dan Neytiri harus meninggalkan rumah mereka dan menjelajahi wilayah lautan Pandora saat ancaman lama kembali.',
    match: 96,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'furiosa-a-mad-max-saga-2024',
    title: 'Furiosa: A Mad Max Saga (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.2',
    duration: '2h 28m',
    genres: ['Action', 'Sci-Fi'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/5e/44/a5/5e44a572-8d76-13a8-44fa-2e9095bb12a2/a4ebdf25-eecf-4e0d-b44c-c0818cbb2d40_FURIOSA_AMMS_V_DD_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/5e/44/a5/5e44a572-8d76-13a8-44fa-2e9095bb12a2/a4ebdf25-eecf-4e0d-b44c-c0818cbb2d40_FURIOSA_AMMS_V_DD_KA_TT_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    synopsis: 'Kisah asal-usul pahlawan wanita Furiosa yang diculik dari Tempat Hijau Banyak Ibu dan berjuang bertahan hidup di Gurun Suci.',
    match: 94,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'the-batman-2022',
    title: 'The Batman (2022)',
    type: 'movie',
    year: 2022,
    rating: '8.3',
    duration: '2h 56m',
    genres: ['Action', 'Crime', 'Drama'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/f6/7f/d3/f67fd3b8-8889-bc88-f58c-843aa581be4e/THE_BATMAN_Payoff_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video116/v4/f6/7f/d3/f67fd3b8-8889-bc88-f58c-843aa581be4e/THE_BATMAN_Payoff_Poster.jpg/600x600bb.jpg',
    synopsis: 'Di tahun keduanya melenyapkan kejahatan, Batman menyelidiki korupsi di Gotham City saat mengejar pembunuh berantai Riddler.',
    match: 95,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'kung-fu-panda-4-2024',
    title: 'Kung Fu Panda 4 (2024)',
    type: 'movie',
    year: 2024,
    rating: '7.9',
    duration: '1h 34m',
    genres: ['Animation', 'Action', 'Comedy'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video124/v4/fb/f7/e4/fbf7e446-0bdf-32ef-ec66-41f2ed295bcf/KFP4_Payoff_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video124/v4/fb/f7/e4/fbf7e446-0bdf-32ef-ec66-41f2ed295bcf/KFP4_Payoff_Poster.jpg/600x600bb.jpg',
    synopsis: 'Po dipanggil untuk menjadi Pemimpin Spiritual Lembah Kedamaian dan melatih Dragon Warrior baru sambil bertarung dengan Chameleon.',
    match: 91,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'a-quiet-place-day-one-2024',
    title: 'A Quiet Place: Day One (2024)',
    type: 'movie',
    year: 2024,
    rating: '7.9',
    duration: '1h 39m',
    genres: ['Horror', 'Sci-Fi', 'Drama'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/65/59/ef/6559ef17-fb52-6b35-dd0b-19965d1d64ee/f20485d4-4a46-4dc4-b78f-69e06cd2dfbc_AQP_D1_Payoff_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video211/v4/65/59/ef/6559ef17-fb52-6b35-dd0b-19965d1d64ee/f20485d4-4a46-4dc4-b78f-69e06cd2dfbc_AQP_D1_Payoff_2000x3000_300dpi_EN-srgb.lsr/600x600bb.jpg',
    synopsis: 'Kisah hari pertama ketika mahluk luar angkasa dengan pendengaran ultra-peka menyerang Kota New York.',
    match: 93,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'venom-let-there-be-carnage-2021',
    title: 'Venom: Let There Be Carnage (2021)',
    type: 'movie',
    year: 2021,
    rating: '8.0',
    duration: '1h 37m',
    genres: ['Action', 'Sci-Fi'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video125/v4/e0/f8/f3/e0f8f3c8-89c5-e51f-6143-693df9762194/Venom2_Payoff_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video125/v4/e0/f8/f3/e0f8f3c8-89c5-e51f-6143-693df9762194/Venom2_Payoff_Poster.jpg/600x600bb.jpg',
    synopsis: 'Eddie Brock mencoba membangun kembali karirnya dengan mewawancarai pembunuh berantai Cletus Kasady yang menjadi inang Carnage.',
    match: 92,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'kingdom-of-the-planet-of-the-apes-2024',
    title: 'Kingdom of the Planet of the Apes (2024)',
    type: 'movie',
    year: 2024,
    rating: '8.1',
    duration: '2h 25m',
    genres: ['Sci-Fi', 'Action'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/a4/09/b3/a409b307-2a4b-14d2-d81b-5fae6a690d2e/KingdomOfThePlanetOfTheApes_iTunes_Poster.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/a4/09/b3/a409b307-2a4b-14d2-d81b-5fae6a690d2e/KingdomOfThePlanetOfTheApes_iTunes_Poster.jpg/600x600bb.jpg',
    synopsis: 'Bertahun-tahun setelah kepemimpinan Caesar, kera muda memulai perjalanan yang membuatnya mempertanyakan semua yang dia ketahui.',
    match: 94,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  },
  {
    slug: 'extraction-2-2023',
    title: 'Extraction 2 (2023)',
    type: 'movie',
    year: 2023,
    rating: '8.0',
    duration: '2h 02m',
    genres: ['Action', 'Thriller'],
    posterUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video62/v4/7d/b0/80/7db08013-149f-b9bc-1b84-e91b61ec0d40/mzl.kymvhsnw.jpg/600x600bb.jpg',
    bannerUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Video62/v4/7d/b0/80/7db08013-149f-b9bc-1b84-e91b61ec0d40/mzl.kymvhsnw.jpg/600x600bb.jpg',
    synopsis: 'Tyler Rake kembali untuk menjalankan misi berbahaya lainnya: menyelamatkan keluarga gangster Georgia yang ditawan.',
    match: 93,
    subtitles: [{ lang: 'id', label: 'Indo' }]
  }
];

export async function seedMoviesToFirestore(): Promise<void> {
  try {
    const moviesRef = collection(db, "movies");
    for (const movie of REAL_FIREBASE_MOVIES) {
      await setDoc(doc(moviesRef, movie.slug), movie, { merge: true });
    }
    console.log("Firebase Firestore seeded successfully with", REAL_FIREBASE_MOVIES.length, "movies!");
  } catch (error) {
    console.error("Error seeding Firebase Firestore:", error);
  }
}

export async function fetchMoviesFromFirestore(): Promise<MovieRecord[]> {
  try {
    const moviesRef = collection(db, "movies");
    const snapshot = await getDocs(moviesRef);
    if (snapshot.empty) {
      await seedMoviesToFirestore();
      return REAL_FIREBASE_MOVIES;
    }
    const list: MovieRecord[] = [];
    snapshot.forEach(doc => {
      const data = doc.data() as MovieRecord;
      // Strictly filter out missing, invalid, or placeholder posters
      if (data && data.posterUrl && data.posterUrl.startsWith("http") && !data.posterUrl.includes("placeholder") && !data.posterUrl.includes("logo-layarkaca21")) {
        list.push({ ...data, id: doc.id });
      }
    });
    if (list.length === 0) {
      await seedMoviesToFirestore();
      return REAL_FIREBASE_MOVIES;
    }
    return list;
  } catch (error) {
    console.error("Error fetching movies from Firebase Firestore:", error);
    return REAL_FIREBASE_MOVIES;
  }
}
