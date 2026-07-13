import { prisma } from './src/utils/prisma';

async function main() {
  await prisma.user.updateMany({
    data: { role: 'ADMIN' }
  });
  console.log('All users upgraded to ADMIN');
}

main().catch(console.error).finally(() => prisma.$disconnect());
