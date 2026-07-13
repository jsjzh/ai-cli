import inquirer from 'inquirer';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
import {
  getSSHDir,
  getConfigPath,
  readGSConfig,
  writeGSConfig,
  getActiveConfigs,
  formatConfigLine,
  GSConfigItem,
} from '../../utils/gs-config';

export default async function del() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const { config } = await inquirer.prompt([
    {
      type: 'search-list',
      name: 'config',
      message: '请选择要删除的 SSH 配置:',
      choices: activeConfigs.map((c: GSConfigItem) => ({
        name: formatConfigLine(c),
        value: c,
      })),
    },
  ]);

  const configPath = getConfigPath();
  if (existsSync(configPath)) {
    const sshConfig = readFileSync(configPath, 'utf8');
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
    writeFileSync(configPath, cleaned);
  }

  const sshDir = getSSHDir();
  const keyPath = path.join(sshDir, config.origin);
  if (existsSync(keyPath)) {
    unlinkSync(keyPath);
  }
  if (existsSync(`${keyPath}.pub`)) {
    unlinkSync(`${keyPath}.pub`);
  }

  const allConfigs = readGSConfig();
  const updatedConfigs = allConfigs.map((c: GSConfigItem) => {
    if (c.origin === config.origin && !c.deleteTime) {
      return { ...c, deleteTime: new Date().toISOString() };
    }
    return c;
  });
  writeGSConfig(updatedConfigs);

  console.log(chalk.green(`\n已删除 SSH 配置: ${config.origin}`));
  console.log(`请前往 ${config.host} 删除对应的公钥`);
}
