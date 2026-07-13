import { describe, it, expect } from 'vitest';
import { exec, spawn } from '../src/utils/exec';

describe('exec', () => {
  it('executes a command and returns Buffer', () => {
    const result = exec('echo hello');
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString().trim()).toBe('hello');
  });

  it('returns string with encoding option', () => {
    const result = exec('echo hello', { encoding: 'utf8' });
    expect(typeof result).toBe('string');
    expect(result.trim()).toBe('hello');
  });

  it('throws on non-zero exit', () => {
    expect(() => exec('false')).toThrow();
  });
});

describe('spawn', () => {
  it('executes a command with args and returns Buffer', () => {
    const result = spawn('echo', ['hello']);
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString().trim()).toBe('hello');
  });

  it('returns string with encoding option', () => {
    const result = spawn('echo', ['hello'], { encoding: 'utf8' });
    expect(typeof result).toBe('string');
    expect(result.trim()).toBe('hello');
  });

  it('throws on non-zero exit', () => {
    expect(() => spawn('false', [])).toThrow();
  });
});
