"use client";

import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import {
  getCertificateUrl,
  getLinkedInShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
} from "@/lib/utils";

interface CertificateActionsProps {
  publicId: string;
  title: string;
  recipientName: string;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function CertificateActions({
  publicId,
  title,
  recipientName,
  canvasRef,
}: CertificateActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadType, setDownloadType] = useState<"png" | "pdf" | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const certificateUrl = getCertificateUrl(publicId);

  const downloadAsImage = useCallback(async () => {
    if (!canvasRef?.current) return;

    setIsDownloading(true);
    setDownloadType("png");
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");
      link.download = `certificate-${recipientName.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download image:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  }, [canvasRef, recipientName]);

  const downloadAsPDF = useCallback(async () => {
    if (!canvasRef?.current) return;

    setIsDownloading(true);
    setDownloadType("pdf");
    try {
      const canvas = canvasRef.current;
      const imgData = canvas.toDataURL("image/png", 1.0);

      const pdfWidth = 297;
      const pdfHeight = 210;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${recipientName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setIsDownloading(false);
      setDownloadType(null);
    }
  }, [canvasRef, recipientName]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(certificateUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [certificateUrl]);

  const shareToLinkedIn = useCallback(() => {
    window.open(getLinkedInShareUrl(certificateUrl, title), "_blank");
    setShowShareMenu(false);
  }, [certificateUrl, title]);

  const shareToTwitter = useCallback(() => {
    window.open(getTwitterShareUrl(certificateUrl, title, recipientName), "_blank");
    setShowShareMenu(false);
  }, [certificateUrl, title, recipientName]);

  const shareToFacebook = useCallback(() => {
    window.open(getFacebookShareUrl(certificateUrl), "_blank");
    setShowShareMenu(false);
  }, [certificateUrl]);

  return (
    <div className="certificate-actions">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        {/* Download Buttons Group */}
        <div className="flex gap-2">
          {/* PNG Download */}
          <button
            onClick={downloadAsImage}
            disabled={isDownloading}
            className="group relative px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center gap-2"
          >
            {isDownloading && downloadType === "png" ? (
              <div className="spinner-sm border-white/30 border-t-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
            <span>PNG</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity"></span>
          </button>

          {/* PDF Download */}
          <button
            onClick={downloadAsPDF}
            disabled={isDownloading}
            className="group relative px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 flex items-center gap-2"
          >
            {isDownloading && downloadType === "pdf" ? (
              <div className="spinner-sm border-white/30 border-t-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            <span>PDF</span>
          </button>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-gray-200"></div>

        {/* Share Actions Group */}
        <div className="flex gap-2 items-center">
          {/* Copy Link */}
          <button
            onClick={copyLink}
            className={`group px-5 py-3 rounded-xl transition-all duration-200 font-semibold flex items-center gap-2 ${
              copied
                ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5"
            }`}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span>Copy Link</span>
              </>
            )}
          </button>

          {/* Share Menu */}
          <div className="relative">
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
              <svg className={`w-4 h-4 transition-transform ${showShareMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Share Dropdown */}
            {showShareMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowShareMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in origin-top-right">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Share to Social
                  </div>

                  {/* LinkedIn */}
                  <button
                    onClick={shareToLinkedIn}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 bg-[#0077b5] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">LinkedIn</div>
                      <div className="text-xs text-gray-500">Share to your network</div>
                    </div>
                  </button>

                  {/* Twitter/X */}
                  <button
                    onClick={shareToTwitter}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 bg-black rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">X (Twitter)</div>
                      <div className="text-xs text-gray-500">Post your achievement</div>
                    </div>
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={shareToFacebook}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-9 h-9 bg-[#1877f2] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Facebook</div>
                      <div className="text-xs text-gray-500">Share with friends</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
