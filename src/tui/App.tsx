import React, { useState, useCallback } from 'react';
import { Box } from 'ink';
import Header from './components/Header.js';
import Content from './components/Content.js';
import InputBar from './components/InputBar.js';
import StatusBar from './components/StatusBar.js';

export type View = 'home' | 'group-menu' | 'output';

export interface OutputEntry {
  id: number;
  title: string;
  text: string;
  status: 'running' | 'success' | 'error';
}

export interface GroupMenuItem {
  name: string;
  description: string;
  supported: boolean;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [outputs, setOutputs] = useState<OutputEntry[]>([]);
  const [statusText, setStatusText] = useState('就绪');
  const [contextInfo, setContextInfo] = useState('');
  const [groupId, setGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
  const [groupCommands, setGroupCommands] = useState<GroupMenuItem[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<string | null>(null);

  const handleHome = useCallback(() => {
    setView('home');
    setGroupId(null);
    setGroupName(null);
    setGroupCommands([]);
    setSelectedCommand(null);
    setContextInfo('');
    setStatusText('就绪');
  }, []);

  const showHelp = useCallback(() => {
    setContextInfo('输入 /git, /gs, /node, /souche 查看各组命令');
    setView('output');
    setOutputs([
      {
        id: Date.now(),
        title: '/help',
        text: [
          '可用命令组:',
          '  /git     Git 操作',
          '  /gs      Git SSH 配置管理',
          '  /node    Node.js 包管理',
          '  /souche  Souche 内部工具',
          '',
          '输入 /<group> 查看组内命令',
          '输入 /<group> <command> 直接执行',
          '输入 /home 回到首页',
          '输入 /exit 退出 TUI',
        ].join('\n'),
        status: 'success',
      },
    ]);
    setStatusText('帮助');
  }, []);

  const showGroupMenu = useCallback(
    (gId: string, gName: string, cmds: GroupMenuItem[]) => {
      setGroupId(gId);
      setGroupName(gName);
      setGroupCommands(cmds);
      setSelectedCommand(null);
      setView('group-menu');
      setContextInfo(`/${gId} — 请选择命令`);
      setStatusText(`/${gId}`);
    },
    [],
  );

  const handleCommand = useCallback(
    async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed) return;

      if (trimmed === '/exit' || trimmed === '/q') {
        process.exit(0);
      }

      if (trimmed === '/home' || trimmed === '/back') {
        handleHome();
        return;
      }

      if (trimmed === '/help') {
        showHelp();
        return;
      }

      setContextInfo(`执行: ${trimmed}`);
      setStatusText('执行中...');

      const { executeCommand } = await import('./utils/commandRunner.js');
      const result = await executeCommand(trimmed);

      if (result.type === 'group-menu') {
        showGroupMenu(result.groupId, result.groupName, result.commands);
        return;
      }

      setView('output');

      if (result.type === 'help') {
        showHelp();
        return;
      }

      const isInline = result.type === 'inline';
      setOutputs((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: trimmed,
          text: isInline ? result.output : (result as any).message || '未知',
          status: isInline ? 'success' : 'error',
        },
      ]);
      setStatusText(isInline ? '完成' : '不可用');
    },
    [handleHome, showHelp, showGroupMenu],
  );

  const handleSelectCommand = useCallback(
    async (commandName: string) => {
      const cmd = groupCommands.find((c) => c.name === commandName);
      if (!cmd) return;

      setSelectedCommand(commandName);
      setView('output');
      setContextInfo(`/${groupId} ${commandName}`);
      setStatusText('执行中...');

      const { executeGroupSelection } = await import('./utils/commandRunner.js');
      const result = await executeGroupSelection(groupId!, commandName);

      setOutputs((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: `/${groupId} ${commandName}`,
          text: result.type === 'inline' ? result.output : (result as any).message || '未知',
          status: result.type === 'inline' ? 'success' : 'error',
        },
      ]);
      setStatusText('完成');
    },
    [groupId, groupCommands],
  );

  return (
    <Box flexDirection="column" height="100%" minHeight={10}>
      <Header onBackHome={view !== 'home' ? handleHome : undefined} contextInfo={contextInfo} />
      <Content
        view={view}
        outputs={outputs}
        groupName={groupName}
        groupCommands={groupCommands}
        selectedCommand={selectedCommand}
        onSelectCommand={handleSelectCommand}
      />
      <InputBar onSubmit={handleCommand} />
      <StatusBar text={statusText} />
    </Box>
  );
}
