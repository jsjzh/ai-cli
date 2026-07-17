import React from 'react';
import { Box, Text } from 'ink';

const helpLines = [
  { cmd: '/git', desc: 'Git 操作' },
  { cmd: '/gs', desc: 'Git SSH 配置管理' },
  { cmd: '/node', desc: 'Node.js 包管理' },
  { cmd: '/souche', desc: 'Souche 内部工具' },
  { cmd: '/exit', desc: '退出 TUI' },
];

const supportedCmds = [
  { cmd: '/git push', desc: '提交推送' },
  { cmd: '/git pull', desc: '拉取更新' },
  { cmd: '/git log', desc: '查看提交历史' },
  { cmd: '/git status', desc: '查看工作区状态' },
];

export default function HomeView() {
  return (
    <Box flexDirection="column" paddingY={0}>
      <Text bold>欢迎使用 ai-cli TUI</Text>
      <Text dimColor>在下方输入 /command 来执行操作</Text>

      <Box marginTop={1} flexDirection="column">
        <Text bold underline>
          命令组:
        </Text>
        {helpLines.map(({ cmd, desc }) => (
          <Text key={cmd}>
            <Text color="cyan">{cmd.padEnd(14)}</Text>
            <Text dimColor>{desc}</Text>
          </Text>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        <Text bold underline>
          当前支持的 TUI 内联命令:
        </Text>
        {supportedCmds.map(({ cmd, desc }) => (
          <Text key={cmd}>
            <Text color="green">{cmd.padEnd(14)}</Text>
            <Text dimColor>{desc}</Text>
          </Text>
        ))}
        <Text dimColor>
          其他命令会切换到终端模式执行
        </Text>
      </Box>
    </Box>
  );
}
