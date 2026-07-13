import inquirer from 'inquirer';
import { exec } from '../../utils/exec';
import fs from 'fs';
import path from 'path';

export default async function nvm() {
  const nvmrcPath = path.join(process.cwd(), '.nvmrc');
  let defaultVersion = '';

  if (fs.existsSync(nvmrcPath)) {
    defaultVersion = fs.readFileSync(nvmrcPath, 'utf8').trim();
    console.log(`检测到 .nvmrc: ${defaultVersion}`);
  }

  const { version } = await inquirer.prompt([
    {
      type: 'input',
      name: 'version',
      message: '请输入 Node 版本 (留空使用 .nvmrc 或当前版本):',
      default: defaultVersion || undefined,
    },
  ]);

  const targetVersion = version || defaultVersion;

  if (!targetVersion) {
    console.log('当前 Node 版本:');
    exec('node --version', { stdio: 'inherit' });
    return;
  }

  try {
    exec(`source ~/.nvm/nvm.sh && nvm use ${targetVersion}`, {
      stdio: 'inherit',
      encoding: 'utf8',
    });
  } catch {
    console.log(`本地未安装 Node ${targetVersion}，尝试安装...`);
    exec(`source ~/.nvm/nvm.sh && nvm install ${targetVersion} && nvm use ${targetVersion}`, {
      stdio: 'inherit',
      encoding: 'utf8',
    });
  }
}
