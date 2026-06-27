import inquirer from 'inquirer';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import chalk from 'chalk';

const SSH_DIR = path.join(homedir(), '.ssh');
const CONFIG_PATH = path.join(SSH_DIR, 'config');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export default async function del() {
  if (!existsSync(GS_CONFIG_PATH)) {
    console.log('暂无 SSH 配置');
    return;
  }

  const configs = JSON.parse(readFileSync(GS_CONFIG_PATH, 'utf8'));
  const activeConfigs = configs.filter((c: any) => !c.deleteTime);

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const { config } = await inquirer.prompt([
    {
      type: 'list',
      name: 'config',
      message: '请选择要删除的 SSH 配置:',
      choices: activeConfigs.map((c: any) => ({
        name: `${c.origin} | ${c.username} | ${c.useremail} | ${c.host} | ${c.keyType}`,
        value: c,
      })),
    },
  ]);

  if (existsSync(CONFIG_PATH)) {
    const sshConfig = readFileSync(CONFIG_PATH, 'utf8');
    const lines = sshConfig.split('\n');
    const newLines: string[] = [];
    let skip = false;

    for (const line of lines) {
      if (line.trim() === `# ${config.origin}`) {
        skip = true;
        continue;
      }
      if (skip && line.startsWith('Host ')) {
        skip = false;
      }
      if (!skip) {
        newLines.push(line);
      }
    }
    const cleaned = newLines.join('\n').replace(/\n{3,}/g, '\n\n');
    writeFileSync(CONFIG_PATH, cleaned);
  }

  const keyPath = path.join(SSH_DIR, config.origin);
  try {
    unlinkSync(keyPath);
    unlinkSync(`${keyPath}.pub`);
  } catch {
    // ignore if files don't exist
  }

  const updatedConfigs = configs.map((c: any) => {
    if (c.origin === config.origin && !c.deleteTime) {
      return { ...c, deleteTime: new Date().toISOString() };
    }
    return c;
  });
  writeFileSync(GS_CONFIG_PATH, JSON.stringify(updatedConfigs, null, 2));

  console.log(chalk.green(`\n已删除 SSH 配置: ${config.origin}`));
  console.log(`请前往 ${config.host} 删除对应的公钥`);
}
