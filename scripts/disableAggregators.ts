import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating game providers and catalog...");

  // 1. Disable ALL providers first
  await prisma.externalProvider.updateMany({
    data: {
      isActive: false,
    },
  });

  // 2. Enable ONLY Royal Games Studio (brandId: 1)
  const activeRoyal = await prisma.externalProvider.updateMany({
    where: {
      brandId: 1,
    },
    data: {
      isActive: true,
      type: "ROYAL_NATIVE",
    },
  });

  // 3. Disable ALL external games first
  await prisma.externalGame.updateMany({
    data: {
      isActive: false,
    },
  });

  // 4. Enable ONLY native Royal games (starts with royal_)
  const activeGames = await prisma.externalGame.updateMany({
    where: {
      gameUid: { startsWith: "royal_" },
    },
    data: {
      isActive: true,
    },
  });

  console.log(`✅ Ensured Royal Games Studio (Brand ID 1) is the ONLY ACTIVE provider (${activeRoyal.count}).`);
  console.log(`✅ Ensured ${activeGames.count} Royal native games are the ONLY ACTIVE games.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
