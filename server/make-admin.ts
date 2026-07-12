import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), 'prisma/dev.db')}`,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.updateMany({
    data: { role: 'ADMIN' }
  });
  console.log('All users upgraded to ADMIN');
}

main().catch(console.error).finally(() => prisma.$disconnect());
