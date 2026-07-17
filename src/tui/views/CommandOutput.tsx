import React from 'react';
import { Box, Text } from 'ink';
import type { OutputEntry } from '../App.js';

interface Props {
  outputs: OutputEntry[];
  selectedCommand: string | null;
}

export default function CommandOutput({ outputs, selectedCommand }: Props) {
  if (outputs.length === 0) {
    return (
      <Box justifyContent="center" alignItems="center" flexGrow={1}>
        <Text dimColor>暂无输出</Text>
      </Box>
    );
  }

  const latest = outputs[outputs.length - 1];

  return (
    <Box flexDirection="column" flexGrow={1} minHeight={5}>
      <Box marginBottom={0}>
        <Text>
          <Text bold color={latest.status === 'error' ? 'red' : latest.status === 'running' ? 'yellow' : 'green'}>
            {latest.status === 'running' ? '▶' : latest.status === 'success' ? '✓' : '✗'}
          </Text>{' '}
          <Text bold>{latest.title}</Text>
          {selectedCommand ? (
            <Text dimColor> (已选择)</Text>
          ) : null}
        </Text>
      </Box>
      {latest.text ? (
        <Box marginLeft={2} flexDirection="column">
          {latest.text.split('\n').map((line, i) => (
            <Text key={i} wrap="wrap">
              {line || ' '}
            </Text>
          ))}
        </Box>
      ) : null}
      {latest.status === 'running' ? (
        <Box marginTop={0}>
          <Text dimColor>执行中...</Text>
        </Box>
      ) : null}
    </Box>
  );
}
