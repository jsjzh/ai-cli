import { execSync } from 'child_process';
import { existsSync } from 'fs';

function detectPackageManager(): string {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

export default async function install() {
  const pm = detectPackageManager();
  const cmd = pm === 'yarn' ? 'yarn install' : `${pm} install`;

  console.log(`检测到包管理器: ${pm}`);
  console.log(`执行命令: ${cmd}\n`);

  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n依赖安装完成`);
  } catch (error) {
    console.error(`\n安装失败:`, (error as Error).message);
  }
}
