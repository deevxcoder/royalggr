import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MOCK_UIDS = [
  "vs20olympgate",
  "vs20sweetbonanza",
  "vs20sugarush",
  "vs20doghouse",
  "vs10bbhas",
  "vs20starlight",
  "vs25wolfgold",
  "vs20madame",
  "pgs_mahjongways2",
  "pgs_fortunetiger",
  "pgs_fortunerabbit",
  "pgs_fortuneox",
  "pgs_luckyneko",
  "pgs_wildbounty",
  "spribe_aviator",
  "spribe_mines",
  "spribe_plinko",
  "spribe_dice",
  "spribe_hilo",
  "evo_lightningroulette",
  "evo_crazytime",
  "evo_monopoly",
  "evo_blackjack",
  "jili_91",
  "jili_77",
  "jili_mock_1",
  "jili_mock_2",
  "jili_mock_3",
  "hs_wanted",
  "hs_ripcity",
  "hs_dorkunit",
];

async function main() {
  console.log("Cleaning up mock game entries from master database...");

  const result = await prisma.externalGame.deleteMany({
    where: {
      OR: [
        { gameUid: { in: MOCK_UIDS } },
        { gameUid: { startsWith: "pgs_" } },
        { gameUid: { startsWith: "spribe_" } },
        { gameUid: { startsWith: "evo_" } },
        { gameUid: { startsWith: "jili_mock" } },
        { gameUid: { startsWith: "hs_" } },
      ],
    },
  });

  console.log(`Successfully deleted ${result.count} mock games from database!`);

  // Count remaining games
  const totalRemaining = await prisma.externalGame.count();
  console.log(`Total active games remaining in database: ${totalRemaining}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
