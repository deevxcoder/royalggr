import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { INITIAL_PROVIDERS_SEED } from "../lib/seedCatalog.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding master admin operator and multi-provider games catalog...");

  const passwordHash = bcrypt.hashSync("admin1234", 10);
  const demoPasswordHash = bcrypt.hashSync("demo1234", 10);

  // 1. Seed or update Master Admin Operator (admin@royalggr.com)
  const masterAdmin = await prisma.operator.upsert({
    where: { email: "admin@royalggr.com" },
    update: {
      companyName: "Master Provider Admin",
      isAdmin: true,
      balance: 100000.0,
    },
    create: {
      companyName: "Master Provider Admin",
      email: "admin@royalggr.com",
      passwordHash,
      balance: 100000.0,
      currency: "INR",
      ggrRate: 10.0,
      isAdmin: true,
      status: "ACTIVE",
      tokens: {
        create: {
          token: "roy_live_admin1234567890abcdef",
          secretKey: "sec_royal_master_admin_secret_2026",
          name: "Master Admin Key",
          isLive: true,
        },
      },
    },
  });

  // 2. Seed or update Demo Client Operator (demo@royalggr.com) - Regular non-admin operator
  const demoOperator = await prisma.operator.upsert({
    where: { email: "demo@royalggr.com" },
    update: {
      companyName: "Royal Casino Demo Operator",
      isAdmin: false,
      balance: 50000.0,
    },
    create: {
      companyName: "Royal Casino Demo Operator",
      email: "demo@royalggr.com",
      passwordHash: demoPasswordHash,
      balance: 50000.0,
      currency: "INR",
      ggrRate: 10.0,
      isAdmin: false,
      status: "ACTIVE",
      tokens: {
        create: {
          token: "roy_live_demo1234567890abcdef",
          secretKey: "sec_royal_master_demo_secret_2026",
          name: "Demo Production Key",
          isLive: true,
        },
      },
    },
  });

  console.log("Master Admin:", masterAdmin.email, "(isAdmin:", masterAdmin.isAdmin, ")");
  console.log("Demo Operator:", demoOperator.email, "(isAdmin:", demoOperator.isAdmin, ")");

  // 2. Seed External Providers and Games Catalog
  for (const provSeed of INITIAL_PROVIDERS_SEED) {
    const isNativeRoyal = provSeed.brandId === 1;
    const provider = await prisma.externalProvider.upsert({
      where: { brandId: provSeed.brandId },
      update: {
        name: provSeed.name,
        type: provSeed.type,
        apiUrl: provSeed.apiUrl,
        logo: provSeed.logo,
        gameCount: provSeed.games.length,
        ggrMargin: provSeed.ggrMargin,
        isActive: isNativeRoyal,
      },
      create: {
        brandId: provSeed.brandId,
        name: provSeed.name,
        type: provSeed.type,
        apiUrl: provSeed.apiUrl,
        logo: provSeed.logo,
        gameCount: provSeed.games.length,
        ggrMargin: provSeed.ggrMargin,
        isActive: isNativeRoyal,
      },
    });

    console.log(`Seeded Provider [${provider.brandId}] ${provider.name} (Active: ${isNativeRoyal})`);

    for (const g of provSeed.games) {
      await prisma.externalGame.upsert({
        where: { gameUid: g.gameUid },
        update: {
          providerId: provider.id,
          gameId: g.gameId,
          name: g.name,
          category: g.category,
          rtp: g.rtp,
          volatility: g.volatility,
          maxMultiplier: g.maxMultiplier,
          thumbnail: g.thumbnail,
          isActive: isNativeRoyal,
          isFeatured: g.isFeatured || false,
        },
        create: {
          providerId: provider.id,
          gameId: g.gameId,
          gameUid: g.gameUid,
          name: g.name,
          category: g.category,
          rtp: g.rtp,
          volatility: g.volatility,
          maxMultiplier: g.maxMultiplier,
          thumbnail: g.thumbnail,
          isActive: isNativeRoyal,
          isFeatured: g.isFeatured || false,
        },
      });
    }
  }

  console.log("Seeding multi-provider catalog completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
