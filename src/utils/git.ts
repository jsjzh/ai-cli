import { existsSync } from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { exec, spawn } from './exec';

export function hasGitRepo(dir?: string): boolean {
  return existsSync(path.join(dir || process.cwd(), '.git'));
}

export function getCurrentBranch(): string {
  return exec('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
}

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

export async function selectFilesAndStage(): Promise<boolean> {
  const status = exec('git status --porcelain', { encoding: 'utf8' });
  const files = status
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const entry = line.trim().slice(3);
      const file = entry.includes(' -> ') ? entry.split(' -> ').pop()! : entry;
      const name = file.startsWith('"') && file.endsWith('"') ? file.slice(1, -1) : file;
      return { name, value: name };
    });

  if (files.length === 0) {
    console.log('没有变更的文件');
    return false;
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
    return false;
  }

  spawn('git', ['add', ...selectedFiles], { stdio: 'inherit' });
  return true;
}
