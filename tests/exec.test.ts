import { describe, it, expect } from 'vitest';
import { exec, spawn, getErrorMessage } from '../src/utils/exec';

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

describe('getErrorMessage', () => {
  it('returns message from Error instance', () => {
    expect(getErrorMessage(new Error('something went wrong'))).toBe('something went wrong');
  });

  it('returns string value for string throws', () => {
    expect(getErrorMessage('oops')).toBe('oops');
  });

  it('returns string representation for non-Error objects', () => {
    expect(getErrorMessage({ code: 42 })).toBe('[object Object]');
  });

  it('returns "null" for null', () => {
    expect(getErrorMessage(null)).toBe('null');
  });
});
