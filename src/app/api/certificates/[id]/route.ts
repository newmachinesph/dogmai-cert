import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest, isAdmin } from "@/lib/auth";

// GET - Get single certificate
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { id },
          { publicId: id },
          { verificationCode: id },
        ],
      },
      include: {
        template: true,
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            views: true,
            shares: true,
          },
        },
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Record view
    const viewerIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    const user = await getUserFromRequest(request);

    await prisma.certificateView.create({
      data: {
        certificateId: certificate.id,
        viewerId: user?.userId,
        viewerIp,
        userAgent,
        referer,
      },
    });

    return NextResponse.json({ certificate });
  } catch (error) {
    console.error("Get certificate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update certificate
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;

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
      customFields,
      signatureIds,
      status,
      revokedReason,
    } = body;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (title !== undefined) updateData.title = title;
    if (recipientName !== undefined) updateData.recipientName = recipientName;
    if (recipientEmail !== undefined) updateData.recipientEmail = recipientEmail?.toLowerCase();
    if (description !== undefined) updateData.description = description;
    if (customFields !== undefined) updateData.customFields = JSON.stringify(customFields);
    if (signatureIds !== undefined) updateData.signatureIds = JSON.stringify(signatureIds);

    if (status !== undefined) {
      updateData.status = status;
      if (status === "REVOKED") {
        updateData.revokedAt = new Date();
        updateData.revokedReason = revokedReason || null;
      }
    }

    const updated = await prisma.certificate.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
      },
    });

    return NextResponse.json({
      success: true,
      certificate: updated,
    });
  } catch (error) {
    console.error("Update certificate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete certificate
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    const { id } = await params;

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

    await prisma.certificate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete certificate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
