import inquirer from 'inquirer';
import pc from 'picocolors';
import { exec } from '../../utils/exec';

export default async function log() {
  const { count } = await inquirer.prompt([
    {
      type: 'input',
      name: 'count',
      message: '请输入要查看的提交数量(默认 20):',
      default: '20',
      validate: (v: string) => {
        if (!v) return true;
        const n = Number(v);
        return Number.isInteger(n) && n > 0 ? true : '请输入正整数';
      },
    },
  ]);

  const n = count || 20;
  const output = exec(`git log --oneline --graph --decorate -${n}`, {
    encoding: 'utf8',
  });
  console.log(pc.bold(pc.cyan(`\n最近的 ${n} 条提交:\n`)));
  console.log(output);
}
