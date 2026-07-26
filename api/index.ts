import { createRequire } from 'module';
const require = createRequire(import.meta.url);

process.env.VERCEL = '1';

let appInstance: any = null;

export default function handler(req: any, res: any) {
  if (!appInstance) {
    try {
      const serverModule = require('../dist/server.cjs');
      appInstance = serverModule.app || serverModule.default || serverModule;
    } catch (e) {
      console.error("Failed to load dist/server.cjs", e);
      return res.status(500).json({ error: "Server build missing", details: e?.message });
    }
  }
  return appInstance(req, res);
}
