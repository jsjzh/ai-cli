import { existsSync, readFileSync, writeFileSync, renameSync } from 'fs';
import { homedir } from 'os';
import path from 'path';
import { getErrorMessage } from './exec';

export interface GSConfigItem {
  origin: string;
  username: string;
  useremail: string;
  host: string;
  keyType: string;
  publicKey: string;
  deleteTime: string | null;
}

const SSH_DIR = path.join(homedir(), '.ssh');
const AICLIRC_PATH = path.join(homedir(), '.aiclirc');
const OLD_GS_CONFIG_PATH = path.join(SSH_DIR, 'gs-config.json');

export function getSSHDir(): string {
  return SSH_DIR;
}

export function getConfigPath(): string {
  return path.join(SSH_DIR, 'config');
}

export function getGSConfigPath(): string {
  return AICLIRC_PATH;
}

function readAiclirc(): Record<string, unknown> {
  if (!existsSync(AICLIRC_PATH)) return {};
  try {
    return JSON.parse(readFileSync(AICLIRC_PATH, 'utf8'));
  } catch {
    console.error('~/.aiclirc 解析失败，将使用默认配置');
    return {};
  }
}

function writeAiclirc(config: Record<string, unknown>): void {
  writeFileSync(AICLIRC_PATH, JSON.stringify(config, null, 2));
}

function migrateOldConfig(): void {
  if (!existsSync(OLD_GS_CONFIG_PATH)) return;
  const aiclirc = readAiclirc();
  if (aiclirc.gs) return;
  try {
    const oldData = JSON.parse(readFileSync(OLD_GS_CONFIG_PATH, 'utf8'));
    if (!Array.isArray(oldData) || oldData.length === 0) return;
    aiclirc.gs = oldData;
    writeAiclirc(aiclirc);
    renameSync(OLD_GS_CONFIG_PATH, OLD_GS_CONFIG_PATH + '.bak');
    console.log('已迁移 ~/.ssh/gs-config.json → ~/.aiclirc (原文件已备份为 .bak)');
  } catch (err) {
    console.error('配置迁移 ~/.ssh/gs-config.json → ~/.aiclirc 失败:', getErrorMessage(err));
  }
}

export function readGSConfig(): GSConfigItem[] {
  migrateOldConfig();
  const aiclirc = readAiclirc();
  const gs = aiclirc.gs;
  if (!Array.isArray(gs)) return [];
  return gs as GSConfigItem[];
}

export function writeGSConfig(configs: GSConfigItem[]): void {
  const aiclirc = readAiclirc();
  aiclirc.gs = configs;
  writeAiclirc(aiclirc);
}

export function getActiveConfigs(): GSConfigItem[] {
  return readGSConfig().filter((c) => c.deleteTime == null);
}

export function formatConfigLine(config: GSConfigItem): string {
  const keyType = config.keyType || '-';
  return `${config.origin} | ${config.username} | ${config.useremail} | ${config.host} | ${keyType}`;
}
