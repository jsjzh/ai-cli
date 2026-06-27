import inquirer from 'inquirer';
import { execSync } from 'child_process';
import pull, { getCurrentBranch } from './pull';

const commitTypes = [
  { name: 'feat: 新功能、新特性', value: 'feat' },
  { name: 'fix: 修改 bug', value: 'fix' },
  { name: 'perf: 更改代码，以提高性能', value: 'perf' },
  { name: 'refactor: 代码重构', value: 'refactor' },
  { name: 'docs: 文档修改', value: 'docs' },
  { name: 'style: 代码格式修改, 注意不是 css 修改', value: 'style' },
  { name: 'test: 测试用例新增、修改', value: 'test' },
  { name: 'build: 影响项目构建或依赖项修改', value: 'build' },
  { name: 'revert: 恢复上一次提交', value: 'revert' },
  { name: 'ci: 持续集成相关文件修改', value: 'ci' },
  { name: 'chore: 其他修改', value: 'chore' },
  { name: 'release: 发布新版本', value: 'release' },
  { name: 'workflow: 工作流相关文件修改', value: 'workflow' },
];

export default async function push() {
  try {
    const branch = getCurrentBranch();

    console.log('正在拉取远程更新...');
    try {
      await pull();
    } catch {
      console.error('自动合并失败，请手动解决冲突后重试');
      return;
    }

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'content',
        message: '请输入提交内容:',
        validate: (input: string) => (input ? true : '提交内容不能为空'),
      },
      {
        type: 'list',
        name: 'type',
        message: '请选择提交类型:',
        choices: commitTypes,
        default: 'chore',
      },
      {
        type: 'list',
        name: 'scope',
        message: '请选择提交范围:',
        choices: [
          { name: 'all - 提交所有变更', value: 'all' },
          { name: 'select - 选择变更文件', value: 'select' },
        ],
        default: 'all',
      },
    ]);

    if (answers.scope === 'all') {
      execSync('git add .', { stdio: 'inherit' });
    } else {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const files = status
        .split('\n')
        .filter(Boolean)
        .map((line) => {
          const file = line.trim().split(/\s+/).pop()!;
          return { name: file, value: file, checked: false };
        });

      if (files.length === 0) {
        console.log('没有变更的文件');
        return;
      }

      const { selectedFiles } = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'selectedFiles',
          message: '请选择要提交的文件(空格选中, a 全选):',
          choices: files,
        },
      ]);

      if (selectedFiles.length === 0) {
        console.log('未选择任何文件');
        return;
      }

      execSync(`git add ${selectedFiles.join(' ')}`, { stdio: 'inherit' });
    }

    const commitMessage = `${answers.type}: ${answers.content}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

    execSync(`git push origin ${branch}`, { stdio: 'inherit' });

    console.log(`\nbranch ${branch} 提交成功，提交内容为：${commitMessage}`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
