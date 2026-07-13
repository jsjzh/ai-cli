import { existsSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

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

export function getSSHDir(): string {
  return SSH_DIR;
}

export function getConfigPath(): string {
  return path.join(SSH_DIR, 'config');
}

export function getGSConfigPath(): string {
  return path.join(SSH_DIR, 'gs-config.json');
}

export function readGSConfig(): GSConfigItem[] {
  const configPath = getGSConfigPath();
  if (!existsSync(configPath)) return [];
  return JSON.parse(readFileSync(configPath, 'utf8'));
}

export function writeGSConfig(configs: GSConfigItem[]): void {
  writeFileSync(getGSConfigPath(), JSON.stringify(configs, null, 2));
}

export function getActiveConfigs(): GSConfigItem[] {
  return readGSConfig().filter((c) => c.deleteTime == null);
}

export function formatConfigLine(config: GSConfigItem): string {
  return `${config.origin} | ${config.username} | ${config.useremail} | ${config.host} | ${config.keyType}`;
}
