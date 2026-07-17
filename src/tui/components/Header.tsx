import React from 'react';
import { Box, Text } from 'ink';
import { readFileSync } from 'fs';
const pkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'));
const { version } = pkg;

interface Props {
  onViewOutput?: () => void;
  onBackHome?: () => void;
  contextInfo: string;
}

export default function Header({ onViewOutput, onBackHome, contextInfo }: Props) {
  return (
    <Box borderStyle="single" borderDimColor flexDirection="column" paddingX={1} paddingY={0}>
      <Box justifyContent="space-between" width="100%">
        <Text bold>
          ai-cli{' '}
          <Text dimColor>v{version}</Text>
        </Text>
        <Box gap={2}>
          {onBackHome ? (
            <Text color="yellow" dimColor>
              /home 返回
            </Text>
          ) : null}
          {onViewOutput ? (
            <Text color="cyan" dimColor>
              /output 查看输出
            </Text>
          ) : null}
          <Text dimColor>
            /exit 退出
          </Text>
        </Box>
      </Box>
      {contextInfo ? (
        <Box marginTop={0}>
          <Text wrap="truncate-end" dimColor>
            {contextInfo}
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
