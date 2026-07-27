import inquirer from 'inquirer';
import pc from 'picocolors';
import { spawn, getErrorMessage } from '../../utils/exec';
import { existsSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import path from 'path';
import {
  getSSHDir,
  getConfigPath,
  readGSConfig,
  writeGSConfig,
  GSConfigItem,
} from '../../utils/gs-config';

export default async function add() {
  const sshDir = getSSHDir();
  const configPath = getConfigPath();

  if (!existsSync(sshDir)) {
    mkdirSync(sshDir, { recursive: true });
  }

  const existingConfigs = readGSConfig();

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'origin',
      message: '请输入环境名称(如 personal/company):',
      validate: (input: string) => {
        if (!input) return '环境名称不能为空';
        if (existingConfigs.some((c) => c.origin === input && !c.deleteTime)) {
          return `环境 "${input}" 已存在，请使用其他名称`;
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'username',
      message: '请输入用户名:',
      validate: (input: string) => (input ? true : '用户名不能为空'),
    },
    {
      type: 'input',
      name: 'useremail',
      message: '请输入邮箱:',
      validate: (input: string) => (input ? true : '邮箱不能为空'),
    },
    {
      type: 'input',
      name: 'host',
      message: '请输入 Host:',
      validate: (input: string) => (input ? true : 'Host 不能为空'),
    },
    {
      type: 'search-list',
      name: 'keyType',
      message: '请选择密钥类型:',
      choices: [
        { name: '1. ed25519 (推荐)', value: 'ed25519' },
        { name: '2. rsa', value: 'rsa' },
      ],
      default: 'ed25519',
    },
  ]);

  const keyPath = path.join(sshDir, answers.origin);
  const sshKeygenArgs =
    answers.keyType === 'ed25519'
      ? ['-t', 'ed25519', '-C', answers.useremail, '-f', keyPath, '-N', '']
      : ['-t', 'rsa', '-b', '4096', '-C', answers.useremail, '-f', keyPath, '-N', ''];

  try {
    spawn('ssh-keygen', sshKeygenArgs, { stdio: 'inherit' });
  } catch (error) {
    console.error(pc.red('✖ 生成密钥失败:'), getErrorMessage(error));
    return;
  }

  const publicKey = readFileSync(`${keyPath}.pub`, 'utf8').trim();

  const sshConfigEntry = `
# ${answers.origin}
Host ${answers.origin}
  HostName ${answers.host}
  User ${answers.username}
  IdentityFile ${keyPath.replace(/\\/g, '/')}
`;
  appendFileSync(configPath, sshConfigEntry);

  const newConfig: GSConfigItem = {
    origin: answers.origin,
    username: answers.username,
    useremail: answers.useremail,
    host: answers.host,
    keyType: answers.keyType,
    publicKey,
    deleteTime: null,
  };

  const filtered = existingConfigs.filter((c) => c.origin !== answers.origin);
  filtered.push(newConfig);
  writeGSConfig(filtered);

  console.log(pc.green(`\n✔ SSH 配置添加成功！`));
  console.log(`\n请将以下公钥添加到 ${answers.host} 的 SSH Keys 中:\n`);
  console.log(publicKey);
}
