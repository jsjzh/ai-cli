import { exec } from '../../utils/exec';
import fs from 'fs';
import path from 'path';

export default async function sync() {
  try {
    const originalRegistry = exec('npm config get registry', { encoding: 'utf8' }).trim();
    const originalNode = exec('node --version', { encoding: 'utf8' }).trim();
    console.log(`当前 registry: ${originalRegistry}`);
    console.log(`当前 Node 版本: ${originalNode}`);

    const pkgPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(pkgPath)) {
      console.log('当前目录下未找到 package.json');
      return;
    }
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const allDeps = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];

    if (allDeps.length === 0) {
      console.log('未找到任何依赖');
      return;
    }

    console.log(`共 ${allDeps.length} 个依赖，开始分批 sync...`);

    const batchCommands: string[] = [];
    for (let i = 0; i < allDeps.length; i += 10) {
      const batch = allDeps.slice(i, i + 10);
      batchCommands.push(`snpm sync ${batch.join(' ')} &`);
    }

    const nodeVersion = originalNode.replace(/^v/, '');
    const script = `
source ~/.nvm/nvm.sh
nvm use 12 > /dev/null 2>&1
if ! command -v snpm &> /dev/null; then
  echo "未检测到 snpm，请执行: nvm use 12 && npm install -g snpm"
  exit 1
fi
npm config set registry http://registry.npm.souche-inc.com/
echo "已切换 registry"
${batchCommands.join('\n')}
wait
echo "所有依赖 sync 完成"
npm config set registry ${originalRegistry}
echo "已恢复 registry"
nvm use ${nodeVersion} > /dev/null 2>&1
echo "已恢复 Node 版本: ${nodeVersion}"
`.trim();

    exec(`bash -c '${script}'`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
