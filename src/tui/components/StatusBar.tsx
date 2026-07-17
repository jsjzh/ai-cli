import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  text: string;
}

export default function StatusBar({ text }: Props) {
  return (
    <Box paddingX={1}>
      <Text dimColor>
        状态: {text}
      </Text>
    </Box>
  );
}
