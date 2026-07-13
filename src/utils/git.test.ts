import { describe, it, expect } from 'vitest';
import { hasGitRepo } from './git';

describe('hasGitRepo', () => {
  it('should return false when no .git directory', () => {
    expect(hasGitRepo('/tmp')).toBe(false);
  });
});
