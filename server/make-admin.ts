import { prisma } from './src/utils/prisma';

// Usage:
//   npm run make-admin -- you@example.com   (promotes just that account — recommended)
//   npm run make-admin                      (promotes every user — only for local/dev use)
async function main() {
  const email = process.argv[2];

  if (email) {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`${user.email} upgraded to ADMIN`);
  } else {
    await prisma.user.updateMany({ data: { role: 'ADMIN' } });
    console.log('All users upgraded to ADMIN');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
