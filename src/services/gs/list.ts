import Table from 'cli-table3';
import pc from 'picocolors';
import { spawn } from '../../utils/exec';
import { getActiveConfigs, GSConfigItem } from '../../utils/gs-config';
import { hasGitRepo } from '../../utils/git';

export default async function list() {
  const activeConfigs = getActiveConfigs();

  if (activeConfigs.length === 0) {
    console.log(pc.yellow('暂无 SSH 配置'));
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

  const table = new Table({
    head: ['origin', 'username', 'useremail', 'host', 'keyType'],
    style: { head: ['cyan', 'bold'], border: ['gray'] },
  });

  activeConfigs.forEach((config: GSConfigItem) => {
    const row = [config.origin, config.username, config.useremail, config.host, config.keyType];
    if (isCurrent(config)) {
      row[0] = pc.green(`${config.origin} ← 当前`);
    }
    table.push(row);
  });

  console.log(pc.bold(pc.cyan('\nSSH 配置列表:\n')));
  console.log(table.toString());
}
