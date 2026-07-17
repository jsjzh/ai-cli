import chalk from 'chalk';
import { spawn } from '../../utils/exec.js';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config.js';
import { hasGitRepo } from '../../utils/git.js';

export default async function list() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log('暂无 SSH 配置');
    return;
  }

  const scope = hasGitRepo() ? '--local' : '--global';
  let currentName = '';
  let currentEmail = '';

  try {
    currentName = spawn('git', ['config', scope, 'user.name'], {
      encoding: 'utf8',
    }).trim();
    currentEmail = spawn('git', ['config', scope, 'user.email'], {
      encoding: 'utf8',
    }).trim();
  } catch {
    // ignore if git config not set
  }

  const isCurrent = (c: GSConfigItem) =>
    c.username === currentName && c.useremail === currentEmail;

  const pad = (items: string[]) => Math.max(...items.map((s) => s.length)) + 2;

  const origins = activeConfigs.map((c) => c.origin);
  const usernames = activeConfigs.map((c) => c.username);
  const emails = activeConfigs.map((c) => c.useremail);
  const hosts = activeConfigs.map((c) => c.host);

  const wOrigin = Math.max(pad(origins), 8);
  const wUser = Math.max(pad(usernames), 10);
  const wEmail = Math.max(pad(emails), 12);
  const wHost = Math.max(pad(hosts), 6);

  const sep = chalk.gray('  ' + '-'.repeat(wOrigin + wUser + wEmail + wHost + 14));

  console.log(chalk.cyan('\nSSH 配置列表:\n'));
  console.log(
    chalk.white(
      `  ${'origin'.padEnd(wOrigin)} | ${'username'.padEnd(wUser)} | ${'useremail'.padEnd(wEmail)} | ${'host'.padEnd(wHost)} | keyType`,
    ),
  );
  console.log(sep);

  activeConfigs.forEach((config: GSConfigItem) => {
    const marker = isCurrent(config) ? chalk.green(' ← 当前') : '';
    console.log(
      `  ${config.origin.padEnd(wOrigin)} | ${config.username.padEnd(wUser)} | ${config.useremail.padEnd(wEmail)} | ${config.host.padEnd(wHost)} | ${config.keyType}${marker}`,
    );
  });
  console.log();
}
