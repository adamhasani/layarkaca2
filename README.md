# LayarZona

Portal streaming film & serial — agregasi metadata TMDB, pencarian, dan pemutaran
dengan multiple source/fallback.

## Tech
- Frontend: HTML + aset statis
- API layer: `api/` (serverless-style endpoints)
- Data: TMDB (`fetch-tmdb*.mjs`)
- Util: `check*.js` (health check endpoint), `clear-cache*.ts`

## Cara jalan
```bash
bun install
bun dev   # atau pakai static host untuk frontend
```

> Repo ini salah satu dari seri eksperimen LayarZona (lihat juga `layarzona1`,
> `layarzona3`, `layarzonaa`).
