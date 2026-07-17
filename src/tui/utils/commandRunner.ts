import { findGroup, findCommand } from '../commandRegistry.js';
import gitController from '../../controllers/git.js';
import gsController from '../../controllers/gs.js';
import nodeController from '../../controllers/node.js';
import soucheController from '../../controllers/souche.js';

export type ExecResult =
  | { type: 'inline'; output: string }
  | { type: 'group-menu'; groupId: string; groupName: string; commands: { name: string; description: string; supported: boolean }[] }
  | { type: 'fallback'; message: string }
  | { type: 'help' }
  | { type: 'not-found'; message: string };

function parseInput(input: string): { group?: string; command?: string } {
  const trimmed = input.trim();

  if (!trimmed.startsWith('/')) {
    return {};
  }

  const parts = trimmed.slice(1).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};

  if (parts.length === 1) {
    return { group: parts[0] };
  }

  return { group: parts[0], command: parts[1] };
}

export async function executeCommand(input: string): Promise<ExecResult> {
  const { group, command } = parseInput(input);

  if (!group) {
    return { type: 'not-found', message: `未知输入: "${input}"。输入 /help 查看帮助` };
  }

  if (group === 'help') {
    return { type: 'help' };
  }

  const cmdGroup = findGroup(group);
  if (!cmdGroup) {
    return { type: 'not-found', message: `未知命令组: "/${group}"。输入 /help 查看可用命令` };
  }

  if (!command) {
    return {
      type: 'group-menu',
      groupId: cmdGroup.id,
      groupName: cmdGroup.name,
      commands: cmdGroup.commands.map((c) => ({
        name: c.name,
        description: c.description,
        supported: c.supported,
      })),
    };
  }

  const cmdInfo = findCommand(group, command);
  if (!cmdInfo) {
    const available = cmdGroup.commands.map((c) => c.name).join(', ');
    return {
      type: 'not-found',
      message: `未知命令: "${group} ${command}"。可用命令: ${available}`,
    };
  }

  if (!cmdInfo.supported) {
    return {
      type: 'fallback',
      message: `"${group} ${command}" 需要交互式终端模式。请在 shell 中执行: cli ${group} ${command}`,
    };
  }

  try {
    const output = await cmdInfo.run();
    return { type: 'inline', output };
  } catch (err: any) {
    return { type: 'inline', output: `错误: ${err.message}` };
  }
}

export async function executeGroupSelection(groupId: string, commandName: string): Promise<ExecResult> {
  const input = `/${groupId} ${commandName}`;
  return executeCommand(input);
}

export async function executeFallback(groupId: string, commandName?: string): Promise<void> {
  switch (groupId) {
    case 'git':
      await gitController(commandName);
      break;
    case 'gs':
      await gsController(commandName);
      break;
    case 'node':
      await nodeController(commandName);
      break;
    case 'souche':
      await soucheController(commandName);
      break;
  }
}
