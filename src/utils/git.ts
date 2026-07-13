import { existsSync } from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import { exec, spawn } from './exec';

export function hasGitRepo(dir?: string): boolean {
  return existsSync(path.join(dir || process.cwd(), '.git'));
}

export async function selectFilesAndStage(): Promise<boolean> {
  const status = exec('git status --porcelain', { encoding: 'utf8' });
  const files = status
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const file = line.trim().split(/\s+/).pop()!;
      return { name: file, value: file, checked: false };
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
