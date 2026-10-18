import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const prisma = new PrismaClient();

function generateVerificationCode(): string {
  return nanoid(12).toUpperCase();
}

function generatePublicId(): string {
  return nanoid(10);
}

async function main() {
  console.log("Clearing database...");

  // Clear all tables
  await prisma.certificateShare.deleteMany();
  await prisma.certificateView.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.certificateTemplate.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleared!\n");
  console.log("Seeding database...\n");

  // Create Admin User
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@dogm.ai",
      username: "admin",
      passwordHash: adminPassword,
      displayName: "System Admin",
      role: "ADMIN",
      isActive: true,
      lastLoginAt: new Date(),
    },
  });
  console.log("Created admin user");

  // Create Regular User
  const userPassword = await bcrypt.hash("User123!", 12);
  const user = await prisma.user.create({
    data: {
      email: "user@example.com",
      username: "johndoe",
      passwordHash: userPassword,
      displayName: "John Doe",
      role: "USER",
      isActive: true,
    },
  });
  console.log("Created regular user");

  // Create Signatures
  const signature1 = await prisma.signature.create({
    data: {
      name: "Maria Santos",
      title: "Program Director",
      organization: "DOGM.AI",
      imageUrl: "https://via.placeholder.com/200x80/000000/FFFFFF?text=Maria+Santos",
      userId: admin.id,
      isActive: true,
    },
  });

  const signature2 = await prisma.signature.create({
    data: {
      name: "John Cruz",
      title: "Lead Instructor",
      organization: "DOGM.AI",
      imageUrl: "https://via.placeholder.com/200x80/000000/FFFFFF?text=John+Cruz",
      userId: admin.id,
      isActive: true,
    },
  });
  console.log("Created 2 signatures");

  // Create Default Certificate Template
  const defaultTemplate = await prisma.certificateTemplate.create({
    data: {
      name: "Classic Certificate",
      slug: "classic-certificate",
      description: "A classic and elegant certificate design",
      width: 1056,
      height: 816,
      orientation: "landscape",
      backgroundColor: "#ffffff",
      layoutConfig: JSON.stringify({
        title: {
          x: 528,
          y: 120,
          fontSize: 48,
          fontWeight: "bold",
          color: "#1a1a1a",
          textAlign: "center",
        },
        recipientName: {
          x: 528,
          y: 280,
          fontSize: 42,
          fontWeight: "bold",
          color: "#0066cc",
          textAlign: "center",
        },
        description: {
          x: 528,
          y: 380,
          fontSize: 18,
          color: "#666666",
          textAlign: "center",
          maxWidth: 700,
        },
        date: {
          x: 528,
          y: 500,
          fontSize: 16,
          color: "#888888",
          textAlign: "center",
        },
        signatures: [
          { x: 200, y: 580, width: 150, height: 60 },
          { x: 706, y: 580, width: 150, height: 60 },
        ],
        verificationCode: {
          x: 528,
          y: 780,
          fontSize: 10,
          color: "#aaaaaa",
          textAlign: "center",
        },
        border: {
          width: 3,
          color: "#1a1a1a",
          style: "solid",
          padding: 20,
        },
        decorations: [
          { type: "line", x: 150, y: 160, width: 756, height: 2, color: "#0066cc" },
          { type: "line", x: 150, y: 656, width: 756, height: 2, color: "#0066cc" },
        ],
      }),
      styleConfig: JSON.stringify({
        fontFamily: "Georgia, serif",
        primaryColor: "#1a1a1a",
        secondaryColor: "#666666",
        accentColor: "#0066cc",
      }),
      isPublished: true,
      isDefault: true,
      createdById: admin.id,
    },
  });

  // Create Modern Template
  const modernTemplate = await prisma.certificateTemplate.create({
    data: {
      name: "Modern Gradient",
      slug: "modern-gradient",
      description: "A modern certificate with gradient accents",
      width: 1056,
      height: 816,
      orientation: "landscape",
      backgroundColor: "#f8fafc",
      layoutConfig: JSON.stringify({
        title: {
          x: 528,
          y: 100,
          fontSize: 36,
          fontWeight: "bold",
          color: "#1e293b",
          textAlign: "center",
        },
        recipientName: {
          x: 528,
          y: 260,
          fontSize: 48,
          fontWeight: "bold",
          color: "#3b82f6",
          textAlign: "center",
        },
        description: {
          x: 528,
          y: 360,
          fontSize: 16,
          color: "#64748b",
          textAlign: "center",
          maxWidth: 600,
        },
        date: {
          x: 528,
          y: 480,
          fontSize: 14,
          color: "#94a3b8",
          textAlign: "center",
        },
        signatures: [
          { x: 250, y: 560, width: 120, height: 50 },
          { x: 686, y: 560, width: 120, height: 50 },
        ],
        verificationCode: {
          x: 528,
          y: 780,
          fontSize: 9,
          color: "#cbd5e1",
          textAlign: "center",
        },
        border: {
          width: 1,
          color: "#e2e8f0",
          style: "solid",
          padding: 15,
        },
        decorations: [
          { type: "rect", x: 0, y: 0, width: 1056, height: 8, color: "#3b82f6" },
          { type: "rect", x: 0, y: 808, width: 1056, height: 8, color: "#3b82f6" },
        ],
      }),
      styleConfig: JSON.stringify({
        fontFamily: "system-ui, -apple-system, sans-serif",
        primaryColor: "#1e293b",
        secondaryColor: "#64748b",
        accentColor: "#3b82f6",
      }),
      isPublished: true,
      isDefault: false,
      createdById: admin.id,
    },
  });
  console.log("Created 2 certificate templates");

  // Create Sample Certificates
  const cert1 = await prisma.certificate.create({
    data: {
      publicId: generatePublicId(),
      title: "Certificate of Completion",
      recipientName: "John Doe",
      recipientEmail: "user@example.com",
      description: "For successfully completing the Full-Stack Web Development Bootcamp",
      templateId: defaultTemplate.id,
      userId: user.id,
      signatureIds: JSON.stringify([signature1.id, signature2.id]),
      verificationCode: generateVerificationCode(),
      customFields: JSON.stringify({
        cohortName: "Batch 2 - Manila",
        courseName: "Full-Stack Web Development",
        hours: "480",
      }),
      status: "ACTIVE",
      issuedAt: new Date("2026-01-07"),
    },
  });

  const cert2 = await prisma.certificate.create({
    data: {
      publicId: generatePublicId(),
      title: "Certificate of Achievement",
      recipientName: "Maria Garcia",
      recipientEmail: "maria@example.com",
      description: "For outstanding performance in AI-Powered Development",
      templateId: modernTemplate.id,
      signatureIds: JSON.stringify([signature1.id]),
      verificationCode: generateVerificationCode(),
      customFields: JSON.stringify({
        achievement: "Top Performer",
        score: "98%",
      }),
      status: "ACTIVE",
      issuedAt: new Date("2026-01-06"),
    },
  });

  const cert3 = await prisma.certificate.create({
    data: {
      publicId: generatePublicId(),
      title: "Certificate of Participation",
      recipientName: "Carlos Reyes",
      recipientEmail: "carlos@example.com",
      description: "For participating in the Web Development Fundamentals Workshop",
      templateId: defaultTemplate.id,
      signatureIds: JSON.stringify([signature2.id]),
      verificationCode: generateVerificationCode(),
      status: "ACTIVE",
      issuedAt: new Date("2025-12-15"),
    },
  });
  console.log("Created 3 sample certificates");

  // Create Settings
  await prisma.setting.createMany({
    data: [
      { key: "site_name", value: "DOGM.AI Certificates", type: "string", category: "general" },
      { key: "site_description", value: "Digital Certificate Management Platform", type: "string", category: "general" },
      { key: "default_expiry_days", value: "365", type: "number", category: "certificates" },
      { key: "allow_public_verification", value: "true", type: "boolean", category: "certificates" },
      { key: "support_email", value: "support@dogm.ai", type: "string", category: "general" },
    ],
  });
  console.log("Created system settings");

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("DATABASE SEEDING COMPLETED!");
  console.log("=".repeat(60));

  console.log("\nTEST CREDENTIALS:");
  console.log("-".repeat(60));
  console.log("ADMIN: admin@dogm.ai / Admin123!");
  console.log("USER:  user@example.com / User123!");
  console.log("-".repeat(60));

  console.log("\nSAMPLE CERTIFICATES:");
  console.log(`- ${cert1.title} for ${cert1.recipientName}`);
  console.log(`  Public ID: ${cert1.publicId}`);
  console.log(`  Verification: ${cert1.verificationCode}`);
  console.log(`- ${cert2.title} for ${cert2.recipientName}`);
  console.log(`  Public ID: ${cert2.publicId}`);
  console.log(`- ${cert3.title} for ${cert3.recipientName}`);
  console.log(`  Public ID: ${cert3.publicId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
