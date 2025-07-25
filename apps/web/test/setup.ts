import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js modules
vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: vi.fn(),
    }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock crypto for Node.js environment
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  } as Crypto;
}
