import { createRequire } from 'module';
const require = createRequire(import.meta.url);

process.env.VERCEL = '1';

let appInstance: any = null;

function getApp() {
  if (appInstance) return appInstance;
  try {
    const serverModule = require('../dist/server.cjs');
    appInstance = serverModule.app || serverModule.default || serverModule;
  } catch (err1) {
    try {
      const serverModule = require('../server');
      appInstance = serverModule.app || serverModule.default || serverModule;
    } catch (err2) {
      console.error('Failed to load server app:', err1, err2);
      throw err1;
    }
  }
  return appInstance;
}

export default function handler(req: any, res: any) {
  try {
    const app = getApp();
    return app(req, res);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Vercel Serverless Exception',
      message: err?.message || String(err),
      stack: err?.stack
    });
  }
}
