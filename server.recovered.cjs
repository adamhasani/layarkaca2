var __defProp = Object.defineProperty;
var __name = (target, value) =>
  __defProp(target, "name", { value, configurable: true });
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./src/lib/firebase";
import express from "express";
import path from "path";
import { Buffer as Buffer2 } from "buffer";
import { Readable } from "stream";
import * as cheerio from "cheerio";
import { fetchMoviesFromFirestore } from "./src/lib/firestoreMovies";
import {
  fetchWikipediaFromFirestore,
  saveWikipediaToFirestore,
  getCurrentMonthKey,
} from "./src/lib/firestoreWikipedia";
import {
  fetchMonthlyCollectionFromFirestore,
  saveMonthlyCollectionToFirestore,
} from "./src/lib/firestoreMonthlyLists";
const app = express();
app.get("/api/ping", (req, res) => res.json({ ok: true, msg: "pong" }));
const detailCache = new Map();
const verifiedMoviePosters = [
  "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
  "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/b/bc/Interstellar_film_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/d/d0/John_Wick_-_Chapter_4_promotional_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/0/0b/Satan%27s_Slaves_2_-_Communion.jpg",
  "https://upload.wikimedia.org/wikipedia/en/9/91/Agak_Laen_film_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/b/be/Godzilla_x_kong_the_new_empire_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/4/4a/Oppenheimer_%28film%29.jpg",
  "https://upload.wikimedia.org/wikipedia/en/b/b4/Spider-Man-_Across_the_Spider-Verse_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/1/13/Exhuma_film_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/b/b8/Grave_Torture_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/5/54/Avatar_The_Way_of_Water_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/3/34/Furiosa_A_Mad_Max_Saga.jpg",
  "https://upload.wikimedia.org/wikipedia/en/f/ff/The_Batman_%28film%29_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/7/7f/Kung_Fu_Panda_4_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/e/e7/A_Quiet_Place_Day_One_%282024%29_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/a/a7/Venom_Let_There_Be_Carnage_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/c/cf/Kingdom_of_the_Planet_of_the_Apes_poster.jpg",
  "https://upload.wikimedia.org/wikipedia/en/0/02/Extraction_2_poster.jpg",
];
const posterCache = new Map();
const getTmdbApiKey = __name(() => {
  const envKey = process.env.TMDB_API_KEY;
  if (!envKey || envKey === "YOUR_TMDB_API_KEY" || envKey.trim() === "") {
    return "15d2ea6d0dc1d476efbca3eba2b9bbfb";
  }
  return envKey;
}, "getTmdbApiKey");
async function resolvePosterUrl(item) {
  if (!item) return "";
  const slug = (item?.slug || "").toLowerCase();
  const rawTitle = item?.title || "";
  const title = rawTitle.toLowerCase();
  const cacheKey = slug || title;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey);
  }
  if (
    item &&
    item.poster &&
    typeof item.poster === "string" &&
    item.poster.startsWith("http") &&
    !item.poster.includes("logo-layarkaca21") &&
    !item.poster.includes("unsplash.com") &&
    !item.poster.includes("placeholder") &&
    !item.poster.includes("via.placeholder")
  ) {
    posterCache.set(cacheKey, item.poster);
    return item.poster;
  }
  const cleanTitle = rawTitle
    .replace(/\(\d{4}\)/g, "")
    .replace(/-\s*Series/gi, "")
    .trim();
  const yearMatch = rawTitle.match(/\((\d{4})\)/);
  const year = item.year || (yearMatch ? yearMatch[1] : null);
  const isSeries = item.type === "series" || title.includes("series");
  if (isSeries && cleanTitle) {
    try {
      const res = await fetch(
        "https://api.tvmaze.com/search/shows?q=" +
          encodeURIComponent(cleanTitle),
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[0] && data[0].show && data[0].show.image) {
          const img = data[0].show.image.original || data[0].show.image.medium;
          if (img) {
            posterCache.set(cacheKey, img);
            return img;
          }
        }
      }
    } catch (e) {}
  }
  if (cleanTitle) {
    const wikiCandidates = [
      year ? cleanTitle.replace(/ /g, "_") + "_(" + year + "_film)" : null,
      cleanTitle.replace(/ /g, "_") + "_(film)",
      cleanTitle.replace(/ /g, "_") + "_film",
      cleanTitle.replace(/ /g, "_"),
    ].filter(Boolean);
    for (const cand of wikiCandidates) {
      try {
        const url =
          "https://en.wikipedia.org/api/rest_v1/page/summary/" +
          encodeURIComponent(cand);
        const res = await fetch(url, {
          headers: { "User-Agent": "CinestreamApp/1.0 (contact@example.com)" },
        });
        if (res.ok) {
          const data = await res.json();
          const img = data.originalimage
            ? data.originalimage.source
            : data.thumbnail
              ? data.thumbnail.source
              : null;
          if (
            img &&
            !img.includes(".svg") &&
            !img.toLowerCase().includes("disambig")
          ) {
            posterCache.set(cacheKey, img);
            return img;
          }
        }
      } catch (e) {}
    }
  }
  posterCache.set(cacheKey, "");
  return "";
}
__name(resolvePosterUrl, "resolvePosterUrl");
function getPosterUrl(item) {
  const slug = (item?.slug || "").toLowerCase();
  const title = (item?.title || "").toLowerCase();
  const cacheKey = slug || title;
  if (posterCache.has(cacheKey)) {
    return posterCache.get(cacheKey);
  }
  if (
    item &&
    item.poster &&
    typeof item.poster === "string" &&
    item.poster.startsWith("http") &&
    !item.poster.includes("logo-layarkaca21") &&
    !item.poster.includes("unsplash.com") &&
    !item.poster.includes("placeholder")
  ) {
    return item.poster;
  }
  return "";
}
__name(getPosterUrl, "getPosterUrl");
async function fetchMovieDetail(slug) {
  if (!slug) return null;
  if (detailCache.has(slug)) return detailCache.get(slug);
  try {
    const detailRes = await fetch(
      `https://www.keyrafara.com/search/idlix-detail?slug=${encodeURIComponent(slug)}`,
    );
    const detailData = await detailRes.json();
    if (detailData.status && detailData.result) {
      detailCache.set(slug, detailData.result);
      return detailData.result;
    }
  } catch (e) {
    console.error(`Detail fetch error for ${slug}:`, e);
  }
  return null;
}
__name(fetchMovieDetail, "fetchMovieDetail");
async function scrapeImdbKeywords() {
  const result = {
    latest: [
      "2026",
      "avengers doomsday",
      "supergirl 2026",
      "dune",
      "spider-man",
      "avatar",
      "deadpool",
      "godzilla",
    ],
    trending: ["avengers", "batman", "john wick", "fast", "oppenheimer"],
    action: [
      "transformers",
      "venom",
      "extraction",
      "top gun",
      "mission impossible",
    ],
    horror: ["conjuring", "insidious", "siksa", "pengabdi setan", "evil dead"],
    comedy: ["agak laen", "jumanji", "barbie", "deadpool", "hangover"],
  };
  try {
    const res = await fetch("https://en.wikipedia.org/wiki/2026_in_film", {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      const latest = [];
      $(".wikitable")
        .find("tbody tr td i")
        .each((i, el) => {
          const text = $(el).text().trim();
          if (
            text &&
            !latest.includes(text) &&
            text.length > 2 &&
            isNaN(Number(text))
          ) {
            latest.push(text);
          }
        });
      if (latest.length >= 5) {
        result.latest = latest.slice(0, 16);
      }
      const trending = [];
      $(".wikitable")
        .first()
        .find("tbody tr td i")
        .each((i, el) => {
          const text = $(el).text().trim();
          if (text && !trending.includes(text)) trending.push(text);
        });
      if (trending.length >= 5) {
        result.trending = trending.slice(0, 8);
      }
    }
  } catch (err) {
    console.warn("Scraping failed, using fallback.");
  }
  return result;
}
__name(scrapeImdbKeywords, "scrapeImdbKeywords");
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.get("/api/proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).send("URL is required");
    }
    const response = await fetch(targetUrl, {
      headers: {
        Referer: "https://cloud.hownetwork.xyz/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!response.ok) {
      return res.status(response.status).send(response.statusText);
    }
    response.headers.forEach((value, name) => {
      const lowerName = name.toLowerCase();
      if (
        ![
          "content-encoding",
          "transfer-encoding",
          "access-control-allow-origin",
          "content-length",
        ].includes(lowerName)
      ) {
        res.setHeader(name, value);
      }
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res);
    } else {
      res.end();
    }
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy error");
  }
});
const proxyImageCache = new Map();
app.get("/api/image-proxy", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl || !targetUrl.startsWith("http")) {
      return res.status(400).send("Valid URL required");
    }
    if (proxyImageCache.has(targetUrl)) {
      const cached = proxyImageCache.get(targetUrl);
      res.setHeader("Content-Type", cached.contentType);
      res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.send(cached.buffer);
    }
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "CineStreamApp/1.0 (https://cinestream.app; contact@cinestream.app) Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/123.0.0.0",
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      const darkSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="50%" stop-color="#1e1b4b"/>
              <stop offset="100%" stop-color="#020617"/>
            </linearGradient>
          </defs>
          <rect width="600" height="900" fill="url(#bg)"/>
          <circle cx="300" cy="400" r="120" fill="#e11d48" opacity="0.15"/>
          <path d="M 270 350 L 350 400 L 270 450 Z" fill="#e11d48" opacity="0.8"/>
          <text x="300" y="680" font-family="sans-serif" font-size="32" font-weight="bold" fill="#f8fafc" text-anchor="middle">CineStream</text>
          <text x="300" y="720" font-family="sans-serif" font-size="18" fill="#e2e8f0" text-anchor="middle">Cinema Collection</text>
        </svg>`;
      const buf = Buffer2.from(darkSvg);
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      return res.send(buf);
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer2.from(arrayBuffer);
    if (buffer.length > 0) {
      if (proxyImageCache.size > 200) {
        const firstKey = proxyImageCache.keys().next().value;
        if (firstKey) proxyImageCache.delete(firstKey);
      }
      proxyImageCache.set(targetUrl, { buffer, contentType });
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=86400");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(buffer);
  } catch (err) {
    console.error("Image proxy error:", err);
    res
      .status(500)
      .json({
        error: "Image proxy error",
        details: err?.message,
        stack: err?.stack,
      });
  }
});
app.get("/api/home", async (req, res) => {
  try {
    const today = new Date();
    const isFirstDay = today.getDate() === 1;
    const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
    let latest = [];
    let trending = [];
    let action = [];
    let horror = [];
    let comedy = [];
    const qTrim = "2026";
    const activeMonth = currentMonth;
    const keywords = ["action", "comedy", "horror", "drama"];
    const metaRef = doc(db, "system", "tmdb_sync_v5");
    const cacheRef = doc(db, "system", "home_cache_v5");
    let metaSnap = null;
    let cacheSnap = null;
    try {
      metaSnap = await getDoc(metaRef);
      cacheSnap = await getDoc(cacheRef);
    } catch (e) {
      console.warn("Firestore read error:", e);
    }
    const meta = metaSnap?.exists() ? metaSnap.data() : null;
    const cache = cacheSnap?.exists() ? cacheSnap.data() : null;
    let needsUpdate = false;
    if (!meta || meta.lastSyncMonth !== currentMonth) {
      if (isFirstDay || !meta || !cache) {
        needsUpdate = true;
      }
    }
    const apiKey = getTmdbApiKey();
    if (needsUpdate && apiKey) {
      console.log("Syncing TMDB movies for", currentMonth);
      const fetchTmdb = __name(async (endpoint) => {
        try {
          const sep = endpoint.includes("?") ? "&" : "?";
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3${endpoint}${sep}api_key=${apiKey}`,
            { headers: { accept: "application/json" } },
          );
          const data2 = await tmdbRes.json();
          return data2.results || [];
        } catch (e) {
          console.error("TMDB fetch error:", e);
          return [];
        }
      }, "fetchTmdb");
      const genreIdMap = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Sci-Fi",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western",
      };
      const mapTmdb = __name(
        (m, defaultGenre = "Movie") => ({
          id: m.id.toString(),
          slug: m.id.toString(),
          title: m.title,
          type: "movie",
          year: m.release_date
            ? parseInt(m.release_date.split("-")[0])
            : new Date().getFullYear(),
          rating: (m.vote_average || 8).toFixed(1),
          poster: m.poster_path
            ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
            : "https://poster.showcdnx.com/wp-content/uploads/2024/03/film-dune-part-two-2024-lk21-d21.jpg",
          bannerUrl: m.backdrop_path
            ? `https://image.tmdb.org/t/p/original${m.backdrop_path}`
            : null,
          synopsis:
            m.overview || `Saksikan film ${m.title} sub Indo gratis di IDLIX.`,
          genres: (() => {
            const list = Array.isArray(m.genre_ids)
              ? m.genre_ids.map((id) => genreIdMap[id]).filter(Boolean)
              : [];
            return list.length > 0 ? list : [defaultGenre];
          })(),
          quality: "HD",
          duration: "1h 50m",
          match: Math.floor(Math.random() * 10) + 90,
        }),
        "mapTmdb",
      );
      const [rawLatest, rawTrending, rawAction, rawHorror, rawComedy] =
        await Promise.all([
          fetchTmdb("/movie/now_playing?language=id-ID&page=1"),
          fetchTmdb("/trending/movie/week?language=id-ID"),
          fetchTmdb("/discover/movie?with_genres=28&language=id-ID"),
          fetchTmdb("/discover/movie?with_genres=27&language=id-ID"),
          fetchTmdb("/discover/movie?with_genres=35&language=id-ID"),
        ]);
      const newCache = {
        latest: rawLatest.slice(0, 16).map((m) => mapTmdb(m, "Movie")),
        trending: rawTrending.slice(0, 16).map((m) => mapTmdb(m, "Trending")),
        action: rawAction.slice(0, 16).map((m) => mapTmdb(m, "Action")),
        horror: rawHorror.slice(0, 16).map((m) => mapTmdb(m, "Horror")),
        comedy: rawComedy.slice(0, 16).map((m) => mapTmdb(m, "Comedy")),
      };
      const hasAnyTmdbData = Object.values(newCache).some(
        (arr) => arr.length > 0,
      );
      if (hasAnyTmdbData) {
        try {
          await setDoc(cacheRef, newCache);
          await setDoc(metaRef, { lastSyncMonth: currentMonth });
          console.log("TMDB cache saved successfully");
        } catch (e) {
          console.error("Failed to save TMDB cache:", e);
        }
        return res.json({
          status: true,
          source: "tmdb_fresh",
          sections: newCache,
        });
      } else {
        console.warn("TMDB returned no results, falling back to static pool.");
      }
    }
    if (
      cache &&
      Object.values(cache).some((arr) => Array.isArray(arr) && arr.length > 0)
    ) {
      return res.json({ status: true, source: "tmdb_cache", sections: cache });
    }
    try {
      const [movieRes, seriesRes] = await Promise.all([
        fetch(
          `https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(qTrim)}.json`,
        ),
        fetch(
          `https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(qTrim)}.json`,
        ),
      ]);
      const movieData = await movieRes.json().catch(() => ({ metas: [] }));
      const seriesData = await seriesRes.json().catch(() => ({ metas: [] }));
      let allMetas = [];
      if (movieData.metas) allMetas = allMetas.concat(movieData.metas);
      if (seriesData.metas) allMetas = allMetas.concat(seriesData.metas);
      if (allMetas.length > 0) {
        allMetas.sort((a, b) => {
          const yearA = parseInt(a.releaseInfo || a.year || "0");
          const yearB = parseInt(b.releaseInfo || b.year || "0");
          return yearB - yearA;
        });
        const results = allMetas
          .slice(0, 16)
          .map((r) => ({
            slug: r.id,
            title: r.name,
            synopsis: r.description || `Saksikan ${r.name} gratis.`,
            type: r.type === "series" ? "series" : "movie",
            poster: r.poster || "",
            year:
              parseInt(
                (r.releaseInfo || r.year || "0").toString().substring(0, 4),
              ) || new Date().getFullYear(),
            rating: r.imdbRating ? parseFloat(r.imdbRating) : 8,
            genres: r.genre || ["Movie"],
            quality: "HD",
          }));
        return res.json({ status: true, result: { results } });
      }
    } catch (e) {
      console.error("Cinemeta search failed", e);
    }
    const apiRes = await fetch(
      `https://www.keyrafara.com/search/idlix-search?query=${encodeURIComponent(qTrim)}`,
    );
    const data = await apiRes.json();
    let items = [];
    if (data.status && data.result && Array.isArray(data.result.results)) {
      items = data.result.results;
    }
    const filteredItems = items
      .filter(
        (item) =>
          item && item.title && !item.title.toLowerCase().includes("dialihkan"),
      )
      .slice(0, 16);
    const enrichedResults = [];
    for (const item of filteredItems) {
      const poster = await resolvePosterUrl(item);
      enrichedResults.push({
        ...item,
        poster,
        rating: "8.0",
        genres: item.genres && item.genres.length > 0 ? item.genres : ["Movie"],
        synopsis:
          item.synopsis ||
          `Saksikan film ${item.title} sub Indo gratis di IDLIX.`,
        quality: "HD",
        duration: "1h 50m",
      });
    }
    res.json({
      status: true,
      aiCurated: true,
      syncMonth: activeMonth,
      keywords,
      sections: { latest, trending, action, horror, comedy },
    });
  } catch (err) {
    console.error("Home route error:", err);
    res
      .status(500)
      .json({
        error: "Failed to fetch home content",
        details: err.message,
        stack: err.stack,
      });
  }
});
const wikipediaPosterCache = new Map();
let indonesianTrendingCache = null;
let indonesianTrendingCacheTime = 0;
const INDONESIAN_TRENDING_CACHE_DURATION = 1e3 * 60 * 60 * 6;
async function scrapePosterFromWiki(wikiUrl, cleanTitle) {
  if (!wikiUrl) return null;
  const cacheKey = wikiUrl.toLowerCase();
  if (wikipediaPosterCache.has(cacheKey)) {
    return wikipediaPosterCache.get(cacheKey);
  }
  try {
    const res = await fetch(wikiUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);
    let imgUrl = $(".infobox img, .infobox-image img, table.infobox img")
      .first()
      .attr("src");
    let found = imgUrl;
    if (
      imgUrl &&
      (imgUrl.includes("Information_icon") ||
        imgUrl.includes("Question_book") ||
        imgUrl.includes("ambox"))
    ) {
      found = null;
      $(".infobox img, .infobox-image img, table.infobox img, table img").each(
        (i, el) => {
          const src = $(el).attr("src");
          if (
            src &&
            !src.includes("Information_icon") &&
            !src.includes("Question_book") &&
            !src.includes("ambox") &&
            !src.includes("icon")
          ) {
            found = src;
            return false;
          }
        },
      );
    }
    if (found) {
      const fullUrl = found.startsWith("//") ? "https:" + found : found;
      wikipediaPosterCache.set(cacheKey, fullUrl);
      return fullUrl;
    }
  } catch (err) {
    console.error(`Error scraping wiki page for ${cleanTitle}:`, err);
  }
  return null;
}
__name(scrapePosterFromWiki, "scrapePosterFromWiki");
app.get("/api/indonesian-trending", async (req, res) => {
  try {
    const currentMonth = getCurrentMonthKey();
    const firestoreData = await fetchMonthlyCollectionFromFirestore(
      "indonesian_trending",
    );
    if (firestoreData.items && firestoreData.items.length >= 5) {
      return res.json({
        status: true,
        source: "firebase_firestore_monthly",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.items,
      });
    }
    console.log(
      `[Indonesian Sync] Refreshing Indonesian trending dataset for month ${currentMonth}...`,
    );
    const wikiRes = await fetch(
      "https://id.wikipedia.org/wiki/Daftar_film_Indonesia_terlaris",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );
    const html = await wikiRes.text();
    const $ = cheerio.load(html);
    const scrapedFilms = [];
    const table = $(".wikitable").first();
    if (table.length > 0) {
      table.find("tbody tr").each((i, row) => {
        if (i === 0) return;
        const tds = $(row).find("td");
        if (tds.length >= 4) {
          const rank = $(tds[0]).text().trim();
          const titleTag = $(tds[1]).find("a").first();
          const title = titleTag.text().trim() || $(tds[1]).text().trim();
          const href = titleTag.attr("href") || "";
          const viewers = $(tds[2])
            .text()
            .trim()
            .replace(/[\.\s]/g, "");
          const yearStr = $(tds[3]).text().trim();
          const director = $(tds[4]).text().trim();
          const cleanTitle = title.replace(/\(film.*?\)/gi, "").trim();
          if (cleanTitle) {
            let wikiUrl = "";
            if (href) {
              if (href.startsWith("http")) {
                wikiUrl = href;
              } else if (href.startsWith("//")) {
                wikiUrl = "https:" + href;
              } else {
                wikiUrl = "https://id.wikipedia.org" + href;
              }
            }
            scrapedFilms.push({
              rank,
              title: cleanTitle,
              year: parseInt(yearStr) || null,
              viewers: parseInt(viewers) || null,
              director,
              wikiUrl,
            });
          }
        }
      });
    }
    const verifiedIndoPosters = {
      "agak laen": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/3/30/Poster_film_Agak_Laen.jpg",
        synopsis:
          "Empat sekawan penjaga rumah hantu di pasar malam berusaha mencari cara baru untuk menakuti pengunjung demi menyelamatkan usaha mereka, namun situasi menjadi kacau ketika seorang pengunjung tewas di dalam wahana.",
        rating: "8.1",
        genres: ["Comedy", "Drama", "Horror"],
        duration: "1h 59m",
      },
      "agak laen: menyala pantiku!": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/3/30/Poster_film_Agak_Laen.jpg",
        synopsis:
          "Kelanjutan kisah komedi empat sekawan Agak Laen dengan petualangan yang jauh lebih lucu, seru, dan menyala!",
        rating: "8.3",
        genres: ["Comedy", "Drama"],
        duration: "2h 00m",
      },
      jumbo: {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/a/ae/Jumbo_film_poster.jpg",
        synopsis:
          "Kisah petualangan animasi anak Indonesia yang penuh dengan kehangatan, persahabatan, dan nilai-nilai keluarga.",
        rating: "8.0",
        genres: ["Animation", "Adventure", "Family"],
        duration: "1h 35m",
      },
      "kkn di desa penari": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/b/b2/KKN_di_Desa_Penari_poster.jpg",
        synopsis:
          "Enam mahasiswa yang melaksanakan KKN di sebuah desa terpencil diperingatkan untuk tidak melewati batas gapura terlarang sang penari mistis.",
        rating: "7.9",
        genres: ["Horror", "Mystery", "Thriller"],
        duration: "2h 10m",
      },
      "siksa kubur": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/0/00/Siksa_Kubur_poster.jpg",
        synopsis:
          "Setelah kedua orang tuanya menjadi korban bom bunuh diri, Sita tidak mempercayai agama dan mencari orang paling berdosa untuk membuktikan bahwa siksa kubur itu tidak ada.",
        rating: "8.2",
        genres: ["Horror", "Mystery", "Drama"],
        duration: "1h 57m",
      },
      "pengabdi setan 2: communion": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/9/9a/Pengabdi_Setan_2_Communion.jpg",
        synopsis:
          "Beberapa tahun setelah berhasil menyelamatkan diri dari kejadian mengerikan yang membuat mereka kehilangan ibu dan adik bungsu, Rini dan keluarganya tinggal di rumah susun, menyadari bahwa tinggal bersama banyak orang juga bisa sangat berbahaya.",
        rating: "8.0",
        genres: ["Horror", "Mystery", "Thriller"],
        duration: "1h 59m",
      },
      "dilan 1990": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/0/07/Poster_Film_Dilan_1990.jpg",
        synopsis:
          "Milea bertemu dengan Dilan di sebuah SMA di Bandung. Cara bicara Dilan yang jenaka dan romantis perlahan memikat hati Milea.",
        rating: "8.4",
        genres: ["Drama", "Romance"],
        duration: "1h 50m",
      },
      "ipar adalah maut": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/3/30/Ipar_Adalah_Maut_poster.jpg",
        synopsis:
          "Kehidupan rumah tangga Nisa dan Aris yang harmonis seketika berubah menjadi petaka setelah adik kandung Nisa, Rani, tinggal bersama mereka dan memulai perselingkuhan.",
        rating: "8.2",
        genres: ["Drama", "Romance"],
        duration: "2h 11m",
      },
      "sekawan limo": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/9/90/Sekawan_Limo_poster.jpg",
        synopsis:
          "Lima pemuda mendaki Gunung Madyopuro dan melanggar mitos setempat: rombongan harus berjumlah genap dan dilarang menoleh ke belakang.",
        rating: "8.0",
        genres: ["Comedy", "Horror", "Adventure"],
        duration: "1h 52m",
      },
      "vina: sebelum 7 hari": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/4/4c/Vina_Sebelum_7_Hari.jpeg",
        synopsis:
          "Arwah Vina yang meninggal secara tragis merasuki tubuh sahabatnya untuk mengungkap kebenaran kejam di balik kematiannya sebelum 7 hari.",
        rating: "7.5",
        genres: ["Horror", "Drama", "Mystery"],
        duration: "1h 40m",
      },
      "kang mak from pee mak": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/4/49/Kang_Mak_from_Pee_Mak.jpeg",
        synopsis:
          "Mak pulang dari medan perang untuk bersatu kembali dengan istrinya, Sari, namun kawan-kawannya menyadari bahwa Sari sebenarnya sudah meninggal dan menjadi hantu.",
        rating: "8.1",
        genres: ["Comedy", "Horror", "Romance"],
        duration: "2h 02m",
      },
      "laskar pelangi": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/8/85/Laskar_pelangi_poster.jpg",
        synopsis:
          "Kisah perjuangan sepuluh anak di Pulau Belitung yang bersekolah di sebuah sekolah dasar sederhana yang penuh dengan keterbatasan namun sarat mimpi.",
        rating: "8.5",
        genres: ["Drama", "Adventure", "Family"],
        duration: "2h 05m",
      },
      "gadis kretek": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/f/fa/Gadis_Kretek_poster.jpg",
        synopsis:
          "Pencarian seorang anak akan cinta masa lalu ayahnya membawa dirinya mengungkap rahasia industri kretek keluarga di era 1960-an.",
        rating: "8.4",
        genres: ["Drama", "Romance", "History"],
        duration: "5 Episode",
      },
      "badarawuhi di desa penari": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/a/a2/Badarawuhi_di_Desa_Penari_poster.jpg",
        synopsis:
          "Kisah asal-usul entitas mistis penjaga Desa Penari, Badarawuhi, dan bagaimana ia menjerat jiwa-jiwa baru ke dalam tariannya yang tiada akhir.",
        rating: "7.8",
        genres: ["Horror", "Mystery"],
        duration: "2h 02m",
      },
      "miracle in cell no. 7": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/b/bf/Miracle_in_Cell_No._7_Indonesian_poster.jpg",
        synopsis:
          "Seorang ayah berkebutuhan khusus dipenjarakan karena tuduhan pembunuhan berencana, dan rekan-rekan selnya membantu menyelundupkan putrinya ke dalam penjara.",
        rating: "8.3",
        genres: ["Drama", "Comedy", "Family"],
        duration: "2h 25m",
      },
      "sewu dino": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/3/39/Sewu_Dino_poster.jpg",
        synopsis:
          "Sri diterima bekerja untuk merawat seorang gadis sakit misterius yang terkena santet 1000 hari Sengarturih, dan harus bertahan hidup di gubuk terisolasi.",
        rating: "7.7",
        genres: ["Horror", "Mystery"],
        duration: "2h 01m",
      },
      "dilan 1991": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/2/29/Poster_Film_Dilan_1991.jpg",
        synopsis:
          "Kisah cinta Milea dan Dilan berlanjut di tahun 1991, di mana kepemimpinan Dilan dalam geng motor mulai menguji hubungan mereka.",
        rating: "8.1",
        genres: ["Drama", "Romance"],
        duration: "2h 01m",
      },
      "warkop dki reborn: jangkrik boss! part 1": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/b/b3/Poster_film_Warkop_DKI_Reborn.jpg",
        synopsis:
          "Dono, Kasino, dan Indro kembali sebagai petugas lembaga keamanan swasta CHIPS yang kocak dan selalu memicu kekacauan di kota.",
        rating: "7.8",
        genres: ["Comedy", "Adventure"],
        duration: "1h 36m",
      },
      "pabrik gula": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/0/00/Siksa_Kubur_poster.jpg",
        synopsis:
          "Teror misterius di sebuah pabrik gula tua terbengkalai yang mengungkap rahasia kelam sejarah masa lalu yang mengerikan.",
        rating: "7.6",
        genres: ["Horror", "Mystery"],
        duration: "1h 48m",
      },
      "habibie & ainun": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/8/81/Habibie_%26_Ainun_Poster.jpg",
        synopsis:
          "Kisah cinta sejati yang luar biasa antara BJ Habibie, ilmuwan dirgantara jenius sekaligus Presiden RI ke-3, dengan belahan jiwanya Ainun Habibie.",
        rating: "8.4",
        genres: ["Drama", "Romance", "Biography"],
        duration: "2h 00m",
      },
      "pengabdi setan": {
        poster:
          "https://upload.wikimedia.org/wikipedia/id/8/87/Poster_Pengabdi_Setan.jpg",
        synopsis:
          "Setelah sang ibu meninggal dunia karena penyakit misterius, keluarga Rini mulai diteror oleh kehadiran makhluk halus yang menyerupai mendiang ibunya.",
        rating: "8.1",
        genres: ["Horror", "Drama", "Mystery"],
        duration: "1h 47m",
      },
    };
    const finalMovies = await Promise.all(
      scrapedFilms.map(async (film, index) => {
        const lowerTitle = film.title.toLowerCase();
        let info = verifiedIndoPosters[lowerTitle];
        if (!info) {
          const matchKey = Object.keys(verifiedIndoPosters).find(
            (k) => lowerTitle.includes(k) || k.includes(lowerTitle),
          );
          if (matchKey) {
            info = verifiedIndoPosters[matchKey];
          }
        }
        const defaultPoster =
          "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop";
        const finalInfo = info || {
          poster: defaultPoster,
          synopsis: `Saksikan film Indonesia terpopuler "${film.title}" yang disutradarai oleh ${film.director || "sutradara berbakat"} dengan jumlah penonton mencapai ${film.viewers ? film.viewers.toLocaleString("id-ID") : "jutaan"} orang di bioskop.`,
          rating: "8.0",
          genres: ["Drama"],
          duration: "2h 00m",
        };
        let posterUrl = finalInfo.poster;
        let foundTmdbId = null;
        if (film.wikiUrl) {
          const scraped = await scrapePosterFromWiki(film.wikiUrl, film.title);
          if (scraped) {
            posterUrl = scraped;
          }
        }
        const apiKey = getTmdbApiKey();
        if ((posterUrl === defaultPoster || !posterUrl) && apiKey) {
          try {
            const searchRes = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&year=${film.year || ""}&language=id-ID`,
            );
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              const tmdbMovie = searchData.results[0];
              foundTmdbId = tmdbMovie.id;
              if (tmdbMovie.poster_path) {
                posterUrl = `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`;
              }
            } else {
              const searchResNoYear = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&language=id-ID`,
              );
              const searchDataNoYear = await searchResNoYear.json();
              if (
                searchDataNoYear.results &&
                searchDataNoYear.results.length > 0
              ) {
                const tmdbMovie = searchDataNoYear.results[0];
                foundTmdbId = tmdbMovie.id;
                if (tmdbMovie.poster_path) {
                  posterUrl = `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}`;
                }
              }
            }
          } catch (e) {
            console.error("TMDB search in scraper fallback failed:", e);
          }
        }
        if (!foundTmdbId && apiKey) {
          try {
            const searchRes = await fetch(
              `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&year=${film.year || ""}&language=id-ID`,
            );
            const searchData = await searchRes.json();
            if (searchData.results && searchData.results.length > 0) {
              foundTmdbId = searchData.results[0].id;
            } else {
              const searchResNoYear = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&language=id-ID`,
              );
              const searchDataNoYear = await searchResNoYear.json();
              if (
                searchDataNoYear.results &&
                searchDataNoYear.results.length > 0
              ) {
                foundTmdbId = searchDataNoYear.results[0].id;
              }
            }
          } catch (e) {}
        }
        const yearNum =
          film.year ||
          (lowerTitle.includes("2025")
            ? 2025
            : lowerTitle.includes("2024")
              ? 2024
              : 2023);
        return {
          id: "indo-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
          slug: "indo-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
          title: film.title,
          type: "movie",
          genres: finalInfo.genres,
          rating: finalInfo.rating,
          year: yearNum,
          duration: finalInfo.duration,
          poster: posterUrl,
          bannerUrl: posterUrl,
          match: 99 - index,
          synopsis: finalInfo.synopsis,
          viewersCount: film.viewers,
          rank: film.rank,
          director: film.director,
          tmdbId: foundTmdbId || void 0,
        };
      }),
    );
    await saveMonthlyCollectionToFirestore(
      "indonesian_trending",
      finalMovies,
      currentMonth,
    );
    res.json({
      status: true,
      source: "firebase_firestore_monthly_refreshed",
      syncMonth: currentMonth,
      result: finalMovies,
    });
  } catch (err) {
    console.error("Indonesian trending route error:", err);
    try {
      const fallback = await fetchMonthlyCollectionFromFirestore(
        "indonesian_trending",
      );
      if (fallback.items && fallback.items.length > 0) {
        return res.json({
          status: true,
          source: "firebase_firestore_fallback",
          syncMonth: fallback.lastSyncMonth,
          result: fallback.items,
        });
      }
    } catch (e) {}
    res
      .status(500)
      .json({
        error: "Failed to fetch Indonesian trending content",
        details: err.message,
      });
  }
});
const realMovieMetaDataMap = {
  "ne zha 2": { rating: "8.5", duration: "2h 24m" },
  "zootopia 2": { rating: "8.0", duration: "1h 48m" },
  "avatar: fire and ash": { rating: "8.2", duration: "3h 10m" },
  "the super mario galaxy movie": { rating: "7.8", duration: "1h 40m" },
  "the super mario bros. movie": { rating: "7.1", duration: "1h 32m" },
  "lilo & stitch": { rating: "7.5", duration: "1h 52m" },
  "a minecraft movie": { rating: "7.2", duration: "1h 45m" },
  "jurassic world rebirth": { rating: "7.4", duration: "2h 14m" },
  "demon slayer: infinity castle": { rating: "8.8", duration: "2h 30m" },
  f1: { rating: "8.1", duration: "2h 20m" },
  superman: { rating: "8.3", duration: "2h 18m" },
  avatar: { rating: "7.6", duration: "2h 42m" },
  "avengers: endgame": { rating: "8.3", duration: "3h 01m" },
  "avatar: the way of water": { rating: "7.7", duration: "3h 12m" },
  titanic: { rating: "7.9", duration: "3h 14m" },
  "star wars: the force awakens": { rating: "7.8", duration: "2h 18m" },
  "avengers: infinity war": { rating: "8.2", duration: "2h 29m" },
  "spider-man: no way home": { rating: "8.0", duration: "2h 28m" },
  "jurassic world": { rating: "6.7", duration: "2h 04m" },
  "the lion king": { rating: "7.1", duration: "1h 58m" },
  "the avengers": { rating: "7.7", duration: "2h 23m" },
  "furious 7": { rating: "7.2", duration: "2h 17m" },
  "top gun: maverick": { rating: "8.2", duration: "2h 10m" },
  "frozen ii": { rating: "7.2", duration: "1h 43m" },
  "frozen 2": { rating: "7.2", duration: "1h 43m" },
  frozen: { rating: "7.2", duration: "1h 42m" },
  barbie: { rating: "7.1", duration: "1h 54m" },
  "inside out 2": { rating: "7.6", duration: "1h 36m" },
  "incredibles 2": { rating: "7.5", duration: "1h 58m" },
  minions: { rating: "6.4", duration: "1h 31m" },
  "toy story 4": { rating: "7.5", duration: "1h 40m" },
  "toy story 3": { rating: "7.8", duration: "1h 43m" },
  "despicable me 3": { rating: "6.4", duration: "1h 30m" },
  "finding dory": { rating: "7.0", duration: "1h 37m" },
  zootopia: { rating: "7.7", duration: "1h 48m" },
  "despicable me 2": { rating: "6.9", duration: "1h 38m" },
  "minions: the rise of gru": { rating: "7.3", duration: "1h 27m" },
  "despicable me 4": { rating: "7.0", duration: "1h 34m" },
  "finding nemo": { rating: "7.8", duration: "1h 40m" },
  "shrek 2": { rating: "7.3", duration: "1h 33m" },
  "ice age: dawn of the dinosaurs": { rating: "6.7", duration: "1h 34m" },
  "ice age: continental drift": { rating: "6.5", duration: "1h 28m" },
  "the secret life of pets": { rating: "6.3", duration: "1h 27m" },
  "agak laen": { rating: "8.0", duration: "1h 59m" },
  "siksa kubur": { rating: "7.2", duration: "1h 57m" },
  "vina: sebelum 7 hari": { rating: "7.1", duration: "1h 40m" },
  "kang mak": { rating: "7.5", duration: "2h 02m" },
  "ipar adalah maut": { rating: "7.4", duration: "2h 11m" },
  "badarawuhi di desa penari": { rating: "7.0", duration: "2h 02m" },
  "sekawan limo": { rating: "7.6", duration: "1h 52m" },
};
function getRealMovieMetaData(rawTitle) {
  if (!rawTitle) return { rating: "7.5", duration: "1h 50m" };
  const clean = rawTitle
    .toLowerCase()
    .replace(/\(\d{4}\)/g, "")
    .replace(/ film$/g, "")
    .trim();
  if (realMovieMetaDataMap[clean]) {
    return realMovieMetaDataMap[clean];
  }
  for (const key of Object.keys(realMovieMetaDataMap)) {
    if (clean.includes(key) || key.includes(clean)) {
      return realMovieMetaDataMap[key];
    }
  }
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const posHash = Math.abs(hash);
  const ratings = [
    "7.8",
    "8.1",
    "7.4",
    "8.3",
    "7.6",
    "8.0",
    "7.9",
    "8.2",
    "7.5",
    "8.4",
  ];
  const rating = ratings[posHash % ratings.length];
  let baseMins = 110;
  if (
    clean.includes("mario") ||
    clean.includes("shrek") ||
    clean.includes("minion") ||
    clean.includes("animation") ||
    clean.includes("lion")
  )
    baseMins = 95;
  else if (
    clean.includes("avatar") ||
    clean.includes("avengers") ||
    clean.includes("batman")
  )
    baseMins = 150;
  const totalMins = baseMins + (posHash % 31) - 15;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return { rating, duration: `${h}h ${m}m` };
}
__name(getRealMovieMetaData, "getRealMovieMetaData");
app.get("/api/wikipedia-blockbusters", async (req, res) => {
  try {
    const currentMonth = getCurrentMonthKey();
    const firestoreData = await fetchWikipediaFromFirestore();
    if (
      firestoreData.films &&
      firestoreData.films.length >= 10 &&
      firestoreData.lastSyncMonth === currentMonth
    ) {
      return res.json({
        status: true,
        source: "firebase_firestore_monthly",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    console.log(
      `[Wikipedia Sync] Refreshing Wikipedia blockbusters dataset for month ${currentMonth}...`,
    );
    const wikiRes = await fetch(
      "https://en.wikipedia.org/wiki/List_of_highest-grossing_films",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );
    const html = await wikiRes.text();
    const $ = cheerio.load(html);
    const parsedFilms = [];
    const table = $(".wikitable").first();
    table.find("tr").each((i, row) => {
      const allCells = $(row).find("th, td");
      if (allCells.length >= 5) {
        const rankText = $(allCells[0]).text().trim();
        const rank = parseInt(rankText);
        if (!isNaN(rank)) {
          const titleLink = $(row).find('th[scope="row"] a, td a').first();
          const title = titleLink.text().trim() || $(allCells[2]).text().trim();
          const gross = $(allCells[allCells.length - 3])
            .text()
            .trim()
            .replace(/^[^\$]*\$/, "$");
          const yearText = $(allCells[allCells.length - 2])
            .text()
            .trim();
          const year = parseInt(yearText);
          const href = titleLink.attr("href") || "";
          if (
            title &&
            !parsedFilms.some(
              (f) => f.title.toLowerCase() === title.toLowerCase(),
            )
          ) {
            parsedFilms.push({ rank, title, gross, year, href });
          }
        }
      }
    });
    if (parsedFilms.length > 0) {
      const enrichedFilms = await Promise.all(
        parsedFilms.map(async (film, idx) => {
          let poster =
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500&auto=format&fit=crop";
          let synopsis = `Film blockbuster global terlaris (#${film.rank} di Wikipedia) dengan total pendapatan dunia ${film.gross}.`;
          const slug = film.href ? film.href.split("/wiki/")[1] : null;
          if (slug) {
            try {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
                { headers: { "User-Agent": "Mozilla/5.0" } },
              );
              if (summaryRes.ok) {
                const sData = await summaryRes.json();
                if (sData.thumbnail && sData.thumbnail.source) {
                  poster = sData.thumbnail.source;
                }
                if (sData.extract) {
                  synopsis = sData.extract;
                }
              }
            } catch (e) {
              console.error(
                `Wikipedia summary fetch error for ${film.title}:`,
                e,
              );
            }
          }
          const lowerTitle = film.title.toLowerCase();
          let genres = ["Action", "Sci-Fi", "Blockbuster"];
          if (lowerTitle.includes("avatar") || lowerTitle.includes("star wars"))
            genres = ["Sci-Fi", "Adventure", "Action"];
          else if (
            lowerTitle.includes("avengers") ||
            lowerTitle.includes("spider-man") ||
            lowerTitle.includes("batman")
          )
            genres = ["Action", "Sci-Fi", "Superhero"];
          else if (
            lowerTitle.includes("lion king") ||
            lowerTitle.includes("frozen") ||
            lowerTitle.includes("zootopia") ||
            lowerTitle.includes("inside out") ||
            lowerTitle.includes("despicable") ||
            lowerTitle.includes("shrek") ||
            lowerTitle.includes("ne zha")
          )
            genres = ["Animation", "Family", "Adventure"];
          else if (
            lowerTitle.includes("titanic") ||
            lowerTitle.includes("barbie")
          )
            genres = ["Drama", "Romance"];
          else if (
            lowerTitle.includes("jurassic") ||
            lowerTitle.includes("furious") ||
            lowerTitle.includes("top gun")
          )
            genres = ["Action", "Thriller", "Adventure"];
          const realMeta = getRealMovieMetaData(film.title);
          return {
            id: "wiki-blockbuster-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            slug: "wiki-blockbuster-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            title: film.title,
            type: "movie",
            genres,
            rating: realMeta.rating,
            year: film.year || 2020,
            duration: realMeta.duration,
            poster,
            bannerUrl: poster,
            match: 99 - idx,
            synopsis,
            boxOffice: film.gross,
            rank: film.rank,
            syncMonth: currentMonth,
          };
        }),
      );
      await saveWikipediaToFirestore(enrichedFilms, currentMonth);
      return res.json({
        status: true,
        source: "firebase_firestore_monthly_refreshed",
        syncMonth: currentMonth,
        result: enrichedFilms,
      });
    }
    if (firestoreData.films && firestoreData.films.length > 0) {
      return res.json({
        status: true,
        source: "firebase_firestore_fallback",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    res.status(500).json({ error: "Failed to parse Wikipedia blockbusters" });
  } catch (err) {
    console.error("Wikipedia blockbusters route error:", err);
    try {
      const fallback = await fetchWikipediaFromFirestore();
      if (fallback.films && fallback.films.length > 0) {
        return res.json({
          status: true,
          source: "firebase_firestore_error_fallback",
          result: fallback.films,
        });
      }
    } catch (e) {}
    res
      .status(500)
      .json({
        error: "Failed to fetch Wikipedia blockbusters",
        details: err.message,
      });
  }
});
app.get("/api/wikipedia-trending-popular", async (req, res) => {
  try {
    const currentMonth = getCurrentMonthKey();
    const firestoreData = await fetchWikipediaFromFirestore(
      "wikipedia_trending_popular",
      "sync_info_trending",
    );
    if (
      firestoreData.films &&
      firestoreData.films.length >= 10 &&
      firestoreData.lastSyncMonth === currentMonth
    ) {
      return res.json({
        status: true,
        source: "firebase_firestore_monthly",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    console.log(
      `[Wikipedia Sync] Refreshing Wikipedia Trending & Popular dataset for month ${currentMonth}...`,
    );
    const targetUrls = [
      "https://en.wikipedia.org/wiki/2026_in_film",
      "https://en.wikipedia.org/wiki/2025_in_film",
    ];
    const rawFilms = [];
    for (const url of targetUrls) {
      try {
        const wikiRes = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (!wikiRes.ok) continue;
        const html = await wikiRes.text();
        const $ = cheerio.load(html);
        const table = $(".wikitable").first();
        table.find("tr").each((i, row) => {
          const allCells = $(row).find("th, td");
          if (allCells.length >= 3) {
            const cell0Text = $(allCells[0]).text().trim();
            const rank = parseInt(cell0Text);
            if (!isNaN(rank) && rank > 0 && rank <= 20) {
              const titleLink = $(row).find('th[scope="row"] a, td a').first();
              const title =
                titleLink.text().trim() || $(allCells[1]).text().trim();
              const gross =
                $(allCells[allCells.length - 1])
                  .text()
                  .trim() ||
                $(allCells[allCells.length - 2])
                  .text()
                  .trim();
              const href = titleLink.attr("href") || "";
              if (
                title &&
                !rawFilms.some(
                  (f) => f.title.toLowerCase() === title.toLowerCase(),
                )
              ) {
                rawFilms.push({ rank, title, gross, href, sourceUrl: url });
              }
            }
          }
        });
      } catch (e) {
        console.error(`Error scraping ${url}:`, e);
      }
    }
    if (rawFilms.length > 0) {
      const apiKey = getTmdbApiKey();
      const enrichedFilms = await Promise.all(
        rawFilms.map(async (film, idx) => {
          let poster =
            "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=500&auto=format&fit=crop";
          let synopsis = `Film paling trending & populer di Wikipedia bulan ini (#${idx + 1}) dengan total pendapatan box office ${film.gross.split("[")[0]}.`;
          let tmdbId = void 0;
          const slug = film.href ? film.href.split("/wiki/")[1] : null;
          if (slug) {
            try {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
                { headers: { "User-Agent": "Mozilla/5.0" } },
              );
              if (summaryRes.ok) {
                const sData = await summaryRes.json();
                if (sData.thumbnail && sData.thumbnail.source) {
                  poster = sData.thumbnail.source;
                }
                if (sData.extract) {
                  synopsis = sData.extract;
                }
              }
            } catch (e) {}
          }
          if (apiKey) {
            try {
              const tmdbSearch = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&language=id-ID`,
              );
              if (tmdbSearch.ok) {
                const searchData = await tmdbSearch.json();
                if (searchData.results && searchData.results.length > 0) {
                  const match = searchData.results[0];
                  tmdbId = match.id;
                  if (match.poster_path) {
                    poster = `https://image.tmdb.org/t/p/w500${match.poster_path}`;
                  }
                  if (match.overview) {
                    synopsis = match.overview;
                  }
                }
              }
            } catch (e) {}
          }
          const lowerTitle = film.title.toLowerCase();
          let genres = ["Action", "Adventure", "Trending"];
          if (
            lowerTitle.includes("mario") ||
            lowerTitle.includes("minions") ||
            lowerTitle.includes("toy story") ||
            lowerTitle.includes("zootopia") ||
            lowerTitle.includes("ne zha")
          ) {
            genres = ["Animation", "Family", "Comedy"];
          } else if (
            lowerTitle.includes("superman") ||
            lowerTitle.includes("avatar") ||
            lowerTitle.includes("lilo")
          ) {
            genres = ["Sci-Fi", "Action", "Adventure"];
          } else if (lowerTitle.includes("demon slayer")) {
            genres = ["Animation", "Action", "Anime"];
          }
          const realMeta = getRealMovieMetaData(film.title);
          return {
            id: "wiki-trending-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            slug: "wiki-trending-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            title: film.title,
            type: "movie",
            genres,
            rating: realMeta.rating,
            year: film.sourceUrl.includes("2026") ? 2026 : 2025,
            duration: realMeta.duration,
            poster,
            bannerUrl: poster,
            match: 99 - idx,
            synopsis,
            boxOffice: film.gross.split("[")[0],
            rank: idx + 1,
            tmdbId,
            syncMonth: currentMonth,
          };
        }),
      );
      await saveWikipediaToFirestore(
        enrichedFilms,
        currentMonth,
        "wikipedia_trending_popular",
        "sync_info_trending",
      );
      return res.json({
        status: true,
        source: "firebase_firestore_monthly_refreshed",
        syncMonth: currentMonth,
        result: enrichedFilms,
      });
    }
    if (firestoreData.films && firestoreData.films.length > 0) {
      return res.json({
        status: true,
        source: "firebase_firestore_fallback",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch Wikipedia trending popular" });
  } catch (err) {
    console.error("Wikipedia trending route error:", err);
    try {
      const fallback = await fetchWikipediaFromFirestore(
        "wikipedia_trending_popular",
        "sync_info_trending",
      );
      if (fallback.films && fallback.films.length > 0) {
        return res.json({
          status: true,
          source: "firebase_firestore_error_fallback",
          result: fallback.films,
        });
      }
    } catch (e) {}
    res
      .status(500)
      .json({
        error: "Failed to fetch Wikipedia trending",
        details: err.message,
      });
  }
});
app.get("/api/wikipedia-animated", async (req, res) => {
  try {
    const currentMonth = getCurrentMonthKey();
    const firestoreData = await fetchWikipediaFromFirestore(
      "wikipedia_animated_movies",
      "sync_info_animated",
    );
    if (
      firestoreData.films &&
      firestoreData.films.length >= 10 &&
      firestoreData.lastSyncMonth === currentMonth
    ) {
      return res.json({
        status: true,
        source: "firebase_firestore_monthly",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    console.log(
      `[Wikipedia Sync] Refreshing Wikipedia animated films dataset for month ${currentMonth}...`,
    );
    const wikiRes = await fetch(
      "https://en.wikipedia.org/wiki/List_of_highest-grossing_animated_films",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      },
    );
    const html = await wikiRes.text();
    const $ = cheerio.load(html);
    const parsedFilms = [];
    const table = $(".wikitable").first();
    table.find("tr").each((i, row) => {
      const allCells = $(row).find("th, td");
      if (allCells.length >= 4) {
        const cell0Text = $(allCells[0]).text().trim();
        const cell1Text = $(allCells[1]).text().trim();
        let rank = parseInt(cell0Text);
        if (isNaN(rank)) rank = parseInt(cell1Text);
        if (!isNaN(rank) && rank > 0 && rank <= 100) {
          const titleLink = $(row).find('th[scope="row"] a, td a').first();
          const title =
            titleLink.text().trim() ||
            $(allCells[1]).text().trim() ||
            $(allCells[2]).text().trim();
          let gross = "";
          let year = 2020;
          allCells.each((_, c) => {
            const txt = $(c).text().trim();
            if (txt.includes("$") && !gross) {
              gross = txt
                .replace(/^[^\$]*\$/, "$")
                .split("[")[0]
                .trim();
            }
            const yMatch = txt.match(/\b(19\d\d|20\d\d)\b/);
            if (yMatch) {
              year = parseInt(yMatch[1]);
            }
          });
          if (!gross) gross = "$500,000,000";
          const href = titleLink.attr("href") || "";
          if (
            title &&
            !parsedFilms.some(
              (f) => f.title.toLowerCase() === title.toLowerCase(),
            )
          ) {
            parsedFilms.push({ rank, title, gross, year, href });
          }
        }
      }
    });
    if (parsedFilms.length > 0) {
      const apiKey = getTmdbApiKey();
      const enrichedFilms = await Promise.all(
        parsedFilms.map(async (film, idx) => {
          let poster =
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500&auto=format&fit=crop";
          let synopsis = `Film animasi terlaris di dunia (#${film.rank} di Wikipedia) dengan total pendapatan ${film.gross}.`;
          let tmdbId = void 0;
          const slug = film.href ? film.href.split("/wiki/")[1] : null;
          if (slug) {
            try {
              const summaryRes = await fetch(
                `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
                { headers: { "User-Agent": "Mozilla/5.0" } },
              );
              if (summaryRes.ok) {
                const sData = await summaryRes.json();
                if (sData.thumbnail && sData.thumbnail.source) {
                  poster = sData.thumbnail.source;
                }
                if (sData.extract) {
                  synopsis = sData.extract;
                }
              }
            } catch (e) {
              console.error(
                `Wikipedia summary fetch error for animated film ${film.title}:`,
                e,
              );
            }
          }
          if (apiKey) {
            try {
              const tmdbSearch = await fetch(
                `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(film.title)}&language=id-ID`,
              );
              if (tmdbSearch.ok) {
                const searchData = await tmdbSearch.json();
                if (searchData.results && searchData.results.length > 0) {
                  const match = searchData.results[0];
                  tmdbId = match.id;
                  if (match.poster_path) {
                    poster = `https://image.tmdb.org/t/p/w500${match.poster_path}`;
                  }
                  if (match.overview) {
                    synopsis = match.overview;
                  }
                }
              }
            } catch (e) {}
          }
          const lowerTitle = film.title.toLowerCase();
          let genres = ["Animation", "Family", "Adventure"];
          if (
            lowerTitle.includes("shrek") ||
            lowerTitle.includes("minions") ||
            lowerTitle.includes("despicable") ||
            lowerTitle.includes("mario")
          )
            genres = ["Animation", "Comedy", "Family"];
          else if (
            lowerTitle.includes("spider-man") ||
            lowerTitle.includes("incredibles")
          )
            genres = ["Animation", "Action", "Superhero"];
          else if (
            lowerTitle.includes("frozen") ||
            lowerTitle.includes("lion king") ||
            lowerTitle.includes("moana")
          )
            genres = ["Animation", "Musical", "Adventure"];
          const realMeta = getRealMovieMetaData(film.title);
          return {
            id: "wiki-animated-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            slug: "wiki-animated-" + lowerTitle.replace(/[^a-z0-9]+/g, "-"),
            title: film.title,
            type: "movie",
            genres,
            rating: realMeta.rating,
            year: film.year || 2020,
            duration: realMeta.duration,
            poster,
            bannerUrl: poster,
            match: 99 - idx,
            synopsis,
            boxOffice: film.gross,
            rank: film.rank,
            tmdbId,
            syncMonth: currentMonth,
          };
        }),
      );
      await saveWikipediaToFirestore(
        enrichedFilms,
        currentMonth,
        "wikipedia_animated_movies",
        "sync_info_animated",
      );
      return res.json({
        status: true,
        source: "firebase_firestore_monthly_refreshed",
        syncMonth: currentMonth,
        result: enrichedFilms,
      });
    }
    if (firestoreData.films && firestoreData.films.length > 0) {
      return res.json({
        status: true,
        source: "firebase_firestore_fallback",
        syncMonth: firestoreData.lastSyncMonth,
        result: firestoreData.films,
      });
    }
    res.status(500).json({ error: "Failed to parse Wikipedia animated films" });
  } catch (err) {
    console.error("Wikipedia animated route error:", err);
    try {
      const fallback = await fetchWikipediaFromFirestore(
        "wikipedia_animated_movies",
        "sync_info_animated",
      );
      if (fallback.films && fallback.films.length > 0) {
        return res.json({
          status: true,
          source: "firebase_firestore_error_fallback",
          result: fallback.films,
        });
      }
    } catch (e) {}
    res
      .status(500)
      .json({
        error: "Failed to fetch Wikipedia animated films",
        details: err.message,
      });
  }
});
app.get("/api/netflix-trending", async (req, res) => {
  try {
    const currentMonth = getCurrentMonthKey();
    const firestoreData =
      await fetchMonthlyCollectionFromFirestore("netflix_trending");
    if (firestoreData.items && firestoreData.items.length >= 5) {
      return res.json({
        status: true,
        source: "firebase_firestore_monthly",
        syncMonth: firestoreData.lastSyncMonth,
        result: { results: firestoreData.items },
      });
    }
    console.log(
      `[Netflix Sync] Refreshing Netflix trending dataset for month ${currentMonth}...`,
    );
    const apiRes = await fetch(
      "https://www.keyrafara.com/search/netflix-trending",
    );
    const data = await apiRes.json();
    if (data.status && data.result && Array.isArray(data.result.trending)) {
      const mappedResults = await Promise.all(
        data.result.trending.map(async (item) => {
          return {
            id: "netflix-" + item.videoId,
            slug: "netflix-" + item.videoId,
            title: item.title,
            type: item.type === "Show" ? "series" : "movie",
            poster: item.poster,
            posterUrl: item.poster,
            rating: "9.5",
            genres: item.genre ? item.genre.split(", ") : [],
            synopsis: item.shortSynopsis,
            year: item.latestYear,
            quality: "HD",
            syncMonth: currentMonth,
          };
        }),
      );
      await saveMonthlyCollectionToFirestore(
        "netflix_trending",
        mappedResults,
        currentMonth,
      );
      res.json({
        status: true,
        source: "firebase_firestore_monthly_refreshed",
        syncMonth: currentMonth,
        result: { results: mappedResults },
      });
    } else if (firestoreData.items && firestoreData.items.length > 0) {
      return res.json({
        status: true,
        source: "firebase_firestore_fallback",
        syncMonth: firestoreData.lastSyncMonth,
        result: { results: firestoreData.items },
      });
    } else {
      res.json(data);
    }
  } catch (err) {
    console.error("Netflix trending error:", err);
    try {
      const fallback =
        await fetchMonthlyCollectionFromFirestore("netflix_trending");
      if (fallback.items && fallback.items.length > 0) {
        return res.json({
          status: true,
          source: "firebase_firestore_fallback",
          syncMonth: fallback.lastSyncMonth,
          result: { results: fallback.items },
        });
      }
    } catch (e) {}
    res
      .status(500)
      .json({
        error: "Failed to fetch Netflix trending",
        details: err.message,
      });
  }
});
app.get("/api/trending", async (req, res) => {
  try {
    const queries = ["2025", "2024", "avengers", "spider-man"];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    const query = req.query.query || "2025";
    const apiRes = await fetch(
      `https://www.keyrafara.com/search/idlix-search?query=${encodeURIComponent(query)}`,
    );
    const data = await apiRes.json();
    if (data.status && data.result && Array.isArray(data.result.results)) {
      const enrichedResults = await Promise.all(
        data.result.results
          .filter(
            (item) =>
              item &&
              item.title &&
              !item.title.toLowerCase().includes("dialihkan"),
          )
          .map(async (item) => {
            const poster = await resolvePosterUrl(item);
            try {
              if (item.slug) {
                const detailRes = await fetch(
                  `https://www.keyrafara.com/search/idlix-detail?slug=${encodeURIComponent(item.slug)}`,
                );
                const detailData = await detailRes.json();
                if (detailData.status && detailData.result) {
                  return {
                    ...item,
                    poster,
                    rating: detailData.result.rating || "8.0",
                    genres: detailData.result.genres || [],
                    synopsis:
                      detailData.result.overview || detailData.result.synopsis,
                    quality: detailData.result.quality,
                    duration: detailData.result.runtime
                      ? `${detailData.result.runtime}m`
                      : detailData.result.duration,
                  };
                }
              }
            } catch (err) {
              console.error("Error fetching item detail:", err);
            }
            return { ...item, poster };
          }),
      );
      data.result.results = enrichedResults;
    }
    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
});
app.get("/api/ai/search", async (req, res) => {
  try {
    const userPrompt = req.query.prompt || "film komedi dan aksi terbaik";
    let searchTerms = [userPrompt];
    try {
      const imdbRes = await fetch(
        `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(userPrompt)}.json`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );
      if (imdbRes.ok) {
        const data = await imdbRes.json();
        if (data && data.d && Array.isArray(data.d)) {
          const titles = data.d.map((i) => i.l).filter(Boolean);
          if (titles.length > 0) {
            searchTerms = titles.slice(0, 3);
          }
        }
      }
    } catch (err) {
      console.warn("IMDb search scraping failed, using direct prompt");
    }
    const allResults = [];
    const seenSlugs = new Set();
    for (const term of searchTerms) {
      try {
        const apiRes = await fetch(
          `https://www.keyrafara.com/search/idlix-search?query=${encodeURIComponent(term)}`,
        );
        const data = await apiRes.json();
        if (data.status && data.result && Array.isArray(data.result.results)) {
          for (const item of data.result.results) {
            if (item.slug && !seenSlugs.has(item.slug)) {
              seenSlugs.add(item.slug);
              allResults.push(item);
            }
          }
        }
        await new Promise((r) => setTimeout(r, 400));
      } catch (e) {}
    }
    const filteredItems = allResults
      .filter(
        (item) =>
          item && item.title && !item.title.toLowerCase().includes("dialihkan"),
      )
      .slice(0, 12);
    const enrichedResults = [];
    for (const item of filteredItems) {
      let enriched = { ...item };
      try {
        enriched.poster = await resolvePosterUrl(item);
        if (item.slug) {
          const detailRes = await fetch(
            `https://www.keyrafara.com/search/idlix-detail?slug=${encodeURIComponent(item.slug)}`,
          );
          const detailData = await detailRes.json();
          if (detailData.status && detailData.result) {
            enriched = {
              ...enriched,
              rating: detailData.result.rating || "8.0",
              genres: detailData.result.genres || [],
              synopsis:
                detailData.result.overview || detailData.result.synopsis,
              quality: detailData.result.quality,
              duration: detailData.result.runtime
                ? `${detailData.result.runtime}m`
                : detailData.result.duration,
            };
          }
        }
      } catch (e) {}
      enrichedResults.push(enriched);
      await new Promise((r) => setTimeout(r, 300));
    }
    res.json({
      status: true,
      aiQueries: searchTerms,
      result: { results: enrichedResults },
    });
  } catch (err) {
    console.error("AI search error:", err);
    res.status(500).json({ error: "AI Search failed" });
  }
});
app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ error: "Query is required" });
    }
    const qTrim = query.trim();
    try {
      const tmdbKey = getTmdbApiKey();
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${tmdbKey}&query=${encodeURIComponent(qTrim)}&language=id-ID&page=1`,
      );
      const data2 = await tmdbRes.json();
      if (data2.results && data2.results.length > 0) {
        const results = data2.results
          .filter((r) => r.media_type === "movie" || r.media_type === "tv")
          .map((r) => ({
            slug: r.id.toString(),
            title: r.title || r.name,
            synopsis: r.overview || `Saksikan ${r.title || r.name} gratis.`,
            type: r.media_type === "tv" ? "series" : "movie",
            poster: r.poster_path
              ? `https://image.tmdb.org/t/p/w500${r.poster_path}`
              : "",
            year:
              parseInt(
                (r.release_date || r.first_air_date || "0").substring(0, 4),
              ) || new Date().getFullYear(),
            rating: r.vote_average ? parseFloat(r.vote_average.toFixed(1)) : 8,
            genres: ["Movie"],
            quality: "HD",
            duration: "120m",
          }));
        return res.json({ status: true, result: { results } });
      }
    } catch (e) {
      console.error("TMDB search failed, falling back to Cinemeta", e);
    }
    try {
      const [movieRes, seriesRes] = await Promise.all([
        fetch(
          `https://v3-cinemeta.strem.io/catalog/movie/top/search=${encodeURIComponent(qTrim)}.json`,
        ),
        fetch(
          `https://v3-cinemeta.strem.io/catalog/series/top/search=${encodeURIComponent(qTrim)}.json`,
        ),
      ]);
      const movieData = await movieRes.json().catch(() => ({ metas: [] }));
      const seriesData = await seriesRes.json().catch(() => ({ metas: [] }));
      let allMetas = [];
      if (movieData.metas) allMetas = allMetas.concat(movieData.metas);
      if (seriesData.metas) allMetas = allMetas.concat(seriesData.metas);
      if (allMetas.length > 0) {
        allMetas.sort(
          (a, b) =>
            parseInt(b.releaseInfo || b.year || "0") -
            parseInt(a.releaseInfo || a.year || "0"),
        );
        const results = allMetas
          .slice(0, 16)
          .map((r) => ({
            slug: r.id,
            title: r.name,
            synopsis: r.description || `Saksikan ${r.name} gratis.`,
            type: r.type === "series" ? "series" : "movie",
            poster: r.poster || "",
            year:
              parseInt(
                (r.releaseInfo || r.year || "0").toString().substring(0, 4),
              ) || new Date().getFullYear(),
            rating: r.imdbRating ? parseFloat(r.imdbRating) : 8,
            genres: r.genre || ["Movie"],
            quality: "HD",
          }));
        return res.json({ status: true, result: { results } });
      }
    } catch (e) {
      console.error("Cinemeta search failed", e);
    }
    const apiRes = await fetch(
      `https://www.keyrafara.com/search/idlix-search?query=${encodeURIComponent(qTrim)}`,
    );
    const data = await apiRes.json();
    let items = [];
    if (data.status && data.result && Array.isArray(data.result.results)) {
      items = data.result.results;
    }
    const filteredItems = items
      .filter(
        (item) =>
          item && item.title && !item.title.toLowerCase().includes("dialihkan"),
      )
      .slice(0, 16);
    const enrichedResults = [];
    for (const item of filteredItems) {
      let detailData = null;
      try {
        if (item.slug) {
          detailData = await fetchMovieDetail(item.slug);
          await new Promise((r) => setTimeout(r, 200));
        }
      } catch (e) {}
      const poster = await resolvePosterUrl(detailData || item);
      enrichedResults.push({
        ...item,
        poster,
        rating: detailData?.rating || "8.0",
        genres:
          detailData?.genres && detailData.genres.length > 0
            ? detailData.genres
            : item.genres && item.genres.length > 0
              ? item.genres
              : ["Movie"],
        synopsis:
          detailData?.overview ||
          detailData?.synopsis ||
          `Saksikan film ${item.title} sub Indo gratis di IDLIX.`,
        quality: detailData?.quality || "HD",
        duration: detailData?.runtime
          ? `${detailData.runtime}m`
          : detailData?.duration || "1h 50m",
      });
    }
    res.json({ status: true, result: { results: enrichedResults } });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch from external API" });
  }
});
function getLangLabel(code) {
  const map = {
    in_id: "Indonesian",
    id: "Indonesian",
    ind: "Indonesian",
    en: "English",
    eng: "English",
    ar: "Arabic",
    fr: "French",
    es: "Spanish",
    hi: "Hindi",
    ms: "Malay",
    fil: "Filipino",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    ru: "Russian",
    pt: "Portuguese",
    de: "German",
  };
  return map[(code || "").toLowerCase()] || (code || "Subtitle").toUpperCase();
}
__name(getLangLabel, "getLangLabel");
function cleanTitleStr(str) {
  return (str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}
__name(cleanTitleStr, "cleanTitleStr");
function isTitleMatch(queryTitle, targetTitle) {
  if (!queryTitle || !targetTitle) return false;
  const q = cleanTitleStr(queryTitle);
  const t = cleanTitleStr(targetTitle);
  if (!q || !t) return false;
  if (q.includes(t) || t.includes(q)) return true;
  const qWords = queryTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const tWords = targetTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return qWords.some((w) => t.includes(w)) || tWords.some((w) => q.includes(w));
}
__name(isTitleMatch, "isTitleMatch");
app.get("/api/subtitle", async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).send("URL parameter is required");
    const subRes = await fetch(targetUrl);
    if (!subRes.ok)
      return res.status(subRes.status).send("Failed to fetch subtitle");
    const text = await subRes.text();
    let vttContent = text;
    if (!text.trim().startsWith("WEBVTT")) {
      vttContent =
        "WEBVTT\n\n" + text.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
    }
    res.setHeader("Content-Type", "text/vtt; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(vttContent);
  } catch (err) {
    console.error("Subtitle proxy error:", err);
    res.status(500).send("Subtitle proxy error");
  }
});
app.get("/api/stream-proxy", async (req, res) => {
  try {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send("URL parameter is required");
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.keyrafara.com/",
    };
    if (req.headers.range) {
      headers["Range"] = req.headers.range;
    }
    const proxyRes = await fetch(videoUrl, { headers });
    res.status(proxyRes.status);
    const forwardHeaders = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
    ];
    forwardHeaders.forEach((h) => {
      const val = proxyRes.headers.get(h);
      if (val) res.setHeader(h, val);
    });
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (!proxyRes.body) return res.end();
    const reader = proxyRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (err) {
    console.error("Video stream proxy error:", err);
    if (!res.headersSent) res.status(500).send("Stream proxy error");
  }
});
app.get("/api/detail", async (req, res) => {
  try {
    const {
      query,
      type,
      year,
      slug,
      server,
      season,
      episode,
      tmdbId: queryTmdbId,
    } = req.query;
    if (!query && !slug) {
      return res.status(400).json({ error: "Query or slug is required" });
    }
    const isTvSeries = type === "series" || type === "tv_series";
    const requestedServer = server || "auto";
    const cacheKey = `detail_v4_${slug || query}_${year || ""}_${type || ""}_${requestedServer}_${season || "1"}_${episode || "1"}`;
    if (detailCache.has(cacheKey)) {
      return res.json(detailCache.get(cacheKey));
    }
    const targetSlug = slug || query;
    const cleanQuery = String(query || slug || "")
      .replace(/\(\d{4}\)/g, "")
      .replace(/-\d{4}$/g, "")
      .replace(/-/g, " ")
      .trim();
    const resolveTmdbId = __name(
      async (slugVal, titleVal, yearVal, typeVal) => {
        if (queryTmdbId && /^\d+$/.test(String(queryTmdbId))) {
          return String(queryTmdbId);
        }
        if (slugVal && /^\d+$/.test(slugVal)) {
          return slugVal;
        }
        if (titleVal && /^\d+$/.test(titleVal)) {
          return titleVal;
        }
        let finalYear = yearVal;
        if (slugVal) {
          const slugYearMatch = slugVal.match(/-(\d{4})$/);
          if (slugYearMatch) {
            const slugYear = parseInt(slugYearMatch[1]);
            if (!finalYear || (finalYear === 2026 && slugYear !== 2026)) {
              finalYear = slugYear;
            }
          }
        }
        const lowerTitle = titleVal.toLowerCase().trim();
        const hardcodedIds = {
          "agak laen": "1175161",
          "agak laen: menyala pantiku!": "1287571",
          "kkn di desa penari": "638985",
          "siksa kubur": "1119527",
          "pengabdi setan 2: communion": "925786",
          "dilan 1990": "492459",
          "ipar adalah maut": "1181068",
          "sekawan limo": "1279914",
          "vina: sebelum 7 hari": "1148817",
          "kang mak from pee mak": "1263112",
          "laskar pelangi": "22421",
          "badarawuhi di desa penari": "1176166",
          "miracle in cell no. 7": "637920",
          "sewu dino": "1052865",
          "dilan 1991": "577970",
          "warkop dki reborn: jangkrik boss! part 1": "405040",
          "habibie & ainun": "172705",
          "pengabdi setan": "467012",
        };
        if (hardcodedIds[lowerTitle]) {
          return hardcodedIds[lowerTitle];
        }
        const matchKey = Object.keys(hardcodedIds).find(
          (k) => lowerTitle.includes(k) || k.includes(lowerTitle),
        );
        if (matchKey) {
          return hardcodedIds[matchKey];
        }
        const cleanedTitle = titleVal
          .replace(/\(\d{4}\)/g, "")
          .replace(/-\d{4}$/g, "")
          .replace(/:\s*menyala\s*pantiku!?/gi, "")
          .replace(/[\:\-\,\.\!]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const apiKey = getTmdbApiKey();
        if (apiKey) {
          try {
            const isTv = typeVal === "series" || typeVal === "tv_series";
            const searchType = isTv ? "tv" : "movie";
            const yearParam = finalYear
              ? searchType === "tv"
                ? `&first_air_date_year=${finalYear}`
                : `&primary_release_year=${finalYear}`
              : "";
            let searchRes = await fetch(
              `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(cleanedTitle)}${yearParam}&language=id-ID`,
            );
            let data = await searchRes.json();
            if (data.results && data.results.length > 0) {
              return data.results[0].id.toString();
            }
            searchRes = await fetch(
              `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(cleanedTitle)}&language=id-ID`,
            );
            data = await searchRes.json();
            if (data.results && data.results.length > 0) {
              if (finalYear) {
                const match = data.results.find((m) => {
                  const rDate = m.release_date || m.first_air_date || "";
                  return (
                    rDate.startsWith(String(finalYear)) ||
                    rDate.startsWith(String(finalYear - 1)) ||
                    rDate.startsWith(String(finalYear + 1))
                  );
                });
                if (match) return match.id.toString();
              }
              return data.results[0].id.toString();
            }
            searchRes = await fetch(
              `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(cleanedTitle)}${yearParam}`,
            );
            data = await searchRes.json();
            if (data.results && data.results.length > 0) {
              return data.results[0].id.toString();
            }
            searchRes = await fetch(
              `https://api.themoviedb.org/3/search/${searchType}?api_key=${apiKey}&query=${encodeURIComponent(titleVal)}`,
            );
            data = await searchRes.json();
            if (data.results && data.results.length > 0) {
              return data.results[0].id.toString();
            }
          } catch (e) {
            console.error("TMDB Search failed in resolveTmdbId:", e);
          }
        }
        return null;
      },
      "resolveTmdbId",
    );
    let seasonsData = [];
    if (isTvSeries) {
      try {
        const tmdbId = await resolveTmdbId(
          targetSlug,
          cleanQuery,
          year ? parseInt(year) : void 0,
          "series",
        );
        if (tmdbId) {
          const apiKey = getTmdbApiKey();
          if (apiKey) {
            const tmdbDetailRes = await fetch(
              `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${apiKey}&language=id-ID`,
            );
            if (tmdbDetailRes.ok) {
              const tmdbShowDetails = await tmdbDetailRes.json();
              if (tmdbShowDetails && Array.isArray(tmdbShowDetails.seasons)) {
                seasonsData = tmdbShowDetails.seasons.map((s) => ({
                  name: s.name,
                  season_number: s.season_number,
                  episode_count: s.episode_count,
                  poster_path: s.poster_path
                    ? `https://image.tmdb.org/t/p/w200${s.poster_path}`
                    : null,
                }));
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to pre-fetch TV series seasons:", e);
      }
    }
    const fetchStrigil = __name(async () => {
      try {
        const tmdbId = await resolveTmdbId(
          targetSlug,
          cleanQuery,
          year ? parseInt(year) : void 0,
          type,
        );
        if (tmdbId) {
          const sNum = season ? String(season) : "1";
          const eNum = episode ? String(episode) : "1";
          let strigilUrl = "";
          let vidsrcUrl = "";
          let vidsrcXyzUrl = "";
          let multiEmbedUrl = "";
          if (isTvSeries) {
            strigilUrl = `https://strigil.cc/embed/tv/${tmdbId}/${sNum}/${eNum}`;
            vidsrcUrl = `https://vidsrc.to/embed/tv/${tmdbId}/${sNum}/${eNum}`;
            vidsrcXyzUrl = `https://vidsrc.xyz/embed/tv/${tmdbId}/${sNum}/${eNum}`;
            multiEmbedUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${sNum}&e=${eNum}`;
          } else {
            strigilUrl = `https://strigil.cc/embed/movie/${tmdbId}`;
            vidsrcUrl = `https://vidsrc.to/embed/movie/${tmdbId}`;
            vidsrcXyzUrl = `https://vidsrc.xyz/embed/movie/${tmdbId}`;
            multiEmbedUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
          }
          const embedSources = [
            { name: "VIP Strigil \u{1F48E}", url: strigilUrl },
            { name: "VIP Vidsrc \u26A1", url: vidsrcUrl },
            { name: "VIP Vidsrc XYZ \u{1F680}", url: vidsrcXyzUrl },
            { name: "VIP MultiEmbed \u{1F37F}", url: multiEmbedUrl },
          ];
          let movieDetails = null;
          const apiKey = getTmdbApiKey();
          if (apiKey) {
            try {
              const tmdbDetailRes = await fetch(
                `https://api.themoviedb.org/3/${isTvSeries ? "tv" : "movie"}/${tmdbId}?api_key=${apiKey}&language=id-ID`,
              );
              if (tmdbDetailRes.ok) {
                movieDetails = await tmdbDetailRes.json();
              } else {
                const tmdbDetailResEn = await fetch(
                  `https://api.themoviedb.org/3/${isTvSeries ? "tv" : "movie"}/${tmdbId}?api_key=${apiKey}&language=en-US`,
                );
                if (tmdbDetailResEn.ok) {
                  movieDetails = await tmdbDetailResEn.json();
                }
              }
            } catch (e) {
              console.error(
                "Failed to fetch TMDB details inside Strigil helper:",
                e,
              );
            }
          }
          const finalTitle =
            movieDetails?.title || movieDetails?.name || cleanQuery;
          const finalOverview =
            movieDetails?.overview ||
            `Saksikan ${finalTitle} secara langsung via server Strigil VIP & multi-source player.`;
          const finalGenres = movieDetails?.genres
            ? movieDetails.genres.map((g) => g.name)
            : ["Strigil", "Premium Embed"];
          const finalRating = movieDetails?.vote_average
            ? movieDetails.vote_average.toFixed(1)
            : "8.8";
          const finalDuration = movieDetails?.runtime
            ? `${movieDetails.runtime}m`
            : movieDetails?.episode_run_time?.[0]
              ? `${movieDetails.episode_run_time[0]}m`
              : "HD 1080p";
          const finalPoster = movieDetails?.poster_path
            ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
            : void 0;
          return {
            status: true,
            server: "Strigil",
            result: {
              title: finalTitle,
              poster: finalPoster,
              embedUrl: strigilUrl,
              embedSources,
              seasons: seasonsData.length > 0 ? seasonsData : void 0,
              detail: {
                synopsis: finalOverview,
                genres: finalGenres,
                rating: finalRating,
                duration: finalDuration,
              },
            },
          };
        }
      } catch (e) {
        console.error("Strigil fetch error:", e);
      }
      return null;
    }, "fetchStrigil");
    const fetchLk21 = __name(async (q) => {
      try {
        const lk21Res = await fetch(
          `https://www.keyrafara.com/streaming/lk21?query=${encodeURIComponent(q)}&server=auto`,
        );
        const lk21Data = await lk21Res.json();
        if (
          lk21Data.status &&
          lk21Data.result &&
          (lk21Data.result.streamUrl ||
            (lk21Data.result.sources && lk21Data.result.sources.length > 0) ||
            lk21Data.result.embedUrl)
        ) {
          const subtitles = [];
          const resultData = lk21Data.result;
          let streamUrl = resultData.streamUrl || "";
          const embedUrl = resultData.embedUrl || "";
          const sources = (resultData.sources || []).map((s) => ({
            label: s.label || s.resolution || "HD",
            url: s.url,
            type: s.type || "m3u8",
          }));
          if (!streamUrl && sources.length > 0) {
            streamUrl = sources[0].url;
          }
          return {
            status: true,
            result: {
              title: resultData.title || q,
              poster: resultData.poster || "",
              embedUrl,
              streamUrl,
              sources,
              subtitles,
              server: "LK21",
              detail: resultData.detail || {
                synopsis: "Saksikan streaming film di LK21.",
              },
            },
          };
        }
      } catch (e) {
        console.error("LK21 fetch error", e);
      }
      return null;
    }, "fetchLk21");
    const fetchMoviebox = __name(async (q) => {
      try {
        const mbRes = await fetch(
          `https://www.keyrafara.com/streaming/moviebox?q=${encodeURIComponent(q)}`,
        );
        const mbData = await mbRes.json();
        if (
          mbData.status &&
          mbData.result &&
          (mbData.result.streamUrl ||
            (mbData.result.sources && mbData.result.sources.length > 0))
        ) {
          const subtitles = (mbData.result.subtitles || []).map((s) => ({
            lang: s.lang || "id",
            label: getLangLabel(s.lang),
            path: `/api/subtitle?url=${encodeURIComponent(s.url)}`,
            url: s.url,
          }));
          const sources = (mbData.result.sources || []).map((s) => ({
            label: s.label || s.resolution || "HD",
            url: s.url,
            type: s.type || "mp4",
          }));
          const smoothSource =
            sources.find((s) => s.label === "480p") ||
            sources.find((s) => s.label === "360p") ||
            sources.find((s) => s.label === "720p") ||
            sources[0];
          const defaultStreamUrl = smoothSource
            ? smoothSource.url
            : mbData.result.streamUrl || "";
          return {
            status: true,
            server: "Moviebox",
            result: {
              title: mbData.result.title,
              poster: mbData.result.poster,
              streamUrl: defaultStreamUrl,
              sources,
              subtitles,
              detail: {
                synopsis: `Saksikan ${mbData.result.title} secara langsung via server Moviebox.`,
                genres: ["Moviebox", "Smooth Streaming"],
                rating: "8.5",
                duration: "HD",
              },
            },
          };
        }
      } catch (e) {
        console.error("Moviebox fetch error:", e);
      }
      return null;
    }, "fetchMoviebox");
    const fetchVideasy = __name(async () => {
      try {
        const tmdbId = await resolveTmdbId(
          targetSlug,
          cleanQuery,
          year ? parseInt(year) : void 0,
          isTvSeries ? "series" : "movie",
        );
        if (tmdbId) {
          const sNum = season ? String(season) : "1";
          const eNum = episode ? String(episode) : "1";
          const embedUrl = isTvSeries
            ? `https://player.videasy.net/tv/${tmdbId}/${sNum}/${eNum}`
            : `https://player.videasy.net/movie/${tmdbId}`;
          let movieDetails = null;
          const apiKey = getTmdbApiKey();
          if (apiKey) {
            try {
              const tmdbDetailRes = await fetch(
                `https://api.themoviedb.org/3/${isTvSeries ? "tv" : "movie"}/${tmdbId}?api_key=${apiKey}&language=id-ID`,
              );
              if (tmdbDetailRes.ok) {
                movieDetails = await tmdbDetailRes.json();
              } else {
                const tmdbDetailResEn = await fetch(
                  `https://api.themoviedb.org/3/${isTvSeries ? "tv" : "movie"}/${tmdbId}?api_key=${apiKey}&language=en-US`,
                );
                if (tmdbDetailResEn.ok) {
                  movieDetails = await tmdbDetailResEn.json();
                }
              }
            } catch (e) {
              console.error("TMDB API error in Videasy helper:", e);
            }
          }
          const finalTitle = movieDetails
            ? movieDetails.title || movieDetails.name || cleanQuery
            : cleanQuery;
          const finalOverview = movieDetails
            ? movieDetails.overview || ""
            : `Saksikan ${finalTitle} secara langsung via server Videasy.`;
          const finalPoster = movieDetails
            ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path || movieDetails.backdrop_path}`
            : "";
          const finalGenres =
            movieDetails && movieDetails.genres
              ? movieDetails.genres.map((g) => g.name)
              : ["Videasy"];
          const finalRating = movieDetails
            ? String(movieDetails.vote_average)
            : "8.0";
          const finalDuration = movieDetails
            ? isTvSeries
              ? `${movieDetails.number_of_episodes || "12"} Episodes`
              : `${movieDetails.runtime || "120"} min`
            : "HD";
          return {
            status: true,
            server: "Videasy",
            result: {
              title: finalTitle,
              poster: finalPoster,
              embedUrl,
              seasons: seasonsData.length > 0 ? seasonsData : void 0,
              detail: {
                synopsis: finalOverview,
                genres: finalGenres,
                rating: finalRating,
                duration: finalDuration,
              },
            },
          };
        }
      } catch (e) {
        console.error("Videasy fetch error:", e);
      }
      return null;
    }, "fetchVideasy");
    if (requestedServer === "strigil") {
      const strigilResult = await fetchStrigil();
      if (strigilResult) {
        detailCache.set(cacheKey, strigilResult);
        return res.json(strigilResult);
      }
      const failStrigil = {
        status: false,
        message: `Film '${cleanQuery}' tidak ditemukan di server Strigil.`,
      };
      return res.json(failStrigil);
    }
    if (requestedServer === "moviebox") {
      const mbResult = await fetchMoviebox(cleanQuery);
      if (mbResult) {
        detailCache.set(cacheKey, mbResult);
        return res.json(mbResult);
      }
      const failMb = {
        status: false,
        message: `Film '${cleanQuery}' tidak ditemukan di server Moviebox.`,
      };
      return res.json(failMb);
    }
    if (requestedServer === "videasy") {
      const videasyResult = await fetchVideasy();
      if (videasyResult) {
        detailCache.set(cacheKey, videasyResult);
        return res.json(videasyResult);
      }
      const failVideasy = {
        status: false,
        message: `Film '${cleanQuery}' tidak ditemukan di server Videasy.`,
      };
      return res.json(failVideasy);
    }
    if (requestedServer === "lk21") {
      const lk21Result = await fetchLk21(cleanQuery);
      if (lk21Result) {
        detailCache.set(cacheKey, lk21Result);
        return res.json(lk21Result);
      }
      const failLk21 = {
        status: false,
        message: `Film '${cleanQuery}' tidak ditemukan di server LK21.`,
      };
      return res.json(failLk21);
    }
    if (requestedServer === "idlix" || requestedServer === "auto") {
      const endpoint = isTvSeries
        ? "/streaming/idlix-series"
        : "/streaming/idlix";
      const sNum = season ? String(season) : "1";
      const eNum = episode ? String(episode) : "1";
      const seriesParams = isTvSeries ? `&season=${sNum}&episode=${eNum}` : "";
      if (targetSlug && targetSlug.includes("-")) {
        try {
          const directRes = await fetch(
            `https://www.keyrafara.com${endpoint}?slug=${encodeURIComponent(targetSlug)}&server=auto${seriesParams}`,
          );
          const directData = await directRes.json();
          if (
            directData.status &&
            directData.result &&
            (directData.result.streamUrl || directData.result.embedUrl) &&
            isTitleMatch(cleanQuery, directData.result.title)
          ) {
            try {
              const detailMeta = await fetchMovieDetail(targetSlug);
              if (detailMeta) {
                if (!directData.result.detail) directData.result.detail = {};
                directData.result.detail.cast = detailMeta.cast || [];
                directData.result.detail.director = detailMeta.director || "";
                directData.result.detail.tagline = detailMeta.tagline || "";
                directData.result.detail.releaseDate =
                  detailMeta.releaseDate || "";
              }
            } catch (e) {
              console.error("Error fetching detail meta:", e);
            }
            if (isTvSeries && seasonsData.length > 0) {
              directData.result.seasons = seasonsData;
            }
            const finalData = { ...directData, server: "IDLIX" };
            detailCache.set(cacheKey, finalData);
            return res.json(finalData);
          }
        } catch (e) {}
      }
      try {
        const searchRes = await fetch(
          `https://www.keyrafara.com/search/idlix-search?query=${encodeURIComponent(cleanQuery)}`,
        );
        const searchData = await searchRes.json();
        if (
          searchData.status &&
          searchData.result &&
          Array.isArray(searchData.result.results) &&
          searchData.result.results.length > 0
        ) {
          const results = searchData.result.results;
          const titleMatches = results.filter((item) =>
            isTitleMatch(cleanQuery, item.title),
          );
          if (titleMatches.length > 0) {
            let bestMatch = titleMatches[0];
            if (year) {
              let minDiff = Infinity;
              for (const item of titleMatches) {
                const itemYear =
                  item.year ||
                  (item.slug?.match(/\d{4}/)
                    ? parseInt(item.slug.match(/\d{4}/)[0])
                    : null);
                if (itemYear) {
                  const diff = Math.abs(parseInt(year) - parseInt(itemYear));
                  if (diff < minDiff) {
                    minDiff = diff;
                    bestMatch = item;
                  }
                }
              }
            }
            if (bestMatch && bestMatch.slug) {
              const matchedRes = await fetch(
                `https://www.keyrafara.com${endpoint}?slug=${encodeURIComponent(bestMatch.slug)}&server=auto${seriesParams}`,
              );
              const matchedData = await matchedRes.json();
              if (
                matchedData.status &&
                matchedData.result &&
                (matchedData.result.streamUrl || matchedData.result.embedUrl) &&
                isTitleMatch(cleanQuery, matchedData.result.title)
              ) {
                try {
                  const detailMeta = await fetchMovieDetail(bestMatch.slug);
                  if (detailMeta) {
                    if (!matchedData.result.detail)
                      matchedData.result.detail = {};
                    matchedData.result.detail.cast = detailMeta.cast || [];
                    matchedData.result.detail.director =
                      detailMeta.director || "";
                    matchedData.result.detail.tagline =
                      detailMeta.tagline || "";
                    matchedData.result.detail.releaseDate =
                      detailMeta.releaseDate || "";
                  }
                } catch (e) {
                  console.error(
                    "Error fetching detail meta for matched slug:",
                    e,
                  );
                }
                if (isTvSeries && seasonsData.length > 0) {
                  matchedData.result.seasons = seasonsData;
                }
                const finalData = { ...matchedData, server: "IDLIX" };
                detailCache.set(cacheKey, finalData);
                return res.json(finalData);
              }
            }
          }
        }
      } catch (err) {
        console.error("Match search error:", err);
      }
    }
    if (requestedServer === "auto") {
      const strigilResult = await fetchStrigil();
      if (strigilResult) {
        detailCache.set(cacheKey, strigilResult);
        return res.json(strigilResult);
      }
    }
    if (requestedServer === "auto") {
      const mbResult = await fetchMoviebox(cleanQuery);
      if (mbResult) {
        detailCache.set(cacheKey, mbResult);
        return res.json(mbResult);
      }
    }
    if (requestedServer === "auto") {
      const videasyResult = await fetchVideasy();
      if (videasyResult) {
        detailCache.set(cacheKey, videasyResult);
        return res.json(videasyResult);
      }
    }
    if (requestedServer === "auto") {
      const lk21Result = await fetchLk21(cleanQuery);
      if (lk21Result) {
        detailCache.set(cacheKey, lk21Result);
        return res.json(lk21Result);
      }
    }
    const noMatchResult = {
      status: false,
      message: `Film '${query}' (${year || ""}) belum tersedia di server IDLIX, Strigil, Moviebox, maupun Videasy.`,
    };
    detailCache.set(cacheKey, noMatchResult);
    res.json(noMatchResult);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to fetch from external API" });
  }
});
app.get("/api/firebase-movies", async (req, res) => {
  try {
    const movies = await fetchMoviesFromFirestore();
    res.json({
      status: true,
      count: movies.length,
      source: "Firebase Firestore",
      movies,
    });
  } catch (err) {
    console.error("Firebase route error:", err);
    res
      .status(500)
      .json({ status: false, error: "Failed to fetch from Firebase" });
  }
});
const isVercelEnv = Boolean(
  process.env.VERCEL || process.env.VERCEL_ENV || process.env.NOW_REGION,
);
if (!isVercelEnv) {
  if (process.env.NODE_ENV !== "production") {
    const vitePkg = "vite";
    import(vitePkg)
      .then((s) => {
        const e = "default";
        return s[e] && typeof s[e] == "object" && "__esModule" in s[e]
          ? s[e]
          : s;
      })
      .then(({ createServer: createViteServer }) => {
        createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        }).then((vite) => {
          app.use(vite.middlewares);
          app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
          });
        });
      });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}
export { app };
