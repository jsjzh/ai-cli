import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { detectPackageManager, lockFiles, readPackageJson } from '../src/utils/node';

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return { ...actual, existsSync: vi.fn(), readFileSync: vi.fn() };
});

describe('detectPackageManager', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
  });

  it('returns pnpm when pnpm-lock.yaml exists', () => {
    vi.mocked(existsSync).mockImplementation(
      (p) => (p as string).endsWith('pnpm-lock.yaml'),
    );
    expect(detectPackageManager()).toBe('pnpm');
  });

  it('returns yarn when only yarn.lock exists', () => {
    vi.mocked(existsSync).mockImplementation(
      (p) => (p as string).endsWith('yarn.lock'),
    );
    expect(detectPackageManager()).toBe('yarn');
  });

  it('returns npm when no lock files exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(detectPackageManager()).toBe('npm');
  });
});

describe('lockFiles', () => {
  it('maps package managers to correct lock file names', () => {
    expect(lockFiles).toEqual({
      pnpm: 'pnpm-lock.yaml',
      yarn: 'yarn.lock',
      npm: 'package-lock.json',
    });
  });
});

describe('readPackageJson', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
    vi.mocked(readFileSync).mockReset();
  });

  it('returns parsed package.json when file exists', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('{ "name": "test", "scripts": { "dev": "node index.js" } }');
    const pkg = readPackageJson();
    expect(pkg).toEqual({ name: 'test', scripts: { dev: 'node index.js' } });
  });

  it('returns empty object when package.json does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    expect(readPackageJson()).toEqual({});
  });
});
