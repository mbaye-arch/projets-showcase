import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';
import { ensureDefaultParametres } from './services/parametre.service.js';

async function bootstrap() {
  await ensureDefaultParametres();

  const server = app.listen(env.port, () => {
    console.log(`Backend STC GETS démarré sur http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(async (error) => {
  console.error('Erreur de démarrage backend:', error);
  await prisma.$disconnect();
  process.exit(1);
});
