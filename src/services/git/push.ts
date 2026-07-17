import inquirer from 'inquirer';
import { exec, spawn } from '../../utils/exec.js';
import { selectFilesAndStage } from '../../utils/git.js';
import pull, { getCurrentBranch } from './pull.js';

export const commitTypes = [
  { name: '1. feat: 新功能、新特性', value: 'feat' },
  { name: '2. fix: 修改 bug', value: 'fix' },
  { name: '3. perf: 更改代码，以提高性能', value: 'perf' },
  { name: '4. refactor: 代码重构', value: 'refactor' },
  { name: '5. docs: 文档修改', value: 'docs' },
  { name: '6. style: 代码格式修改, 注意不是 css 修改', value: 'style' },
  { name: '7. test: 测试用例新增、修改', value: 'test' },
  { name: '8. build: 影响项目构建或依赖项修改', value: 'build' },
  { name: '9. revert: 恢复上一次提交', value: 'revert' },
  { name: '10. ci: 持续集成相关文件修改', value: 'ci' },
  { name: '11. chore: 其他修改', value: 'chore' },
  { name: '12. release: 发布新版本', value: 'release' },
  { name: '13. workflow: 工作流相关文件修改', value: 'workflow' },
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

    const status = exec('git status --porcelain', { encoding: 'utf8' });
    const lines = status ? status.split('\n').filter(Boolean) : [];
    const hasStaged = lines.some((l) => l[0] !== ' ' && l[0] !== '?');
    const hasUnstaged = lines.some((l) => l[1] !== ' ');

    if (!hasStaged && !hasUnstaged) {
      console.log('没有新的变更，直接推送...');
      const unpushed = exec(`git log origin/${branch}..HEAD --oneline`, {
        encoding: 'utf8',
      }).trim();
      spawn('git', ['push', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
      console.log(`\nbranch ${branch} 推送成功`);
      if (unpushed) {
        console.log(`包含以下提交:\n${unpushed}`);
      }
      return;
    }

    if (hasStaged && !hasUnstaged) {
      console.log('检测到已暂存的变更，直接提交推送...');
      const { content, type } = await inquirer.prompt([
        {
          type: 'input',
          name: 'content',
          message: '请输入提交内容:',
          validate: (input: string) => (input ? true : '提交内容不能为空'),
        },
        {
          type: 'search-list',
          name: 'type',
          message: '请选择提交类型:',
          choices: commitTypes,
          default: 'chore',
        },
      ]);

      const commitMessage = `${type}: ${content}`;
      spawn('git', ['commit', '-m', commitMessage], { stdio: ['ignore', 'inherit', 'inherit'] });
      spawn('git', ['push', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });
      console.log(`\nbranch ${branch} 提交成功，提交内容为：${commitMessage}`);
      return;
    }

    const stagedBefore = exec('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'content',
        message: '请输入提交内容:',
        validate: (input: string) => (input ? true : '提交内容不能为空'),
      },
      {
        type: 'search-list',
        name: 'type',
        message: '请选择提交类型:',
        choices: commitTypes,
        default: 'chore',
      },
      {
        type: 'search-list',
        name: 'scope',
        message: '请选择提交范围:',
        choices: [
          { name: '1. all - 提交所有变更', value: 'all' },
          { name: '2. select - 选择变更文件', value: 'select' },
        ],
        default: 'all',
      },
    ]);

    if (answers.scope === 'all') {
      spawn('git', ['add', '.'], { stdio: ['ignore', 'inherit', 'inherit'] });
    } else if (!(await selectFilesAndStage())) {
      return;
    }

    const commitMessage = `${answers.type}: ${answers.content}`;
    try {
      spawn('git', ['commit', '-m', commitMessage], { stdio: ['ignore', 'inherit', 'inherit'] });
    } catch {
      spawn('git', ['reset'], { stdio: ['ignore', 'inherit', 'inherit'] });
      if (stagedBefore.length > 0) {
        spawn('git', ['add', ...stagedBefore], { stdio: ['ignore', 'inherit', 'inherit'] });
      }
      throw new Error(
        `提交失败，已还原暂存状态。原始暂存文件已恢复:\n${stagedBefore.length > 0 ? stagedBefore.map((f) => `  ${f}`).join('\n') : '  (无)'}`,
      );
    }

    spawn('git', ['push', 'origin', branch], { stdio: ['ignore', 'inherit', 'inherit'] });

    console.log(`\nbranch ${branch} 提交成功，提交内容为：${commitMessage}`);
  } catch (error) {
    console.error(`\n操作失败:`, (error as Error).message);
  }
}
