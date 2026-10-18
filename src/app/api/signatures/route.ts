import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest, isAdmin } from "@/lib/auth";

// GET - List signatures
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const where: Record<string, unknown> = {
      isActive: true,
    };

    // Non-admin users can only see their own signatures
    if (!isAdmin(user)) {
      where.userId = user.userId;
    }

    const signatures = await prisma.signature.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ signatures });
  } catch (error) {
    console.error("Get signatures error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create signature
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!isAdmin(user)) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, title, organization, imageUrl } = body;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: "Name and image URL are required" },
        { status: 400 }
      );
    }

    const signature = await prisma.signature.create({
      data: {
        name,
        title,
        organization,
        imageUrl,
        userId: user.userId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      signature,
    });
  } catch (error) {
    console.error("Create signature error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
