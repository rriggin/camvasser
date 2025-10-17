import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser() {
  const passwordHash = await bcrypt.hash('m@ch1nes', 10);

  const user = await prisma.businessUser.upsert({
    where: { email: 'ryan@budroofing.com' },
    update: {
      passwordHash,
      status: 'approved'
    },
    create: {
      name: 'Ryan Riggin',
      email: 'ryan@budroofing.com',
      phone: '913-593-1084',
      companyName: 'Bud Roofing',
      domain: 'budroofing.com',
      slug: 'budroofing',
      status: 'approved',
      passwordHash,
      approvedAt: new Date()
    }
  });

  console.log('Business user created/updated:', user);
  await prisma.$disconnect();
}

createUser().catch(console.error);
