import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaults = {
  INVENTORY_FORMAT: '{prefix}-{year}-{counter}',
  INVENTORY_PREFIX_DEFAULT: 'MAT',
  INVENTORY_COUNTER_PADDING: '4',
  INVENTORY_COUNTER_MODE: 'ANNUEL',
  QR_CODE_STRATEGY: 'INVENTORY_NUMBER',
  QR_CODE_BASE_URL: 'http://localhost:5173/materiels',
  LABEL_DEFAULT_FORMAT: 'SMALL',
  LABEL_DEFAULT_CONTENT: 'BOTH'
};

async function main() {
  await Promise.all(
    Object.entries(defaults).map(([cle, valeur]) =>
      prisma.parametre.upsert({
        where: { cle },
        update: { valeur },
        create: { cle, valeur }
      })
    )
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Paramètres par défaut initialisés.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
