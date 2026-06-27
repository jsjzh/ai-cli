import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

const SSH_DIR = path.join(homedir(), '.ssh');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export default async function use() {
  if (!existsSync(GS_CONFIG_PATH)) {
    console.log('暂无 SSH 配置');
    return;
  }

  const configs = JSON.parse(readFileSync(GS_CONFIG_PATH, 'utf8'));
  const activeConfigs = configs.filter((c: any) => !c.deleteTime);

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const { config } = await inquirer.prompt([
    {
      type: 'list',
      name: 'config',
      message: '请选择要使用的 SSH 配置:',
      choices: activeConfigs.map((c: any) => ({
        name: `${c.origin} | ${c.username} | ${c.useremail} | ${c.host} | ${c.keyType}`,
        value: c,
      })),
    },
  ]);

  const hasGit = existsSync(path.join(process.cwd(), '.git'));
  let scope = 'global';

  if (hasGit) {
    const { scopeChoice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scopeChoice',
        message: '请选择配置生效范围:',
        choices: [
          { name: 'local - 仅当前项目', value: 'local' },
          { name: 'global - 全局', value: 'global' },
        ],
        default: 'local',
      },
    ]);
    scope = scopeChoice;
  }

  const scopeFlag = scope === 'local' ? '--local' : '--global';

  try {
    execSync(`git config ${scopeFlag} user.name "${config.username}"`, {
      stdio: 'inherit',
    });
    execSync(`git config ${scopeFlag} user.email "${config.useremail}"`, {
      stdio: 'inherit',
    });
    console.log(`\n已在 ${scope} 范围设置 git config：`);
    console.log(`  user.name = ${config.username}`);
    console.log(`  user.email = ${config.useremail}`);
  } catch (error) {
    console.error(`设置失败:`, (error as Error).message);
  }
}
