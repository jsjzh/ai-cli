import { spawn } from '../../utils/exec.js';
import { detectPackageManager } from '../../utils/node.js';

export default async function install() {
  const pm = detectPackageManager();
  const cmd = pm === 'yarn' ? 'yarn' : pm;

  console.log(`检测到包管理器: ${pm}`);
  console.log(`执行命令: ${cmd} install\n`);

  try {
    spawn(cmd, ['install'], { stdio: 'inherit' });
    console.log(`\n依赖安装完成`);
  } catch (error) {
    console.error(`\n安装失败:`, (error as Error).message);
  }
}
