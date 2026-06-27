import { existsSync } from 'fs';
import path from 'path';

export function hasGitRepo(dir?: string): boolean {
  return existsSync(path.join(dir || process.cwd(), '.git'));
}
