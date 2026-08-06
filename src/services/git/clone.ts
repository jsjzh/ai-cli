import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';

export default async function clone() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'address',
      message: '请输入 Git 地址:',
      validate: (input: string) => (input ? true : '地址不能为空'),
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入项目名称(留空则从地址自动获取):',
    },
    {
      type: 'input',
      name: 'branch',
      message: '请输入分支名(留空则不指定):',
    },
    {
      type: 'input',
      name: 'depth',
      message: '请输入克隆深度(留空则不指定):',
      validate: (input: string) => {
        if (!input) return true;
        const num = Number(input);
        return Number.isInteger(num) && num > 0 ? true : '请输入正整数';
      },
    },
  ]);

  const args = ['clone'];

  if (answers.branch) {
    args.push('-b', answers.branch);
  }

  if (answers.depth) {
    args.push('--depth', answers.depth);
  }

  args.push(answers.address);

  if (answers.name) {
    args.push(answers.name);
  }

  try {
    console.log(pc.cyan('▶ 正在克隆项目...'));
    spawn('git', args, { stdio: 'inherit' });
    const projectName = answers.name || answers.address.split('/').pop()!.replace('.git', '');
    console.log(pc.green(`\n✔ 克隆成功！接下来可以执行: cd ${projectName}`));
  } catch (error) {
    console.error(pc.red(`\n✖ 克隆失败:`), getErrorMessage(error));
    process.exitCode = 1;
  }
}
