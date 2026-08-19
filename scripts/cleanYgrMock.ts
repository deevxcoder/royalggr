import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.externalGame.deleteMany({
    where: {
      OR: [
        { gameUid: "jili_boxingking" },
        { gameUid: "jili_superace" },
        { gameUid: "jili_fortunegems" },
      ],
    },
  });

  console.log(`Deleted ${deleted.count} mock games from database!`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
