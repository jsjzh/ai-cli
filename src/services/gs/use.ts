import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { getActiveConfigs, formatConfigLine, GSConfigItem } from '../../utils/gs-config';
import { hasGitRepo } from '../../utils/git';

export default async function use() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log(pc.yellow('暂无 SSH 配置'));
    return;
  }

  const { config } = await inquirer.prompt([
    {
      type: 'search-list',
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
        type: 'search-list',
        name: 'scopeChoice',
        message: '请选择配置生效范围:',
        choices: [
          { name: '1. local - 仅当前项目', value: 'local' },
          { name: '2. global - 全局', value: 'global' },
        ],
        default: 'local',
      },
    ]);
    scope = scopeChoice;
  }

  const scopeFlag = scope === 'local' ? '--local' : '--global';

  try {
    spawn('git', ['config', scopeFlag, 'user.name', config.username], {
      stdio: 'inherit',
    });
    spawn('git', ['config', scopeFlag, 'user.email', config.useremail], {
      stdio: 'inherit',
    });
    console.log(pc.green(`\n✔ 已在 ${scope} 范围设置 git config：`));
    console.log(`  user.name = ${config.username}`);
    console.log(`  user.email = ${config.useremail}`);
  } catch (error) {
    console.error(pc.red(`✖ 设置失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
