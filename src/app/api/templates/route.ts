import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest, isAdmin } from "@/lib/auth";

// GET - List templates
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);

    const includeUnpublished = searchParams.get("includeUnpublished") === "true";

    const where: Record<string, unknown> = {};

    // Only admins can see unpublished templates
    if (!user || !isAdmin(user) || !includeUnpublished) {
      where.isPublished = true;
    }

    const templates = await prisma.certificateTemplate.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
        _count: {
          select: {
            certificates: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Get templates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create template
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
    const {
      name,
      slug,
      description,
      width,
      height,
      orientation,
      backgroundColor,
      backgroundImage,
      layoutConfig,
      styleConfig,
      isPublished,
      isDefault,
    } = body;

    if (!name || !slug || !layoutConfig || !styleConfig) {
      return NextResponse.json(
        { error: "Name, slug, layoutConfig, and styleConfig are required" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await prisma.certificateTemplate.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    // If this is default, unset other defaults
    if (isDefault) {
      await prisma.certificateTemplate.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const template = await prisma.certificateTemplate.create({
      data: {
        name,
        slug,
        description,
        width: width || 1056,
        height: height || 816,
        orientation: orientation || "landscape",
        backgroundColor,
        backgroundImage,
        layoutConfig: typeof layoutConfig === "string" ? layoutConfig : JSON.stringify(layoutConfig),
        styleConfig: typeof styleConfig === "string" ? styleConfig : JSON.stringify(styleConfig),
        isPublished: isPublished || false,
        isDefault: isDefault || false,
        createdById: user.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Create template error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
