import { describe, it, expect, vi, beforeEach } from 'vitest';
import { homedir } from 'os';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  getSSHDir,
  getConfigPath,
  getGSConfigPath,
  formatConfigLine,
  getActiveConfigs,
} from '../src/utils/gs-config';
import type { GSConfigItem } from '../src/utils/gs-config';

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
  };
});

describe('gs-config utilities', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
    vi.mocked(readFileSync).mockReset();
    vi.mocked(writeFileSync).mockReset();
  });

  describe('paths', () => {
    it('getSSHDir returns ~/.ssh', () => {
      expect(getSSHDir()).toBe(path.join(homedir(), '.ssh'));
    });

    it('getConfigPath returns ~/.ssh/config', () => {
      expect(getConfigPath()).toBe(path.join(homedir(), '.ssh', 'config'));
    });

    it('getGSConfigPath returns ~/.aiclirc', () => {
      expect(getGSConfigPath()).toBe(path.join(homedir(), '.aiclirc'));
    });
  });

  describe('formatConfigLine', () => {
    it('formats a config item as pipe-separated string', () => {
      const config: GSConfigItem = {
        origin: 'github',
        username: 'user',
        useremail: 'user@example.com',
        host: 'github.com',
        keyType: 'ed25519',
        publicKey: 'ssh-ed25519 AAA...',
        deleteTime: null,
      };
      expect(formatConfigLine(config)).toBe(
        'github | user | user@example.com | github.com | ed25519',
      );
    });
  });

  describe('getActiveConfigs', () => {
    it('filters out deleted configs', () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          gs: [
            { origin: 'active1', deleteTime: null },
            { origin: 'active2', deleteTime: null },
            { origin: 'deleted', deleteTime: '2025-01-01T00:00:00.000Z' },
            { origin: 'emptyString', deleteTime: '' },
          ],
        }),
      );

      const active = getActiveConfigs();
      expect(active).toHaveLength(2);
      expect(active.map((c: GSConfigItem) => c.origin)).toEqual([
        'active1',
        'active2',
      ]);
    });

    it('returns empty array when no config file', () => {
      vi.mocked(existsSync).mockReturnValue(false);
      expect(getActiveConfigs()).toEqual([]);
    });
  });
});
