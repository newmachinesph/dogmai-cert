import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock qrcode library
vi.mock("qrcode", () => ({
  default: {
    toDataURL: vi.fn(() => Promise.resolve("data:image/png;base64,mockqrcode")),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock canvas context for certificate rendering
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  lineCap: "butt",
  lineJoin: "miter",
  textAlign: "start",
  textBaseline: "alphabetic",
  font: "",
  globalAlpha: 1,
  scale: vi.fn(),
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  strokeRect: vi.fn(),
  fillText: vi.fn(),
  measureText: vi.fn(() => ({ width: 100 })),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  bezierCurveTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  roundRect: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,mock");

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
    readText: vi.fn(() => Promise.resolve("")),
  },
});

// Mock window.open
global.open = vi.fn();

// Mock Image constructor to properly trigger onload
class MockImage {
  width = 100;
  height = 100;
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor() {
    // Immediately trigger onload in next tick to simulate image loading
    setTimeout(() => {
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
}

global.Image = MockImage as unknown as typeof Image;

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
