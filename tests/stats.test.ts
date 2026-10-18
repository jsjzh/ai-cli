import { describe, it, expect } from 'vitest';
import { nextStats } from '../src/utils/stats';
import type { Stats } from '../src/utils/stats';

const T1 = '2026-01-01T00:00:00.000Z';
const T2 = '2026-01-02T00:00:00.000Z';
const T3 = '2026-01-03T00:00:00.000Z';

describe('nextStats', () => {
  it('首次调用初始化所有字段', () => {
    expect(nextStats(undefined, 'git', T1)).toEqual({
      total: 1,
      firstAt: T1,
      lastAt: T1,
      byCommand: { git: 1 },
    });
  });

  it('累加 total 与对应命令计数', () => {
    const prev: Stats = {
      total: 3,
      firstAt: T1,
      lastAt: T2,
      byCommand: { git: 2, menu: 1 },
    };
    const next = nextStats(prev, 'git', T3);
    expect(next.total).toBe(4);
    expect(next.byCommand).toEqual({ git: 3, menu: 1 });
  });

  it('保留 firstAt，更新 lastAt', () => {
    const prev: Stats = { total: 1, firstAt: T1, lastAt: T1, byCommand: {} };
    const next = nextStats(prev, 'node', T3);
    expect(next.firstAt).toBe(T1);
    expect(next.lastAt).toBe(T3);
  });

  it('新命令追加到 byCommand', () => {
    const prev: Stats = {
      total: 1,
      firstAt: T1,
      lastAt: T1,
      byCommand: { git: 1 },
    };
    expect(nextStats(prev, 'node', T2).byCommand).toEqual({ git: 1, node: 1 });
  });

  it('缺字段的旧数据容错', () => {
    expect(nextStats({} as Partial<Stats>, 'menu', T1)).toEqual({
      total: 1,
      firstAt: T1,
      lastAt: T1,
      byCommand: { menu: 1 },
    });
  });
});