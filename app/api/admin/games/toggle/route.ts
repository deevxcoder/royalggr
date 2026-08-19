import { NextRequest, NextResponse } from "next/server";
import { getCurrentOperator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const operator = await getCurrentOperator();
    if (!operator) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, field } = await req.json();

    const game = await prisma.externalGame.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const updated = await prisma.externalGame.update({
      where: { id },
      data: {
        [field === "isFeatured" ? "isFeatured" : "isActive"]:
          field === "isFeatured" ? !game.isFeatured : !game.isActive,
      },
    });

    return NextResponse.json({ success: true, game: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
