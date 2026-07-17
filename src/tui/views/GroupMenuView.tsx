import React, { useCallback } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { GroupMenuItem } from '../App.js';

interface Props {
  groupName: string;
  commands: GroupMenuItem[];
  onSelect: (name: string) => void;
}

export default function GroupMenuView({ groupName, commands, onSelect }: Props) {
  const handleSelect = useCallback(
    (item: { value: string }) => {
      onSelect(item.value);
    },
    [onSelect],
  );

  const items = commands.map((cmd, i) => ({
    label: `${String(i + 1).padStart(2, ' ')}. ${cmd.name.padEnd(16)} ${cmd.description}`,
    value: cmd.name,
  }));

  return (
    <Box flexDirection="column">
      <Text bold underline>
        {groupName}
      </Text>
      <Text dimColor>请选择命令（方向键上下，回车确认）:</Text>
      <Box marginTop={0} flexDirection="column">
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}
