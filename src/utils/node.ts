import { existsSync, readFileSync } from 'fs';
import path from 'path';

export const lockFiles: Record<string, string> = {
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
};

export function detectPackageManager(): string {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

export function readPackageJson(): Record<string, any> {
  const pkgPath = path.join(process.cwd(), 'package.json');
  if (!existsSync(pkgPath)) return {};
  return JSON.parse(readFileSync(pkgPath, 'utf8'));
}
