import { ensureDemoData } from './utils/demoSeed';
import { prisma } from './utils/prisma';

async function main() {
  console.log('Seeding database...');
  await ensureDemoData();
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
