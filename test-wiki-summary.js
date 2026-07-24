async function testWikiSummary() {
  try {
    const slug = 'Agak_Laen';
    const url = `https://id.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'CinestreamApp/1.0 (contact@example.com)' } });
    if (res.ok) {
      const data = await res.json();
      console.log("Success! Data retrieved:", {
        title: data.title,
        description: data.description,
        extract: data.extract?.slice(0, 150),
        image: data.originalimage?.source || data.thumbnail?.source
      });
    } else {
      console.log("Failed with status:", res.status);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
testWikiSummary();
