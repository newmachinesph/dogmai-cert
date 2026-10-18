"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { formatDate, getCertificateUrl } from "@/lib/utils";
import QRCode from "qrcode";

export interface CertificateData {
  id: string;
  publicId: string;
  title: string;
  recipientName: string;
  recipientEmail?: string | null;
  description?: string | null;
  issuedAt: string | Date;
  verificationCode: string;
  customFields?: Record<string, string> | null;
  template: {
    width: number;
    height: number;
    orientation: string;
    backgroundColor?: string | null;
    backgroundImage?: string | null;
    layoutConfig: string;
    styleConfig: string;
  };
  signatures?: Array<{
    id: string;
    name: string;
    title?: string | null;
    organization?: string | null;
    imageUrl: string;
  }>;
}

interface LayoutConfig {
  title?: { x: number; y: number; fontSize: number; fontWeight: string; color: string; textAlign: string };
  recipientName?: { x: number; y: number; fontSize: number; fontWeight: string; color: string; textAlign: string };
  description?: { x: number; y: number; fontSize: number; color: string; textAlign: string; maxWidth: number };
  date?: { x: number; y: number; fontSize: number; color: string; textAlign: string };
  verificationCode?: { x: number; y: number; fontSize: number; color: string; textAlign: string };
  signatures?: Array<{ x: number; y: number; width: number; height: number }>;
}

interface StyleConfig {
  fontFamily?: string;
  titleFontFamily?: string;
  bodyFontFamily?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  borderColor?: string;
}

interface CertificateCanvasProps {
  data: CertificateData;
  scale?: number;
  className?: string;
  onReady?: (canvas: HTMLCanvasElement) => void;
}

// Font configurations
const FONTS = {
  title: '"Playfair Display", Georgia, "Times New Roman", serif',
  body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

// Modern gradient color scheme
const COLORS = {
  gradientStart: "#667eea",
  gradientMiddle: "#764ba2",
  gradientEnd: "#f093fb",
  darkText: "#1a1a2e",
  lightText: "#ffffff",
  subtleText: "#6b7280",
  mutedText: "#9ca3af",
  accent: "#667eea",
  accentLight: "#818cf8",
  gold: "#fbbf24",
  border: "#e5e7eb",
};

// Default signatories when none provided
const DEFAULT_SIGNATORIES = [
  { name: "Program Director", title: "Director of Programs", organization: "DOGM.AI" },
  { name: "Executive Director", title: "Chief Executive Officer", organization: "DOGM.AI" },
];

export default function CertificateCanvas({
  data,
  scale = 1,
  className = "",
  onReady,
}: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const drawCertificate = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { template } = data;
    const layoutConfig: LayoutConfig = JSON.parse(template.layoutConfig);
    const styleConfig: StyleConfig = JSON.parse(template.styleConfig);

    // Set canvas size
    canvas.width = template.width * scale;
    canvas.height = template.height * scale;

    // Scale context
    ctx.scale(scale, scale);

    // Clear canvas
    ctx.clearRect(0, 0, template.width, template.height);

    // Font families
    const titleFont = styleConfig.titleFontFamily || FONTS.title;
    const bodyFont = styleConfig.bodyFontFamily || FONTS.body;

    const width = template.width;
    const height = template.height;

    // ==================== BACKGROUND ====================
    // Main white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Top gradient header bar
    const headerHeight = 140;
    const headerGradient = ctx.createLinearGradient(0, 0, width, 0);
    headerGradient.addColorStop(0, COLORS.gradientStart);
    headerGradient.addColorStop(0.5, COLORS.gradientMiddle);
    headerGradient.addColorStop(1, COLORS.gradientEnd);
    ctx.fillStyle = headerGradient;
    ctx.fillRect(0, 0, width, headerHeight);

    // Subtle wave pattern on header
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < width; i += 60) {
      ctx.beginPath();
      ctx.arc(i, headerHeight, 30, 0, Math.PI, true);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Bottom gradient footer bar
    const footerHeight = 50;
    const footerGradient = ctx.createLinearGradient(0, 0, width, 0);
    footerGradient.addColorStop(0, COLORS.gradientStart);
    footerGradient.addColorStop(0.5, COLORS.gradientMiddle);
    footerGradient.addColorStop(1, COLORS.gradientEnd);
    ctx.fillStyle = footerGradient;
    ctx.fillRect(0, height - footerHeight, width, footerHeight);

    // Left accent stripe
    const stripeWidth = 6;
    const stripeGradient = ctx.createLinearGradient(0, 0, 0, height);
    stripeGradient.addColorStop(0, COLORS.gradientStart);
    stripeGradient.addColorStop(0.5, COLORS.gradientMiddle);
    stripeGradient.addColorStop(1, COLORS.gradientEnd);
    ctx.fillStyle = stripeGradient;
    ctx.fillRect(0, 0, stripeWidth, height);

    // Right accent stripe
    ctx.fillStyle = stripeGradient;
    ctx.fillRect(width - stripeWidth, 0, stripeWidth, height);

    // ==================== HEADER CONTENT ====================
    // Certificate text in header
    ctx.font = `300 14px ${bodyFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CERTIFICATE OF", width / 2, 50);

    // Main title in header
    const certType = data.title.toUpperCase().replace("CERTIFICATE OF ", "");
    ctx.font = `700 32px ${titleFont}`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(certType, width / 2, 90);

    // ==================== PRESENTED TO ====================
    ctx.font = `400 13px ${bodyFont}`;
    ctx.fillStyle = COLORS.subtleText;
    ctx.textAlign = "center";
    ctx.fillText("This certificate is proudly presented to", width / 2, 190);

    // ==================== RECIPIENT NAME ====================
    const recipientY = layoutConfig.recipientName?.y || 250;
    const recipientFontSize = layoutConfig.recipientName?.fontSize || 48;

    ctx.font = `700 ${recipientFontSize}px ${titleFont}`;
    ctx.fillStyle = COLORS.darkText;
    ctx.textAlign = "center";
    ctx.fillText(data.recipientName, width / 2, recipientY);

    // Elegant underline under name
    const underlineY = recipientY + 25;
    const nameWidth = ctx.measureText(data.recipientName).width;
    const underlineWidth = Math.min(nameWidth + 60, 450);

    // Gradient underline
    const underlineGradient = ctx.createLinearGradient(
      width / 2 - underlineWidth / 2,
      underlineY,
      width / 2 + underlineWidth / 2,
      underlineY
    );
    underlineGradient.addColorStop(0, "transparent");
    underlineGradient.addColorStop(0.15, COLORS.accent);
    underlineGradient.addColorStop(0.5, COLORS.gradientMiddle);
    underlineGradient.addColorStop(0.85, COLORS.accent);
    underlineGradient.addColorStop(1, "transparent");

    ctx.strokeStyle = underlineGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - underlineWidth / 2, underlineY);
    ctx.lineTo(width / 2 + underlineWidth / 2, underlineY);
    ctx.stroke();

    // ==================== COMPLETION TEXT ====================
    ctx.font = `400 13px ${bodyFont}`;
    ctx.fillStyle = COLORS.subtleText;
    ctx.textAlign = "center";
    ctx.fillText("for successfully completing", width / 2, recipientY + 55);

    // ==================== DESCRIPTION ====================
    if (data.description) {
      const descY = layoutConfig.description?.y || 340;
      const maxWidth = layoutConfig.description?.maxWidth || 650;

      ctx.font = `500 16px ${bodyFont}`;
      ctx.fillStyle = COLORS.darkText;
      ctx.textAlign = "center";

      // Word wrap
      const words = data.description.split(" ");
      let line = "";
      let lineY = descY;
      const lineHeight = 26;

      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), width / 2, lineY);
          line = word + " ";
          lineY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), width / 2, lineY);
    }

    // ==================== DATE ====================
    const dateY = layoutConfig.date?.y || 420;
    ctx.font = `400 12px ${bodyFont}`;
    ctx.fillStyle = COLORS.mutedText;
    ctx.textAlign = "center";
    ctx.fillText(`Issued on ${formatDate(data.issuedAt)}`, width / 2, dateY);

    // ==================== SIGNATURES (Always 2) ====================
    const sigY = 520;
    const sigSpacing = 320;
    const sigStartX = width / 2 - sigSpacing / 2;

    // Get signatures - use provided ones or defaults
    const signatures = data.signatures && data.signatures.length >= 2
      ? data.signatures.slice(0, 2)
      : data.signatures && data.signatures.length === 1
        ? [data.signatures[0], { ...DEFAULT_SIGNATORIES[1], id: "default-2", imageUrl: "" }]
        : DEFAULT_SIGNATORIES.map((s, i) => ({ ...s, id: `default-${i}`, imageUrl: "" }));

    for (let i = 0; i < 2; i++) {
      const sig = signatures[i];
      const sigX = sigStartX + i * sigSpacing;
      const sigLayout = layoutConfig.signatures?.[i];

      // Load signature image if available
      if (sig.imageUrl) {
        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = sig.imageUrl;
          });
          const imgWidth = sigLayout?.width || 100;
          const imgHeight = sigLayout?.height || 50;
          ctx.drawImage(img, sigX - imgWidth / 2, sigY - imgHeight - 5, imgWidth, imgHeight);
        } catch (e) {
          console.warn("Failed to load signature image:", e);
        }
      }

      // Signature line
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sigX - 80, sigY);
      ctx.lineTo(sigX + 80, sigY);
      ctx.stroke();

      // Signer name
      ctx.font = `600 14px ${bodyFont}`;
      ctx.fillStyle = COLORS.darkText;
      ctx.textAlign = "center";
      ctx.fillText(sig.name, sigX, sigY + 22);

      // Signer title
      if (sig.title) {
        ctx.font = `400 11px ${bodyFont}`;
        ctx.fillStyle = COLORS.subtleText;
        ctx.fillText(sig.title, sigX, sigY + 40);
      }

      // Organization
      if (sig.organization) {
        ctx.font = `italic 10px ${bodyFont}`;
        ctx.fillStyle = COLORS.mutedText;
        ctx.fillText(sig.organization, sigX, sigY + 55);
      }
    }

    // ==================== QR CODE ====================
    const qrSize = 70;
    const qrX = width - qrSize - 35;
    const qrY = height - footerHeight - qrSize - 25;

    try {
      const verifyUrl = getCertificateUrl(data.publicId);
      const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
        width: qrSize * 2,
        margin: 0,
        color: {
          dark: COLORS.darkText,
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      const qrImage = new Image();
      await new Promise<void>((resolve, reject) => {
        qrImage.onload = () => resolve();
        qrImage.onerror = reject;
        qrImage.src = qrDataUrl;
      });

      // QR code background with rounded corners
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      const cornerRadius = 6;
      const padding = 6;
      ctx.roundRect(
        qrX - padding,
        qrY - padding,
        qrSize + padding * 2,
        qrSize + padding * 2,
        cornerRadius
      );
      ctx.fill();

      // Subtle border
      ctx.strokeStyle = COLORS.border;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw QR code
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // QR label
      ctx.font = `500 8px ${bodyFont}`;
      ctx.fillStyle = COLORS.mutedText;
      ctx.textAlign = "center";
      ctx.fillText("SCAN TO VERIFY", qrX + qrSize / 2, qrY + qrSize + 14);
    } catch (e) {
      console.warn("Failed to generate QR code:", e);
    }

    // ==================== VERIFICATION CODE (left side) ====================
    const verifyCodeY = height - footerHeight - 45;
    ctx.font = `500 10px ${FONTS.mono}`;
    ctx.fillStyle = COLORS.mutedText;
    ctx.textAlign = "left";
    ctx.fillText(`ID: ${data.verificationCode}`, 35, verifyCodeY);

    // ==================== FOOTER CONTENT ====================
    const footerY = height - footerHeight / 2;

    // Branding on left
    ctx.font = `600 11px ${bodyFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.textAlign = "left";
    ctx.fillText("DOGM.AI Certificates", 25, footerY + 4);

    // Website on right
    ctx.font = `400 10px ${bodyFont}`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.textAlign = "right";
    ctx.fillText("www.dogm.ai", width - 25, footerY + 4);

    setIsLoaded(true);
    if (onReady && canvas) {
      onReady(canvas);
    }
  }, [data, scale, onReady]);

  useEffect(() => {
    drawCertificate();
  }, [drawCertificate]);

  return (
    <div className={`certificate-canvas-container ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="spinner mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Generating certificate...</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`certificate-canvas ${isLoaded ? "loaded" : "loading"}`}
        style={{
          maxWidth: "100%",
          height: "auto",
        }}
      />
    </div>
  );
}
