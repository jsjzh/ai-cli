import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'fs';

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return { ...actual, existsSync: vi.fn() };
});

describe('hasGitRepo', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
  });

  it('returns true when .git directory exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    const { hasGitRepo } = await import('../src/utils/git');
    expect(hasGitRepo('/some/project')).toBe(true);
    expect(existsSync).toHaveBeenCalledWith('/some/project/.git');
  });

  it('returns false when no .git directory', async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const { hasGitRepo } = await import('../src/utils/git');
    expect(hasGitRepo('/tmp')).toBe(false);
  });
});
