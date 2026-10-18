"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import CertificateCanvas, { CertificateData } from "@/components/certificate/CertificateCanvas";
import CertificateActions from "@/components/certificate/CertificateActions";
import { formatDate, getVerificationUrl } from "@/lib/utils";

interface CertificateViewerProps {
  certificate: CertificateData & {
    status: string;
    revokedAt?: string | Date | null;
    revokedReason?: string | null;
    expiresAt?: string | Date | null;
    _count?: {
      views: number;
      shares: number;
    };
  };
}

export default function CertificateViewer({ certificate }: CertificateViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  const handleCanvasReady = (canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    setCanvasReady(true);
  };

  const isRevoked = certificate.status === "REVOKED";
  const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
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
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 text-sm font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Verify
          </Link>
        </div>
      </header>

      <main className="py-8 px-4 sm:py-12">
        {/* Revoked/Expired Warning */}
        {(isRevoked || isExpired) && (
          <div className={`max-w-4xl mx-auto mb-6 rounded-xl p-4 flex items-start gap-3 animate-fade-in ${
            isRevoked ? "bg-red-50 border border-red-200" : "bg-yellow-50 border border-yellow-200"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isRevoked ? "bg-red-100" : "bg-yellow-100"
            }`}>
              <svg className={`w-5 h-5 ${isRevoked ? "text-red-600" : "text-yellow-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-semibold ${isRevoked ? "text-red-800" : "text-yellow-800"}`}>
                {isRevoked ? "Certificate Revoked" : "Certificate Expired"}
              </h3>
              <p className={`text-sm ${isRevoked ? "text-red-600" : "text-yellow-600"}`}>
                {isRevoked
                  ? certificate.revokedReason || "This certificate has been revoked and is no longer valid."
                  : "This certificate has expired and may no longer be valid."
                }
              </p>
            </div>
          </div>
        )}

        {/* Certificate Info Header */}
        <div className="max-w-4xl mx-auto text-center mb-8 animate-fade-in-up">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in"
            style={{
              backgroundColor: isRevoked ? "#fee2e2" : isExpired ? "#fef3c7" : "#dcfce7",
              color: isRevoked ? "#991b1b" : isExpired ? "#92400e" : "#166534",
            }}
          >
            <span className={`w-2 h-2 rounded-full ${
              isRevoked ? "bg-red-500" : isExpired ? "bg-yellow-500" : "bg-green-500 animate-pulse"
            }`}></span>
            {isRevoked ? "Revoked" : isExpired ? "Expired" : "Verified & Active"}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {certificate.title}
          </h1>
          <p className="text-lg text-gray-600">
            Awarded to <span className="font-semibold text-gray-900">{certificate.recipientName}</span>
          </p>
          {certificate.description && (
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{certificate.description}</p>
          )}
        </div>

        {/* Certificate Canvas */}
        <div className="max-w-5xl mx-auto mb-8 animate-fade-in-up stagger-2">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-4 sm:p-8 border border-gray-100 relative overflow-hidden">
            {/* Decorative corner elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-blue-50 to-transparent rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-purple-50 to-transparent rounded-tl-full"></div>

            <div className="relative">
              <CertificateCanvas
                data={certificate}
                scale={2}
                className="w-full"
                onReady={handleCanvasReady}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={`max-w-4xl mx-auto mb-10 transition-all duration-500 ${
          canvasReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}>
          <CertificateActions
            publicId={certificate.publicId}
            title={certificate.title}
            recipientName={certificate.recipientName}
            canvasRef={canvasRef}
          />
        </div>

        {/* Certificate Details */}
        <div className="max-w-2xl mx-auto animate-fade-in-up stagger-3">
          <div className="bg-white rounded-2xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Certificate Details
              </h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Issued Date */}
                <div className="group">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Issued On</span>
                  <p className="mt-1 font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(certificate.issuedAt)}
                  </p>
                </div>

                {/* Expiry Date */}
                {certificate.expiresAt && (
                  <div className="group">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Expires On</span>
                    <p className={`mt-1 font-semibold flex items-center gap-2 ${isExpired ? "text-yellow-600" : "text-gray-900"}`}>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatDate(certificate.expiresAt)}
                    </p>
                  </div>
                )}

                {/* Status */}
                <div className="group">
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</span>
                  <p className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      isRevoked
                        ? "bg-red-100 text-red-700"
                        : isExpired
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        isRevoked ? "bg-red-500" : isExpired ? "bg-yellow-500" : "bg-green-500"
                      }`}></span>
                      {isRevoked ? "Revoked" : isExpired ? "Expired" : certificate.status}
                    </span>
                  </p>
                </div>

                {/* Views & Shares */}
                {certificate._count && (
                  <div className="group">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Analytics</span>
                    <p className="mt-1 font-medium text-gray-900 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {certificate._count.views} views
                      </span>
                      <span className="flex items-center gap-1.5 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        {certificate._count.shares} shares
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Verification Code */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Verification Code</span>
                <div className="mt-2 flex items-center gap-3">
                  <code className="flex-1 px-4 py-3 bg-gray-50 rounded-lg font-mono text-sm text-gray-700 border border-gray-100">
                    {certificate.verificationCode}
                  </code>
                </div>
              </div>

              {/* Verification Link */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm text-gray-500 flex items-start gap-2">
                  <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>
                    Verify at:{" "}
                    <a
                      href={getVerificationUrl(certificate.verificationCode)}
                      className="text-blue-600 hover:text-blue-700 hover:underline break-all font-medium"
                    >
                      {getVerificationUrl(certificate.verificationCode)}
                    </a>
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            Powered by DOGM.AI Certificate Management
          </div>
        </div>
      </main>
    </div>
  );
}
