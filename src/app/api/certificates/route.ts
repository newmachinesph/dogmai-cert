import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest, isAdmin } from "@/lib/auth";
import { generateVerificationCode, generatePublicId } from "@/lib/utils";

// GET - List certificates
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const templateId = searchParams.get("templateId");
    const search = searchParams.get("search");

    // Build where clause
    const where: Record<string, unknown> = {};

    // Non-admin users can only see their own certificates
    if (user && !isAdmin(user)) {
      where.userId = user.userId;
    } else if (!user) {
      // Public access - only active certificates
      where.status = "ACTIVE";
    }

    if (status) where.status = status;
    if (templateId) where.templateId = templateId;
    if (search) {
      where.OR = [
        { recipientName: { contains: search } },
        { recipientEmail: { contains: search } },
        { title: { contains: search } },
      ];
    }

    const [certificates, total] = await Promise.all([
      prisma.certificate.findMany({
        where,
        include: {
          template: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          user: {
            select: {
              id: true,
              displayName: true,
              email: true,
            },
          },
          _count: {
            select: {
              views: true,
              shares: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.certificate.count({ where }),
    ]);

    return NextResponse.json({
      certificates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create certificate
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
      title,
      recipientName,
      recipientEmail,
      description,
      templateId,
      customFields,
      signatureIds,
      issuedAt,
      expiresAt,
      userId,
    } = body;

    // Validate required fields
    if (!title || !recipientName || !templateId) {
      return NextResponse.json(
        { error: "Title, recipient name, and template are required" },
        { status: 400 }
      );
    }

    // Verify template exists
    const template = await prisma.certificateTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Create certificate
    const certificate = await prisma.certificate.create({
      data: {
        publicId: generatePublicId(),
        title,
        recipientName,
        recipientEmail: recipientEmail?.toLowerCase(),
        description,
        templateId,
        customFields: customFields ? JSON.stringify(customFields) : null,
        signatureIds: signatureIds ? JSON.stringify(signatureIds) : null,
        issuedAt: issuedAt ? new Date(issuedAt) : new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        userId: userId || null,
        verificationCode: generateVerificationCode(),
        status: "ACTIVE",
      },
      include: {
        template: true,
      },
    });

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error) {
    console.error("Create certificate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
