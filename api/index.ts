process.env.VERCEL = '1';

const { app } = await import('../server.ts');

export default app;


