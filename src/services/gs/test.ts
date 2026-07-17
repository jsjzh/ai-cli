import inquirer from 'inquirer';
import { spawn } from '../../utils/exec';
import { withSpinner } from '../../utils/spinner';
import pc from 'picocolors';
import { getActiveConfigs, formatConfigLine, GSConfigItem } from '../../utils/gs-config';

export default async function test() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log(pc.yellow('暂无 SSH 配置'));
    return;
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: '请选择要测试的 SSH 配置(空格选中, a 全选):',
      choices: activeConfigs.map((c: GSConfigItem) => ({
        name: formatConfigLine(c),
        value: c,
      })),
      default: activeConfigs.map((_, i) => i),
    },
  ]);

  if (selected.length === 0) {
    console.log(pc.yellow('未选择任何配置'));
    return;
  }

  for (const config of selected) {
    try {
      const output = withSpinner(`测试 ${config.origin}`, () =>
        spawn('ssh', ['-T', config.origin], { encoding: 'utf8', timeout: 10000 }),
      );
      if (output) console.log(output);
    } catch (error: any) {
      const output = error.stdout || error.stderr || error.message || '';
      if (
        typeof output === 'string' &&
        (output.includes('successfully') || output.includes('Hi') || output.includes('Welcome'))
      ) {
        console.log(pc.green(`✔ ${config.origin}: 连接成功`));
        if (output) console.log(output);
      } else {
        console.log(pc.red(`✖ ${config.origin}: 连接失败`));
        if (output) console.log(output);
      }
    }
  }
}
