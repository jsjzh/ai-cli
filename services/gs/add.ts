import inquirer from 'inquirer';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, appendFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

const SSH_DIR = path.join(homedir(), '.ssh');
const CONFIG_PATH = path.join(SSH_DIR, 'config');
const GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

interface GSConfigItem {
  origin: string;
  username: string;
  useremail: string;
  host: string;
  keyType: string;
  publicKey: string;
  deleteTime: string | null;
}

function readGSConfig(): GSConfigItem[] {
  if (!existsSync(GS_CONFIG_PATH)) return [];
  return JSON.parse(readFileSync(GS_CONFIG_PATH, 'utf8'));
}

function writeGSConfig(configs: GSConfigItem[]): void {
  writeFileSync(GS_CONFIG_PATH, JSON.stringify(configs, null, 2));
}

export default async function add() {
  if (!existsSync(SSH_DIR)) {
    mkdirSync(SSH_DIR, { recursive: true });
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
      type: 'list',
      name: 'keyType',
      message: '请选择密钥类型:',
      choices: [
        { name: 'ed25519 (推荐)', value: 'ed25519' },
        { name: 'rsa', value: 'rsa' },
      ],
      default: 'ed25519',
    },
  ]);

  const keyPath = path.join(SSH_DIR, answers.origin);
  const sshKeygenCmd =
    answers.keyType === 'ed25519'
      ? `ssh-keygen -t ed25519 -C "${answers.useremail}" -f "${keyPath}" -N ""`
      : `ssh-keygen -t rsa -b 4096 -C "${answers.useremail}" -f "${keyPath}" -N ""`;

  try {
    execSync(sshKeygenCmd, { stdio: 'inherit' });
  } catch (error) {
    console.error('生成密钥失败:', (error as Error).message);
    return;
  }

  const publicKey = readFileSync(`${keyPath}.pub`, 'utf8').trim();

  const sshConfigEntry = `
# ${answers.origin}
Host ${answers.origin}
  HostName ${answers.host}
  User ${answers.username}
  IdentityFile ${keyPath}
`;
  appendFileSync(CONFIG_PATH, sshConfigEntry);

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

  console.log(`\nSSH 配置添加成功！`);
  console.log(`\n请将以下公钥添加到 ${answers.host} 的 SSH Keys 中:\n`);
  console.log(publicKey);
}
