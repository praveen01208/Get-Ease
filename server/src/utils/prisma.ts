import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), 'prisma/dev.db')}`,
});

export const prisma = new PrismaClient({ adapter });
