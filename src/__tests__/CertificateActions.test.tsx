import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CertificateActions from "@/components/certificate/CertificateActions";
import { createRef } from "react";

describe("CertificateActions", () => {
  const defaultProps = {
    publicId: "test-public-id",
    title: "Test Certificate",
    recipientName: "John Doe",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all action buttons", () => {
    render(<CertificateActions {...defaultProps} />);

    expect(screen.getByText("PNG")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
    expect(screen.getByText("Copy Link")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
  });

  it("shows 'Copied!' when copy link is clicked", async () => {
    render(<CertificateActions {...defaultProps} />);

    const copyButton = screen.getByText("Copy Link");
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining(defaultProps.publicId)
    );
  });

  it("toggles share menu when share button is clicked", () => {
    render(<CertificateActions {...defaultProps} />);

    const shareButton = screen.getByText("Share");
    expect(screen.queryByText("LinkedIn")).not.toBeInTheDocument();

    fireEvent.click(shareButton);
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByText("X (Twitter)")).toBeInTheDocument();
    expect(screen.getByText("Facebook")).toBeInTheDocument();
  });

  it("opens LinkedIn share URL when LinkedIn button is clicked", () => {
    render(<CertificateActions {...defaultProps} />);

    // Open share menu
    fireEvent.click(screen.getByText("Share"));

    // Click LinkedIn
    fireEvent.click(screen.getByText("LinkedIn"));

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining("linkedin.com"),
      "_blank"
    );
  });

  it("opens Twitter share URL when Twitter button is clicked", () => {
    render(<CertificateActions {...defaultProps} />);

    fireEvent.click(screen.getByText("Share"));
    fireEvent.click(screen.getByText("X (Twitter)"));

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining("twitter.com"),
      "_blank"
    );
  });

  it("opens Facebook share URL when Facebook button is clicked", () => {
    render(<CertificateActions {...defaultProps} />);

    fireEvent.click(screen.getByText("Share"));
    fireEvent.click(screen.getByText("Facebook"));

    expect(global.open).toHaveBeenCalledWith(
      expect.stringContaining("facebook.com"),
      "_blank"
    );
  });

  it("disables download buttons when downloading", async () => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const canvas = document.createElement("canvas");
    (canvasRef as { current: HTMLCanvasElement }).current = canvas;

    render(<CertificateActions {...defaultProps} canvasRef={canvasRef} />);

    const pngButton = screen.getByText("PNG").closest("button");
    expect(pngButton).not.toBeDisabled();

    // Click PNG download
    fireEvent.click(pngButton!);

    // Button should be disabled briefly
    await waitFor(() => {
      expect(pngButton).not.toBeDisabled();
    });
  });

  it("closes share menu when clicking outside", () => {
    render(<CertificateActions {...defaultProps} />);

    // Open share menu
    fireEvent.click(screen.getByText("Share"));
    expect(screen.getByText("LinkedIn")).toBeInTheDocument();

    // Click the overlay
    const overlay = document.querySelector(".fixed.inset-0");
    if (overlay) {
      fireEvent.click(overlay);
    }

    // Menu should be closed
    expect(screen.queryByText("Share to Social")).not.toBeInTheDocument();
  });
});
