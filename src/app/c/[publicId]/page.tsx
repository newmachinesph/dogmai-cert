import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import CertificateViewer from "./CertificateViewer";
import { getCertificateUrl, getAppUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ publicId: string }>;
}

async function getCertificate(publicId: string) {
  const certificate = await prisma.certificate.findUnique({
    where: { publicId },
    include: {
      template: true,
      user: {
        select: {
          id: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!certificate) return null;

  // Get signatures
  let signatures: Array<{
    id: string;
    name: string;
    title: string | null;
    organization: string | null;
    imageUrl: string;
  }> = [];

  if (certificate.signatureIds) {
    const signatureIds = JSON.parse(certificate.signatureIds) as string[];
    signatures = await prisma.signature.findMany({
      where: { id: { in: signatureIds } },
      select: {
        id: true,
        name: true,
        title: true,
        organization: true,
        imageUrl: true,
      },
    });
  }

  return {
    ...certificate,
    signatures,
    customFields: certificate.customFields ? JSON.parse(certificate.customFields) : null,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { publicId } = await params;
  const certificate = await getCertificate(publicId);

  if (!certificate) {
    return {
      title: "Certificate Not Found",
    };
  }

  const title = `${certificate.title} - ${certificate.recipientName}`;
  const description = certificate.description || `Certificate awarded to ${certificate.recipientName}`;
  const url = getCertificateUrl(publicId);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: certificate.imageUrl ? [certificate.imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: certificate.imageUrl ? [certificate.imageUrl] : [],
    },
  };
}

export default async function CertificatePage({ params }: PageProps) {
  const { publicId } = await params;
  const certificate = await getCertificate(publicId);

  if (!certificate) {
    notFound();
  }

  if (certificate.status === "REVOKED") {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Revoked</h1>
          <p className="text-gray-600">
            This certificate has been revoked and is no longer valid.
          </p>
          {certificate.revokedReason && (
            <p className="text-sm text-gray-500 mt-4">
              Reason: {certificate.revokedReason}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <CertificateViewer certificate={certificate} />
    </div>
  );
}
