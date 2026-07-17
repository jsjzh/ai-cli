import { spawn, getErrorMessage } from '../../utils/exec';
import { detectPackageManager } from '../../utils/node';

export default async function install() {
  const pm = detectPackageManager();

  console.log(`检测到包管理器: ${pm}`);
  console.log(`执行命令: ${pm} install\n`);

  try {
    spawn(pm, ['install'], { stdio: 'inherit' });
    console.log(`\n依赖安装完成`);
  } catch (error) {
    console.error(`\n安装失败:`, getErrorMessage(error));
  }
}
