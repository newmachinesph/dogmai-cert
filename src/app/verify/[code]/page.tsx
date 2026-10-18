import { Metadata } from "next";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { formatDate, getCertificateUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ code: string }>;
}

async function getCertificateByCode(code: string) {
  return prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: {
      template: {
        select: {
          name: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { code } = await params;
  const certificate = await getCertificateByCode(code);

  if (!certificate) {
    return {
      title: "Verification Failed | DOGM.AI Certificates",
    };
  }

  return {
    title: `Verified: ${certificate.title} | DOGM.AI Certificates`,
    description: `Certificate verification for ${certificate.recipientName}`,
  };
}

export default async function VerifyResultPage({ params }: PageProps) {
  const { code } = await params;
  const certificate = await getCertificateByCode(code);

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  DOGM.AI Certificates
                </h1>
                <p className="text-xs text-gray-500">Digital Certificate Platform</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Not Found Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Verification Failed</h2>
              <p className="text-gray-600 mb-8">
                No certificate found with this verification code. Please check the code and try again.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/verify"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold"
                >
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const isValid = certificate.status === "ACTIVE";
  const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date();
  const isRevoked = certificate.status === "REVOKED";

  const statusConfig = {
    revoked: {
      bgGradient: "from-red-500 to-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      title: "Certificate Revoked",
      description: "This certificate has been revoked and is no longer valid.",
    },
    expired: {
      bgGradient: "from-yellow-500 to-orange-500",
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      title: "Certificate Expired",
      description: "This certificate has expired and may no longer be valid.",
    },
    valid: {
      bgGradient: "from-green-500 to-emerald-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Certificate Verified",
      description: "This certificate is authentic and valid.",
    },
  };

  const status = isRevoked ? "revoked" : isExpired ? "expired" : "valid";
  const config = statusConfig[status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                DOGM.AI Certificates
              </h1>
              <p className="text-xs text-gray-500">Digital Certificate Platform</p>
            </div>
          </Link>
          <Link
            href="/verify"
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Verify Another
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Status Banner */}
          <div className={`bg-gradient-to-r ${config.bgGradient} rounded-t-2xl p-8 text-center text-white animate-fade-in-up relative overflow-hidden`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="circles" width="20" height="20" patternUnits="userSpaceOnUse">
                    <circle cx="10" cy="10" r="2" fill="white"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#circles)" />
              </svg>
            </div>

            <div className="relative">
              <div className="mb-4">
                {isValid && !isExpired ? (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto animate-scale-in">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto animate-scale-in">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
              <p className="opacity-90">{config.description}</p>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="bg-white rounded-b-2xl shadow-xl shadow-gray-200/50 border border-gray-100 border-t-0 animate-fade-in-up stagger-2">
            {/* Certificate Title */}
            <div className="px-8 py-6 border-b border-gray-100 text-center">
              <h3 className="text-xl font-bold text-gray-900">{certificate.title}</h3>
            </div>

            {/* Details Grid */}
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Recipient */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Recipient</span>
                    <p className="font-semibold text-gray-900">{certificate.recipientName}</p>
                  </div>
                </div>

                {/* Issued Date */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Issued On</span>
                    <p className="font-semibold text-gray-900">{formatDate(certificate.issuedAt)}</p>
                  </div>
                </div>

                {/* Expires */}
                {certificate.expiresAt && (
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${isExpired ? "bg-yellow-100" : config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <svg className={`w-5 h-5 ${isExpired ? "text-yellow-600" : config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Expires On</span>
                      <p className={`font-semibold ${isExpired ? "text-yellow-600" : "text-gray-900"}`}>
                        {formatDate(certificate.expiresAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Template */}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Template</span>
                    <p className="font-semibold text-gray-900">{certificate.template.name}</p>
                  </div>
                </div>

                {/* Verification Code */}
                <div className="flex items-start gap-3 col-span-full">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Verification Code</span>
                    <code className="block mt-1 px-4 py-2 bg-gray-50 rounded-lg font-mono text-sm text-gray-700 border border-gray-100">
                      {certificate.verificationCode}
                    </code>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-3 col-span-full">
                  <div className={`w-10 h-10 ${config.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 ${config.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
                    <p className="mt-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                        isRevoked
                          ? "bg-red-100 text-red-700"
                          : isExpired
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          isRevoked ? "bg-red-500" : isExpired ? "bg-yellow-500" : "bg-green-500"
                        }`}></span>
                        {isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : certificate.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {certificate.description && (
                <div className="pt-6 border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Description</span>
                  <p className="mt-2 text-gray-600">{certificate.description}</p>
                </div>
              )}

              {/* Revocation Reason */}
              {certificate.revokedReason && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="text-sm font-semibold text-red-800">Revocation Reason</span>
                      <p className="text-sm text-red-700 mt-1">{certificate.revokedReason}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* View Certificate Button */}
              {isValid && !isExpired && (
                <div className="pt-6 border-t border-gray-100">
                  <Link
                    href={getCertificateUrl(certificate.publicId)}
                    className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Full Certificate
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Verified by DOGM.AI Certificate Management System
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
