import { describe, it, expect, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import CertificateCanvas, { CertificateData } from "@/components/certificate/CertificateCanvas";

const mockCertificateData: CertificateData = {
  id: "test-id",
  publicId: "test-public-id",
  title: "Test Certificate",
  recipientName: "John Doe",
  recipientEmail: "john@example.com",
  description: "This is a test certificate for demonstrating the canvas rendering.",
  issuedAt: "2024-01-15T00:00:00.000Z",
  verificationCode: "TEST123456",
  customFields: null,
  template: {
    width: 1056,
    height: 816,
    orientation: "landscape",
    backgroundColor: "#ffffff",
    backgroundImage: null,
    layoutConfig: JSON.stringify({
      title: { x: 528, y: 120, fontSize: 42, fontWeight: "bold", color: "#1e3a5f", textAlign: "center" },
      recipientName: { x: 528, y: 260, fontSize: 48, fontWeight: "bold", color: "#1e3a5f", textAlign: "center" },
      description: { x: 528, y: 360, fontSize: 16, color: "#4a5568", textAlign: "center", maxWidth: 600 },
      date: { x: 528, y: 700, fontSize: 14, color: "#4a5568", textAlign: "center" },
      verificationCode: { x: 528, y: 750, fontSize: 12, color: "#94a3b8", textAlign: "center" },
      border: { width: 3, color: "#d4af37", padding: 30 },
      signatures: [{ x: 200, y: 550, width: 150, height: 80 }],
    }),
    styleConfig: JSON.stringify({
      fontFamily: "Georgia, serif",
      primaryColor: "#1e3a5f",
      secondaryColor: "#4a5568",
      accentColor: "#d4af37",
    }),
  },
  signatures: [],
};

describe("CertificateCanvas", () => {
  it("renders a canvas element", () => {
    render(<CertificateCanvas data={mockCertificateData} />);

    const canvas = document.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders canvas with correct dimensions based on template", async () => {
    render(<CertificateCanvas data={mockCertificateData} scale={1} />);

    await waitFor(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      expect(canvas.width).toBe(1056);
      expect(canvas.height).toBe(816);
    });
  });

  it("applies custom className", () => {
    render(<CertificateCanvas data={mockCertificateData} className="custom-class" />);

    const container = document.querySelector(".certificate-canvas-container");
    expect(container).toHaveClass("custom-class");
  });

  it("calls onReady callback when canvas is ready", async () => {
    const onReady = vi.fn();

    render(<CertificateCanvas data={mockCertificateData} onReady={onReady} />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });

    expect(onReady).toHaveBeenCalledWith(expect.any(HTMLCanvasElement));
  });

  it("scales canvas dimensions correctly with scale prop", async () => {
    render(<CertificateCanvas data={mockCertificateData} scale={2} />);

    await waitFor(() => {
      const canvas = document.querySelector("canvas") as HTMLCanvasElement;
      expect(canvas.width).toBe(2112); // 1056 * 2
      expect(canvas.height).toBe(1632); // 816 * 2
    });
  });

  it("has responsive styling with max-width", () => {
    render(<CertificateCanvas data={mockCertificateData} />);

    const canvas = document.querySelector("canvas");
    expect(canvas).toHaveStyle({ maxWidth: "100%" });
    expect(canvas).toHaveStyle({ height: "auto" });
  });

  it("transitions to loaded state after rendering", async () => {
    render(<CertificateCanvas data={mockCertificateData} />);

    await waitFor(() => {
      const canvas = document.querySelector("canvas");
      expect(canvas).toHaveClass("loaded");
    });
  });

  it("handles certificates with signatures", async () => {
    const dataWithSignatures: CertificateData = {
      ...mockCertificateData,
      signatures: [
        {
          id: "sig-1",
          name: "Jane Smith",
          title: "Director",
          organization: "DOGM.AI",
          imageUrl: "https://example.com/signature.png",
        },
      ],
    };

    const onReady = vi.fn();
    render(<CertificateCanvas data={dataWithSignatures} onReady={onReady} />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });

  it("handles certificates without description", async () => {
    const dataWithoutDescription: CertificateData = {
      ...mockCertificateData,
      description: null,
    };

    const onReady = vi.fn();
    render(<CertificateCanvas data={dataWithoutDescription} onReady={onReady} />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });

  it("handles custom styleConfig with dual fonts", async () => {
    const dataWithCustomFonts: CertificateData = {
      ...mockCertificateData,
      template: {
        ...mockCertificateData.template,
        styleConfig: JSON.stringify({
          titleFontFamily: '"Playfair Display", serif',
          bodyFontFamily: '"Inter", sans-serif',
          primaryColor: "#000000",
          secondaryColor: "#666666",
          accentColor: "#gold",
        }),
      },
    };

    const onReady = vi.fn();
    render(<CertificateCanvas data={dataWithCustomFonts} onReady={onReady} />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalled();
    });
  });

  it("renders container with correct structure", () => {
    render(<CertificateCanvas data={mockCertificateData} />);

    const container = document.querySelector(".certificate-canvas-container");
    expect(container).toBeInTheDocument();

    const canvas = container?.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });
});
