import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { detectPackageManager } from '../../utils/node';

export default async function install() {
  const pm = detectPackageManager();

  console.log(pc.cyan(`▶ 检测到包管理器: ${pm}`));

  try {
    console.log(pc.cyan(`▶ 执行: ${pm} install`));
    spawn(pm, ['install'], { stdio: 'inherit' });
    console.log(pc.green(`\n✔ 依赖安装完成`));
  } catch (error) {
    console.error(pc.red(`\n✖ 安装失败:`), getErrorMessage(error));
  }
}
