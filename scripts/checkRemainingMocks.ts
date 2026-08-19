import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkRemainingMocks() {
  const mockGames = await prisma.externalGame.findMany({
    where: {
      provider: { type: "NEXX_AGGREGATOR" },
      OR: [
        { gameUid: { contains: "mock" } },
        { gameUid: { startsWith: "jili_" } },
        { gameUid: { startsWith: "pgs_" } },
        { gameUid: { startsWith: "spribe_" } },
        { gameUid: { startsWith: "evo_" } },
        { gameUid: { startsWith: "hs_" } },
      ],
    },
  });

  console.log(`Remaining mock external games: ${mockGames.length}`);
  if (mockGames.length > 0) {
    console.log("Deleting remaining mock games...");
    await prisma.externalGame.deleteMany({
      where: {
        id: { in: mockGames.map((g) => g.id) },
      },
    });
    console.log("Deleted!");
  }
}

checkRemainingMocks()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
