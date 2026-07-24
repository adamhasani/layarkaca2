process.env.VERCEL = '1';

let app: any;
let loadError: any;

async function getServerApp() {
  if (app) return app;

  try {
    const m = await import('../server.ts');
    app = m.app;
    return app;
  } catch (err1: any) {
    try {
      const m = await import('../server.js');
      app = m.app;
      return app;
    } catch (err2) {
      try {
        const m = await import('../server');
        app = m.app;
        return app;
      } catch (err3) {
        loadError = err1;
        throw err1;
      }
    }
  }
}

export default async function (req: any, res: any) {
  try {
    const expressApp = await getServerApp();
    return expressApp(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to load server',
      details: err?.message || String(err),
      stack: err?.stack
    });
  }
}


