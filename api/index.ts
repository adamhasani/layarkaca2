let app: any;
let loadError: any;

const loadPromise = import('../server')
  .then(m => { app = m.app; })
  .catch(e => { loadError = e; });

export default async function (req: any, res: any) {
  await loadPromise;
  if (loadError) {
    return res.status(500).json({ error: 'Failed to load server', details: loadError.message, stack: loadError.stack });
  }
  return app(req, res);
}

