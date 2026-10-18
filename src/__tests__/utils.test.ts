import { describe, it, expect } from "vitest";
import {
  cn,
  generateVerificationCode,
  generatePublicId,
  formatDate,
  getAppUrl,
  getCertificateUrl,
  getVerificationUrl,
  getLinkedInShareUrl,
  getTwitterShareUrl,
  getFacebookShareUrl,
} from "@/lib/utils";

describe("Utils", () => {
  describe("cn (classnames)", () => {
    it("should merge class names correctly", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should handle conditional classes", () => {
      expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
    });

    it("should merge conflicting Tailwind classes", () => {
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should handle undefined and null values", () => {
      expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
    });

    it("should handle arrays", () => {
      expect(cn(["foo", "bar"])).toBe("foo bar");
    });
  });

  describe("generateVerificationCode", () => {
    it("should generate a 12-character uppercase code", () => {
      const code = generateVerificationCode();
      expect(code).toHaveLength(12);
      expect(code).toBe(code.toUpperCase());
    });

    it("should generate unique codes", () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateVerificationCode());
      }
      expect(codes.size).toBe(100);
    });
  });

  describe("generatePublicId", () => {
    it("should generate a 10-character ID", () => {
      const id = generatePublicId();
      expect(id).toHaveLength(10);
    });

    it("should generate unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generatePublicId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe("formatDate", () => {
    it("should format a Date object correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toBe("January 15, 2024");
    });

    it("should format a date string correctly", () => {
      const formatted = formatDate("2024-06-20");
      expect(formatted).toBe("June 20, 2024");
    });

    it("should handle ISO date strings", () => {
      const formatted = formatDate("2024-12-25T00:00:00.000Z");
      expect(formatted).toContain("December");
      expect(formatted).toContain("2024");
    });
  });

  describe("getAppUrl", () => {
    it("should return localhost as default", () => {
      const url = getAppUrl();
      expect(url).toBe("http://localhost:3000");
    });
  });

  describe("getCertificateUrl", () => {
    it("should generate correct certificate URL", () => {
      const url = getCertificateUrl("abc123");
      expect(url).toContain("/c/abc123");
    });
  });

  describe("getVerificationUrl", () => {
    it("should generate correct verification URL", () => {
      const url = getVerificationUrl("VERIFY123");
      expect(url).toContain("/verify/VERIFY123");
    });
  });

  describe("Social Share URLs", () => {
    const testUrl = "https://example.com/c/test123";
    const testTitle = "Test Certificate";
    const testName = "John Doe";

    describe("getLinkedInShareUrl", () => {
      it("should generate valid LinkedIn share URL", () => {
        const url = getLinkedInShareUrl(testUrl, testTitle);
        expect(url).toContain("linkedin.com/sharing/share-offsite");
        expect(url).toContain(encodeURIComponent(testUrl));
      });
    });

    describe("getTwitterShareUrl", () => {
      it("should generate valid Twitter share URL", () => {
        const url = getTwitterShareUrl(testUrl, testTitle, testName);
        expect(url).toContain("twitter.com/intent/tweet");
        expect(url).toContain(encodeURIComponent(testUrl));
      });
    });

    describe("getFacebookShareUrl", () => {
      it("should generate valid Facebook share URL", () => {
        const url = getFacebookShareUrl(testUrl);
        expect(url).toContain("facebook.com/sharer/sharer.php");
        expect(url).toContain(encodeURIComponent(testUrl));
      });
    });
  });
});
