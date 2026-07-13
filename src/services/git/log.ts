import { exec } from '../../utils/exec';

export default async function log() {
  const { count } = await (
    await import('inquirer')
  ).default.prompt([
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

  const output = exec(`git log --oneline --graph --decorate -${count || 20}`, {
    encoding: 'utf8',
  });
  console.log(`\n最近的 ${count || 20} 条提交:\n`);
  console.log(output);
}
