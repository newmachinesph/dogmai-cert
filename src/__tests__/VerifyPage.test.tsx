import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import VerifyPage from "@/app/verify/page";

// Mock router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("VerifyPage", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("renders the verification form", () => {
    render(<VerifyPage />);

    // Find the heading specifically (h2 element)
    expect(screen.getByRole("heading", { name: "Verify Certificate" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g., ABC123DEF456")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verify certificate/i })).toBeInTheDocument();
  });

  it("converts input to uppercase", () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "abc123" } });

    expect(input.value).toBe("ABC123");
  });

  it("prevents submission when code is empty (button disabled)", () => {
    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    // Button should be disabled when input is empty
    expect(submitButton).toBeDisabled();

    // Form submission is prevented by disabled button, not by error message
    fireEvent.click(submitButton);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates to verification result page on valid submission", async () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456");
    fireEvent.change(input, { target: { value: "TEST123456" } });

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify/TEST123456");
    });
  });

  it("trims whitespace from input", async () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456");
    fireEvent.change(input, { target: { value: "  TEST123  " } });

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/verify/TEST123");
    });
  });

  it("clears input when clear button is clicked", () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "TEST123" } });

    expect(input.value).toBe("TEST123");

    // Find and click the clear button (X icon)
    const clearButton = document.querySelector('button[type="button"]');
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(input.value).toBe("");
    }
  });

  it("has a link back to home", () => {
    render(<VerifyPage />);

    const homeLink = screen.getByText("Back to Home");
    expect(homeLink).toBeInTheDocument();
    expect(homeLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("disables submit button when input is empty", () => {
    render(<VerifyPage />);

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    expect(submitButton).toBeDisabled();
  });

  it("enables submit button when input has value", () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456");
    fireEvent.change(input, { target: { value: "TEST" } });

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    expect(submitButton).not.toBeDisabled();
  });

  it("shows loading state when submitting", async () => {
    render(<VerifyPage />);

    const input = screen.getByPlaceholderText("e.g., ABC123DEF456");
    fireEvent.change(input, { target: { value: "TEST123" } });

    const submitButton = screen.getByRole("button", { name: /verify certificate/i });
    fireEvent.click(submitButton);

    // Loading state shows briefly
    await waitFor(() => {
      expect(screen.getByText("Verifying...")).toBeInTheDocument();
    });
  });

  it("has proper heading structure", () => {
    render(<VerifyPage />);

    const mainHeading = screen.getByRole("heading", { level: 2 });
    expect(mainHeading).toHaveTextContent("Verify Certificate");
  });

  it("shows informational text about where to find the code", () => {
    render(<VerifyPage />);

    expect(
      screen.getByText(/verification code can be found on the certificate/i)
    ).toBeInTheDocument();
  });
});
