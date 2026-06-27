import inquirer from 'inquirer';
import { execSync } from 'child_process';
import {
  getActiveConfigs,
  formatConfigLine,
  GSConfigItem,
} from '../../utils/gs-config';
import { hasGitRepo } from '../../utils/git';

export default async function use() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const { config } = await inquirer.prompt([
    {
      type: 'list',
      name: 'config',
      message: '请选择要使用的 SSH 配置:',
      choices: activeConfigs.map((c: GSConfigItem) => ({
        name: formatConfigLine(c),
        value: c,
      })),
    },
  ]);

  let scope = 'global';

  if (hasGitRepo()) {
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
