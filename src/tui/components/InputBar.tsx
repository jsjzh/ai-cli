import React, { useState, useCallback } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface Props {
  onSubmit: (value: string) => void;
}

export default function InputBar({ onSubmit }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (v: string) => {
      onSubmit(v);
      setValue('');
    },
    [onSubmit],
  );

  return (
    <Box borderStyle="single" borderDimColor paddingX={1}>
      <Text bold color="cyan">
        {'> '}
      </Text>
      <Box flexGrow={1}>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder="/git push, /log, /help, /exit"
        />
      </Box>
    </Box>
  );
}
