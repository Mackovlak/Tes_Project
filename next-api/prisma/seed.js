const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10); // hash the password

  await prisma.user.upsert({
    where: { Email: 'admin@admin.com' },
    update: {},
    create: {
      Email: 'admin@admin.com',
      Username: 'admin',
      Password: hashedPassword,
      Name: 'Admin Account',
      Role: 'admin',
      ProfilePhoto: 'https://example.com/profile.png',
    },
  });
  console.log('✅ Admin user created or already exists');

  

  const statuses = [
    { StatusName: 'Defective', StatusQuantityType: true, DOA: false },
    { StatusName: 'DOAFunctional', StatusQuantityType: true, DOA: true },
    { StatusName: 'DOAPhysical', StatusQuantityType: true, DOA: true },
    { StatusName: 'NoPartReturn', StatusQuantityType: true, DOA: false },

    { StatusName: 'GoodSealed', StatusQuantityType: false, DOA: false },
    { StatusName: 'GoodUnsealed', StatusQuantityType: false, DOA: false },
    { StatusName: 'WPIB', StatusQuantityType: false, DOA: false },
  ]

  await prisma.partReturnStatus.deleteMany() // kosongkan dulu
  await prisma.partReturnStatus.createMany({ data: statuses })

  console.log('✅ PartReturnStatus seeded.')

  const NMU = [
    { NMUDesc: 'Bios Recobery (Win+B)', ItemNeeded: false, VersionNeeded: false },
    { NMUDesc: 'Bios update', ItemNeeded: false, VersionNeeded: true },
    { NMUDesc: 'CMOS Reset', ItemNeeded: true, VersionNeeded: false},
    
  ]

  await prisma.NMU.deleteMany()
  await prisma.NMU.createMany({ data: NMU });

  const cmosReset = await prisma.NMU.findFirst({
    where: { NMUDesc: 'CMOS Reset' },
  });

  // Baru seed NMUItem, relasikan ke CMOS Reset
  if (cmosReset) {
    await prisma.NMUItem.create({
      data: {
        itemName: 'CMOS Battery',
        nmuId: cmosReset.NMUId, // relasi ke NMU
      },
    });
  }

  console.log('✅ NMU & NMUItem seeded successfully');
  
  const ProblemDesc = [
    {ServiceTypeName: 'Health Check', ProblemCategory: 'Software' },
    {ServiceTypeName: 'Rebuild Hardware', ProblemCategory: 'Hardware' },
  ]
  
  await prisma.ServiceType.deleteMany();
  await prisma.ServiceType.createMany({data: ProblemDesc});
  console.log('✅ Service Type seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
