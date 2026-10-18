import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique verification code for certificates
export function generateVerificationCode(): string {
  return nanoid(12).toUpperCase();
}

// Generate public ID for certificates
export function generatePublicId(): string {
  return nanoid(10);
}

// Format date for display
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Get app URL
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Generate certificate share URL
export function getCertificateUrl(publicId: string): string {
  return `${getAppUrl()}/c/${publicId}`;
}

// Generate certificate verification URL
export function getVerificationUrl(verificationCode: string): string {
  return `${getAppUrl()}/verify/${verificationCode}`;
}

// Generate social share URLs
export function getLinkedInShareUrl(certificateUrl: string, title: string): string {
  const params = new URLSearchParams({
    url: certificateUrl,
  });
  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

export function getTwitterShareUrl(certificateUrl: string, title: string, recipientName: string): string {
  const text = `I just earned my ${title}! Check it out:`;
  const params = new URLSearchParams({
    url: certificateUrl,
    text,
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getFacebookShareUrl(certificateUrl: string): string {
  const params = new URLSearchParams({
    u: certificateUrl,
  });
  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
}
