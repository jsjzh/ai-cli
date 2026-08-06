import { describe, it, expect, vi, beforeEach } from 'vitest';
import { existsSync } from 'fs';
import path from 'path';

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return { ...actual, existsSync: vi.fn() };
});

describe('getHookPath', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
  });

  it('returns path when hook file exists', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    const { getHookPath } = await import('../src/utils/hook');
    expect(getHookPath('/root', 'git-pull', 'post')).toBe(
      path.join('/root', '.clihooks', 'post-git-pull'),
    );
    expect(existsSync).toHaveBeenCalledWith(path.join('/root', '.clihooks', 'post-git-pull'));
  });

  it('returns null when hook file missing', async () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const { getHookPath } = await import('../src/utils/hook');
    expect(getHookPath('/root', 'git-pull', 'pre')).toBeNull();
  });

  it('combines pre/post phase prefix', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    const { getHookPath } = await import('../src/utils/hook');
    expect(getHookPath('/root', 'git-push', 'pre')).toBe(
      path.join('/root', '.clihooks', 'pre-git-push'),
    );
  });
});
